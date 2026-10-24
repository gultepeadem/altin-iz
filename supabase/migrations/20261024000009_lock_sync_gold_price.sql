-- Altın İz - Migration 009: Lock sync_gold_price to service_role only
-- Referans: docs/SECURITY.md Bölüm 8.6
-- Açıklama: İstemcilerin (anon, authenticated) doğrudan fiyat yazmasını kesinlikle engeller.
-- Yalnızca service_role (Edge Function / Cron / Admin) fiyat yazabilir.

REVOKE ALL ON FUNCTION public.sync_gold_price(TEXT, BIGINT, BIGINT, NUMERIC) FROM anon;
REVOKE ALL ON FUNCTION public.sync_gold_price(TEXT, BIGINT, BIGINT, NUMERIC) FROM authenticated;
REVOKE ALL ON FUNCTION public.sync_gold_price(TEXT, BIGINT, BIGINT, NUMERIC) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.sync_gold_price(TEXT, BIGINT, BIGINT, NUMERIC) TO service_role;
