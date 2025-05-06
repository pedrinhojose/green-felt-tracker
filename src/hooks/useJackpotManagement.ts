
import { useToast } from "@/hooks/use-toast";
import { pokerDB } from '../lib/db';
import { useState } from "react";

export function useJackpotManagement(
  setSeasons: React.Dispatch<React.SetStateAction<any[]>>, 
  activeSeason: any | null, 
  setActiveSeason: React.Dispatch<React.SetStateAction<any | null>>
) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Atualiza o jackpot com uma implementação simplificada para evitar travamentos
   */
  const updateJackpot = async (seasonId: string, amount: number): Promise<void> => {
    if (isUpdating) {
      console.log("Operação já em andamento");
      return;
    }
    
    try {
      setIsUpdating(true);
      
      // Usa método direto do repositório para atualizar o jackpot
      await pokerDB.updateJackpot(seasonId, amount);
      
      // Busca a temporada atualizada
      const updatedSeason = await pokerDB.getSeason(seasonId);
      
      if (!updatedSeason) {
        throw new Error('Erro ao confirmar atualização');
      }
      
      // Atualiza os estados com os novos dados
      setSeasons(prevSeasons => 
        prevSeasons.map(season => 
          season.id === seasonId ? updatedSeason : season
        )
      );
      
      // Se for a temporada ativa, atualiza também
      if (activeSeason?.id === seasonId) {
        setActiveSeason(updatedSeason);
      }
      
      return;
    } catch (error) {
      console.error('Erro ao atualizar jackpot:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o jackpot.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateJackpot, isUpdating };
}
