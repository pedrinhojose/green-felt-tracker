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
    console.log("=== LEVEL NAVIGATION - SET LEVEL PROGRESS - DETALHADO ===");
    console.log("🎯 Iniciando setLevelProgress");
    console.log("Percentage recebida:", percentage);
    console.log("Tipo da percentage:", typeof percentage);
    
    // Validações detalhadas
    console.log("=== VALIDAÇÕES ===");
    
    if (!Array.isArray(blindLevels)) {
      console.error("❌ ERRO: blindLevels não é array:", blindLevels);
      return;
    }
    console.log("✅ blindLevels é array válido");
    
    if (blindLevels.length === 0) {
      console.error("❌ ERRO: blindLevels está vazio");
      return;
    }
    console.log("✅ blindLevels tem", blindLevels.length, "elementos");
    
    if (state.currentLevelIndex < 0 || state.currentLevelIndex >= blindLevels.length) {
      console.error("❌ ERRO: currentLevelIndex inválido:", state.currentLevelIndex);
      return;
    }
    console.log("✅ currentLevelIndex válido:", state.currentLevelIndex);
    
    const currentLevel = blindLevels[state.currentLevelIndex];
    if (!currentLevel) {
      console.error("❌ ERRO: currentLevel não encontrado no índice", state.currentLevelIndex);
      return;
    }
    console.log("✅ currentLevel encontrado:", {
      level: currentLevel.level,
      duration: currentLevel.duration,
      smallBlind: currentLevel.smallBlind,
      bigBlind: currentLevel.bigBlind
    });
    
    if (typeof currentLevel.duration !== 'number' || currentLevel.duration <= 0) {
      console.error("❌ ERRO: duration inválida:", currentLevel.duration);
      return;
    }
    console.log("✅ Duration válida:", currentLevel.duration, "minutos");
    
    // Cálculos
    console.log("=== CÁLCULOS ===");
    const totalLevelTimeInSeconds = currentLevel.duration * 60;
    const newElapsedTime = Math.round(totalLevelTimeInSeconds * (percentage / 100));
    
    console.log("Cálculos detalhados:");
    console.log("- Duration em minutos:", currentLevel.duration);
    console.log("- Total em segundos:", totalLevelTimeInSeconds);
    console.log("- Percentage:", percentage + "%");
    console.log("- Cálculo: ", totalLevelTimeInSeconds, "×", (percentage / 100), "=", newElapsedTime);
    console.log("- Novo tempo elapsed:", newElapsedTime, "segundos");
    
    // Validação final
    if (newElapsedTime < 0 || newElapsedTime > totalLevelTimeInSeconds) {
      console.error("❌ ERRO: newElapsedTime fora dos limites:", {
        newElapsedTime,
        min: 0,
        max: totalLevelTimeInSeconds
      });
      return;
    }
    console.log("✅ newElapsedTime válido");
    
    // Atualizar estado
    console.log("=== ATUALIZANDO ESTADO ===");
    console.log("Estado antes da atualização:", {
      elapsedTimeInLevel: state.elapsedTimeInLevel,
      showAlert: state.showAlert
    });
    
    setState(prev => {
      const newState = {
        ...prev,
        elapsedTimeInLevel: newElapsedTime,
        showAlert: false,
      };
      
      console.log("✅ Estado atualizado com sucesso:");
      console.log("Novo estado:", {
        elapsedTimeInLevel: newState.elapsedTimeInLevel,
        showAlert: newState.showAlert
      });
      
      return newState;
    });
    
    console.log("🎉 setLevelProgress concluído com SUCESSO!");
  };

  return {
    nextLevel,
    previousLevel,
    setLevelProgress
  };
}
