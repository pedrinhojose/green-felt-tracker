
import { useEffect, useRef } from "react";
import { BlindLevel } from "@/lib/db/models";
import { TimerState } from "./useTimerState";

export function useTimerControls(
  blindLevels: BlindLevel[],
  state: TimerState,
  setState: React.Dispatch<React.SetStateAction<TimerState>>,
  timeRemainingInLevel: number
) {
  const timerRef = useRef<number | null>(null);
  const alertAudioRef = useRef<HTMLAudioElement | null>(null);
  const countdownAudioRef = useRef<HTMLAudioElement | null>(null);
  const levelCompleteAudioRef = useRef<HTMLAudioElement | null>(null);

  // Inicializar referências de áudio
  useEffect(() => {
    alertAudioRef.current = new Audio("/alert.mp3");
    countdownAudioRef.current = new Audio("/countdown.mp3");
    levelCompleteAudioRef.current = new Audio("/level-complete.mp3");

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setState(prev => ({ ...prev, isRunning: true }));
    
    timerRef.current = window.setInterval(() => {
      setState(prev => {
        const newElapsedTimeInLevel = prev.elapsedTimeInLevel + 1;
        const currentLevel = blindLevels[prev.currentLevelIndex];
        
        // Se ultrapassou o tempo do nível atual
        if (currentLevel && newElapsedTimeInLevel >= currentLevel.duration * 60) {
          // Verificar se há próximo nível
          if (prev.currentLevelIndex < blindLevels.length - 1) {
            return {
              ...prev,
              currentLevelIndex: prev.currentLevelIndex + 1,
              elapsedTimeInLevel: 0,
              totalElapsedTime: prev.totalElapsedTime + 1,
              showAlert: false,
            };
          } else {
            // Fim de todos os níveis
            clearInterval(timerRef.current!);
            return {
              ...prev,
              isRunning: false,
              totalElapsedTime: prev.totalElapsedTime + 1,
            };
          }
        }
        
        // Atualização normal do timer
        return {
          ...prev,
          elapsedTimeInLevel: newElapsedTimeInLevel,
          totalElapsedTime: prev.totalElapsedTime + 1,
        };
      });
    }, 1000);
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setState(prev => ({ ...prev, isRunning: false }));
  };

  const nextLevel = () => {
    if (state.currentLevelIndex < blindLevels.length - 1) {
      setState(prev => ({
        ...prev,
        currentLevelIndex: prev.currentLevelIndex + 1,
        elapsedTimeInLevel: 0,
        showAlert: false,
      }));
    }
  };

  const toggleSound = () => {
    setState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const openInNewWindow = () => {
    const width = 800;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    window.open(
      `/timer-popup`, 
      "PokerTimer",
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
    );
  };

  // Efeitos para sons e alertas
  useEffect(() => {
    if (timeRemainingInLevel === 60 && state.isRunning && state.soundEnabled) {
      // Alerta para 1 minuto restante
      setState(prev => ({ ...prev, showAlert: true }));
      alertAudioRef.current?.play();
      
      // Limpar alerta após 2 segundos
      setTimeout(() => {
        setState(prev => ({ ...prev, showAlert: false }));
      }, 2000);
    } else if (timeRemainingInLevel <= 5 && timeRemainingInLevel > 0 && state.isRunning && state.soundEnabled) {
      // Sons de contagem regressiva
      countdownAudioRef.current?.play();
    } else if (timeRemainingInLevel === 0 && state.isRunning && state.soundEnabled) {
      // Som de conclusão do nível
      levelCompleteAudioRef.current?.play();
      
      // Destacar novos blinds por 2 segundos
      setState(prev => ({ ...prev, showAlert: true }));
      setTimeout(() => {
        setState(prev => ({ ...prev, showAlert: false }));
      }, 2000);
    }
  }, [timeRemainingInLevel, state.isRunning, state.soundEnabled]);

  return {
    startTimer,
    pauseTimer,
    nextLevel,
    toggleSound,
    openInNewWindow,
  };
}
