
import { useToast } from "@/hooks/use-toast";
import { pokerDB } from '../lib/db';

export function useJackpotManagement(
  setSeasons: React.Dispatch<React.SetStateAction<any[]>>, 
  activeSeason: any | null, 
  setActiveSeason: React.Dispatch<React.SetStateAction<any | null>>
) {
  const { toast } = useToast();

  /**
   * Updates the jackpot amount for a season
   */
  const updateJackpot = async (seasonId: string, amount: number): Promise<void> => {
    try {
      // Atualizar o jackpot no banco de dados diretamente
      // Esta operação é atômica e menos propensa a problemas de concorrência
      await pokerDB.updateJackpot(seasonId, amount);
      
      // Buscar a temporada atualizada depois da operação de banco de dados
      const updatedSeason = await pokerDB.getSeason(seasonId);
      
      if (!updatedSeason) {
        throw new Error('Temporada não encontrada após atualização');
      }
      
      // Atualizar os estados de forma segura
      setSeasons(prev => prev.map(season => 
        season.id === seasonId ? updatedSeason : season
      ));
      
      // Se for a temporada ativa, atualizar também
      if (activeSeason?.id === seasonId) {
        setActiveSeason(updatedSeason);
      }
    } catch (error) {
      console.error('Erro ao atualizar jackpot:', error);
      throw error;
    }
  };

  return { updateJackpot };
}
