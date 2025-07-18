
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePoker } from "@/contexts/PokerContext";
import { useTimerState } from "./useTimerState";
import { useTimerControls } from "./useTimerControls";
import { useIsMobile } from "@/hooks/use-mobile";
import { CircularProgressRing } from "./components/CircularProgressRing";
import { TimerCenterDisplay } from "./components/TimerCenterDisplay";
import { TimerSideInfo } from "./components/TimerSideInfo";
import { BackgroundEffects } from "./components/BackgroundEffects";
import CircularTimerControls from "./components/CircularTimerControls";
import { AlertTriangle } from "lucide-react";

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
    hasOpenedNewWindow,
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
    <div className="w-screen h-screen relative timer-container overflow-hidden bg-gradient-to-b from-poker-dark-green to-poker-dark-green-deep">
      {/* Container principal simplificado */}
      <div className="w-full h-full flex items-center justify-center relative">
        {/* Aviso quando nova janela foi aberta */}
        {hasOpenedNewWindow && (
          <div className={`absolute ${isMobile ? 'top-12 left-4 right-4' : 'top-16 left-1/2 -translate-x-1/2'} z-50`}>
            <Alert className="bg-yellow-500/90 border-yellow-600 text-black shadow-lg backdrop-blur-sm">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
                ⚠️ Timer aberto em nova janela - Cuidado para não iniciar dois timers
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Título superior simplificado */}
        <div className={`absolute ${isMobile ? 'top-2 left-1/2 -translate-x-1/2' : 'top-8 left-1/2 -translate-x-1/2'} z-20`}>
          <h1 className={`${isMobile ? 'text-lg' : 'text-3xl md:text-4xl'} font-bold text-poker-gold text-center`}>
            APA POKER Clock
          </h1>
        </div>

        {/* Container principal circular simplificado */}
        <div className="relative z-10">
          {/* Anel de progresso 3D */}
          <CircularProgressRing
            progressPercentage={progressPercentage}
            onProgressClick={setLevelProgress}
          />
          
          {/* Display central flutuante */}
          <TimerCenterDisplay
            timeRemainingInLevel={timeRemainingInLevel}
            currentLevel={currentLevel}
            showAlert={state.showAlert}
            isNewBlindAlert={isNewBlindAlert}
          />
        </div>

        {/* Informações laterais reorganizadas */}
        <TimerSideInfo
          side="left"
          nextLevel={nextLevel}
          nextBreak={nextBreak}
          levelsUntilBreak={levelsUntilBreak}
          totalElapsedTime={state.totalElapsedTime}
          blindLevels={sortedBlindLevels}
          timeRemainingInLevel={timeRemainingInLevel}
          currentLevelIndex={state.currentLevelIndex}
        />
        
        <TimerSideInfo
          side="right"
          currentLevel={currentLevel}
          totalElapsedTime={state.totalElapsedTime}
          blindLevels={sortedBlindLevels}
          timeRemainingInLevel={timeRemainingInLevel}
          currentLevelIndex={state.currentLevelIndex}
          nextBreak={nextBreak}
          levelsUntilBreak={levelsUntilBreak}
        />

        {/* Controles simplificados */}
        <div className="z-30">
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
      </div>
    </div>
  );
}
