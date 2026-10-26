-- Altın İz — Mağaza Denetçi (Reviewer) Demo Hesapları Kurulum Scripti
-- Dosya: supabase/scripts/setup-reviewer-accounts.sql
-- Referans: docs/GOOGLE_PLAY_SETUP.md & docs/APP_STORE_SETUP.md
--
-- Bu script; Google Play ve Apple App Store denetçileri için önceden tanımlanmış
-- e-postası doğrulanmış demo hesapları, profilleri, tercihleri ve örnek portföy
-- kayıtlarını idempotent (tekrar çalıştırılabilir) şekilde oluşturur.

DO $$
DECLARE
  v_play_uid UUID := 'a0000000-0000-4000-8000-000000000001'::uuid;
  v_apple_uid UUID := 'a0000000-0000-4000-8000-000000000002'::uuid;
  v_gram_id UUID;
  v_quarter_id UUID;
  v_terms_doc_id UUID;
  v_terms_version VARCHAR(30);
  v_kvkk_doc_id UUID;
  v_kvkk_version VARCHAR(30);
  -- Güvenlik Notu: Denetçi hesaplarının parolaları açık metin olarak kodda saklanmaz.
  -- Supabase oturum parametresi (app.reviewer_play_password / app.reviewer_apple_password)
  -- üzerinden okunur; tanımlı değilse kriptografik rastgele güvenli parola atanır.
  v_play_password TEXT := COALESCE(NULLIF(current_setting('app.reviewer_play_password', true), ''), gen_random_uuid()::text || '!P1ayReview');
  v_apple_password TEXT := COALESCE(NULLIF(current_setting('app.reviewer_apple_password', true), ''), gen_random_uuid()::text || '!App1eReview');
BEGIN
  -- Ürün ID'lerini bul
  SELECT id INTO v_gram_id FROM public.gold_products WHERE code = 'GRAM_GOLD' LIMIT 1;
  SELECT id INTO v_quarter_id FROM public.gold_products WHERE code = 'QUARTER_GOLD_NEW' LIMIT 1;

  -- Yasal belge ID'lerini bul
  SELECT id, version INTO v_terms_doc_id, v_terms_version
  FROM public.legal_documents WHERE document_type = 'terms_of_use' AND is_active = true
  ORDER BY created_at DESC LIMIT 1;

  SELECT id, version INTO v_kvkk_doc_id, v_kvkk_version
  FROM public.legal_documents WHERE document_type = 'kvkk_notice' AND is_active = true
  ORDER BY created_at DESC LIMIT 1;

  -- --------------------------------------------------------------------------
  -- 1. Google Play Reviewer Hesabı: reviewer-play@altiniz.app
  -- (Parola güvenli parola yöneticisinde saklanmaktadır / parametrik atanır)
  -- --------------------------------------------------------------------------
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_play_uid,
    'authenticated',
    'authenticated',
    'reviewer-play@altiniz.app',
    crypt(v_play_password, gen_salt('bf')),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"display_name": "Google Play Denetçisi"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt(v_play_password, gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, NOW()),
    updated_at = NOW();

  -- Play Reviewer Profili
  INSERT INTO public.user_profiles (user_id, display_name, account_status)
  VALUES (v_play_uid, 'Google Play Denetçisi', 'active')
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = 'Google Play Denetçisi',
    account_status = 'active';

  -- Play Reviewer Tercihleri
  INSERT INTO public.user_preferences (user_id, theme, language_code, currency_code)
  VALUES (v_play_uid, 'system', 'tr', 'TRY')
  ON CONFLICT (user_id) DO NOTHING;

  -- Play Reviewer Yasal Kayıtları
  IF v_terms_doc_id IS NOT NULL THEN
    INSERT INTO public.user_legal_events (user_id, document_id, event_type, event_at, document_version, source, app_version)
    SELECT v_play_uid, v_terms_doc_id, 'accepted', NOW(), v_terms_version, 'registration', '1.0.0'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_legal_events
      WHERE user_id = v_play_uid AND document_id = v_terms_doc_id AND event_type = 'accepted'
    );
  END IF;

  IF v_kvkk_doc_id IS NOT NULL THEN
    INSERT INTO public.user_legal_events (user_id, document_id, event_type, event_at, document_version, source, app_version)
    SELECT v_play_uid, v_kvkk_doc_id, 'presented', NOW(), v_kvkk_version, 'registration', '1.0.0'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_legal_events
      WHERE user_id = v_play_uid AND document_id = v_kvkk_doc_id AND event_type = 'presented'
    );
  END IF;

  -- Play Reviewer Örnek Portföyü (10g Gram Altın + 1 adet Çeyrek)
  IF v_gram_id IS NOT NULL THEN
    INSERT INTO public.portfolio_entries (
      id, user_id, product_id, quantity, purchase_date, total_cost_minor, purchase_place, note, labor_included, created_at, updated_at
    ) VALUES (
      'b0000000-0000-4000-8000-000000000001'::uuid,
      v_play_uid,
      v_gram_id,
      10.000,
      CURRENT_DATE - INTERVAL '15 days',
      7000000, -- 70.000,00 TL
      'Kapalıçarşı',
      'Denetim test portföy kaydı 1',
      false,
      NOW(),
      NOW()
    ) ON CONFLICT (id) DO NOTHING;
  END IF;

  IF v_quarter_id IS NOT NULL THEN
    INSERT INTO public.portfolio_entries (
      id, user_id, product_id, quantity, purchase_date, total_cost_minor, purchase_place, note, labor_included, created_at, updated_at
    ) VALUES (
      'b0000000-0000-4000-8000-000000000002'::uuid,
      v_play_uid,
      v_quarter_id,
      1.000,
      CURRENT_DATE - INTERVAL '5 days',
      1200000, -- 12.000,00 TL
      'Kuyumcukent',
      'Denetim test portföy kaydı 2',
      false,
      NOW(),
      NOW()
    ) ON CONFLICT (id) DO NOTHING;
  END IF;

  -- --------------------------------------------------------------------------
  -- 2. Apple App Store Reviewer Hesabı: reviewer-apple@altiniz.app
  -- (Parola güvenli parola yöneticisinde saklanmaktadır / parametrik atanır)
  -- --------------------------------------------------------------------------
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_apple_uid,
    'authenticated',
    'authenticated',
    'reviewer-apple@altiniz.app',
    crypt(v_apple_password, gen_salt('bf')),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"display_name": "App Store Denetçisi"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt(v_apple_password, gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, NOW()),
    updated_at = NOW();

  -- Apple Reviewer Profili
  INSERT INTO public.user_profiles (user_id, display_name, account_status)
  VALUES (v_apple_uid, 'App Store Denetçisi', 'active')
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = 'App Store Denetçisi',
    account_status = 'active';

  -- Apple Reviewer Tercihleri
  INSERT INTO public.user_preferences (user_id, theme, language_code, currency_code)
  VALUES (v_apple_uid, 'system', 'tr', 'TRY')
  ON CONFLICT (user_id) DO NOTHING;

  -- Apple Reviewer Yasal Kayıtları
  IF v_terms_doc_id IS NOT NULL THEN
    INSERT INTO public.user_legal_events (user_id, document_id, event_type, event_at, document_version, source, app_version)
    SELECT v_apple_uid, v_terms_doc_id, 'accepted', NOW(), v_terms_version, 'registration', '1.0.0'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_legal_events
      WHERE user_id = v_apple_uid AND document_id = v_terms_doc_id AND event_type = 'accepted'
    );
  END IF;

  IF v_kvkk_doc_id IS NOT NULL THEN
    INSERT INTO public.user_legal_events (user_id, document_id, event_type, event_at, document_version, source, app_version)
    SELECT v_apple_uid, v_kvkk_doc_id, 'presented', NOW(), v_kvkk_version, 'registration', '1.0.0'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_legal_events
      WHERE user_id = v_apple_uid AND document_id = v_kvkk_doc_id AND event_type = 'presented'
    );
  END IF;

  -- Apple Reviewer Örnek Portföyü (5g Gram Altın + 2 adet Çeyrek)
  IF v_gram_id IS NOT NULL THEN
    INSERT INTO public.portfolio_entries (
      id, user_id, product_id, quantity, purchase_date, total_cost_minor, purchase_place, note, labor_included, created_at, updated_at
    ) VALUES (
      'b0000000-0000-4000-8000-000000000003'::uuid,
      v_apple_uid,
      v_gram_id,
      5.000,
      CURRENT_DATE - INTERVAL '10 days',
      3500000, -- 35.000,00 TL
      'Kapalıçarşı',
      'Apple denetim test kaydı 1',
      false,
      NOW(),
      NOW()
    ) ON CONFLICT (id) DO NOTHING;
  END IF;

  IF v_quarter_id IS NOT NULL THEN
    INSERT INTO public.portfolio_entries (
      id, user_id, product_id, quantity, purchase_date, total_cost_minor, purchase_place, note, labor_included, created_at, updated_at
    ) VALUES (
      'b0000000-0000-4000-8000-000000000004'::uuid,
      v_apple_uid,
      v_quarter_id,
      2.000,
      CURRENT_DATE - INTERVAL '3 days',
      2400000, -- 24.000,00 TL
      'Kuyumcukent',
      'Apple denetim test kaydı 2',
      false,
      NOW(),
      NOW()
    ) ON CONFLICT (id) DO NOTHING;
  END IF;

  RAISE NOTICE 'Mağaza denetçi demo hesapları (reviewer-play@altiniz.app ve reviewer-apple@altiniz.app) başarıyla hazırlandı.';
END;
$$;
