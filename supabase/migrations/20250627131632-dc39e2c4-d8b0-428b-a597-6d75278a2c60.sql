
-- Corrigir o usuário visitante - definir todas as colunas de string como vazias
UPDATE auth.users 
SET 
  confirmation_token = '',
  email_change_token_new = '',
  email_change_token_current = '',
  recovery_token = '',
  email_change = '',
  phone_change = '',
  phone_change_token = ''
WHERE email = 'visitante@apapoker.com';

-- Verificar se o usuário foi atualizado corretamente
SELECT 
  email,
  confirmation_token,
  email_change_token_new,
  email_change_token_current,
  recovery_token,
  email_change,
  phone_change,
  phone_change_token
FROM auth.users 
WHERE email = 'visitante@apapoker.com';
