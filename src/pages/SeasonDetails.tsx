
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Image, ArrowLeft, Calendar, Trophy, Users, Settings } from "lucide-react";
import { pokerDB } from "@/lib/db";
import { Game, RankingEntry, Season } from "@/lib/db/models";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils/dateUtils";
import { RankingTable } from "@/components/ranking/RankingTable";
import { RankingExporter } from "@/components/ranking/RankingExporter";
import PlayerPerformanceTable from "@/components/reports/PlayerPerformanceTable";
import SeasonPrizePoolSummary from "@/components/reports/SeasonPrizePoolSummary";
import JackpotWinnersCard from "@/components/reports/JackpotWinnersCard";
import BestWorstPlayersCard from "@/components/reports/BestWorstPlayersCard";
import { PlayerPerformanceStats, SeasonSummary } from "@/hooks/reports/types";
import { useReportExport } from "@/hooks/reports/useReportExport";

export default function SeasonDetails() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [season, setSeason] = useState<Season | null>(null);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerStats, setPlayerStats] = useState<PlayerPerformanceStats[]>([]);
  const [seasonSummary, setSeasonSummary] = useState<SeasonSummary>({
    totalGames: 0,
    totalPlayers: 0,
    totalPrizePool: 0,
    totalBuyIns: 0,
    totalRebuys: 0,
    totalAddons: 0
  });
  const [jackpotWinners, setJackpotWinners] = useState<any[]>([]);
  
  // For ranking pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Report export functionality
  const { 
    isExporting, 
    isExportingImage, 
    exportReportAsPdf, 
    exportReportAsImage 
  } = useReportExport();
  
  // Load season data
  useEffect(() => {
    const loadSeasonDetails = async () => {
      if (!seasonId) return;
      
      try {
        setLoading(true);
        
        // Load season
        const seasonData = await pokerDB.getSeason(seasonId);
        if (!seasonData) {
          toast({
            title: "Temporada não encontrada",
            description: "A temporada solicitada não foi encontrada.",
            variant: "destructive",
          });
          navigate("/seasons");
          return;
        }
        setSeason(seasonData);
        
        // Load rankings
        const rankingsData = await pokerDB.getRankings(seasonId);
        const sortedRankings = [...rankingsData].sort((a, b) => b.totalPoints - a.totalPoints);
        setRankings(sortedRankings);
        
        // Load games
        const gamesData = await pokerDB.getGames(seasonId);
        const sortedGames = [...gamesData].sort((a, b) => b.number - a.number);
        setGames(sortedGames);
        
        // Calculate season summary
        const finishedGames = sortedGames.filter(game => game.isFinished);
        const summary: SeasonSummary = {
          totalGames: finishedGames.length,
          totalPlayers: 0,
          totalPrizePool: finishedGames.reduce((sum, game) => sum + game.totalPrizePool, 0),
          totalBuyIns: 0,
          totalRebuys: 0,
          totalAddons: 0
        };
        
        // Calculate players and financial stats
        const uniquePlayers = new Set<string>();
        const playerStatsMap = new Map<string, PlayerPerformanceStats>();
        
        // Calculate values from financial params
        const buyInValue = seasonData.financialParams.buyIn;
        const rebuyValue = seasonData.financialParams.rebuy;
        const addonValue = seasonData.financialParams.addon;
        
        finishedGames.forEach(game => {
          // Process financial summary
          const gameBuyIns = game.players.filter(p => p.buyIn).length * buyInValue;
          const gameRebuys = game.players.reduce((sum, p) => sum + p.rebuys, 0) * rebuyValue;
          const gameAddons = game.players.reduce((sum, p) => sum + p.addons, 0) * addonValue;
          
          summary.totalBuyIns += gameBuyIns;
          summary.totalRebuys += gameRebuys;
          summary.totalAddons += gameAddons;
          
          // Process player stats
          game.players.forEach(gamePlayer => {
            // Add to unique players
            uniquePlayers.add(gamePlayer.playerId);
            
            // Update player stats
            let playerStat = playerStatsMap.get(gamePlayer.playerId);
            if (!playerStat) {
              playerStat = {
                playerId: gamePlayer.playerId,
                playerName: gamePlayer.playerName,
                photoUrl: gamePlayer.photoUrl,
                gamesPlayed: 0,
                victories: 0,
                averagePosition: 0,
                totalWinnings: 0,
                totalInvestment: 0,
                balance: 0,
                totalPoints: 0,
                totalRebuys: 0
              };
              playerStatsMap.set(gamePlayer.playerId, playerStat);
            }
            
            // Update player stats
            playerStat.gamesPlayed++;
            if (gamePlayer.position === 1) playerStat.victories++;
            if (gamePlayer.position) {
              playerStat.averagePosition = 
                (playerStat.averagePosition * (playerStat.gamesPlayed - 1) + gamePlayer.position) / 
                playerStat.gamesPlayed;
            }
            
            // Financial stats
            playerStat.totalWinnings += gamePlayer.prize || 0;
            const investment = 
              (gamePlayer.buyIn ? buyInValue : 0) + 
              (gamePlayer.rebuys * rebuyValue) + 
              (gamePlayer.addons * addonValue);
            playerStat.totalInvestment += investment;
            playerStat.balance = playerStat.totalWinnings - playerStat.totalInvestment;
            playerStat.totalPoints += gamePlayer.points || 0;
            playerStat.totalRebuys += gamePlayer.rebuys || 0;
          });
        });
        
        // Update total players count
        summary.totalPlayers = uniquePlayers.size;
        
        // Sort player stats by balance
        const playerStatsArray = Array.from(playerStatsMap.values())
          .sort((a, b) => b.balance - a.balance);
        
        setPlayerStats(playerStatsArray);
        setSeasonSummary(summary);
        
        // Calculate jackpot winners based on the seasonPrizeSchema
        if (seasonData.jackpot > 0 && seasonData.endDate) {
          const prizeSchema = seasonData.seasonPrizeSchema;
          const totalJackpot = seasonData.jackpot;
          
          const winners = sortedRankings.slice(0, prizeSchema.length).map((ranking, index) => {
            const prizeEntry = prizeSchema[index];
            return {
              playerId: ranking.playerId,
              playerName: ranking.playerName,
              photoUrl: ranking.photoUrl,
              position: prizeEntry.position,
              jackpotAmount: (totalJackpot * prizeEntry.percentage) / 100
            };
          });
          
          setJackpotWinners(winners);
        }
        
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
  
  // Helper functions for ranking display
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
  
  // Export report functions
  const handleExportPdf = async () => {
    try {
      await exportReportAsPdf(
        'season-report',
        `Relatório_Temporada_${season?.name || 'Anterior'}.pdf`
      );
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  };
  
  const handleExportImage = async () => {
    try {
      await exportReportAsImage(
        'season-report',
        `Relatório_Temporada_${season?.name || 'Anterior'}.png`
      );
    } catch (error) {
      console.error("Error exporting image:", error);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Carregando detalhes da temporada...</p>
      </div>
    );
  }
  
  if (!season) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Temporada não encontrada</h2>
        <Button onClick={() => navigate('/seasons')}>Voltar para Temporadas</Button>
      </div>
    );
  }
  
  // Calculate pagination
  const totalPages = Math.ceil(rankings.length / pageSize);
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/seasons')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Temporadas
            </Button>
            <h2 className="text-2xl font-bold text-white">
              {season.name} 
              {season.endDate && <span className="ml-2 text-sm bg-gray-600 text-white px-2 py-1 rounded-full">Encerrada</span>}
            </h2>
            <p className="text-muted-foreground">
              {formatDate(season.startDate)} - {season.endDate ? formatDate(season.endDate) : 'Atual'}
            </p>
          </div>
          
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button
              onClick={handleExportPdf}
              disabled={isExporting}
              variant="outline"
              size="sm"
            >
              {isExporting ? "Exportando..." : "Exportar PDF"}
              <FileText className="ml-2 h-4 w-4" />
            </Button>
            
            <Button
              onClick={handleExportImage}
              disabled={isExportingImage}
              variant="outline"
              size="sm"
            >
              {isExportingImage ? "Exportando..." : "Exportar Imagem"}
              <Image className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="overview">
              <Trophy className="h-4 w-4 mr-2" />
              Resumo
            </TabsTrigger>
            <TabsTrigger value="ranking">
              <Users className="h-4 w-4 mr-2" />
              Ranking
            </TabsTrigger>
            <TabsTrigger value="games">
              <Calendar className="h-4 w-4 mr-2" />
              Partidas
            </TabsTrigger>
            <TabsTrigger value="config">
              <Settings className="h-4 w-4 mr-2" />
              Configuração
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div id="season-report" className="space-y-6">
              {/* Resumo da Temporada */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Resumo da Temporada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-poker-green/30 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total de Partidas</p>
                      <p className="text-2xl font-bold">{seasonSummary.totalGames}</p>
                    </div>
                    
                    <div className="bg-poker-green/30 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total de Jogadores</p>
                      <p className="text-2xl font-bold">{seasonSummary.totalPlayers}</p>
                    </div>
                    
                    <div className="bg-poker-green/30 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Premiação</p>
                      <p className="text-2xl font-bold text-poker-gold">
                        {formatCurrency(seasonSummary.totalPrizePool)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Card de Destaques (Melhor Jogador e Rey do Rebuy) */}
              {playerStats.length > 0 && (
                <BestWorstPlayersCard playerStats={playerStats} />
              )}
              
              {/* Card de Ganhadores do Jackpot */}
              {jackpotWinners.length > 0 && (
                <JackpotWinnersCard 
                  jackpotWinners={jackpotWinners} 
                  totalJackpot={season.jackpot || 0}
                />
              )}
              
              {/* Resumo financeiro da temporada */}
              <SeasonPrizePoolSummary seasonSummary={seasonSummary} />
              
              {/* Tabela de desempenho dos jogadores */}
              <PlayerPerformanceTable playerStats={playerStats} />
            </div>
          </TabsContent>
          
          <TabsContent value="ranking">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Classificação Final</CardTitle>
                <RankingExporter
                  sortedRankings={rankings}
                  activeSeason={season}
                  getInitials={getInitials}
                  getMedalEmoji={getMedalEmoji}
                />
              </CardHeader>
              <CardContent>
                <RankingTable
                  sortedRankings={rankings}
                  currentPage={currentPage}
                  pageSize={pageSize}
                  getInitials={getInitials}
                  getMedalEmoji={getMedalEmoji}
                />
                
                {totalPages > 1 && (
                  <div className="flex justify-center mt-4">
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        &lt;
                      </Button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        &gt;
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="games">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Partidas da Temporada</CardTitle>
              </CardHeader>
              <CardContent>
                {games.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {games.map(game => (
                      <Card key={game.id} className="bg-poker-green/10">
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
                    <p className="text-muted-foreground">Nenhuma partida registrada nesta temporada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="config">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Configuração da Temporada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Parâmetros Financeiros</h3>
                    <div className="grid grid-cols-2 gap-2 bg-poker-green/10 p-3 rounded-md">
                      <div>
                        <p className="text-sm text-muted-foreground">Buy-in</p>
                        <p className="font-medium">{formatCurrency(season.financialParams.buyIn)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Re-buy</p>
                        <p className="font-medium">{formatCurrency(season.financialParams.rebuy)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Add-on</p>
                        <p className="font-medium">{formatCurrency(season.financialParams.addon)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Contribuição Jackpot</p>
                        <p className="font-medium">{formatCurrency(season.financialParams.jackpotContribution)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Jackpot Final</h3>
                    <div className="bg-poker-green/10 p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">Valor Total</p>
                      <p className="text-xl font-bold text-poker-gold">{formatCurrency(season.jackpot)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Esquema de Pontuação</h3>
                  <div className="bg-poker-green/10 p-3 rounded-md">
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {season.scoreSchema.map((entry, index) => (
                        <div key={index} className="text-center">
                          <p className="text-sm text-muted-foreground">Posição {entry.position}</p>
                          <p className="font-medium">{entry.points} pontos</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Esquema de Premiação Final</h3>
                  <div className="bg-poker-green/10 p-3 rounded-md">
                    <div className="grid grid-cols-3 gap-2">
                      {season.seasonPrizeSchema.map((entry, index) => (
                        <div key={index} className="text-center">
                          <p className="text-sm text-muted-foreground">
                            {entry.position === 1 ? '🥇' : entry.position === 2 ? '🥈' : entry.position === 3 ? '🥉' : `${entry.position}º`}
                          </p>
                          <p className="font-medium">{entry.percentage}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
