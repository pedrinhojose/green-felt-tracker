
import React, { useEffect, useState } from "react";
import { BlindLevel } from "@/lib/db/models";
import { useTimerUtils } from "../useTimerUtils";

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
  const { formatTotalTime, getCurrentTime, getTimeUntilBreak } = useTimerUtils();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  
  // Atualiza o relógio do sistema a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

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
    <>
      <div className="grid grid-cols-3 gap-4 text-gray-300 pt-4">
        <div>
          <div className="text-xs text-gray-400">Próximo Nível</div>
          {nextLevel ? (
            <div className="text-sm text-poker-gold">
              {nextLevel.isBreak ? 'INTERVALO' : `${nextLevel.smallBlind} / ${nextLevel.bigBlind}`}
            </div>
          ) : (
            <div className="text-sm text-poker-gold">Último Nível</div>
          )}
        </div>
        
        <div>
          <div className="text-xs text-gray-400">Tempo de Jogo</div>
          <div className="text-sm text-poker-gold">{formatTotalTime(totalElapsedTime)}</div>
        </div>
        
        <div>
          <div className="text-xs text-gray-400">Hora Atual</div>
          <div className="text-sm text-poker-gold">{currentTime}</div>
        </div>
      </div>
      
      {/* Próximo intervalo */}
      {nextBreak && (
        <div className="bg-poker-navy/30 rounded-lg p-2 mt-2 text-sm">
          <div className="text-gray-400">Próximo Intervalo</div>
          <div className="text-white">
            {levelsUntilBreak && levelsUntilBreak > 0 ? (
              <>
                Faltam {levelsUntilBreak} níveis (Nível {nextBreak.level})
                {' - '}
                <span className="text-poker-gold font-medium">
                  {getTimeUntilBreakSafely()}
                </span>
              </>
            ) : (
              'Próximo nível'
            )}
          </div>
        </div>
      )}
    </>
  );
}
