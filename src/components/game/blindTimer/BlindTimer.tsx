
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
  
  console.log("=== BLIND TIMER DEBUG - COMPONENTE ===");
  console.log("BlindTimer component rendering");
  console.log("Active season:", activeSeason?.name);
  console.log("Blind structure from season (RAW):", activeSeason?.blindStructure);
  
  // Log detalhado da estrutura de blinds RAW
  if (activeSeason?.blindStructure) {
    console.log("Estrutura de blinds RAW - detalhes:");
    activeSeason.blindStructure.forEach((blind, index) => {
      console.log(`RAW Blind ${index}:`, {
        id: blind.id,
        level: blind.level,
        smallBlind: blind.smallBlind,
        bigBlind: blind.bigBlind,
        ante: blind.ante,
        duration: blind.duration,
        isBreak: blind.isBreak,
        typeOf_level: typeof blind.level,
        typeOf_smallBlind: typeof blind.smallBlind,
        typeOf_bigBlind: typeof blind.bigBlind
      });
    });
  }
  
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
  
  console.log("=== BLIND TIMER DEBUG - DADOS PROCESSADOS ===");
  console.log("Using blind levels:", blindLevels);
  console.log("Quantidade de blinds:", blindLevels.length);
  console.log("Primeiro blind (índice 0):", blindLevels[0]);
  console.log("Segundo blind (índice 1):", blindLevels[1]);
  
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
  
  console.log("=== BLIND TIMER DEBUG - RESULTADO DOS HOOKS ===");
  console.log("Timer state from hook:", state);
  console.log("Current level from hook:", currentLevel);
  console.log("Current level smallBlind:", currentLevel?.smallBlind);
  console.log("Current level bigBlind:", currentLevel?.bigBlind);
  console.log("Sorted blind levels:", sortedBlindLevels);
  console.log("Primeiro blind ordenado:", sortedBlindLevels?.[0]);
  
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
    <div className="w-screen h-screen bg-poker-dark-green flex items-center justify-center">
      <div className="w-full h-full flex flex-col items-center justify-center p-2">
        <div className={`space-y-${isMobile ? '4' : '6'} flex flex-col items-center w-full`}>
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
            blindLevels={sortedBlindLevels}
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
      </div>
    </div>
  );
}
