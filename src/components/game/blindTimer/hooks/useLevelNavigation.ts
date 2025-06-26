
import { BlindLevel } from "@/lib/db/models";
import { TimerState } from "../useTimerState";

export function useLevelNavigation(
  blindLevels: BlindLevel[],
  state: TimerState,
  setState: React.Dispatch<React.SetStateAction<TimerState>>
) {
  const nextLevel = () => {
    console.log("=== PRÓXIMO NÍVEL ===");
    if (!Array.isArray(blindLevels) || state.currentLevelIndex >= blindLevels.length - 1) {
      console.log("Não é possível avançar");
      return;
    }
    
    const newIndex = state.currentLevelIndex + 1;
    console.log(`Avançando para índice ${newIndex}`);
    
    setState(prev => ({
      ...prev,
      currentLevelIndex: newIndex,
      elapsedTimeInLevel: 0,
      showAlert: false,
    }));
  };

  const previousLevel = () => {
    console.log("=== NÍVEL ANTERIOR ===");
    if (state.currentLevelIndex > 0) {
      const newIndex = state.currentLevelIndex - 1;
      console.log(`Voltando para índice ${newIndex}`);
      
      setState(prev => ({
        ...prev,
        currentLevelIndex: newIndex,
        elapsedTimeInLevel: 0,
        showAlert: false,
      }));
    } else {
      console.log("Forçando reset para índice 0");
      setState(prev => ({
        ...prev,
        currentLevelIndex: 0,
        elapsedTimeInLevel: 0,
        showAlert: false,
      }));
    }
  };

  const setLevelProgress = (percentage: number) => {
    console.log("=== SET LEVEL PROGRESS ===");
    console.log(`✅ Recebido: ${percentage}%`);
    
    if (!Array.isArray(blindLevels) || blindLevels.length === 0) {
      console.error("❌ Blinds inválidos");
      return;
    }
    
    if (state.currentLevelIndex < 0 || state.currentLevelIndex >= blindLevels.length) {
      console.error("❌ Índice inválido:", state.currentLevelIndex);
      return;
    }
    
    const currentLevel = blindLevels[state.currentLevelIndex];
    if (!currentLevel || typeof currentLevel.duration !== 'number' || currentLevel.duration <= 0) {
      console.error("❌ Level inválido:", currentLevel);
      return;
    }
    
    const totalLevelTimeInSeconds = currentLevel.duration * 60;
    const newElapsedTime = Math.round(totalLevelTimeInSeconds * (percentage / 100));
    
    console.log("Cálculo:", {
      duration: currentLevel.duration,
      totalSeconds: totalLevelTimeInSeconds,
      percentage,
      newElapsedTime
    });
    
    if (newElapsedTime < 0 || newElapsedTime > totalLevelTimeInSeconds) {
      console.error("❌ Tempo calculado inválido:", newElapsedTime);
      return;
    }
    
    console.log("✅ Atualizando estado com tempo:", newElapsedTime);
    
    setState(prev => ({
      ...prev,
      elapsedTimeInLevel: newElapsedTime,
      showAlert: false,
    }));
    
    console.log("🎉 Progress atualizado com sucesso!");
  };

  return {
    nextLevel,
    previousLevel,
    setLevelProgress
  };
}
