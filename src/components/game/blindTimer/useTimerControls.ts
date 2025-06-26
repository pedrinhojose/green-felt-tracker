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
  const { enableTimerAudio, disableTimerAudio, setGlobalAudioEnabled, isTimerAudioActive, isAudioEnabled } = useAudioContext();
  
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
    console.log("=== TIMER CONTROLS - INICIALIZANDO ÁUDIO ===");
    console.log("Estado atual do áudio:", { isTimerAudioActive, isAudioEnabled });
    console.log("Habilitando áudio do timer ao montar componente");
    enableTimerAudio();
    setGlobalAudioEnabled(true);
    
    // Try to unlock audio immediately
    setTimeout(() => {
      console.log("Tentando desbloquear áudio após inicialização");
      unlockAudio();
    }, 500);
    
    return () => {
      console.log("Timer controls desmontando - desabilitando áudio do timer");
      disableTimerAudio();
    };
  }, [enableTimerAudio, disableTimerAudio, setGlobalAudioEnabled]);
  
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
    console.log("Estado do áudio:", { isTimerAudioActive, isAudioEnabled });
    
    setGlobalAudioEnabled(true);
    enableTimerAudio();
    
    // Try to unlock audio on start
    setTimeout(() => {
      console.log("Desbloqueando áudio após iniciar timer");
      unlockAudio();
    }, 100);
    
    coreStartTimer();
  }, [coreStartTimer, setGlobalAudioEnabled, enableTimerAudio, unlockAudio, state, blindLevels, isTimerAudioActive, isAudioEnabled]);

  // Enhanced pause timer
  const pauseTimer = useCallback(() => {
    console.log("Pause timer called");
    corePauseTimer();
  }, [corePauseTimer]);

  // Enhanced toggle sound that manages audio context
  const enhancedToggleSound = useCallback(() => {
    const newSoundState = !state.soundEnabled;
    console.log(`=== TOGGLE SOUND ===`);
    console.log(`Som ${newSoundState ? 'ativado' : 'desativado'} pelo usuário`);
    console.log("Estado atual do áudio:", { isTimerAudioActive, isAudioEnabled });
    
    setGlobalAudioEnabled(newSoundState);
    if (newSoundState) {
      enableTimerAudio();
      // Try to unlock audio when user enables sound
      setTimeout(() => {
        console.log("Desbloqueando áudio após usuário ativar som");
        unlockAudio();
      }, 100);
    }
    
    toggleSound();
  }, [state.soundEnabled, setGlobalAudioEnabled, enableTimerAudio, unlockAudio, toggleSound, isTimerAudioActive, isAudioEnabled]);

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
    console.log("=== TIMER CONTROLS - LEVEL PROGRESS HANDLER ===");
    console.log(`✅ Handler chamado com sucesso! Percentage: ${percentage}%`);
    console.log("Estado atual completo:", {
      currentLevelIndex: state.currentLevelIndex,
      elapsedTimeInLevel: state.elapsedTimeInLevel,
      isRunning: state.isRunning,
      totalElapsedTime: state.totalElapsedTime
    });
    
    // Validação básica
    if (typeof percentage !== 'number' || isNaN(percentage)) {
      console.error("❌ ERRO: Percentage inválida:", percentage);
      return;
    }
    
    if (percentage < 0 || percentage > 100) {
      console.error("❌ ERRO: Percentage fora do range 0-100:", percentage);
      return;
    }
    
    console.log("✅ Percentage validada com sucesso");
    console.log("Blind levels disponíveis:", blindLevels.length);
    console.log("Blind level atual:", blindLevels[state.currentLevelIndex]);
    
    // Chamar a função de navegação
    console.log("Chamando setLevelProgress...");
    setLevelProgress(percentage);
    console.log("setLevelProgress chamado com sucesso");
    
  }, [setLevelProgress, state, blindLevels]);

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
