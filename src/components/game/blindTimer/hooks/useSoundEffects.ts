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
    
    console.log("=== SISTEMA DE SOM DETALHADO ===");
    console.log("Estado completo:", {
      soundEnabled: state.soundEnabled,
      isRunning: state.isRunning,
      timeRemainingInLevel,
      isAudioSupported,
      elapsedTimeInLevel: state.elapsedTimeInLevel,
      currentLevel: state.currentLevelIndex,
      showAlert: state.showAlert
    });
    
    console.log("Flags de controle:", {
      lastAlert: lastPlayedRef.current.alert,
      lastCountdown: lastPlayedRef.current.countdown,
      lastComplete: lastPlayedRef.current.complete
    });
    
    // Verificações básicas com logs detalhados
    if (!state.soundEnabled) {
      console.log("❌ Som desabilitado pelo usuário");
      return;
    }
    
    if (!isAudioSupported) {
      console.log("❌ Áudio não suportado pelo navegador");
      return;
    }
    
    console.log("✅ Som habilitado e suportado");
    
    // Som de alerta - 1 minuto restante (independente do timer rodando)
    if (timeRemainingInLevel === 60 && !lastPlayedRef.current.alert) {
      console.log("🚨 TENTANDO REPRODUZIR ALERTA DE 1 MINUTO");
      setState(prev => ({ ...prev, showAlert: true }));
      
      try {
        playAlert();
        console.log("✅ Alerta de 1 minuto reproduzido com sucesso");
        lastPlayedRef.current.alert = true;
      } catch (error) {
        console.error("❌ Erro ao reproduzir alerta de 1 minuto:", error);
      }
      
      alertTimeout = window.setTimeout(() => {
        setState(prev => ({ ...prev, showAlert: false }));
      }, 3000); 
    } 
    
    // Som de contagem regressiva - últimos 4 segundos (independente do timer rodando)
    else if (timeRemainingInLevel <= 4 && timeRemainingInLevel > 0 && lastPlayedRef.current.countdown !== timeRemainingInLevel) {
      console.log(`⏱️ TENTANDO REPRODUZIR CONTAGEM: ${timeRemainingInLevel} segundos`);
      
      try {
        playCountdown();
        console.log(`✅ Contagem ${timeRemainingInLevel} reproduzida com sucesso`);
        lastPlayedRef.current.countdown = timeRemainingInLevel;
      } catch (error) {
        console.error(`❌ Erro ao reproduzir contagem ${timeRemainingInLevel}:`, error);
      }
    } 
    
    // Som de conclusão de nível
    else if (timeRemainingInLevel === 0 && state.elapsedTimeInLevel === 0 && !lastPlayedRef.current.complete) {
      console.log("🎉 TENTANDO REPRODUZIR CONCLUSÃO DE NÍVEL");
      
      try {
        playLevelComplete();
        console.log("✅ Conclusão de nível reproduzida com sucesso");
        lastPlayedRef.current.complete = true;
        
        setState(prev => ({ ...prev, showAlert: true }));
        alertTimeout = window.setTimeout(() => {
          setState(prev => ({ ...prev, showAlert: false }));
        }, 3000);
      } catch (error) {
        console.error("❌ Erro ao reproduzir conclusão de nível:", error);
      }
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
      console.log("🔧 Testando som imediatamente após habilitar...");
      setTimeout(() => {
        try {
          playAlert();
          console.log("✅ Teste de som bem-sucedido");
        } catch (error) {
          console.error("❌ Falha no teste de som:", error);
        }
      }, 200);
    }
  };

  const testSound = () => {
    console.log("🔧 TESTE MANUAL DE SOM INICIADO");
    console.log("Estado atual do som:", { soundEnabled: state.soundEnabled, isAudioSupported });
    
    if (!isAudioSupported) {
      console.error("❌ Áudio não suportado para teste");
      return;
    }
    
    try {
      console.log("🔊 Reproduzindo alerta de teste...");
      playAlert();
      console.log("✅ Teste de alerta bem-sucedido");
      
      setTimeout(() => {
        console.log("🔊 Reproduzindo contagem de teste...");
        playCountdown();
        console.log("✅ Teste de contagem bem-sucedido");
      }, 500);
      
      setTimeout(() => {
        console.log("🔊 Reproduzindo conclusão de teste...");
        playLevelComplete();
        console.log("✅ Teste de conclusão bem-sucedido");
      }, 1000);
    } catch (error) {
      console.error("❌ Erro durante teste de som:", error);
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
    playLevelCompleteSound,
    testSound
  };
}