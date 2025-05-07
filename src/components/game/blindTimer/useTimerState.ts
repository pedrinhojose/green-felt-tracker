
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
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    currentLevelIndex: 0,
    elapsedTimeInLevel: 0,
    totalElapsedTime: 0,
    showAlert: false,
    soundEnabled: true,
  });

  // Use our new focused hooks
  const { timeRemainingInLevel, currentLevel, nextLevel } = useLevelTime(
    blindLevels, 
    state.currentLevelIndex, 
    state.elapsedTimeInLevel
  );
  
  const { isAlertTime, isFinalCountdown, isLevelJustCompleted, isNewBlindAlert } = useTimerAlerts(
    currentLevel,
    timeRemainingInLevel,
    state
  );
  
  const { nextBreak, levelsUntilBreak } = useBreakInfo(
    blindLevels,
    state.currentLevelIndex
  );

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
  };
}
