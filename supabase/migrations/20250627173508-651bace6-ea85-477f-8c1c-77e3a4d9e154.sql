
-- Corrigir o default_role do usuário visitante de 'player' para 'viewer'
UPDATE public.profiles
SET default_role = 'viewer'::app_role
WHERE id = (SELECT id FROM auth.users WHERE email = 'visitante@apapoker.com');

-- Verificar se a atualização foi aplicada corretamente
SELECT 
  p.id,
  p.username,
  p.full_name,
  p.default_role,
  array_agg(ur.role) as roles
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
WHERE p.id = (SELECT id FROM auth.users WHERE email = 'visitante@apapoker.com')
GROUP BY p.id, p.username, p.full_name, p.default_role;
