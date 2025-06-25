
import React from 'react';
import { Button } from "@/components/ui/button";
import { BellOff, Bell, Play, Pause, SkipForward, SkipBack, Maximize2, RefreshCw, ExternalLink } from "lucide-react";

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
  return (
    <div className="absolute bottom-16 left-0 right-0">
      {/* Controles centrais - conforme a imagem */}
      <div className="flex justify-center items-center gap-8">
        {/* Botão Anterior */}
        <Button 
          onClick={onPrevious}
          variant="ghost"
          size="lg"
          className="text-white hover:text-poker-gold p-4"
        >
          <SkipBack className="h-8 w-8" />
        </Button>
        
        {/* Botão Principal - INICIAR/PAUSAR */}
        <div className="mx-8">
          {!isRunning ? (
            <Button 
              onClick={onStart}
              size="lg"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black px-12 py-4 text-xl font-bold rounded-lg"
            >
              INICIAR
            </Button>
          ) : (
            <Button 
              onClick={onPause}
              size="lg"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black px-12 py-4 text-xl font-bold rounded-lg"
            >
              PAUSAR
            </Button>
          )}
        </div>
        
        {/* Botão Próximo */}
        <Button 
          onClick={onNext}
          variant="ghost"
          size="lg"
          className="text-white hover:text-poker-gold p-4"
        >
          <SkipForward className="h-8 w-8" />
        </Button>
      </div>

      {/* Botão "ABRIR EM NOVA JANELA" no canto inferior direito */}
      <div className="absolute bottom-0 right-8">
        <Button 
          onClick={onOpenNewWindow}
          variant="outline"
          className="bg-transparent border-2 border-poker-gold text-poker-gold hover:bg-poker-gold hover:text-black px-6 py-3 font-bold rounded-lg"
        >
          ABRIR EM NOVA JANELA
        </Button>
      </div>

      {/* Controles de som e fullscreen escondidos (mantendo funcionalidade) */}
      <div className="opacity-0 pointer-events-none absolute">
        <Button onClick={onToggleSound}>
          {soundEnabled ? <Bell /> : <BellOff />}
        </Button>
        {onReloadAudio && (
          <Button onClick={onReloadAudio}>
            <RefreshCw />
          </Button>
        )}
        <Button onClick={onToggleFullScreen}>
          <Maximize2 />
        </Button>
      </div>
    </div>
  );
}
