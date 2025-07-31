
import React, { useState, useEffect, useMemo } from "react";
import { BlindLevel } from "@/lib/db/models";
import { useTimerUtils } from "../useTimerUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatBlindPair, formatBlindValue } from "@/lib/utils/blindUtils";
import { usePoker } from "@/contexts/PokerContext";

interface TimerSideInfoProps {
  side: 'left' | 'right' | 'mobile-top';
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
  const { activeSeason, lastGame } = usePoker();
  
  // Estados para atualização em tempo real
  const [displayTotalTime, setDisplayTotalTime] = useState(formatTotalTime(totalElapsedTime));
  const [minutesUntilBreak, setMinutesUntilBreak] = useState(0);
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  // Calcular prêmios em tempo real
  const livePrizes = useMemo(() => {
    if (!activeSeason?.weeklyPrizeSchema || !lastGame?.totalPrizePool) return [];
    
    const totalPrizePool = lastGame.totalPrizePool;
    const prizeSchema = activeSeason.weeklyPrizeSchema;
    
    // Filtrar apenas os 3 primeiros lugares
    const topThreePrizes = prizeSchema
      .filter(prize => prize.position <= 3)
      .sort((a, b) => a.position - b.position)
      .map(prize => ({
        position: prize.position,
        value: (totalPrizePool * prize.percentage) / 100,
        percentage: prize.percentage
      }));
    
    return topThreePrizes;
  }, [activeSeason?.weeklyPrizeSchema, lastGame?.totalPrizePool]);

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
      <div className={`absolute ${isMobile ? 'top-4 left-4 right-4' : 'left-8 top-1/2 -translate-y-1/2'} text-left z-10`}>
        <div className={`${isMobile ? 'flex flex-col space-y-3' : 'space-y-4'}`}>
          {/* PRÓXIMO NÍVEL */}
          <div className={`${isMobile ? 'bg-black/20 backdrop-blur-sm rounded-lg p-3' : 'bg-black/30 backdrop-blur-md rounded-xl p-4'} transform scale-110`}>
            <h3 className={`text-poker-gold ${isMobile ? 'text-sm' : 'text-base'} font-normal mb-1 uppercase tracking-wide`}>
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
          
          {/* INTERVALO EM - apenas no desktop */}
          {!isMobile && nextBreak && levelsUntilBreak && (
            <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 transform scale-110">
              <h3 className="text-poker-gold text-base font-normal mb-1 uppercase tracking-wide">
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
          
          {/* TEMPO TOTAL E PRÊMIOS - apenas no desktop */}
          {!isMobile && (
            <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 transform scale-110">
              <h3 className="text-poker-gold text-base font-normal mb-1 uppercase tracking-wide">
                TEMPO TOTAL
              </h3>
              <div className="text-white text-xl font-bold mb-3">
                {displayTotalTime}
              </div>
              
              {/* PRÊMIOS EM JOGO */}
              {livePrizes.length > 0 && (
                <div className="border-t border-white/20 pt-3">
                  <h4 className="text-poker-gold text-sm font-normal mb-2 uppercase tracking-wide">
                    PRÊMIOS EM JOGO
                  </h4>
                  <div className="space-y-1">
                    {livePrizes.map((prize) => (
                      <div key={prize.position} className="flex justify-between items-center">
                        <span className="text-white/70 text-sm">
                          {prize.position}º
                        </span>
                        <span className="text-white text-sm font-bold">
                          R$ {prize.value.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Lado direito - NÍVEL ATUAL E INFORMAÇÕES PRINCIPAIS
  return (
    <div className={`absolute ${isMobile ? 'bottom-4 left-4 right-4' : 'right-8 top-1/2 -translate-y-1/2'} text-right z-10`}>
      <div className={`${isMobile ? 'flex flex-col space-y-3' : 'space-y-4'}`}>
        {/* NÍVEL ATUAL - DESTAQUE PRINCIPAL */}
        <div className={`${isMobile ? 'bg-black/30 backdrop-blur-md rounded-lg p-4' : 'bg-black/40 backdrop-blur-lg rounded-xl p-6'} transform scale-110`}>
          <h3 className={`text-poker-gold ${isMobile ? 'text-base' : 'text-2xl'} font-bold mb-2 uppercase tracking-wide`}>
            NÍVEL ATUAL
          </h3>
          {currentLevel && (
            <div className={`text-white ${isMobile ? 'text-xl' : 'text-5xl'} font-bold`}>
              {currentLevel.isBreak ? (
                <span 
                  className="current-blind-3d" 
                  data-text="INTERVALO"
                >
                  INTERVALO
                </span>
              ) : (
                <span 
                  className="current-blind-3d" 
                  data-text={formatBlindPair(currentLevel.smallBlind, currentLevel.bigBlind)}
                >
                  {formatBlindPair(currentLevel.smallBlind, currentLevel.bigBlind)}
                </span>
              )}
            </div>
          )}
          
          {/* ANTE ATUAL - dentro do mesmo container */}
          {currentLevel && !currentLevel.isBreak && (
            <div className="mt-3">
              <h4 className={`text-poker-gold ${isMobile ? 'text-sm' : 'text-base'} font-normal mb-1`}>
                ANTE
              </h4>
              <div className={`text-white ${isMobile ? 'text-base' : 'text-2xl'} font-bold`}>
                {formatBlindValue(currentLevel.ante)}
              </div>
            </div>
          )}
        </div>
        
        {/* INFORMAÇÕES ADICIONAIS - apenas no mobile */}
        {isMobile && (
          <div className="space-y-3 transform scale-110">
            <div className="flex gap-3">
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 flex-1">
                <h3 className="text-poker-gold text-sm font-normal mb-1 uppercase">
                  TEMPO TOTAL
                </h3>
                <div className="text-white text-base font-bold">
                  {displayTotalTime}
                </div>
              </div>
              
              {nextBreak && levelsUntilBreak && (
                <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 flex-1">
                  <h3 className="text-poker-gold text-sm font-normal mb-1 uppercase">
                    INTERVALO
                  </h3>
                  <div className="text-white text-base font-bold">
                    {minutesUntilBreak} MIN
                  </div>
                </div>
              )}
            </div>
            
            {/* PRÊMIOS EM JOGO - mobile */}
            {livePrizes.length > 0 && (
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3">
                <h3 className="text-poker-gold text-sm font-normal mb-2 uppercase">
                  PRÊMIOS EM JOGO
                </h3>
                <div className="flex justify-between text-xs">
                  {livePrizes.map((prize) => (
                    <div key={prize.position} className="text-center">
                      <div className="text-white/70 mb-1">
                        {prize.position}º
                      </div>
                      <div className="text-white font-bold">
                        R$ {prize.value.toFixed(0)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* HORA ATUAL - apenas no desktop */}
        {!isMobile && (
          <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 transform scale-110">
            <h3 className="text-poker-gold text-base font-normal mb-1 uppercase tracking-wide">
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
