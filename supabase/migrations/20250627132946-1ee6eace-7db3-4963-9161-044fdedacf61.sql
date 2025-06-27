
-- Desabilitar o trigger temporariamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Função para limpar completamente o usuário visitante
DO $$
DECLARE
    visitor_ids uuid[];
    visitor_id uuid;
BEGIN
    -- Coletar todos os IDs relacionados ao visitante
    SELECT ARRAY(
        SELECT id FROM auth.users WHERE email = 'visitante@apapoker.com'
        UNION
        SELECT id FROM public.profiles WHERE username = 'visitante'
        UNION
        SELECT '11111111-1111-1111-1111-111111111111'::uuid
    ) INTO visitor_ids;
    
    -- Limpar todos os registros relacionados
    FOREACH visitor_id IN ARRAY visitor_ids
    LOOP
        DELETE FROM public.user_roles WHERE user_id = visitor_id;
        DELETE FROM public.profiles WHERE id = visitor_id;
        DELETE FROM auth.users WHERE id = visitor_id;
    END LOOP;
END $$;

-- Aguardar para garantir que a limpeza foi processada
SELECT pg_sleep(1);

-- Criar o usuário visitante
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  aud,
  role,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change_token_new,
  email_change_token_current,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'visitante@apapoker.com',
  '$2a$10$kZv9P4Ug8VPK5AE4vNxCxOgQzGnwqOgIeQsqCpGLlgHZW.YpQu0BO', -- senha: 123456
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '{}',
  '{"full_name": "Visitante", "username": "visitante"}',
  false,
  '',
  '',
  '',
  ''
);

-- Criar perfil apenas se não existir
INSERT INTO public.profiles (id, username, full_name, avatar_url, created_at, updated_at, default_role)
SELECT u.id, 'visitante', 'Visitante', null, NOW(), NOW(), 'viewer'::app_role
FROM auth.users u
WHERE u.email = 'visitante@apapoker.com'
AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- Adicionar role apenas se não existir
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'viewer'::app_role
FROM auth.users u
WHERE u.email = 'visitante@apapoker.com'
AND NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id AND ur.role = 'viewer');

-- Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.create_profile_for_user();
