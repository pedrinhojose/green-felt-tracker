import { useState } from 'react';
import { Game, RankingEntry } from '@/lib/db/models';
import { pokerDB } from '@/lib/db';
import { useToast } from "@/components/ui/use-toast";
import { useRankingSync } from "@/hooks/useRankingSync";

interface GameBackup {
  originalGame: Game;
  originalRankings: RankingEntry[];
  originalJackpot: number;
}

export function useEditFinishedGame() {
  const { toast } = useToast();
  const [isEditingFinishedGame, setIsEditingFinishedGame] = useState(false);
  const [gameBackup, setGameBackup] = useState<GameBackup | null>(null);
  const { recalculateRankings } = useRankingSync();

  const reopenGameForEditing = async (game: Game): Promise<boolean> => {
    try {
      if (!game.isFinished) {
        toast({
          title: "Erro",
          description: "Só é possível editar partidas finalizadas.",
          variant: "destructive",
        });
        return false;
      }

      // Criar backup dos dados originais
      const season = await pokerDB.getSeason(game.seasonId);
      if (!season) {
        throw new Error('Season not found');
      }

      const currentRankings = await pokerDB.getRankings(game.seasonId);
      
      const backup: GameBackup = {
        originalGame: { ...game },
        originalRankings: [...currentRankings],
        originalJackpot: season.jackpot
      };

      setGameBackup(backup);

      // Reverter temporariamente os cálculos
      await revertGameCalculations(game);

      setIsEditingFinishedGame(true);
      
      toast({
        title: "Partida Reaberta",
        description: "Partida reaberta para edição. Não esqueça de salvar as alterações.",
      });

      return true;
    } catch (error) {
      console.error("Error reopening game:", error);
      toast({
        title: "Erro",
        description: "Não foi possível reabrir a partida para edição.",
        variant: "destructive",
      });
      return false;
    }
  };

  const revertGameCalculations = async (game: Game) => {
    const season = await pokerDB.getSeason(game.seasonId);
    if (!season) return;

    // Reverter jackpot
    const playerCount = game.players.filter(p => p.buyIn).length;
    const jackpotContribution = playerCount * (season.financialParams?.jackpotContribution || 0);
    
    const updatedSeason = {
      ...season,
      jackpot: Math.max(0, season.jackpot - jackpotContribution)
    };
    await pokerDB.saveSeason(updatedSeason);

    // Reverter rankings
    const currentRankings = await pokerDB.getRankings(game.seasonId);
    
    for (const gamePlayer of game.players) {
      const playerRanking = currentRankings.find(r => r.playerId === gamePlayer.playerId);
      
      if (playerRanking) {
        const updatedRanking = {
          ...playerRanking,
          totalPoints: Math.max(0, playerRanking.totalPoints - (gamePlayer.points || 0)),
          gamesPlayed: Math.max(0, playerRanking.gamesPlayed - 1)
        };

        // Recalcular melhor posição se necessário
        if (gamePlayer.position && gamePlayer.position === playerRanking.bestPosition) {
          const seasonGames = await pokerDB.getGames(game.seasonId);
          const playerGames = seasonGames
            .filter(g => g.id !== game.id)
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
  };

  const saveEditedGame = async (
    editedGame: Game, 
    updateRankings: () => Promise<void>
  ): Promise<boolean> => {
    try {
      if (!gameBackup) {
        throw new Error('No backup found');
      }

      // Marcar como finalizada e salvar
      const finalizedGame = {
        ...editedGame,
        isFinished: true
      };
      
      await pokerDB.saveGame(finalizedGame);

      // Recalcular tudo com os novos dados
      const season = await pokerDB.getSeason(editedGame.seasonId);
      if (!season) {
        throw new Error('Season not found');
      }

      // Recalcular jackpot
      const playerCount = finalizedGame.players.filter(p => p.buyIn).length;
      const jackpotContribution = playerCount * (season.financialParams?.jackpotContribution || 0);
      
      const updatedSeason = {
        ...season,
        jackpot: season.jackpot + jackpotContribution
      };
      await pokerDB.saveSeason(updatedSeason);

      // Recalcular rankings
      await recalculateRankings(finalizedGame.seasonId);

      // Limpar estado de edição
      setIsEditingFinishedGame(false);
      setGameBackup(null);

      // Atualizar rankings no contexto
      await updateRankings();

      toast({
        title: "Alterações Salvas",
        description: "Partida atualizada com sucesso e cálculos refeitos.",
      });

      return true;
    } catch (error) {
      console.error("Error saving edited game:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
      return false;
    }
  };


  const cancelEdit = async (): Promise<boolean> => {
    try {
      if (!gameBackup) {
        throw new Error('No backup found');
      }

      // Restaurar dados originais
      await pokerDB.saveGame(gameBackup.originalGame);

      // Restaurar rankings
      for (const ranking of gameBackup.originalRankings) {
        await pokerDB.saveRanking(ranking);
      }

      // Restaurar jackpot
      const season = await pokerDB.getSeason(gameBackup.originalGame.seasonId);
      if (season) {
        const restoredSeason = {
          ...season,
          jackpot: gameBackup.originalJackpot
        };
        await pokerDB.saveSeason(restoredSeason);
      }

      // Limpar estado
      setIsEditingFinishedGame(false);
      setGameBackup(null);

      toast({
        title: "Edição Cancelada",
        description: "Dados originais restaurados.",
      });

      return true;
    } catch (error) {
      console.error("Error canceling edit:", error);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar a edição.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    isEditingFinishedGame,
    gameBackup,
    reopenGameForEditing,
    saveEditedGame,
    cancelEdit
  };
}