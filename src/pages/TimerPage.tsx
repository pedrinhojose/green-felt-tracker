
import { useParams } from "react-router-dom";
import { usePoker } from "@/contexts/PokerContext";
import BlindTimer from "@/components/game/blindTimer/BlindTimer";
import { useEffect } from "react";

export default function TimerPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const { loadGame, activeSeason } = usePoker();
  
  useEffect(() => {
    if (gameId) {
      // Carregar o jogo quando a página for aberta
      loadGame(gameId);
    }
  }, [gameId, loadGame]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-poker-black p-4">
      <div className="w-full max-w-3xl">
        <BlindTimer />
      </div>
    </div>
  );
}
