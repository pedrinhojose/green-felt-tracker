
-- 1. Allow multiple active seasons per org (remove any unique constraint on active seasons)
-- No unique constraint exists currently for is_active per org, but the app used to enforce
-- single-active in code. Nothing to drop at DB level for seasons.

-- 2. Make games.season_id nullable to support standalone games
ALTER TABLE public.games ALTER COLUMN season_id DROP NOT NULL;

-- 3. Add is_standalone column to flag avulsa games explicitly
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS is_standalone BOOLEAN NOT NULL DEFAULT false;

-- 4. Add a check: if is_standalone is true, season_id must be null, and vice-versa is allowed (legacy orphans)
ALTER TABLE public.games DROP CONSTRAINT IF EXISTS games_standalone_season_check;
ALTER TABLE public.games ADD CONSTRAINT games_standalone_season_check
  CHECK (NOT (is_standalone = true AND season_id IS NOT NULL));

-- 5. Index for querying standalone games per org
CREATE INDEX IF NOT EXISTS idx_games_org_standalone ON public.games(organization_id) WHERE is_standalone = true;
