
import React from "react";
import { BlindLevel } from "@/lib/db/models";

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
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {/* Timer principal - exatamente como na imagem */}
      <div className={`text-[120px] font-bold ${getTimeColor()} transition-colors duration-300 font-mono leading-none`}>
        {formatTime(timeRemainingInLevel)}
      </div>
      
      {/* Label "tempo" abaixo do timer */}
      <div className="text-poker-gold text-3xl font-normal mt-4">tempo</div>
    </div>
  );
}
