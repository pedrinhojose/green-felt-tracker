import { useCallback, useEffect, useState } from "react";
import { BlindLevel } from "@/lib/db/models";
import { TimerState } from "./useTimerState";
import { useAudioEffects } from "./hooks/useAudioEffects";
import { useSoundEffects } from "./hooks/useSoundEffects";
import { useTimerCore } from "./hooks/useTimerCore";
import { useWindowControl } from "./hooks/useWindowControl";

export function useTimerControls(
  blindLevels: BlindLevel[],
  state: TimerState,
  setState: React.Dispatch<React.SetStateAction<TimerState>>,
  timeRemainingInLevel: number
) {
  console.log("=== useTimerControls DEBUG ===");
  console.log("Blind levels received:", blindLevels?.length || 0);
  console.log("Current state:", {
    isRunning: state.isRunning,
    soundEnabled: state.soundEnabled,
    currentLevelIndex: state.currentLevelIndex
  });

  // State to track if a new window has been opened
  const [hasOpenedNewWindow, setHasOpenedNewWindow] = useState(false);

  // Initialize audio effects
  const { audioRefs, playAudioSafely, unlockAudio } = useAudioEffects();
  
  // Initialize sound effects
  const { toggleSound, playLevelCompleteSound } = useSoundEffects(
    timeRemainingInLevel,
    state,
    setState,
    audioRefs,
    playAudioSafely
  );

  // Initialize timer core
  const { 
    startTimer: coreStartTimer, 
    pauseTimer: corePauseTimer, 
    cleanupTimer 
  } = useTimerCore(
    blindLevels,
    state,
    setState,
    playLevelCompleteSound
  );

  // Initialize window control
  const { openInNewWindow: windowOpenInNewWindow, toggleFullScreen: windowToggleFullScreen } = useWindowControl();

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      cleanupTimer();
    };
  }, [cleanupTimer]);

  const startTimer = useCallback(() => {
    console.log("=== START TIMER ===");
    console.log("Attempting to start timer");
    console.log("Current state:", state);
    console.log("Blind levels:", blindLevels?.length);
    
    if (!blindLevels || blindLevels.length === 0) {
      console.error("Cannot start timer - empty blind structure");
      return;
    }
    
    // Always start from level 0
    if (state.currentLevelIndex !== 0) {
      console.log("Forcing start from level 0");
      setState(prev => ({
        ...prev,
        currentLevelIndex: 0,
        elapsedTimeInLevel: 0,
        totalElapsedTime: 0,
        isRunning: false
      }));
      return;
    }
    
    console.log("Starting timer at level 0");
    coreStartTimer();
  }, [blindLevels, state, setState, coreStartTimer]);

  const pauseTimer = useCallback(() => {
    console.log("=== PAUSE TIMER ===");
    // Use the core timer pause function
    corePauseTimer();
  }, [corePauseTimer]);

  const nextLevel = useCallback(() => {
    console.log("=== NEXT LEVEL ===");
    console.log("Advancing to next level...");
    
    if (state.currentLevelIndex < blindLevels.length - 1) {
      const newIndex = state.currentLevelIndex + 1;
      console.log(`Moving from level ${state.currentLevelIndex} to ${newIndex}`);
      
      setState(prev => ({
        ...prev,
        currentLevelIndex: newIndex,
        elapsedTimeInLevel: 0,
        showAlert: false
      }));
      
      // Play sound when manually advancing level
      if (state.soundEnabled) {
        console.log("Playing level complete sound (manual)");
        setTimeout(() => playLevelCompleteSound(), 100);
      }
    } else {
      console.log("Already at last level, cannot advance");
    }
  }, [state.currentLevelIndex, state.soundEnabled, blindLevels.length, setState, playLevelCompleteSound]);

  const previousLevel = useCallback(() => {
    console.log("=== PREVIOUS LEVEL ===");
    console.log("Going back to previous level...");
    
    if (state.currentLevelIndex > 0) {
      const newIndex = state.currentLevelIndex - 1;
      console.log(`Moving from level ${state.currentLevelIndex} to ${newIndex}`);
      
      setState(prev => ({
        ...prev,
        currentLevelIndex: newIndex,
        elapsedTimeInLevel: 0,
        showAlert: false
      }));
    } else {
      console.log("Already at first level, cannot go back");
    }
  }, [state.currentLevelIndex, setState]);

  const setLevelProgress = useCallback((percentage: number) => {
    console.log("=== SET LEVEL PROGRESS ===");
    console.log(`Setting progress to ${percentage}%`);
    
    const currentLevel = blindLevels[state.currentLevelIndex];
    if (currentLevel) {
      const totalLevelTime = currentLevel.duration * 60;
      const newElapsedTime = Math.floor((percentage / 100) * totalLevelTime);
      
      console.log(`Level total time: ${totalLevelTime}s, new elapsed time: ${newElapsedTime}s`);
      
      setState(prev => ({
        ...prev,
        elapsedTimeInLevel: newElapsedTime
      }));
    }
  }, [blindLevels, state.currentLevelIndex, setState]);

  const openInNewWindow = useCallback(() => {
    console.log("=== OPEN IN NEW WINDOW ===");
    setHasOpenedNewWindow(true);
    windowOpenInNewWindow();
  }, [windowOpenInNewWindow]);

  const toggleFullScreen = useCallback(() => {
    console.log("=== TOGGLE FULLSCREEN ===");
    windowToggleFullScreen();
  }, [windowToggleFullScreen]);

  const reloadAudio = useCallback(() => {
    console.log("=== RELOAD AUDIO ===");
    console.log("Attempting to reload audio files...");
    
    // Force audio unlock
    unlockAudio();
    
    // Test audio playback
    if (state.soundEnabled && audioRefs.alertAudioRef.current) {
      console.log("Testing playback after reload...");
      setTimeout(() => {
        playAudioSafely(audioRefs.alertAudioRef, state.soundEnabled);
      }, 500);
    }
  }, [unlockAudio, state.soundEnabled, audioRefs.alertAudioRef, playAudioSafely]);

  return {
    startTimer,
    pauseTimer,
    nextLevel,
    previousLevel,
    setLevelProgress,
    toggleSound,
    openInNewWindow,
    toggleFullScreen,
    reloadAudio,
    hasOpenedNewWindow
  };
}