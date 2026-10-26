-- Altın İz - Migration 014: Account Deletion Concurrency Locking, Retry Limits and Idempotency
-- Referans: docs/DECISIONS.md ADR-033, docs/DATABASE.md & docs/API.md
-- Kapsam:
-- 1. account_deletion_requests tablosuna retry_count sütununun eklenmesi
-- 2. process_pending_auth_deletions RPC fonksiyonunun FOR UPDATE SKIP LOCKED kilitlemesi,
--    retry_count sayacı ve tavan sınırı (max 5 deneme) ile güçlendirilmesi
-- 3. İdempotency güvencesi (kullanıcı zaten auth.users'dan silinmişse hatasız completed yapılması)

-- ============================================================================
-- 1. RETRY_COUNT SÜTUNUNUN EKLENMESİ
-- ============================================================================
ALTER TABLE public.account_deletion_requests
    ADD COLUMN IF NOT EXISTS retry_count INT NOT NULL DEFAULT 0;

-- ============================================================================
-- 2. KİLİTLEME, IDEMPOTENCY VE RETRY SINIRI İLE GÜÇLENDİRİLMİŞ TELAFİ FONKSİYONU
-- ============================================================================
CREATE OR REPLACE FUNCTION public.process_pending_auth_deletions(
  p_max_retries INT DEFAULT 5
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_item RECORD;
  v_processed_count INT := 0;
  v_failed_count INT := 0;
  v_exhausted_count INT := 0;
BEGIN
  -- FOR UPDATE SKIP LOCKED: Eşzamanlı çalışan cron veya yöneticilerin aynı satırı
  -- çift işlemesini engeller; kilitli satırları atlayarak güvenli kilit sağlar.
  FOR v_item IN 
    SELECT id, user_id, retry_count
    FROM public.account_deletion_requests 
    WHERE status = 'auth_deletion_pending' 
      AND user_id IS NOT NULL 
      AND retry_count < p_max_retries
    FOR UPDATE SKIP LOCKED
  LOOP
    BEGIN
      -- İdempotency Güvencesi:
      -- Kullanıcı auth.users tablosunda mevcutsa silinir.
      -- Kullanıcı daha önce silinmişse (0 satır silinse dahi) hata üretmez.
      DELETE FROM auth.users WHERE id = v_item.user_id;
      
      -- Başarılı tamamlanma: user_id sıfırlanır, status 'completed' yapılır
      UPDATE public.account_deletion_requests
      SET status = 'completed',
          completed_at = NOW(),
          user_id = NULL
      WHERE id = v_item.id;
      
      v_processed_count := v_processed_count + 1;
    EXCEPTION WHEN OTHERS THEN
      v_failed_count := v_failed_count + 1;
      
      -- Retry sayacını artır ve tavan sınır denetimi yap
      IF (v_item.retry_count + 1) >= p_max_retries THEN
        v_exhausted_count := v_exhausted_count + 1;
        UPDATE public.account_deletion_requests
        SET retry_count = v_item.retry_count + 1,
            status = 'failed',
            failure_code = 'RETRY_LIMIT_EXCEEDED',
            failure_message = 'Azami deneme sınırına (' || p_max_retries || ') ulaşıldı: ' || SUBSTRING(SQLERRM FROM 1 FOR 450)
        WHERE id = v_item.id;
      ELSE
        UPDATE public.account_deletion_requests
        SET retry_count = v_item.retry_count + 1,
            failure_code = 'AUTH_DELETE_RETRY_PENDING',
            failure_message = 'Deneme ' || (v_item.retry_count + 1) || '/' || p_max_retries || ' başarısız: ' || SUBSTRING(SQLERRM FROM 1 FOR 450)
        WHERE id = v_item.id;
      END IF;
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'processed', v_processed_count,
    'failed', v_failed_count,
    'exhausted', v_exhausted_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.process_pending_auth_deletions(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_pending_auth_deletions(INT) TO service_role;
