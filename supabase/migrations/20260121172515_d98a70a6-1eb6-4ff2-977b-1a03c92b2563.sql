-- Atualizar role do usuário para admin na organização ApaPoker
UPDATE public.organization_members
SET role = 'admin'
WHERE user_id = '4bb52e7e-c928-421d-9200-7d117355464c'
  AND organization_id = '3ae276b2-10af-49b5-a174-7d85b50f60f3';