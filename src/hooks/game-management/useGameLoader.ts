
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { usePoker } from "@/contexts/PokerContext";
import { Game } from "@/lib/db/models";
import { pokerDB } from "@/lib/db";

export function useGameLoader() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { games } = usePoker();
  
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load game data
  useEffect(() => {
    const loadGame = async () => {
      if (!gameId) return;
      
      try {
        console.log("useGameLoader: Carregando game:", gameId);
        setIsLoading(true);
        
        // First try to find the game in the games array from context
        let foundGame = games.find(g => g.id === gameId);
        console.log("useGameLoader: Game encontrado no contexto:", !!foundGame);
        
        // If not found in context, try to load directly from database
        if (!foundGame) {
          console.log("useGameLoader: Game não encontrado no contexto, buscando no banco...");
          foundGame = await pokerDB.getGame(gameId);
          console.log("useGameLoader: Game encontrado no banco:", !!foundGame);
        }
        
        if (foundGame) {
          setGame(foundGame);
        } else {
          console.error("useGameLoader: Game não encontrado");
          toast({
            title: "Erro",
            description: "Partida não encontrada.",
            variant: "destructive",
          });
          navigate("/games");
        }
      } catch (error) {
        console.error("useGameLoader: Error loading game:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da partida.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGame();
  }, [gameId, games, navigate, toast]);
  
  return {
    game,
    setGame,
    isLoading,
  };
}
