
import { useEffect } from "react";
import { BlindLevel } from "@/lib/db/models";
import { TimerState } from "./useTimerState";
import { useAudioEffects } from "./hooks/useAudioEffects";
import { useTimerCore } from "./hooks/useTimerCore";
import { useLevelNavigation } from "./hooks/useLevelNavigation";
import { useWindowControl } from "./hooks/useWindowControl";
import { useSoundEffects } from "./hooks/useSoundEffects";

export function useTimerControls(
  blindLevels: BlindLevel[],
  state: TimerState,
  setState: React.Dispatch<React.SetStateAction<TimerState>>,
  timeRemainingInLevel: number
) {
  // Audio setup
  const { audioRefs, playAudioSafely } = useAudioEffects();
  
  // Sound effects
  const { toggleSound, playLevelCompleteSound } = useSoundEffects(
    timeRemainingInLevel,
    state,
    setState,
    audioRefs,
    playAudioSafely
  );
  
  // Timer core functionality
  const { startTimer, pauseTimer, cleanupTimer } = useTimerCore(
    blindLevels,
    state,
    setState,
    () => playLevelCompleteSound()
  );
  
  // Level navigation
  const { nextLevel, previousLevel, setLevelProgress } = useLevelNavigation(
    blindLevels,
    state,
    setState
  );
  
  // Window control
  const { openInNewWindow, toggleFullScreen } = useWindowControl();
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupTimer();
    };
  }, []);

  return {
    startTimer,
    pauseTimer,
    nextLevel,
    previousLevel,
    toggleSound,
    openInNewWindow,
    setLevelProgress,
    toggleFullScreen,
  };
}
