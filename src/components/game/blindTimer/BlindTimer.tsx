
import { Card, CardContent } from "@/components/ui/card";
import { usePoker } from "@/contexts/PokerContext";
import TimerDisplay from "./TimerDisplay";
import TimerControls from "./TimerControls";
import { useTimerState } from "./useTimerState";
import { useTimerControls } from "./useTimerControls";

export default function BlindTimer() {
  const { activeSeason } = usePoker();
  
  // Se não houver temporada ativa ou estrutura de blinds, exibe um componente de fallback
  if (!activeSeason || !activeSeason.blindStructure || activeSeason.blindStructure.length === 0) {
    return (
      <Card className="bg-poker-dark-green border border-poker-gold/20">
        <CardContent className="p-6 text-center">
          <p className="text-white">Estrutura de blinds não configurada para esta temporada</p>
        </CardContent>
      </Card>
    );
  }
  
  // Obter a estrutura de blinds da temporada ativa
  const blindLevels = activeSeason.blindStructure;
  
  // Usar os hooks personalizados
  const {
    state,
    setState,
    currentLevel,
    nextLevel,
    timeRemainingInLevel,
    isAlertTime,
    isFinalCountdown,
    isLevelJustCompleted,
    nextBreak,
    levelsUntilBreak,
  } = useTimerState(blindLevels);
  
  const {
    startTimer,
    pauseTimer,
    nextLevel: goToNextLevel,
    previousLevel: goToPreviousLevel,
    toggleSound,
    openInNewWindow,
    setLevelProgress,
  } = useTimerControls(
    blindLevels,
    state,
    setState,
    timeRemainingInLevel
  );
  
  return (
    <Card className="bg-poker-dark-green border border-poker-gold/20">
      <CardContent className="p-6">
        <div className="space-y-6">
          <TimerDisplay
            currentLevel={currentLevel}
            nextLevel={nextLevel}
            timeRemainingInLevel={timeRemainingInLevel}
            totalElapsedTime={state.totalElapsedTime}
            nextBreak={nextBreak}
            levelsUntilBreak={levelsUntilBreak}
            showAlert={state.showAlert}
            onProgressClick={setLevelProgress}
            blindLevels={blindLevels} // Passamos os blindLevels para o TimerDisplay
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
          />
        </div>
      </CardContent>
    </Card>
  );
}
