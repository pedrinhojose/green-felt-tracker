
-- Remove overly permissive "Visitante can view all X" policies (USING true)
DROP POLICY IF EXISTS "Visitante can view all games" ON public.games;
DROP POLICY IF EXISTS "Visitante can view all players" ON public.players;
DROP POLICY IF EXISTS "Visitante can view all seasons" ON public.seasons;
DROP POLICY IF EXISTS "Visitante can view all rankings" ON public.rankings;
DROP POLICY IF EXISTS "Visitante can view all eliminations" ON public.eliminations;
DROP POLICY IF EXISTS "Public access to eliminations" ON public.eliminations;

-- Ensure org-scoped SELECT policies exist (viewer role is a member of the org
-- via organization_members, so it continues to read only its own club data).

-- Public shared links: allow anon SELECT only when the parent season/game
-- exposes a public_share_token.

-- games: already has "Public access to shared games" (public_share_token IS NOT NULL)
-- (kept as-is)

-- seasons: already has "Public access to shared seasons" (kept)

-- rankings: expose only when the related season has a public_share_token
DROP POLICY IF EXISTS "Public access to rankings from shared seasons" ON public.rankings;
CREATE POLICY "Public access to rankings from shared seasons"
ON public.rankings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.seasons s
    WHERE s.id = rankings.season_id
      AND s.public_share_token IS NOT NULL
  )
);

-- players: expose only when a shared game references the player
DROP POLICY IF EXISTS "Public access to players in shared games" ON public.players;
CREATE POLICY "Public access to players in shared games"
ON public.players
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.games g
    WHERE g.public_share_token IS NOT NULL
      AND g.players @> jsonb_build_array(jsonb_build_object('playerId', players.id::text))
  )
);

-- eliminations: expose only when the related game is shared
DROP POLICY IF EXISTS "Public access to eliminations from shared games" ON public.eliminations;
CREATE POLICY "Public access to eliminations from shared games"
ON public.eliminations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.games g
    WHERE g.id = eliminations.game_id
      AND g.public_share_token IS NOT NULL
  )
);
