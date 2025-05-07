
import { TimerState } from "../useTimerState";
import { BlindLevel } from "@/lib/db/models";

export interface TimerAlertState {
  isAlertTime: boolean;
  isFinalCountdown: boolean;
  isLevelJustCompleted: boolean;
  showAlert: boolean;
  isNewBlindAlert: boolean;
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

  // Novo alerta específico para quando um novo blind acaba de iniciar (primeiros 3 segundos)
  // Modificado para ser independente do estado showAlert, usando apenas o elapsedTimeInLevel
  const isNewBlindAlert = state.isRunning && 
    state.elapsedTimeInLevel < 3 && 
    state.currentLevelIndex >= 0 && 
    currentLevel && 
    !currentLevel.isBreak;

  // Separamos a lógica visual do showAlert da lógica de detecção isNewBlindAlert
  // showAlert continua vindo do state para outras funções poderem controlá-lo

  return {
    isAlertTime,
    isFinalCountdown,
    isLevelJustCompleted,
    showAlert: state.showAlert,
    isNewBlindAlert
  };
}
