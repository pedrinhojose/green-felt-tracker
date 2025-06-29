
-- Verificar se o usuário visitante existe e suas configurações
SELECT 
  'Status do usuário visitante' as info,
  u.id,
  u.email,
  u.email_confirmed_at IS NOT NULL as email_confirmado,
  u.encrypted_password IS NOT NULL as tem_senha,
  p.username,
  p.default_role,
  array_agg(ur.role) as roles
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'visitante@apapoker.com'
GROUP BY u.id, u.email, u.email_confirmed_at, u.encrypted_password, p.username, p.default_role;

-- Se não existir usuário, criar um novo
DO $$
DECLARE
    visitor_exists boolean;
BEGIN
    -- Verificar se o usuário existe
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'visitante@apapoker.com') INTO visitor_exists;
    
    IF NOT visitor_exists THEN
        -- Criar usuário visitante se não existir
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
            raw_user_meta_data
        ) VALUES (
            gen_random_uuid(),
            '00000000-0000-0000-0000-000000000000',
            'visitante@apapoker.com',
            '$2a$10$kZv9P4Ug8VPK5AE4vNxCxOgQzGnwqOgIeQsqCpGLlgHZW.YpQu0BO',
            NOW(),
            NOW(),
            NOW(),
            'authenticated',
            'authenticated',
            '{}',
            '{"full_name": "Visitante", "username": "visitante"}'
        );
        
        RAISE NOTICE 'Usuário visitante criado com sucesso';
    ELSE
        -- Atualizar senha se já existir
        UPDATE auth.users 
        SET 
            encrypted_password = '$2a$10$kZv9P4Ug8VPK5AE4vNxCxOgQzGnwqOgIeQsqCpGLlgHZW.YpQu0BO',
            email_confirmed_at = NOW(),
            updated_at = NOW()
        WHERE email = 'visitante@apapoker.com';
        
        RAISE NOTICE 'Senha do usuário visitante atualizada';
    END IF;
END $$;

-- Garantir perfil e roles
INSERT INTO public.profiles (id, username, full_name, avatar_url, created_at, updated_at, default_role)
SELECT u.id, 'visitante', 'Visitante', null, NOW(), NOW(), 'viewer'::app_role
FROM auth.users u
WHERE u.email = 'visitante@apapoker.com'
ON CONFLICT (id) DO UPDATE SET
    username = 'visitante',
    full_name = 'Visitante',
    default_role = 'viewer'::app_role,
    updated_at = NOW();

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'viewer'::app_role
FROM auth.users u
WHERE u.email = 'visitante@apapoker.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verificação final
SELECT 
    'Verificação final' as status,
    u.id,
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmado,
    u.encrypted_password IS NOT NULL as tem_senha,
    p.username,
    p.default_role,
    array_agg(ur.role) as roles
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'visitante@apapoker.com'
GROUP BY u.id, u.email, u.email_confirmed_at, u.encrypted_password, p.username, p.default_role;
