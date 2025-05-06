
import { useState, useEffect, useRef } from "react";
import { usePoker } from "@/contexts/PokerContext";
import { BlindLevel } from "@/lib/db/models";

interface TimerState {
  currentTime: number;
  timerRunning: boolean;
  currentLevelIndex: number;
  blindLevels: BlindLevel[];
  isFullscreen: boolean;
  gameStartTime: Date;
  currentGameTime: number;
  showLevelChange: boolean;
  countdownSoundStarted: React.MutableRefObject<boolean>;
  
  // Progress calculation methods
  calculateProgress: () => number;
  isNextLevelBreak: () => boolean;
  calculateTimeToBreak: () => string;
  isCurrentLevelBreak: boolean;
}

export function useTimerState(initialTime = 15 * 60): TimerState {
  const { activeSeason } = usePoker();
  const [currentTime, setCurrentTime] = useState<number>(initialTime);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [blindLevels, setBlindLevels] = useState<BlindLevel[]>([]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [gameStartTime, setGameStartTime] = useState<Date>(new Date());
  const [currentGameTime, setCurrentGameTime] = useState<number>(0);
  const [showLevelChange, setShowLevelChange] = useState<boolean>(false);
  const countdownSoundStarted = useRef<boolean>(false);
  
  // Inicializar estrutura de blinds da temporada ativa
  useEffect(() => {
    if (activeSeason?.blindStructure && activeSeason.blindStructure.length > 0) {
      setBlindLevels(activeSeason.blindStructure);
      
      // Definir o timer inicial com base no primeiro nível
      if (activeSeason.blindStructure[0]) {
        setCurrentTime(activeSeason.blindStructure[0].duration * 60);
      }
    } else {
      // Fallback para blind padrão se não houver estrutura definida
      setBlindLevels([
        {
          id: "default-1",
          level: 1,
          smallBlind: 25,
          bigBlind: 50,
          ante: 0,
          duration: 15,
          isBreak: false,
        },
        {
          id: "default-2",
          level: 2,
          smallBlind: 50,
          bigBlind: 100,
          ante: 0,
          duration: 15,
          isBreak: false,
        }
      ]);
    }
    setGameStartTime(new Date());
  }, [activeSeason]);
  
  // Gerenciar tempo decorrido de jogo
  useEffect(() => {
    const interval = setInterval(() => {
      if (timerRunning) {
        const now = new Date();
        const diffInSecs = Math.floor((now.getTime() - gameStartTime.getTime()) / 1000);
        setCurrentGameTime(diffInSecs);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timerRunning, gameStartTime]);
  
  // Calcular a porcentagem de progresso
  const calculateProgress = () => {
    if (!blindLevels[currentLevelIndex]) return 0;
    const totalTime = blindLevels[currentLevelIndex].duration * 60;
    return ((totalTime - currentTime) / totalTime) * 100;
  };
  
  // Verificar se o próximo nível é um intervalo
  const isNextLevelBreak = () => {
    if (currentLevelIndex + 1 >= blindLevels.length) return false;
    return blindLevels[currentLevelIndex + 1].isBreak;
  };
  
  // Calcular tempo até o próximo intervalo
  const calculateTimeToBreak = () => {
    let timeToBreak = 0;
    let foundBreak = false;
    
    for (let i = currentLevelIndex + 1; i < blindLevels.length; i++) {
      if (blindLevels[i].isBreak) {
        foundBreak = true;
        break;
      }
      timeToBreak += blindLevels[i].duration;
    }
    
    if (!foundBreak) return "Nenhum intervalo restante";
    
    return `${timeToBreak} min`;
  };
  
  // Verificar se o nível atual é um intervalo
  const isCurrentLevelBreak = blindLevels[currentLevelIndex]?.isBreak || false;
  
  return {
    currentTime,
    timerRunning,
    currentLevelIndex,
    blindLevels,
    isFullscreen,
    gameStartTime,
    currentGameTime,
    showLevelChange,
    countdownSoundStarted,
    calculateProgress,
    isNextLevelBreak,
    calculateTimeToBreak,
    isCurrentLevelBreak
  };
}
