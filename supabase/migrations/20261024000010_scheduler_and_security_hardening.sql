-- Altın İz - Migration 010: Scheduler and Security Hardening
-- Referans: docs/DATABASE.md, docs/SECURITY.md, docs/DECISIONS.md (ADR-033, ADR-035, ADR-036)
-- Kapsam:
-- 1. price_source_product_mappings RLS politikasını kaldırarak sunucuya kilitleme (DATABASE.md Bölüm 14.10)
-- 2. price_sources sağlayıcı adı ve web sitesini Truncgil Finance ile güncelleme (ADR-036)
-- 3. handle_new_user tetikleyicisini kayıt anında atomik yasal olay kaydı yapacak şekilde güçlendirme
-- 4. execute_account_deletion RPC'sine auth.users silimini ekleyerek tam veritabanı atomikliği sağlama
-- 5. pg_cron ve pg_net ile otomatik fiyat çekme zamanlayıcı altyapısı kurma (KI-009, KI-010)

-- ============================================================================
-- 1. price_source_product_mappings RLS SERTLEŞTİRMESİ
-- ============================================================================
-- İstemci bu tabloyu doğrudan sorgulamaz; yalnızca service_role (Edge Function) yetkili olmalıdır.
DROP POLICY IF EXISTS "price_source_product_mappings_read_all" ON public.price_source_product_mappings;

-- ============================================================================
-- 2. price_sources BİLGİ GÜNCELLEMESİ (Truncgil Finance Entegrasyonu)
-- ============================================================================
UPDATE public.price_sources
SET name = 'Truncgil Finance (Kapalıçarşı Serbest Piyasa)',
    website_url = 'https://finans.truncgil.com'
WHERE code = 'ALTIN_API';

-- ============================================================================
-- 3. GÜÇLENDİRİLMİŞ YENİ KULLANICI TETİKLEYİCİSİ (handle_new_user)
-- ============================================================================
-- Kayıt anında (sign-up) e-posta doğrulanmadan önce de Kullanım Koşulları kabulü
-- ve KVKK aydınlatma sunumu atomik olarak user_legal_events tablosuna işlenir.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_terms_doc_id UUID;
    v_terms_version VARCHAR(30);
    v_kvkk_doc_id UUID;
    v_kvkk_version VARCHAR(30);
BEGIN
    -- 1. Profil oluştur
    INSERT INTO public.user_profiles (user_id, display_name, account_status)
    VALUES (NEW.id, NULL, 'active')
    ON CONFLICT (user_id) DO NOTHING;

    -- 2. Tercihleri oluştur
    INSERT INTO public.user_preferences (user_id, theme, language_code, currency_code)
    VALUES (NEW.id, 'system', 'tr', 'TRY')
    ON CONFLICT (user_id) DO NOTHING;

    -- 3. Kayıt anında kabul edilen yasal belgeleri atomik olarak ekle (raw_user_meta_data kontrolü)
    IF (NEW.raw_user_meta_data->>'terms_accepted')::boolean IS TRUE THEN
        SELECT id, version INTO v_terms_doc_id, v_terms_version
        FROM public.legal_documents
        WHERE document_type = 'terms_of_use' AND is_active = true
        ORDER BY created_at DESC LIMIT 1;

        IF v_terms_doc_id IS NOT NULL THEN
            INSERT INTO public.user_legal_events (
                user_id, document_id, event_type, event_at, document_version, source, app_version
            ) VALUES (
                NEW.id, v_terms_doc_id, 'accepted', NOW(), v_terms_version, 'registration',
                COALESCE(NEW.raw_user_meta_data->>'signup_app_version', '1.0.0')
            );
        END IF;
    END IF;

    IF (NEW.raw_user_meta_data->>'kvkk_presented')::boolean IS TRUE THEN
        SELECT id, version INTO v_kvkk_doc_id, v_kvkk_version
        FROM public.legal_documents
        WHERE document_type = 'kvkk_notice' AND is_active = true
        ORDER BY created_at DESC LIMIT 1;

        IF v_kvkk_doc_id IS NOT NULL THEN
            INSERT INTO public.user_legal_events (
                user_id, document_id, event_type, event_at, document_version, source, app_version
            ) VALUES (
                NEW.id, v_kvkk_doc_id, 'presented', NOW(), v_kvkk_version, 'registration',
                COALESCE(NEW.raw_user_meta_data->>'signup_app_version', '1.0.0')
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- ============================================================================
-- 4. TAM ATOMİK HESAP SİLME RPC FONKSİYONU (execute_account_deletion)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.execute_account_deletion(
  p_user_id UUID,
  p_request_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_portfolio_count INT := 0;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'USER_ID_REQUIRED: Hesap silme için geçerli bir kullanıcı kimliği zorunludur.';
  END IF;

  -- 1. Portföy kayıtlarını sil (portfolio_entries)
  DELETE FROM public.portfolio_entries WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_portfolio_count = ROW_COUNT;

  -- 2. Kullanıcı tercihlerini sil (user_preferences)
  DELETE FROM public.user_preferences WHERE user_id = p_user_id;

  -- 3. Yasal olayları saklama politikasına göre anonimleştir (user_id -> NULL)
  UPDATE public.user_legal_events SET user_id = NULL WHERE user_id = p_user_id;

  -- 4. Güvenlik olaylarını saklama politikasına göre anonimleştir (user_id -> NULL)
  UPDATE public.security_events SET user_id = NULL WHERE user_id = p_user_id;

  -- 5. Profil kaydını sil (user_profiles - user_id kolonu düzeltildi)
  DELETE FROM public.user_profiles WHERE user_id = p_user_id;

  -- 6. Silme talebi kaydını 'completed' olarak güncelle ve PII bağlantısını kopar
  IF p_request_id IS NOT NULL THEN
    UPDATE public.account_deletion_requests
    SET status = 'completed',
        completed_at = NOW(),
        user_id = NULL
    WHERE id = p_request_id;
  END IF;

  -- 7. auth.users kaydını doğrudan silerek tam transaction atomikliği sağla
  DELETE FROM auth.users WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_portfolio_count', v_portfolio_count
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'ACCOUNT_DELETION_FAILED: %', SQLERRM;
END;
$$;

REVOKE ALL ON FUNCTION public.execute_account_deletion(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.execute_account_deletion(UUID, UUID) TO service_role;

-- ============================================================================
-- 5. OTOMATİK FİYAT ÇEKME ZAMANLAYICISI (pg_cron & pg_net)
-- ============================================================================
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA extensions;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_net uzantısı yüklenemedi: %', SQLERRM;
END;
$$;

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA extensions;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron uzantısı yüklenemedi: %', SQLERRM;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_scheduled_price_fetch()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- pg_net üzerinden fetch-gold-prices Edge Function'ını tetikle
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    PERFORM extensions.http_post(
      'https://hoqujzhcjeaudmkyqgpc.supabase.co/functions/v1/fetch-gold-prices',
      '{"triggerType": "scheduled", "force": false}',
      'application/json'
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Otomatik fiyat zamanlayıcı tetiklemesi başarısız: %', SQLERRM;
END;
$$;

-- pg_cron zamanlayıcı işi (Hafta içi 09:00 - 19:00 TSİ / 06:00 - 16:00 UTC her 15 dakikada bir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('fetch-gold-prices-job')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'fetch-gold-prices-job');

    PERFORM cron.schedule(
      'fetch-gold-prices-job',
      '*/15 6-16 * * 1-5',
      'SELECT public.trigger_scheduled_price_fetch();'
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron zamanlayıcı kaydı atlandı: %', SQLERRM;
END;
$$;
