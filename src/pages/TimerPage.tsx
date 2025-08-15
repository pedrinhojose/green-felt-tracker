
import { useParams } from "react-router-dom";
import { usePoker } from "@/contexts/PokerContext";
import { TimerProvider } from "@/contexts/TimerContext";
import CollapsibleTimer from "@/components/game/blindTimer/CollapsibleTimer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";
import { useAudioContext } from "@/contexts/AudioContext";

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

  return (
    <TimerProvider gameId={gameId || 'default'} blindLevels={activeSeason.blindStructure}>
      <CollapsibleTimer />
    </TimerProvider>
  );
}
