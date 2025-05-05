
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Game } from '../lib/db/models';
import { pokerDB } from '../lib/db/database';
import { useToast } from "@/components/ui/use-toast";

export function useGameFunctions(updateRankings: () => Promise<void>) {
  const { toast } = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [lastGame, setLastGame] = useState<Game | null>(null);

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
      
      let rankingEntry;
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
    setGames(prev => {
      const index = prev.findIndex(g => g.id === updatedGame.id);
      return [...prev.slice(0, index), updatedGame, ...prev.slice(index + 1)];
    });
    
    setLastGame(updatedGame);
    
    // Reload rankings
    await updateRankings();
    
    toast({
      title: "Partida Finalizada",
      description: "A partida foi finalizada e o ranking atualizado.",
    });
  };

  return {
    games,
    setGames,
    lastGame,
    setLastGame,
    getGameNumber,
    createGame,
    updateGame,
    finishGame
  };
}
