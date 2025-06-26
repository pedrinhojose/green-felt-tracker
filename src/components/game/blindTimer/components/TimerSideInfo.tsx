
import React, { useState, useEffect } from "react";
import { BlindLevel } from "@/lib/db/models";
import { useTimerUtils } from "../useTimerUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface TimerSideInfoProps {
  side: 'left' | 'right';
  currentLevel?: BlindLevel;
  nextLevel?: BlindLevel;
  totalElapsedTime?: number;
  nextBreak?: BlindLevel | null;
  levelsUntilBreak?: number | null;
  blindLevels?: BlindLevel[];
  timeRemainingInLevel?: number;
  currentLevelIndex?: number;
}

export function TimerSideInfo({ 
  side, 
  currentLevel, 
  nextLevel, 
  totalElapsedTime = 0,
  nextBreak,
  levelsUntilBreak,
  blindLevels = [],
  timeRemainingInLevel = 0,
  currentLevelIndex = 0
}: TimerSideInfoProps) {
  const { formatTotalTime, getMinutesUntilBreak } = useTimerUtils();
  const isMobile = useIsMobile();
  
  // Estados para atualização em tempo real
  const [displayTotalTime, setDisplayTotalTime] = useState(formatTotalTime(totalElapsedTime));
  const [minutesUntilBreak, setMinutesUntilBreak] = useState(0);

  // Atualizar tempo total em tempo real
  useEffect(() => {
    setDisplayTotalTime(formatTotalTime(totalElapsedTime));
  }, [totalElapsedTime, formatTotalTime]);

  // Atualizar minutos até o intervalo em tempo real
  useEffect(() => {
    if (nextBreak && timeRemainingInLevel >= 0) {
      const minutes = getMinutesUntilBreak(currentLevelIndex, timeRemainingInLevel, blindLevels);
      setMinutesUntilBreak(minutes);
    }
  }, [nextBreak, timeRemainingInLevel, currentLevelIndex, blindLevels, getMinutesUntilBreak]);

  if (side === 'left') {
    // Lado esquerdo - PRÓXIMO NÍVEL (mais afastado do centro) - menos destaque
    return (
      <div className={`absolute ${isMobile ? 'left-2 top-16' : 'left-[32%] top-1/2 -translate-y-1/2 -translate-x-full pr-6'} text-left`}>
        {/* PRÓXIMO NÍVEL */}
        <div className={isMobile ? 'mb-1' : 'mb-2'}>
          <h3 className={`text-poker-gold ${isMobile ? 'text-xs' : 'text-sm'} font-normal mb-1`}>PRÓXIMO NÍVEL</h3>
          {nextLevel ? (
            <div className={`text-white ${isMobile ? 'text-lg' : 'text-4xl'} font-semibold`}>
              {nextLevel.isBreak ? (
                <span>INTERVALO</span>
              ) : (
                <span>{nextLevel.smallBlind}/{nextLevel.bigBlind}</span>
              )}
            </div>
          ) : (
            <div className={`text-white ${isMobile ? 'text-lg' : 'text-4xl'} font-semibold`}>
              FIM
            </div>
          )}
        </div>
        
        {/* INTERVALO EM - mostra minutos até o próximo intervalo */}
        {nextBreak && levelsUntilBreak && (
          <div className={isMobile ? 'mb-1' : 'mb-2'}>
            <h3 className={`text-poker-gold ${isMobile ? 'text-xs' : 'text-sm'} font-normal mb-1`}>INTERVALO EM</h3>
            <div className={`text-white ${isMobile ? 'text-xs' : 'text-xl'} font-bold`}>
              {minutesUntilBreak} MIN ({levelsUntilBreak} BLINDS)
            </div>
          </div>
        )}
        
        {/* TEMPO TOTAL DE JOGO - atualizado em tempo real */}
        <div>
          <h3 className={`text-poker-gold ${isMobile ? 'text-xs' : 'text-sm'} font-normal mb-1`}>TEMPO TOTAL:</h3>
          <div className={`text-white ${isMobile ? 'text-xs' : 'text-lg'} font-bold`}>
            {displayTotalTime}
          </div>
        </div>
      </div>
    );
  }

  // Lado direito - NÍVEL ATUAL (mais afastado do centro) - DESTAQUE
  return (
    <div className={`absolute ${isMobile ? 'right-2 top-16' : 'right-[32%] top-1/2 -translate-y-1/2 translate-x-full pl-6'} text-right`}>
      {/* NÍVEL ATUAL - DESTAQUE */}
      <div className={isMobile ? 'mb-1' : 'mb-2'}>
        <h3 className={`text-poker-gold ${isMobile ? 'text-xs' : 'text-lg'} font-bold mb-1`}>
          NÍVEL ATUAL
        </h3>
        {currentLevel && (
          <div className={`text-white ${isMobile ? 'text-xl' : 'text-6xl'} font-bold`}>
            {currentLevel.isBreak ? (
              <span>INTERVALO</span>
            ) : (
              <span>{currentLevel.smallBlind}/{currentLevel.bigBlind}</span>
            )}
          </div>
        )}
      </div>
      
      {/* ANTE ATUAL */}
      {currentLevel && !currentLevel.isBreak && (
        <div>
          <h3 className={`text-poker-gold ${isMobile ? 'text-xs' : 'text-sm'} font-normal mb-1`}>ANTE ATUAL</h3>
          <div className={`text-white ${isMobile ? 'text-xs' : 'text-xl'} font-bold`}>
            Ante {currentLevel.ante}
          </div>
        </div>
      )}
    </div>
  );
}
