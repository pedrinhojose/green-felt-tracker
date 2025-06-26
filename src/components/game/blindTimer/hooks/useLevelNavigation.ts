
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
    console.log("=== NAVEGAÇÃO - DEFINIR PROGRESSO - DETALHADO ===");
    console.log("Percentage recebida:", percentage);
    console.log("Estado atual:", {
      currentLevelIndex: state.currentLevelIndex,
      elapsedTimeInLevel: state.elapsedTimeInLevel,
      isRunning: state.isRunning
    });
    
    if (!Array.isArray(blindLevels)) {
      console.log("ERRO: Array de blinds inválido:", blindLevels);
      return;
    }
    
    if (state.currentLevelIndex < 0 || state.currentLevelIndex >= blindLevels.length) {
      console.log("ERRO: Índice de nível inválido:", state.currentLevelIndex);
      return;
    }
    
    const currentLevel = blindLevels[state.currentLevelIndex];
    console.log("Nível atual encontrado:", currentLevel);
    
    if (!currentLevel) {
      console.log("ERRO: Nível atual não encontrado");
      return;
    }
    
    if (typeof currentLevel.duration !== 'number' || currentLevel.duration <= 0) {
      console.log("ERRO: Duração do nível inválida:", currentLevel.duration);
      return;
    }
    
    const totalLevelTimeInSeconds = currentLevel.duration * 60;
    const newElapsedTime = Math.floor(totalLevelTimeInSeconds * (percentage / 100));
    
    console.log("Cálculos:");
    console.log("- Duração do nível:", currentLevel.duration, "minutos");
    console.log("- Tempo total em segundos:", totalLevelTimeInSeconds);
    console.log("- Percentage:", percentage, "%");
    console.log("- Novo tempo decorrido:", newElapsedTime);
    
    // Validar se o novo tempo está dentro dos limites
    if (newElapsedTime < 0 || newElapsedTime > totalLevelTimeInSeconds) {
      console.log("ERRO: Novo tempo fora dos limites:", newElapsedTime);
      return;
    }
    
    console.log("Atualizando estado com novo tempo:", newElapsedTime);
    
    setState(prev => {
      const newState = {
        ...prev,
        elapsedTimeInLevel: newElapsedTime,
        showAlert: false,
      };
      console.log("Estado sendo atualizado:", newState);
      return newState;
    });
    
    console.log("setLevelProgress concluído com sucesso");
  };

  return {
    nextLevel,
    previousLevel,
    setLevelProgress
  };
}
