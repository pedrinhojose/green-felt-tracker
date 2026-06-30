
import { useState } from 'react';
import { RankingEntry } from '../lib/db/models';
import { pokerDB } from '../lib/db';

export function useRankingFunctions() {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  
  const updateRankings = async (seasonId?: string) => {
    if (!seasonId) {
      const active = await pokerDB.getActiveSeason();
      if (!active) return;
      seasonId = active.id;
    }
    try {
      console.log("Atualizando rankings para temporada:", seasonId);
      
      // Buscar rankings do banco
      const rankingsData = await pokerDB.getRankings(seasonId);
      console.log("Rankings recuperados:", rankingsData.length);
      
      // Buscar jogadores atualizados para sincronizar fotos
      const freshPlayers = await pokerDB.getPlayers();

      // Calcular quebra (posição vs eliminação) a partir dos jogos finalizados
      const season = await pokerDB.getSeason(seasonId);
      const scoreSchema = season?.scoreSchema ?? [];
      const games = await pokerDB.getGames(seasonId);
      const breakdownByPlayer: Record<string, { pos: number; elim: number }> = {};
      games.filter(g => g.isFinished).forEach(game => {
        game.players.forEach(gp => {
          const total = (typeof gp.points === 'number' && !Number.isNaN(gp.points))
            ? gp.points
            : (scoreSchema.find((e: any) => e.position === gp.position)?.points ?? 0);
          const elim = (typeof gp.pointsFromEliminations === 'number') ? gp.pointsFromEliminations : 0;
          const pos = (typeof gp.pointsFromPosition === 'number')
            ? gp.pointsFromPosition
            : Math.max(0, total - elim);
          const acc = breakdownByPlayer[gp.playerId] || { pos: 0, elim: 0 };
          acc.pos += pos;
          acc.elim += elim;
          breakdownByPlayer[gp.playerId] = acc;
        });
      });
      
      // Sincronizar fotos dos rankings com dados atualizados dos jogadores
      const syncedRankings = rankingsData.map(ranking => {
        const player = freshPlayers.find(p => p.id === ranking.playerId);
        const bd = breakdownByPlayer[ranking.playerId];
        const enriched = {
          ...ranking,
          pointsFromPosition: bd ? bd.pos : ranking.totalPoints,
          pointsFromEliminations: bd ? bd.elim : 0,
        };
        
        if (player && player.photoUrl !== ranking.photoUrl) {
          console.log(`Sincronizando foto do jogador ${player.name} no ranking`);
          
          const updatedRanking = {
            ...enriched,
            photoUrl: player.photoUrl,
            playerName: player.name
          };
          
          // Não esperar para não bloquear a UI
          pokerDB.saveRanking(updatedRanking).catch(error => 
            console.error("Erro ao salvar ranking sincronizado:", error)
          );
          
          return updatedRanking;
        }
        
        return enriched;
      });
      
      setRankings(syncedRankings);
      
      const photosCount = syncedRankings.filter(r => r.photoUrl).length;
      console.log(`Rankings atualizados com ${photosCount} fotos de ${syncedRankings.length} jogadores`);
      
      return syncedRankings;
    } catch (error) {
      console.error("Erro ao atualizar rankings:", error);
      return [];
    }
  };
  
  return {
    rankings,
    setRankings,
    updateRankings
  };
}
