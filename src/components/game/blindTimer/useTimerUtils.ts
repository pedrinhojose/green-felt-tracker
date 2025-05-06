
import { useRef } from "react";

interface TimerUtilsProps {
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  blindLevels: any[];
  currentLevelIndex: number;
}

export function useTimerUtils({
  currentTime,
  setCurrentTime,
  blindLevels,
  currentLevelIndex
}: TimerUtilsProps) {
  const progressRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<HTMLDivElement>(null);
  
  // Formatar tempo como MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Formatar tempo total decorrido
  const formatElapsedTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Permitir posicionar o tempo clicando na barra de progresso
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !blindLevels[currentLevelIndex]) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    
    // Calcular o novo tempo baseado na porcentagem clicada
    const totalLevelTime = blindLevels[currentLevelIndex].duration * 60;
    const newTime = Math.round(totalLevelTime - (totalLevelTime * percentage));
    
    // Atualizar o tempo atual
    setCurrentTime(Math.max(1, newTime)); // Evitar que chegue a 0
  };
  
  return {
    progressRef,
    timerRef,
    formatTime,
    formatElapsedTime,
    handleProgressBarClick
  };
}
