-- Altın İz - Migration 005: Legal, Privacy and Security Tables
-- Referans: docs/DATABASE.md Bölüm 10 & Bölüm 11

-- 1. legal_documents Tablosu
CREATE TABLE IF NOT EXISTS public.legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type TEXT NOT NULL CHECK (document_type IN ('kvkk_notice', 'privacy_policy', 'terms_of_use', 'data_retention', 'financial_disclaimer', 'explicit_consent')),
    version VARCHAR(30) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    requires_action BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ,
    effective_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_legal_type_version UNIQUE (document_type, version)
);

DROP TRIGGER IF EXISTS trg_legal_documents_updated_at ON public.legal_documents;
CREATE TRIGGER trg_legal_documents_updated_at
    BEFORE UPDATE ON public.legal_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 2. user_legal_events Tablosu
CREATE TABLE IF NOT EXISTS public.user_legal_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    document_id UUID NOT NULL REFERENCES public.legal_documents(id) ON DELETE RESTRICT,
    event_type TEXT NOT NULL CHECK (event_type IN ('presented', 'viewed', 'accepted', 'declined', 'withdrawn')),
    event_at TIMESTAMPTZ NOT NULL,
    document_version VARCHAR(30) NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('registration', 'settings', 'document_update', 'account_deletion')),
    app_version VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_legal_events_user_doc 
    ON public.user_legal_events (user_id, document_id);
CREATE INDEX IF NOT EXISTS idx_legal_events_user_time 
    ON public.user_legal_events (user_id, event_at DESC);

-- 3. account_deletion_requests Tablosu
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'identity_verification_required', 'processing', 'completed', 'failed', 'cancelled')),
    requested_at TIMESTAMPTZ NOT NULL,
    identity_verified_at TIMESTAMPTZ,
    processing_started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    failure_code VARCHAR(100),
    failure_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_account_deletion_updated_at ON public.account_deletion_requests;
CREATE TRIGGER trg_account_deletion_updated_at
    BEFORE UPDATE ON public.account_deletion_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_deletion_user_status 
    ON public.account_deletion_requests (user_id, status);

-- 4. security_events Tablosu
CREATE TABLE IF NOT EXISTS public.security_events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    event_at TIMESTAMPTZ NOT NULL,
    details JSONB,
    retention_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_user_time 
    ON public.security_events (user_id, event_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_severity_time 
    ON public.security_events (severity, event_at DESC);
