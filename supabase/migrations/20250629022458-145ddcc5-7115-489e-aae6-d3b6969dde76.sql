
-- Corrigir o usuário visitante - definir tokens como NULL
UPDATE auth.users 
SET 
  confirmation_token = NULL,
  email_change_token_new = NULL,
  email_change_token_current = NULL,
  recovery_token = NULL
WHERE email = 'visitante@apapoker.com';
