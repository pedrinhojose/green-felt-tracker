
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
  
  const { getTimeUntilBreak } = useTimerUtils();
  const [timeUntilBreakValue, setTimeUntilBreakValue] = useState<string>("");

  // Atualiza o tempo até o intervalo a cada segundo
  useEffect(() => {
    // Função para calcular o tempo até o intervalo
    const calculateTimeUntilBreak = () => {
      if (!currentLevel || !nextBreak) {
        setTimeUntilBreakValue("");
        return;
      }
      
      try {
        // Verificar se temos os dados necessários
        if (!Array.isArray(currentLevel.level) && typeof currentLevel.level === 'number' && 
            !Array.isArray(nextBreak.level) && typeof nextBreak.level === 'number' &&
            typeof currentLevel.duration === 'number') {
          
          const currentLevelIndex = currentLevel.level - 1;
          const elapsedTimeInCurrentLevel = currentLevel.duration * 60 - timeRemainingInLevel;
          const nextBreakIndex = nextBreak.level - 1;
          
          // Calcular o tempo até o intervalo
          if (blindLevels && blindLevels.length > 0) {
            const time = getTimeUntilBreak(
              currentLevelIndex,
              elapsedTimeInCurrentLevel,
              blindLevels,
              nextBreakIndex
            );
            setTimeUntilBreakValue(time);
          }
        }
      } catch (error) {
        console.error("Erro ao calcular tempo até o intervalo:", error);
        setTimeUntilBreakValue("Cálculo indisponível");
      }
    };

    // Calcular imediatamente
    calculateTimeUntilBreak();
    
    // Atualizar a cada segundo
    const interval = setInterval(calculateTimeUntilBreak, 1000);
    
    return () => clearInterval(interval);
  }, [currentLevel, nextBreak, blindLevels, timeRemainingInLevel, getTimeUntilBreak]);

  // Calcular a porcentagem de tempo decorrido no nível atual
  const progressPercentage = currentLevel
    ? 100 - (timeRemainingInLevel / (currentLevel.duration * 60)) * 100
    : 0;

  return (
    <div className="text-center space-y-4 timer-container relative">
      {/* Botão de tela cheia */}
      <FullscreenButton onToggleFullScreen={onToggleFullScreen} />

      {/* Contador de tempo até o intervalo */}
      {nextBreak && levelsUntilBreak && levelsUntilBreak > 0 && (
        <div className="absolute top-1 left-1 text-left p-2 rounded-md bg-poker-navy/30">
          <div className="text-white text-xs">Intervalo em</div>
          <div className="text-poker-gold text-sm font-medium">
            {timeUntilBreakValue} - {levelsUntilBreak} níveis
          </div>
        </div>
      )}
      
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
