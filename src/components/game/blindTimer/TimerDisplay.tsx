
import React from "react";
import { BlindLevel } from "@/lib/db/models";
import { LevelHeader } from "./components/LevelHeader";
import { BlindDisplay } from "./components/BlindDisplay";
import { TimeRemaining } from "./components/TimeRemaining";
import { ProgressBar } from "./components/ProgressBar";
import { StatusInfo } from "./components/StatusInfo";
import { FullscreenButton } from "./components/FullscreenButton";

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
  if (!currentLevel) return null;

  // Calcular a porcentagem de tempo decorrido no nível atual
  const progressPercentage = currentLevel
    ? 100 - (timeRemainingInLevel / (currentLevel.duration * 60)) * 100
    : 0;

  return (
    <div className="text-center space-y-4 timer-container relative">
      {/* Botão de tela cheia */}
      <FullscreenButton onToggleFullScreen={onToggleFullScreen} />
      
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
