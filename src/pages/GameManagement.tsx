import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePoker } from "@/contexts/PokerContext";
import { formatDate, formatCurrency } from "@/lib/utils/dateUtils";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { exportGameReport } from "@/lib/utils/exportUtils";
import { Game, Player, GamePlayer } from "@/lib/db/models";

export default function GameManagement() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { players, activeSeason, games, updateGame, finishGame } = usePoker();
  
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dinnerCost, setDinnerCost] = useState<number>(0);
  const [isSelectingPlayers, setIsSelectingPlayers] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [blindTimer, setBlindTimer] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [nextBlindTime, setNextBlindTime] = useState<number>(15 * 60); // 15 minutes in seconds
  
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
            const selected = new Set<string>(foundGame.players.map(p => p.playerId));
            setSelectedPlayers(selected);
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
  
  // Blind timer
  useEffect(() => {
    let interval: number | undefined;
    
    if (timerRunning) {
      interval = window.setInterval(() => {
        setBlindTimer(prev => {
          // Play sound when 1 minute remaining or when blinds change
          if (prev === 60 || prev === 1) {
            playAlertSound();
          }
          
          if (prev <= 1) {
            // Reset timer when it reaches 0
            return nextBlindTime;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, nextBlindTime]);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const playAlertSound = () => {
    // Simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.5;
    
    oscillator.start();
    
    setTimeout(() => {
      oscillator.stop();
    }, 500);
  };
  
  const toggleTimer = () => {
    setTimerRunning(prev => !prev);
  };
  
  const resetTimer = () => {
    setBlindTimer(nextBlindTime);
  };
  
  const changeBlindTime = (minutes: number) => {
    const seconds = minutes * 60;
    setNextBlindTime(seconds);
    setBlindTimer(seconds);
  };
  
  // Player selection handlers
  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayers(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(playerId)) {
        newSelected.delete(playerId);
      } else {
        newSelected.add(playerId);
      }
      return newSelected;
    });
  };
  
  const handleStartGame = async () => {
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
  
  const eliminatePlayer = async (playerId: string, position: number) => {
    if (!game) return;
    
    try {
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
      if (remainingPlayers.length === 1) {
        // Auto-set the last player as winner (position 1)
        const winner = remainingPlayers[0];
        await updatePlayerStats(winner.playerId, 'position', 1);
        
        // Show completion dialog
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
  
  const calculateDinnerCosts = async () => {
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
    
    // Calculate dinner cost per player
    const costPerPlayer = dinnerCost / dinnerParticipants.length;
    
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
      dinnerCost,
    });
    
    // Update local game state
    setGame(prev => {
      if (!prev) return null;
      return {
        ...prev,
        players: updatedPlayers,
        dinnerCost,
      };
    });
    
    toast({
      title: "Custo da janta atualizado",
      description: `R$ ${dinnerCost.toFixed(2)} dividido entre ${dinnerParticipants.length} jogadores.`,
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
  
  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : 'Jogador Desconhecido';
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Partida #{game.number.toString().padStart(3, '0')}
          </h2>
          <p className="text-muted-foreground">{formatDate(game.date)}</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          {!isSelectingPlayers && (
            <>
              <Button
                onClick={handleExportReport}
                disabled={isExporting}
                variant="outline"
                size="sm"
              >
                {isExporting ? "Exportando..." : "Exportar Relatório"}
              </Button>
              
              {game.isFinished ? (
                <Button
                  onClick={() => navigate('/partidas')}
                  variant="outline"
                  size="sm"
                >
                  Voltar
                </Button>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive"
                      size="sm"
                    >
                      Encerrar Partida
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Encerrar Partida</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja encerrar esta partida? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleFinishGame}
                        disabled={isFinishing}
                      >
                        {isFinishing ? "Encerrando..." : "Encerrar"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </>
          )}
        </div>
      </div>
      
      {isSelectingPlayers ? (
        // Player selection screen
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Selecionar Jogadores</span>
              <span className="text-sm">{selectedPlayers.size} selecionados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
              {players.map(player => (
                <div 
                  key={player.id}
                  className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer ${
                    selectedPlayers.has(player.id) 
                      ? 'bg-poker-dark-green border border-poker-gold' 
                      : 'bg-poker-dark-green/50'
                  }`}
                  onClick={() => togglePlayerSelection(player.id)}
                >
                  <Avatar className="h-10 w-10">
                    {player.photoUrl ? (
                      <AvatarImage src={player.photoUrl} alt={player.name} />
                    ) : null}
                    <AvatarFallback className="bg-poker-navy text-white">
                      {getInitials(player.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <span className="flex-1">{player.name}</span>
                  
                  <Checkbox 
                    checked={selectedPlayers.has(player.id)}
                    onCheckedChange={() => togglePlayerSelection(player.id)}
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleStartGame}
                disabled={selectedPlayers.size === 0}
                className="bg-poker-gold hover:bg-poker-gold/80 text-black"
              >
                Iniciar Partida
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Game management screen
        <div className="space-y-6">
          {/* Blind timer */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Cronômetro de Blinds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-5xl font-bold tabular-nums">
                  {formatTime(blindTimer)}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={toggleTimer}
                    className={timerRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                  >
                    {timerRunning ? 'Pausar' : 'Iniciar'}
                  </Button>
                  
                  <Button
                    onClick={resetTimer}
                    variant="outline"
                  >
                    Reiniciar
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={() => changeBlindTime(10)} variant="outline" size="sm">10m</Button>
                  <Button onClick={() => changeBlindTime(15)} variant="outline" size="sm">15m</Button>
                  <Button onClick={() => changeBlindTime(20)} variant="outline" size="sm">20m</Button>
                  <Button onClick={() => changeBlindTime(30)} variant="outline" size="sm">30m</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Prize Pool */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-medium text-white">Prêmio Total</h3>
              <p className="text-2xl font-bold text-poker-gold">{formatCurrency(game.totalPrizePool)}</p>
            </div>
            
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Gerenciar Janta</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Gerenciar Janta</DialogTitle>
                    <DialogDescription>
                      Defina o valor total da janta. Este valor será dividido entre os jogadores que participaram.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="py-4">
                    <Label htmlFor="dinnerCost">Valor Total da Janta (R$)</Label>
                    <Input
                      id="dinnerCost"
                      type="number"
                      min="0"
                      step="any"
                      value={dinnerCost}
                      onChange={(e) => setDinnerCost(Number(e.target.value))}
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button onClick={calculateDinnerCosts}>Salvar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button onClick={distributeWinningsByPrize}>Calcular Prêmios</Button>
            </div>
          </div>
          
          {/* Players table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between">
                <span>Jogadores</span>
                <span>{game.players.length} participantes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-poker-dark-green">
                      <th className="text-left py-2 px-2">Jogador</th>
                      <th className="text-center p-2">Buy-In</th>
                      <th className="text-center p-2">
                        <div>Rebuys</div>
                        <div className="text-xs text-muted-foreground">
                          {activeSeason ? formatCurrency(activeSeason.financialParams.rebuy) : 'R$ 0,00'}
                        </div>
                      </th>
                      <th className="text-center p-2">
                        <div>Add-ons</div>
                        <div className="text-xs text-muted-foreground">
                          {activeSeason ? formatCurrency(activeSeason.financialParams.addon) : 'R$ 0,00'}
                        </div>
                      </th>
                      <th className="text-center p-2">Janta</th>
                      <th className="text-center p-2">Prêmio</th>
                      <th className="text-center p-2">Pontos</th>
                      <th className="text-center p-2">Saldo</th>
                      <th className="text-right p-2">Ações</th>
                    </tr>
                  </thead>
                  
                  <tbody>
                    {game.players.map((gamePlayer) => {
                      const player = players.find(p => p.id === gamePlayer.playerId);
                      if (!player) return null;
                      
                      return (
                        <tr 
                          key={gamePlayer.playerId}
                          className={`border-b border-poker-dark-green ${
                            gamePlayer.isEliminated ? 'opacity-60' : ''
                          }`}
                        >
                          <td className="p-2 flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              {player.photoUrl ? (
                                <AvatarImage src={player.photoUrl} alt={player.name} />
                              ) : null}
                              <AvatarFallback className="bg-poker-navy text-white text-xs">
                                {getInitials(player.name)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex flex-col">
                              <span>{player.name}</span>
                              {gamePlayer.isEliminated && (
                                <span className="text-xs text-poker-gold">
                                  {gamePlayer.position}º lugar
                                </span>
                              )}
                            </div>
                          </td>
                          
                          <td className="p-2 text-center">
                            <Checkbox 
                              checked={gamePlayer.buyIn}
                              onCheckedChange={(checked) => updatePlayerStats(gamePlayer.playerId, 'buyIn', !!checked)}
                              disabled={game.isFinished}
                            />
                          </td>
                          
                          <td className="p-2 text-center">
                            <div className="flex justify-center items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-6 w-6 p-0"
                                onClick={() => updatePlayerStats(
                                  gamePlayer.playerId, 
                                  'rebuys', 
                                  Math.max(0, gamePlayer.rebuys - 1)
                                )}
                                disabled={gamePlayer.rebuys === 0 || game.isFinished}
                              >
                                -
                              </Button>
                              
                              <span className="w-4 text-center">{gamePlayer.rebuys}</span>
                              
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-6 w-6 p-0"
                                onClick={() => updatePlayerStats(
                                  gamePlayer.playerId, 
                                  'rebuys', 
                                  gamePlayer.rebuys + 1
                                )}
                                disabled={game.isFinished}
                              >
                                +
                              </Button>
                            </div>
                          </td>
                          
                          <td className="p-2 text-center">
                            <div className="flex justify-center items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-6 w-6 p-0"
                                onClick={() => updatePlayerStats(
                                  gamePlayer.playerId, 
                                  'addons', 
                                  Math.max(0, gamePlayer.addons - 1)
                                )}
                                disabled={gamePlayer.addons === 0 || game.isFinished}
                              >
                                -
                              </Button>
                              
                              <span className="w-4 text-center">{gamePlayer.addons}</span>
                              
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-6 w-6 p-0"
                                onClick={() => updatePlayerStats(
                                  gamePlayer.playerId, 
                                  'addons', 
                                  gamePlayer.addons + 1
                                )}
                                disabled={game.isFinished}
                              >
                                +
                              </Button>
                            </div>
                          </td>
                          
                          <td className="p-2 text-center">
                            <Checkbox 
                              checked={gamePlayer.joinedDinner}
                              onCheckedChange={(checked) => updatePlayerStats(gamePlayer.playerId, 'joinedDinner', !!checked)}
                              disabled={game.isFinished}
                            />
                          </td>
                          
                          <td className="p-2 text-center font-medium">
                            {formatCurrency(gamePlayer.prize)}
                          </td>
                          
                          <td className="p-2 text-center font-medium">
                            {gamePlayer.points}
                          </td>
                          
                          <td className={`p-2 text-center font-medium ${
                            gamePlayer.balance < 0 ? 'text-poker-red' : 'text-poker-blue'
                          }`}>
                            {formatCurrency(gamePlayer.balance)}
                          </td>
                          
                          <td className="p-2 text-right">
                            {!gamePlayer.isEliminated && !game.isFinished && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="destructive">Eliminar</Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Eliminar Jogador</DialogTitle>
                                    <DialogDescription>
                                      Qual a posição final de {getPlayerName(gamePlayer.playerId)}?
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <div className="py-4">
                                    <div className="grid grid-cols-5 gap-2">
                                      {[...Array(10)].map((_, i) => (
                                        <Button
                                          key={i}
                                          variant="outline"
                                          onClick={() => {
                                            eliminatePlayer(gamePlayer.playerId, i + 1);
                                            document.querySelector('[data-state="open"]')?.dispatchEvent(
                                              new KeyboardEvent('keydown', { key: 'Escape' })
                                            );
                                          }}
                                        >
                                          {i + 1}º
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
