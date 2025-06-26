
import React from "react";
import { BlindLevel } from "@/lib/db/models";
import { useIsMobile } from "@/hooks/use-mobile";

interface TimerCenterDisplayProps {
  timeRemainingInLevel: number;
  currentLevel: BlindLevel | undefined;
  showAlert: boolean;
  isNewBlindAlert: boolean;
}

export function TimerCenterDisplay({ 
  timeRemainingInLevel, 
  currentLevel,
  showAlert,
  isNewBlindAlert 
}: TimerCenterDisplayProps) {
  const isMobile = useIsMobile();
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (showAlert || isNewBlindAlert) return 'text-red-400';
    if (timeRemainingInLevel <= 60) return 'text-yellow-400';
    return 'text-white';
  };

  return (
    <div 
      className="absolute inset-0 flex flex-col items-center justify-center"
      style={{ pointerEvents: 'none' }}
    >
      {/* Timer principal - responsivo */}
      <div 
        className={`${isMobile ? 'text-[60px]' : 'text-[120px]'} font-bold ${getTimeColor()} transition-colors duration-300 font-mono leading-none`}
        style={{ pointerEvents: 'auto' }}
      >
        {formatTime(timeRemainingInLevel)}
      </div>
      
      {/* Label "tempo" abaixo do timer - responsivo */}
      <div 
        className={`text-poker-gold ${isMobile ? 'text-lg' : 'text-3xl'} font-normal ${isMobile ? 'mt-1' : 'mt-4'}`}
        style={{ pointerEvents: 'auto' }}
      >
        tempo
      </div>
    </div>
  );
}
