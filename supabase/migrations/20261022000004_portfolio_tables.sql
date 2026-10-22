-- Altın İz - Migration 004: Portfolio Tables
-- Referans: docs/DATABASE.md Bölüm 8 & Bölüm 15.1 & Bölüm 16.1

-- 1. portfolio_entries Tablosu
CREATE TABLE IF NOT EXISTS public.portfolio_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.gold_products(id) ON DELETE RESTRICT,
    quantity NUMERIC(18,3) NOT NULL CHECK (quantity > 0),
    purchase_date DATE NOT NULL CHECK (purchase_date <= CURRENT_DATE),
    total_cost_minor BIGINT NOT NULL CHECK (total_cost_minor > 0),
    purchase_place VARCHAR(100),
    note VARCHAR(500),
    labor_included BOOLEAN,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_portfolio_entries_updated_at ON public.portfolio_entries;
CREATE TRIGGER trg_portfolio_entries_updated_at
    BEFORE UPDATE ON public.portfolio_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_portfolio_user 
    ON public.portfolio_entries (user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_user_date 
    ON public.portfolio_entries (user_id, purchase_date DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_user_created 
    ON public.portfolio_entries (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_product 
    ON public.portfolio_entries (product_id);
