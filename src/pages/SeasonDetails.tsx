import { useState, useEffect, useCallback, useMemo } from "react";
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
import { usePlayerStats } from "@/hooks/reports/usePlayerStats";
import PlayerPerformanceTable from "@/components/reports/PlayerPerformanceTable";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

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
  const [currentPage] = useState(1);
  const [pageSize] = useState(10);
  const [jackpotWinners, setJackpotWinners] = useState<JackpotWinner[]>([]);
  
  // Usar o hook usePlayerStats para obter dados detalhados de performance
  const { playerStats: detailedPlayerStats, loading: statsLoading } = usePlayerStats(seasonId);
  
  // Usar hook de scroll restoration
  useScrollRestoration(seasonId);
  
  // Memoizar funções auxiliares para evitar re-renders
  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }, []);
  
  const getMedalEmoji = useCallback((position: number) => {
    switch (position) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return (position + 1).toString();
    }
  }, []);

  // Função corrigida para calcular ganhadores do jackpot
  const calculateJackpotWinners = useCallback((season: Season, rankings: RankingEntry[], games: Game[]): JackpotWinner[] => {
    console.log("=== DEBUG: Calculando ganhadores do jackpot CORRIGIDO ===");
    console.log("Season:", {
      name: season.name,
      jackpot: season.jackpot,
      isActive: season.isActive,
      prizeSchema: season.seasonPrizeSchema,
      financialParams: season.financialParams
    });
    console.log("Rankings count:", rankings.length);
    console.log("Games count:", games.length);
    
    // Verificar se há dados necessários
    if (!season.seasonPrizeSchema || !Array.isArray(season.seasonPrizeSchema) || season.seasonPrizeSchema.length === 0) {
      console.log("❌ Sem prize schema válido");
      return [];
    }
    
    if (!rankings || rankings.length === 0) {
      console.log("❌ Sem rankings válidos");
      return [];
    }

    // Ordenar rankings por pontos (decrescente)
    const sortedRankings = [...rankings].sort((a, b) => b.totalPoints - a.totalPoints);
    console.log("Sorted rankings:", sortedRankings.map(r => ({ 
      name: r.playerName, 
      points: r.totalPoints 
    })));
    
    // Calcular o jackpot total
    let totalJackpot = season.jackpot;
    
    // Para temporadas encerradas com jackpot zerado, calcular com base na contribuição real
    if (!season.isActive && season.jackpot === 0 && games.length > 0) {
      totalJackpot = games.reduce((total, game) => {
        const playerCount = game.players?.length || 0;
        const jackpotContribution = season.financialParams?.jackpotContribution || 0;
        const gameJackpot = playerCount * jackpotContribution;
        console.log(`Jogo ${game.number}: ${playerCount} jogadores x R$ ${jackpotContribution} = R$ ${gameJackpot}`);
        return total + gameJackpot;
      }, 0);
      console.log("Jackpot calculado pela contribuição real:", totalJackpot);
    }
    
    console.log("Total jackpot para distribuir:", totalJackpot);
    console.log("Prize schema:", season.seasonPrizeSchema);

    const winners: JackpotWinner[] = [];
    
    // Distribuir prêmios baseado na ordem do ranking e no prize schema
    for (let i = 0; i < Math.min(season.seasonPrizeSchema.length, sortedRankings.length); i++) {
      const prizeEntry = season.seasonPrizeSchema[i];
      const ranking = sortedRankings[i];
      
      console.log(`=== Posição ${i + 1} ===`);
      console.log("Prize entry:", prizeEntry);
      console.log("Ranking player:", ranking?.playerName);
      console.log("Player points:", ranking?.totalPoints);
      
      if (prizeEntry && ranking && prizeEntry.percentage > 0) {
        const jackpotAmount = (totalJackpot * prizeEntry.percentage) / 100;
        console.log(`Cálculo: ${totalJackpot} * ${prizeEntry.percentage} / 100 = ${jackpotAmount}`);
        
        winners.push({
          playerId: ranking.playerId,
          playerName: ranking.playerName,
          position: i + 1,
          jackpotAmount: jackpotAmount
        });
        
        console.log(`✅ Adicionado: ${ranking.playerName} - R$ ${jackpotAmount.toFixed(2)}`);
      } else {
        console.log(`❌ Dados inválidos para posição ${i + 1}`);
      }
    }

    console.log("Winners finais:", winners);
    const totalDistribuido = winners.reduce((sum, w) => sum + w.jackpotAmount, 0);
    console.log("Total distribuído:", totalDistribuido);
    
    return winners;
  }, []);

  // Memoizar função de cálculo de estatísticas
  const calculatePlayerStats = useCallback((gamesData: Game[], rankingsData: RankingEntry[]) => {
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
            playerName: rankingPlayer.playerName,
            photoUrl: rankingPlayer.photoUrl,
            gamesPlayed: 0,
            victories: 0,
            averagePosition: 0,
            bestPosition: 10,
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
        if ('averagePosition' in rankingEntry) {
          playerStat.averagePosition = (rankingEntry as any).averagePosition;
        } else {
          const playerGames = gamesData
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
  }, []);
  
  // Salvar posição do scroll antes de re-render
  const saveScrollPosition = useCallback(() => {
    if (seasonId) {
      sessionStorage.setItem(`scroll-${seasonId}`, window.scrollY.toString());
    }
  }, [seasonId]);

  // Restaurar posição do scroll
  const restoreScrollPosition = useCallback(() => {
    if (seasonId) {
      const savedPosition = sessionStorage.getItem(`scroll-${seasonId}`);
      if (savedPosition) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedPosition));
        }, 100);
      }
    }
  }, [seasonId]);

  // Otimizar useEffect principal removendo dependências instáveis
  useEffect(() => {
    if (!seasonId) return;
    
    const loadSeasonDetails = async () => {
      try {
        // Salvar posição atual do scroll
        saveScrollPosition();
        
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
          isActive: seasonData.isActive,
          prizeSchema: seasonData.seasonPrizeSchema,
          financialParams: seasonData.financialParams
        });
        
        // Carregar jogos da temporada
        const gamesData = await pokerDB.getGames(seasonId);
        console.log("Jogos carregados:", gamesData.length);
        
        // Carregar ranking da temporada
        const rankingsData = await pokerDB.getRankings(seasonId);
        console.log("Rankings carregados:", rankingsData.map(r => ({ 
          name: r.playerName, 
          points: r.totalPoints 
        })));
        
        // Calcular ganhadores do jackpot com a função corrigida
        const winners = calculateJackpotWinners(seasonData, rankingsData, gamesData);
        console.log("Ganhadores calculados:", winners);
        
        // Calcular estatísticas dos jogadores
        calculatePlayerStats(gamesData, rankingsData);
        
        // Atualizar todos os estados
        setSeason(seasonData);
        setGames(gamesData);
        setRankings(rankingsData);
        setJackpotWinners(winners);
        
        // Restaurar posição do scroll após carregar os dados
        setTimeout(() => {
          restoreScrollPosition();
        }, 200);
        
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
  }, [seasonId, calculateJackpotWinners, calculatePlayerStats, navigate, toast, restoreScrollPosition, saveScrollPosition]);
  
  // Memoizar rankings ordenados
  const sortedRankings = useMemo(() => {
    return [...rankings].sort((a, b) => b.totalPoints - a.totalPoints);
  }, [rankings]);
  
  // Memoizar cálculo do jackpot para exibição
  const totalJackpotForDisplay = useMemo(() => {
    if (!season) return 0;
    
    if (season.isActive) {
      return season.jackpot;
    }
    
    // Para temporadas encerradas, calcular com base na contribuição real do jackpot
    return games.reduce((total, game) => {
      const playerCount = game.players.length;
      const jackpotContribution = season.financialParams.jackpotContribution || 0;
      return total + (playerCount * jackpotContribution);
    }, 0);
  }, [season, games]);

  // Salvar scroll position quando o usuário faz scroll
  useEffect(() => {
    const handleScroll = () => {
      saveScrollPosition();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [saveScrollPosition]);
  
  if (loading) {
    return <div className="text-center text-white">Carregando detalhes da temporada...</div>;
  }
  
  if (!season) {
    return <div className="text-center text-white">Temporada não encontrada.</div>;
  }
  
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
                        <span>Jackpot Total: {formatCurrency(totalJackpotForDisplay)}</span>
                      </div>

                      {/* Lista de ganhadores do jackpot CORRIGIDA */}
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
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="flex justify-between items-center text-xs font-semibold">
                              <span className="text-gray-700">Total Distribuído:</span>
                              <span className="text-poker-gold">
                                {formatCurrency(jackpotWinners.reduce((sum, w) => sum + w.jackpotAmount, 0))}
                              </span>
                            </div>
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

                {/* Nova seção: Desempenho dos Jogadores */}
                <Card>
                  <CardHeader>
                    <CardTitle>Desempenho dos Jogadores</CardTitle>
                    <CardDescription>
                      Estatísticas detalhadas de performance dos jogadores durante a temporada.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {statsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-poker-gold mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Carregando estatísticas...</p>
                      </div>
                    ) : (
                      <PlayerPerformanceTable playerStats={detailedPlayerStats} />
                    )}
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
