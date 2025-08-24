import { useEffect, useRef } from "react";
import { TimerState } from "../useTimerState";
import { useSimpleAudio } from "./useSimpleAudio";

export function useSoundEffects(
  timeRemainingInLevel: number,
  state: TimerState,
  setState: React.Dispatch<React.SetStateAction<TimerState>>
) {
  const { playAlert, playCountdown, playLevelComplete, isAudioSupported } = useSimpleAudio();
  const lastPlayedRef = useRef<{ alert: boolean; countdown: number; complete: boolean }>({
    alert: false,
    countdown: -1,
    complete: false,
  });
  
  // Handle sound effects based on timer state
  useEffect(() => {
    let alertTimeout: number;
    
    console.log("=== SISTEMA DE SOM SIMPLIFICADO ===");
    console.log("Condições atuais:", {
      soundEnabled: state.soundEnabled,
      isRunning: state.isRunning,
      timeRemainingInLevel,
      isAudioSupported,
      elapsedTimeInLevel: state.elapsedTimeInLevel
    });
    
    // Verificações básicas
    if (!state.soundEnabled) {
      console.log("Som desabilitado pelo usuário");
      return;
    }
    
    if (!state.isRunning) {
      console.log("Timer não está rodando");
      return;
    }
    
    if (!isAudioSupported) {
      console.log("Áudio não suportado pelo navegador");
      return;
    }
    
    // Som de alerta - 1 minuto restante
    if (timeRemainingInLevel === 60 && !lastPlayedRef.current.alert) {
      console.log("🚨 REPRODUZINDO ALERTA DE 1 MINUTO");
      setState(prev => ({ ...prev, showAlert: true }));
      playAlert();
      lastPlayedRef.current.alert = true;
      
      alertTimeout = window.setTimeout(() => {
        setState(prev => ({ ...prev, showAlert: false }));
      }, 3000); 
    } 
    
    // Som de contagem regressiva - últimos 4 segundos
    else if (timeRemainingInLevel <= 4 && timeRemainingInLevel > 0 && lastPlayedRef.current.countdown !== timeRemainingInLevel) {
      console.log(`⏱️ REPRODUZINDO CONTAGEM: ${timeRemainingInLevel} segundos`);
      playCountdown();
      lastPlayedRef.current.countdown = timeRemainingInLevel;
    } 
    
    // Som de conclusão de nível
    else if (timeRemainingInLevel === 0 && state.elapsedTimeInLevel === 0 && !lastPlayedRef.current.complete) {
      console.log("🎉 REPRODUZINDO CONCLUSÃO DE NÍVEL");
      playLevelComplete();
      lastPlayedRef.current.complete = true;
      
      setState(prev => ({ ...prev, showAlert: true }));
      alertTimeout = window.setTimeout(() => {
        setState(prev => ({ ...prev, showAlert: false }));
      }, 3000);
    }
    
    // Reset flags quando o tempo muda significativamente
    if (timeRemainingInLevel > 60) {
      lastPlayedRef.current.alert = false;
    }
    if (timeRemainingInLevel > 4) {
      lastPlayedRef.current.countdown = -1;
    }
    if (timeRemainingInLevel > 10) {
      lastPlayedRef.current.complete = false;
    }
    
    return () => {
      if (alertTimeout) {
        clearTimeout(alertTimeout);
      }
    };
  }, [timeRemainingInLevel, state.isRunning, state.soundEnabled, state.elapsedTimeInLevel, playAlert, playCountdown, playLevelComplete, isAudioSupported, setState]);

  const toggleSound = () => {
    const newSoundState = !state.soundEnabled;
    console.log(`🔊 TOGGLE SOUND - MUDANÇA PARA: ${newSoundState ? 'HABILITADO' : 'DESABILITADO'}`);
    
    setState(prev => ({ ...prev, soundEnabled: newSoundState }));
    
    // Teste imediato do som quando habilitado
    if (newSoundState && isAudioSupported) {
      console.log("Testando som imediatamente após habilitar...");
      setTimeout(() => {
        playAlert();
      }, 200);
    }
  };

  const playLevelCompleteSound = () => {
    console.log("🎉 CHAMADA MANUAL - CONCLUSÃO DE NÍVEL");
    
    if (!state.soundEnabled) {
      console.log("Som desabilitado, não reproduzindo");
      return;
    }
    
    playLevelComplete();
  };

  return {
    toggleSound,
    playLevelCompleteSound
  };
}