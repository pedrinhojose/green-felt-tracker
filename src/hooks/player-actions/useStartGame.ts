
import { usePoker } from "@/contexts/PokerContext";
import { useToast } from "@/components/ui/use-toast";
import { Game, GamePlayer, MembershipCharge } from "@/lib/db/models";
import { shouldChargeMembership, calculateTotalMembershipCharges, createMembershipCharges } from "@/utils/membershipUtils";
import { pokerDB } from "@/lib/db";
import { useState } from "react";

export function useStartGame(game: Game | null, setGame: React.Dispatch<React.SetStateAction<Game | null>>) {
  const { updateGame, players } = usePoker();
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
      
      // Obter dados completos dos jogadores selecionados
      const selectedPlayersData = players.filter(p => selectedPlayers.has(p.id));
      
      // Calcular mensalidades a serem cobradas
      const { totalAmount: membershipTotal, chargedPlayers } = await calculateTotalMembershipCharges(
        selectedPlayersData,
        activeSeason,
        game.date
      );
      
      // Criar registros de cobrança de mensalidade
      const membershipCharges = createMembershipCharges(chargedPlayers, activeSeason, game.date);
      
      // Create game players array from selected player IDs
      const gamePlayers: GamePlayer[] = Array.from(selectedPlayers).map(playerId => {
        const playerData = selectedPlayersData.find(p => p.id === playerId);
        const isCharged = chargedPlayers.some(p => p.id === playerId);
        
        return {
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
          balance: isCharged ? -activeSeason.financialParams.clubMembershipValue : 0,
          membershipCharged: isCharged,
        };
      });
      
      // Calculate initial prize pool (buy-ins)
      const buyInAmount = activeSeason?.financialParams.buyIn || 0;
      const jackpotContribution = activeSeason?.financialParams.jackpotContribution || 0;
      // Desconta a contribuição do jackpot do prêmio total
      const initialPrizePool = (buyInAmount - jackpotContribution) * gamePlayers.length;
      
      // Atualizar temporada com mensalidades coletadas
      if (membershipTotal > 0) {
        await pokerDB.saveSeason({
          ...activeSeason,
          clubFund: activeSeason.clubFund + membershipTotal
        });
        
        // Atualizar última cobrança dos jogadores
        for (const player of chargedPlayers) {
          await pokerDB.savePlayer({
            ...player,
            lastMembershipCharge: game.date
          });
        }
      }
      
      // Update game with players, prize pool and membership charges
      await updateGame({
        id: game.id,
        players: gamePlayers,
        totalPrizePool: initialPrizePool,
        membershipCharges: membershipCharges,
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
      
      // Mensagem de toast com informações sobre mensalidades
      let description = `${gamePlayers.length} jogadores selecionados`;
      if (membershipTotal > 0) {
        description += `. Mensalidades coletadas: R$ ${membershipTotal.toFixed(2)} (${chargedPlayers.length} jogadores)`;
      }
      
      toast({
        title: "Partida iniciada",
        description,
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
