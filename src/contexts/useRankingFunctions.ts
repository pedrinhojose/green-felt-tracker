
import { useState } from 'react';
import { RankingEntry } from '../lib/db/models';
import { pokerDB } from '../lib/db/database';

export function useRankingFunctions() {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  
  const updateRankings = async (seasonId?: string) => {
    if (!seasonId) return;
    
    const rankingsData = await pokerDB.getRankings(seasonId);
    setRankings(rankingsData);
    return rankingsData;
  };
  
  return {
    rankings,
    setRankings,
    updateRankings
  };
}
