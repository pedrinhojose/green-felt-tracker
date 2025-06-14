
import { useState } from "react";
import { BlindLevel } from "@/lib/db/models";
import { useLevelTime } from "./hooks/useLevelTime";
import { useTimerAlerts } from "./hooks/useTimerAlerts";
import { useBreakInfo } from "./hooks/useBreakInfo";

export interface TimerState {
  isRunning: boolean;
  currentLevelIndex: number;
  elapsedTimeInLevel: number;
  totalElapsedTime: number;
  showAlert: boolean;
  soundEnabled: boolean;
}

export function useTimerState(blindLevels: BlindLevel[]) {
  // Garantir que os blinds estejam ordenados corretamente pelo nível
  const sortedBlindLevels = [...blindLevels].sort((a, b) => a.level - b.level);
  
  console.log("=== TIMER STATE DEBUG ===");
  console.log("Original blindLevels:", blindLevels);
  console.log("Sorted blindLevels:", sortedBlindLevels);
  console.log("First blind should be:", sortedBlindLevels[0]);
  
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    currentLevelIndex: 0, // Sempre iniciar no primeiro nível
    elapsedTimeInLevel: 0,
    totalElapsedTime: 0,
    showAlert: false,
    soundEnabled: true,
  });

  console.log("Current timer state:", state);
  console.log("Current level index:", state.currentLevelIndex);
  console.log("Blind at current index:", sortedBlindLevels[state.currentLevelIndex]);

  // Use our new focused hooks with sorted blind levels
  const { timeRemainingInLevel, currentLevel, nextLevel } = useLevelTime(
    sortedBlindLevels, 
    state.currentLevelIndex, 
    state.elapsedTimeInLevel
  );
  
  const { isAlertTime, isFinalCountdown, isLevelJustCompleted, isNewBlindAlert } = useTimerAlerts(
    currentLevel,
    timeRemainingInLevel,
    state
  );
  
  const { nextBreak, levelsUntilBreak } = useBreakInfo(
    sortedBlindLevels,
    state.currentLevelIndex
  );

  console.log("Calculated currentLevel:", currentLevel);
  console.log("Calculated nextLevel:", nextLevel);

  return {
    state,
    setState,
    currentLevel,
    nextLevel,
    timeRemainingInLevel,
    isAlertTime,
    isFinalCountdown,
    isLevelJustCompleted,
    isNewBlindAlert,
    nextBreak,
    levelsUntilBreak,
    sortedBlindLevels, // Retornar os blinds ordenados
  };
}
