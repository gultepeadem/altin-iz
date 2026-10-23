-- Altın İz Canlı Fiyat Tohumlama ve Güvenli Fiyat Senkronizasyon Scripti
-- Oluşturulma: 2026-10-23
-- Supabase SQL Editor üzerinden tek seferde çalıştırabilirsiniz.

-- 1. Güvenli Fiyat Ekleme Fonksiyonu (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.sync_gold_price(
  p_product_code TEXT,
  p_buy_price_minor BIGINT,
  p_sell_price_minor BIGINT,
  p_daily_change NUMERIC DEFAULT 0
)
RETURNS VOID AS $$
DECLARE
  v_prod_id UUID;
  v_source_id UUID;
  v_unit TEXT;
BEGIN
  SELECT id, measurement_unit INTO v_prod_id, v_unit FROM public.gold_products WHERE code = p_product_code;
  SELECT id INTO v_source_id FROM public.price_sources LIMIT 1;
  
  IF v_prod_id IS NOT NULL AND v_source_id IS NOT NULL THEN
    INSERT INTO public.gold_prices (
      product_id, source_id, buy_price_minor, sell_price_minor,
      currency_code, price_unit, daily_change_percent,
      source_price_at, fetched_at, is_valid
    ) VALUES (
      v_prod_id, v_source_id, p_buy_price_minor, p_sell_price_minor,
      'TRY', v_unit, p_daily_change, NOW(), NOW(), true
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.sync_gold_price TO anon, authenticated;

-- 2. Canlı 25 Altın Ürünü Fiyatlarının Eklenmesi
INSERT INTO public.gold_prices (
  product_id, source_id, buy_price_minor, sell_price_minor,
  currency_code, price_unit, daily_change_percent,
  source_price_at, fetched_at, is_valid
) VALUES
  ('0f525a73-0159-4bd3-95ed-0bd6742aecf3', '42d7797f-6369-4c34-987b-9067aebb86a9', 636052, 636153, 'TRY', 'gram', -0.99, NOW(), NOW(), true),
  ('1bd1e4f3-921f-4fc3-bda8-9968b45d2499', '42d7797f-6369-4c34-987b-9067aebb86a9', 1032222, 1056044, 'TRY', 'piece', -0.55, NOW(), NOW(), true),
  ('f3c33dae-096c-4bef-acd6-3b24df3e9cf9', '42d7797f-6369-4c34-987b-9067aebb86a9', 1016739, 1040203, 'TRY', 'piece', -0.55, NOW(), NOW(), true),
  ('724086b9-7c2a-4590-a292-472c258d1da1', '42d7797f-6369-4c34-987b-9067aebb86a9', 2057993, 2112088, 'TRY', 'piece', -0.55, NOW(), NOW(), true),
  ('d7c9e3d2-9206-444a-902a-c0943aca6e37', '42d7797f-6369-4c34-987b-9067aebb86a9', 2027123, 2080407, 'TRY', 'piece', -0.55, NOW(), NOW(), true),
  ('f161cc05-2d61-420c-846a-390fff0353ca', '42d7797f-6369-4c34-987b-9067aebb86a9', 4128888, 4211258, 'TRY', 'piece', -0.55, NOW(), NOW(), true),
  ('1bb7da8c-d115-48a6-9bf6-46ea0f2d8669', '42d7797f-6369-4c34-987b-9067aebb86a9', 4066955, 4148089, 'TRY', 'piece', -0.55, NOW(), NOW(), true),
  ('8e5a62bd-3bfe-46a3-9e0e-339f438d5224', '42d7797f-6369-4c34-987b-9067aebb86a9', 4282300, 4348400, 'TRY', 'piece', -0.48, NOW(), NOW(), true),
  ('f3c34421-9453-441f-b55c-72286988decf', '42d7797f-6369-4c34-987b-9067aebb86a9', 4257916, 4366274, 'TRY', 'piece', -0.55, NOW(), NOW(), true),
  ('fbc378f6-ae98-4cf4-bfd0-b961596dd305', '42d7797f-6369-4c34-987b-9067aebb86a9', 4194047, 4300780, 'TRY', 'piece', -0.55, NOW(), NOW(), true),
  ('5e91f1e7-1d49-4e4a-a4ce-e2ccfa6a1b4d', '42d7797f-6369-4c34-987b-9067aebb86a9', 10322221, 10560440, 'TRY', 'piece', -0.55, NOW(), NOW(), true),
  ('69a83e5b-0a4a-43da-bf4a-8a714edf744a', '42d7797f-6369-4c34-987b-9067aebb86a9', 10167388, 10402033, 'TRY', 'piece', -0.55, NOW(), NOW(), true),
  ('3b4747fb-88c9-4516-b932-0b7203f30fa0', '42d7797f-6369-4c34-987b-9067aebb86a9', 4257916, 4366274, 'TRY', 'piece', -0.55, NOW(), NOW(), true),
  ('c0047887-6eeb-47f3-9a66-f7190cc9a39d', '42d7797f-6369-4c34-987b-9067aebb86a9', 4257916, 4366274, 'TRY', 'piece', -0.55, NOW(), NOW(), true),
  ('2618b7c3-414d-4d0f-83de-222484ab2ce1', '42d7797f-6369-4c34-987b-9067aebb86a9', 588367, 589059, 'TRY', 'gram', -0.55, NOW(), NOW(), true),
  ('7346431d-3d73-4fdd-a28b-21910adb27c1', '42d7797f-6369-4c34-987b-9067aebb86a9', 367729, 368162, 'TRY', 'gram', -0.55, NOW(), NOW(), true),
  ('55b08ed5-cba6-464e-8234-29dea2ff5e07', '42d7797f-6369-4c34-987b-9067aebb86a9', 470951, 471506, 'TRY', 'gram', -0.55, NOW(), NOW(), true),
  ('bde06f9d-c058-4674-9368-77538527cfc5', '42d7797f-6369-4c34-987b-9067aebb86a9', 636052, 645695, 'TRY', 'gram', -0.99, NOW(), NOW(), true),
  ('7157ed3c-8d9e-4c89-a11c-88caf4f1e00c', '42d7797f-6369-4c34-987b-9067aebb86a9', 1590130, 1609467, 'TRY', 'gram', -0.99, NOW(), NOW(), true),
  ('18441677-6859-4c37-a2e7-ffbe4ac8d160', '42d7797f-6369-4c34-987b-9067aebb86a9', 3180260, 3212573, 'TRY', 'gram', -0.99, NOW(), NOW(), true),
  ('7bc5560f-8848-4893-8f66-a6921df497db', '42d7797f-6369-4c34-987b-9067aebb86a9', 6360520, 6412422, 'TRY', 'gram', -0.99, NOW(), NOW(), true),
  ('d797c04c-7f06-42a8-86e9-da4ad0450544', '42d7797f-6369-4c34-987b-9067aebb86a9', 12721040, 12799398, 'TRY', 'gram', -0.99, NOW(), NOW(), true),
  ('7ea85c28-cf36-4113-8b90-30ec785a9f8a', '42d7797f-6369-4c34-987b-9067aebb86a9', 31802600, 31966688, 'TRY', 'gram', -0.99, NOW(), NOW(), true),
  ('274e7404-8f46-46ff-8b90-dd825ac07430', '42d7797f-6369-4c34-987b-9067aebb86a9', 63605200, 63869761, 'TRY', 'gram', -0.99, NOW(), NOW(), true),
  ('d123aa0e-d7d2-43c6-a754-e929cb47f3b0', '42d7797f-6369-4c34-987b-9067aebb86a9', 13500000, 13520000, 'TRY', 'ounce', -1.16, NOW(), NOW(), true);
