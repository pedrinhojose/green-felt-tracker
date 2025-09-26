-- Add new game frequency columns to seasons table
ALTER TABLE public.seasons 
ADD COLUMN game_frequency text CHECK (game_frequency IN ('daily', 'weekly', 'biweekly', 'monthly')) DEFAULT 'weekly',
ADD COLUMN games_per_period integer DEFAULT 1;

-- Migrate existing data based on games_per_week
UPDATE public.seasons 
SET 
  game_frequency = CASE 
    WHEN games_per_week = 1 THEN 'weekly'
    WHEN games_per_week = 2 THEN 'weekly'
    WHEN games_per_week = 3 THEN 'weekly'
    WHEN games_per_week >= 7 THEN 'daily'
    ELSE 'weekly'
  END,
  games_per_period = CASE 
    WHEN games_per_week >= 7 THEN 1
    ELSE games_per_week
  END;

-- Make the new columns not null after migration
ALTER TABLE public.seasons 
ALTER COLUMN game_frequency SET NOT NULL,
ALTER COLUMN games_per_period SET NOT NULL;