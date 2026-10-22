-- Altın İz - Migration 007: Price Source Product Mappings
-- Referans: docs/DATABASE.md Bölüm 7.3 & docs/API.md Bölüm 10 & docs/DECISIONS.md (ADR-017)

-- 1. ALTIN_API Fiyat Kaynağı Doğrulaması
INSERT INTO public.price_sources (code, name, website_url, timezone, priority, is_active)
VALUES ('ALTIN_API', 'Altın API (Birincil Fiyat Kaynağı)', 'https://altin.in', 'Europe/Istanbul', 1, true)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    priority = EXCLUDED.priority,
    is_active = EXCLUDED.is_active;

-- 2. DOĞRULANMIŞ ÜRÜN VE SEMBOL EŞLEŞTİRMELERİ
-- Not: (source_id, external_symbol) ve (source_id, product_id) UNIQUE kısıtlarına sahiptir.

INSERT INTO public.price_source_product_mappings (
    source_id, product_id, external_symbol, external_name, external_category, is_active
) VALUES
-- Gram Altın
(
    (SELECT id FROM public.price_sources WHERE code = 'ALTIN_API'),
    (SELECT id FROM public.gold_products WHERE code = 'GRAM_GOLD'),
    'GRAM_ALTIN', 'Gram Altın', 'MADEN', true
),

-- Ziynet ve Sikke Ürünler (Eski / Yeni Tarihli Ayrımı Kesin)
(
    (SELECT id FROM public.price_sources WHERE code = 'ALTIN_API'),
    (SELECT id FROM public.gold_products WHERE code = 'QUARTER_GOLD_NEW'),
    'CEYREK_YENI', 'Çeyrek Altın (Yeni)', 'SARRAFIYE', true
),
(
    (SELECT id FROM public.price_sources WHERE code = 'ALTIN_API'),
    (SELECT id FROM public.gold_products WHERE code = 'QUARTER_GOLD_OLD'),
    'CEYREK_ESKI', 'Çeyrek Altın (Eski)', 'SARRAFIYE', true
),
(
    (SELECT id FROM public.price_sources WHERE code = 'ALTIN_API'),
    (SELECT id FROM public.gold_products WHERE code = 'HALF_GOLD_NEW'),
    'YARIM_YENI', 'Yarım Altın (Yeni)', 'SARRAFIYE', true
),
(
    (SELECT id FROM public.price_sources WHERE code = 'ALTIN_API'),
    (SELECT id FROM public.gold_products WHERE code = 'HALF_GOLD_OLD'),
    'YARIM_ESKI', 'Yarım Altın (Eski)', 'SARRAFIYE', true
),
(
    (SELECT id FROM public.price_sources WHERE code = 'ALTIN_API'),
    (SELECT id FROM public.gold_products WHERE code = 'FULL_GOLD_NEW'),
    'TAM_YENI', 'Tam Altın (Yeni)', 'SARRAFIYE', true
),
(
    (SELECT id FROM public.price_sources WHERE code = 'ALTIN_API'),
    (SELECT id FROM public.gold_products WHERE code = 'FULL_GOLD_OLD'),
    'TAM_ESKI', 'Tam Altın (Eski)', 'SARRAFIYE', true
),
(
    (SELECT id FROM public.price_sources WHERE code = 'ALTIN_API'),
    (SELECT id FROM public.gold_products WHERE code = 'ATA_GOLD_NEW'),
    'ATA_YENI', 'Ata Altın (Yeni)', 'SARRAFIYE', true
),
(
    (SELECT id FROM public.price_sources WHERE code = 'ALTIN_API'),
    (SELECT id FROM public.gold_products WHERE code = 'ATA_GOLD_OLD'),
    'ATA_ESKI', 'Ata Altın (Eski)', 'SARRAFIYE', true
),
(
    (SELECT id FROM public.price_sources WHERE code = 'ALTIN_API'),
    (SELECT id FROM public.gold_products WHERE code = 'GREMSE_GOLD_NEW'),
    'GREMSE_YENI', 'Gremse Altın (Yeni)', 'SARRAFIYE', true
),
(
    (SELECT id FROM public.price_sources WHERE code = 'ALTIN_API'),
    (SELECT id FROM public.gold_products WHERE code = 'GREMSE_GOLD_OLD'),
    'GREMSE_ESKI', 'Gremse Altın (Eski)', 'SARRAFIYE', true
),
(
    (SELECT id FROM public.price_sources WHERE code = 'ALTIN_API'),
    (SELECT id FROM public.gold_products WHERE code = 'RESAT_GOLD'),
    'RESAT_ALTIN', 'Reşat Altın', 'SARRAFIYE', true
),

-- Ayar Bazlı Ürünler
(
    (SELECT id FROM public.price_sources WHERE code = 'ALTIN_API'),
    (SELECT id FROM public.gold_products WHERE code = 'GOLD_22K'),
    'AYAR22', '22 Ayar Bilezik / Altın', 'AYAR', true
),
(
    (SELECT id FROM public.price_sources WHERE code = 'ALTIN_API'),
    (SELECT id FROM public.gold_products WHERE code = 'GOLD_14K'),
    'AYAR14', '14 Ayar Altın', 'AYAR', true
),

-- Uluslararası Gösterge: Ons Altın
(
    (SELECT id FROM public.price_sources WHERE code = 'ALTIN_API'),
    (SELECT id FROM public.gold_products WHERE code = 'OUNCE_GOLD'),
    'ONS', 'Ons Altın (USD/oz)', 'ULUSLARARASI', true
),

-- Paketli Külçe Altınlar
(
    (SELECT id FROM public.price_sources WHERE code = 'ALTIN_API'),
    (SELECT id FROM public.gold_products WHERE code = 'PACKAGED_GOLD_5G'),
    'KULCE_5G', '5 Gram Paketli Külçe Altın', 'PAKETLI', true
),
(
    (SELECT id FROM public.price_sources WHERE code = 'ALTIN_API'),
    (SELECT id FROM public.gold_products WHERE code = 'PACKAGED_GOLD_10G'),
    'KULCE_10G', '10 Gram Paketli Külçe Altın', 'PAKETLI', true
),
(
    (SELECT id FROM public.price_sources WHERE code = 'ALTIN_API'),
    (SELECT id FROM public.gold_products WHERE code = 'PACKAGED_GOLD_20G'),
    'KULCE_20G', '20 Gram Paketli Külçe Altın', 'PAKETLI', true
),
(
    (SELECT id FROM public.price_sources WHERE code = 'ALTIN_API'),
    (SELECT id FROM public.gold_products WHERE code = 'PACKAGED_GOLD_50G'),
    'KULCE_50G', '50 Gram Paketli Külçe Altın', 'PAKETLI', true
),
(
    (SELECT id FROM public.price_sources WHERE code = 'ALTIN_API'),
    (SELECT id FROM public.gold_products WHERE code = 'PACKAGED_GOLD_100G'),
    'KULCE_100G', '100 Gram Paketli Külçe Altın', 'PAKETLI', true
),

-- KOŞULLU / DEVRE DIŞI EŞLEŞTİRMELER (is_active = false)
-- Güvenlik Kuralı: Devre dışı eşleştirmenin fiyat üretmediği test edilir.
(
    (SELECT id FROM public.price_sources WHERE code = 'ALTIN_API'),
    (SELECT id FROM public.gold_products WHERE code = 'HAMIT_GOLD'),
    'HAMIT_ALTIN', 'Hamit Altın (Koşullu)', 'SARRAFIYE', false
),
(
    (SELECT id FROM public.price_sources WHERE code = 'ALTIN_API'),
    (SELECT id FROM public.gold_products WHERE code = 'GOLD_18K'),
    'AYAR18', '18 Ayar Altın (Koşullu)', 'AYAR', false
)
ON CONFLICT (source_id, external_symbol) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    external_name = EXCLUDED.external_name,
    external_category = EXCLUDED.external_category,
    is_active = EXCLUDED.is_active;

-- 3. RLS OKUMA POLİTİKASI (price_source_product_mappings)
-- Güvenlik Kuralı: Yazma (INSERT/UPDATE/DELETE) kesinlikle engellidir; okuma yetkisi sağlanır.
DROP POLICY IF EXISTS "price_source_product_mappings_read_all" ON public.price_source_product_mappings;
CREATE POLICY "price_source_product_mappings_read_all"
    ON public.price_source_product_mappings FOR SELECT
    TO anon, authenticated
    USING (true);

-- KESİNLİKLE EŞLEŞTİRİLMEYEN / KORUNAN (ADR-017 & KI-005):
-- 'REPUBLIC_GOLD' ürünü sağlayıcı tarafından resmi ayrım doğrulanana kadar
-- ATA_YENI veya ATA_ESKI ile eşleştirilmez!
