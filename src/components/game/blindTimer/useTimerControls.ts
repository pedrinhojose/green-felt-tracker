
import { useEffect, useCallback } from "react";
import { BlindLevel } from "@/lib/db/models";
import { TimerState } from "./useTimerState";
import { useAudioEffects } from "./hooks/useAudioEffects";
import { useTimerCore } from "./hooks/useTimerCore";
import { useLevelNavigation } from "./hooks/useLevelNavigation";
import { useWindowControl } from "./hooks/useWindowControl";
import { useSoundEffects } from "./hooks/useSoundEffects";
import { useLocalStorageAudio } from "./hooks/useLocalStorageAudio";
import { useAudioContext } from "@/contexts/AudioContext";

export function useTimerControls(
  blindLevels: BlindLevel[],
  state: TimerState,
  setState: React.Dispatch<React.SetStateAction<TimerState>>,
  timeRemainingInLevel: number
) {
  // Audio context
  const { enableTimerAudio, disableTimerAudio, setGlobalAudioEnabled } = useAudioContext();
  
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
  
  // Timer core functionality - usar blindLevels ordenados
  const { startTimer: coreStartTimer, pauseTimer: corePauseTimer, cleanupTimer } = useTimerCore(
    blindLevels,
    state,
    setState,
    playLevelCompleteSound
  );
  
  // Level navigation - usar blindLevels ordenados
  const { nextLevel, previousLevel, setLevelProgress } = useLevelNavigation(
    blindLevels,
    state,
    setState
  );
  
  // Window control
  const { openInNewWindow, toggleFullScreen } = useWindowControl();
  
  // Enable timer audio when component mounts
  useEffect(() => {
    console.log("Habilitando áudio do timer ao montar componente");
    enableTimerAudio();
    
    return () => {
      console.log("Desabilitando áudio do timer ao desmontar componente");
      disableTimerAudio();
    };
  }, [enableTimerAudio, disableTimerAudio]);
  
  // Cleanup on unmount
  useEffect(() => {
    console.log("Setting up timer cleanup");
    return () => {
      cleanupTimer();
    };
  }, [cleanupTimer]);

  // Enhanced start timer that enables audio context
  const startTimer = useCallback(() => {
    console.log("=== START TIMER DEBUG ===");
    console.log("Start timer called - habilitando contexto de áudio");
    console.log("Current state before start:", state);
    console.log("BlindLevels length:", blindLevels.length);
    console.log("First blind level:", blindLevels[0]);
    
    setGlobalAudioEnabled(true);
    enableTimerAudio();
    // Try to unlock audio on start
    setTimeout(() => {
      unlockAudio();
    }, 100);
    coreStartTimer();
  }, [coreStartTimer, setGlobalAudioEnabled, enableTimerAudio, unlockAudio, state, blindLevels]);

  // Enhanced pause timer
  const pauseTimer = useCallback(() => {
    console.log("Pause timer called");
    corePauseTimer();
  }, [corePauseTimer]);

  // Enhanced toggle sound that manages audio context
  const enhancedToggleSound = useCallback(() => {
    const newSoundState = !state.soundEnabled;
    console.log(`Som ${newSoundState ? 'ativado' : 'desativado'} pelo usuário`);
    
    setGlobalAudioEnabled(newSoundState);
    if (newSoundState) {
      enableTimerAudio();
      // Try to unlock audio when user enables sound
      setTimeout(() => {
        unlockAudio();
      }, 100);
    }
    
    toggleSound();
  }, [state.soundEnabled, setGlobalAudioEnabled, enableTimerAudio, unlockAudio, toggleSound]);

  const handleNextLevel = useCallback(() => {
    console.log("=== NEXT LEVEL DEBUG ===");
    console.log("Next level called");
    console.log("Current level index before:", state.currentLevelIndex);
    console.log("Total blind levels:", blindLevels.length);
    nextLevel();
  }, [nextLevel, state.currentLevelIndex, blindLevels.length]);

  const handlePreviousLevel = useCallback(() => {
    console.log("=== PREVIOUS LEVEL DEBUG ===");
    console.log("Previous level called");
    console.log("Current level index before:", state.currentLevelIndex);
    console.log("Can go to previous?", state.currentLevelIndex > 0);
    previousLevel();
  }, [previousLevel, state.currentLevelIndex]);

  const handleLevelProgress = useCallback((percentage: number) => {
    console.log(`Level progress adjusted to ${percentage}%`);
    setLevelProgress(percentage);
  }, [setLevelProgress]);

  const handleReloadAudio = useCallback(() => {
    console.log("Reloading audio files");
    reloadAudioFiles();
  }, [reloadAudioFiles]);

  return {
    startTimer,
    pauseTimer,
    nextLevel: handleNextLevel,
    previousLevel: handlePreviousLevel,
    toggleSound: enhancedToggleSound,
    openInNewWindow,
    setLevelProgress: handleLevelProgress,
    toggleFullScreen,
    reloadAudio: handleReloadAudio,
  };
}
