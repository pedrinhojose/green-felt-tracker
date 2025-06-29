
-- Primeiro, vamos investigar e corrigir inconsistências nos dados
-- Verificar e limpar registros órfãos na tabela profiles
DELETE FROM public.profiles 
WHERE id NOT IN (SELECT id FROM auth.users);

-- Verificar e criar perfis para usuários que não têm perfil
INSERT INTO public.profiles (id, username, full_name, avatar_url, created_at, updated_at, default_role)
SELECT 
  u.id,
  u.raw_user_meta_data->>'username',
  u.raw_user_meta_data->>'full_name',
  u.raw_user_meta_data->>'avatar_url',
  NOW(),
  NOW(),
  'player'::app_role
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM public.profiles);

-- Remover o trigger existente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recriar a função do trigger com tratamento de conflitos
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Inserir perfil apenas se não existir (usar ON CONFLICT para evitar erros)
  INSERT INTO public.profiles (id, username, full_name, avatar_url, created_at, updated_at, default_role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW(),
    'player'::app_role
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Inserir role padrão apenas se não existir
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'player'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Se for o primeiro usuário, adicionar role de admin
  IF (SELECT COUNT(*) FROM auth.users) = 1 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.create_profile_for_user();

-- Verificar se tudo está correto
SELECT 
  'Users without profiles' as check_type,
  COUNT(*) as count
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
  'Profiles without users' as check_type,
  COUNT(*) as count
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL;
