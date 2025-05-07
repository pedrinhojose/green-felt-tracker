
import { useEffect } from "react";
import { AudioRefs } from "./useAudioEffects";
import { TimerState } from "../useTimerState";

export function useSoundEffects(
  timeRemainingInLevel: number,
  state: TimerState,
  setState: React.Dispatch<React.SetStateAction<TimerState>>,
  audioRefs: AudioRefs,
  playAudioSafely: (audioRef: React.MutableRefObject<HTMLAudioElement | null>, soundEnabled: boolean) => Promise<void>
) {
  // Handle sound effects based on timer state
  useEffect(() => {
    let alertTimeout: number;
    
    if (timeRemainingInLevel === 60 && state.isRunning) {
      // Alert for 1 minute remaining
      setState(prev => ({ ...prev, showAlert: true }));
      
      // Tocar o alerta apenas se o som estiver habilitado
      if (state.soundEnabled) {
        playAudioSafely(audioRefs.alertAudioRef, state.soundEnabled);
      }
      
      // Clear alert after 3 seconds
      alertTimeout = window.setTimeout(() => {
        setState(prev => ({ ...prev, showAlert: false }));
      }, 3000); // Aumentado para 3 segundos conforme solicitado
    } else if (timeRemainingInLevel <= 5 && timeRemainingInLevel > 0 && state.isRunning) {
      // Countdown sounds
      playAudioSafely(audioRefs.countdownAudioRef, state.soundEnabled);
    } else if (timeRemainingInLevel === 0 && state.isRunning) {
      // Level completion sound
      playAudioSafely(audioRefs.levelCompleteAudioRef, state.soundEnabled);
      
      // Highlight new blinds for 3 seconds
      setState(prev => ({ ...prev, showAlert: true }));
      alertTimeout = window.setTimeout(() => {
        setState(prev => ({ ...prev, showAlert: false }));
      }, 3000); // Aumentado para 3 segundos
    }
    
    // Limpar o timeout quando o componente for desmontado
    return () => {
      if (alertTimeout) {
        clearTimeout(alertTimeout);
      }
    };
  }, [timeRemainingInLevel, state.isRunning, state.soundEnabled]);

  const toggleSound = () => {
    setState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const playLevelCompleteSound = () => {
    playAudioSafely(audioRefs.levelCompleteAudioRef, state.soundEnabled);
  };

  return {
    toggleSound,
    playLevelCompleteSound
  };
}
