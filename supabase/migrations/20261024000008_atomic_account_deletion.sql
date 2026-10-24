-- Altın İz - Migration 008: Atomic Account Deletion Function
-- Referans: docs/DECISIONS.md ADR-033 & docs/KNOWN_ISSUES.md KI-018
-- Açıklama: Hesap silme işleminin tüm veritabanı adımlarını tek bir atomik transaction (rollback garantili) içinde yürütür.

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

  -- 6. Silme talebi kaydını 'completed' olarak güncelle ve PII bağlantısını kopar
  IF p_request_id IS NOT NULL THEN
    UPDATE public.account_deletion_requests
    SET status = 'completed',
        completed_at = NOW(),
        user_id = NULL
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

-- Yetkilendirme: Yalnızca service_role (Edge Function adminClient) çalıştırabilir.
REVOKE ALL ON FUNCTION public.execute_account_deletion(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.execute_account_deletion(UUID, UUID) TO service_role;
