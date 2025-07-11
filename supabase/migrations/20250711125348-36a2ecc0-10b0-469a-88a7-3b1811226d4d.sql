-- Limpeza de rankings órfãos (jogadores que não existem mais)
-- Primeiro, vamos identificar e remover rankings de jogadores que foram excluídos
DELETE FROM rankings 
WHERE player_id NOT IN (
  SELECT id FROM players 
  WHERE players.organization_id = rankings.organization_id
);