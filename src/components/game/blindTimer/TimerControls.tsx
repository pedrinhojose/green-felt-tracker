
import React from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BellOff, Bell, Play, Pause, SkipForward, SkipBack, Maximize2, RefreshCw } from "lucide-react";

interface TimerControlsProps {
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
}

export default function TimerControls({
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
  onReloadAudio
}: TimerControlsProps) {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap justify-center gap-2">
        {!isRunning ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={hasOpenedNewWindow ? undefined : onStart}
                disabled={hasOpenedNewWindow}
                className={hasOpenedNewWindow ? "bg-gray-600 hover:bg-gray-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}
              >
                <Play className="mr-2 h-4 w-4" /> Iniciar
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
            variant="destructive"
          >
            <Pause className="mr-2 h-4 w-4" /> Pausar
          </Button>
        )}
      
      <Button 
        onClick={onPrevious}
        variant="secondary"
      >
        <SkipBack className="mr-2 h-4 w-4" /> Nível Anterior
      </Button>
      
      <Button 
        onClick={onNext}
        variant="secondary"
      >
        <SkipForward className="mr-2 h-4 w-4" /> Próximo Nível
      </Button>
      
      <Button 
        onClick={onToggleSound}
        variant={soundEnabled ? "outline" : "ghost"}
        size="icon"
        className="w-10 h-10 rounded-full"
        title={soundEnabled ? "Som Ativado" : "Som Desativado"}
      >
        {soundEnabled ? (
          <Bell className="h-4 w-4 text-poker-gold" />
        ) : (
          <BellOff className="h-4 w-4 text-gray-400" />
        )}
      </Button>
      
      {onReloadAudio && (
        <Button
          onClick={onReloadAudio}
          variant="outline"
          size="icon"
          className="w-10 h-10 rounded-full"
          title="Recarregar Sons"
        >
          <RefreshCw className="h-4 w-4 text-poker-gold" />
        </Button>
      )}
      
      <Button 
        onClick={onToggleFullScreen}
        variant="outline"
        size="icon"
        className="w-10 h-10 rounded-full"
        title="Tela Cheia"
      >
        <Maximize2 className="h-4 w-4 text-poker-gold" />
      </Button>
      
      <Button 
        onClick={onOpenNewWindow}
        variant="outline"
      >
        Abrir em Nova Janela
      </Button>
      </div>
    </TooltipProvider>
  );
}
