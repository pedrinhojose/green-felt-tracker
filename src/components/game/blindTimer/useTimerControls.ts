
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
  
  // Tenta desbloquear o áudio quando o componente é montado
  useEffect(() => {
    // Tenta desbloquear o áudio na montagem do componente
    const unblockAudioOnUserAction = () => {
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
    return () => {
      cleanupTimer();
    };
  }, [cleanupTimer]);

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
