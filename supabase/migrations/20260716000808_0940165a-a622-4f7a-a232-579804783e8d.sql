
-- 1. Tabela de credenciais de visitante por organização
CREATE TABLE IF NOT EXISTS public.organization_viewer_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  access_email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  viewer_user_id UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_viewer_keys TO authenticated;
GRANT ALL ON public.organization_viewer_keys TO service_role;

ALTER TABLE public.organization_viewer_keys ENABLE ROW LEVEL SECURITY;

-- Apenas admins do clube leem/gerenciam a credencial
CREATE POLICY "Admins can view org viewer keys"
  ON public.organization_viewer_keys FOR SELECT
  TO authenticated
  USING (public.user_can_admin_organization(organization_id));

CREATE POLICY "Admins can insert org viewer keys"
  ON public.organization_viewer_keys FOR INSERT
  TO authenticated
  WITH CHECK (public.user_can_admin_organization(organization_id));

CREATE POLICY "Admins can update org viewer keys"
  ON public.organization_viewer_keys FOR UPDATE
  TO authenticated
  USING (public.user_can_admin_organization(organization_id))
  WITH CHECK (public.user_can_admin_organization(organization_id));

CREATE POLICY "Admins can delete org viewer keys"
  ON public.organization_viewer_keys FOR DELETE
  TO authenticated
  USING (public.user_can_admin_organization(organization_id));

-- Trigger de updated_at
CREATE OR REPLACE FUNCTION public.update_organization_viewer_keys_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_org_viewer_keys_updated_at ON public.organization_viewer_keys;
CREATE TRIGGER trg_update_org_viewer_keys_updated_at
  BEFORE UPDATE ON public.organization_viewer_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_organization_viewer_keys_updated_at();

-- 2. Função helper: usuário é viewer da organização?
CREATE OR REPLACE FUNCTION public.is_viewer_of_organization(org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = auth.uid()
      AND organization_id = org_id
      AND role = 'viewer'
  );
$$;

-- 3. Funções de gestão da credencial (admin only)
CREATE OR REPLACE FUNCTION public.create_organization_viewer_key(
  p_organization_id UUID,
  p_access_email TEXT,
  p_password TEXT,
  p_viewer_user_id UUID
)
RETURNS TABLE(
  id UUID,
  organization_id UUID,
  access_email TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
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
    access_email = lower(p_access_email),
    password_hash = v_password_hash,
    viewer_user_id = p_viewer_user_id,
    is_active = true,
    updated_at = now();

  RETURN QUERY
  SELECT vk.id, vk.organization_id, vk.access_email, vk.is_active, vk.created_at, vk.updated_at
  FROM public.organization_viewer_keys vk
  WHERE vk.organization_id = p_organization_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_organization_viewer_password(
  p_organization_id UUID,
  p_new_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_password_hash TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  IF NOT public.user_can_admin_organization(p_organization_id) THEN
    RAISE EXCEPTION 'User must be admin of the organization';
  END IF;

  v_password_hash := extensions.crypt(p_new_password, extensions.gen_salt('bf'));

  UPDATE public.organization_viewer_keys
  SET password_hash = v_password_hash,
      updated_at = now()
  WHERE organization_id = p_organization_id;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.toggle_organization_viewer_key(p_organization_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_status BOOLEAN;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  IF NOT public.user_can_admin_organization(p_organization_id) THEN
    RAISE EXCEPTION 'User must be admin of the organization';
  END IF;

  UPDATE public.organization_viewer_keys
  SET is_active = NOT is_active,
      updated_at = now()
  WHERE organization_id = p_organization_id
  RETURNING is_active INTO v_new_status;

  RETURN v_new_status;
END;
$$;

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
  WHERE vk.access_email = lower(p_email)
    AND vk.is_active = true
    AND vk.password_hash = extensions.crypt(p_password, vk.password_hash);
END;
$$;

-- 4. Trava global: viewers NÃO podem escrever em nenhuma tabela do clube
-- (policies restritivas — ANDed com as permissivas existentes)

CREATE POLICY "Block viewer writes on players"
  ON public.players AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (NOT public.is_viewer_of_organization(organization_id));
CREATE POLICY "Block viewer updates on players"
  ON public.players AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (NOT public.is_viewer_of_organization(organization_id))
  WITH CHECK (NOT public.is_viewer_of_organization(organization_id));
CREATE POLICY "Block viewer deletes on players"
  ON public.players AS RESTRICTIVE
  FOR DELETE TO authenticated
  USING (NOT public.is_viewer_of_organization(organization_id));

CREATE POLICY "Block viewer writes on seasons"
  ON public.seasons AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (NOT public.is_viewer_of_organization(organization_id));
CREATE POLICY "Block viewer updates on seasons"
  ON public.seasons AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (NOT public.is_viewer_of_organization(organization_id))
  WITH CHECK (NOT public.is_viewer_of_organization(organization_id));
CREATE POLICY "Block viewer deletes on seasons"
  ON public.seasons AS RESTRICTIVE
  FOR DELETE TO authenticated
  USING (NOT public.is_viewer_of_organization(organization_id));

CREATE POLICY "Block viewer writes on games"
  ON public.games AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (NOT public.is_viewer_of_organization(organization_id));
CREATE POLICY "Block viewer updates on games"
  ON public.games AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (NOT public.is_viewer_of_organization(organization_id))
  WITH CHECK (NOT public.is_viewer_of_organization(organization_id));
CREATE POLICY "Block viewer deletes on games"
  ON public.games AS RESTRICTIVE
  FOR DELETE TO authenticated
  USING (NOT public.is_viewer_of_organization(organization_id));

CREATE POLICY "Block viewer writes on rankings"
  ON public.rankings AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (NOT public.is_viewer_of_organization(organization_id));
CREATE POLICY "Block viewer updates on rankings"
  ON public.rankings AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (NOT public.is_viewer_of_organization(organization_id))
  WITH CHECK (NOT public.is_viewer_of_organization(organization_id));
CREATE POLICY "Block viewer deletes on rankings"
  ON public.rankings AS RESTRICTIVE
  FOR DELETE TO authenticated
  USING (NOT public.is_viewer_of_organization(organization_id));

CREATE POLICY "Block viewer writes on eliminations"
  ON public.eliminations AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (NOT public.is_viewer_of_organization(organization_id));
CREATE POLICY "Block viewer updates on eliminations"
  ON public.eliminations AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (NOT public.is_viewer_of_organization(organization_id))
  WITH CHECK (NOT public.is_viewer_of_organization(organization_id));
CREATE POLICY "Block viewer deletes on eliminations"
  ON public.eliminations AS RESTRICTIVE
  FOR DELETE TO authenticated
  USING (NOT public.is_viewer_of_organization(organization_id));

CREATE POLICY "Block viewer writes on caixinha_transactions"
  ON public.caixinha_transactions AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (NOT public.is_viewer_of_organization(organization_id));
CREATE POLICY "Block viewer updates on caixinha_transactions"
  ON public.caixinha_transactions AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (NOT public.is_viewer_of_organization(organization_id))
  WITH CHECK (NOT public.is_viewer_of_organization(organization_id));
CREATE POLICY "Block viewer deletes on caixinha_transactions"
  ON public.caixinha_transactions AS RESTRICTIVE
  FOR DELETE TO authenticated
  USING (NOT public.is_viewer_of_organization(organization_id));

CREATE POLICY "Block viewer writes on club_fund_transactions"
  ON public.club_fund_transactions AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (NOT public.is_viewer_of_organization(organization_id));
CREATE POLICY "Block viewer updates on club_fund_transactions"
  ON public.club_fund_transactions AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (NOT public.is_viewer_of_organization(organization_id))
  WITH CHECK (NOT public.is_viewer_of_organization(organization_id));
CREATE POLICY "Block viewer deletes on club_fund_transactions"
  ON public.club_fund_transactions AS RESTRICTIVE
  FOR DELETE TO authenticated
  USING (NOT public.is_viewer_of_organization(organization_id));

CREATE POLICY "Block viewer writes on season_jackpot_distributions"
  ON public.season_jackpot_distributions AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (NOT public.is_viewer_of_organization(organization_id));
CREATE POLICY "Block viewer updates on season_jackpot_distributions"
  ON public.season_jackpot_distributions AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (NOT public.is_viewer_of_organization(organization_id))
  WITH CHECK (NOT public.is_viewer_of_organization(organization_id));
CREATE POLICY "Block viewer deletes on season_jackpot_distributions"
  ON public.season_jackpot_distributions AS RESTRICTIVE
  FOR DELETE TO authenticated
  USING (NOT public.is_viewer_of_organization(organization_id));
