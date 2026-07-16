
-- 1. Novo valor no enum (usado apenas via texto neste migration, para funcionar dentro da tx)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

-- 2. Novos campos em organizations
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS plan_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS is_blocked boolean NOT NULL DEFAULT false;

-- 3. Helper is_super_admin (compara via texto para evitar dependência do enum na mesma tx)
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text = 'super_admin'
  );
$$;

-- 4. RLS: super admin enxerga/edita/exclui qualquer organização
DROP POLICY IF EXISTS "Super admin can view all organizations" ON public.organizations;
CREATE POLICY "Super admin can view all organizations"
ON public.organizations FOR SELECT
USING (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admin can update all organizations" ON public.organizations;
CREATE POLICY "Super admin can update all organizations"
ON public.organizations FOR UPDATE
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admin can delete organizations" ON public.organizations;
CREATE POLICY "Super admin can delete organizations"
ON public.organizations FOR DELETE
USING (public.is_super_admin(auth.uid()));

-- 5. Função do dashboard do Super Admin
CREATE OR REPLACE FUNCTION public.get_super_admin_dashboard()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT jsonb_build_object(
    'totalClubs', (SELECT COUNT(*) FROM public.organizations),
    'totalActivePlayers', (SELECT COUNT(*) FROM public.players WHERE is_active = true),
    'totalAdmins', (SELECT COUNT(DISTINCT user_id) FROM public.organization_members WHERE role = 'admin'),
    'clubs', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', o.id,
          'name', o.name,
          'created_at', o.created_at,
          'subscription_plan', o.subscription_plan,
          'plan_status', o.plan_status,
          'is_blocked', o.is_blocked,
          'player_count', (
            SELECT COUNT(*) FROM public.players p
            WHERE p.organization_id = o.id AND p.is_active = true
          ),
          'admin_count', (
            SELECT COUNT(*) FROM public.organization_members m
            WHERE m.organization_id = o.id AND m.role = 'admin'
          ),
          'last_admin_sign_in', (
            SELECT MAX(u.last_sign_in_at)
            FROM public.organization_members m
            JOIN auth.users u ON u.id = m.user_id
            WHERE m.organization_id = o.id AND m.role = 'admin'
          )
        )
        ORDER BY o.created_at DESC
      )
      FROM public.organizations o
    ), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- 6. Função para o super admin alterar status/plano/bloqueio
CREATE OR REPLACE FUNCTION public.super_admin_set_organization_status(
  p_organization_id uuid,
  p_plan_status text DEFAULT NULL,
  p_is_blocked boolean DEFAULT NULL,
  p_subscription_plan text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.organizations
  SET
    plan_status = COALESCE(p_plan_status, plan_status),
    is_blocked = COALESCE(p_is_blocked, is_blocked),
    subscription_plan = COALESCE(p_subscription_plan, subscription_plan),
    updated_at = now()
  WHERE id = p_organization_id;
END;
$$;
