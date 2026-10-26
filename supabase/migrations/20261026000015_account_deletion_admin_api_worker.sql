-- Altın İz - Migration 015: Account Deletion Admin API Worker, Queue Claiming and pg_net Trigger
-- Referans: docs/DECISIONS.md ADR-033, docs/DATABASE.md & docs/API.md
-- Kapsam:
-- 1. claim_pending_auth_deletions RPC fonksiyonu: FOR UPDATE SKIP LOCKED ile kayıtları güvenle rezerve eder.
-- 2. Doğrudan SQL seviyesinde auth.users silimi tamamen kaldırıldı; silme yetkisi ve yaşam döngüsü
--    yalnızca resmi Supabase GoTrue Admin API'sine (adminClient.auth.admin.deleteUser) bağlandı.
-- 3. trigger_scheduled_account_deletion_retry(): pg_net üzerinden retry-account-deletions Edge Function'ını tetikler.
-- 4. Saatlik pg_cron zamanlayıcısı: Arka planda Edge Function worker'ını tetikler.

-- ============================================================================
-- 1. EŞZAMANLILIK KİLİTLİ TALEP REZERVASYONU (claim_pending_auth_deletions)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.claim_pending_auth_deletions(
  p_limit INT DEFAULT 10,
  p_max_retries INT DEFAULT 5
)
RETURNS TABLE (
  request_id UUID,
  user_id UUID,
  retry_count INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.user_id, a.retry_count
  FROM public.account_deletion_requests a
  WHERE a.status = 'auth_deletion_pending'
    AND a.user_id IS NOT NULL
    AND a.retry_count < p_max_retries
  ORDER BY a.requested_at ASC
  LIMIT p_limit
  FOR UPDATE SKIP LOCKED;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_pending_auth_deletions(INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_pending_auth_deletions(INT, INT) TO service_role;

-- ============================================================================
-- 2. pg_net İLE EDGE FUNCTION TETİKLEYİCİSİ
-- ============================================================================
CREATE OR REPLACE FUNCTION public.trigger_scheduled_account_deletion_retry()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  -- pg_net üzerinden resmi Admin API kullanan retry-account-deletions Edge Function'ını tetikle
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    PERFORM extensions.http_post(
      'https://hoqujzhcjeaudmkyqgpc.supabase.co/functions/v1/retry-account-deletions',
      '{}',
      'application/json'
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Otomatik hesap silme telafi tetiklemesi başarısız: %', SQLERRM;
END;
$$;

REVOKE ALL ON FUNCTION public.trigger_scheduled_account_deletion_retry() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.trigger_scheduled_account_deletion_retry() TO service_role;

-- ============================================================================
-- 3. ESKİ SQL FONKSİYONUNUN YÖNLENDİRİLMESİ (process_pending_auth_deletions)
-- ============================================================================
-- Doğrudan auth.users silimi yapan eski yaklaşım kaldırıldı;
-- fonksiyon çağrıldığında Edge Function tetikleyicisini çalıştırır.
CREATE OR REPLACE FUNCTION public.process_pending_auth_deletions(
  p_max_retries INT DEFAULT 5
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM public.trigger_scheduled_account_deletion_retry();
  RETURN jsonb_build_object(
    'dispatched_to_edge_function', true,
    'method', 'supabase.auth.admin.deleteUser'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.process_pending_auth_deletions(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_pending_auth_deletions(INT) TO service_role;

-- ============================================================================
-- 4. SAATLİK pg_cron ZAMANLAYICISI
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('retry-pending-auth-deletions-job')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'retry-pending-auth-deletions-job');

    PERFORM cron.schedule(
      'retry-pending-auth-deletions-job',
      '0 * * * *',
      'SELECT public.trigger_scheduled_account_deletion_retry();'
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron zamanlayıcı kaydı atlandı: %', SQLERRM;
END;
$$;
