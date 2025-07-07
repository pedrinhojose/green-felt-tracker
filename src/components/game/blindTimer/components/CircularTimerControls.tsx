
import React from 'react';
import { Button } from "@/components/ui/button";
import { BellOff, Bell, Play, Pause, SkipForward, SkipBack, Maximize2, RefreshCw, ExternalLink } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CircularTimerControlsProps {
  isRunning: boolean;
  soundEnabled: boolean;
  onStart: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleSound: () => void;
  onOpenNewWindow: () => void;
  onToggleFullScreen: () => void;
  onReloadAudio?: () => void;
}

export default function CircularTimerControls({
  isRunning,
  soundEnabled,
  onStart,
  onPause,
  onNext,
  onPrevious,
  onToggleSound,
  onOpenNewWindow,
  onToggleFullScreen,
  onReloadAudio
}: CircularTimerControlsProps) {
  const isMobile = useIsMobile();

  return (
    <>
      {/* Controles principais literalmente na borda inferior */}
      <div className={`fixed bottom-0 left-1/2 -translate-x-1/2 z-20 ${isMobile ? 'pb-2' : 'pb-4'}`}>
        <div className={`flex justify-center items-center ${isMobile ? 'gap-4' : 'gap-8'}`}>
          {/* Botão ANTERIOR */}
          <Button 
            onClick={onPrevious}
            variant="ghost"
            size={isMobile ? "default" : "lg"}
            className={`text-white hover:text-poker-gold ${isMobile ? 'p-3' : 'p-4'} bg-transparent border border-white/30 rounded-lg hover:border-poker-gold/50`}
          >
            <SkipBack className={`${isMobile ? 'h-5 w-5' : 'h-7 w-7'}`} />
          </Button>
          
          {/* Botão Principal - INICIAR/PAUSAR */}
          {!isRunning ? (
            <Button 
              onClick={onStart}
              className={`bg-transparent border-2 border-white text-white hover:bg-white hover:text-black ${isMobile ? 'px-6 py-3 text-base' : 'px-10 py-4 text-xl'} font-bold rounded-lg`}
            >
              <Play className={`${isMobile ? 'h-4 w-4 mr-2' : 'h-6 w-6 mr-3'}`} />
              INICIAR
            </Button>
          ) : (
            <Button 
              onClick={onPause}
              className={`bg-transparent border-2 border-white text-white hover:bg-white hover:text-black ${isMobile ? 'px-6 py-3 text-base' : 'px-10 py-4 text-xl'} font-bold rounded-lg`}
            >
              <Pause className={`${isMobile ? 'h-4 w-4 mr-2' : 'h-6 w-6 mr-3'}`} />
              PAUSAR
            </Button>
          )}
          
          {/* Botão PRÓXIMO */}
          <Button 
            onClick={onNext}
            variant="ghost"
            size={isMobile ? "default" : "lg"}
            className={`text-white hover:text-poker-gold ${isMobile ? 'p-3' : 'p-4'} bg-transparent border border-white/30 rounded-lg hover:border-poker-gold/50`}
          >
            <SkipForward className={`${isMobile ? 'h-5 w-5' : 'h-7 w-7'}`} />
          </Button>
        </div>
      </div>

      {/* Controles de áudio/sistema literalmente no canto inferior esquerdo */}
      <div className={`fixed bottom-0 left-0 flex gap-2 z-10 ${isMobile ? 'p-1' : 'p-2'}`}>
        {/* Botão Som */}
        <Button 
          onClick={onToggleSound}
          variant="ghost"
          size="icon"
          className={`text-white hover:text-poker-gold ${isMobile ? 'p-2' : 'p-3'} bg-transparent border border-white/30 rounded hover:border-poker-gold/50 ${isMobile ? 'h-9 w-9' : 'h-12 w-12'}`}
          title={soundEnabled ? "Som Ativado" : "Som Desativado"}
        >
          {soundEnabled ? <Bell className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} /> : <BellOff className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />}
        </Button>
        
        {/* Botão Recarregar Som */}
        {onReloadAudio && (
          <Button
            onClick={onReloadAudio}
            variant="ghost"
            size="icon"
            className={`text-white hover:text-poker-gold ${isMobile ? 'p-2' : 'p-3'} bg-transparent border border-white/30 rounded hover:border-poker-gold/50 ${isMobile ? 'h-9 w-9' : 'h-12 w-12'}`}
            title="Recarregar Sons"
          >
            <RefreshCw className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          </Button>
        )}
        
        {/* Botão Tela Cheia */}
        <Button 
          onClick={onToggleFullScreen}
          variant="ghost"
          size="icon"
          className={`text-white hover:text-poker-gold ${isMobile ? 'p-2' : 'p-3'} bg-transparent border border-white/30 rounded hover:border-poker-gold/50 ${isMobile ? 'h-9 w-9' : 'h-12 w-12'}`}
          title="Tela Cheia"
        >
          <Maximize2 className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
        </Button>
      </div>

      {/* Botão "ABRIR EM NOVA JANELA" literalmente no canto inferior direito */}
      <div className={`fixed bottom-0 right-0 z-10 ${isMobile ? 'p-1' : 'p-2'}`}>
        <Button 
          onClick={onOpenNewWindow}
          variant="outline"
          className={`bg-transparent border border-poker-gold/50 text-poker-gold hover:bg-poker-gold hover:text-black ${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm'} font-normal rounded`}
        >
          <ExternalLink className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
          {isMobile ? 'NOVA JANELA' : 'ABRIR EM NOVA JANELA'}
        </Button>
      </div>
    </>
  );
}
