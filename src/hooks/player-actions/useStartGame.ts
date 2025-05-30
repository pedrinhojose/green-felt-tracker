
import { usePoker } from "@/contexts/PokerContext";
import { useToast } from "@/components/ui/use-toast";
import { Game, GamePlayer } from "@/lib/db/models";
import { useState } from "react";

export function useStartGame(game: Game | null, setGame: React.Dispatch<React.SetStateAction<Game | null>>) {
  const { updateGame } = usePoker();
  const { toast } = useToast();
  const { activeSeason } = usePoker();

  const handleStartGame = async (selectedPlayers: Set<string>) => {
    if (!game || selectedPlayers.size === 0) return;
    
    try {
      if (!activeSeason) {
        toast({
          title: "Erro",
          description: "Não há temporada ativa. Configure uma temporada antes de iniciar uma partida.",
          variant: "destructive",
        });
        return false;
      }
      
      // Verificar se há jogadores duplicados
      const selectedArray = Array.from(selectedPlayers);
      const uniqueIds = new Set(selectedArray);
      
      if (uniqueIds.size !== selectedArray.length) {
        toast({
          title: "Erro",
          description: "Há jogadores duplicados na seleção. Selecione cada jogador apenas uma vez.",
          variant: "destructive",
        });
        return false;
      }
      
      // Create game players array from selected player IDs
      const gamePlayers: GamePlayer[] = Array.from(selectedPlayers).map(playerId => ({
        id: `${playerId}-${Date.now()}`,
        playerId,
        position: null,
        buyIn: true,
        rebuys: 0,
        addons: 0,
        joinedDinner: false,
        isEliminated: false,
        prize: 0,
        points: 0,
        balance: 0,
      }));
      
      // Calculate initial prize pool (buy-ins)
      const buyInAmount = activeSeason?.financialParams.buyIn || 0;
      const jackpotContribution = activeSeason?.financialParams.jackpotContribution || 0;
      // Desconta a contribuição do jackpot do prêmio total
      const initialPrizePool = (buyInAmount - jackpotContribution) * gamePlayers.length;
      
      // Update game with players and prize pool
      await updateGame({
        id: game.id,
        players: gamePlayers,
        totalPrizePool: initialPrizePool,
      });
      
      // Update local game state
      setGame(prev => {
        if (!prev) return null;
        return {
          ...prev,
          players: gamePlayers,
          totalPrizePool: initialPrizePool,
        };
      });
      
      toast({
        title: "Partida iniciada",
        description: `${gamePlayers.length} jogadores selecionados`,
      });

      return true;
    } catch (error) {
      console.error("Error starting game:", error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a partida.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { handleStartGame };
}
