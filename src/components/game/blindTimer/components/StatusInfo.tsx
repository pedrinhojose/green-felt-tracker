
import React, { useEffect, useState } from "react";
import { BlindLevel } from "@/lib/db/models";
import { useTimerUtils } from "../useTimerUtils";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const { formatTotalTime, getTimeUntilBreak } = useTimerUtils();
  const [timeUntilBreakValue, setTimeUntilBreakValue] = useState<string>("");
  
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

  // Estilos responsivos baseados no tamanho da tela
  const nextLevelTextSize = isMobile ? "text-lg" : "text-2xl";
  const gameTimeTextSize = isMobile ? "text-sm" : "text-sm";
  const breakInfoTextSize = isMobile ? "text-base" : "text-xl";
  const breakValueTextSize = isMobile ? "text-lg" : "text-3.9xl";

  return (
    <div className="w-full">
      {/* Layout responsivo para as informações principais */}
      <div className={`${isMobile ? 'flex flex-col space-y-3' : 'grid grid-cols-3 gap-4'} text-gray-300 pt-4`}>
        <div className={isMobile ? 'text-center' : ''}>
          <div className="text-xs text-gray-400">Próximo Nível</div>
          {nextLevel ? (
            <div className={cn(nextLevelTextSize, "text-poker-gold font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]")}>
              {nextLevel.isBreak ? 'INTERVALO' : `${nextLevel.smallBlind} / ${nextLevel.bigBlind}`}
            </div>
          ) : (
            <div className={cn(nextLevelTextSize, "text-poker-gold font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]")}>Último Nível</div>
          )}
        </div>
        
        <div className={isMobile ? 'text-center' : ''}>
          <div className="text-xs text-gray-400">Tempo de Jogo</div>
          <div className={cn(gameTimeTextSize, "text-poker-gold")}>{formatTotalTime(totalElapsedTime)}</div>
        </div>
        
        {/* Remover Hora Atual daqui pois já está no TimerDisplay */}
        {!isMobile && (
          <div>
            <div className="text-xs text-gray-400">Status</div>
            <div className="text-sm text-poker-gold">Em Andamento</div>
          </div>
        )}
      </div>
      
      {/* Próximo intervalo - DESTACADO e RESPONSIVO */}
      {nextBreak && (
        <div className={`bg-poker-navy/30 rounded-lg p-${isMobile ? '3' : '2'} mt-${isMobile ? '4' : '2'}`}>
          <div className={cn(breakInfoTextSize, "text-gray-400 font-semibold text-center")}>Próximo Intervalo</div>
          <div className="text-white">
            {levelsUntilBreak && levelsUntilBreak > 0 ? (
              <div className={cn(breakValueTextSize, "text-poker-gold font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-center")}>
                {isMobile ? (
                  <>
                    <div>Faltam {levelsUntilBreak} níveis</div>
                    <div className="text-sm">(Nível {nextBreak.level})</div>
                    <div className="text-poker-gold mt-1">
                      {getTimeUntilBreakSafely()}
                    </div>
                  </>
                ) : (
                  <>
                    Faltam {levelsUntilBreak} níveis (Nível {nextBreak.level})
                    {' - '}
                    <span className="text-poker-gold">
                      {getTimeUntilBreakSafely()}
                    </span>
                  </>
                )}
              </div>
            ) : (
              <div className={cn(breakValueTextSize, "text-poker-gold font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-center")}>Próximo nível</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
