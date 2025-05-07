
import React from "react";
import { useTimerUtils } from "../useTimerUtils";

interface TimeRemainingProps {
  timeRemainingInLevel: number;
  showAlert: boolean;
  isNewBlindAlert: boolean;
}

export function TimeRemaining({ 
  timeRemainingInLevel, 
  showAlert, 
  isNewBlindAlert 
}: TimeRemainingProps) {
  const { formatTime } = useTimerUtils();
  
  // Efeito de alerta para o tempo restante
  // Aplicar apenas quando showAlert = true E NÃO for um alerta de novo blind
  // Isso garante que o tempo não fique vermelho durante o alerta de novo blind
  const timeRemainingClass = showAlert && !isNewBlindAlert
    ? 'animate-pulse scale-105 text-red-500'
    : '';
  
  return (
    <div 
      className={`text-5xl md:text-7xl font-bold text-white ${timeRemainingClass} transition-all`}
    >
      {formatTime(timeRemainingInLevel)}
    </div>
  );
}
