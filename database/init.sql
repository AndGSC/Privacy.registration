CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id          UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at  TIMESTAMPTZ         NOT NULL DEFAULT now(),
    is_active   boolean             not null default true,
    consent_at TIMESTAMPTZ          not null
);