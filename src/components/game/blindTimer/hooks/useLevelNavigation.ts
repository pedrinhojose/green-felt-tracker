
import { BlindLevel } from "@/lib/db/models";
import { TimerState } from "../useTimerState";

export function useLevelNavigation(
  blindLevels: BlindLevel[],
  state: TimerState,
  setState: React.Dispatch<React.SetStateAction<TimerState>>
) {
  const nextLevel = () => {
    if (!Array.isArray(blindLevels) || state.currentLevelIndex >= blindLevels.length - 1) {
      return;
    }
    
    setState(prev => ({
      ...prev,
      currentLevelIndex: prev.currentLevelIndex + 1,
      elapsedTimeInLevel: 0,
      showAlert: false,
    }));
  };

  const previousLevel = () => {
    if (state.currentLevelIndex > 0) {
      setState(prev => ({
        ...prev,
        currentLevelIndex: prev.currentLevelIndex - 1,
        elapsedTimeInLevel: 0,
        showAlert: false,
      }));
    }
  };

  const setLevelProgress = (percentage: number) => {
    if (!Array.isArray(blindLevels)) return;
    
    const currentLevel = blindLevels[state.currentLevelIndex];
    if (currentLevel && typeof currentLevel.duration === 'number') {
      const totalLevelTimeInSeconds = currentLevel.duration * 60;
      const newElapsedTime = Math.floor(totalLevelTimeInSeconds * (percentage / 100));
      
      setState(prev => ({
        ...prev,
        elapsedTimeInLevel: newElapsedTime,
        showAlert: false,
      }));
    }
  };

  return {
    nextLevel,
    previousLevel,
    setLevelProgress
  };
}
