import { Card, CardContent } from "@/components/ui/card";
import { usePoker } from "@/contexts/PokerContext";
import { useParams } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTimerState } from "./useTimerState";
import { useTimerControls } from "./useTimerControls";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Settings, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LevelHeader } from "./components/LevelHeader";
import { BlindDisplay } from "./components/BlindDisplay";
import { TimeRemaining } from "./components/TimeRemaining";
import { ProgressBar } from "./components/ProgressBar";
import { StatusInfo } from "./components/StatusInfo";
import { FullscreenButton } from "./components/FullscreenButton";
import CircularTimerControls from "./components/CircularTimerControls";
import { useTimerUtils } from "./useTimerUtils";
import { useEffect, useState } from "react";

export default function CircularTimer() {
  const { activeSeason } = usePoker();
  const { gameId } = useParams<{ gameId?: string }>();
  const isMobile = useIsMobile();
  
  console.log("=== CIRCULAR TIMER DEBUG ===");
  console.log("Active season:", activeSeason?.name);
  console.log("Game ID:", gameId);
  console.log("Is mobile:", isMobile);
  console.log("Blind structure:", activeSeason?.blindStructure);
  
  // If there's no active season or blind structure, show a fallback component
  if (!activeSeason || !activeSeason.blindStructure || activeSeason.blindStructure.length === 0) {
    console.log("No active season or blind structure found");
    return (
      <Card className="bg-gradient-to-b from-poker-dark-green to-poker-dark-green-deep border border-poker-gold/20">
        <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center`}>
          <p className="text-white">Estrutura de blinds não configurada para esta temporada</p>
        </CardContent>
      </Card>
    );
  }
  
  // Get the blind structure from the active season
  const blindLevels = activeSeason.blindStructure;
  
  console.log("=== BLIND LEVELS DEBUG ===");
  console.log("Blind levels count:", blindLevels.length);
  console.log("First blind level:", blindLevels[0]);
  console.log("Last blind level:", blindLevels[blindLevels.length - 1]);
  
  // Use the timer state hook
  const {
    state,
    setState,
    currentLevel,
    nextLevel,
    isLastLevel,
    showNextLevelAlert,
    showBreakAlert,
    isBreakTime,
    breakInfo,
    sortedBlindLevels
  } = useTimerState(blindLevels, activeSeason.id, gameId);
  
  // Use timer controls hook
  const {
    startTimer,
    pauseTimer,
    nextLevel: goToNextLevel,
    previousLevel: goToPreviousLevel,
    setLevelProgress,
    toggleSound,
    openInNewWindow,
    toggleFullScreen,
    reloadAudio,
    hasOpenedNewWindow
  } = useTimerControls(sortedBlindLevels, state, setState, currentLevel ? Math.max(0, (currentLevel.duration * 60) - state.elapsedTimeInLevel) : 0);
  
  // Calculate progress and time remaining
  const timeRemainingInLevel = currentLevel ? Math.max(0, (currentLevel.duration * 60) - state.elapsedTimeInLevel) : 0;
  const progressPercentage = currentLevel ? 
    (100 - (timeRemainingInLevel / (currentLevel.duration * 60)) * 100) : 0;
  
  // Get current time for display
  const { getCurrentTime } = useTimerUtils();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  
  // Update current time every minute
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(getCurrentTime());
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [getCurrentTime]);
  
  console.log("=== PROGRESS CALCULATION DEBUG ===");
  console.log("Current level duration:", currentLevel?.duration);
  console.log("Elapsed time in level:", state.elapsedTimeInLevel);
  console.log("Progress percentage:", progressPercentage);
  
  if (!currentLevel) return null;
  
  return (
    <div className="w-screen h-screen bg-gradient-to-b from-poker-dark-green to-poker-dark-green-deep flex items-center justify-center">
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="text-center space-y-4 timer-container relative w-full">
          {/* Alert for new window */}
          {hasOpenedNewWindow && (
            <div className="absolute top-4 left-4 right-4 z-40">
              <Alert className="bg-yellow-500/20 border-yellow-500/50">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-yellow-100">
                  Timer aberto em nova janela. Feche esta aba ou a nova janela para evitar conflitos.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          {/* Fullscreen button */}
          <FullscreenButton onToggleFullScreen={toggleFullScreen} />

          {/* Current time in top left corner */}
          <div className="absolute top-1 left-1 text-left p-2 rounded-md bg-poker-navy/30">
            <div className="text-white text-xs">Hora Atual</div>
            <div className="text-poker-gold text-lg font-medium">
              {currentTime}
            </div>
          </div>
          
          {/* Title */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-2">APA POKER Clock</h1>
            <p className="text-white/70">Temporada: {activeSeason.name}</p>
          </div>
          
          {/* Current level */}
          <LevelHeader currentLevel={currentLevel} />
          
          {/* Current blinds */}
          <BlindDisplay 
            currentLevel={currentLevel} 
            isNewBlindAlert={showNextLevelAlert} 
          />
          
          {/* Remaining time */}
          <TimeRemaining 
            timeRemainingInLevel={timeRemainingInLevel}
            showAlert={state.showAlert}
            isNewBlindAlert={showNextLevelAlert}
          />
          
          {/* Progress bar */}
          <ProgressBar 
            progressPercentage={progressPercentage}
            onProgressClick={setLevelProgress}
          />
          
          {/* Additional information */}
          <StatusInfo 
            nextLevel={nextLevel}
            totalElapsedTime={state.totalElapsedTime}
            nextBreak={breakInfo}
            levelsUntilBreak={null}
            currentLevel={currentLevel}
            blindLevels={sortedBlindLevels}
            timeRemainingInLevel={timeRemainingInLevel}
          />
        </div>
        
        {/* Timer Controls */}
        <CircularTimerControls
          isRunning={state.isRunning}
          soundEnabled={state.soundEnabled}
          onStart={startTimer}
          onPause={pauseTimer}
          onNextLevel={goToNextLevel}
          onPreviousLevel={goToPreviousLevel}
          onToggleSound={toggleSound}
          onOpenNewWindow={openInNewWindow}
          onToggleFullScreen={toggleFullScreen}
          onReloadAudio={reloadAudio}
          setLevelProgress={setLevelProgress}
          currentLevel={currentLevel}
          isLastLevel={isLastLevel}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}