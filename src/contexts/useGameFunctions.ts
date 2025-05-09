import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Game, Season } from '../lib/db/models';
import { pokerDB } from '../lib/db';
import { useToast } from "@/components/ui/use-toast";

export function useGameFunctions(
  updateRankings: () => Promise<void>,
  setActiveSeason?: React.Dispatch<React.SetStateAction<Season | null>>
) {
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

  const deleteGame = async (gameId: string) => {
    try {
      // Get the game before deleting it to check if it's the last game
      const game = await pokerDB.getGame(gameId);
      if (!game) {
        throw new Error('Game not found');
      }
      
      // Delete game from database
      await pokerDB.deleteGame(gameId);
      
      // Update local state
      setGames(prev => prev.filter(g => g.id !== gameId));
      
      // If the deleted game was the last game, update lastGame state
      if (lastGame?.id === gameId) {
        const newLastGame = await pokerDB.getLastGame();
        setLastGame(newLastGame || null);
      }
      
      // If the game was finished, we should update the rankings to reflect the change
      if (game.isFinished) {
        // Update rankings
        await updateRankings();
        
        // If this was a finished game, we should also update the jackpot in the season
        if (game.seasonId) {
          // Get current season data
          const season = await pokerDB.getSeason(game.seasonId);
          if (season) {
            // Calculate jackpot adjustment (assuming we know the original contribution)
            const playerCount = game.players.filter(p => p.buyIn).length;
            const jackpotContribution = playerCount * (season.financialParams?.jackpotContribution || 0);
            
            // Reverse the jackpot contribution
            const updatedSeason = {
              ...season,
              jackpot: Math.max(0, season.jackpot - jackpotContribution)
            };
            
            // Update the season with the adjusted jackpot
            await pokerDB.saveSeason(updatedSeason);
            
            // Update active season state if needed
            if (season.isActive && setActiveSeason) {
              setActiveSeason(updatedSeason);
            }
          }
        }
      }
      
      // Return success
      return true;
    } catch (error) {
      console.error("Error deleting game:", error);
      throw error;
    }
  };

  const finishGame = async (gameId: string) => {
    try {
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
      
      console.log(`Atualizando jackpot: ${season.jackpot} + ${jackpotContribution} = ${season.jackpot + jackpotContribution}`);
      
      // Update the season with the new jackpot amount
      const updatedSeason = {
        ...season,
        jackpot: season.jackpot + jackpotContribution
      };
      await pokerDB.saveSeason(updatedSeason);
      
      // IMPORTANTE: Atualizar o estado global da temporada ativa se esta for a temporada ativa
      if (season.isActive && setActiveSeason) {
        console.log("Atualizando temporada ativa no contexto");
        setActiveSeason(updatedSeason);
      }
      
      // Mark the game as finished
      const updatedGame = {
        ...game,
        isFinished: true
      };
      await pokerDB.saveGame(updatedGame);
      
      // Update rankings
      for (const gamePlayer of game.players) {
        // Buscar rankings existentes
        const existingRankings = await pokerDB.getRankings(game.seasonId);
        
        // Buscar o ranking atual do jogador, se existir
        const playerRanking = existingRankings.find(r => r.playerId === gamePlayer.playerId);
        
        // Buscar dados do jogador
        const player = await pokerDB.getPlayer(gamePlayer.playerId);
        if (!player) continue; // Pular se o jogador não for encontrado
        
        let rankingEntry;
        
        if (playerRanking) {
          // Update existing ranking
          rankingEntry = {
            ...playerRanking,
            totalPoints: playerRanking.totalPoints + gamePlayer.points,
            gamesPlayed: playerRanking.gamesPlayed + 1,
            bestPosition: gamePlayer.position && (playerRanking.bestPosition > gamePlayer.position || playerRanking.bestPosition === 0)
              ? gamePlayer.position
              : playerRanking.bestPosition,
            seasonId: game.seasonId // Adicionar o seasonId explicitamente
          };
        } else {
          // Create new ranking entry
          rankingEntry = {
            id: uuidv4(),
            playerId: gamePlayer.playerId,
            playerName: player.name,
            photoUrl: player.photoUrl,
            totalPoints: gamePlayer.points,
            gamesPlayed: 1,
            bestPosition: gamePlayer.position || 0,
            seasonId: game.seasonId // Adicionar o seasonId explicitamente
          };
        }
        
        // Salvar entrada do ranking
        await pokerDB.saveRanking(rankingEntry);
      }
      
      // Update local state
      setGames(prev => {
        const index = prev.findIndex(g => g.id === updatedGame.id);
        if (index >= 0) {
          return [...prev.slice(0, index), updatedGame, ...prev.slice(index + 1)];
        }
        return prev;
      });
      
      setLastGame(updatedGame);
      
      // Forçar atualização do ranking chamando a função de atualização
      await updateRankings();
      
      toast({
        title: "Partida Finalizada",
        description: "A partida foi finalizada e o ranking atualizado.",
      });
    } catch (error) {
      console.error("Erro ao finalizar partida:", error);
      toast({
        title: "Erro",
        description: "Não foi possível finalizar a partida.",
        variant: "destructive",
      });
    }
  };

  return {
    games,
    setGames,
    lastGame,
    setLastGame,
    getGameNumber,
    createGame,
    updateGame,
    deleteGame,
    finishGame
  };
}
