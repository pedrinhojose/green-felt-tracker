
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
    <>
      {/* Controles centrais na parte inferior */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <div className="flex justify-center items-center gap-6">
          {/* Botão ANTERIOR */}
          <Button 
            onClick={onPrevious}
            variant="ghost"
            size="lg"
            className="text-white hover:text-poker-gold p-3 bg-transparent border border-white/30 rounded-lg hover:border-poker-gold/50"
          >
            <SkipBack className="h-6 w-6" />
          </Button>
          
          {/* Botão Principal - INICIAR/PAUSAR */}
          {!isRunning ? (
            <Button 
              onClick={onStart}
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black px-8 py-3 text-lg font-bold rounded-lg"
            >
              <Play className="h-5 w-5 mr-2" />
              INICIAR
            </Button>
          ) : (
            <Button 
              onClick={onPause}
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black px-8 py-3 text-lg font-bold rounded-lg"
            >
              <Pause className="h-5 w-5 mr-2" />
              PAUSAR
            </Button>
          )}
          
          {/* Botão PRÓXIMO */}
          <Button 
            onClick={onNext}
            variant="ghost"
            size="lg"
            className="text-white hover:text-poker-gold p-3 bg-transparent border border-white/30 rounded-lg hover:border-poker-gold/50"
          >
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Botão "ABRIR EM NOVA JANELA" no canto inferior direito */}
      <div className="absolute bottom-8 right-8">
        <Button 
          onClick={onOpenNewWindow}
          variant="outline"
          className="bg-transparent border border-poker-gold/50 text-poker-gold hover:bg-poker-gold hover:text-black px-4 py-2 text-sm font-normal rounded"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          ABRIR EM NOVA JANELA
        </Button>
      </div>

      {/* Controles adicionais no canto inferior esquerdo */}
      <div className="absolute bottom-8 left-8 flex gap-2">
        <Button 
          onClick={onToggleSound}
          variant="ghost"
          size="icon"
          className="text-white hover:text-poker-gold p-2 bg-transparent border border-white/30 rounded hover:border-poker-gold/50"
          title={soundEnabled ? "Som Ativado" : "Som Desativado"}
        >
          {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        </Button>
        
        {onReloadAudio && (
          <Button
            onClick={onReloadAudio}
            variant="ghost"
            size="icon"
            className="text-white hover:text-poker-gold p-2 bg-transparent border border-white/30 rounded hover:border-poker-gold/50"
            title="Recarregar Sons"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
        
        <Button 
          onClick={onToggleFullScreen}
          variant="ghost"
          size="icon"
          className="text-white hover:text-poker-gold p-2 bg-transparent border border-white/30 rounded hover:border-poker-gold/50"
          title="Tela Cheia"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
