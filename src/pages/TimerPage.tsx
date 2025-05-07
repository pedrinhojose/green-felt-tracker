
import { useParams } from "react-router-dom";
import { usePoker } from "@/contexts/PokerContext";
import BlindTimer from "@/components/game/blindTimer/BlindTimer";
import { useEffect } from "react";

export default function TimerPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const { activeSeason } = usePoker();
  
  // Removida a referência a loadGame que não existe no PokerContextProps
  // Não é necessário carregar o jogo aqui porque a página só exibe o timer
  // O jogo já deve estar carregado na página que abriu esta

  return (
    <div className="flex items-center justify-center min-h-screen bg-poker-black p-4">
      <div className="w-full max-w-3xl">
        <BlindTimer />
      </div>
    </div>
  );
}
