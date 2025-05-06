
import { useToast } from "@/components/ui/use-toast";
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
  const updateJackpot = async (seasonId: string, amount: number) => {
    try {
      await pokerDB.updateJackpot(seasonId, amount);
      
      // Fetch the updated season
      const updatedSeason = await pokerDB.getSeason(seasonId);
      
      if (updatedSeason) {
        // Update local state
        setSeasons(prev => {
          const index = prev.findIndex(s => s.id === seasonId);
          if (index >= 0) {
            return [...prev.slice(0, index), updatedSeason, ...prev.slice(index + 1)];
          }
          return prev;
        });
        
        // If active season, update it too
        if (activeSeason?.id === seasonId) {
          setActiveSeason(updatedSeason);
        }
        
        toast({
          title: amount >= 0 ? "Jackpot Aumentado" : "Jackpot Reduzido",
          description: `O valor de ${Math.abs(amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} foi ${amount >= 0 ? 'adicionado ao' : 'removido do'} jackpot.`,
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar jackpot:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o jackpot. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return { updateJackpot };
}
