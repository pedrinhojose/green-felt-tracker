
import { useEffect, useState } from "react";
import { BlindLevel } from "@/lib/db/models";

interface TimerControlsProps {
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  timerRunning: boolean;
  setTimerRunning: React.Dispatch<React.SetStateAction<boolean>>;
  currentLevelIndex: number;
  setCurrentLevelIndex: React.Dispatch<React.SetStateAction<number>>;
  blindLevels: BlindLevel[];
  setShowLevelChange: React.Dispatch<React.SetStateAction<boolean>>;
  countdownSoundStarted: React.MutableRefObject<boolean>;
}

export function useTimerControls({
  currentTime,
  setCurrentTime,
  timerRunning,
  setTimerRunning,
  currentLevelIndex,
  setCurrentLevelIndex,
  blindLevels,
  setShowLevelChange,
  countdownSoundStarted
}: TimerControlsProps) {
  
  const [isFinishing, setIsFinishing] = useState(false);
  
  // Reproduzir som suave de contagem regressiva nos últimos 5 segundos
  const playCountdownSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Tocar um som suave para cada segundo restante
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.type = 'sine';
          oscillator.frequency.value = 500; // Frequência mais suave
          gainNode.gain.value = 0.15; // Volume mais baixo
          
          oscillator.start();
          
          // Diminuir gradualmente o som
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
          
          setTimeout(() => {
            oscillator.stop();
          }, 300);
        }, i * 1000);
      }
    } catch (e) {
      console.error("Erro ao reproduzir som de contagem regressiva:", e);
    }
  };
  
  // Som específico para mudança de nível
  const playLevelChangeSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Som mais suave para mudança de nível
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.type = 'sine';
      osc.frequency.value = 600;
      gain.gain.value = 0.2;
      
      osc.start();
      
      // Desenhar a forma de onda para criar um som mais agradável
      gain.gain.setValueAtTime(0.2, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      setTimeout(() => {
        osc.stop();
      }, 500);
    } catch (e) {
      console.error("Erro ao reproduzir som de mudança de nível:", e);
    }
  };
  
  // Controle principal do timer
  useEffect(() => {
    let interval: number | undefined;
    
    if (timerRunning) {
      interval = window.setInterval(() => {
        setCurrentTime(prev => {
          // Verificar os últimos 5 segundos para tocar som
          if (prev <= 5 && prev > 0 && !countdownSoundStarted.current) {
            countdownSoundStarted.current = true;
            playCountdownSound();
          }
          
          if (prev <= 1) {
            // Quando o tempo acaba, avançar para o próximo nível
            handleNextLevel();
            countdownSoundStarted.current = false;
            // Se ainda houver níveis, retornar o tempo do próximo nível
            const nextIndex = currentLevelIndex + 1;
            if (nextIndex < blindLevels.length) {
              return blindLevels[nextIndex].duration * 60;
            }
            // Se não houver mais níveis, parar o timer
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      countdownSoundStarted.current = false;
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, currentLevelIndex, blindLevels, countdownSoundStarted]);
  
  // Efeito de animação quando muda de nível
  useEffect(() => {
    if (setShowLevelChange) {
      playLevelChangeSound();
      
      // Remover a animação após 3 segundos
      const timeout = setTimeout(() => {
        setShowLevelChange(false);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [setShowLevelChange]);
  
  // Avançar para o próximo nível
  const handleNextLevel = () => {
    if (currentLevelIndex + 1 < blindLevels.length) {
      setCurrentLevelIndex(prev => prev + 1);
      setCurrentTime(blindLevels[currentLevelIndex + 1].duration * 60);
      setShowLevelChange(true);
    }
  };
  
  // Voltar para o nível anterior
  const handlePreviousLevel = () => {
    if (currentLevelIndex > 0) {
      setCurrentLevelIndex(prev => prev - 1);
      setCurrentTime(blindLevels[currentLevelIndex - 1].duration * 60);
      setShowLevelChange(true);
    }
  };
  
  // Pausar ou retomar o timer
  const toggleTimer = () => {
    setTimerRunning(prev => !prev);
  };
  
  // Alternar modo tela cheia
  const toggleFullscreen = (timerRef: React.RefObject<HTMLDivElement>, isFullscreen: boolean, setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (isFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else if (timerRef.current) {
      timerRef.current.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  return {
    handleNextLevel,
    handlePreviousLevel,
    toggleTimer,
    toggleFullscreen,
    isFinishing,
    setIsFinishing,
  };
}
