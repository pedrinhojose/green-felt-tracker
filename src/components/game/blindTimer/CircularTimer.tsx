
import { Card, CardContent } from "@/components/ui/card";
import { usePoker } from "@/contexts/PokerContext";
import { useTimerState } from "./useTimerState";
import { useTimerControls } from "./useTimerControls";
import { useIsMobile } from "@/hooks/use-mobile";
import { CircularProgressRing } from "./components/CircularProgressRing";
import { TimerCenterDisplay } from "./components/TimerCenterDisplay";
import { TimerSideInfo } from "./components/TimerSideInfo";
import CircularTimerControls from "./components/CircularTimerControls";

export default function CircularTimer() {
  const { activeSeason } = usePoker();
  const isMobile = useIsMobile();
  
  console.log("=== CIRCULAR TIMER DEBUG ===");
  console.log("CircularTimer component rendering");
  console.log("Active season:", activeSeason?.name);
  console.log("Blind structure from season:", activeSeason?.blindStructure);
  
  // Se não há temporada ativa ou estrutura de blinds, mostrar fallback
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
  
  // Obter a estrutura de blinds da temporada ativa
  const blindLevels = activeSeason.blindStructure;
  
  // Usar hooks customizados
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
    sortedBlindLevels,
    state,
    setState,
    timeRemainingInLevel
  );

  // Calcular a porcentagem de progresso
  const progressPercentage = currentLevel
    ? 100 - (timeRemainingInLevel / (currentLevel.duration * 60)) * 100
    : 0;

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-poker-dark-green to-poker-dark-green-deep flex items-center justify-center relative timer-container">
      {/* Título superior */}
      <div className={`absolute ${isMobile ? 'top-4' : 'top-8'} left-1/2 -translate-x-1/2`}>
        <h1 className={`${isMobile ? 'text-xl' : 'text-3xl md:text-4xl'} font-bold text-poker-gold text-center`}>
          APA POKER Clock
        </h1>
      </div>

      {/* Container principal circular */}
      <div className="relative">
        {/* Anel de progresso */}
        <CircularProgressRing
          progressPercentage={progressPercentage}
          onProgressClick={setLevelProgress}
        />
        
        {/* Display central */}
        <TimerCenterDisplay
          timeRemainingInLevel={timeRemainingInLevel}
          currentLevel={currentLevel}
          showAlert={state.showAlert}
          isNewBlindAlert={isNewBlindAlert}
        />
      </div>

      {/* Informações laterais - apenas em desktop ou ajustadas para mobile */}
      {!isMobile && (
        <>
          <TimerSideInfo
            side="left"
            nextLevel={nextLevel}
            nextBreak={nextBreak}
            levelsUntilBreak={levelsUntilBreak}
          />
          
          <TimerSideInfo
            side="right"
            currentLevel={currentLevel}
            totalElapsedTime={state.totalElapsedTime}
            blindLevels={sortedBlindLevels}
            timeRemainingInLevel={timeRemainingInLevel}
          />
        </>
      )}

      {/* Informações laterais adaptadas para mobile */}
      {isMobile && (
        <>
          <TimerSideInfo
            side="left"
            nextLevel={nextLevel}
            nextBreak={nextBreak}
            levelsUntilBreak={levelsUntilBreak}
          />
          
          <TimerSideInfo
            side="right"
            currentLevel={currentLevel}
            totalElapsedTime={state.totalElapsedTime}
            blindLevels={sortedBlindLevels}
            timeRemainingInLevel={timeRemainingInLevel}
          />
        </>
      )}

      {/* Controles */}
      <CircularTimerControls
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
  );
}
