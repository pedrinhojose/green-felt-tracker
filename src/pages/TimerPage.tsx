
import { useParams } from "react-router-dom";
import { usePoker } from "@/contexts/PokerContext";
import CircularTimer from "@/components/game/blindTimer/CircularTimer";
import CircularTimerControls from "@/components/game/blindTimer/components/CircularTimerControls";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { useAudioContext } from "@/contexts/AudioContext";
import { useTimerState } from "@/components/game/blindTimer/useTimerState";
import { useTimerControls } from "@/components/game/blindTimer/useTimerControls";

export default function TimerPage() {
  const { gameId } = useParams<{ gameId?: string }>();
  const { activeSeason, games, lastGame } = usePoker();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { enableTimerAudio, setGlobalAudioEnabled } = useAudioContext();
  
  // Enable audio when TimerPage mounts
  useEffect(() => {
    console.log("=== TIMER PAGE - HABILITANDO ÁUDIO ===");
    console.log("Ativando contexto de áudio do timer");
    enableTimerAudio();
    setGlobalAudioEnabled(true);
    
    return () => {
      console.log("Timer page desmontando - mantendo áudio ativo");
    };
  }, [enableTimerAudio, setGlobalAudioEnabled]);
  
  // Debug da página do timer
  useEffect(() => {
    console.log("=== TIMER PAGE DEBUG ===");
    console.log("GameId da URL:", gameId);
    console.log("Active season:", activeSeason?.name);
    console.log("Games disponíveis:", games?.length);
    console.log("Último jogo:", lastGame?.id);
  }, [gameId, activeSeason, games, lastGame]);
  
  // Check if active season has a blind structure
  const hasBlindStructure = activeSeason && 
    activeSeason.blindStructure && 
    activeSeason.blindStructure.length > 0;

  console.log("=== TIMER PAGE - DEBUG CONTROLES ===");
  console.log("hasBlindStructure:", hasBlindStructure);

  // Initialize timer state and controls if we have blind structure
  const timerState = hasBlindStructure ? useTimerState(activeSeason.blindStructure) : null;
  
  console.log("timerState criado:", !!timerState);
  console.log("timerState details:", timerState ? {
    hasState: !!timerState.state,
    hasSortedLevels: !!timerState.sortedBlindLevels,
    levelsCount: timerState.sortedBlindLevels?.length || 0
  } : 'null');

  const timerControls = hasBlindStructure && timerState ? useTimerControls(
    timerState.sortedBlindLevels,
    timerState.state,
    timerState.setState,
    timerState.timeRemainingInLevel
  ) : null;

  console.log("timerControls criado:", !!timerControls);
  console.log("timerControls functions:", timerControls ? {
    hasStartTimer: typeof timerControls.startTimer === 'function',
    hasPauseTimer: typeof timerControls.pauseTimer === 'function',
    hasNextLevel: typeof timerControls.nextLevel === 'function'
  } : 'null');

  if (!hasBlindStructure) {
    return (
      <div className={`flex items-center justify-center min-h-screen bg-gradient-to-b from-poker-dark-green to-poker-dark-green-deep ${isMobile ? 'p-2' : 'p-4'}`}>
        <Card className="w-full max-w-3xl bg-poker-dark-green border border-poker-gold/20">
          <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center space-y-4`}>
            <p className={`text-white ${isMobile ? 'text-base' : 'text-lg'}`}>Estrutura de blinds não configurada para esta temporada</p>
            <Button 
              onClick={() => navigate("/season")} 
              className="bg-poker-gold text-black hover:bg-poker-gold/80"
            >
              Configurar Estrutura de Blinds
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Funções de fallback para garantir que os controles sempre funcionem
  const fallbackControls = {
    startTimer: () => console.log("Fallback: Start timer"),
    pauseTimer: () => console.log("Fallback: Pause timer"),
    nextLevel: () => console.log("Fallback: Next level"),
    previousLevel: () => console.log("Fallback: Previous level"),
    toggleSound: () => console.log("Fallback: Toggle sound"),
    openInNewWindow: () => console.log("Fallback: Open new window"),
    toggleFullScreen: () => console.log("Fallback: Toggle fullscreen"),
    reloadAudio: () => console.log("Fallback: Reload audio"),
    hasOpenedNewWindow: false
  };

  const fallbackState = {
    isRunning: false,
    soundEnabled: true
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-poker-dark-green to-poker-dark-green-deep timer-container relative">
      <div className="w-full h-full">
        <CircularTimer 
          timerState={timerState}
          timerControls={timerControls}
        />
      </div>
      
      {/* Controles renderizados fora da hierarquia transform - SEMPRE VISÍVEIS */}
      <CircularTimerControls
        isRunning={timerState?.state?.isRunning || fallbackState.isRunning}
        soundEnabled={timerState?.state?.soundEnabled || fallbackState.soundEnabled}
        onStart={timerControls?.startTimer || fallbackControls.startTimer}
        onPause={timerControls?.pauseTimer || fallbackControls.pauseTimer}
        onNext={timerControls?.nextLevel || fallbackControls.nextLevel}
        onPrevious={timerControls?.previousLevel || fallbackControls.previousLevel}
        onToggleSound={timerControls?.toggleSound || fallbackControls.toggleSound}
        onOpenNewWindow={timerControls?.openInNewWindow || fallbackControls.openInNewWindow}
        onToggleFullScreen={timerControls?.toggleFullScreen || fallbackControls.toggleFullScreen}
        onReloadAudio={timerControls?.reloadAudio || fallbackControls.reloadAudio}
      />
    </div>
  );
}
