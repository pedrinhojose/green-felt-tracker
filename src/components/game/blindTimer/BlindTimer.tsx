
import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTimerState } from "./useTimerState";
import { useTimerControls } from "./useTimerControls";
import { useTimerUtils } from "./useTimerUtils";
import { TimerDisplay } from "./TimerDisplay";
import { TimerControls } from "./TimerControls";
import { VolumeX, VolumeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlindTimerProps {
  initialTime?: number;
}

export default function BlindTimer({ initialTime = 15 * 60 }: BlindTimerProps) {
  // State
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showLevelChange, setShowLevelChange] = useState<boolean>(false);
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(initialTime);

  // Custom hooks
  const {
    blindLevels,
    currentGameTime,
    countdownSoundStarted,
    calculateProgress,
    isNextLevelBreak,
    calculateTimeToBreak,
    isCurrentLevelBreak,
    isMuted,
    setIsMuted
  } = useTimerState(initialTime);

  // Timer controls
  const {
    handleNextLevel,
    handlePreviousLevel,
    toggleTimer,
    toggleFullscreen: toggleFullscreenFn
  } = useTimerControls({
    currentTime,
    setCurrentTime,
    timerRunning,
    setTimerRunning,
    currentLevelIndex,
    setCurrentLevelIndex,
    blindLevels,
    setShowLevelChange,
    countdownSoundStarted,
    isMuted
  });

  // Utility functions
  const {
    progressRef,
    timerRef,
    formatTime,
    formatElapsedTime,
    handleProgressBarClick
  } = useTimerUtils({
    currentTime,
    setCurrentTime,
    blindLevels,
    currentLevelIndex
  });

  // Combined fullscreen function
  const handleToggleFullscreen = () => {
    toggleFullscreenFn(timerRef, isFullscreen, setIsFullscreen);
  };

  // Toggle mute function
  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };
  
  return (
    <Card 
      ref={timerRef} 
      className={`${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''} bg-poker-dark-green border-0 overflow-hidden`}
    >
      {/* Barra de ouro na parte superior em modo tela cheia */}
      {isFullscreen && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-poker-gold"></div>
      )}
      
      {/* Botão de mudo */}
      <div className="absolute top-4 right-4 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleMute} 
          className="text-white/70 hover:text-white hover:bg-black/20"
          title={isMuted ? "Ativar som" : "Desativar som"}
        >
          {isMuted ? <VolumeX size={20} /> : <VolumeOff size={20} />}
        </Button>
      </div>
      
      <CardContent className={`p-0 ${isFullscreen ? 'h-screen flex flex-col justify-between' : ''}`}>
        <TimerDisplay
          currentTime={currentTime}
          blindLevels={blindLevels}
          currentLevelIndex={currentLevelIndex}
          showLevelChange={showLevelChange}
          calculateProgress={calculateProgress}
          calculateTimeToBreak={calculateTimeToBreak}
          isCurrentLevelBreak={isCurrentLevelBreak}
          formatTime={formatTime}
          progressRef={progressRef}
          handleProgressBarClick={handleProgressBarClick}
        />
        
        {/* Barra de informações inferiores e controles */}
        <TimerControls
          timerRunning={timerRunning}
          currentGameTime={currentGameTime}
          currentLevelIndex={currentLevelIndex}
          blindLevels={blindLevels}
          isFullscreen={isFullscreen}
          calculateTimeToBreak={calculateTimeToBreak}
          formatElapsedTime={formatElapsedTime}
          toggleTimer={toggleTimer}
          handlePreviousLevel={handlePreviousLevel}
          handleNextLevel={handleNextLevel}
          toggleFullscreen={handleToggleFullscreen}
        />
      </CardContent>
    </Card>
  );
}
