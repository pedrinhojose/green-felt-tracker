
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePoker } from "@/contexts/PokerContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { CircularProgressRing } from "./components/CircularProgressRing";
import { TimerCenterDisplay } from "./components/TimerCenterDisplay";
import { TimerSideInfo } from "./components/TimerSideInfo";
import { BackgroundEffects } from "./components/BackgroundEffects";
import { AlertTriangle } from "lucide-react";

interface CircularTimerProps {
  timerState: any;
  timerControls: any;
}

export default function CircularTimer({ timerState, timerControls }: CircularTimerProps) {
  const { activeSeason } = usePoker();
  const isMobile = useIsMobile();
  
  console.log("=== CIRCULAR TIMER DEBUG ===");
  console.log("CircularTimer component rendering");
  console.log("Active season:", activeSeason?.name);
  console.log("Timer state:", timerState);
  
  // Se não há dados do timer, mostrar fallback
  if (!timerState || !timerState.sortedBlindLevels || timerState.sortedBlindLevels.length === 0) {
    console.log("No timer state or blind structure found");
    return (
      <Card className="bg-poker-dark-green border border-poker-gold/20">
        <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center`}>
          <p className="text-white">Estrutura de blinds não configurada para esta temporada</p>
        </CardContent>
      </Card>
    );
  }

  // Calcular a porcentagem de progresso
  const progressPercentage = timerState.currentLevel
    ? 100 - (timerState.timeRemainingInLevel / (timerState.currentLevel.duration * 60)) * 100
    : 0;

  return (
    <div className="w-screen h-screen relative timer-container overflow-hidden">
      {/* Background com efeitos 3D e profundidade */}
      <BackgroundEffects />
      
      {/* Container principal com perspective 3D - SEM CONTROLES */}
      <div 
        className="w-full h-full flex items-center justify-center relative"
        style={{ 
          background: 'radial-gradient(ellipse at center, rgba(26, 77, 51, 0.8) 0%, rgba(15, 43, 29, 0.9) 50%, rgba(10, 31, 21, 1) 100%)',
          perspective: '1200px',
        }}
      >
        {/* Aviso quando nova janela foi aberta */}
        {timerControls?.hasOpenedNewWindow && (
          <div className={`absolute ${isMobile ? 'top-12 left-4 right-4' : 'top-16 left-1/2 -translate-x-1/2'} z-50`}>
            <Alert className="bg-yellow-500/90 border-yellow-600 text-black shadow-lg backdrop-blur-sm">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
                ⚠️ Timer aberto em nova janela - Cuidado para não iniciar dois timers
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Título superior com efeito 3D */}
        <div className={`absolute ${isMobile ? 'top-2 left-1/2 -translate-x-1/2' : 'top-8 left-1/2 -translate-x-1/2'} z-20`}>
          <h1 
            className={`${isMobile ? 'text-lg' : 'text-3xl md:text-4xl'} font-bold text-poker-gold text-center`}
            style={{
              textShadow: '0 4px 8px rgba(0,0,0,0.8), 0 0 20px rgba(223, 198, 97, 0.4)',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))',
            }}
          >
            APA POKER Clock
          </h1>
        </div>

        {/* Container principal circular com profundidade */}
        <div 
          className="relative transform-gpu z-10"
          style={{
            transform: 'translateZ(50px)',
          }}
        >
          {/* Anel de progresso 3D */}
          <CircularProgressRing
            progressPercentage={progressPercentage}
            onProgressClick={timerControls?.setLevelProgress}
          />
          
          {/* Display central flutuante */}
          <TimerCenterDisplay
            timeRemainingInLevel={timerState.timeRemainingInLevel}
            currentLevel={timerState.currentLevel}
            showAlert={timerState.state.showAlert}
            isNewBlindAlert={timerState.isNewBlindAlert}
          />
        </div>

        {/* Informações laterais reorganizadas */}
        <TimerSideInfo
          side="left"
          nextLevel={timerState.nextLevel}
          nextBreak={timerState.nextBreak}
          levelsUntilBreak={timerState.levelsUntilBreak}
          totalElapsedTime={timerState.state.totalElapsedTime}
          blindLevels={timerState.sortedBlindLevels}
          timeRemainingInLevel={timerState.timeRemainingInLevel}
          currentLevelIndex={timerState.state.currentLevelIndex}
        />
        
        <TimerSideInfo
          side="right"
          currentLevel={timerState.currentLevel}
          totalElapsedTime={timerState.state.totalElapsedTime}
          blindLevels={timerState.sortedBlindLevels}
          timeRemainingInLevel={timerState.timeRemainingInLevel}
          currentLevelIndex={timerState.state.currentLevelIndex}
          nextBreak={timerState.nextBreak}
          levelsUntilBreak={timerState.levelsUntilBreak}
        />
      </div>
    </div>
  );
}
