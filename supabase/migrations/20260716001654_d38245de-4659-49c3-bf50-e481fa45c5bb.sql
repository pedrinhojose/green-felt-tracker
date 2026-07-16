
DROP FUNCTION IF EXISTS public.create_organization_viewer_key(uuid, text, text, uuid);

CREATE FUNCTION public.create_organization_viewer_key(
  p_organization_id UUID,
  p_access_email TEXT,
  p_password TEXT,
  p_viewer_user_id UUID
)
RETURNS TABLE(
  key_id UUID,
  key_organization_id UUID,
  key_access_email TEXT,
  key_is_active BOOLEAN,
  key_created_at TIMESTAMPTZ,
  key_updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_password_hash TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  IF NOT public.user_can_admin_organization(p_organization_id) THEN
    RAISE EXCEPTION 'User must be admin of the organization';
  END IF;

  v_password_hash := extensions.crypt(p_password, extensions.gen_salt('bf'));

  INSERT INTO public.organization_viewer_keys (
    organization_id,
    access_email,
    password_hash,
    viewer_user_id,
    created_by,
    updated_at
  )
  VALUES (
    p_organization_id,
    lower(p_access_email),
    v_password_hash,
    p_viewer_user_id,
    v_user_id,
    now()
  )
  ON CONFLICT (organization_id) DO UPDATE SET
    access_email = EXCLUDED.access_email,
    password_hash = EXCLUDED.password_hash,
    viewer_user_id = EXCLUDED.viewer_user_id,
    is_active = true,
    updated_at = now();

  RETURN QUERY
  SELECT vk.id, vk.organization_id, vk.access_email, vk.is_active, vk.created_at, vk.updated_at
  FROM public.organization_viewer_keys vk
  WHERE vk.organization_id = p_organization_id;
END;
$$;
