
CREATE TABLE IF NOT EXISTS public.game_player_settlements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','a_receber','pago','premiado_pago')),
  payment_method TEXT,
  settled_at TIMESTAMPTZ,
  settled_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (game_id, player_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_player_settlements TO authenticated;
GRANT ALL ON public.game_player_settlements TO service_role;

ALTER TABLE public.game_player_settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view settlements"
  ON public.game_player_settlements FOR SELECT TO authenticated
  USING (public.user_can_access_organization(organization_id));

CREATE POLICY "Admins insert settlements"
  ON public.game_player_settlements FOR INSERT TO authenticated
  WITH CHECK (public.user_can_admin_organization(organization_id));

CREATE POLICY "Admins update settlements"
  ON public.game_player_settlements FOR UPDATE TO authenticated
  USING (public.user_can_admin_organization(organization_id))
  WITH CHECK (public.user_can_admin_organization(organization_id));

CREATE POLICY "Admins delete settlements"
  ON public.game_player_settlements FOR DELETE TO authenticated
  USING (public.user_can_admin_organization(organization_id));

CREATE OR REPLACE FUNCTION public.update_settlements_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_update_settlements_updated_at ON public.game_player_settlements;
CREATE TRIGGER trg_update_settlements_updated_at
  BEFORE UPDATE ON public.game_player_settlements
  FOR EACH ROW EXECUTE FUNCTION public.update_settlements_updated_at();

CREATE INDEX IF NOT EXISTS idx_settlements_org ON public.game_player_settlements(organization_id);
CREATE INDEX IF NOT EXISTS idx_settlements_game ON public.game_player_settlements(game_id);

ALTER TABLE public.game_player_settlements REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'game_player_settlements'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.game_player_settlements';
  END IF;
END $$;
