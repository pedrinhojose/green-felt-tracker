-- Criar função para criar organização com admin em uma única transação
CREATE OR REPLACE FUNCTION public.create_organization_with_admin(
  p_name TEXT
)
RETURNS TABLE(id UUID, name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_user_id UUID := auth.uid();
BEGIN
  -- Validar que usuário está autenticado
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Criar organização
  INSERT INTO public.organizations (name)
  VALUES (p_name)
  RETURNING organizations.id INTO v_org_id;
  
  -- Adicionar usuário como admin
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (v_org_id, v_user_id, 'admin');
  
  -- Retornar dados da organização criada
  RETURN QUERY
  SELECT o.id, o.name
  FROM public.organizations o
  WHERE o.id = v_org_id;
END;
$$;