
import React from "react";
import { BlindLevel } from "@/lib/db/models";
import { LevelHeader } from "./components/LevelHeader";
import { BlindDisplay } from "./components/BlindDisplay";
import { TimeRemaining } from "./components/TimeRemaining";
import { ProgressBar } from "./components/ProgressBar";
import { StatusInfo } from "./components/StatusInfo";
import { FullscreenButton } from "./components/FullscreenButton";
import { useEffect, useState } from "react";
import { useTimerUtils } from "./useTimerUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface TimerDisplayProps {
  currentLevel: BlindLevel | undefined;
  nextLevel: BlindLevel | undefined;
  timeRemainingInLevel: number;
  totalElapsedTime: number;
  nextBreak: BlindLevel | null;
  levelsUntilBreak: number | null;
  showAlert: boolean;
  isNewBlindAlert: boolean;
  onProgressClick: (percentage: number) => void;
  onToggleFullScreen: () => void;
  blindLevels?: BlindLevel[];
}

export default function TimerDisplay({ 
  currentLevel,
  nextLevel,
  timeRemainingInLevel,
  totalElapsedTime,
  nextBreak,
  levelsUntilBreak,
  showAlert,
  isNewBlindAlert,
  onProgressClick,
  onToggleFullScreen,
  blindLevels = []
}: TimerDisplayProps) {
  const isMobile = useIsMobile();
  
  if (!currentLevel) return null;
  
  const { getCurrentTime } = useTimerUtils();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  // Atualizar a hora atual a cada minuto
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(getCurrentTime());
    };

    // Atualizar imediatamente
    updateTime();
    
    // Atualizar a cada minuto
    const interval = setInterval(updateTime, 60000);
    
    return () => clearInterval(interval);
  }, [getCurrentTime]);

  // Calcular a porcentagem de tempo decorrido no nível atual
  const progressPercentage = currentLevel
    ? 100 - (timeRemainingInLevel / (currentLevel.duration * 60)) * 100
    : 0;

  return (
    <div className="text-center space-y-4 timer-container relative w-full">
      {/* Botão de tela cheia */}
      <FullscreenButton onToggleFullScreen={onToggleFullScreen} />

      {/* Hora atual no canto superior esquerdo */}
      <div className="absolute top-1 left-1 text-left p-2 rounded-md bg-poker-navy/30">
        <div className="text-white text-xs">Hora Atual</div>
        <div className="text-poker-gold text-lg font-medium">
          {currentTime}
        </div>
      </div>
      
      {/* Nível atual */}
      <LevelHeader currentLevel={currentLevel} />
      
      {/* Blinds atuais */}
      <BlindDisplay 
        currentLevel={currentLevel} 
        isNewBlindAlert={isNewBlindAlert} 
      />
      
      {/* Tempo restante */}
      <TimeRemaining 
        timeRemainingInLevel={timeRemainingInLevel}
        showAlert={showAlert}
        isNewBlindAlert={isNewBlindAlert}
      />
      
      {/* Barra de progresso clicável */}
      <ProgressBar 
        progressPercentage={progressPercentage}
        onProgressClick={onProgressClick}
      />
      
      {/* Informações adicionais */}
      <StatusInfo 
        nextLevel={nextLevel}
        totalElapsedTime={totalElapsedTime}
        nextBreak={nextBreak}
        levelsUntilBreak={levelsUntilBreak}
        currentLevel={currentLevel}
        blindLevels={blindLevels}
        timeRemainingInLevel={timeRemainingInLevel}
      />
    </div>
  );
}
