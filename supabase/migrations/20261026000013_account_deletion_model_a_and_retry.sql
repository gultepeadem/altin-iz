-- Altın İz - Migration 013: Account Deletion Model A Schema Constraints, Atomic RPC Alignment and Retry Compensation
-- Referans: docs/DECISIONS.md ADR-033, docs/DATABASE.md Bölüm 13 & docs/API.md Bölüm 13.5
-- Kapsam:
-- 1. account_deletion_requests tablosundaki status check constraint'ine 'auth_deletion_pending' durumunun eklenmesi
-- 2. execute_account_deletion RPC fonksiyonunun Model A işlem sırasına (auth.admin.deleteUser öncesinde 'completed' yapmama) göre hizalanması
-- 3. Arka plan telafi mekanizması: process_pending_auth_deletions() fonksiyonu ve pg_cron zamanlayıcısı

-- ============================================================================
-- 1. account_deletion_requests TABLOSU DURUM KISITININ GÜNCELLENMESİ
-- ============================================================================
ALTER TABLE public.account_deletion_requests
    DROP CONSTRAINT IF EXISTS account_deletion_requests_status_check;

ALTER TABLE public.account_deletion_requests
    ADD CONSTRAINT account_deletion_requests_status_check
    CHECK (status IN (
        'requested',
        'identity_verification_required',
        'processing',
        'completed',
        'failed',
        'cancelled',
        'auth_deletion_pending'
    ));

-- ============================================================================
-- 2. execute_account_deletion RPC FONKSİYONUNUN MODEL A İLE HİZALANMASI
-- ============================================================================
-- Model A Kuralı:
-- Veritabanı ilişkisel verileri (portfolio_entries, user_preferences, user_profiles)
-- atomik olarak silinir ve user_legal_events / security_events tablolarındaki user_id
-- alanları NULL yapılır (anonimleştirme).
-- ANCAK account_deletion_requests kaydı RPC içinde 'completed' YAPILMAZ!
-- Çünkü auth.admin.deleteUser henüz çağrılmamıştır. Yalnızca status = 'processing'
-- olarak teyit edilir ve processing_started_at kaydedilir.
CREATE OR REPLACE FUNCTION public.execute_account_deletion(
  p_user_id UUID,
  p_request_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_portfolio_count INT := 0;
BEGIN
  -- Parametre güvenlik kontrolü
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

  -- 5. Profil kaydını sil (user_profiles)
  DELETE FROM public.user_profiles WHERE id = p_user_id;

  -- 6. Model A Güvencesi:
  -- account_deletion_requests kaydı henüz 'completed' yapılmaz, status = 'processing' olarak bırakılır.
  -- user_id bağı auth.users silindiğinde ON DELETE SET NULL ile veya Edge Function başarı adımında koparılır.
  IF p_request_id IS NOT NULL THEN
    UPDATE public.account_deletion_requests
    SET status = 'processing',
        processing_started_at = COALESCE(processing_started_at, NOW())
    WHERE id = p_request_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_portfolio_count', v_portfolio_count
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Herhangi bir aşamada hata çıkarsa PostgreSQL otomatik olarak transaction'ı ROLLBACK eder.
    RAISE EXCEPTION 'ACCOUNT_DELETION_FAILED: %', SQLERRM;
END;
$$;

-- Yetkilendirme: Yalnızca service_role çalıştırabilir
REVOKE ALL ON FUNCTION public.execute_account_deletion(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.execute_account_deletion(UUID, UUID) TO service_role;

-- ============================================================================
-- 3. TELAFİ VE YENİDEN DENEME MEKANİZMASI (process_pending_auth_deletions)
-- ============================================================================
-- Auth silme adımında üçüncü taraf bağlantı/ağ kesintisi oluşması durumunda
-- 'auth_deletion_pending' durumunda kalan talepleri güvenle işler ve auth.users'dan temizler.
CREATE OR REPLACE FUNCTION public.process_pending_auth_deletions()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_item RECORD;
  v_processed_count INT := 0;
  v_failed_count INT := 0;
BEGIN
  FOR v_item IN 
    SELECT id, user_id 
    FROM public.account_deletion_requests 
    WHERE status = 'auth_deletion_pending' AND user_id IS NOT NULL
  LOOP
    BEGIN
      -- Auth kullanıcısını auth.users tablosundan doğrudan temizle
      DELETE FROM auth.users WHERE id = v_item.user_id;
      
      -- Başarılı olduysa talebi tamamlandı olarak işaretle ve user_id'yi sıfırla
      UPDATE public.account_deletion_requests
      SET status = 'completed',
          completed_at = NOW(),
          user_id = NULL
      WHERE id = v_item.id;
      
      v_processed_count := v_processed_count + 1;
    EXCEPTION WHEN OTHERS THEN
      v_failed_count := v_failed_count + 1;
      UPDATE public.account_deletion_requests
      SET failure_message = SUBSTRING(SQLERRM FROM 1 FOR 500)
      WHERE id = v_item.id;
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'processed', v_processed_count,
    'failed', v_failed_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.process_pending_auth_deletions() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_pending_auth_deletions() TO service_role;

-- ============================================================================
-- 4. SAATLİK TELAFİ ZAMANLAYICISI (pg_cron)
-- ============================================================================
-- Bekleyen yetim auth silme işlemlerini her saat başı kontrol et ve temizle
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('retry-pending-auth-deletions-job')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'retry-pending-auth-deletions-job');

    PERFORM cron.schedule(
      'retry-pending-auth-deletions-job',
      '0 * * * *',
      'SELECT public.process_pending_auth_deletions();'
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron telafi zamanlayıcı kaydı atlandı (Ortam desteği yoksa): %', SQLERRM;
END;
$$;
