-- Clean orphaned eliminations from season '2ª Temporada 2025'
DELETE FROM eliminations 
WHERE game_id NOT IN (
  SELECT id FROM games 
  WHERE season_id = (
    SELECT id FROM seasons 
    WHERE name = '2ª Temporada 2025' AND is_active = true
  )
)
AND game_id IN (
  SELECT DISTINCT game_id FROM eliminations 
  WHERE game_id NOT IN (SELECT id FROM games)
);

-- Update game #7 to #6 for the active season
UPDATE games 
SET number = 6 
WHERE number = 7 
AND season_id = (
  SELECT id FROM seasons 
  WHERE name = '2ª Temporada 2025' AND is_active = true
);