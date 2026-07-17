import { useState } from 'react';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import { Game, Season } from '../lib/db/models';
import { pokerDB } from '../lib/db';
import { useToast } from "@/components/ui/use-toast";
import { useEliminationData } from '../hooks/elimination/useEliminationData';
import { getGamePlayerPointBreakdown } from '@/lib/utils/pointsBreakdown';

export function useGameFunctions(
  updateRankings: () => Promise<void>,
  setActiveSeason?: React.Dispatch<React.SetStateAction<Season | null>>
) {
  const { toast } = useToast();
  const { deleteEliminationsByGameId } = useEliminationData();
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

  /**
   * Create a standalone game not linked to any season.
   * Standalone games skip caixinha/jackpot/ranking logic entirely.
   */
  const createStandaloneGame = async () => {
    // Standalone games get their own numbering per organization,
    // scoped simply by picking the next available number among existing standalone games.
    const existingStandalone = games.filter(g => g.isStandalone);
    const existingNumbers = existingStandalone.map(g => g.number);
    const gameNumber = findNextAvailableNumber(existingNumbers);

    const newGame: Game = {
      id: uuidv4(),
      number: gameNumber,
      seasonId: null,
      isStandalone: true,
      date: new Date(),
      players: [],
      totalPrizePool: 0,
      isFinished: false,
      createdAt: new Date(),
    };

    const id = await pokerDB.saveGame(newGame);
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
        // Partida órfã: existe apenas no estado local (ex.: temporada excluída em cascata).
        // Tentar remover do banco best-effort e limpar o estado local.
        console.warn(`deleteGame: partida ${gameId} não encontrada no banco. Limpando estado local.`);
        try {
          await pokerDB.deleteGame(gameId);
        } catch (err) {
          console.warn('deleteGame: falha ao remover partida inexistente (ignorado):', err);
        }
        setGames(prev => prev.filter(g => g.id !== gameId));
        if (lastGame?.id === gameId) {
          const newLastGame = await pokerDB.getLastGame();
          setLastGame(newLastGame || null);
        }
        return true;
      }

      
      // First, delete all eliminations associated with this game
      await deleteEliminationsByGameId(gameId);
      
      // Se o jogo estava finalizado E vinculado a uma temporada, reverter dados de ranking/jackpot
      if (game.isFinished && game.seasonId && !game.isStandalone) {
        // Obter rankings atuais da temporada
        const currentRankings = await pokerDB.getRankings(game.seasonId);
        
        // Para cada jogador na partida, ajustar seu ranking
        for (const gamePlayer of game.players) {
          const playerRanking = currentRankings.find(r => r.playerId === gamePlayer.playerId);
          
          if (playerRanking) {
            const updatedRanking = {
              ...playerRanking,
              totalPoints: Math.max(0, playerRanking.totalPoints - (gamePlayer.points || 0)),
              gamesPlayed: Math.max(0, playerRanking.gamesPlayed - 1)
            };
            
            if (gamePlayer.position && gamePlayer.position === playerRanking.bestPosition) {
              const seasonGames = await pokerDB.getGames(game.seasonId);
              const playerGames = seasonGames
                .filter(g => g.id !== gameId)
                .filter(g => g.isFinished)
                .filter(g => g.players.some(p => p.playerId === gamePlayer.playerId));
              
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
            
            await pokerDB.saveRanking(updatedRanking);
          }
        }
        
        // Ajustar jackpot da temporada
        const season = await pokerDB.getSeason(game.seasonId);
        if (season) {
          const playerCount = game.players.filter(p => p.buyIn).length;
          const jackpotContribution = playerCount * (season.financialParams?.jackpotContribution || 0);
          
          const updatedSeason = {
            ...season,
            jackpot: Math.max(0, season.jackpot - jackpotContribution)
          };
          
          await pokerDB.saveSeason(updatedSeason);
          
          if (season.isActive && setActiveSeason) {
            setActiveSeason(updatedSeason);
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
      
      // Recalcular rankings a partir de TODOS os jogos finalizados da temporada
      const freshPlayers = await pokerDB.getPlayers();
      const allGames = await pokerDB.getGames(game.seasonId);
      const finishedGames = allGames.filter(g => g.seasonId === game.seasonId && g.isFinished);

      type PlayerAgg = { totalPoints: number; pointsFromPosition: number; pointsFromEliminations: number; gamesPlayed: number; bestPosition: number; name: string; photoUrl?: string };
      const agg = new Map<string, PlayerAgg>();

      // Carregar scoreSchema da temporada para fallback de pontos
      const scoreSchema = updatedSeason.scoreSchema || [];

      finishedGames.forEach(gm => {
        gm.players.forEach(gp => {
          const pl = freshPlayers.find(p => p.id === gp.playerId);
          if (!pl) return;
          const cur = agg.get(gp.playerId) || { totalPoints: 0, pointsFromPosition: 0, pointsFromEliminations: 0, gamesPlayed: 0, bestPosition: 99, name: pl.name, photoUrl: pl.photoUrl };
          const breakdown = getGamePlayerPointBreakdown(gp, scoreSchema);
          cur.totalPoints += breakdown.total;
          cur.pointsFromPosition += breakdown.position;
          cur.pointsFromEliminations += breakdown.eliminations;
          cur.gamesPlayed += 1;
          if (gp.position && gp.position < cur.bestPosition) cur.bestPosition = gp.position;
          cur.name = pl.name;
          cur.photoUrl = pl.photoUrl;
          agg.set(gp.playerId, cur);
        });
      });

      const newRankings = Array.from(agg.entries()).map(([playerId, stat]) => ({
        id: uuidv5(`${playerId}-${game.seasonId}`, uuidv5.URL),
        playerId,
        playerName: stat.name,
        photoUrl: stat.photoUrl,
        totalPoints: stat.totalPoints,
        pointsFromPosition: stat.pointsFromPosition,
        pointsFromEliminations: stat.pointsFromEliminations,
        gamesPlayed: stat.gamesPlayed,
        bestPosition: stat.bestPosition === 99 ? 0 : stat.bestPosition,
        seasonId: game.seasonId,
      }));

      await pokerDB.deleteRankingsBySeason(game.seasonId);
      await pokerDB.saveRankingsBulk(newRankings);

      console.log(`Rankings recalculados após finalizar jogo: ${newRankings.length} jogadores`);

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
