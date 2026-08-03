-- =========================================================
-- CASH GAME MODULE (fully isolated, prefix cash_)
-- Does not touch any existing tournament/ranking objects.
-- =========================================================

CREATE TYPE public.cash_table_status AS ENUM ('active', 'closed');
CREATE TYPE public.cash_session_status AS ENUM ('sitting', 'cashed_out');
CREATE TYPE public.cash_transaction_type AS ENUM ('buyin', 'rebuy', 'cashout');

-- ---------------------------------------------------------
-- 1) cash_tables
-- ---------------------------------------------------------
CREATE TABLE public.cash_tables (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by uuid,
  name text NOT NULL,
  game_variant text NOT NULL DEFAULT 'NLH',
  small_blind numeric NOT NULL DEFAULT 0,
  big_blind numeric NOT NULL DEFAULT 0,
  min_buyin numeric NOT NULL DEFAULT 0,
  max_buyin numeric NOT NULL DEFAULT 0,
  rake_percent numeric NOT NULL DEFAULT 0,
  rake_cap numeric NOT NULL DEFAULT 0,
  status public.cash_table_status NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  closed_at timestamp with time zone
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cash_tables TO authenticated;
GRANT ALL ON public.cash_tables TO service_role;
ALTER TABLE public.cash_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cash_tables_select_members"
ON public.cash_tables FOR SELECT TO authenticated
USING (public.user_can_access_organization(organization_id));

CREATE POLICY "cash_tables_insert_admins"
ON public.cash_tables FOR INSERT TO authenticated
WITH CHECK (
  public.user_can_admin_organization(organization_id)
  AND NOT public.is_current_user_viewer_account()
);

CREATE POLICY "cash_tables_update_admins"
ON public.cash_tables FOR UPDATE TO authenticated
USING (
  public.user_can_admin_organization(organization_id)
  AND NOT public.is_current_user_viewer_account()
)
WITH CHECK (
  public.user_can_admin_organization(organization_id)
  AND NOT public.is_current_user_viewer_account()
);

CREATE POLICY "cash_tables_delete_admins"
ON public.cash_tables FOR DELETE TO authenticated
USING (
  public.user_can_admin_organization(organization_id)
  AND NOT public.is_current_user_viewer_account()
);

-- ---------------------------------------------------------
-- 2) cash_players_sessions
-- ---------------------------------------------------------
CREATE TABLE public.cash_players_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  cash_table_id uuid NOT NULL REFERENCES public.cash_tables(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE RESTRICT,
  total_buyin numeric NOT NULL DEFAULT 0,
  cashout_amount numeric NOT NULL DEFAULT 0,
  status public.cash_session_status NOT NULL DEFAULT 'sitting',
  seat_number integer,
  notes text,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  left_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX cash_players_sessions_table_idx ON public.cash_players_sessions (cash_table_id);
CREATE INDEX cash_players_sessions_player_idx ON public.cash_players_sessions (player_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cash_players_sessions TO authenticated;
GRANT ALL ON public.cash_players_sessions TO service_role;
ALTER TABLE public.cash_players_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cash_sessions_select_members"
ON public.cash_players_sessions FOR SELECT TO authenticated
USING (public.user_can_access_organization(organization_id));

CREATE POLICY "cash_sessions_insert_admins"
ON public.cash_players_sessions FOR INSERT TO authenticated
WITH CHECK (
  public.user_can_admin_organization(organization_id)
  AND NOT public.is_current_user_viewer_account()
);

CREATE POLICY "cash_sessions_update_admins"
ON public.cash_players_sessions FOR UPDATE TO authenticated
USING (
  public.user_can_admin_organization(organization_id)
  AND NOT public.is_current_user_viewer_account()
)
WITH CHECK (
  public.user_can_admin_organization(organization_id)
  AND NOT public.is_current_user_viewer_account()
);

CREATE POLICY "cash_sessions_delete_admins"
ON public.cash_players_sessions FOR DELETE TO authenticated
USING (
  public.user_can_admin_organization(organization_id)
  AND NOT public.is_current_user_viewer_account()
);

-- ---------------------------------------------------------
-- 3) cash_transactions
-- ---------------------------------------------------------
CREATE TABLE public.cash_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES public.cash_players_sessions(id) ON DELETE CASCADE,
  cash_table_id uuid NOT NULL REFERENCES public.cash_tables(id) ON DELETE CASCADE,
  transaction_type public.cash_transaction_type NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  created_by uuid,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX cash_transactions_session_idx ON public.cash_transactions (session_id);
CREATE INDEX cash_transactions_table_idx ON public.cash_transactions (cash_table_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cash_transactions TO authenticated;
GRANT ALL ON public.cash_transactions TO service_role;
ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cash_transactions_select_members"
ON public.cash_transactions FOR SELECT TO authenticated
USING (public.user_can_access_organization(organization_id));

CREATE POLICY "cash_transactions_insert_admins"
ON public.cash_transactions FOR INSERT TO authenticated
WITH CHECK (
  public.user_can_admin_organization(organization_id)
  AND NOT public.is_current_user_viewer_account()
);

CREATE POLICY "cash_transactions_update_admins"
ON public.cash_transactions FOR UPDATE TO authenticated
USING (
  public.user_can_admin_organization(organization_id)
  AND NOT public.is_current_user_viewer_account()
)
WITH CHECK (
  public.user_can_admin_organization(organization_id)
  AND NOT public.is_current_user_viewer_account()
);

CREATE POLICY "cash_transactions_delete_admins"
ON public.cash_transactions FOR DELETE TO authenticated
USING (
  public.user_can_admin_organization(organization_id)
  AND NOT public.is_current_user_viewer_account()
);

-- ---------------------------------------------------------
-- updated_at triggers (new dedicated function, nothing existing touched)
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_cash_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER cash_tables_set_updated_at
BEFORE UPDATE ON public.cash_tables
FOR EACH ROW EXECUTE FUNCTION public.update_cash_updated_at();

CREATE TRIGGER cash_players_sessions_set_updated_at
BEFORE UPDATE ON public.cash_players_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_cash_updated_at();
