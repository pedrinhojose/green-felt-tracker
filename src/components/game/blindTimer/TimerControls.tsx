
import React from 'react';
import { Button } from "@/components/ui/button";
import { BellOff, Bell, Play, Pause, SkipForward } from "lucide-react";

interface TimerControlsProps {
  isRunning: boolean;
  soundEnabled: boolean;
  onStart: () => void;
  onPause: () => void;
  onNext: () => void;
  onToggleSound: () => void;
  onOpenNewWindow: () => void;
}

export default function TimerControls({
  isRunning,
  soundEnabled,
  onStart,
  onPause,
  onNext,
  onToggleSound,
  onOpenNewWindow
}: TimerControlsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {!isRunning ? (
        <Button 
          onClick={onStart}
          className="bg-green-600 hover:bg-green-700"
        >
          <Play className="mr-2 h-4 w-4" /> Iniciar
        </Button>
      ) : (
        <Button 
          onClick={onPause}
          variant="destructive"
        >
          <Pause className="mr-2 h-4 w-4" /> Pausar
        </Button>
      )}
      
      <Button 
        onClick={onNext}
        variant="secondary"
      >
        <SkipForward className="mr-2 h-4 w-4" /> Próximo Nível
      </Button>
      
      <Button 
        onClick={onToggleSound}
        variant="outline"
      >
        {soundEnabled ? (
          <>
            <Bell className="mr-2 h-4 w-4" /> Som Ligado
          </>
        ) : (
          <>
            <BellOff className="mr-2 h-4 w-4" /> Som Desligado
          </>
        )}
      </Button>
      
      <Button 
        onClick={onOpenNewWindow}
        variant="outline"
      >
        Abrir em Nova Janela
      </Button>
    </div>
  );
}
