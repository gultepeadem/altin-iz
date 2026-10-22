-- Altın İz - Migration 003: Gold Product and Price Tables
-- Referans: docs/DATABASE.md Bölüm 7

-- 1. gold_products Tablosu
CREATE TABLE IF NOT EXISTS public.gold_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(50),
    category TEXT NOT NULL CHECK (category IN ('gram', 'coin', 'karat', 'international', 'packaged')),
    measurement_unit TEXT NOT NULL CHECK (measurement_unit IN ('piece', 'gram', 'ounce')),
    quantity_precision SMALLINT NOT NULL CHECK (quantity_precision BETWEEN 0 AND 3),
    package_weight_grams NUMERIC(10,3) CHECK (package_weight_grams IS NULL OR package_weight_grams > 0),
    portfolio_enabled BOOLEAN NOT NULL DEFAULT true,
    calculator_enabled BOOLEAN NOT NULL DEFAULT true,
    price_display_enabled BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_gold_products_updated_at ON public.gold_products;
CREATE TRIGGER trg_gold_products_updated_at
    BEFORE UPDATE ON public.gold_products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_gold_products_display 
    ON public.gold_products (is_active, price_display_enabled, sort_order);

-- 2. price_sources Tablosu
CREATE TABLE IF NOT EXISTS public.price_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    website_url TEXT,
    timezone VARCHAR(50) NOT NULL DEFAULT 'Europe/Istanbul',
    expected_update_interval_seconds INTEGER CHECK (expected_update_interval_seconds IS NULL OR expected_update_interval_seconds > 0),
    priority SMALLINT NOT NULL DEFAULT 1 CHECK (priority > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_price_sources_updated_at ON public.price_sources;
CREATE TRIGGER trg_price_sources_updated_at
    BEFORE UPDATE ON public.price_sources
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 3. price_source_product_mappings Tablosu
CREATE TABLE IF NOT EXISTS public.price_source_product_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES public.price_sources(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES public.gold_products(id) ON DELETE RESTRICT,
    external_symbol VARCHAR(100) NOT NULL CHECK (char_length(btrim(external_symbol)) > 0),
    external_name VARCHAR(200),
    external_category VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_mapping_source_symbol UNIQUE (source_id, external_symbol),
    CONSTRAINT uq_mapping_source_product UNIQUE (source_id, product_id)
);

DROP TRIGGER IF EXISTS trg_mappings_updated_at ON public.price_source_product_mappings;
CREATE TRIGGER trg_mappings_updated_at
    BEFORE UPDATE ON public.price_source_product_mappings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_mapping_product 
    ON public.price_source_product_mappings (product_id);
CREATE INDEX IF NOT EXISTS idx_mapping_source_active 
    ON public.price_source_product_mappings (source_id, is_active);

-- 4. price_fetch_runs Tablosu
CREATE TABLE IF NOT EXISTS public.price_fetch_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES public.price_sources(id) ON DELETE RESTRICT,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('running', 'success', 'partial', 'failed')),
    products_received INTEGER NOT NULL DEFAULT 0 CHECK (products_received >= 0),
    products_saved INTEGER NOT NULL DEFAULT 0 CHECK (products_saved >= 0),
    products_rejected INTEGER NOT NULL DEFAULT 0 CHECK (products_rejected >= 0),
    error_code VARCHAR(100),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fetch_runs_source_time 
    ON public.price_fetch_runs (source_id, started_at DESC);

-- 5. gold_prices Tablosu
CREATE TABLE IF NOT EXISTS public.gold_prices (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.gold_products(id) ON DELETE RESTRICT,
    source_id UUID NOT NULL REFERENCES public.price_sources(id) ON DELETE RESTRICT,
    buy_price_minor BIGINT CHECK (buy_price_minor IS NULL OR buy_price_minor > 0),
    sell_price_minor BIGINT CHECK (sell_price_minor IS NULL OR sell_price_minor > 0),
    currency_code CHAR(3) NOT NULL DEFAULT 'TRY' CHECK (char_length(currency_code) = 3),
    price_unit TEXT NOT NULL CHECK (price_unit IN ('piece', 'gram', 'ounce')),
    daily_change_percent NUMERIC(10,4),
    day_low_minor BIGINT CHECK (day_low_minor IS NULL OR day_low_minor > 0),
    day_high_minor BIGINT CHECK (day_high_minor IS NULL OR day_high_minor > 0),
    source_price_at TIMESTAMPTZ NOT NULL,
    fetched_at TIMESTAMPTZ NOT NULL,
    fetch_run_id UUID REFERENCES public.price_fetch_runs(id) ON DELETE SET NULL,
    is_provider_stale BOOLEAN NOT NULL DEFAULT false,
    is_valid BOOLEAN NOT NULL DEFAULT true,
    validation_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_at_least_one_price CHECK (buy_price_minor IS NOT NULL OR sell_price_minor IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_gold_prices_product_time 
    ON public.gold_prices (product_id, source_price_at DESC);
CREATE INDEX IF NOT EXISTS idx_gold_prices_product_source_time 
    ON public.gold_prices (product_id, source_id, source_price_at DESC);
CREATE INDEX IF NOT EXISTS idx_gold_prices_source_fetch_time 
    ON public.gold_prices (source_id, fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_gold_prices_latest_valid 
    ON public.gold_prices (product_id, is_valid, source_price_at DESC) 
    WHERE is_valid = true;
