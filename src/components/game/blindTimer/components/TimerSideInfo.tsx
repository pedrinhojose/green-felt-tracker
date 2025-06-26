
import React from "react";
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
}

export function TimerSideInfo({ 
  side, 
  currentLevel, 
  nextLevel, 
  totalElapsedTime = 0,
  nextBreak,
  levelsUntilBreak,
  blindLevels = [],
  timeRemainingInLevel = 0
}: TimerSideInfoProps) {
  const { formatTotalTime } = useTimerUtils();
  const isMobile = useIsMobile();

  if (side === 'left') {
    // Lado esquerdo - PRÓXIMO NÍVEL (muito próximo do círculo)
    return (
      <div className={`absolute ${isMobile ? 'left-2 top-16' : 'left-[45%] top-1/2 -translate-y-1/2 -translate-x-full pr-4'} text-left`}>
        {/* PRÓXIMO NÍVEL */}
        <div className={isMobile ? 'mb-1' : 'mb-2'}>
          <h3 className={`text-poker-gold ${isMobile ? 'text-xs' : 'text-sm'} font-normal mb-1`}>PRÓXIMO NÍVEL</h3>
          {nextLevel ? (
            <div className={`text-white ${isMobile ? 'text-sm' : 'text-3xl'} font-bold`}>
              {nextLevel.isBreak ? (
                <span>INTERVALO</span>
              ) : (
                <span>{nextLevel.smallBlind}/{nextLevel.bigBlind}</span>
              )}
            </div>
          ) : (
            <div className={`text-white ${isMobile ? 'text-sm' : 'text-3xl'} font-bold`}>
              FIM
            </div>
          )}
        </div>
        
        {/* INTERVALO EM */}
        {nextBreak && levelsUntilBreak && (
          <div className={isMobile ? 'mb-1' : 'mb-2'}>
            <h3 className={`text-poker-gold ${isMobile ? 'text-xs' : 'text-sm'} font-normal mb-1`}>INTERVALO EM</h3>
            <div className={`text-white ${isMobile ? 'text-xs' : 'text-xl'} font-bold`}>
              {nextBreak.duration} MIN ({levelsUntilBreak} BLINDS)
            </div>
          </div>
        )}
        
        {/* TEMPO TOTAL DE JOGO */}
        <div>
          <h3 className={`text-poker-gold ${isMobile ? 'text-xs' : 'text-sm'} font-normal mb-1`}>TEMPO TOTAL:</h3>
          <div className={`text-white ${isMobile ? 'text-xs' : 'text-lg'} font-bold`}>
            {formatTotalTime(totalElapsedTime)}
          </div>
        </div>
      </div>
    );
  }

  // Lado direito - NÍVEL ATUAL (muito próximo do círculo) - DESTAQUE PRINCIPAL
  return (
    <div className={`absolute ${isMobile ? 'right-2 top-16' : 'right-[45%] top-1/2 -translate-y-1/2 translate-x-full pl-4'} text-right`}>
      {/* NÍVEL ATUAL - MAIOR DESTAQUE */}
      <div className={isMobile ? 'mb-1' : 'mb-2'}>
        <h3 className={`text-poker-gold ${isMobile ? 'text-xs' : 'text-sm'} font-normal mb-1`}>NÍVEL ATUAL</h3>
        {currentLevel && (
          <div className={`text-white ${isMobile ? 'text-base' : 'text-4xl'} font-bold`}>
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
