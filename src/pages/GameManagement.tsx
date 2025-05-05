
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Game, Player, GamePlayer } from "@/lib/db/models";
import { usePoker } from "@/contexts/PokerContext";
import { useToast } from "@/components/ui/use-toast";
import { exportGameReport } from "@/lib/utils/exportUtils";

// Componentes refatorados
import BlindTimer from "@/components/game/BlindTimer";
import PlayerSelection from "@/components/game/PlayerSelection";
import PrizePoolManager from "@/components/game/PrizePoolManager";
import PlayersTable from "@/components/game/PlayersTable";
import GameHeader from "@/components/game/GameHeader";

export default function GameManagement() {
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
  
  // Player selection handlers
  const handleStartGame = async (selectedPlayers: Set<string>) => {
    if (!game || selectedPlayers.size === 0) return;
    
    try {
      // Create game players array from selected player IDs
      const gamePlayers: GamePlayer[] = Array.from(selectedPlayers).map(playerId => ({
        id: `${playerId}-${Date.now()}`,
        playerId,
        position: null,
        buyIn: true,
        rebuys: 0,
        addons: 0,
        joinedDinner: false,
        isEliminated: false,
        prize: 0,
        points: 0,
        balance: 0,
      }));
      
      // Calculate initial prize pool (buy-ins)
      const buyInAmount = activeSeason?.financialParams.buyIn || 0;
      const initialPrizePool = buyInAmount * gamePlayers.length;
      
      // Update game with players and prize pool
      await updateGame({
        id: game.id,
        players: gamePlayers,
        totalPrizePool: initialPrizePool,
      });
      
      // Update local game state
      setGame(prev => {
        if (!prev) return null;
        return {
          ...prev,
          players: gamePlayers,
          totalPrizePool: initialPrizePool,
        };
      });
      
      setIsSelectingPlayers(false);
      
      toast({
        title: "Partida iniciada",
        description: `${gamePlayers.length} jogadores selecionados`,
      });
    } catch (error) {
      console.error("Error starting game:", error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a partida.",
        variant: "destructive",
      });
    }
  };
  
  // Update player stats
  const updatePlayerStats = async (playerId: string, field: keyof GamePlayer, value: any) => {
    if (!game) return;
    
    try {
      const updatedPlayers = game.players.map(player => {
        if (player.playerId === playerId) {
          return { ...player, [field]: value };
        }
        return player;
      });
      
      // Calculate new prize pool
      let totalPrizePool = 0;
      if (activeSeason) {
        const { buyIn, rebuy, addon } = activeSeason.financialParams;
        
        // Add up all buy-ins, rebuys, and add-ons
        for (const player of updatedPlayers) {
          if (player.buyIn) {
            totalPrizePool += buyIn;
          }
          totalPrizePool += rebuy * player.rebuys;
          totalPrizePool += addon * player.addons;
        }
      }
      
      // Update game
      await updateGame({
        id: game.id,
        players: updatedPlayers,
        totalPrizePool,
      });
      
      // Update local game state
      setGame(prev => {
        if (!prev) return null;
        return {
          ...prev,
          players: updatedPlayers,
          totalPrizePool,
        };
      });
    } catch (error) {
      console.error("Error updating player stats:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os dados do jogador.",
        variant: "destructive",
      });
    }
  };
  
  // Função de eliminação do jogador para calcular posição automaticamente
  const eliminatePlayer = async (playerId: string) => {
    if (!game) return;
    
    try {
      // Contar jogadores já eliminados para determinar a posição atual
      const eliminatedPlayersCount = game.players.filter(p => p.isEliminated).length;
      const totalPlayers = game.players.length;
      
      // Calcular automaticamente a posição (totalPlayers - eliminatedPlayersCount)
      // Exemplo: em 7 jogadores, primeiro eliminado fica em 7º lugar
      const position = totalPlayers - eliminatedPlayersCount;
      
      // Update player position and elimination status
      const updatedPlayers = game.players.map(player => {
        if (player.playerId === playerId) {
          return { ...player, position, isEliminated: true };
        }
        return player;
      });
      
      // Update game
      await updateGame({
        id: game.id,
        players: updatedPlayers,
      });
      
      // Update local game state
      setGame(prev => {
        if (!prev) return null;
        return {
          ...prev,
          players: updatedPlayers,
        };
      });
      
      toast({
        title: "Jogador eliminado",
        description: `Posição final: ${position}º lugar`,
      });
      
      // Check if only one player remains (not eliminated)
      const remainingPlayers = updatedPlayers.filter(p => !p.isEliminated);
      
      // Se restarem exatamente dois jogadores e um está sendo eliminado,
      // automaticamente defina o último jogador como vencedor (1º lugar)
      if (remainingPlayers.length === 1) {
        // Auto-set the last player as winner (position 1)
        const winner = remainingPlayers[0];
        
        // Cria uma nova lista de jogadores com o vencedor definido como 1º lugar
        const finalPlayers = updatedPlayers.map(player => {
          if (player.playerId === winner.playerId) {
            return { ...player, position: 1, isEliminated: true };
          }
          return player;
        });
        
        // Atualiza o jogo com o vencedor definido
        await updateGame({
          id: game.id,
          players: finalPlayers,
        });
        
        // Atualiza o estado local
        setGame(prev => {
          if (!prev) return null;
          return {
            ...prev,
            players: finalPlayers,
          };
        });
        
        toast({
          title: "Partida finalizada!",
          description: "Um vencedor foi determinado. Você pode encerrar a partida.",
        });
      }
    } catch (error) {
      console.error("Error eliminating player:", error);
      toast({
        title: "Erro",
        description: "Não foi possível eliminar o jogador.",
        variant: "destructive",
      });
    }
  };
  
  const calculateDinnerCosts = async (dinnerCostValue: number) => {
    if (!game) return;
    
    // Count players who joined dinner
    const dinnerParticipants = game.players.filter(player => player.joinedDinner);
    
    if (dinnerParticipants.length === 0) {
      toast({
        title: "Aviso",
        description: "Nenhum jogador participou da janta.",
      });
      return;
    }
    
    // Update players with dinner cost in their balance
    const updatedPlayers = game.players.map(player => {
      if (player.joinedDinner) {
        // Add dinner cost to their balance calculation
        return { ...player };
      }
      return player;
    });
    
    // Update game
    await updateGame({
      id: game.id,
      players: updatedPlayers,
      dinnerCost: dinnerCostValue,
    });
    
    // Update local game state
    setGame(prev => {
      if (!prev) return null;
      return {
        ...prev,
        players: updatedPlayers,
        dinnerCost: dinnerCostValue,
      };
    });
    
    // Update dinner cost state
    setDinnerCost(dinnerCostValue);
    
    toast({
      title: "Custo da janta atualizado",
      description: `R$ ${dinnerCostValue.toFixed(2)} dividido entre ${dinnerParticipants.length} jogadores.`,
    });
  };
  
  const distributeWinningsByPrize = async () => {
    if (!game || !activeSeason) return;
    
    try {
      // Get player positions
      const playersWithPositions = game.players.filter(player => 
        player.isEliminated && player.position !== null
      ).sort((a, b) => (a.position || 999) - (b.position || 999));
      
      // Find players without positions
      const playersWithoutPositions = game.players.filter(player => 
        player.position === null
      );
      
      if (playersWithoutPositions.length > 0) {
        toast({
          title: "Aviso",
          description: "Alguns jogadores ainda não têm posição definida.",
          variant: "destructive",
        });
        return;
      }
      
      // Get prize schema from active season
      const prizeSchema = activeSeason.weeklyPrizeSchema;
      
      // Calculate prizes
      const updatedPlayers = [...game.players];
      const totalPrize = game.totalPrizePool;
      
      // Apply prize schema
      for (const player of updatedPlayers) {
        if (player.position === null) continue;
        
        // Find matching prize entry
        const prizeEntry = prizeSchema.find(entry => entry.position === player.position);
        if (prizeEntry) {
          // Calculate prize
          player.prize = (totalPrize * prizeEntry.percentage) / 100;
        } else {
          // No prize for positions outside schema
          player.prize = 0;
        }
      }
      
      // Calculate points based on score schema
      for (const player of updatedPlayers) {
        if (player.position === null) continue;
        
        // Find matching score entry
        const scoreEntry = activeSeason.scoreSchema.find(entry => entry.position === player.position);
        if (scoreEntry) {
          player.points = scoreEntry.points;
        } else {
          player.points = 0;
        }
      }
      
      // Calculate balances
      for (const player of updatedPlayers) {
        const buyInCost = player.buyIn ? activeSeason.financialParams.buyIn : 0;
        const rebuysCost = player.rebuys * activeSeason.financialParams.rebuy;
        const addonsCost = player.addons * activeSeason.financialParams.addon;
        const dinnerCostShare = player.joinedDinner && game.dinnerCost ? 
          game.dinnerCost / game.players.filter(p => p.joinedDinner).length : 0;
        
        // Calculate balance (prize - costs)
        player.balance = player.prize - (buyInCost + rebuysCost + addonsCost + dinnerCostShare);
      }
      
      // Update game
      await updateGame({
        id: game.id,
        players: updatedPlayers,
      });
      
      // Update local game state
      setGame(prev => {
        if (!prev) return null;
        return {
          ...prev,
          players: updatedPlayers,
        };
      });
      
      toast({
        title: "Premiação distribuída",
        description: "Prêmios e pontuação calculados para todos os jogadores.",
      });
    } catch (error) {
      console.error("Error distributing prizes:", error);
      toast({
        title: "Erro",
        description: "Não foi possível distribuir os prêmios.",
        variant: "destructive",
      });
    }
  };
  
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
  
  const handleExportReport = async () => {
    if (!game) return;
    
    try {
      setIsExporting(true);
      const pdfUrl = await exportGameReport(game.id, game, players);
      
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
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-poker-dark-green rounded w-1/3 mx-auto mb-8"></div>
          <div className="h-64 bg-poker-dark-green rounded-lg max-w-3xl mx-auto"></div>
        </div>
      </div>
    );
  }
  
  if (!game) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Partida não encontrada</h2>
        <Button onClick={() => navigate('/partidas')}>Voltar para Lista de Partidas</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {!isSelectingPlayers && (
        <GameHeader
          gameNumber={game.number}
          gameDate={game.date}
          isFinished={game.isFinished}
          isExporting={isExporting}
          isFinishing={isFinishing}
          onExportReport={handleExportReport}
          onFinishGame={handleFinishGame}
        />
      )}
      
      {isSelectingPlayers ? (
        // Player selection screen
        <PlayerSelection 
          players={players} 
          onStartGame={handleStartGame}
        />
      ) : (
        // Game management screen
        <div className="space-y-6">
          {/* Blind timer */}
          <BlindTimer />
          
          {/* Prize Pool */}
          <PrizePoolManager 
            totalPrizePool={game.totalPrizePool}
            onCalculateDinner={calculateDinnerCosts}
            onDistributePrizes={distributeWinningsByPrize}
            initialDinnerCost={dinnerCost}
          />
          
          {/* Players table */}
          <PlayersTable
            game={game}
            players={players}
            activeSeason={activeSeason}
            onEliminatePlayer={eliminatePlayer}
            onUpdatePlayerStats={updatePlayerStats}
          />
        </div>
      )}
    </div>
  );
}
