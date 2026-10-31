-- Define el estado inicial de la base de datos desde cero. Es idempotente.
-- Habilita pgcrypto y crea: users (datos generales y consentimiento),
-- user_credentials (hash de contraseña), user_pii (PII cifrada e índice ciego del correo)
-- y audit_log (eventos con detalles cifrados). Las migraciones no van aquí.

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

CREATE TABLE IF NOT EXISTS audit_log(
    id              BIGINT              GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         UUID                REFERENCES users(id) ON DELETE SET NULL,
    action          TEXT                NOT NULL,
    details_enc     BYTEA               ,
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);