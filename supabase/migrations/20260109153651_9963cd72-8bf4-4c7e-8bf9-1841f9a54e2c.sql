-- Dropar funções existentes (CASCADE para remover dependências)
DROP FUNCTION IF EXISTS public.get_user_organizations(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;

-- Recriar função get_user_organizations com parâmetro corrigido
CREATE FUNCTION public.get_user_organizations(p_user_id uuid)
RETURNS TABLE(organization_id uuid, name text, role text)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    o.id as organization_id,
    o.name,
    om.role
  FROM 
    public.organizations o
    JOIN public.organization_members om ON o.id = om.organization_id
  WHERE 
    om.user_id = p_user_id;
$$;

-- Recriar função has_role com parâmetros corrigidos
CREATE FUNCTION public.has_role(p_user_id uuid, p_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = p_user_id
    AND role = p_role
  );
$$;

-- Recriar policy que foi removida pelo CASCADE
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));