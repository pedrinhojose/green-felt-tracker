
import { TimerState } from "../useTimerState";
import { BlindLevel } from "@/lib/db/models";

export interface TimerAlertState {
  isAlertTime: boolean;
  isFinalCountdown: boolean;
  isLevelJustCompleted: boolean;
  showAlert: boolean;
}

export function useTimerAlerts(
  currentLevel: BlindLevel | undefined,
  timeRemainingInLevel: number,
  state: TimerState
): TimerAlertState {
  // Verifica se é hora de alertar (1 minuto antes do final do nível)
  const isAlertTime = timeRemainingInLevel <= 60 && timeRemainingInLevel > 55 && state.isRunning;
  
  // Verifica se está nos segundos finais (últimos 5 segundos)
  const isFinalCountdown = timeRemainingInLevel <= 5 && timeRemainingInLevel > 0 && state.isRunning;
  
  // Verifica se o nível acabou de terminar
  const isLevelJustCompleted = timeRemainingInLevel === 0 && state.isRunning && state.elapsedTimeInLevel % 60 === 0;

  return {
    isAlertTime,
    isFinalCountdown,
    isLevelJustCompleted,
    showAlert: state.showAlert
  };
}
