
import { useState } from 'react';
import { RankingEntry } from '../lib/db/models';
import { pokerDB } from '../lib/db';

export function useRankingFunctions() {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  
  const updateRankings = async (seasonId?: string) => {
    if (!seasonId) return;
    
    try {
      console.log("Atualizando rankings para temporada:", seasonId);
      
      // Buscar rankings do banco
      const rankingsData = await pokerDB.getRankings(seasonId);
      console.log("Rankings recuperados:", rankingsData.length);
      
      // Buscar jogadores atualizados para sincronizar fotos
      const freshPlayers = await pokerDB.getPlayers();
      
      // Sincronizar fotos dos rankings com dados atualizados dos jogadores
      const syncedRankings = rankingsData.map(ranking => {
        const player = freshPlayers.find(p => p.id === ranking.playerId);
        
        if (player && player.photoUrl !== ranking.photoUrl) {
          console.log(`Sincronizando foto do jogador ${player.name} no ranking`);
          
          // Salvar ranking atualizado no banco de forma assíncrona
          const updatedRanking = {
            ...ranking,
            photoUrl: player.photoUrl,
            playerName: player.name
          };
          
          // Não esperar para não bloquear a UI
          pokerDB.saveRanking(updatedRanking).catch(error => 
            console.error("Erro ao salvar ranking sincronizado:", error)
          );
          
          return updatedRanking;
        }
        
        return ranking;
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
