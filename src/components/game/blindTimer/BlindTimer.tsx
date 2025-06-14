
import { Card, CardContent } from "@/components/ui/card";
import { usePoker } from "@/contexts/PokerContext";
import TimerDisplay from "./TimerDisplay";
import TimerControls from "./TimerControls";
import { useTimerState } from "./useTimerState";
import { useTimerControls } from "./useTimerControls";
import { useIsMobile } from "@/hooks/use-mobile";

export default function BlindTimer() {
  const { activeSeason } = usePoker();
  const isMobile = useIsMobile();
  
  console.log("=== BLIND TIMER DEBUG ===");
  console.log("BlindTimer component rendering");
  console.log("Active season:", activeSeason?.name);
  console.log("Blind structure from season:", activeSeason?.blindStructure);
  
  // If there's no active season or blind structure, show a fallback component
  if (!activeSeason || !activeSeason.blindStructure || activeSeason.blindStructure.length === 0) {
    console.log("No active season or blind structure found");
    return (
      <Card className="bg-poker-dark-green border border-poker-gold/20">
        <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center`}>
          <p className="text-white">Estrutura de blinds não configurada para esta temporada</p>
        </CardContent>
      </Card>
    );
  }
  
  // Get the blind structure from the active season
  const blindLevels = activeSeason.blindStructure;
  
  console.log("Using blind levels:", blindLevels);
  console.log("First blind level details:", blindLevels[0]);
  
  // Use custom hooks
  const {
    state,
    setState,
    currentLevel,
    nextLevel,
    timeRemainingInLevel,
    isAlertTime,
    isFinalCountdown,
    isLevelJustCompleted,
    isNewBlindAlert,
    nextBreak,
    levelsUntilBreak,
    sortedBlindLevels,
  } = useTimerState(blindLevels);
  
  console.log("Timer state from hook:", state);
  console.log("Current level from hook:", currentLevel);
  console.log("Sorted blind levels:", sortedBlindLevels);
  
  const {
    startTimer,
    pauseTimer,
    nextLevel: goToNextLevel,
    previousLevel: goToPreviousLevel,
    toggleSound,
    openInNewWindow,
    setLevelProgress,
    toggleFullScreen,
    reloadAudio,
  } = useTimerControls(
    sortedBlindLevels, // Usar os blinds ordenados
    state,
    setState,
    timeRemainingInLevel
  );
  
  return (
    <Card className="bg-poker-dark-green border border-poker-gold/20">
      <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
        <div className={`space-y-${isMobile ? '4' : '6'}`}>
          <TimerDisplay
            currentLevel={currentLevel}
            nextLevel={nextLevel}
            timeRemainingInLevel={timeRemainingInLevel}
            totalElapsedTime={state.totalElapsedTime}
            nextBreak={nextBreak}
            levelsUntilBreak={levelsUntilBreak}
            showAlert={state.showAlert}
            isNewBlindAlert={isNewBlindAlert}
            onProgressClick={setLevelProgress}
            onToggleFullScreen={toggleFullScreen}
            blindLevels={sortedBlindLevels} // Usar os blinds ordenados
          />
          
          <TimerControls
            isRunning={state.isRunning}
            soundEnabled={state.soundEnabled}
            onStart={startTimer}
            onPause={pauseTimer}
            onNext={goToNextLevel}
            onPrevious={goToPreviousLevel}
            onToggleSound={toggleSound}
            onOpenNewWindow={openInNewWindow}
            onToggleFullScreen={toggleFullScreen}
            onReloadAudio={reloadAudio}
          />
        </div>
      </CardContent>
    </Card>
  );
}
