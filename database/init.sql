CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id          UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at  TIMESTAMPTZ         NOT NULL DEFAULT now(),
    is_active   boolean             not null default true,
    consent_at TIMESTAMPTZ          not null
);


CREATE TABLE IF NOT EXISTS user_credentials (
    user_id         UUID                PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    password_hash   TEXT                NOT NULL,
    updated_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);


--enc indica encriptación
CREATE TABLE IF NOT EXISTS user_pii(
    user_id         UUID                PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name_enc   BYTEA               NOT NULL,
    email_enc       BYTEA               NOT NULL,
    email_lookup    BYTEA               NOT NULL UNIQUE,
    phone_enc       BYTEA
);