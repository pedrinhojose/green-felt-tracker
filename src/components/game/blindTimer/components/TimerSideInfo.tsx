
import React from "react";
import { BlindLevel } from "@/lib/db/models";
import { useTimerUtils } from "../useTimerUtils";

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
  const { formatTotalTime, getCurrentTime } = useTimerUtils();
  const [currentTime, setCurrentTime] = React.useState(getCurrentTime());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000);
    return () => clearInterval(interval);
  }, [getCurrentTime]);

  if (side === 'left') {
    // Lado esquerdo - Próximo nível (30% menor)
    return (
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-left">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <h3 className="text-poker-gold text-sm font-medium mb-2">PRÓXIMO NÍVEL</h3>
          {nextLevel ? (
            <div className="text-white" style={{ fontSize: '0.7em' }}>
              <div className="text-xl font-bold">
                Nível {nextLevel.level}
              </div>
              <div className="text-lg mt-1">
                {nextLevel.isBreak ? (
                  <span className="text-blue-400">INTERVALO</span>
                ) : (
                  <>
                    {nextLevel.smallBlind}/{nextLevel.bigBlind}
                    {nextLevel.ante > 0 && (
                      <div className="text-sm text-gray-300">
                        Ante: {nextLevel.ante}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {nextLevel.duration} min
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">
              Último nível
            </div>
          )}
        </div>
        
        {/* Informação sobre próximo intervalo */}
        {nextBreak && levelsUntilBreak && (
          <div className="bg-blue-900/30 backdrop-blur-sm rounded-lg p-3 mt-4 border border-blue-400/20">
            <div className="text-blue-400 text-xs font-medium">PRÓXIMO INTERVALO</div>
            <div className="text-white text-sm mt-1">
              Em {levelsUntilBreak} {levelsUntilBreak === 1 ? 'nível' : 'níveis'}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Lado direito - Nível atual e informações
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-right">
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/10">
        <h3 className="text-poker-gold text-sm font-medium mb-2">NÍVEL ATUAL</h3>
        {currentLevel && (
          <div className="text-white">
            <div className="text-2xl font-bold">
              Nível {currentLevel.level}
            </div>
            {currentLevel.isBreak ? (
              <div className="text-xl text-blue-400 mt-1">
                INTERVALO
              </div>
            ) : (
              <div className="text-sm text-gray-400 mt-1">
                Duração: {currentLevel.duration} min
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Tempo total decorrido */}
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 mt-4 border border-white/10">
        <div className="text-poker-gold text-xs font-medium">TEMPO TOTAL</div>
        <div className="text-white text-sm mt-1">
          {formatTotalTime(totalElapsedTime)}
        </div>
      </div>
      
      {/* Hora atual */}
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 mt-4 border border-white/10">
        <div className="text-poker-gold text-xs font-medium">HORA ATUAL</div>
        <div className="text-white text-sm mt-1">
          {currentTime}
        </div>
      </div>
    </div>
  );
}
