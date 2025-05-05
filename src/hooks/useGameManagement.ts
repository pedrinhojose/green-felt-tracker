
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { usePoker } from "@/contexts/PokerContext";
import { Game, Player } from "@/lib/db/models";

export function useGameManagement() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { players, activeSeason, games, updateGame, finishGame } = usePoker();
  
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dinnerCost, setDinnerCost] = useState<number>(0);
  const [isSelectingPlayers, setIsSelectingPlayers] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  
  // Load game data
  useEffect(() => {
    const loadGame = async () => {
      if (!gameId) return;
      
      try {
        setIsLoading(true);
        // Find the game in the games array from context
        const foundGame = games.find(g => g.id === gameId);
        
        if (foundGame) {
          setGame(foundGame);
          
          // Initialize selected players if game has players
          if (foundGame.players.length > 0) {
            setIsSelectingPlayers(false);
          } else {
            setIsSelectingPlayers(true);
          }
          
          // Set dinner cost if it exists
          if (foundGame.dinnerCost) {
            setDinnerCost(foundGame.dinnerCost);
          }
        } else {
          toast({
            title: "Erro",
            description: "Partida não encontrada.",
            variant: "destructive",
          });
          navigate("/partidas");
        }
      } catch (error) {
        console.error("Error loading game:", error);
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
  
  // Game report export functionality
  const handleExportReport = async () => {
    if (!game) return;
    
    try {
      setIsExporting(true);
      
      const { exportGameReport } = await import("@/lib/utils/exportUtils");
      // Corrigido: Passando apenas o ID do jogo e a lista de jogadores
      const pdfUrl = await exportGameReport(game.id, players);
      
      // Open the PDF in a new tab
      window.open(pdfUrl, '_blank');
      
      toast({
        title: "Relatório gerado com sucesso",
        description: "O relatório foi aberto em uma nova aba.",
      });
    } catch (error) {
      console.error("Error exporting game report:", error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Não foi possível gerar o relatório de jogo.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
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

  return {
    game,
    setGame,
    isLoading,
    players,
    activeSeason,
    updateGame,
    dinnerCost,
    setDinnerCost,
    isSelectingPlayers,
    setIsSelectingPlayers,
    isExporting,
    isFinishing,
    handleExportReport,
    handleFinishGame,
  };
}
