
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
  const { isTimerAudioActive, setGlobalAudioEnabled, isAudioEnabled } = useAudioContext();
  
  // Handle sound effects based on timer state
  useEffect(() => {
    let alertTimeout: number;
    
    console.log("=== SOUND EFFECTS - VERIFICAÇÃO DE ESTADO ===");
    console.log("Condições para reproduzir som:", {
      isTimerAudioActive,
      isAudioEnabled,
      soundEnabled: state.soundEnabled,
      isRunning: state.isRunning,
      timeRemainingInLevel
    });
    
    // Only play sounds if timer audio is active AND sound is enabled
    if (!isTimerAudioActive || !state.soundEnabled) {
      console.log("Som não será reproduzido:", {
        isTimerAudioActive,
        soundEnabled: state.soundEnabled
      });
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
      console.log("=== ALERTA DE 1 MINUTO ===");
      // Alerta para 1 minuto restante
      setState(prev => ({ ...prev, showAlert: true }));
      
      // Tocar o alerta
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
      console.log(`=== CONTAGEM REGRESSIVA: ${timeRemainingInLevel} ===`);
      // Sons de contagem regressiva
      console.log(`Tocando som de contagem regressiva: ${timeRemainingInLevel} com volume aumentado`);
      playWithIncreasedVolume(audioRefs.countdownAudioRef);
    } 
    else if (timeRemainingInLevel === 0 && state.isRunning && state.elapsedTimeInLevel === 0) {
      console.log("=== SOM DE CONCLUSÃO DE NÍVEL ===");
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
  }, [timeRemainingInLevel, state.isRunning, state.soundEnabled, state.elapsedTimeInLevel, isTimerAudioActive, isAudioEnabled]);

  const toggleSound = () => {
    // Adiciona um log para verificar quando o usuário alterna o som
    const newSoundState = !state.soundEnabled;
    console.log(`=== TOGGLE SOUND - USER ACTION ===`);
    console.log(`Som ${newSoundState ? 'ativado' : 'desativado'} pelo usuário`);
    console.log("Estado do contexto:", { isTimerAudioActive, isAudioEnabled });
    
    setState(prev => ({ ...prev, soundEnabled: newSoundState }));
    
    // Update global audio state
    setGlobalAudioEnabled(newSoundState);
  };

  const playLevelCompleteSound = () => {
    console.log("=== PLAY LEVEL COMPLETE SOUND ===");
    console.log("Verificando condições:", {
      isTimerAudioActive,
      soundEnabled: state.soundEnabled,
      isAudioEnabled
    });
    
    // Only play if timer audio is active
    if (!isTimerAudioActive || !state.soundEnabled) {
      console.log("Timer audio não está ativo ou som desabilitado, ignorando som de conclusão de nível");
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
