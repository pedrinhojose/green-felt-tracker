
import { useEffect, useCallback } from "react";
import { BlindLevel } from "@/lib/db/models";
import { TimerState } from "./useTimerState";
import { useAudioEffects } from "./hooks/useAudioEffects";
import { useTimerCore } from "./hooks/useTimerCore";
import { useLevelNavigation } from "./hooks/useLevelNavigation";
import { useWindowControl } from "./hooks/useWindowControl";
import { useSoundEffects } from "./hooks/useSoundEffects";
import { useLocalStorageAudio } from "./hooks/useLocalStorageAudio";

export function useTimerControls(
  blindLevels: BlindLevel[],
  state: TimerState,
  setState: React.Dispatch<React.SetStateAction<TimerState>>,
  timeRemainingInLevel: number
) {
  // Audio setup
  const { audioRefs, playAudioSafely, unlockAudio } = useAudioEffects();
  
  // Local storage audio management
  const { reloadAudioFiles } = useLocalStorageAudio();
  
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
    playLevelCompleteSound
  );
  
  // Level navigation
  const { nextLevel, previousLevel, setLevelProgress } = useLevelNavigation(
    blindLevels,
    state,
    setState
  );
  
  // Window control
  const { openInNewWindow, toggleFullScreen } = useWindowControl();
  
  // Try to unlock audio when component mounts
  useEffect(() => {
    console.log("Setting up event handlers to unlock audio");
    
    // Try to unlock audio when component mounts
    const unblockAudioOnUserAction = () => {
      console.log("User interaction detected, trying to unlock audio");
      unlockAudio();
      // Remove event listeners after first interaction
      document.removeEventListener('click', unblockAudioOnUserAction);
      document.removeEventListener('touchstart', unblockAudioOnUserAction);
    };
    
    // Add event listeners to unlock audio on first interaction
    document.addEventListener('click', unblockAudioOnUserAction);
    document.addEventListener('touchstart', unblockAudioOnUserAction);
    
    return () => {
      // Remove event listeners if component unmounts
      document.removeEventListener('click', unblockAudioOnUserAction);
      document.removeEventListener('touchstart', unblockAudioOnUserAction);
    };
  }, [unlockAudio]);
  
  // Cleanup on unmount
  useEffect(() => {
    console.log("Setting up timer cleanup");
    return () => {
      cleanupTimer();
    };
  }, [cleanupTimer]);

  // Wrappers for functions that need memoization
  const handleStartTimer = useCallback(() => {
    console.log("Start timer called");
    startTimer();
  }, [startTimer]);

  const handlePauseTimer = useCallback(() => {
    console.log("Pause timer called");
    pauseTimer();
  }, [pauseTimer]);

  const handleNextLevel = useCallback(() => {
    console.log("Next level called");
    nextLevel();
  }, [nextLevel]);

  const handlePreviousLevel = useCallback(() => {
    console.log("Previous level called");
    previousLevel();
  }, [previousLevel]);

  const handleLevelProgress = useCallback((percentage: number) => {
    console.log(`Level progress adjusted to ${percentage}%`);
    setLevelProgress(percentage);
  }, [setLevelProgress]);

  const handleReloadAudio = useCallback(() => {
    console.log("Reloading audio files");
    reloadAudioFiles();
  }, [reloadAudioFiles]);

  return {
    startTimer: handleStartTimer,
    pauseTimer: handlePauseTimer,
    nextLevel: handleNextLevel,
    previousLevel: handlePreviousLevel,
    toggleSound,
    openInNewWindow,
    setLevelProgress: handleLevelProgress,
    toggleFullScreen,
    reloadAudio: handleReloadAudio,
  };
}
