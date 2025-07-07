
import React, { useState, useEffect } from "react";
import { BlindLevel } from "@/lib/db/models";
import { useTimerUtils } from "../useTimerUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatBlindPair, formatBlindValue } from "@/lib/utils/blindUtils";

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
  const { formatTotalTime, getMinutesUntilBreak, getCurrentTime } = useTimerUtils();
  const isMobile = useIsMobile();
  
  // Estados para atualização em tempo real
  const [displayTotalTime, setDisplayTotalTime] = useState(formatTotalTime(totalElapsedTime));
  const [minutesUntilBreak, setMinutesUntilBreak] = useState(0);
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

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

  // Atualizar hora atual a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [getCurrentTime]);

  if (side === 'left') {
    // Lado esquerdo - PRÓXIMO NÍVEL E INFORMAÇÕES AUXILIARES
    return (
      <div className={`absolute ${isMobile ? 'top-6 left-4 right-4' : 'left-8 top-1/2 -translate-y-1/2'} text-left z-10`}>
        <div className={`${isMobile ? 'flex flex-col space-y-4' : 'space-y-6'}`}>
          {/* PRÓXIMO NÍVEL - Aumentado em 30% */}
          <div className={`${isMobile ? 'bg-black/20 backdrop-blur-sm rounded-xl p-4' : 'bg-black/30 backdrop-blur-md rounded-xl p-6'}`}>
            <h3 className={`text-poker-gold ${isMobile ? 'text-sm' : 'text-base'} font-normal mb-2 uppercase tracking-wide`}>
              PRÓXIMO NÍVEL
            </h3>
            {nextLevel ? (
              <div className={`text-white ${isMobile ? 'text-base' : 'text-3xl'} font-semibold`}>
                {nextLevel.isBreak ? (
                  <span>INTERVALO</span>
                ) : (
                  <span>{formatBlindPair(nextLevel.smallBlind, nextLevel.bigBlind)}</span>
                )}
              </div>
            ) : (
              <div className={`text-white ${isMobile ? 'text-base' : 'text-3xl'} font-semibold`}>
                FIM
              </div>
            )}
          </div>
          
          {/* INTERVALO EM - apenas no desktop - Aumentado em 30% */}
          {!isMobile && nextBreak && levelsUntilBreak && (
            <div className="bg-black/30 backdrop-blur-md rounded-xl p-6">
              <h3 className="text-poker-gold text-base font-normal mb-2 uppercase tracking-wide">
                INTERVALO EM
              </h3>
              <div className="text-white text-xl font-bold">
                {minutesUntilBreak} MIN
              </div>
              <div className="text-white/70 text-base">
                ({levelsUntilBreak} níveis)
              </div>
            </div>
          )}
          
          {/* TEMPO TOTAL - apenas no desktop - Aumentado em 30% */}
          {!isMobile && (
            <div className="bg-black/30 backdrop-blur-md rounded-xl p-6">
              <h3 className="text-poker-gold text-base font-normal mb-2 uppercase tracking-wide">
                TEMPO TOTAL
              </h3>
              <div className="text-white text-xl font-bold">
                {displayTotalTime}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Lado direito - NÍVEL ATUAL E INFORMAÇÕES PRINCIPAIS
  return (
    <div className={`absolute ${isMobile ? 'bottom-32 left-4 right-4' : 'right-8 top-1/2 -translate-y-1/2'} text-right z-10`}>
      <div className={`${isMobile ? 'flex flex-col space-y-4' : 'space-y-6'}`}>
        {/* NÍVEL ATUAL - DESTAQUE PRINCIPAL - Aumentado em 30% */}
        <div className={`${isMobile ? 'bg-black/30 backdrop-blur-md rounded-xl p-5' : 'bg-black/40 backdrop-blur-lg rounded-xl p-8'}`}>
          <h3 className={`text-poker-gold ${isMobile ? 'text-base' : 'text-2xl'} font-bold mb-3 uppercase tracking-wide`}>
            NÍVEL ATUAL
          </h3>
          {currentLevel && (
            <div className={`text-white ${isMobile ? 'text-xl' : 'text-5xl'} font-bold`}>
              {currentLevel.isBreak ? (
                <span 
                  className="current-blind-3d" 
                  data-text="INTERVALO"
                  style={{
                    textShadow: '0 4px 8px rgba(0,0,0,0.8), 0 0 20px rgba(223, 198, 97, 0.5)',
                  }}
                >
                  INTERVALO
                </span>
              ) : (
                <span 
                  className="current-blind-3d" 
                  data-text={formatBlindPair(currentLevel.smallBlind, currentLevel.bigBlind)}
                  style={{
                    textShadow: '0 4px 8px rgba(0,0,0,0.8), 0 0 20px rgba(223, 198, 97, 0.5)',
                  }}
                >
                  {formatBlindPair(currentLevel.smallBlind, currentLevel.bigBlind)}
                </span>
              )}
            </div>
          )}
          
          {/* ANTE ATUAL - dentro do mesmo container - Aumentado em 30% */}
          {currentLevel && !currentLevel.isBreak && (
            <div className="mt-4">
              <h4 className={`text-poker-gold ${isMobile ? 'text-sm' : 'text-base'} font-normal mb-2`}>
                ANTE
              </h4>
              <div className={`text-white ${isMobile ? 'text-base' : 'text-2xl'} font-bold`}>
                {formatBlindValue(currentLevel.ante)}
              </div>
            </div>
          )}
        </div>
        
        {/* INFORMAÇÕES ADICIONAIS - apenas no mobile - Aumentado em 30% */}
        {isMobile && (
          <div className="flex gap-4">
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 flex-1">
              <h3 className="text-poker-gold text-sm font-normal mb-2 uppercase">
                TEMPO TOTAL
              </h3>
              <div className="text-white text-base font-bold">
                {displayTotalTime}
              </div>
            </div>
            
            {nextBreak && levelsUntilBreak && (
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 flex-1">
                <h3 className="text-poker-gold text-sm font-normal mb-2 uppercase">
                  INTERVALO
                </h3>
                <div className="text-white text-base font-bold">
                  {minutesUntilBreak} MIN
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* HORA ATUAL - apenas no desktop - Aumentado em 30% */}
        {!isMobile && (
          <div className="bg-black/30 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-poker-gold text-base font-normal mb-2 uppercase tracking-wide">
              HORA ATUAL
            </h3>
            <div className="text-white text-xl font-bold">
              {currentTime}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
