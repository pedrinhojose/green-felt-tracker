
import { useState } from 'react';
import { RankingEntry } from '../lib/db/models';
import { pokerDB } from '../lib/db/database';

export function useRankingFunctions() {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  
  const updateRankings = async (seasonId?: string) => {
    if (!seasonId) return;
    
    try {
      console.log("Atualizando rankings para temporada:", seasonId);
      const rankingsData = await pokerDB.getRankings(seasonId);
      console.log("Rankings recuperados:", rankingsData.length);
      setRankings(rankingsData);
      return rankingsData;
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
