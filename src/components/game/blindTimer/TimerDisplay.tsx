
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BlindLevel } from "@/lib/db/models";
import { Progress } from "@/components/ui/progress";

interface TimerDisplayProps {
  currentTime: number;
  blindLevels: BlindLevel[];
  currentLevelIndex: number;
  showLevelChange: boolean;
  calculateProgress: () => number;
  calculateTimeToBreak: () => string;
  isCurrentLevelBreak: boolean;
  formatTime: (seconds: number) => string;
  progressRef: React.RefObject<HTMLDivElement>;
  handleProgressBarClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function TimerDisplay({
  currentTime,
  blindLevels,
  currentLevelIndex,
  showLevelChange,
  calculateProgress,
  calculateTimeToBreak,
  isCurrentLevelBreak,
  formatTime,
  progressRef,
  handleProgressBarClick
}: TimerDisplayProps) {
  return (
    <div className="flex flex-col items-center p-6">
      {/* Layout reorganizado - Três colunas */}
      <div className="w-full grid grid-cols-3 mb-6">
        {/* Coluna da Esquerda - Nível atual */}
        <div className="text-left">
          <div className={`text-xl text-gray-300 uppercase font-medium transition-all ${showLevelChange ? 'scale-110' : ''}`}>
            {isCurrentLevelBreak ? "INTERVALO" : `NÍVEL ${blindLevels[currentLevelIndex]?.level || 1}`}
          </div>
          
          {/* Valores de SB e BB - Agora maiores e em amarelo mais forte */}
          {!isCurrentLevelBreak && blindLevels[currentLevelIndex] && (
            <div className={`text-5xl md:text-6xl font-bold text-yellow-500 drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)] transition-all ${showLevelChange ? 'scale-110' : ''}`}>
              SB: {blindLevels[currentLevelIndex].smallBlind} / BB: {blindLevels[currentLevelIndex].bigBlind}
              {blindLevels[currentLevelIndex].ante > 0 && ` / ANTE: ${blindLevels[currentLevelIndex].ante}`}
            </div>
          )}
        </div>
        
        {/* Coluna Central - Vazia para balanço */}
        <div className="flex justify-center">
          {/* Deixar vazio para balanço */}
        </div>
        
        {/* Coluna da Direita - Próximo intervalo */}
        <div className="text-right">
          <div className="text-xl text-gray-300 uppercase">INTERVALO EM</div>
          <div className="text-4xl font-bold text-gray-200 drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]">
            {calculateTimeToBreak()}
          </div>
        </div>
      </div>
      
      {/* Timer grande com efeito 3D */}
      <div className="text-7xl md:text-9xl font-bold tabular-nums mb-8 text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]">
        {formatTime(currentTime)}
      </div>
      
      {/* Barra de progresso - Agora amarela, mais curta e mais larga */}
      <div 
        ref={progressRef}
        className="w-4/5 mx-auto mb-8 cursor-pointer" 
        onClick={handleProgressBarClick}
      >
        <Progress 
          value={calculateProgress()} 
          className="h-2 bg-gray-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]"
          barClassName="bg-yellow-500 shadow-[0_0_10px_rgba(255,204,0,0.5)]"
          heightClassName="h-3"
        />
      </div>
    </div>
  );
}
