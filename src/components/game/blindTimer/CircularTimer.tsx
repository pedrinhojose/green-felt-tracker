
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePoker } from "@/contexts/PokerContext";
import { useTimerState } from "./useTimerState";
import { useTimerControls } from "./useTimerControls";
import { useIsMobile } from "@/hooks/use-mobile";
import { CircularProgressRing } from "./components/CircularProgressRing";
import TimerControls from "./TimerControls";
import { AlertTriangle } from "lucide-react";
import { useTimerUtils } from "./useTimerUtils";
import { useEffect, useState } from "react";

export default function CircularTimer() {
  const { activeSeason } = usePoker();
  const isMobile = useIsMobile();
  
  // Se não há temporada ativa ou estrutura de blinds, mostrar fallback
  if (!activeSeason || !activeSeason.blindStructure || activeSeason.blindStructure.length === 0) {
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

  const { getCurrentTime } = useTimerUtils();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  // Atualizar a hora atual a cada minuto
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(getCurrentTime());
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [getCurrentTime]);

  // Calcular a porcentagem de progresso
  const progressPercentage = currentLevel
    ? 100 - (timeRemainingInLevel / (currentLevel.duration * 60)) * 100
    : 0;

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatBlindText = (blind: number) => {
    if (blind >= 1000) {
      return `${(blind / 1000).toFixed(blind % 1000 === 0 ? 0 : 1)}K`;
    }
    return blind.toString();
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-poker-dark-green to-poker-dark-green-deep timer-container relative">
      {/* Aviso quando nova janela foi aberta */}
      {hasOpenedNewWindow && (
        <div className={`absolute ${isMobile ? 'top-12' : 'top-16'} left-1/2 -translate-x-1/2 z-50 ${isMobile ? 'w-11/12' : 'w-auto'}`}>
          <Alert className="bg-yellow-500/90 border-yellow-600 text-black shadow-lg">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
              ⚠️ Timer aberto em nova janela - Cuidado para não iniciar dois timers
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Hora atual no canto superior esquerdo */}
      <div className="absolute top-4 left-4 text-left p-2 rounded-md bg-poker-navy/30">
        <div className="text-white text-xs">Hora Atual</div>
        <div className="text-poker-gold text-lg font-medium">
          {currentTime}
        </div>
      </div>

      {/* Título */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2">
        <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-poker-gold text-center`}>
          APA POKER Clock
        </h1>
      </div>

      {/* Container principal */}
      <div className="w-full h-full flex items-center justify-center relative">
        
        {/* Informações lado esquerdo */}
        <div className={`absolute ${isMobile ? 'left-2 top-32' : 'left-8 top-1/2 -translate-y-1/2'} text-white space-y-4`}>
          <div className="text-center">
            <div className="text-sm text-poker-gold">Nível Atual</div>
            <div className="text-2xl font-bold">
              {currentLevel?.isBreak ? 'INTERVALO' : `Nível ${currentLevel?.level || 1}`}
            </div>
          </div>
          
          {currentLevel && !currentLevel.isBreak && (
            <div className="text-center">
              <div className="text-sm text-poker-gold">Blinds</div>
              <div className="text-xl font-bold">
                {formatBlindText(currentLevel.smallBlind)}/{formatBlindText(currentLevel.bigBlind)}
                {currentLevel.ante > 0 && ` (${formatBlindText(currentLevel.ante)})`}
              </div>
            </div>
          )}

          {nextBreak && (
            <div className="text-center">
              <div className="text-sm text-poker-gold">Próximo Intervalo</div>
              <div className="text-lg">
                {levelsUntilBreak === 1 ? 'Próximo nível' : `${levelsUntilBreak} níveis`}
              </div>
            </div>
          )}
        </div>

        {/* Timer circular central */}
        <div className="relative">
          <CircularProgressRing
            progressPercentage={progressPercentage}
            onProgressClick={setLevelProgress}
          />
          
          {/* Tempo no centro */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`${isMobile ? 'text-4xl' : 'text-6xl'} font-bold text-white font-mono`}>
              {formatTime(timeRemainingInLevel)}
            </div>
            <div className={`text-poker-gold ${isMobile ? 'text-sm' : 'text-lg'} mt-2`}>
              Tempo
            </div>
          </div>
        </div>

        {/* Informações lado direito */}
        <div className={`absolute ${isMobile ? 'right-2 top-32' : 'right-8 top-1/2 -translate-y-1/2'} text-white space-y-4`}>
          {nextLevel && (
            <div className="text-center">
              <div className="text-sm text-poker-gold">Próximo Nível</div>
              <div className="text-lg font-bold">
                {nextLevel.isBreak ? 'INTERVALO' : `Nível ${nextLevel.level}`}
              </div>
              {!nextLevel.isBreak && (
                <div className="text-sm">
                  {formatBlindText(nextLevel.smallBlind)}/{formatBlindText(nextLevel.bigBlind)}
                </div>
              )}
            </div>
          )}

          <div className="text-center">
            <div className="text-sm text-poker-gold">Tempo Total</div>
            <div className="text-lg">{formatTime(state.totalElapsedTime)}</div>
          </div>

          <div className="text-center">
            <div className="text-sm text-poker-gold">Jogadores</div>
            <div className="text-lg">Em jogo</div>
          </div>
        </div>
      </div>

      {/* Controles na parte inferior */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
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
  );
}
