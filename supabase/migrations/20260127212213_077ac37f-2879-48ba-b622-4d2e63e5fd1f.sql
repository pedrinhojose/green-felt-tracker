-- Habilitar extensao pgcrypto para funcoes de criptografia
-- Necessario para: gen_salt(), crypt()
-- Usado em: create_apahub_access_key, verify_apahub_login

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;