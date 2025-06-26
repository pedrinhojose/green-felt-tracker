
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
    
    console.log("=== SOUND EFFECTS - DEBUG COMPLETO ===");
    console.log("Condições atuais:", {
      isTimerAudioActive,
      isAudioEnabled,
      soundEnabled: state.soundEnabled,
      isRunning: state.isRunning,
      timeRemainingInLevel,
      elapsedTimeInLevel: state.elapsedTimeInLevel
    });
    
    console.log("Elementos de áudio disponíveis:", {
      alertAudio: !!audioRefs.alertAudioRef.current,
      countdownAudio: !!audioRefs.countdownAudioRef.current,
      levelCompleteAudio: !!audioRefs.levelCompleteAudioRef.current
    });
    
    // Condições simplificadas para debug - vamos testar apenas com soundEnabled
    if (!state.soundEnabled) {
      console.log("Som desabilitado pelo usuário");
      return;
    }
    
    if (!state.isRunning) {
      console.log("Timer não está rodando");
      return;
    }
    
    // Verificar se temos elementos de áudio
    if (!audioRefs.alertAudioRef.current || !audioRefs.countdownAudioRef.current || !audioRefs.levelCompleteAudioRef.current) {
      console.log("Elementos de áudio não estão carregados ainda");
      return;
    }
    
    // Aumentar volume e reproduzir som
    const playWithIncreasedVolume = async (audioRef: React.MutableRefObject<HTMLAudioElement | null>) => {
      console.log("=== TENTATIVA DE REPRODUÇÃO DE SOM ===");
      if (audioRef.current) {
        console.log("Configurando áudio:", {
          src: audioRef.current.src,
          readyState: audioRef.current.readyState,
          volume: audioRef.current.volume
        });
        
        // Salvar o volume original
        const originalVolume = audioRef.current.volume;
        // Aumentar volume
        audioRef.current.volume = Math.min(originalVolume * 2, 1.0);
        console.log(`Volume ajustado de ${originalVolume} para ${audioRef.current.volume}`);
      }
      
      try {
        await playAudioSafely(audioRef, state.soundEnabled);
        console.log("Som reproduzido com sucesso");
      } catch (error) {
        console.error("Erro ao reproduzir som:", error);
      }
    };
    
    if (timeRemainingInLevel === 60) {
      console.log("=== ALERTA DE 1 MINUTO - TENTANDO REPRODUZIR ===");
      setState(prev => ({ ...prev, showAlert: true }));
      playWithIncreasedVolume(audioRefs.alertAudioRef);
      
      alertTimeout = window.setTimeout(() => {
        setState(prev => ({ ...prev, showAlert: false }));
      }, 3000); 
    } 
    else if (timeRemainingInLevel <= 5 && timeRemainingInLevel > 0) {
      console.log(`=== CONTAGEM REGRESSIVA: ${timeRemainingInLevel} - TENTANDO REPRODUZIR ===`);
      playWithIncreasedVolume(audioRefs.countdownAudioRef);
    } 
    else if (timeRemainingInLevel === 0 && state.elapsedTimeInLevel === 0) {
      console.log("=== CONCLUSÃO DE NÍVEL - TENTANDO REPRODUZIR ===");
      playWithIncreasedVolume(audioRefs.levelCompleteAudioRef);
      
      setState(prev => ({ ...prev, showAlert: true }));
      alertTimeout = window.setTimeout(() => {
        setState(prev => ({ ...prev, showAlert: false }));
      }, 3000);
    }
    
    return () => {
      if (alertTimeout) {
        clearTimeout(alertTimeout);
      }
    };
  }, [timeRemainingInLevel, state.isRunning, state.soundEnabled, state.elapsedTimeInLevel]);

  const toggleSound = () => {
    const newSoundState = !state.soundEnabled;
    console.log(`=== TOGGLE SOUND - MUDANÇA PARA: ${newSoundState} ===`);
    
    setState(prev => ({ ...prev, soundEnabled: newSoundState }));
    setGlobalAudioEnabled(newSoundState);
    
    // Teste imediato do som quando habilitado
    if (newSoundState && audioRefs.alertAudioRef.current) {
      console.log("Testando som imediatamente após habilitar...");
      setTimeout(() => {
        playAudioSafely(audioRefs.alertAudioRef, newSoundState);
      }, 100);
    }
  };

  const playLevelCompleteSound = () => {
    console.log("=== PLAY LEVEL COMPLETE SOUND - CHAMADA MANUAL ===");
    
    if (!state.soundEnabled) {
      console.log("Som desabilitado, não reproduzindo");
      return;
    }
    
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
