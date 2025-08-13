import { useState } from 'react';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
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

  const findNextAvailableNumber = (existingNumbers: number[]): number => {
    if (existingNumbers.length === 0) {
      return 1;
    }
    
    // Sort numbers to ensure proper order
    const sortedNumbers = [...existingNumbers].sort((a, b) => a - b);
    
    // Find the first gap in the sequence
    for (let i = 0; i < sortedNumbers.length; i++) {
      const expectedNumber = i + 1;
      if (sortedNumbers[i] !== expectedNumber) {
        return expectedNumber;
      }
    }
    
    // If no gaps, return the next sequential number
    return sortedNumbers.length + 1;
  };

  const getGameNumber = async (seasonId: string) => {
    const gameNumbers = await pokerDB.getGameNumbers(seasonId);
    return findNextAvailableNumber(gameNumbers);
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
      
      // Se o jogo estava finalizado, precisamos reverter os dados dos jogadores
      if (game.isFinished) {
        // Obter rankings atuais da temporada
        const currentRankings = await pokerDB.getRankings(game.seasonId);
        
        // Para cada jogador na partida, ajustar seu ranking
        for (const gamePlayer of game.players) {
          // Encontrar o ranking atual do jogador
          const playerRanking = currentRankings.find(r => r.playerId === gamePlayer.playerId);
          
          if (playerRanking) {
            // Subtrair os pontos ganhos nesta partida
            const updatedRanking = {
              ...playerRanking,
              totalPoints: Math.max(0, playerRanking.totalPoints - (gamePlayer.points || 0)),
              gamesPlayed: Math.max(0, playerRanking.gamesPlayed - 1)
            };
            
            // Se o jogador teve sua melhor posição neste jogo, precisamos recalcular
            if (gamePlayer.position && gamePlayer.position === playerRanking.bestPosition) {
              // Buscar todas as partidas do jogador nesta temporada exceto a que está sendo excluída
              const seasonGames = await pokerDB.getGames(game.seasonId);
              const playerGames = seasonGames
                .filter(g => g.id !== gameId)
                .filter(g => g.isFinished)
                .filter(g => g.players.some(p => p.playerId === gamePlayer.playerId));
              
              // Encontrar a melhor posição em outros jogos
              let newBestPosition = 0;
              for (const playerGame of playerGames) {
                const playerInGame = playerGame.players.find(p => p.playerId === gamePlayer.playerId);
                if (playerInGame && playerInGame.position) {
                  if (newBestPosition === 0 || playerInGame.position < newBestPosition) {
                    newBestPosition = playerInGame.position;
                  }
                }
              }
              
              updatedRanking.bestPosition = newBestPosition;
            }
            
            // Salvar o ranking atualizado
            await pokerDB.saveRanking(updatedRanking);
          }
        }
        
        // Se esta era uma partida finalizada, também ajustar o jackpot na temporada
        if (game.seasonId) {
          // Get current season data
          const season = await pokerDB.getSeason(game.seasonId);
          if (season) {
            // Calculate jackpot adjustment (assumindo que sabemos a contribuição original)
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
      
      // Delete game from database
      await pokerDB.deleteGame(gameId);
      
      // Update local state
      setGames(prev => prev.filter(g => g.id !== gameId));
      
      // If the deleted game was the last game, update lastGame state
      if (lastGame?.id === gameId) {
        const newLastGame = await pokerDB.getLastGame();
        setLastGame(newLastGame || null);
      }
      
      // Atualizar rankings após todas as modificações
      await updateRankings();
      
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
      
      // Normalizar pontos por jogador: se ausentes, calcular pelo scoreSchema; caso contrário manter, sempre número
      const playersToSave = game.players.map(player => {
        let normalizedPoints = typeof player.points === 'number' && !Number.isNaN(player.points) ? player.points : undefined;
        if (normalizedPoints === undefined) {
          const scoreEntry = season.scoreSchema.find(entry => entry.position === player.position);
          normalizedPoints = scoreEntry?.points ?? 0;
        }
        return { ...player, points: normalizedPoints };
      });

      // Marcar o jogo como finalizado e salvar possíveis pontos calculados
      const updatedGame = {
        ...game,
        players: playersToSave,
        isFinished: true
      };
      await pokerDB.saveGame(updatedGame);
      
      // Atualizar rankings (buscar existentes uma vez e aplicar por jogador)
      const existingRankings = await pokerDB.getRankings(game.seasonId);
      for (const gamePlayer of updatedGame.players) {
        // Buscar dados do jogador
        const player = await pokerDB.getPlayer(gamePlayer.playerId);
        if (!player) continue; // Pular se o jogador não for encontrado
        
        const playerRanking = existingRankings.find(r => r.playerId === gamePlayer.playerId);
        const deltaPoints = gamePlayer.points || 0;
        
        let rankingEntry;
        
        if (playerRanking) {
          // Atualizar ranking existente
          rankingEntry = {
            ...playerRanking,
            totalPoints: (playerRanking.totalPoints || 0) + deltaPoints,
            gamesPlayed: (playerRanking.gamesPlayed || 0) + 1,
            bestPosition: gamePlayer.position && (playerRanking.bestPosition > gamePlayer.position || playerRanking.bestPosition === 0)
              ? gamePlayer.position
              : playerRanking.bestPosition,
            seasonId: game.seasonId
          };
        } else {
          // Criar novo ranking para o jogador
          rankingEntry = {
            id: uuidv5(`${gamePlayer.playerId}-${updatedGame.seasonId}`, uuidv5.URL),
            playerId: gamePlayer.playerId,
            playerName: player.name,
            photoUrl: player.photoUrl,
            totalPoints: deltaPoints,
            gamesPlayed: 1,
            bestPosition: gamePlayer.position || 0,
            seasonId: game.seasonId
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
