
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
  
  // Flag para controlar se os áudios foram carregados
  const audioLoadedRef = useRef<boolean>(false);

  // Inicializar referências de áudio
  useEffect(() => {
    if (audioLoadedRef.current) return;
    
    try {
      alertAudioRef.current = new Audio("/alert.mp3");
      countdownAudioRef.current = new Audio("/countdown.mp3");
      levelCompleteAudioRef.current = new Audio("/level-complete.mp3");

      // Pré-carregar os arquivos de áudio
      const preloadAudio = async () => {
        try {
          if (alertAudioRef.current) {
            alertAudioRef.current.load();
            await alertAudioRef.current.play();
            alertAudioRef.current.pause();
            alertAudioRef.current.currentTime = 0;
          }
          
          if (countdownAudioRef.current) {
            countdownAudioRef.current.load();
            await countdownAudioRef.current.play();
            countdownAudioRef.current.pause();
            countdownAudioRef.current.currentTime = 0;
          }
          
          if (levelCompleteAudioRef.current) {
            levelCompleteAudioRef.current.load();
            await levelCompleteAudioRef.current.play();
            levelCompleteAudioRef.current.pause();
            levelCompleteAudioRef.current.currentTime = 0;
          }
          
          audioLoadedRef.current = true;
          console.log("Áudios pré-carregados com sucesso");
        } catch (e) {
          console.error("Erro ao pré-carregar áudios:", e);
        }
      };
      
      preloadAudio();
    } catch (e) {
      console.error("Erro ao inicializar arquivos de áudio:", e);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Função auxiliar para reproduzir áudio com segurança
  const playAudioSafely = async (audioRef: React.MutableRefObject<HTMLAudioElement | null>) => {
    if (!state.soundEnabled || !audioRef.current) return;
    
    try {
      audioRef.current.currentTime = 0; // Reinicia o áudio
      await audioRef.current.play();
    } catch (error) {
      console.error("Erro ao reproduzir áudio:", error);
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setState(prev => ({ ...prev, isRunning: true }));
    
    timerRef.current = window.setInterval(() => {
      setState(prev => {
        // Verificar se há níveis configurados
        if (!Array.isArray(blindLevels) || blindLevels.length === 0) {
          return prev;
        }
        
        const newElapsedTimeInLevel = prev.elapsedTimeInLevel + 1;
        const currentLevel = blindLevels[prev.currentLevelIndex];
        
        // Verificar se o nível atual é válido
        if (!currentLevel) {
          return prev;
        }
        
        // Se ultrapassou o tempo do nível atual
        if (newElapsedTimeInLevel >= currentLevel.duration * 60) {
          // Verificar se há próximo nível
          if (prev.currentLevelIndex < blindLevels.length - 1) {
            // Tocar som de conclusão do nível se o som estiver ativado
            playAudioSafely(levelCompleteAudioRef);
            
            return {
              ...prev,
              currentLevelIndex: prev.currentLevelIndex + 1,
              elapsedTimeInLevel: 0,
              totalElapsedTime: prev.totalElapsedTime + 1,
              showAlert: true, // Mostrar alerta ao mudar de nível
            };
          } else {
            // Fim de todos os níveis
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
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
    if (!Array.isArray(blindLevels) || state.currentLevelIndex >= blindLevels.length - 1) {
      return;
    }
    
    setState(prev => ({
      ...prev,
      currentLevelIndex: prev.currentLevelIndex + 1,
      elapsedTimeInLevel: 0,
      showAlert: false,
    }));
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
    if (!state.soundEnabled) {
      playAudioSafely(alertAudioRef);
    }
  };

  const openInNewWindow = () => {
    const width = 800;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    // Obter o ID do jogo atual da URL
    const currentPath = window.location.pathname;
    const gameId = currentPath.split('/').pop() || '';
    
    window.open(
      `/partidas/${gameId}/timer`, 
      "PokerTimer",
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
    );
  };

  // Função para avançar para um ponto específico do nível atual
  const setLevelProgress = (percentage: number) => {
    if (!Array.isArray(blindLevels)) return;
    
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
    if (!state.soundEnabled || !Array.isArray(blindLevels)) return;
    
    if (timeRemainingInLevel === 60 && state.isRunning) {
      // Alerta para 1 minuto restante
      setState(prev => ({ ...prev, showAlert: true }));
      playAudioSafely(alertAudioRef);
      
      // Limpar alerta após 2 segundos
      setTimeout(() => {
        setState(prev => ({ ...prev, showAlert: false }));
      }, 2000);
    } else if (timeRemainingInLevel <= 5 && timeRemainingInLevel > 0 && state.isRunning) {
      // Sons de contagem regressiva
      playAudioSafely(countdownAudioRef);
    } else if (timeRemainingInLevel === 0 && state.isRunning) {
      // Som de conclusão do nível
      playAudioSafely(levelCompleteAudioRef);
      
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
