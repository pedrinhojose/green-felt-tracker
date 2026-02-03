import { usePoker } from "@/contexts/PokerContext";
import { useToast } from "@/components/ui/use-toast";
import { Game, GamePlayer } from "@/lib/db/models";

export function usePositionSwap(game: Game | null, setGame: React.Dispatch<React.SetStateAction<Game | null>>) {
  const { updateGame, activeSeason } = usePoker();
  const { toast } = useToast();

  // Calcular saldo do jogador
  const calculatePlayerBalance = (player: GamePlayer, dinnerCost: number | undefined, dinnerParticipants: number) => {
    if (!activeSeason) return 0;
    
    const buyInCost = player.buyIn ? activeSeason.financialParams.buyIn : 0;
    const rebuysCost = player.rebuys * activeSeason.financialParams.rebuy;
    const addonsCost = player.addons * activeSeason.financialParams.addon;
    
    // Calcular custo da janta
    const dinnerCostShare = player.joinedDinner && dinnerCost && dinnerParticipants > 0 ? 
      dinnerCost / dinnerParticipants : 0;
    
    // Calcular contribuição da caixinha (apenas para quem participa)
    const clubFundCost = player.participatesInClubFund && activeSeason.financialParams.clubFundContribution > 0 ? 
      activeSeason.financialParams.clubFundContribution : 0;
    
    // Calcular saldo (prêmio - custos - caixinha)
    return player.prize - (buyInCost + rebuysCost + addonsCost + dinnerCostShare + clubFundCost);
  };

  // Recalcular pontos e prêmios baseado na posição
  const recalculatePlayerStats = (player: GamePlayer, distributablePrize: number): GamePlayer => {
    if (!activeSeason || player.position === null) return player;

    // Buscar pontos na scoreSchema
    const scoreEntry = activeSeason.scoreSchema.find(entry => entry.position === player.position);
    const points = scoreEntry ? scoreEntry.points : 0;

    // Buscar prêmio na weeklyPrizeSchema
    const prizeEntry = activeSeason.weeklyPrizeSchema.find(entry => entry.position === player.position);
    const prize = prizeEntry ? (distributablePrize * prizeEntry.percentage) / 100 : 0;

    return {
      ...player,
      points,
      prize,
    };
  };

  const swapPositions = async (player1Id: string, player2Id: string) => {
    if (!game || !activeSeason) {
      toast({
        title: "Erro",
        description: "Dados do jogo ou temporada não disponíveis.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const player1Index = game.players.findIndex(p => p.playerId === player1Id);
      const player2Index = game.players.findIndex(p => p.playerId === player2Id);

      if (player1Index === -1 || player2Index === -1) {
        toast({
          title: "Erro",
          description: "Jogador não encontrado.",
          variant: "destructive",
        });
        return false;
      }

      const player1 = game.players[player1Index];
      const player2 = game.players[player2Index];

      if (player1.position === null || player2.position === null) {
        toast({
          title: "Erro",
          description: "Ambos os jogadores devem ter posição definida para trocar.",
          variant: "destructive",
        });
        return false;
      }

      // Trocar posições
      const tempPosition = player1.position;
      const updatedPlayers = [...game.players];
      
      updatedPlayers[player1Index] = { ...player1, position: player2.position };
      updatedPlayers[player2Index] = { ...player2, position: tempPosition };

      // Recalcular pontos e prêmios para ambos
      const distributablePrize = game.totalPrizePool;
      
      updatedPlayers[player1Index] = recalculatePlayerStats(updatedPlayers[player1Index], distributablePrize);
      updatedPlayers[player2Index] = recalculatePlayerStats(updatedPlayers[player2Index], distributablePrize);

      // Recalcular saldos
      const dinnerParticipants = updatedPlayers.filter(p => p.joinedDinner).length;
      
      updatedPlayers[player1Index] = {
        ...updatedPlayers[player1Index],
        clubFundContribution: updatedPlayers[player1Index].participatesInClubFund && activeSeason.financialParams.clubFundContribution > 0 
          ? activeSeason.financialParams.clubFundContribution : 0,
        balance: calculatePlayerBalance(updatedPlayers[player1Index], game.dinnerCost, dinnerParticipants),
      };

      updatedPlayers[player2Index] = {
        ...updatedPlayers[player2Index],
        clubFundContribution: updatedPlayers[player2Index].participatesInClubFund && activeSeason.financialParams.clubFundContribution > 0 
          ? activeSeason.financialParams.clubFundContribution : 0,
        balance: calculatePlayerBalance(updatedPlayers[player2Index], game.dinnerCost, dinnerParticipants),
      };

      // Atualizar no banco
      await updateGame({
        id: game.id,
        players: updatedPlayers,
      });

      // Atualizar estado local
      setGame(prev => {
        if (!prev) return null;
        return {
          ...prev,
          players: updatedPlayers,
        };
      });

      toast({
        title: "Posições trocadas",
        description: `Posições trocadas: ${player1.position}º ↔ ${player2.position}º. Pontos e prêmios recalculados.`,
      });

      return true;
    } catch (error) {
      console.error("Error swapping positions:", error);
      toast({
        title: "Erro",
        description: "Não foi possível trocar as posições.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Obter jogadores com posição definida (para o select do dialog)
  const getPlayersWithPosition = () => {
    if (!game) return [];
    return game.players.filter(p => p.position !== null && p.isEliminated);
  };

  return {
    swapPositions,
    getPlayersWithPosition,
  };
}
