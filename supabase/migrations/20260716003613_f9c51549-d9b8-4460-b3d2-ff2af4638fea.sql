
-- Garantir que contas de visitante não mantenham permissões antigas de admin/player
UPDATE public.organization_members om
SET role = 'viewer'
FROM auth.users u
WHERE om.user_id = u.id
  AND lower(u.email) = 'visitante@apapoker.com';

DELETE FROM public.user_roles ur
USING auth.users u
WHERE ur.user_id = u.id
  AND lower(u.email) = 'visitante@apapoker.com'
  AND ur.role IN ('admin', 'player');

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'viewer'::public.app_role
FROM auth.users u
WHERE lower(u.email) = 'visitante@apapoker.com'
ON CONFLICT (user_id, role) DO NOTHING;

UPDATE public.profiles p
SET default_role = 'viewer'::public.app_role,
    updated_at = now()
FROM auth.users u
WHERE p.id = u.id
  AND lower(u.email) = 'visitante@apapoker.com';

-- Garantir que as contas vinculadas às credenciais por clube sejam sempre viewer
UPDATE public.organization_members om
SET role = 'viewer'
FROM public.organization_viewer_keys vk
WHERE om.organization_id = vk.organization_id
  AND om.user_id = vk.viewer_user_id
  AND om.role <> 'viewer';

DELETE FROM public.user_roles ur
USING public.organization_viewer_keys vk
WHERE ur.user_id = vk.viewer_user_id
  AND ur.role IN ('admin', 'player');

INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT vk.viewer_user_id, 'viewer'::public.app_role
FROM public.organization_viewer_keys vk
ON CONFLICT (user_id, role) DO NOTHING;

UPDATE public.profiles p
SET default_role = 'viewer'::public.app_role,
    updated_at = now()
FROM public.organization_viewer_keys vk
WHERE p.id = vk.viewer_user_id;

-- Helper: usuário atual está usando uma conta de credencial de visitante?
CREATE OR REPLACE FUNCTION public.is_current_user_viewer_account()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_viewer_keys vk
    WHERE vk.viewer_user_id = auth.uid()
  );
$$;

-- Login de visitante só é válido se a credencial bate E o usuário vinculado continua como viewer no clube.
CREATE OR REPLACE FUNCTION public.verify_organization_viewer_login(
  p_email TEXT,
  p_password TEXT
)
RETURNS TABLE(
  organization_id UUID,
  viewer_user_id UUID,
  access_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT vk.organization_id, vk.viewer_user_id, vk.access_email
  FROM public.organization_viewer_keys vk
  JOIN public.organization_members om
    ON om.organization_id = vk.organization_id
   AND om.user_id = vk.viewer_user_id
   AND om.role = 'viewer'
  WHERE vk.access_email = lower(trim(p_email))
    AND vk.is_active = true
    AND vk.password_hash = extensions.crypt(p_password, vk.password_hash);
END;
$$;

-- Recriar policies restritivas de forma idempotente
DROP POLICY IF EXISTS "Block viewer updates on organizations" ON public.organizations;
CREATE POLICY "Block viewer updates on organizations"
  ON public.organizations AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (NOT public.is_viewer_of_organization(id))
  WITH CHECK (NOT public.is_viewer_of_organization(id));

DROP POLICY IF EXISTS "Block viewer inserts on organization_members" ON public.organization_members;
CREATE POLICY "Block viewer inserts on organization_members"
  ON public.organization_members AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (NOT public.is_viewer_of_organization(organization_id));

DROP POLICY IF EXISTS "Block viewer updates on organization_members" ON public.organization_members;
CREATE POLICY "Block viewer updates on organization_members"
  ON public.organization_members AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (NOT public.is_viewer_of_organization(organization_id))
  WITH CHECK (NOT public.is_viewer_of_organization(organization_id));

DROP POLICY IF EXISTS "Block viewer deletes on organization_members" ON public.organization_members;
CREATE POLICY "Block viewer deletes on organization_members"
  ON public.organization_members AS RESTRICTIVE
  FOR DELETE TO authenticated
  USING (NOT public.is_viewer_of_organization(organization_id));

DROP POLICY IF EXISTS "Block viewer account role changes" ON public.user_roles;
CREATE POLICY "Block viewer account role changes"
  ON public.user_roles AS RESTRICTIVE
  FOR ALL TO authenticated
  USING (NOT public.is_current_user_viewer_account())
  WITH CHECK (NOT public.is_current_user_viewer_account());

DROP POLICY IF EXISTS "Block viewer writes on apahub_access_keys" ON public.apahub_access_keys;
CREATE POLICY "Block viewer writes on apahub_access_keys"
  ON public.apahub_access_keys AS RESTRICTIVE
  FOR ALL TO authenticated
  USING (NOT public.is_viewer_of_organization(organization_id))
  WITH CHECK (NOT public.is_viewer_of_organization(organization_id));

DROP POLICY IF EXISTS "Block viewer writes on organization_viewer_keys" ON public.organization_viewer_keys;
CREATE POLICY "Block viewer writes on organization_viewer_keys"
  ON public.organization_viewer_keys AS RESTRICTIVE
  FOR ALL TO authenticated
  USING (NOT public.is_viewer_of_organization(organization_id))
  WITH CHECK (NOT public.is_viewer_of_organization(organization_id));
