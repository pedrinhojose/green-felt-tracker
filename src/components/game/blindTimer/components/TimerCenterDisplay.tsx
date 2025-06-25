
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
      {/* Label "tempo" */}
      <div className="text-poker-gold text-2xl font-normal mb-4">tempo</div>
      
      {/* Timer principal - muito maior conforme a imagem */}
      <div className={`text-8xl md:text-9xl font-bold ${getTimeColor()} transition-colors duration-300 font-mono`}>
        {formatTime(timeRemainingInLevel)}
      </div>
    </div>
  );
}
