
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
      {/* Timer principal */}
      <div className={`text-6xl md:text-7xl font-bold ${getTimeColor()} transition-colors duration-300 font-mono`}>
        {formatTime(timeRemainingInLevel)}
      </div>
      
      {/* Blinds atuais com efeito 3D */}
      {currentLevel && (
        <div className="mt-4 text-center">
          <div 
            className="text-3xl md:text-4xl font-bold text-poker-gold"
            style={{
              textShadow: '2px 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(223,198,97,0.4), 0 0 40px rgba(223,198,97,0.2)'
            }}
          >
            {currentLevel.smallBlind}/{currentLevel.bigBlind}
          </div>
          {currentLevel.ante > 0 && (
            <div 
              className="text-lg md:text-xl text-poker-gold mt-1"
              style={{
                textShadow: '1px 1px 4px rgba(0,0,0,0.8), 0 0 10px rgba(223,198,97,0.3)'
              }}
            >
              Ante: {currentLevel.ante}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
