import { useEffect, useRef } from "react";
import { TimerState } from "../useTimerState";
import { useAudioEffects } from "./useAudioEffects";
import { useSimpleAudio } from "./useSimpleAudio";

export function useSoundEffects(
  timeRemainingInLevel: number,
  state: TimerState,
  setState: React.Dispatch<React.SetStateAction<TimerState>>
) {
  // Sistema principal: GitHub audio files
  const { audioRefs, playAudioSafely, unlockAudio } = useAudioEffects();
  
  // Sistema fallback: Web Audio API sintético
  const { playAlert: playAlertSynthetic, playCountdown: playCountdownSynthetic, playLevelComplete: playLevelCompleteSynthetic, isAudioSupported } = useSimpleAudio();
  const lastPlayedRef = useRef<{ alert: boolean; countdown: number; complete: boolean }>({
    alert: false,
    countdown: -1,
    complete: false,
  });

  // Funções de reprodução com fallback automático
  const playAlert = async () => {
    try {
      console.log("🎵 Tentando reproduzir alerta do GitHub...");
      await playAudioSafely(audioRefs.alertAudioRef, state.soundEnabled);
      console.log("✅ Alerta do GitHub reproduzido com sucesso");
    } catch (error) {
      console.log("⚠️ Fallback para alerta sintético:", error);
      playAlertSynthetic();
    }
  };

  const playCountdown = async () => {
    try {
      console.log("🎵 Tentando reproduzir contagem do GitHub...");
      await playAudioSafely(audioRefs.countdownAudioRef, state.soundEnabled);
      console.log("✅ Contagem do GitHub reproduzida com sucesso");
    } catch (error) {
      console.log("⚠️ Fallback para contagem sintética:", error);
      playCountdownSynthetic();
    }
  };

  const playLevelComplete = async () => {
    try {
      console.log("🎵 Tentando reproduzir conclusão do GitHub...");
      await playAudioSafely(audioRefs.levelCompleteAudioRef, state.soundEnabled);
      console.log("✅ Conclusão do GitHub reproduzida com sucesso");
    } catch (error) {
      console.log("⚠️ Fallback para conclusão sintética:", error);
      playLevelCompleteSynthetic();
    }
  };
  
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
      
      playAlert().then(() => {
        console.log("✅ Alerta de 1 minuto reproduzido com sucesso");
        lastPlayedRef.current.alert = true;
      }).catch((error) => {
        console.error("❌ Erro ao reproduzir alerta de 1 minuto:", error);
      });
      
      alertTimeout = window.setTimeout(() => {
        setState(prev => ({ ...prev, showAlert: false }));
      }, 3000); 
    } 
    
    // Som de contagem regressiva - últimos 4 segundos (independente do timer rodando)
    else if (timeRemainingInLevel <= 4 && timeRemainingInLevel > 0 && lastPlayedRef.current.countdown !== timeRemainingInLevel) {
      console.log(`⏱️ TENTANDO REPRODUZIR CONTAGEM: ${timeRemainingInLevel} segundos`);
      
      playCountdown().then(() => {
        console.log(`✅ Contagem ${timeRemainingInLevel} reproduzida com sucesso`);
        lastPlayedRef.current.countdown = timeRemainingInLevel;
      }).catch((error) => {
        console.error(`❌ Erro ao reproduzir contagem ${timeRemainingInLevel}:`, error);
      });
    } 
    
    // Som de conclusão de nível
    else if (timeRemainingInLevel === 0 && state.elapsedTimeInLevel === 0 && !lastPlayedRef.current.complete) {
      console.log("🎉 TENTANDO REPRODUZIR CONCLUSÃO DE NÍVEL");
      
      playLevelComplete().then(() => {
        console.log("✅ Conclusão de nível reproduzida com sucesso");
        lastPlayedRef.current.complete = true;
        
        setState(prev => ({ ...prev, showAlert: true }));
        alertTimeout = window.setTimeout(() => {
          setState(prev => ({ ...prev, showAlert: false }));
        }, 3000);
      }).catch((error) => {
        console.error("❌ Erro ao reproduzir conclusão de nível:", error);
      });
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
  }, [timeRemainingInLevel, state.isRunning, state.soundEnabled, state.elapsedTimeInLevel, isAudioSupported, setState]);

  const toggleSound = () => {
    const newSoundState = !state.soundEnabled;
    console.log(`🔊 TOGGLE SOUND - MUDANÇA PARA: ${newSoundState ? 'HABILITADO' : 'DESABILITADO'}`);
    
    setState(prev => ({ ...prev, soundEnabled: newSoundState }));
    
    // Desbloqueio de áudio e teste quando habilitado
    if (newSoundState && isAudioSupported) {
      console.log("🔧 Desbloqueando e testando som após habilitar...");
      unlockAudio();
      setTimeout(async () => {
        try {
          await playAlert();
          console.log("✅ Teste de som bem-sucedido");
        } catch (error) {
          console.error("❌ Falha no teste de som:", error);
        }
      }, 200);
    }
  };

  const testSound = async () => {
    console.log("🔧 TESTE MANUAL DE SOM INICIADO");
    console.log("Estado atual do som:", { soundEnabled: state.soundEnabled, isAudioSupported });
    
    if (!isAudioSupported) {
      console.error("❌ Áudio não suportado para teste");
      return;
    }
    
    // Desbloqueio inicial
    unlockAudio();
    
    try {
      console.log("🔊 Reproduzindo alerta de teste...");
      await playAlert();
      console.log("✅ Teste de alerta bem-sucedido");
      
      setTimeout(async () => {
        console.log("🔊 Reproduzindo contagem de teste...");
        await playCountdown();
        console.log("✅ Teste de contagem bem-sucedido");
      }, 500);
      
      setTimeout(async () => {
        console.log("🔊 Reproduzindo conclusão de teste...");
        await playLevelComplete();
        console.log("✅ Teste de conclusão bem-sucedido");
      }, 1000);
    } catch (error) {
      console.error("❌ Erro durante teste de som:", error);
    }
  };

  const playLevelCompleteSound = async () => {
    console.log("🎉 CHAMADA MANUAL - CONCLUSÃO DE NÍVEL");
    
    if (!state.soundEnabled) {
      console.log("Som desabilitado, não reproduzindo");
      return;
    }
    
    await playLevelComplete();
  };

  return {
    toggleSound,
    playLevelCompleteSound,
    testSound
  };
}