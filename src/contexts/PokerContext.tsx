
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Player, Season, Game, RankingEntry, FinancialParams, BlindLevel } from '../lib/db/models';
import { pokerDB } from '../lib/db/database';
import { useToast } from "@/components/ui/use-toast";

interface PokerContextProps {
  // Players
  players: Player[];
  getPlayer: (id: string) => Promise<Player | undefined>;
  savePlayer: (player: Partial<Player>) => Promise<string>;
  deletePlayer: (id: string) => Promise<void>;
  
  // Seasons
  seasons: Season[];
  activeSeason: Season | null;
  createSeason: (seasonData: Partial<Season>) => Promise<string>;
  updateSeason: (seasonData: Partial<Season>) => Promise<void>;
  endSeason: (seasonId: string) => Promise<void>;
  
  // Games
  games: Game[];
  lastGame: Game | null;
  createGame: (seasonId: string) => Promise<string>;
  updateGame: (gameData: Partial<Game>) => Promise<void>;
  finishGame: (gameId: string) => Promise<void>;
  
  // Rankings
  rankings: RankingEntry[];
  
  // Utilities
  isLoading: boolean;
  exportBackup: () => Promise<void>;
  getGameNumber: (seasonId: string) => Promise<number>;
}

const PokerContext = createContext<PokerContextProps | undefined>(undefined);

export function PokerProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [lastGame, setLastGame] = useState<Game | null>(null);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);

  useEffect(() => {
    const initData = async () => {
      try {
        const playersData = await pokerDB.getPlayers();
        setPlayers(playersData);
        
        const seasonsData = await pokerDB.getSeasons();
        setSeasons(seasonsData);
        
        const activeSeason = await pokerDB.getActiveSeason();
        setActiveSeason(activeSeason || null);
        
        if (activeSeason) {
          const gamesData = await pokerDB.getGames(activeSeason.id);
          setGames(gamesData);
          
          const rankingsData = await pokerDB.getRankings(activeSeason.id);
          setRankings(rankingsData);
        }
        
        const lastGameData = await pokerDB.getLastGame();
        setLastGame(lastGameData || null);
      } catch (error) {
        console.error('Error initializing data:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados. Por favor, recarregue a página.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initData();
  }, [toast]);

  const getPlayer = async (id: string) => {
    return await pokerDB.getPlayer(id);
  };

  const savePlayer = async (playerData: Partial<Player>) => {
    const now = new Date();
    let player: Player;
    
    if (playerData.id) {
      const existingPlayer = await pokerDB.getPlayer(playerData.id);
      if (!existingPlayer) {
        throw new Error('Player not found');
      }
      player = { ...existingPlayer, ...playerData };
    } else {
      player = {
        id: uuidv4(),
        name: playerData.name || 'Jogador sem nome',
        photoUrl: playerData.photoUrl,
        phone: playerData.phone,
        city: playerData.city,
        createdAt: now,
      };
    }
    
    const id = await pokerDB.savePlayer(player);
    
    // Update local state
    setPlayers(prev => {
      const index = prev.findIndex(p => p.id === id);
      if (index >= 0) {
        return [...prev.slice(0, index), player, ...prev.slice(index + 1)];
      }
      return [...prev, player];
    });
    
    return id;
  };

  const deletePlayer = async (id: string) => {
    await pokerDB.deletePlayer(id);
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  const createSeason = async (seasonData: Partial<Season>) => {
    const now = new Date();
    
    // Set any existing active season to inactive
    if (activeSeason) {
      const updatedActiveSeason = { ...activeSeason, isActive: false };
      await pokerDB.saveSeason(updatedActiveSeason);
    }
    
    // Create default financial parameters if not provided
    const financialParams: FinancialParams = seasonData.financialParams || {
      buyIn: 30,
      rebuy: 30,
      addon: 30,
      ante: 5,
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
    setGames([]);
    setRankings([]);
    
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

  const getGameNumber = async (seasonId: string) => {
    const games = await pokerDB.getGames(seasonId);
    return games.length + 1;
  };

  const createGame = async (seasonId: string) => {
    const season = await pokerDB.getSeason(seasonId);
    if (!season) {
      throw new Error('Season not found');
    }
    
    const gameNumber = await getGameNumber(seasonId);
    
    const newGame: Game = {
      id: uuidv4(),
      number: gameNumber,
      seasonId: seasonId,
      date: new Date(),
      players: [],
      totalPrizePool: 0,
      isFinished: false,
      createdAt: new Date(),
    };
    
    const id = await pokerDB.saveGame(newGame);
    
    // Update local state
    setGames(prev => [...prev, newGame]);
    setLastGame(newGame);
    
    return id;
  };

  const updateGame = async (gameData: Partial<Game>) => {
    if (!gameData.id) {
      throw new Error('Game ID is required');
    }
    
    const existingGame = await pokerDB.getGame(gameData.id);
    if (!existingGame) {
      throw new Error('Game not found');
    }
    
    const updatedGame = { ...existingGame, ...gameData };
    await pokerDB.saveGame(updatedGame);
    
    // Update local state
    setGames(prev => {
      const index = prev.findIndex(g => g.id === updatedGame.id);
      if (index >= 0) {
        return [...prev.slice(0, index), updatedGame, ...prev.slice(index + 1)];
      }
      return prev;
    });
    
    // Update last game if this is the most recent
    if (lastGame?.id === updatedGame.id) {
      setLastGame(updatedGame);
    } else {
      // Check if this is now the most recent game
      const latestGame = await pokerDB.getLastGame();
      if (latestGame?.id === updatedGame.id) {
        setLastGame(updatedGame);
      }
    }
  };

  const finishGame = async (gameId: string) => {
    const game = await pokerDB.getGame(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    
    const season = await pokerDB.getSeason(game.seasonId);
    if (!season) {
      throw new Error('Season not found');
    }
    
    // Calculate jackpot contribution
    const playerCount = game.players.filter(p => p.buyIn).length;
    const jackpotContribution = playerCount * season.financialParams.jackpotContribution;
    
    // Update the season with the new jackpot amount
    const updatedSeason = {
      ...season,
      jackpot: season.jackpot + jackpotContribution
    };
    await pokerDB.saveSeason(updatedSeason);
    
    // Mark the game as finished
    const updatedGame = {
      ...game,
      isFinished: true
    };
    await pokerDB.saveGame(updatedGame);
    
    // Update rankings
    for (const gamePlayer of game.players) {
      const existingRankings = await pokerDB.getRankings(game.seasonId);
      const playerRanking = existingRankings.find(r => r.playerId === gamePlayer.playerId);
      
      let rankingEntry: RankingEntry;
      const player = await pokerDB.getPlayer(gamePlayer.playerId);
      
      if (playerRanking) {
        // Update existing ranking
        rankingEntry = {
          ...playerRanking,
          totalPoints: playerRanking.totalPoints + gamePlayer.points,
          gamesPlayed: playerRanking.gamesPlayed + 1,
          bestPosition: gamePlayer.position && (playerRanking.bestPosition > gamePlayer.position || playerRanking.bestPosition === 0)
            ? gamePlayer.position
            : playerRanking.bestPosition
        };
      } else {
        // Create new ranking entry
        rankingEntry = {
          id: uuidv4(),
          playerId: gamePlayer.playerId,
          playerName: player ? player.name : 'Unknown Player',
          photoUrl: player?.photoUrl,
          totalPoints: gamePlayer.points,
          gamesPlayed: 1,
          bestPosition: gamePlayer.position || 0
        };
      }
      
      await pokerDB.saveRanking(rankingEntry);
    }
    
    // Update local state
    setSeasons(prev => {
      const index = prev.findIndex(s => s.id === updatedSeason.id);
      return [...prev.slice(0, index), updatedSeason, ...prev.slice(index + 1)];
    });
    
    if (activeSeason?.id === season.id) {
      setActiveSeason(updatedSeason);
    }
    
    setGames(prev => {
      const index = prev.findIndex(g => g.id === updatedGame.id);
      return [...prev.slice(0, index), updatedGame, ...prev.slice(index + 1)];
    });
    
    setLastGame(updatedGame);
    
    // Reload rankings
    const updatedRankings = await pokerDB.getRankings(game.seasonId);
    setRankings(updatedRankings);
    
    toast({
      title: "Partida Finalizada",
      description: "A partida foi finalizada e o ranking atualizado.",
    });
  };

  const exportBackup = async () => {
    try {
      const backupJson = await pokerDB.exportBackup();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `apa-poker-backup-${timestamp}.json`;
      
      const blob = new Blob([backupJson], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Backup Exportado",
        description: "O backup foi exportado com sucesso.",
      });
    } catch (error) {
      console.error('Error exporting backup:', error);
      toast({
        title: "Erro no Backup",
        description: "Não foi possível exportar o backup.",
        variant: "destructive",
      });
    }
  };

  return (
    <PokerContext.Provider value={{
      players,
      getPlayer,
      savePlayer,
      deletePlayer,
      
      seasons,
      activeSeason,
      createSeason,
      updateSeason,
      endSeason,
      
      games,
      lastGame,
      createGame,
      updateGame,
      finishGame,
      
      rankings,
      
      isLoading,
      exportBackup,
      getGameNumber,
    }}>
      {children}
    </PokerContext.Provider>
  );
}

export function usePoker() {
  const context = useContext(PokerContext);
  if (context === undefined) {
    throw new Error('usePoker must be used within a PokerProvider');
  }
  return context;
}
