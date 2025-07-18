
import React, { useEffect, useState } from "react";
import { BlindLevel } from "@/lib/db/models";
import { useTimerUtils } from "../useTimerUtils";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatBlindPair } from "@/lib/utils/blindUtils";

interface StatusInfoProps {
  nextLevel: BlindLevel | undefined;
  totalElapsedTime: number;
  nextBreak: BlindLevel | null;
  levelsUntilBreak: number | null;
  currentLevel: BlindLevel | undefined;
  blindLevels: BlindLevel[];
  timeRemainingInLevel: number;
}

export function StatusInfo({ 
  nextLevel,
  totalElapsedTime,
  nextBreak,
  levelsUntilBreak,
  currentLevel,
  blindLevels,
  timeRemainingInLevel
}: StatusInfoProps) {
  const isMobile = useIsMobile();
  const { formatTotalTime, getTimeUntilBreak, getCurrentTime } = useTimerUtils();
  const [timeUntilBreakValue, setTimeUntilBreakValue] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  
  // Atualiza o tempo até o intervalo a cada segundo
  useEffect(() => {
    const calculateTimeUntilBreak = () => {
      setTimeUntilBreakValue(getTimeUntilBreakSafely());
    };

    // Calcular imediatamente
    calculateTimeUntilBreak();
    
    // Atualizar a cada segundo
    const interval = setInterval(calculateTimeUntilBreak, 1000);
    
    return () => clearInterval(interval);
  }, [currentLevel, nextBreak, blindLevels, timeRemainingInLevel]);

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

  // Função de segurança para obter o tempo até o próximo intervalo
  const getTimeUntilBreakSafely = () => {
    if (!currentLevel || !nextBreak) return "";
    
    try {
      // Verificar se temos todos os dados necessários
      if (!Array.isArray(currentLevel.level) && typeof currentLevel.level === 'number' && 
          !Array.isArray(nextBreak.level) && typeof nextBreak.level === 'number' &&
          typeof currentLevel.duration === 'number') {
        
        const currentLevelIndex = currentLevel.level - 1;
        const elapsedTimeInCurrentLevel = currentLevel.duration * 60 - timeRemainingInLevel;
        const nextBreakIndex = nextBreak.level - 1;
        
        // Usar a prop blindLevels ao invés de window.blindLevels
        if (blindLevels && blindLevels.length > 0) {
          return getTimeUntilBreak(
            currentLevelIndex,
            elapsedTimeInCurrentLevel,
            blindLevels,
            nextBreakIndex
          );
        }
      }
      return "Calculando...";
    } catch (error) {
      console.error("Erro ao calcular tempo até o intervalo:", error);
      return "Cálculo indisponível";
    }
  };

  return (
    <div className="w-full">
      {/* Layout em grid para as informações principais */}
      <div className="grid grid-cols-3 gap-4 text-gray-300 pt-4">
        <div>
          <div className="text-xs text-gray-400">Próximo Nível</div>
          {nextLevel ? (
            <div className={cn("text-2xl text-poker-gold font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]")}>
              {nextLevel.isBreak ? 'INTERVALO' : formatBlindPair(nextLevel.smallBlind, nextLevel.bigBlind)}
            </div>
          ) : (
            <div className={cn("text-2xl text-poker-gold font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]")}>Último Nível</div>
          )}
        </div>
        
        <div>
          <div className="text-xs text-gray-400">Tempo de Jogo</div>
          <div className={cn("text-sm text-poker-gold")}>{formatTotalTime(totalElapsedTime)}</div>
        </div>
        
        <div>
          <div className="text-xs text-gray-400">Hora Atual</div>
          <div className="text-sm text-poker-gold">{currentTime}</div>
        </div>
      </div>
      
      {/* Próximo intervalo - DESTACADO */}
      {nextBreak && (
        <div className="bg-poker-navy/30 rounded-lg p-2 mt-2">
          <div className={cn("text-xl text-gray-400 font-semibold text-center")}>Próximo Intervalo</div>
          <div className="text-white">
            {levelsUntilBreak && levelsUntilBreak > 0 ? (
              <div className={cn("text-3xl text-poker-gold font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-center")}>
                Faltam {levelsUntilBreak} níveis (Nível {nextBreak.level})
                {' - '}
                <span className="text-poker-gold">
                  {getTimeUntilBreakSafely()}
                </span>
              </div>
            ) : (
              <div className={cn("text-3xl text-poker-gold font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-center")}>Próximo nível</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
