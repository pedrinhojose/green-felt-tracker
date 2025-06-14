
import { BlindLevel } from "@/lib/db/models";
import { TimerState } from "../useTimerState";

export function useLevelNavigation(
  blindLevels: BlindLevel[],
  state: TimerState,
  setState: React.Dispatch<React.SetStateAction<TimerState>>
) {
  const nextLevel = () => {
    console.log("=== NAVEGAÇÃO - PRÓXIMO NÍVEL ===");
    console.log("Índice atual:", state.currentLevelIndex);
    console.log("Total de níveis:", blindLevels?.length);
    
    if (!Array.isArray(blindLevels) || state.currentLevelIndex >= blindLevels.length - 1) {
      console.log("Não é possível avançar - no último nível");
      return;
    }
    
    const newIndex = state.currentLevelIndex + 1;
    console.log("Avançando para índice:", newIndex);
    console.log("Novo nível será:", blindLevels[newIndex]);
    
    setState(prev => ({
      ...prev,
      currentLevelIndex: newIndex,
      elapsedTimeInLevel: 0,
      showAlert: false,
    }));
  };

  const previousLevel = () => {
    console.log("=== NAVEGAÇÃO - NÍVEL ANTERIOR ===");
    console.log("Índice atual:", state.currentLevelIndex);
    
    if (state.currentLevelIndex > 0) {
      const newIndex = state.currentLevelIndex - 1;
      console.log("Voltando para índice:", newIndex);
      console.log("Nível anterior será:", blindLevels?.[newIndex]);
      
      setState(prev => ({
        ...prev,
        currentLevelIndex: newIndex,
        elapsedTimeInLevel: 0,
        showAlert: false,
      }));
    } else {
      console.log("Já está no primeiro nível (índice 0)");
      
      // FORÇAR RESET PARA ÍNDICE 0 - garantir que estamos no primeiro blind
      console.log("Forçando reset para o primeiro blind...");
      setState(prev => ({
        ...prev,
        currentLevelIndex: 0,
        elapsedTimeInLevel: 0,
        showAlert: false,
      }));
    }
  };

  const setLevelProgress = (percentage: number) => {
    console.log("=== NAVEGAÇÃO - DEFINIR PROGRESSO ===");
    console.log("Definindo progresso para:", percentage + "%");
    
    if (!Array.isArray(blindLevels)) {
      console.log("Array de blinds inválido");
      return;
    }
    
    const currentLevel = blindLevels[state.currentLevelIndex];
    if (currentLevel && typeof currentLevel.duration === 'number') {
      const totalLevelTimeInSeconds = currentLevel.duration * 60;
      const newElapsedTime = Math.floor(totalLevelTimeInSeconds * (percentage / 100));
      
      console.log("Duração do nível atual:", currentLevel.duration, "minutos");
      console.log("Tempo total em segundos:", totalLevelTimeInSeconds);
      console.log("Novo tempo decorrido:", newElapsedTime);
      
      setState(prev => ({
        ...prev,
        elapsedTimeInLevel: newElapsedTime,
        showAlert: false,
      }));
    } else {
      console.log("Nível atual ou duração inválidos");
    }
  };

  return {
    nextLevel,
    previousLevel,
    setLevelProgress
  };
}
