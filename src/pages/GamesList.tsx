import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePoker } from "@/contexts/PokerContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { formatDate, formatCurrency } from "@/lib/utils/dateUtils";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Trash } from "lucide-react";
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
  const { games, activeSeason, createGame, getGameNumber, deleteGame, isLoading } = usePoker();
  const { currentOrganization } = useOrganization();
  const [isCreating, setIsCreating] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Sort games by number in descending order
  const sortedGames = [...games].sort((a, b) => b.number - a.number);
  
  // Debug logging
  console.log("GamesList: Estado atual", {
    organizationId: currentOrganization?.id || 'none',
    organizationName: currentOrganization?.name || 'none',
    activeSeasonId: activeSeason?.id || 'none',
    activeSeasonName: activeSeason?.name || 'none',
    gamesCount: games.length,
    isLoading
  });
  
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
      navigate(`/games/${gameId}`);
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
  
  const handleDeleteGame = async (gameId: string) => {
    try {
      setIsDeleting(true);
      await deleteGame(gameId);
      toast({
        title: "Partida excluída",
        description: "A partida foi excluída com sucesso.",
      });
      setGameToDelete(null);
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-poker-gold"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Partidas</h2>
          {currentOrganization && (
            <p className="text-sm text-muted-foreground">
              Organização: {currentOrganization.name}
            </p>
          )}
        </div>
        
        <div className="flex gap-2 mt-4 sm:mt-0">
          {activeSeason && sortedGames.length > 0 && (
            <Button 
              variant="outline"
              onClick={() => navigate('/reports/season')}
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
      
      {sortedGames.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedGames.map(game => (
            <Card key={game.id} className="bg-poker-green hover:bg-poker-green/90 transition-all duration-200">
              <CardHeader className="pb-2 flex flex-row justify-between items-start">
                <CardTitle className="flex justify-between items-center">
                  <span>Partida #{game.number.toString().padStart(3, '0')}</span>
                  {game.isFinished && (
                    <span className="text-sm bg-poker-gold text-black px-2 py-1 rounded-full">Finalizada</span>
                  )}
                </CardTitle>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10 hover:text-red-600 p-1 h-auto">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir partida</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir esta partida? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 hover:bg-red-600"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteGame(game.id);
                        }}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Excluindo..." : "Excluir partida"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardHeader>
              <CardContent onClick={() => navigate(`/games/${game.id}`)} className="cursor-pointer">
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
