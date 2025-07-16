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
    console.log("=== START TIMER - CORREÇÃO DEFINITIVA ===");
    console.log("Tentando iniciar timer...");
    console.log("Estado atual:", state);
    console.log("Blind levels:", blindLevels?.length || 0);
    
    // Validação básica - apenas verificar se existem blind levels
    if (!blindLevels || blindLevels.length === 0) {
      console.error("❌ ERRO: Não é possível iniciar - blind levels não configurados");
      return;
    }
    
    // FORÇAR SEMPRE INICIAR DO NÍVEL 0 - correção definitiva
    if (state.currentLevelIndex !== 0) {
      console.log("⚠️ CORREÇÃO: Forçando timer a começar do nível 0");
      setState(prev => ({
        ...prev,
        currentLevelIndex: 0,
        elapsedTimeInLevel: 0,
        totalElapsedTime: 0,
        showAlert: false,
        isRunning: false // Resetar para garantir estado limpo
      }));
      
      // Aguardar atualização do estado antes de iniciar
      setTimeout(() => {
        console.log("✅ Estado corrigido, iniciando timer...");
        unlockAudio();
        coreStartTimer();
      }, 100);
      return;
    }
    
    // Verificar se o primeiro blind é válido
    const firstBlind = blindLevels[0];
    if (!firstBlind) {
      console.error("❌ ERRO: Primeiro blind não encontrado");
      return;
    }
    
    console.log("✅ INICIANDO TIMER:");
    console.log("- Nível atual:", 0);
    console.log("- Blind:", `${firstBlind.smallBlind}/${firstBlind.bigBlind}`);
    
    // Unlock audio when starting timer (important for mobile)
    unlockAudio();
    
    // Use the core timer start function
    coreStartTimer();
  }, [unlockAudio, coreStartTimer, state, blindLevels, setState]);

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

  const resetTimer = useCallback(() => {
    console.log("=== RESET TIMER - CORREÇÃO DEFINITIVA ===");
    console.log("Resetando timer para o primeiro nível");
    
    // Pause timer first
    corePauseTimer();
    
    // Limpar dados persistidos - força reset completo
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('timer_state_') || key.startsWith('timer_backup_')) {
          localStorage.removeItem(key);
          console.log(`✅ Removido: ${key}`);
        }
      });
    } catch (error) {
      console.error("Erro ao limpar localStorage:", error);
    }
    
    // Reset state to initial values
    setState(prev => ({
      ...prev,
      isRunning: false,
      currentLevelIndex: 0,
      elapsedTimeInLevel: 0,
      totalElapsedTime: 0,
      showAlert: false
    }));
    
    console.log("✅ Timer resetado com sucesso - dados persistidos limpos");
  }, [corePauseTimer, setState]);

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
    resetTimer,
    hasOpenedNewWindow
  };
}
