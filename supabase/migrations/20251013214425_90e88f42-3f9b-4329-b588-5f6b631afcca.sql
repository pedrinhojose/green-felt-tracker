-- Create table for jackpot distributions
CREATE TABLE public.season_jackpot_distributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL,
  player_id uuid NOT NULL,
  player_name text NOT NULL,
  position integer NOT NULL,
  percentage numeric NOT NULL,
  prize_amount numeric NOT NULL,
  total_jackpot numeric NOT NULL,
  distributed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  organization_id uuid,
  user_id uuid NOT NULL
);

-- Enable RLS
ALTER TABLE public.season_jackpot_distributions ENABLE ROW LEVEL SECURITY;

-- Users can view distributions from their organization
CREATE POLICY "Users can view distributions from their organization"
  ON public.season_jackpot_distributions FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid()
  ));

-- Users can create distributions in their organization
CREATE POLICY "Users can create distributions in their organization"
  ON public.season_jackpot_distributions FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    ) AND auth.uid() = user_id
  );

-- Public access to shared season distributions
CREATE POLICY "Public access to distributions from shared seasons"
  ON public.season_jackpot_distributions FOR SELECT
  USING (
    season_id IN (
      SELECT id FROM seasons WHERE public_share_token IS NOT NULL
    )
  );

-- Create index for better query performance
CREATE INDEX idx_jackpot_distributions_season_id ON public.season_jackpot_distributions(season_id);
CREATE INDEX idx_jackpot_distributions_player_id ON public.season_jackpot_distributions(player_id);