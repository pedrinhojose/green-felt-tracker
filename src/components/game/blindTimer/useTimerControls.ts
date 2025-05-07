
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
    try {
      alertAudioRef.current = new Audio("/alert.mp3");
      countdownAudioRef.current = new Audio("/countdown.mp3");
      levelCompleteAudioRef.current = new Audio("/level-complete.mp3");

      // Pré-carregar os arquivos de áudio
      alertAudioRef.current.load();
      countdownAudioRef.current.load();
      levelCompleteAudioRef.current.load();
    } catch (e) {
      console.error("Erro ao carregar arquivos de áudio:", e);
    }

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
            // Tocar som de conclusão do nível se o som estiver ativado
            if (prev.soundEnabled && levelCompleteAudioRef.current) {
              levelCompleteAudioRef.current.play().catch(e => 
                console.error("Erro ao reproduzir som de conclusão:", e)
              );
            }
            
            return {
              ...prev,
              currentLevelIndex: prev.currentLevelIndex + 1,
              elapsedTimeInLevel: 0,
              totalElapsedTime: prev.totalElapsedTime + 1,
              showAlert: true, // Mostrar alerta ao mudar de nível
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

  const previousLevel = () => {
    if (state.currentLevelIndex > 0) {
      setState(prev => ({
        ...prev,
        currentLevelIndex: prev.currentLevelIndex - 1,
        elapsedTimeInLevel: 0,
        showAlert: false,
      }));
    }
  };

  const toggleSound = () => {
    setState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
    
    // Testar se o som está funcionando ao ativar
    if (!state.soundEnabled && alertAudioRef.current) {
      alertAudioRef.current.volume = 0.5; // Reduzir o volume para não assustar
      alertAudioRef.current.play().catch(e => 
        console.error("Erro ao testar reprodução de áudio:", e)
      );
    }
  };

  const openInNewWindow = () => {
    const width = 800;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    window.open(
      `/timer?gameId=${window.location.pathname.split('/').pop()}`, 
      "PokerTimer",
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
    );
  };

  // Função para avançar para um ponto específico do nível atual
  const setLevelProgress = (percentage: number) => {
    const currentLevel = blindLevels[state.currentLevelIndex];
    if (currentLevel) {
      const totalLevelTimeInSeconds = currentLevel.duration * 60;
      const newElapsedTime = Math.floor(totalLevelTimeInSeconds * (percentage / 100));
      
      setState(prev => ({
        ...prev,
        elapsedTimeInLevel: newElapsedTime,
        showAlert: false,
      }));
    }
  };

  // Efeitos para sons e alertas
  useEffect(() => {
    if (!state.soundEnabled) return; // Não reproduzir sons se estiver desativado
    
    if (timeRemainingInLevel === 60 && state.isRunning) {
      // Alerta para 1 minuto restante
      setState(prev => ({ ...prev, showAlert: true }));
      
      if (alertAudioRef.current) {
        alertAudioRef.current.currentTime = 0; // Reinicia o áudio
        alertAudioRef.current.play().catch(e => 
          console.error("Erro ao reproduzir alerta de 1 minuto:", e)
        );
      }
      
      // Limpar alerta após 2 segundos
      setTimeout(() => {
        setState(prev => ({ ...prev, showAlert: false }));
      }, 2000);
    } else if (timeRemainingInLevel <= 5 && timeRemainingInLevel > 0 && state.isRunning) {
      // Sons de contagem regressiva
      if (countdownAudioRef.current) {
        countdownAudioRef.current.currentTime = 0; // Reinicia o áudio
        countdownAudioRef.current.play().catch(e => 
          console.error("Erro ao reproduzir contagem regressiva:", e)
        );
      }
    } else if (timeRemainingInLevel === 0 && state.isRunning) {
      // Som de conclusão do nível
      if (levelCompleteAudioRef.current) {
        levelCompleteAudioRef.current.currentTime = 0; // Reinicia o áudio
        levelCompleteAudioRef.current.play().catch(e => 
          console.error("Erro ao reproduzir conclusão de nível:", e)
        );
      }
      
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
    previousLevel,
    toggleSound,
    openInNewWindow,
    setLevelProgress,
  };
}
