import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, ExternalLink, RotateCcw } from "lucide-react";
import { useWindowControl } from "../hooks/useWindowControl";
import { useIsMobile } from "@/hooks/use-mobile";
import { BlindLevel } from "@/lib/db/models";
import { Slider } from "@/components/ui/slider";

interface CircularTimerControlsProps {
  isRunning: boolean;
  soundEnabled: boolean;
  onStart: () => void;
  onPause: () => void;
  onNextLevel: () => void;
  onPreviousLevel: () => void;
  onToggleSound: () => void;
  onOpenNewWindow: () => void;
  onToggleFullScreen: () => void;
  onReloadAudio: () => void;
  setLevelProgress: (percentage: number) => void;
  currentLevel: BlindLevel | null;
  isLastLevel: boolean;
  isMobile: boolean;
}

export default function CircularTimerControls({
  isRunning,
  soundEnabled,
  onStart,
  onPause,
  onNextLevel,
  onPreviousLevel,
  onToggleSound,
  onOpenNewWindow,
  onToggleFullScreen,
  onReloadAudio,
  setLevelProgress,
  currentLevel,
  isLastLevel,
  isMobile
}: CircularTimerControlsProps) {
  const { openInNewWindow: windowOpenInNewWindow } = useWindowControl();
  
  const handleProgressChange = (value: number[]) => {
    setLevelProgress(value[0]);
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 ${isMobile ? 'pb-6' : 'pb-8'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Level Progress Slider */}
        {currentLevel && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white text-sm">Progresso do Nível</span>
              <span className="text-white text-sm">
                {currentLevel.duration} min
              </span>
            </div>
            <Slider
              value={[0]}
              onValueChange={handleProgressChange}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        )}

        {/* Main Controls */}
        <div className="flex justify-center items-center gap-4 mb-4">
          <Button
            onClick={onPreviousLevel}
            variant="ghost"
            size="icon"
            className="text-white hover:text-poker-gold bg-transparent border border-white/30 rounded hover:border-poker-gold/50"
            disabled={isRunning}
          >
            <SkipBack className="h-5 w-5" />
          </Button>

          {!isRunning ? (
            <Button
              onClick={onStart}
              size="lg"
              className="bg-poker-gold text-black hover:bg-poker-gold/80 px-8 py-3 text-lg font-bold"
            >
              <Play className="h-5 w-5 mr-2" />
              INICIAR
            </Button>
          ) : (
            <Button
              onClick={onPause}
              size="lg"
              className="bg-red-600 text-white hover:bg-red-700 px-8 py-3 text-lg font-bold"
            >
              <Pause className="h-5 w-5 mr-2" />
              PAUSAR
            </Button>
          )}

          <Button
            onClick={onNextLevel}
            variant="ghost"
            size="icon"
            className="text-white hover:text-poker-gold bg-transparent border border-white/30 rounded hover:border-poker-gold/50"
            disabled={isRunning || isLastLevel}
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        {/* Secondary Controls */}
        <div className="flex justify-center items-center gap-2">
          <Button
            onClick={onToggleSound}
            variant="ghost"
            size="icon"
            className="text-white hover:text-poker-gold bg-transparent border border-white/30 rounded hover:border-poker-gold/50"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>

          <Button
            onClick={onReloadAudio}
            variant="ghost"
            size="icon"
            className="text-white hover:text-poker-gold bg-transparent border border-white/30 rounded hover:border-poker-gold/50"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            onClick={onOpenNewWindow}
            variant="ghost"
            size="icon"
            className="text-white hover:text-poker-gold bg-transparent border border-white/30 rounded hover:border-poker-gold/50"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}