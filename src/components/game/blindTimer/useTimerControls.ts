
import { useCallback } from "react";
import { BlindLevel } from "@/lib/db/models";
import { TimerState } from "./useTimerState";
import { useAudioEffects } from "./hooks/useAudioEffects";
import { useSoundEffects } from "./hooks/useSoundEffects";

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

  const startTimer = useCallback(() => {
    console.log("=== START TIMER ===");
    console.log("Tentando iniciar timer...");
    
    // Unlock audio when starting timer (important for mobile)
    unlockAudio();
    
    setState(prev => {
      console.log("Estado anterior:", prev);
      const newState = { ...prev, isRunning: true };
      console.log("Novo estado:", newState);
      return newState;
    });
  }, [unlockAudio, setState]);

  const pauseTimer = useCallback(() => {
    console.log("=== PAUSE TIMER ===");
    setState(prev => ({ ...prev, isRunning: false }));
  }, [setState]);

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
    const url = window.location.href;
    const newWindow = window.open(url, '_blank', 'width=1200,height=800');
    
    if (newWindow) {
      console.log("Nova janela aberta com sucesso");
    } else {
      console.log("Falha ao abrir nova janela (popup bloqueado?)");
    }
  }, []);

  const toggleFullScreen = useCallback(() => {
    console.log("=== TOGGLE FULLSCREEN ===");
    
    if (!document.fullscreenElement) {
      console.log("Entrando em tela cheia...");
      document.documentElement.requestFullscreen().catch(err => {
        console.error("Erro ao entrar em tela cheia:", err);
      });
    } else {
      console.log("Saindo de tela cheia...");
      document.exitFullscreen().catch(err => {
        console.error("Erro ao sair de tela cheia:", err);
      });
    }
  }, []);

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
    reloadAudio
  };
}
