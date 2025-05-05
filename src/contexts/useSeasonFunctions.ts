import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Season, FinancialParams, BlindLevel } from '../lib/db/models';
import { pokerDB } from '../lib/db';
import { useToast } from "@/components/ui/use-toast";

export function useSeasonFunctions() {
  const { toast } = useToast();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);

  const createSeason = async (seasonData: Partial<Season>) => {
    const now = new Date();
    
    // Set any existing active season to inactive
    if (activeSeason) {
      const updatedActiveSeason = { ...activeSeason, isActive: false };
      await pokerDB.saveSeason(updatedActiveSeason);
    }
    
    // Create default financial parameters if not provided
    const financialParams: FinancialParams = seasonData.financialParams || {
      buyIn: 15,
      rebuy: 15,
      addon: 15,
      jackpotContribution: 5,
    };
    
    // Create default blind structure if not provided
    const blindStructure: BlindLevel[] = seasonData.blindStructure || [
      {
        id: uuidv4(),
        level: 1,
        smallBlind: 25,
        bigBlind: 50,
        ante: 0,
        duration: 20,
        isBreak: false
      },
      {
        id: uuidv4(),
        level: 2,
        smallBlind: 50,
        bigBlind: 100,
        ante: 0,
        duration: 20,
        isBreak: false
      }
    ];
    
    // Create new season
    const newSeason: Season = {
      id: uuidv4(),
      name: seasonData.name || `Temporada ${seasons.length + 1}`,
      startDate: seasonData.startDate || now,
      gamesPerWeek: seasonData.gamesPerWeek || 1,
      isActive: true,
      scoreSchema: seasonData.scoreSchema || [
        { position: 1, points: 10 },
        { position: 2, points: 7 },
        { position: 3, points: 5 },
        { position: 4, points: 3 },
        { position: 5, points: 1 }
      ],
      weeklyPrizeSchema: seasonData.weeklyPrizeSchema || [
        { position: 1, percentage: 50 },
        { position: 2, percentage: 30 },
        { position: 3, percentage: 20 }
      ],
      seasonPrizeSchema: seasonData.seasonPrizeSchema || [
        { position: 1, percentage: 50 },
        { position: 2, percentage: 30 },
        { position: 3, percentage: 20 }
      ],
      financialParams: financialParams,
      blindStructure: blindStructure,
      jackpot: 0,
      createdAt: now,
    };
    
    const id = await pokerDB.saveSeason(newSeason);
    
    // Update state
    setSeasons(prev => [...prev, newSeason]);
    setActiveSeason(newSeason);
    
    return id;
  };

  const updateSeason = async (seasonData: Partial<Season>) => {
    if (!seasonData.id) {
      throw new Error('Season ID is required');
    }
    
    const existingSeason = await pokerDB.getSeason(seasonData.id);
    if (!existingSeason) {
      throw new Error('Season not found');
    }
    
    const updatedSeason = { ...existingSeason, ...seasonData };
    await pokerDB.saveSeason(updatedSeason);
    
    // Update local state
    setSeasons(prev => {
      const index = prev.findIndex(s => s.id === updatedSeason.id);
      if (index >= 0) {
        return [...prev.slice(0, index), updatedSeason, ...prev.slice(index + 1)];
      }
      return prev;
    });
    
    if (updatedSeason.isActive) {
      setActiveSeason(updatedSeason);
    } else if (activeSeason?.id === updatedSeason.id) {
      setActiveSeason(null);
    }
  };

  const endSeason = async (seasonId: string) => {
    const season = await pokerDB.getSeason(seasonId);
    if (!season) {
      throw new Error('Season not found');
    }
    
    // Get ranking to distribute jackpot
    const rankings = await pokerDB.getRankings(seasonId);
    const sortedRankings = rankings.sort((a, b) => b.totalPoints - a.totalPoints);
    
    // Distribute jackpot according to season prize schema
    for (let i = 0; i < Math.min(season.seasonPrizeSchema.length, sortedRankings.length); i++) {
      const position = season.seasonPrizeSchema[i].position;
      const percentage = season.seasonPrizeSchema[i].percentage;
      const rankEntry = sortedRankings.find(r => r.bestPosition === position);
      
      if (rankEntry) {
        // Calculate prize
        const prize = (season.jackpot * percentage) / 100;
        console.log(`Player ${rankEntry.playerName} wins ${prize} (${percentage}% of jackpot)`);
        // Could implement a transaction log here
      }
    }
    
    // Update season as inactive and set end date
    const updatedSeason = {
      ...season,
      isActive: false,
      endDate: new Date(),
      jackpot: 0 // Reset jackpot after distribution
    };
    
    await pokerDB.saveSeason(updatedSeason);
    
    // Update state
    setSeasons(prev => {
      const index = prev.findIndex(s => s.id === updatedSeason.id);
      return [...prev.slice(0, index), updatedSeason, ...prev.slice(index + 1)];
    });
    
    if (activeSeason?.id === seasonId) {
      setActiveSeason(null);
    }
    
    toast({
      title: "Temporada Encerrada",
      description: "A temporada foi encerrada e o jackpot foi distribuído.",
    });
  };

  return {
    seasons,
    setSeasons,
    activeSeason,
    setActiveSeason,
    createSeason,
    updateSeason,
    endSeason
  };
}
