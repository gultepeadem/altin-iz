-- Altın İz - Migration 001: Extensions and Helpers
-- Referans: docs/DATABASE.md Bölüm 4 & Bölüm 17.2

-- 1. UUID ve Kripto Uzantıları
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Ortak updated_at Tetikleyici Fonksiyonu
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
