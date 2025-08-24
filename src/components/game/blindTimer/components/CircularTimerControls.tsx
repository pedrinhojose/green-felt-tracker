
import React from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BellOff, Bell, Play, Pause, SkipForward, SkipBack, Maximize2, RefreshCw, ExternalLink, Volume2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CircularTimerControlsProps {
  isRunning: boolean;
  soundEnabled: boolean;
  hasOpenedNewWindow: boolean;
  onStart: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleSound: () => void;
  onOpenNewWindow: () => void;
  onToggleFullScreen: () => void;
  onReloadAudio?: () => void;
  onTestAudio?: () => void;
}

export default function CircularTimerControls({
  isRunning,
  soundEnabled,
  hasOpenedNewWindow,
  onStart,
  onPause,
  onNext,
  onPrevious,
  onToggleSound,
  onOpenNewWindow,
  onToggleFullScreen,
  onReloadAudio,
  onTestAudio
}: CircularTimerControlsProps) {
  const isMobile = useIsMobile();

  return (
    <TooltipProvider>
      {/* Controles centrais na parte inferior */}
      <div className={`absolute ${isMobile ? 'bottom-2' : 'bottom-12'} left-1/2 -translate-x-1/2`}>
        <div className={`flex justify-center items-center ${isMobile ? 'gap-3' : 'gap-6'}`}>
          {/* Botão ANTERIOR */}
          <Button 
            onClick={onPrevious}
            variant="ghost"
            size={isMobile ? "sm" : "lg"}
            className={`text-white hover:text-poker-gold ${isMobile ? 'p-2' : 'p-3'} bg-transparent border border-white/30 rounded-lg hover:border-poker-gold/50`}
          >
            <SkipBack className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'}`} />
          </Button>
          
          {/* Botão Principal - INICIAR/PAUSAR */}
          {!isRunning ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={hasOpenedNewWindow ? undefined : onStart}
                  disabled={hasOpenedNewWindow}
                  className={`${hasOpenedNewWindow ? 'bg-transparent border-2 border-gray-500 text-gray-500 cursor-not-allowed' : 'bg-transparent border-2 border-white text-white hover:bg-white hover:text-black'} ${isMobile ? 'px-4 py-2 text-sm' : 'px-8 py-3 text-lg'} font-bold rounded-lg`}
                >
                  <Play className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-5 w-5 mr-2'}`} />
                  INICIAR
                </Button>
              </TooltipTrigger>
              {hasOpenedNewWindow && (
                <TooltipContent>
                  <p>Timer controlado em nova janela</p>
                </TooltipContent>
              )}
            </Tooltip>
          ) : (
            <Button 
              onClick={onPause}
              className={`bg-transparent border-2 border-white text-white hover:bg-white hover:text-black ${isMobile ? 'px-4 py-2 text-sm' : 'px-8 py-3 text-lg'} font-bold rounded-lg`}
            >
              <Pause className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-5 w-5 mr-2'}`} />
              PAUSAR
            </Button>
          )}
          
          {/* Botão PRÓXIMO */}
          <Button 
            onClick={onNext}
            variant="ghost"
            size={isMobile ? "sm" : "lg"}
            className={`text-white hover:text-poker-gold ${isMobile ? 'p-2' : 'p-3'} bg-transparent border border-white/30 rounded-lg hover:border-poker-gold/50`}
          >
            <SkipForward className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'}`} />
          </Button>
        </div>
      </div>

      {/* Botão "ABRIR EM NOVA JANELA" no canto inferior direito */}
      <div className={`absolute ${isMobile ? 'bottom-12 right-2' : 'bottom-8 right-8'}`}>
        <Button 
          onClick={onOpenNewWindow}
          variant="outline"
          className={`bg-transparent border border-poker-gold/50 text-poker-gold hover:bg-poker-gold hover:text-black ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'} font-normal rounded`}
        >
          <ExternalLink className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
          {isMobile ? 'NOVA JANELA' : 'ABRIR EM NOVA JANELA'}
        </Button>
      </div>

      {/* Controles adicionais no canto inferior esquerdo */}
      <div className={`absolute ${isMobile ? 'bottom-12 left-2' : 'bottom-8 left-8'} flex gap-2`}>
        <Button 
          onClick={onToggleSound}
          variant="ghost"
          size="icon"
          className={`text-white hover:text-poker-gold ${isMobile ? 'p-1' : 'p-2'} bg-transparent border border-white/30 rounded hover:border-poker-gold/50 ${isMobile ? 'h-8 w-8' : ''}`}
          title={soundEnabled ? "Som Ativado" : "Som Desativado"}
        >
          {soundEnabled ? <Bell className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} /> : <BellOff className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />}
        </Button>
        
        {onReloadAudio && (
          <Button
            onClick={onReloadAudio}
            variant="ghost"
            size="icon"
            className={`text-white hover:text-poker-gold ${isMobile ? 'p-1' : 'p-2'} bg-transparent border border-white/30 rounded hover:border-poker-gold/50 ${isMobile ? 'h-8 w-8' : ''}`}
            title="Recarregar Sons"
          >
            <RefreshCw className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </Button>
        )}
        
        {onTestAudio && (
          <Button
            onClick={onTestAudio}
            variant="ghost"
            size="icon"
            className={`text-white hover:text-poker-gold ${isMobile ? 'p-1' : 'p-2'} bg-transparent border border-white/30 rounded hover:border-poker-gold/50 ${isMobile ? 'h-8 w-8' : ''}`}
            title="Testar Sons"
          >
            <Volume2 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </Button>
        )}
        
        <Button 
          onClick={onToggleFullScreen}
          variant="ghost"
          size="icon"
          className={`text-white hover:text-poker-gold ${isMobile ? 'p-1' : 'p-2'} bg-transparent border border-white/30 rounded hover:border-poker-gold/50 ${isMobile ? 'h-8 w-8' : ''}`}
          title="Tela Cheia"
        >
          <Maximize2 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
        </Button>
      </div>
    </TooltipProvider>
  );
}
