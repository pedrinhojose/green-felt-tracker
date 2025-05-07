
import { useEffect, useCallback } from "react";
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
  const { audioRefs, playAudioSafely, unlockAudio } = useAudioEffects();
  
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
  
  // Tenta desbloquear o áudio quando o componente é montado
  useEffect(() => {
    console.log("Configurando manipuladores de eventos para desbloquear áudio");
    
    // Tenta desbloquear o áudio na montagem do componente
    const unblockAudioOnUserAction = () => {
      console.log("Interação do usuário detectada, tentando desbloquear áudio");
      unlockAudio();
      // Remove os event listeners após a primeira interação
      document.removeEventListener('click', unblockAudioOnUserAction);
      document.removeEventListener('touchstart', unblockAudioOnUserAction);
    };
    
    // Adiciona event listeners para desbloquear áudio na primeira interação
    document.addEventListener('click', unblockAudioOnUserAction);
    document.addEventListener('touchstart', unblockAudioOnUserAction);
    
    return () => {
      // Remove os event listeners se o componente for desmontado
      document.removeEventListener('click', unblockAudioOnUserAction);
      document.removeEventListener('touchstart', unblockAudioOnUserAction);
    };
  }, [unlockAudio]);
  
  // Cleanup on unmount
  useEffect(() => {
    console.log("Configurando limpeza do timer");
    return () => {
      cleanupTimer();
    };
  }, [cleanupTimer]);

  // Wrappers para funções que precisam de memoização
  const handleStartTimer = useCallback(() => {
    console.log("Iniciar timer chamado");
    startTimer();
  }, [startTimer]);

  const handlePauseTimer = useCallback(() => {
    console.log("Pausar timer chamado");
    pauseTimer();
  }, [pauseTimer]);

  const handleNextLevel = useCallback(() => {
    console.log("Próximo nível chamado");
    nextLevel();
  }, [nextLevel]);

  const handlePreviousLevel = useCallback(() => {
    console.log("Nível anterior chamado");
    previousLevel();
  }, [previousLevel]);

  const handleLevelProgress = useCallback((percentage: number) => {
    console.log(`Progresso do nível ajustado para ${percentage}%`);
    setLevelProgress(percentage);
  }, [setLevelProgress]);

  return {
    startTimer: handleStartTimer,
    pauseTimer: handlePauseTimer,
    nextLevel: handleNextLevel,
    previousLevel: handlePreviousLevel,
    toggleSound,
    openInNewWindow,
    setLevelProgress: handleLevelProgress,
    toggleFullScreen,
  };
}
