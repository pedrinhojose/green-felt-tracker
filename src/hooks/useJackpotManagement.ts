
import { useToast } from "@/hooks/use-toast";
import { pokerDB } from '../lib/db';
import { useState, useRef, useCallback } from "react";

export function useJackpotManagement(
  setSeasons: React.Dispatch<React.SetStateAction<any[]>>, 
  activeSeason: any | null, 
  setActiveSeason: React.Dispatch<React.SetStateAction<any | null>>
) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const updateInProgressRef = useRef(false);

  /**
   * Updates the jackpot amount for a season
   */
  const updateJackpot = useCallback(async (seasonId: string, amount: number): Promise<void> => {
    // Proteção contra múltiplas chamadas simultâneas
    if (isUpdating || updateInProgressRef.current) return;
    
    try {
      // Marca operação como em andamento usando ref (não causa re-render)
      updateInProgressRef.current = true;
      // Atualiza estado para UI
      setIsUpdating(true);
      
      // Busca season atual diretamente do DB para garantir consistência
      const currentSeason = await pokerDB.getSeason(seasonId);
      if (!currentSeason) {
        throw new Error('Temporada não encontrada');
      }
      
      // Calcula novo valor de jackpot para evitar problemas de arredondamento
      // e garantir que o jackpot nunca seja negativo
      const newJackpot = Math.max(0, (currentSeason.jackpot || 0) + amount);
      
      // Atualiza o jackpot no objeto antes de salvar
      const updatedSeason = { ...currentSeason, jackpot: newJackpot };
      
      // Salva a temporada atualizada diretamente
      await pokerDB.saveSeason(updatedSeason);
      
      // Pausa para garantir que a operação DB seja concluída
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Busca o resultado da operação do banco
      const confirmedSeason = await pokerDB.getSeason(seasonId);
      
      if (!confirmedSeason) {
        throw new Error('Temporada não encontrada após atualização');
      }
      
      // Usa função de atualização para evitar problemas de stale state
      setSeasons(prevSeasons => 
        prevSeasons.map(season => 
          season.id === seasonId ? confirmedSeason : season
        )
      );
      
      // Atualiza apenas se necessário e com atraso para evitar cascata
      if (activeSeason?.id === seasonId) {
        setTimeout(() => {
          setActiveSeason(confirmedSeason);
        }, 100);
      }
      
    } catch (error) {
      console.error('Erro ao atualizar jackpot:', error);
      throw error;
    } finally {
      // Desativa a flag de ref primeiro
      updateInProgressRef.current = false;
      
      // Atraso maior para limpar o estado de UI para evitar problemas de renderização
      setTimeout(() => {
        setIsUpdating(false);
      }, 500);
    }
  }, [activeSeason, setActiveSeason, setSeasons, isUpdating]);

  return { updateJackpot, isUpdating };
}
