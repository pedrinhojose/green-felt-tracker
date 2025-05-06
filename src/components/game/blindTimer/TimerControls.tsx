
import React from "react";
import { Button } from "@/components/ui/button";
import { SkipBack, SkipForward, Pause, Play, Maximize, Minimize } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BlindLevel } from "@/lib/db/models";

interface TimerControlsProps {
  timerRunning: boolean;
  currentGameTime: number;
  currentLevelIndex: number;
  blindLevels: BlindLevel[];
  isFullscreen: boolean;
  calculateTimeToBreak: () => string;
  formatElapsedTime: (seconds: number) => string;
  toggleTimer: () => void;
  handlePreviousLevel: () => void;
  handleNextLevel: () => void;
  toggleFullscreen: () => void;
}

export function TimerControls({
  timerRunning,
  currentGameTime,
  currentLevelIndex,
  blindLevels,
  isFullscreen,
  calculateTimeToBreak,
  formatElapsedTime,
  toggleTimer,
  handlePreviousLevel,
  handleNextLevel,
  toggleFullscreen
}: TimerControlsProps) {
  return (
    <div className="flex flex-col">
      {/* Barra de ouro separadora */}
      <div className="h-1 w-full bg-poker-gold"></div>
      
      <div className="bg-poker-dark-green p-4 flex flex-wrap justify-between">
        {/* Informações do jogo */}
        <div className="flex flex-col items-center px-4">
          <div className="text-xs text-gray-400 uppercase">INTERVALO EM</div>
          <div className="text-base font-medium text-gray-200">
            {calculateTimeToBreak()}
          </div>
        </div>
        
        {/* Controles do timer */}
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={handlePreviousLevel}
            variant="outline"
            size="icon"
            className="h-10 w-10 bg-transparent border-gray-700 hover:bg-gray-800"
            disabled={currentLevelIndex === 0}
          >
            <SkipBack size={18} className="text-gray-300" />
          </Button>
          
          <Button
            onClick={toggleTimer}
            className={`h-12 w-12 rounded-full ${timerRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {timerRunning ? <Pause size={22} /> : <Play size={22} />}
          </Button>
          
          <Button
            onClick={handleNextLevel}
            variant="outline"
            size="icon"
            className="h-10 w-10 bg-transparent border-gray-700 hover:bg-gray-800"
            disabled={currentLevelIndex >= blindLevels.length - 1}
          >
            <SkipForward size={18} className="text-gray-300" />
          </Button>
        </div>
        
        {/* Informações do tempo */}
        <div className="flex flex-col items-center px-4">
          <div className="text-xs text-gray-400 uppercase">PRÓXIMO NÍVEL</div>
          <div className="text-base font-medium text-gray-200">
            {currentLevelIndex + 1 < blindLevels.length ? 
              (blindLevels[currentLevelIndex + 1].isBreak ? 
                "INTERVALO" : 
                `${blindLevels[currentLevelIndex + 1].smallBlind}/${blindLevels[currentLevelIndex + 1].bigBlind}`) : 
              "Final"}
          </div>
        </div>
      </div>
      
      <div className="bg-poker-black px-4 py-3 flex justify-between items-center">
        <div className="flex flex-col">
          <div className="text-xs text-gray-400 uppercase">TEMPO DE JOGO</div>
          <div className="text-base font-medium text-gray-200">
            {formatElapsedTime(currentGameTime)}
          </div>
        </div>
        
        <Button
          onClick={toggleFullscreen}
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-white"
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </Button>
        
        <div className="flex flex-col items-end">
          <div className="text-xs text-gray-400 uppercase">HORA ATUAL</div>
          <div className="text-base font-medium text-gray-200">
            {format(new Date(), 'HH:mm', { locale: ptBR })}
          </div>
        </div>
      </div>
    </div>
  );
}
