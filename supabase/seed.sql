-- Altın İz - Geliştirme (Development) Başlangıç Seed Verileri
-- Belge Referansı: docs/DATABASE.md & docs/DECISIONS.md (ADR-016, ADR-017, ADR-018, ADR-019)
-- UYARI: Bu dosya yalnızca geliştirme (development/test) ortamı içindir.
-- Production ortamına asla test veya kurgusal veri eklenmemelidir.
-- Yasal şablon metinleri "TEST METNİDİR - PRODUCTION İÇİN GEÇERLİ DEĞİLDİR" uyarısı taşır.
-- Gerçek kullanıcı verisi İÇERMEZ.

-- 1. ALTIN ÜRÜNLERİ KATALOĞU (gold_products)
INSERT INTO public.gold_products (
    code, name, short_name, category, measurement_unit, quantity_precision, package_weight_grams,
    portfolio_enabled, calculator_enabled, price_display_enabled, sort_order, is_active
) VALUES
-- Gram Altın
('GRAM_GOLD', 'Gram Altın', 'Gram', 'gram', 'gram', 3, NULL, true, true, true, 10, true),

-- Ziynet / Sikke Altınlar (Yeni ve Eski Tarihli)
('QUARTER_GOLD_NEW', 'Çeyrek Altın (Yeni Tarihli)', 'Yeni Çeyrek', 'coin', 'piece', 0, NULL, true, true, true, 20, true),
('QUARTER_GOLD_OLD', 'Çeyrek Altın (Eski Tarihli)', 'Eski Çeyrek', 'coin', 'piece', 0, NULL, true, true, true, 30, true),
('HALF_GOLD_NEW', 'Yarım Altın (Yeni Tarihli)', 'Yeni Yarım', 'coin', 'piece', 0, NULL, true, true, true, 40, true),
('HALF_GOLD_OLD', 'Yarım Altın (Eski Tarihli)', 'Eski Yarım', 'coin', 'piece', 0, NULL, true, true, true, 50, true),
('FULL_GOLD_NEW', 'Tam Altın (Yeni Tarihli)', 'Yeni Tam', 'coin', 'piece', 0, NULL, true, true, true, 60, true),
('FULL_GOLD_OLD', 'Tam Altın (Eski Tarihli)', 'Eski Tam', 'coin', 'piece', 0, NULL, true, true, true, 70, true),
('REPUBLIC_GOLD', 'Cumhuriyet Altını', 'Cumhuriyet', 'coin', 'piece', 0, NULL, true, true, true, 80, true),
('ATA_GOLD_NEW', 'Ata Altın (Yeni Tarihli)', 'Yeni Ata', 'coin', 'piece', 0, NULL, true, true, true, 90, true),
('ATA_GOLD_OLD', 'Ata Altın (Eski Tarihli)', 'Eski Ata', 'coin', 'piece', 0, NULL, true, true, true, 100, true),
('GREMSE_GOLD_NEW', 'Gremse Altın (Yeni Tarihli)', 'Yeni Gremse', 'coin', 'piece', 0, NULL, true, true, true, 110, true),
('GREMSE_GOLD_OLD', 'Gremse Altın (Eski Tarihli)', 'Eski Gremse', 'coin', 'piece', 0, NULL, true, true, true, 120, true),
('RESAT_GOLD', 'Reşat Altın', 'Reşat', 'coin', 'piece', 0, NULL, true, true, true, 130, true),

-- Koşullu Sikke: Hamit Altın (Fiyat doğrulanana kadar portföy kapalı)
('HAMIT_GOLD', 'Hamit Altın', 'Hamit', 'coin', 'piece', 0, NULL, false, false, true, 140, true),

-- Ayar Bazlı Ürünler
('GOLD_22K', '22 Ayar Bilezik / Altın (Gram)', '22 Ayar', 'karat', 'gram', 3, NULL, true, true, true, 150, true),
('GOLD_14K', '14 Ayar Altın (Gram)', '14 Ayar', 'karat', 'gram', 3, NULL, true, true, true, 160, true),
-- 18 Ayar (Doğrudan fiyat doğrulanana kadar portföy/hesaplama devre dışı)
('GOLD_18K', '18 Ayar Altın (Gram)', '18 Ayar', 'karat', 'gram', 3, NULL, false, false, false, 170, true),

-- Paketli Külçe Altınlar (Adetle takip edilir, doğrudan fiyatı olanlar portföye açık)
('PACKAGED_GOLD_1G', '1 Gram Paketli Külçe Altın', '1g Paketli', 'packaged', 'piece', 0, 1.000, false, false, false, 180, true),
('PACKAGED_GOLD_2_5G', '2.5 Gram Paketli Külçe Altın', '2.5g Paketli', 'packaged', 'piece', 0, 2.500, false, false, false, 190, true),
('PACKAGED_GOLD_5G', '5 Gram Paketli Külçe Altın', '5g Paketli', 'packaged', 'piece', 0, 5.000, true, true, true, 200, true),
('PACKAGED_GOLD_10G', '10 Gram Paketli Külçe Altın', '10g Paketli', 'packaged', 'piece', 0, 10.000, true, true, true, 210, true),
('PACKAGED_GOLD_20G', '20 Gram Paketli Külçe Altın', '20g Paketli', 'packaged', 'piece', 0, 20.000, true, true, true, 220, true),
('PACKAGED_GOLD_50G', '50 Gram Paketli Külçe Altın', '50g Paketli', 'packaged', 'piece', 0, 50.000, true, true, true, 230, true),
('PACKAGED_GOLD_100G', '100 Gram Paketli Külçe Altın', '100g Paketli', 'packaged', 'piece', 0, 100.000, true, true, true, 240, true),

-- Uluslararası Gösterge: Ons Altın (Portföye eklenemez, gösterge ve hesaplama için)
('OUNCE_GOLD', 'Ons Altın', 'Ons', 'international', 'ounce', 3, NULL, false, true, true, 250, true)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    short_name = EXCLUDED.short_name,
    category = EXCLUDED.category,
    measurement_unit = EXCLUDED.measurement_unit,
    quantity_precision = EXCLUDED.quantity_precision,
    package_weight_grams = EXCLUDED.package_weight_grams,
    portfolio_enabled = EXCLUDED.portfolio_enabled,
    calculator_enabled = EXCLUDED.calculator_enabled,
    price_display_enabled = EXCLUDED.price_display_enabled,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;

-- 2. FİYAT KAYNAĞI (price_sources)
INSERT INTO public.price_sources (code, name, website_url, timezone, priority, is_active)
VALUES ('ALTIN_API', 'Altın API (Birincil Fiyat Kaynağı)', 'https://altin.in', 'Europe/Istanbul', 1, true)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    priority = EXCLUDED.priority,
    is_active = EXCLUDED.is_active;

-- 3. BAŞLANGIÇ YASAL BELGE ŞABLONLARI (legal_documents)
-- Test ortamı şablon kayıtlarıdır; 'TEST METNİDİR' işareti taşır.
INSERT INTO public.legal_documents (
    document_type, version, title, content, content_hash, is_active, requires_action, effective_at
) VALUES
('kvkk_notice', '1.0-dev', 'KVKK Aydınlatma Metni', 'TEST METNİDİR - PRODUCTION İÇİN GEÇERLİ DEĞİLDİR. Altın İz uygulaması kapsamında kişisel verileriniz KVKK kapsamında işlenmektedir.', 'hash_kvkk_1_0_dev', true, false, NOW()),
('privacy_policy', '1.0-dev', 'Gizlilik Politikası', 'TEST METNİDİR - PRODUCTION İÇİN GEÇERLİ DEĞİLDİR. Altın İz gizlilik politikası ilkeleri.', 'hash_privacy_1_0_dev', true, false, NOW()),
('terms_of_use', '1.0-dev', 'Kullanım Koşulları', 'TEST METNİDİR - PRODUCTION İÇİN GEÇERLİ DEĞİLDİR. Altın İz kullanım koşulları ve kuralları.', 'hash_terms_1_0_dev', true, false, NOW()),
('financial_disclaimer', '1.0-dev', 'Finansal Bilgilendirme ve Sorumluluk Reddi', 'TEST METNİDİR - PRODUCTION İÇİN GEÇERLİ DEĞİLDİR. Altın İz fiyatları bilgilendirme amaçlı sunar, yatırım tavsiyesi değildir.', 'hash_disclaimer_1_0_dev', true, false, NOW()),
('data_retention', '1.0-dev', 'Veri Saklama ve İmha Politikası', 'TEST METNİDİR - PRODUCTION İÇİN GEÇERLİ DEĞİLDİR. Altın İz veri saklama politikası.', 'hash_retention_1_0_dev', true, false, NOW())
ON CONFLICT (document_type, version) DO NOTHING;
