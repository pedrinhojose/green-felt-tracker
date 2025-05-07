
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
      // Alerta para 1 minuto restante
      setState(prev => ({ ...prev, showAlert: true }));
      
      // Tocar o alerta apenas se o som estiver habilitado
      if (state.soundEnabled) {
        playAudioSafely(audioRefs.alertAudioRef, state.soundEnabled);
      }
      
      // Limpar alerta após 3 segundos
      alertTimeout = window.setTimeout(() => {
        setState(prev => ({ ...prev, showAlert: false }));
      }, 3000); 
    } 
    else if (timeRemainingInLevel <= 5 && timeRemainingInLevel > 0 && state.isRunning) {
      // Sons de contagem regressiva
      playAudioSafely(audioRefs.countdownAudioRef, state.soundEnabled);
    } 
    else if (timeRemainingInLevel === 0 && state.isRunning && state.elapsedTimeInLevel === 0) {
      // Som de conclusão de nível - ajustado para tocar apenas uma vez
      playAudioSafely(audioRefs.levelCompleteAudioRef, state.soundEnabled);
      
      // Destacar novos blinds por 3 segundos
      setState(prev => ({ ...prev, showAlert: true }));
      alertTimeout = window.setTimeout(() => {
        setState(prev => ({ ...prev, showAlert: false }));
      }, 3000);
    }
    
    // Limpar o timeout quando o componente for desmontado
    return () => {
      if (alertTimeout) {
        clearTimeout(alertTimeout);
      }
    };
  }, [timeRemainingInLevel, state.isRunning, state.soundEnabled, state.elapsedTimeInLevel]);

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
