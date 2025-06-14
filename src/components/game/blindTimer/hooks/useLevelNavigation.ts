
import { BlindLevel } from "@/lib/db/models";
import { TimerState } from "../useTimerState";

export function useLevelNavigation(
  blindLevels: BlindLevel[],
  state: TimerState,
  setState: React.Dispatch<React.SetStateAction<TimerState>>
) {
  const nextLevel = () => {
    console.log("=== LEVEL NAVIGATION - NEXT ===");
    console.log("Current index:", state.currentLevelIndex);
    console.log("Total levels:", blindLevels?.length);
    console.log("Current level:", blindLevels?.[state.currentLevelIndex]);
    console.log("Can advance?", state.currentLevelIndex < (blindLevels?.length || 0) - 1);
    
    if (!Array.isArray(blindLevels) || state.currentLevelIndex >= blindLevels.length - 1) {
      console.log("Cannot advance to next level - at end or invalid array");
      return;
    }
    
    const newIndex = state.currentLevelIndex + 1;
    console.log("Advancing to index:", newIndex);
    console.log("New level will be:", blindLevels[newIndex]);
    
    setState(prev => ({
      ...prev,
      currentLevelIndex: newIndex,
      elapsedTimeInLevel: 0,
      showAlert: false,
    }));
  };

  const previousLevel = () => {
    console.log("=== LEVEL NAVIGATION - PREVIOUS ===");
    console.log("Current index:", state.currentLevelIndex);
    console.log("Current level:", blindLevels?.[state.currentLevelIndex]);
    console.log("Can go back?", state.currentLevelIndex > 0);
    
    if (state.currentLevelIndex > 0) {
      const newIndex = state.currentLevelIndex - 1;
      console.log("Going back to index:", newIndex);
      console.log("Previous level will be:", blindLevels?.[newIndex]);
      
      setState(prev => ({
        ...prev,
        currentLevelIndex: newIndex,
        elapsedTimeInLevel: 0,
        showAlert: false,
      }));
    } else {
      console.log("Already at first level, cannot go back further");
      console.log("First level details:", blindLevels?.[0]);
    }
  };

  const setLevelProgress = (percentage: number) => {
    console.log("=== LEVEL NAVIGATION - SET PROGRESS ===");
    console.log("Setting progress to:", percentage + "%");
    
    if (!Array.isArray(blindLevels)) {
      console.log("Invalid blindLevels array");
      return;
    }
    
    const currentLevel = blindLevels[state.currentLevelIndex];
    if (currentLevel && typeof currentLevel.duration === 'number') {
      const totalLevelTimeInSeconds = currentLevel.duration * 60;
      const newElapsedTime = Math.floor(totalLevelTimeInSeconds * (percentage / 100));
      
      console.log("Current level duration:", currentLevel.duration, "minutes");
      console.log("Total time in seconds:", totalLevelTimeInSeconds);
      console.log("New elapsed time:", newElapsedTime);
      
      setState(prev => ({
        ...prev,
        elapsedTimeInLevel: newElapsedTime,
        showAlert: false,
      }));
    } else {
      console.log("Invalid current level or duration");
    }
  };

  return {
    nextLevel,
    previousLevel,
    setLevelProgress
  };
}
