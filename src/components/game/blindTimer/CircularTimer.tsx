
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTimer } from "@/contexts/TimerContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { CircularProgressRing } from "./components/CircularProgressRing";
import { TimerCenterDisplay } from "./components/TimerCenterDisplay";
import { TimerSideInfo } from "./components/TimerSideInfo";
import { BackgroundEffects } from "./components/BackgroundEffects";
import CircularTimerControls from "./components/CircularTimerControls";
import { AlertTriangle } from "lucide-react";

export default function CircularTimer() {
  const {
    state,
    currentLevel,
    nextLevelData,
    timeRemainingInLevel,
    progressPercentage,
    isAlertTime,
    isFinalCountdown,
    isNewBlindAlert,
    isMasterWindow,
    hasOpenedNewWindow,
    isEmergencyMode,
    startTimer,
    pauseTimer,
    goToNextLevel,
    goToPreviousLevel,
    toggleSound,
    openInNewWindow,
    setLevelProgress,
    toggleFullScreen,
    reloadAudio,
    testAudio
  } = useTimer();
  
  const isMobile = useIsMobile();
  
  console.log("=== CIRCULAR TIMER - NOVO SISTEMA ===");
  console.log("Estado atual:", state);
  console.log("Nível atual:", currentLevel);
  console.log("Próximo nível:", nextLevelData);
  console.log("Tempo restante:", timeRemainingInLevel);
  console.log("É master window:", isMasterWindow);
  console.log("Modo emergência:", isEmergencyMode);
  
  // Check if we have the required timer data
  if (!currentLevel) {
    console.log("Nenhum nível atual encontrado");
    return (
      <Card className="bg-gradient-to-b from-poker-dark-green to-poker-dark-green-deep border border-poker-gold/20">
        <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center`}>
          <p className="text-white">Timer não inicializado corretamente</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-screen h-screen relative timer-container overflow-hidden bg-gradient-to-b from-poker-dark-green to-poker-dark-green-deep">
      {isMobile ? (
        /* LAYOUT MOBILE - Organizado verticalmente */
        <div className="w-full h-full flex flex-col relative">
          {/* Aviso quando nova janela foi aberta */}
          {hasOpenedNewWindow && (
            <div className="absolute top-2 left-2 right-2 z-50">
              <Alert className="bg-yellow-500/90 border-yellow-600 text-black shadow-lg backdrop-blur-sm">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="font-medium text-xs">
                  ⚠️ Timer aberto em nova janela
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Cabeçalho compacto */}
          <div className="flex-shrink-0 pt-2 pb-1 text-center z-20">
            <h1 className="text-base font-bold text-poker-gold">APA POKER Clock</h1>
          </div>

          {/* Informações compactas superiores */}
          <div className="flex-shrink-0 px-2">
            <TimerSideInfo
              side="mobile-top"
              currentLevel={currentLevel}
              nextLevel={nextLevelData}
              nextBreak={null}
              levelsUntilBreak={null}
              totalElapsedTime={state.totalElapsedTime}
              blindLevels={[]}
              timeRemainingInLevel={timeRemainingInLevel}
              currentLevelIndex={state.currentLevelIndex}
            />
          </div>

          {/* Container central do timer */}
          <div className="flex-1 flex items-center justify-center relative min-h-0">
            <div className="relative">
              {/* Anel de progresso reduzido */}
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
          </div>

          {/* Controles na parte inferior */}
          <div className="flex-shrink-0 relative pb-2">
            <CircularTimerControls
              isRunning={state.isRunning}
              soundEnabled={state.soundEnabled}
              hasOpenedNewWindow={hasOpenedNewWindow}
              onStart={startTimer}
              onPause={pauseTimer}
              onNext={goToNextLevel}
              onPrevious={goToPreviousLevel}
              onToggleSound={toggleSound}
              onOpenNewWindow={openInNewWindow}
              onToggleFullScreen={toggleFullScreen}
              onReloadAudio={reloadAudio}
              onTestAudio={testAudio}
            />
          </div>
        </div>
      ) : (
        /* LAYOUT DESKTOP - Mantém layout original */
        <div className="w-full h-full flex items-center justify-center relative">
          {/* Aviso quando nova janela foi aberta */}
          {hasOpenedNewWindow && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50">
              <Alert className="bg-yellow-500/90 border-yellow-600 text-black shadow-lg backdrop-blur-sm">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="font-medium">
                  ⚠️ Timer aberto em nova janela - Cuidado para não iniciar dois timers
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Título superior */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
            <h1 className="text-3xl md:text-4xl font-bold text-poker-gold text-center">
              APA POKER Clock
            </h1>
          </div>

          {/* Container principal circular */}
          <div className="relative z-10">
            <CircularProgressRing
              progressPercentage={progressPercentage}
              onProgressClick={setLevelProgress}
            />
            
            <TimerCenterDisplay
              timeRemainingInLevel={timeRemainingInLevel}
              currentLevel={currentLevel}
              showAlert={state.showAlert}
              isNewBlindAlert={isNewBlindAlert}
            />
          </div>

          {/* Informações laterais */}
          <TimerSideInfo
            side="left"
            nextLevel={nextLevelData}
            nextBreak={null}
            levelsUntilBreak={null}
            totalElapsedTime={state.totalElapsedTime}
            blindLevels={[]}
            timeRemainingInLevel={timeRemainingInLevel}
            currentLevelIndex={state.currentLevelIndex}
          />
          
          <TimerSideInfo
            side="right"
            currentLevel={currentLevel}
            totalElapsedTime={state.totalElapsedTime}
            blindLevels={[]}
            timeRemainingInLevel={timeRemainingInLevel}
            currentLevelIndex={state.currentLevelIndex}
            nextBreak={null}
            levelsUntilBreak={null}
          />

          {/* Controles */}
          <div className="z-30">
            <CircularTimerControls
              isRunning={state.isRunning}
              soundEnabled={state.soundEnabled}
              hasOpenedNewWindow={hasOpenedNewWindow}
              onStart={startTimer}
              onPause={pauseTimer}
              onNext={goToNextLevel}
              onPrevious={goToPreviousLevel}
              onToggleSound={toggleSound}
              onOpenNewWindow={openInNewWindow}
              onToggleFullScreen={toggleFullScreen}
              onReloadAudio={reloadAudio}
              onTestAudio={testAudio}
            />
          </div>
        </div>
      )}
    </div>
  );
}
