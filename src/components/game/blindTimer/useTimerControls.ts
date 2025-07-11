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
  console.log("=== useTimerControls - INICIALIZANDO ===");
  console.log("Blind levels recebidos:", blindLevels?.length || 0);
  console.log("Estado atual:", {
    isRunning: state.isRunning,
    soundEnabled: state.soundEnabled,
    currentLevelIndex: state.currentLevelIndex
  });

  // Estado para controlar se uma nova janela foi aberta
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
    console.log("Tentando iniciar timer...");
    
    // Unlock audio when starting timer (important for mobile)
    unlockAudio();
    
    // Use the core timer start function
    coreStartTimer();
  }, [unlockAudio, coreStartTimer]);

  const pauseTimer = useCallback(() => {
    console.log("=== PAUSE TIMER ===");
    // Use the core timer pause function
    corePauseTimer();
  }, [corePauseTimer]);

  const nextLevel = useCallback(() => {
    console.log("=== NEXT LEVEL ===");
    console.log("Avançando para próximo nível...");
    
    if (state.currentLevelIndex < blindLevels.length - 1) {
      const newIndex = state.currentLevelIndex + 1;
      console.log(`Mudando do nível ${state.currentLevelIndex} para ${newIndex}`);
      
      setState(prev => ({
        ...prev,
        currentLevelIndex: newIndex,
        elapsedTimeInLevel: 0,
        showAlert: false
      }));
      
      // Play sound when manually advancing level
      if (state.soundEnabled) {
        console.log("Reproduzindo som de conclusão de nível (manual)");
        setTimeout(() => playLevelCompleteSound(), 100);
      }
    } else {
      console.log("Já no último nível, não é possível avançar");
    }
  }, [state.currentLevelIndex, state.soundEnabled, blindLevels.length, setState, playLevelCompleteSound]);

  const previousLevel = useCallback(() => {
    console.log("=== PREVIOUS LEVEL ===");
    console.log("Voltando para nível anterior...");
    
    if (state.currentLevelIndex > 0) {
      const newIndex = state.currentLevelIndex - 1;
      console.log(`Mudando do nível ${state.currentLevelIndex} para ${newIndex}`);
      
      setState(prev => ({
        ...prev,
        currentLevelIndex: newIndex,
        elapsedTimeInLevel: 0,
        showAlert: false
      }));
    } else {
      console.log("Já no primeiro nível, não é possível voltar");
    }
  }, [state.currentLevelIndex, setState]);

  const setLevelProgress = useCallback((percentage: number) => {
    console.log("=== SET LEVEL PROGRESS ===");
    console.log(`Definindo progresso para ${percentage}%`);
    
    const currentLevel = blindLevels[state.currentLevelIndex];
    if (currentLevel) {
      const totalLevelTime = currentLevel.duration * 60;
      const newElapsedTime = Math.floor((percentage / 100) * totalLevelTime);
      
      console.log(`Tempo total do nível: ${totalLevelTime}s, novo tempo decorrido: ${newElapsedTime}s`);
      
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
    console.log("Tentando recarregar arquivos de áudio...");
    
    // Force audio unlock
    unlockAudio();
    
    // Test audio playback
    if (state.soundEnabled && audioRefs.alertAudioRef.current) {
      console.log("Testando reprodução após reload...");
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
    toggleSound,
    openInNewWindow,
    setLevelProgress,
    toggleFullScreen,
    reloadAudio,
    hasOpenedNewWindow
  };
}
