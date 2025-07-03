
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { usePoker } from "@/contexts/PokerContext";
import { Game } from "@/lib/db/models";

export function useGameActions(game: Game | null, setGame: React.Dispatch<React.SetStateAction<Game | null>>) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { finishGame, deleteGame } = usePoker();
  
  const [isFinishing, setIsFinishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Game finish functionality
  const handleFinishGame = async () => {
    if (!game) return;
    
    try {
      setIsFinishing(true);
      await finishGame(game.id);
      
      // Update local game state
      setGame(prev => {
        if (!prev) return null;
        return {
          ...prev,
          isFinished: true,
        };
      });
      
      toast({
        title: "Partida encerrada",
        description: "A partida foi finalizada com sucesso.",
      });
    } catch (error) {
      console.error("Error finishing game:", error);
      toast({
        title: "Erro",
        description: "Não foi possível encerrar a partida.",
        variant: "destructive",
      });
    } finally {
      setIsFinishing(false);
    }
  };

  // Game delete functionality
  const handleDeleteGame = async () => {
    if (!game) return;
    
    try {
      setIsDeleting(true);
      await deleteGame(game.id);
      
      toast({
        title: "Partida excluída",
        description: "A partida foi excluída com sucesso.",
      });
      
      // Navigate back to games list
      navigate('/games');
    } catch (error) {
      console.error("Error deleting game:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a partida.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isFinishing,
    isDeleting,
    handleFinishGame,
    handleDeleteGame,
  };
}
