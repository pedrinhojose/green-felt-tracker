import { useToast } from "@/components/ui/use-toast";
import { pokerDB } from '../lib/db';
import { Season } from '@/lib/db/models';

export function useJackpotRecalculation() {
  const { toast } = useToast();

  /**
   * Recalcula o jackpot de uma temporada baseado em todos os jogos finalizados
   */
  const recalculateSeasonJackpot = async (seasonId: string): Promise<number> => {
    try {
      const season = await pokerDB.getSeason(seasonId);
      if (!season) {
        throw new Error('Season not found');
      }

      // Buscar todos os jogos finalizados da temporada
      const allGames = await pokerDB.getGames(seasonId);
      const finishedGames = allGames.filter(game => game.isFinished);

      console.log(`Recalculando jackpot para temporada ${seasonId}: ${finishedGames.length} jogos finalizados`);

      let totalJackpotContribution = 0;

      // Calcular contribuição total do jackpot de todos os jogos
      for (const game of finishedGames) {
        const playerCount = game.players.filter(p => p.buyIn).length;
        const gameContribution = playerCount * (season.financialParams?.jackpotContribution || 0);
        totalJackpotContribution += gameContribution;
        
        console.log(`Jogo ${game.number}: ${playerCount} jogadores x R$ ${season.financialParams?.jackpotContribution || 0} = R$ ${gameContribution}`);
      }

      console.log(`Contribuição total calculada: R$ ${totalJackpotContribution}`);
      console.log(`Jackpot atual na temporada: R$ ${season.jackpot}`);

      return totalJackpotContribution;
    } catch (error) {
      console.error("Erro ao recalcular jackpot:", error);
      throw error;
    }
  };

  /**
   * Corrige o jackpot de uma temporada para o valor correto
   */
  const fixSeasonJackpot = async (seasonId: string, setActiveSeason?: React.Dispatch<React.SetStateAction<Season | null>>) => {
    try {
      const correctJackpot = await recalculateSeasonJackpot(seasonId);
      const season = await pokerDB.getSeason(seasonId);
      
      if (!season) {
        throw new Error('Season not found');
      }

      const updatedSeason = {
        ...season,
        jackpot: correctJackpot
      };

      await pokerDB.saveSeason(updatedSeason);

      // Atualizar estado da temporada ativa se necessário
      if (season.isActive && setActiveSeason) {
        setActiveSeason(updatedSeason);
      }

      toast({
        title: "Jackpot Corrigido",
        description: `O jackpot foi ajustado de R$ ${season.jackpot.toFixed(2)} para R$ ${correctJackpot.toFixed(2)}`,
      });

      console.log(`Jackpot corrigido: de R$ ${season.jackpot} para R$ ${correctJackpot}`);
      
      return updatedSeason;
    } catch (error) {
      console.error("Erro ao corrigir jackpot:", error);
      toast({
        title: "Erro",
        description: "Não foi possível corrigir o jackpot.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    recalculateSeasonJackpot,
    fixSeasonJackpot
  };
}