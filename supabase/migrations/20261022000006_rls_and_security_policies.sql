-- Altın İz - Migration 006: Row Level Security (RLS) Policies and User Triggers
-- Referans: docs/DATABASE.md Bölüm 14 & Bölüm 17

-- ============================================================================
-- 1. ROW LEVEL SECURITY (RLS) ETKİNLEŞTİRME
-- ============================================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gold_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_source_product_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_fetch_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gold_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_legal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. YENİ KULLANICI TETİKLEYİCİSİ (handle_new_user)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, display_name, account_status)
    VALUES (NEW.id, NULL, 'active')
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.user_preferences (user_id, theme, language_code, currency_code)
    VALUES (NEW.id, 'system', 'tr', 'TRY')
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 3. KOLON KORUMA TETİKLEYİCİLERİ (BEFORE UPDATE)
-- ============================================================================
-- 3.1. user_profiles: user_id, account_status ve created_at değiştirilemez
CREATE OR REPLACE FUNCTION public.protect_user_profiles_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.user_id <> OLD.user_id THEN
        RAISE EXCEPTION 'user_id alanı değiştirilemez.';
    END IF;
    IF NEW.account_status <> OLD.account_status AND current_user IN ('anon', 'authenticated') THEN
        RAISE EXCEPTION 'account_status alanı kullanıcı tarafından doğrudan değiştirilemez.';
    END IF;
    IF NEW.created_at <> OLD.created_at THEN
        RAISE EXCEPTION 'created_at alanı değiştirilemez.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_user_profiles_columns ON public.user_profiles;
CREATE TRIGGER trg_protect_user_profiles_columns
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_user_profiles_columns();

-- 3.2. user_preferences: user_id, language_code, currency_code ve created_at değiştirilemez
CREATE OR REPLACE FUNCTION public.protect_user_preferences_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.user_id <> OLD.user_id THEN
        RAISE EXCEPTION 'user_id alanı değiştirilemez.';
    END IF;
    IF NEW.language_code <> OLD.language_code THEN
        RAISE EXCEPTION 'language_code alanı V1 kapsamında değiştirilemez.';
    END IF;
    IF NEW.currency_code <> OLD.currency_code THEN
        RAISE EXCEPTION 'currency_code alanı V1 kapsamında değiştirilemez.';
    END IF;
    IF NEW.created_at <> OLD.created_at THEN
        RAISE EXCEPTION 'created_at alanı değiştirilemez.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_user_preferences_columns ON public.user_preferences;
CREATE TRIGGER trg_protect_user_preferences_columns
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_user_preferences_columns();

-- 3.3. portfolio_entries: user_id değiştirilemez (sahiplik devredilemez)
CREATE OR REPLACE FUNCTION public.protect_portfolio_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.user_id <> OLD.user_id THEN
        RAISE EXCEPTION 'portfolio_entries kaydının sahibi (user_id) değiştirilemez.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_portfolio_user_id ON public.portfolio_entries;
CREATE TRIGGER trg_protect_portfolio_user_id
    BEFORE UPDATE ON public.portfolio_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_portfolio_user_id();

-- ============================================================================
-- 4. RLS POLİTİKALARI
-- ============================================================================

-- 4.1. user_profiles
DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
CREATE POLICY "user_profiles_select_own"
    ON public.user_profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_profiles_insert_fallback" ON public.user_profiles;
CREATE POLICY "user_profiles_insert_fallback"
    ON public.user_profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id AND account_status = 'active');

DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
CREATE POLICY "user_profiles_update_own"
    ON public.user_profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4.2. user_preferences
DROP POLICY IF EXISTS "user_preferences_select_own" ON public.user_preferences;
CREATE POLICY "user_preferences_select_own"
    ON public.user_preferences FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_preferences_insert_fallback" ON public.user_preferences;
CREATE POLICY "user_preferences_insert_fallback"
    ON public.user_preferences FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_preferences_update_own" ON public.user_preferences;
CREATE POLICY "user_preferences_update_own"
    ON public.user_preferences FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4.3. portfolio_entries
DROP POLICY IF EXISTS "portfolio_entries_select_own" ON public.portfolio_entries;
CREATE POLICY "portfolio_entries_select_own"
    ON public.portfolio_entries FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "portfolio_entries_insert_own" ON public.portfolio_entries;
CREATE POLICY "portfolio_entries_insert_own"
    ON public.portfolio_entries FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "portfolio_entries_update_own" ON public.portfolio_entries;
CREATE POLICY "portfolio_entries_update_own"
    ON public.portfolio_entries FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "portfolio_entries_delete_own" ON public.portfolio_entries;
CREATE POLICY "portfolio_entries_delete_own"
    ON public.portfolio_entries FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 4.4. gold_products (Aktif ürünler herkese açık salt-okunur)
DROP POLICY IF EXISTS "gold_products_read_active" ON public.gold_products;
CREATE POLICY "gold_products_read_active"
    ON public.gold_products FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- 4.5. price_sources (Aktif kaynaklar herkese açık salt-okunur)
DROP POLICY IF EXISTS "price_sources_read_active" ON public.price_sources;
CREATE POLICY "price_sources_read_active"
    ON public.price_sources FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- 4.6. gold_prices (Geçerli fiyatlar herkese açık salt-okunur)
DROP POLICY IF EXISTS "gold_prices_read_valid" ON public.gold_prices;
CREATE POLICY "gold_prices_read_valid"
    ON public.gold_prices FOR SELECT
    TO anon, authenticated
    USING (is_valid = true);

-- 4.7. legal_documents (Aktif yasal belgeler herkese açık salt-okunur)
DROP POLICY IF EXISTS "legal_documents_read_active" ON public.legal_documents;
CREATE POLICY "legal_documents_read_active"
    ON public.legal_documents FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- 4.8. user_legal_events (Kullanıcı yalnızca kendi olaylarını okuyabilir; istemciye doğrudan INSERT/UPDATE/DELETE kapalıdır)
DROP POLICY IF EXISTS "user_legal_events_select_own" ON public.user_legal_events;
CREATE POLICY "user_legal_events_select_own"
    ON public.user_legal_events FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 4.9. account_deletion_requests (Kullanıcı yalnızca kendi talebini okuyabilir; istemciye doğrudan INSERT/UPDATE/DELETE kapalıdır)
DROP POLICY IF EXISTS "account_deletion_requests_select_own" ON public.account_deletion_requests;
CREATE POLICY "account_deletion_requests_select_own"
    ON public.account_deletion_requests FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================================================
-- 5. GÜVENLİ YASAL OLAY KAYIT RPC FONKSİYONU (Append-only)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.record_user_legal_event(
    p_document_id UUID,
    p_event_type TEXT,
    p_source TEXT,
    p_app_version VARCHAR DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_doc_version VARCHAR(30);
    v_new_event_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Yetkisiz erişim: Oturum açmış kullanıcı bulunamadı.';
    END IF;

    SELECT version INTO v_doc_version
    FROM public.legal_documents
    WHERE id = p_document_id AND is_active = true;

    IF v_doc_version IS NULL THEN
        RAISE EXCEPTION 'Geçersiz veya aktif olmayan yasal belge.';
    END IF;

    INSERT INTO public.user_legal_events (
        user_id,
        document_id,
        event_type,
        event_at,
        document_version,
        source,
        app_version
    ) VALUES (
        v_user_id,
        p_document_id,
        p_event_type,
        NOW(),
        v_doc_version,
        p_source,
        p_app_version
    ) RETURNING id INTO v_new_event_id;

    RETURN v_new_event_id;
END;
$$;
