
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
  
  // Removemos completamente a lógica de alteração de classe condicional
  // para garantir que o timer sempre permaneça branco
  
  return (
    <div 
      className="text-5xl md:text-7xl font-bold text-white transition-all"
    >
      {formatTime(timeRemainingInLevel)}
    </div>
  );
}
