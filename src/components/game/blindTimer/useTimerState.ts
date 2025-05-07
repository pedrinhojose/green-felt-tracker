
import { useState, useEffect } from "react";
import { BlindLevel } from "@/lib/db/models";

export interface TimerState {
  isRunning: boolean;
  currentLevelIndex: number;
  elapsedTimeInLevel: number;
  totalElapsedTime: number;
  showAlert: boolean;
  soundEnabled: boolean;
}

export function useTimerState(blindLevels: BlindLevel[]) {
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    currentLevelIndex: 0,
    elapsedTimeInLevel: 0,
    totalElapsedTime: 0,
    showAlert: false,
    soundEnabled: true,
  });

  const currentLevel = blindLevels[state.currentLevelIndex];
  const nextLevel = blindLevels[state.currentLevelIndex + 1];
  
  // Calcula o tempo restante no nível atual em segundos
  const timeRemainingInLevel = currentLevel 
    ? Math.max(0, currentLevel.duration * 60 - state.elapsedTimeInLevel)
    : 0;
  
  // Verifica se é hora de alertar (1 minuto antes do final do nível)
  const isAlertTime = timeRemainingInLevel <= 60 && timeRemainingInLevel > 55 && state.isRunning;
  
  // Verifica se está nos segundos finais (últimos 5 segundos)
  const isFinalCountdown = timeRemainingInLevel <= 5 && timeRemainingInLevel > 0 && state.isRunning;
  
  // Verifica se o nível acabou de terminar
  const isLevelJustCompleted = timeRemainingInLevel === 0 && state.isRunning && state.elapsedTimeInLevel % 60 === 0;

  // Encontra o próximo intervalo - com verificações de segurança
  let nextBreakIndex = -1;
  if (Array.isArray(blindLevels) && blindLevels.length > 0) {
    nextBreakIndex = blindLevels.findIndex((level, index) => 
      index > state.currentLevelIndex && level && level.isBreak
    );
  }
  
  const nextBreak = nextBreakIndex !== -1 ? blindLevels[nextBreakIndex] : null;
  const levelsUntilBreak = nextBreakIndex !== -1 ? nextBreakIndex - state.currentLevelIndex : null;

  return {
    state,
    setState,
    currentLevel,
    nextLevel,
    timeRemainingInLevel,
    isAlertTime,
    isFinalCountdown,
    isLevelJustCompleted,
    nextBreak,
    levelsUntilBreak,
  };
}
