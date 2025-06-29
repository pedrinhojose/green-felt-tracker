
-- Atualizar a senha do usuário visitante existente para '123456'
UPDATE auth.users 
SET 
  encrypted_password = '$2a$10$kZv9P4Ug8VPK5AE4vNxCxOgQzGnwqOgIeQsqCpGLlgHZW.YpQu0BO',
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'visitante@apapoker.com';

-- Garantir que o perfil existe com as informações corretas
INSERT INTO public.profiles (id, username, full_name, avatar_url, created_at, updated_at, default_role)
SELECT u.id, 'visitante', 'Visitante', null, NOW(), NOW(), 'viewer'::app_role
FROM auth.users u
WHERE u.email = 'visitante@apapoker.com'
ON CONFLICT (id) DO UPDATE SET
  username = 'visitante',
  full_name = 'Visitante',
  default_role = 'viewer'::app_role,
  updated_at = NOW();

-- Garantir que tem a role de viewer
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'viewer'::app_role
FROM auth.users u
WHERE u.email = 'visitante@apapoker.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verificar se tudo está correto
SELECT 
  'Usuário atualizado' as status,
  u.id as user_id,
  u.email,
  u.email_confirmed_at IS NOT NULL as email_confirmado,
  p.username,
  p.default_role,
  array_agg(ur.role) as roles
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'visitante@apapoker.com'
GROUP BY u.id, u.email, u.email_confirmed_at, p.username, p.default_role;
