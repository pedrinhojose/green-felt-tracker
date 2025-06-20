
import React from "react";
import { useTimerUtils } from "../useTimerUtils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  // Tamanhos responsivos para o timer
  const timerTextSize = isMobile ? 'text-4xl md:text-5xl' : 'text-5xl md:text-7xl';
  
  return (
    <div 
      className={`${timerTextSize} font-bold text-white transition-all`}
      style={{
        textShadow: "0px 3px 6px rgba(0,0,0,0.6)"
      }}
    >
      {formatTime(timeRemainingInLevel)}
    </div>
  );
}
