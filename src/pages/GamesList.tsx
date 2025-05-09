
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePoker } from "@/contexts/PokerContext";
import { formatDate, formatCurrency } from "@/lib/utils/dateUtils";
import { useToast } from "@/components/ui/use-toast";
import { FileText, List } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function GamesList() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { games, activeSeason, createGame, getGameNumber } = usePoker();
  const [isCreating, setIsCreating] = useState(false);
  
  // Sort games by number in descending order
  const sortedGames = [...games].sort((a, b) => b.number - a.number);
  
  const handleCreateGame = async () => {
    if (!activeSeason) {
      toast({
        title: "Erro",
        description: "Não há temporada ativa. Crie uma temporada antes de iniciar uma partida.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsCreating(true);
      const gameId = await createGame(activeSeason.id);
      navigate(`/game/${gameId}`);
    } catch (error) {
      console.error("Error creating game:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar uma nova partida.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Partidas</h2>
        
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button 
            variant="outline"
            onClick={() => navigate('/seasons')}
            className="mr-2"
          >
            <List className="mr-2 h-4 w-4" />
            Ver Temporadas
          </Button>
          
          {activeSeason && sortedGames.length > 0 && (
            <Button 
              variant="outline"
              onClick={() => navigate('/report')}
              className="mr-2"
            >
              <FileText className="mr-2 h-4 w-4" />
              Relatório da Temporada
            </Button>
          )}
          
          {activeSeason ? (
            <Button 
              onClick={handleCreateGame} 
              disabled={isCreating}
              className="bg-poker-gold hover:bg-poker-gold/80 text-black"
            >
              {isCreating ? "Criando..." : "Nova Partida"}
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => navigate('/season')}
            >
              Criar Temporada
            </Button>
          )}
        </div>
      </div>
      
      {/* Resto do componente permanece igual */}
      {sortedGames.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedGames.map(game => (
            <Card key={game.id} className="bg-poker-green hover:bg-poker-green/90 cursor-pointer transition-all duration-200"
              onClick={() => navigate(`/game/${game.id}`)}>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>Partida #{game.number.toString().padStart(3, '0')}</span>
                  {game.isFinished && (
                    <span className="text-sm bg-poker-gold text-black px-2 py-1 rounded-full">Finalizada</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{formatDate(game.date)}</p>
                <p className="mb-1">Jogadores: {game.players.length}</p>
                <p className="text-poker-gold font-semibold">Premiação: {formatCurrency(game.totalPrizePool)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">Nenhuma partida registrada ainda</p>
          {activeSeason && (
            <Button 
              onClick={handleCreateGame}
              disabled={isCreating}
              className="bg-poker-gold hover:bg-poker-gold/80 text-black"
            >
              {isCreating ? "Criando..." : "Iniciar Primeira Partida"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
