DROP FUNCTION IF EXISTS public.create_apahub_access_key(uuid, text, text, text);

CREATE OR REPLACE FUNCTION public.create_apahub_access_key(p_organization_id uuid, p_access_email text, p_password text, p_organization_name text)
 RETURNS TABLE(key_id uuid, key_organization_id uuid, key_access_email text, key_organization_name text, key_is_active boolean, key_created_at timestamp with time zone, key_updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  INSERT INTO public.apahub_access_keys AS ak (
    organization_id, access_email, password_hash, organization_name, created_by, updated_at
  )
  VALUES (
    p_organization_id, lower(p_access_email), v_password_hash, p_organization_name, v_user_id, now()
  )
  ON CONFLICT (organization_id) DO UPDATE SET
    access_email = EXCLUDED.access_email,
    password_hash = EXCLUDED.password_hash,
    organization_name = EXCLUDED.organization_name,
    updated_at = now();

  RETURN QUERY
  SELECT ak.id, ak.organization_id, ak.access_email, ak.organization_name, ak.is_active, ak.created_at, ak.updated_at
  FROM public.apahub_access_keys ak
  WHERE ak.organization_id = p_organization_id;
END;
$function$;