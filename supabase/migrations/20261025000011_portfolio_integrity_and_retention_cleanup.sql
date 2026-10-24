-- Altın İz - Migration 011: Portfolio Integrity Trigger and Retention Cleanup RPC
-- Referans: docs/DATABASE.md Bölüm 15.1, 21.9 & docs/DATA_RETENTION.md Bölüm 40
-- Kapsam:
-- 1. portfolio_entries için veritabanı seviyesinde ürün aktifliği, portföy izni ve adet tam sayı kısıtı tetikleyicisi
-- 2. gold_prices ve price_fetch_runs tabloları için 30 günlük güvenli bakım ve temizlik RPC fonksiyonu (cleanup_old_price_records)
-- 3. pg_cron haftalık otomatik temizlik zamanlayıcısı

-- ============================================================================
-- 1. PORTFÖY ÜRÜN VE MİKTAR BÜTÜNLÜĞÜ TETİKLEYİCİSİ (DATABASE.md 15.1 & 21.9)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.validate_portfolio_entry_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_active BOOLEAN;
    v_portfolio_enabled BOOLEAN;
    v_unit TEXT;
BEGIN
    -- Ürünün güncel kataloğunu sorgula
    SELECT is_active, portfolio_enabled, measurement_unit
    INTO v_is_active, v_portfolio_enabled, v_unit
    FROM public.gold_products
    WHERE id = NEW.product_id;

    -- 1. Ürün sistemde var mı?
    IF v_is_active IS NULL THEN
        RAISE EXCEPTION 'INVALID_PRODUCT: Belirtilen altın ürünü sistemde bulunamadı.';
    END IF;

    -- 2. Ürün aktif mi?
    IF v_is_active IS NOT TRUE THEN
        RAISE EXCEPTION 'PRODUCT_INACTIVE: Pasif durumdaki altın ürünleri kişisel portföye eklenemez.';
    END IF;

    -- 3. Ürün portföy takibine açık mı? (Ons Altın vb. göstergeler eklenemez)
    IF v_portfolio_enabled IS NOT TRUE THEN
        RAISE EXCEPTION 'PORTFOLIO_DISABLED: Bu ürün (örn: Ons Altın) yalnızca piyasa göstergesidir; portföy takibine açık değildir.';
    END IF;

    -- 4. Adetli ürünlerde miktar tam sayı olmalıdır (1.5 çeyrek altın eklenemez)
    IF v_unit = 'piece' AND NEW.quantity <> TRUNC(NEW.quantity) THEN
        RAISE EXCEPTION 'INTEGER_QUANTITY_REQUIRED: Adet birimli ürünlerde (sikke, ziynet veya paketli külçe) miktar pozitif tam sayı olmalıdır.';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_portfolio_entry_integrity ON public.portfolio_entries;
CREATE TRIGGER trg_validate_portfolio_entry_integrity
    BEFORE INSERT OR UPDATE OF product_id, quantity ON public.portfolio_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_portfolio_entry_integrity();

-- ============================================================================
-- 2. ESKİ FİYAT VE LOG TEMİZLEME BAKIM FONKSİYONU (DATA_RETENTION.md Bölüm 40)
-- ============================================================================
-- Supabase Free Tier kota ve depolama sınırlarını korumak amacıyla;
-- her ürünün en son geçerli fiyatını ASLA silmeden, p_retention_days gününden eski
-- geçmiş fiyat ve çalıştırma loglarını güvenle temizler.
CREATE OR REPLACE FUNCTION public.cleanup_old_price_records(
    p_retention_days INT DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_cutoff_date TIMESTAMPTZ;
    v_deleted_prices INT := 0;
    v_deleted_runs INT := 0;
BEGIN
    -- Güvenlik kısıtı: Retention en az 7 gün olmalıdır
    IF p_retention_days < 7 THEN
        RAISE EXCEPTION 'INVALID_RETENTION: Saklama süresi 7 günden az olamaz.';
    END IF;

    v_cutoff_date := NOW() - (p_retention_days || ' days')::INTERVAL;

    -- 1. gold_prices temizliği:
    -- Her ürünün en son geçerli (is_valid = true) fiyat kaydı KORUNUR!
    WITH latest_valid_prices AS (
        SELECT DISTINCT ON (product_id) id
        FROM public.gold_prices
        WHERE is_valid = true
        ORDER BY product_id, fetched_at DESC
    )
    DELETE FROM public.gold_prices
    WHERE fetched_at < v_cutoff_date
      AND id NOT IN (SELECT id FROM latest_valid_prices);

    GET DIAGNOSTICS v_deleted_prices = ROW_COUNT;

    -- 2. price_fetch_runs temizliği:
    -- Devam eden ('running') işlemler silinmez.
    DELETE FROM public.price_fetch_runs
    WHERE started_at < v_cutoff_date
      AND status <> 'running';

    GET DIAGNOSTICS v_deleted_runs = ROW_COUNT;

    RETURN jsonb_build_object(
        'success', true,
        'retention_days', p_retention_days,
        'cutoff_date', v_cutoff_date,
        'deleted_prices_count', v_deleted_prices,
        'deleted_runs_count', v_deleted_runs
    );
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'CLEANUP_FAILED: %', SQLERRM;
END;
$$;

-- Yetkilendirme: Yalnızca service_role veya veritabanı yöneticisi çalıştırabilir
REVOKE ALL ON FUNCTION public.cleanup_old_price_records(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_old_price_records(INT) TO service_role;

-- ============================================================================
-- 3. HAFTALIK OTOMATİK TEMİZLİK ZAMANLAYICISI (pg_cron)
-- ============================================================================
-- Her Pazar gecesi 03:00 UTC'de 30 günden eski kayıtları temizle
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('cleanup-old-records-job')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-old-records-job');

    PERFORM cron.schedule(
      'cleanup-old-records-job',
      '0 3 * * 0',
      'SELECT public.cleanup_old_price_records(30);'
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron zamanlayıcı kaydı atlandı (Ortam desteği yoksa): %', SQLERRM;
END;
$$;
