
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
      {/* Container simplificado */}
      <div className="relative">
        {/* Timer principal simplificado */}
        <div className={`${isMobile ? 'text-[60px]' : 'text-[120px]'} font-bold ${getTimeColor()} transition-all duration-300 font-mono leading-none text-center`}>
          {formatTime(timeRemainingInLevel)}
        </div>
        
        {/* Label "Tempo" simplificado */}
        <div className={`text-poker-gold ${isMobile ? 'text-lg' : 'text-3xl'} font-normal ${isMobile ? 'mt-1' : 'mt-4'} text-center`}>
          Tempo
        </div>
      </div>
    </div>
  );
}
