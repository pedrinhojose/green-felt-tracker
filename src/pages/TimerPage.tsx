
import { useParams } from "react-router-dom";
import { usePoker } from "@/contexts/PokerContext";
import BlindTimer from "@/components/game/blindTimer/BlindTimer";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAudioEffects } from "@/components/game/blindTimer/hooks/useAudioEffects";

export default function TimerPage() {
  const { gameId } = useParams<{ gameId?: string }>();
  const { activeSeason } = usePoker();
  const navigate = useNavigate();
  
  // Pré-inicializar áudio na página
  const { unlockAudio } = useAudioEffects();
  
  // Tentar desbloquear áudio quando a página carrega
  useEffect(() => {
    // Tentar desbloquear áudio imediatamente
    const tryUnlockAudio = () => {
      console.log("TimerPage: Tentando desbloquear áudio na página");
      unlockAudio();
    };
    
    // Tente algumas vezes para garantir
    tryUnlockAudio();
    const unlockInterval = setInterval(tryUnlockAudio, 2000);
    
    // Adicione listener para cliques e toque
    const unlockOnUserInteraction = () => {
      console.log("Interação do usuário detectada na página, desbloqueando áudio");
      unlockAudio();
      clearInterval(unlockInterval);
      
      // Remover listeners após primeira interação
      document.removeEventListener('click', unlockOnUserInteraction);
      document.removeEventListener('touchstart', unlockOnUserInteraction);
    };
    
    document.addEventListener('click', unlockOnUserInteraction);
    document.addEventListener('touchstart', unlockOnUserInteraction);
    
    return () => {
      clearInterval(unlockInterval);
      document.removeEventListener('click', unlockOnUserInteraction);
      document.removeEventListener('touchstart', unlockOnUserInteraction);
    };
  }, [unlockAudio]);
  
  // Check if active season has a blind structure
  const hasBlindStructure = activeSeason && 
    activeSeason.blindStructure && 
    activeSeason.blindStructure.length > 0;

  if (!hasBlindStructure) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-poker-black p-4">
        <Card className="w-full max-w-3xl bg-poker-dark-green border border-poker-gold/20">
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-white text-lg">Estrutura de blinds não configurada para esta temporada</p>
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
    <div 
      className="flex items-center justify-center min-h-screen bg-poker-black p-4 timer-container"
      onClick={unlockAudio} // Desbloquear áudio em qualquer clique na página
    >
      <div className="w-full max-w-3xl">
        <BlindTimer />
      </div>
    </div>
  );
}
