import { Card, CardContent } from "@/components/ui/card";
import { usePoker } from "@/contexts/PokerContext";
import { useParams } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTimerState } from "./useTimerState";
import { useTimerControls } from "./useTimerControls";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Settings, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CircularProgressRing } from "./components/CircularProgressRing";
import { TimerCenterDisplay } from "./components/TimerCenterDisplay";
import { TimerSideInfo } from "./components/TimerSideInfo";
import CircularTimerControls from "./components/CircularTimerControls";

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
  } = useTimerControls(sortedBlindLevels, state, setState, 0);
  
  // Calculate progress percentage for the circular ring
  const progressPercentage = currentLevel ? 
    ((state.elapsedTimeInLevel / (currentLevel.duration * 60)) * 100) : 0;
  
  console.log("=== PROGRESS CALCULATION DEBUG ===");
  console.log("Current level duration:", currentLevel?.duration);
  console.log("Elapsed time in level:", state.elapsedTimeInLevel);
  console.log("Progress percentage:", progressPercentage);
  
  return (
    <div className="w-full h-full bg-gradient-to-b from-poker-dark-green to-poker-dark-green-deep flex flex-col items-center justify-center relative overflow-hidden">
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
      
      {/* Title */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Timer de Blinds</h1>
        <p className="text-white/70">Temporada: {activeSeason.name}</p>
      </div>
      
      {/* Main Timer Container */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-7xl px-4">
        {/* Circular Progress Ring */}
        <div className="relative">
          <CircularProgressRing
            progressPercentage={progressPercentage}
            onProgressClick={setLevelProgress}
          />
        </div>
        
        {/* Timer Center Display */}
        <TimerCenterDisplay
          timeRemainingInLevel={currentLevel ? Math.max(0, (currentLevel.duration * 60) - state.elapsedTimeInLevel) : 0}
          currentLevel={currentLevel}
          showAlert={state.showAlert}
          isNewBlindAlert={showNextLevelAlert}
        />
        
        {/* Side Information */}
        <TimerSideInfo
          side="right"
          currentLevel={currentLevel}
          totalElapsedTime={state.totalElapsedTime}
          blindLevels={sortedBlindLevels}
          timeRemainingInLevel={currentLevel ? Math.max(0, (currentLevel.duration * 60) - state.elapsedTimeInLevel) : 0}
          currentLevelIndex={state.currentLevelIndex}
          nextBreak={breakInfo}
          levelsUntilBreak={null}
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
  );
}