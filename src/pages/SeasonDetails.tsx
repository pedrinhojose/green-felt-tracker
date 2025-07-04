import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Calendar, Trophy, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatCurrency } from "@/lib/utils/dateUtils";
import { Season, Game, GamePlayer, RankingEntry } from "@/lib/db/models";
import { pokerDB } from "@/lib/db";
import { RankingTable } from "@/components/ranking/RankingTable";
import { RankingExporter } from "@/components/ranking/RankingExporter";

// Estrutura para armazenar estatísticas de jogador
interface PlayerStat {
  playerId: string;
  playerName: string;
  photoUrl?: string;
  gamesPlayed: number;
  victories: number;
  averagePosition: number;
  bestPosition: number;
  totalPoints: number;
}

// Interface para os ganhadores do jackpot
interface JackpotWinner {
  playerId: string;
  playerName: string;
  position: number;
  jackpotAmount: number;
}

export default function SeasonDetails() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [season, setSeason] = useState<Season | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [jackpotWinners, setJackpotWinners] = useState<JackpotWinner[]>([]);
  
  // Funções auxiliares para o ranking
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const getMedalEmoji = (position: number) => {
    switch (position) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return (position + 1).toString();
    }
  };

  // Função para calcular os ganhadores do jackpot
  const calculateJackpotWinners = (season: Season, rankings: RankingEntry[]): JackpotWinner[] => {
    console.log("=== DEBUG: Calculando ganhadores do jackpot ===");
    console.log("Season jackpot:", season.jackpot);
    console.log("Season prize schema:", season.seasonPrizeSchema);
    console.log("Rankings count:", rankings.length);
    
    if (!season.seasonPrizeSchema || rankings.length === 0) {
      console.log("Sem prize schema ou rankings");
      return [];
    }

    const sortedRankings = [...rankings].sort((a, b) => b.totalPoints - a.totalPoints);
    const winners: JackpotWinner[] = [];
    const totalJackpot = season.jackpot;
    
    console.log("Total jackpot para distribuir:", totalJackpot);
    console.log("Prize schema detalhado:", season.seasonPrizeSchema);

    // Distribuir prêmios baseado na ordem do ranking
    for (let i = 0; i < Math.min(season.seasonPrizeSchema.length, sortedRankings.length); i++) {
      const prizeEntry = season.seasonPrizeSchema[i];
      const ranking = sortedRankings[i];
      
      console.log(`=== Posição ${i + 1} ===`);
      console.log("Prize entry:", prizeEntry);
      console.log("Ranking player:", ranking?.playerName);
      console.log("Player points:", ranking?.totalPoints);
      
      if (prizeEntry && ranking) {
        const jackpotAmount = (totalJackpot * prizeEntry.percentage) / 100;
        console.log(`Cálculo: ${totalJackpot} * ${prizeEntry.percentage} / 100 = ${jackpotAmount}`);
        
        winners.push({
          playerId: ranking.playerId,
          playerName: ranking.playerName,
          position: i + 1,
          jackpotAmount: jackpotAmount
        });
      }
    }

    console.log("Winners finais:", winners);
    return winners;
  };
  
  useEffect(() => {
    if (!seasonId) return;
    
    const loadSeasonDetails = async () => {
      try {
        setLoading(true);
        // Carregar dados da temporada
        const seasonData = await pokerDB.getSeason(seasonId);
        if (!seasonData) {
          toast({
            title: "Erro",
            description: "Temporada não encontrada.",
            variant: "destructive",
          });
          navigate("/seasons");
          return;
        }
        
        console.log("Dados da temporada carregados:", {
          name: seasonData.name,
          jackpot: seasonData.jackpot,
          prizeSchema: seasonData.seasonPrizeSchema
        });
        
        setSeason(seasonData);
        
        // Carregar jogos da temporada
        const gamesData = await pokerDB.getGames(seasonId);
        setGames(gamesData);
        
        // Carregar ranking da temporada
        const rankingsData = await pokerDB.getRankings(seasonId);
        setRankings(rankingsData);
        
        console.log("Rankings carregados:", rankingsData.map(r => ({ name: r.playerName, points: r.totalPoints })));
        
        // Calcular ganhadores do jackpot
        const winners = calculateJackpotWinners(seasonData, rankingsData);
        setJackpotWinners(winners);
        
        // Calcular estatísticas dos jogadores
        calculatePlayerStats(gamesData, rankingsData);
      } catch (error) {
        console.error("Error loading season details:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes da temporada.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadSeasonDetails();
  }, [seasonId, navigate, toast]);
  
  const calculatePlayerStats = (gamesData: Game[], rankingsData: RankingEntry[]) => {
    if (!gamesData.length) return;
    
    // Ordenar ranking por pontos (decrescente)
    const sortedRankings = [...rankingsData].sort((a, b) => b.totalPoints - a.totalPoints);
    
    const playerStatsMap = new Map<string, PlayerStat>();
    
    // Para cada jogo, processar estatísticas dos jogadores
    gamesData.forEach(game => {
      game.players.forEach(gamePlayer => {
        // Busque informações do jogador no ranking
        const rankingPlayer = sortedRankings.find(r => r.playerId === gamePlayer.playerId);
        if (!rankingPlayer) return;
        
        // Update player stats
        let playerStat = playerStatsMap.get(gamePlayer.playerId);
        if (!playerStat) {
          playerStat = {
            playerId: gamePlayer.playerId,
            playerName: rankingPlayer.playerName, // Use o nome do jogador do ranking
            photoUrl: rankingPlayer.photoUrl, // Use a foto do jogador do ranking
            gamesPlayed: 0,
            victories: 0,
            averagePosition: 0,
            bestPosition: 10, // Iniciar com um valor alto
            totalPoints: 0
          };
          playerStatsMap.set(gamePlayer.playerId, playerStat);
        }
        
        // Atualizar estatísticas
        playerStat.gamesPlayed++;
        
        // Verificar se foi uma vitória (posição 1)
        if (gamePlayer.position === 1) {
          playerStat.victories++;
        }
        
        // Atualizar melhor posição
        if (gamePlayer.position < playerStat.bestPosition) {
          playerStat.bestPosition = gamePlayer.position;
        }
      });
    });
    
    // Atualizar pontos e posição média com base no ranking
    sortedRankings.forEach(rankingEntry => {
      const playerStat = playerStatsMap.get(rankingEntry.playerId);
      if (playerStat) {
        playerStat.totalPoints = rankingEntry.totalPoints;
        // Verificar se averagePosition existe no rankingEntry
        if ('averagePosition' in rankingEntry) {
          playerStat.averagePosition = (rankingEntry as any).averagePosition;
        } else {
          // Calcular média com base nos jogos se não existir no ranking
          const playerGames = games
            .flatMap(game => game.players)
            .filter(player => player.playerId === rankingEntry.playerId);
          
          if (playerGames.length) {
            const sum = playerGames.reduce((acc, curr) => acc + curr.position, 0);
            playerStat.averagePosition = sum / playerGames.length;
          } else {
            playerStat.averagePosition = 0;
          }
        }
      }
    });
    
    // Converter o Map para array e ordenar por pontos
    const playerStatsArray = Array.from(playerStatsMap.values())
      .sort((a, b) => b.totalPoints - a.totalPoints);
    
    setPlayerStats(playerStatsArray);
  };
  
  if (loading) {
    return <div className="text-center text-white">Carregando detalhes da temporada...</div>;
  }
  
  if (!season) {
    return <div className="text-center text-white">Temporada não encontrada.</div>;
  }
  
  // Ordenar rankings por total de pontos
  const sortedRankings = [...rankings].sort((a, b) => b.totalPoints - a.totalPoints);
  
  return (
    <div className="container mx-auto px-4 py-6">
      <Button variant="ghost" onClick={() => navigate("/seasons")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Temporadas
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            {season.name}
          </CardTitle>
          <CardDescription>
            Detalhes e estatísticas da temporada selecionada.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="ranking">Ranking</TabsTrigger>
              <TabsTrigger value="games">Partidas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações da Temporada</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Início: {formatDate(season.startDate)}</span>
                      </div>
                      
                      {season.endDate && (
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Fim: {formatDate(season.endDate)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm">
                        <Trophy className="h-4 w-4 mr-2 text-poker-gold" />
                        <span>Jackpot Final: {formatCurrency(season.jackpot)}</span>
                      </div>

                      {/* Lista de ganhadores do jackpot */}
                      {jackpotWinners.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Distribuição do Jackpot:</h4>
                          <div className="space-y-1">
                            {jackpotWinners.map((winner, index) => (
                              <div key={winner.playerId} className="flex justify-between items-center text-xs">
                                <span className="text-gray-600">
                                  {index + 1}º {winner.playerName}
                                </span>
                                <span className="font-medium text-poker-gold">
                                  {formatCurrency(winner.jackpotAmount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Estatísticas da Temporada</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2" />
                        <span>Total de Jogadores: {playerStats.length}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Total de Partidas: {games.length}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Top Jogadores</CardTitle>
                    <CardDescription>
                      Top 5 jogadores da temporada.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-none space-y-2">
                      {playerStats.slice(0, 5).map((player, index) => (
                        <li key={player.playerId} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="font-semibold mr-2">{index + 1}.</span>
                            {player.photoUrl ? (
                              <img src={player.photoUrl} alt={player.playerName} className="rounded-full w-8 h-8 mr-2" />
                            ) : (
                              <div className="rounded-full w-8 h-8 mr-2 bg-gray-700 flex items-center justify-center text-white">
                                {player.playerName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span>{player.playerName}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{player.totalPoints} pontos</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="ranking">
              <Card>
                <CardHeader>
                  <CardTitle>Ranking da Temporada</CardTitle>
                  <CardDescription>
                    Classificação dos jogadores na temporada.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RankingTable 
                    sortedRankings={sortedRankings} 
                    currentPage={currentPage}
                    pageSize={pageSize}
                    getInitials={getInitials}
                    getMedalEmoji={getMedalEmoji}
                  />
                  <RankingExporter 
                    sortedRankings={sortedRankings} 
                    activeSeason={season}
                    getInitials={getInitials}
                    getMedalEmoji={getMedalEmoji}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="games">
              <Card>
                <CardHeader>
                  <CardTitle>Partidas da Temporada</CardTitle>
                  <CardDescription>
                    Lista de partidas disputadas nesta temporada.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {games.length > 0 ? (
                    <ul className="list-none space-y-2">
                      {games.map(game => (
                        <li key={game.id} className="flex items-center justify-between">
                          <span>Partida #{game.number} - {formatDate(game.date)}</span>
                          <Button variant="outline" size="sm" onClick={() => navigate(`/games/${game.id}`)}>
                            Ver Detalhes
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">Nenhuma partida disputada nesta temporada.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
