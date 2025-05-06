
import { useToast } from "@/hooks/use-toast";
import { pokerDB } from '../lib/db';
import { useState, useRef } from "react";

export function useJackpotManagement(
  setSeasons: React.Dispatch<React.SetStateAction<any[]>>, 
  activeSeason: any | null, 
  setActiveSeason: React.Dispatch<React.SetStateAction<any | null>>
) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const updateInProgressRef = useRef(false);

  /**
   * Updates the jackpot amount for a season with improved state handling
   */
  const updateJackpot = async (seasonId: string, amount: number): Promise<void> => {
    // Proteção robusta contra chamadas concorrentes
    if (isUpdating || updateInProgressRef.current) {
      console.log("Operação já em andamento, ignorando solicitação adicional");
      return;
    }
    
    try {
      // Marca operação como em andamento usando ambos ref e state
      updateInProgressRef.current = true;
      setIsUpdating(true);
      
      // Pausa breve para estabilizar a interface
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Busca season diretamente do banco para garantir dados atuais
      const currentSeason = await pokerDB.getSeason(seasonId);
      if (!currentSeason) {
        throw new Error('Temporada não encontrada');
      }
      
      // Calcula novo valor com proteção contra valores negativos
      const newJackpot = Math.max(0, (currentSeason.jackpot || 0) + amount);
      
      // Cria objeto atualizado antes de salvar
      const updatedSeason = { ...currentSeason, jackpot: newJackpot };
      
      // Executa atualização no banco de dados
      await pokerDB.saveSeason(updatedSeason);
      
      // Pausa para garantir conclusão da operação
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Busca resultado confirmado do banco de dados
      const confirmedSeason = await pokerDB.getSeason(seasonId);
      
      if (!confirmedSeason) {
        throw new Error('Erro ao confirmar atualização');
      }
      
      // Atualiza seasons em batch para reduzir renderizações
      setTimeout(() => {
        setSeasons(prevSeasons => 
          prevSeasons.map(season => 
            season.id === seasonId ? confirmedSeason : season
          )
        );
        
        // Atualiza active season com atraso para evitar cascata
        if (activeSeason?.id === seasonId) {
          setTimeout(() => {
            setActiveSeason(confirmedSeason);
          }, 150);
        }
      }, 100);
      
    } catch (error) {
      console.error('Erro ao atualizar jackpot:', error);
      throw error;
    } finally {
      // Limpa refs primeiro
      updateInProgressRef.current = false;
      
      // Limpa estado com atraso para evitar problemas de UI
      setTimeout(() => {
        setIsUpdating(false);
      }, 700);
    }
  };

  return { updateJackpot, isUpdating };
}
