
import { BlindLevel } from "@/lib/db/models";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function useTimerUtils() {
  // Formata o tempo em minutos:segundos
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  // Formata o tempo total decorrido em HH:MM:SS
  const formatTotalTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  // Retorna a hora atual formatada
  const getCurrentTime = (): string => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calcula quanto tempo falta para o próximo intervalo
  const getTimeUntilBreak = (
    currentLevelIndex: number, 
    elapsedTimeInLevel: number,
    blindLevels: BlindLevel[],
    nextBreakIndex: number
  ): string => {
    if (nextBreakIndex === -1) return "Não há intervalo programado";
    
    let timeUntilBreak = 0;
    
    // Tempo restante no nível atual
    const currentLevel = blindLevels[currentLevelIndex];
    const remainingInCurrentLevel = (currentLevel.duration * 60) - elapsedTimeInLevel;
    
    timeUntilBreak += remainingInCurrentLevel;
    
    // Somar o tempo dos níveis intermediários
    for (let i = currentLevelIndex + 1; i < nextBreakIndex; i++) {
      timeUntilBreak += blindLevels[i].duration * 60;
    }
    
    const minutes = Math.floor(timeUntilBreak / 60);
    return `${minutes} min`;
  };

  return {
    formatTime,
    formatTotalTime,
    getCurrentTime,
    getTimeUntilBreak,
  };
}
