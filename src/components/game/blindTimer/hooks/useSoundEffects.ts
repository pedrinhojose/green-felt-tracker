
import { useEffect } from "react";
import { AudioRefs } from "./useAudioEffects";
import { TimerState } from "../useTimerState";
import { useAudioContext } from "@/contexts/AudioContext";

export function useSoundEffects(
  timeRemainingInLevel: number,
  state: TimerState,
  setState: React.Dispatch<React.SetStateAction<TimerState>>,
  audioRefs: AudioRefs,
  playAudioSafely: (audioRef: React.MutableRefObject<HTMLAudioElement | null>, soundEnabled: boolean) => Promise<void>
) {
  const { isTimerAudioActive, setGlobalAudioEnabled } = useAudioContext();
  
  // Handle sound effects based on timer state
  useEffect(() => {
    let alertTimeout: number;
    
    // Only play sounds if timer audio is active
    if (!isTimerAudioActive) {
      return;
    }
    
    // Aumentar volume antes de reproduzir cada som
    const playWithIncreasedVolume = async (audioRef: React.MutableRefObject<HTMLAudioElement | null>) => {
      if (audioRef.current) {
        // Salvar o volume original
        const originalVolume = audioRef.current.volume;
        // Dobrar o volume (limitado a 1.0 que é o máximo)
        audioRef.current.volume = Math.min(originalVolume * 2, 1.0);
      }
      await playAudioSafely(audioRef, state.soundEnabled);
    };
    
    if (timeRemainingInLevel === 60 && state.isRunning) {
      // Alerta para 1 minuto restante
      setState(prev => ({ ...prev, showAlert: true }));
      
      // Tocar o alerta apenas se o som estiver habilitado
      if (state.soundEnabled) {
        console.log("Tocando som de alerta (1 minuto restante) com volume aumentado");
        playWithIncreasedVolume(audioRefs.alertAudioRef);
      }
      
      // Limpar alerta após 3 segundos
      alertTimeout = window.setTimeout(() => {
        setState(prev => ({ ...prev, showAlert: false }));
      }, 3000); 
    } 
    else if (timeRemainingInLevel <= 5 && timeRemainingInLevel > 0 && state.isRunning) {
      // Sons de contagem regressiva
      console.log(`Tocando som de contagem regressiva: ${timeRemainingInLevel} com volume aumentado`);
      playWithIncreasedVolume(audioRefs.countdownAudioRef);
    } 
    else if (timeRemainingInLevel === 0 && state.isRunning && state.elapsedTimeInLevel === 0) {
      // Som de conclusão de nível - ajustado para tocar apenas uma vez
      console.log("Tocando som de conclusão de nível com volume aumentado");
      playWithIncreasedVolume(audioRefs.levelCompleteAudioRef);
      
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
  }, [timeRemainingInLevel, state.isRunning, state.soundEnabled, state.elapsedTimeInLevel, isTimerAudioActive]);

  const toggleSound = () => {
    // Adiciona um log para verificar quando o usuário alterna o som
    const newSoundState = !state.soundEnabled;
    console.log(`Som ${newSoundState ? 'ativado' : 'desativado'} pelo usuário`);
    setState(prev => ({ ...prev, soundEnabled: newSoundState }));
    
    // Update global audio state
    setGlobalAudioEnabled(newSoundState);
  };

  const playLevelCompleteSound = () => {
    // Only play if timer audio is active
    if (!isTimerAudioActive) {
      console.log("Timer audio não está ativo, ignorando som de conclusão de nível");
      return;
    }
    
    console.log("Chamada para reproduzir som de conclusão de nível com volume aumentado");
    // Aumentar volume antes de reproduzir
    if (audioRefs.levelCompleteAudioRef.current) {
      const originalVolume = audioRefs.levelCompleteAudioRef.current.volume;
      audioRefs.levelCompleteAudioRef.current.volume = Math.min(originalVolume * 2, 1.0);
    }
    playAudioSafely(audioRefs.levelCompleteAudioRef, state.soundEnabled);
  };

  return {
    toggleSound,
    playLevelCompleteSound
  };
}
