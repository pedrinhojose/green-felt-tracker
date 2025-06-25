
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
    <div className="absolute bottom-8 left-0 right-0">
      {/* Controles inferiores esquerdos */}
      <div className="absolute bottom-0 left-8 flex gap-3">
        <Button 
          onClick={onToggleSound}
          variant={soundEnabled ? "outline" : "ghost"}
          size="icon"
          className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border-poker-gold/30 hover:bg-poker-gold/20"
          title={soundEnabled ? "Som Ativado" : "Som Desativado"}
        >
          {soundEnabled ? (
            <Bell className="h-5 w-5 text-poker-gold" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-400" />
          )}
        </Button>
        
        {onReloadAudio && (
          <Button
            onClick={onReloadAudio}
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border-poker-gold/30 hover:bg-poker-gold/20"
            title="Recarregar Sons"
          >
            <RefreshCw className="h-5 w-5 text-poker-gold" />
          </Button>
        )}
        
        <Button 
          onClick={onToggleFullScreen}
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border-poker-gold/30 hover:bg-poker-gold/20"
          title="Tela Cheia"
        >
          <Maximize2 className="h-5 w-5 text-poker-gold" />
        </Button>
      </div>

      {/* Controles centrais */}
      <div className="flex justify-center gap-4">
        <Button 
          onClick={onPrevious}
          variant="outline"
          size="lg"
          className="bg-black/50 backdrop-blur-sm border-poker-gold/30 hover:bg-poker-gold/20 text-white"
        >
          <SkipBack className="mr-2 h-5 w-5" /> Anterior
        </Button>
        
        {!isRunning ? (
          <Button 
            onClick={onStart}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8"
          >
            <Play className="mr-2 h-5 w-5" /> Iniciar
          </Button>
        ) : (
          <Button 
            onClick={onPause}
            variant="destructive"
            size="lg"
            className="px-8"
          >
            <Pause className="mr-2 h-5 w-5" /> Pausar
          </Button>
        )}
        
        <Button 
          onClick={onNext}
          variant="outline"
          size="lg"
          className="bg-black/50 backdrop-blur-sm border-poker-gold/30 hover:bg-poker-gold/20 text-white"
        >
          <SkipForward className="mr-2 h-5 w-5" /> Próximo
        </Button>
      </div>

      {/* Controle inferior direito */}
      <div className="absolute bottom-0 right-8">
        <Button 
          onClick={onOpenNewWindow}
          variant="outline"
          className="bg-black/50 backdrop-blur-sm border-poker-gold/30 hover:bg-poker-gold/20 text-white"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Nova Janela
        </Button>
      </div>
    </div>
  );
}
