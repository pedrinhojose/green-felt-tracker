
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Image, ArrowLeft } from "lucide-react";
import { Season, Game, RankingEntry, Player } from "@/lib/db/models";
import { pokerDB } from "@/lib/db";
import { useIsMobile } from "@/hooks/use-mobile";
import PlayerPerformanceTable from "@/components/reports/PlayerPerformanceTable";
import SeasonPrizePoolSummary from "@/components/reports/SeasonPrizePoolSummary";
import JackpotWinnersCard from "@/components/reports/JackpotWinnersCard";
import BestWorstPlayersCard from "@/components/reports/BestWorstPlayersCard";
import { PlayerPerformanceStats, SeasonSummary, JackpotWinner } from "@/hooks/useSeasonReport";
import { useReportExport } from "@/hooks/reports/useReportExport";

export default function SeasonReportById() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [season, setSeason] = useState<Season | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerStats, setPlayerStats] = useState<PlayerPerformanceStats[]>([]);
  const [seasonSummary, setSeasonSummary] = useState<SeasonSummary | null>(null);
  const [jackpotWinners, setJackpotWinners] = useState<JackpotWinner[]>([]);
  
  const { isExporting, isExportingImage, exportReportAsPdf, exportReportAsImage } = useReportExport();
  
  useEffect(() => {
    if (!seasonId) return;
    
    const loadSeasonReportData = async () => {
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
        
        setSeason(seasonData);
        
        // Carregar jogos, rankings e jogadores
        const [gamesData, rankingsData, playersData] = await Promise.all([
          pokerDB.getGames(seasonId),
          pokerDB.getRankings(seasonId),
          pokerDB.getPlayers()
        ]);
        
        setGames(gamesData);
        setRankings(rankingsData);
        setPlayers(playersData);
        
        // Calcular estatísticas dos jogadores
        const stats = calculatePlayerStats(gamesData, rankingsData, playersData);
        setPlayerStats(stats);
        
        // Calcular resumo da temporada
        const summary = calculateSeasonSummary(gamesData);
        setSeasonSummary(summary);
        
        // Calcular ganhadores do jackpot
        const winners = calculateJackpotWinners(seasonData, rankingsData, playersData);
        setJackpotWinners(winners);
        
      } catch (error) {
        console.error("Error loading season report data:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do relatório.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadSeasonReportData();
  }, [seasonId, navigate, toast]);
  
  const calculatePlayerStats = (gamesData: Game[], rankingsData: RankingEntry[], playersData: Player[]): PlayerPerformanceStats[] => {
    const playerStatsMap = new Map<string, PlayerPerformanceStats>();
    
    // Processar cada jogo para calcular estatísticas
    gamesData.forEach(game => {
      game.players.forEach(gamePlayer => {
        const rankingPlayer = rankingsData.find(r => r.playerId === gamePlayer.playerId);
        const playerData = playersData.find(p => p.id === gamePlayer.playerId);
        
        if (!rankingPlayer || !playerData) return;
        
        let playerStat = playerStatsMap.get(gamePlayer.playerId);
        if (!playerStat) {
          playerStat = {
            playerId: gamePlayer.playerId,
            playerName: playerData.name,
            photoUrl: playerData.photoUrl,
            gamesPlayed: 0,
            victories: 0,
            averagePosition: 0,
            totalWinnings: 0,
            totalInvestment: 0,
            balance: 0,
            totalPoints: rankingPlayer.totalPoints,
            totalRebuys: 0,
            roi: 0,
            winRate: 0,
            itmRate: 0,
            biggestPrize: 0
          };
          playerStatsMap.set(gamePlayer.playerId, playerStat);
        }
        
        // Atualizar estatísticas
        playerStat.gamesPlayed++;
        
        if (gamePlayer.position === 1) {
          playerStat.victories++;
        }
        
        // Calcular gastos e ganhos
        const totalSpent = (gamePlayer.buyIn ? 1 : 0) + (gamePlayer.rebuys || 0) + (gamePlayer.addons || 0);
        playerStat.totalInvestment += totalSpent;
        playerStat.totalWinnings += gamePlayer.prize || 0;
        playerStat.totalRebuys += gamePlayer.rebuys || 0;
        
        if (gamePlayer.prize && gamePlayer.prize > playerStat.biggestPrize) {
          playerStat.biggestPrize = gamePlayer.prize;
        }
      });
    });
    
    // Calcular médias e estatísticas finais
    Array.from(playerStatsMap.values()).forEach(playerStat => {
      const playerGames = gamesData
        .flatMap(game => game.players)
        .filter(player => player.playerId === playerStat.playerId);
      
      if (playerGames.length) {
        const sum = playerGames.reduce((acc, curr) => acc + curr.position, 0);
        playerStat.averagePosition = sum / playerGames.length;
      }
      
      playerStat.balance = playerStat.totalWinnings - playerStat.totalInvestment;
      playerStat.roi = playerStat.totalInvestment > 0 ? (playerStat.balance / playerStat.totalInvestment) * 100 : 0;
      playerStat.winRate = playerStat.gamesPlayed > 0 ? (playerStat.victories / playerStat.gamesPlayed) * 100 : 0;
      
      // Calculate ITM rate (assuming top 3 positions are "in the money")
      const itmCount = playerGames.filter(game => game.position <= 3).length;
      playerStat.itmRate = playerStat.gamesPlayed > 0 ? (itmCount / playerStat.gamesPlayed) * 100 : 0;
    });
    
    return Array.from(playerStatsMap.values()).sort((a, b) => b.totalPoints - a.totalPoints);
  };
  
  const calculateSeasonSummary = (gamesData: Game[]): SeasonSummary => {
    const totalGames = gamesData.length;
    const totalPlayers = new Set(gamesData.flatMap(game => game.players.map(p => p.playerId))).size;
    const totalPrizePool = gamesData.reduce((sum, game) => sum + game.totalPrizePool, 0);
    const totalBuyIns = gamesData.reduce((sum, game) => 
      sum + game.players.reduce((gameSum, player) => gameSum + (player.buyIn ? 1 : 0), 0), 0);
    const totalRebuys = gamesData.reduce((sum, game) => 
      sum + game.players.reduce((gameSum, player) => gameSum + (player.rebuys || 0), 0), 0);
    const totalAddons = gamesData.reduce((sum, game) => 
      sum + game.players.reduce((gameSum, player) => gameSum + (player.addons || 0), 0), 0);
    const totalDinnerCost = gamesData.reduce((sum, game) => sum + (game.dinnerCost || 0), 0);
    
    return {
      totalGames,
      totalPlayers,
      totalPrizePool,
      totalBuyIns,
      totalRebuys,
      totalAddons,
      totalDinnerCost
    };
  };
  
  const calculateJackpotWinners = (season: Season, rankingsData: RankingEntry[], playersData: Player[]): JackpotWinner[] => {
    if (!season.seasonPrizeSchema || rankingsData.length === 0) {
      return [];
    }
    
    const sortedRankings = [...rankingsData].sort((a, b) => b.totalPoints - a.totalPoints);
    const winners: JackpotWinner[] = [];
    const totalJackpot = season.jackpot;
    
    for (let i = 0; i < Math.min(season.seasonPrizeSchema.length, sortedRankings.length); i++) {
      const prizeEntry = season.seasonPrizeSchema[i];
      const ranking = sortedRankings[i];
      
      if (prizeEntry && ranking) {
        const playerData = playersData.find(p => p.id === ranking.playerId);
        let photoUrl: string | undefined = undefined;
        
        if (playerData?.photoUrl) {
          if (typeof playerData.photoUrl === 'string') {
            photoUrl = playerData.photoUrl;
          } else if (typeof playerData.photoUrl === 'object' && playerData.photoUrl !== null && 'value' in playerData.photoUrl) {
            const urlValue = (playerData.photoUrl as any).value;
            photoUrl = urlValue !== 'undefined' ? urlValue : undefined;
          }
        }
        
        winners.push({
          playerId: ranking.playerId,
          playerName: ranking.playerName,
          photoUrl: photoUrl,
          position: prizeEntry.position,
          jackpotAmount: (totalJackpot * prizeEntry.percentage) / 100
        });
      }
    }
    
    return winners;
  };
  
  const handleExportPdf = async () => {
    if (!season) return;
    
    await exportReportAsPdf(
      season.name || 'Temporada',
      seasonSummary,
      jackpotWinners,
      season.jackpot,
      playerStats,
      `Relatorio_Temporada_${season.name?.replace(/\s+/g, '_') || 'Temporada'}.pdf`
    );
  };
  
  const handleExportImage = async () => {
    if (!season) return;
    
    await exportReportAsImage(
      'season-report-by-id',
      `Relatorio_Temporada_${season.name?.replace(/\s+/g, '_') || 'Temporada'}.png`
    );
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-poker-gold mx-auto mb-4"></div>
        <h2 className="text-xl text-white">Carregando relatório...</h2>
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
  
  return (
    <div className={`container mx-auto ${isMobile ? 'px-1 py-2' : 'px-4 py-6'}`}>
      <div className="flex flex-col space-y-4">
        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center ${isMobile ? 'px-2' : ''}`}>
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
            <h2 className={`font-bold text-white ${isMobile ? 'text-lg' : 'text-2xl'}`}>
              Relatório da Temporada: {season.name}
            </h2>
          </div>
          
          <div className={`flex gap-2 mt-4 sm:mt-0 ${isMobile ? 'w-full' : ''}`}>
            <Button
              onClick={handleExportPdf}
              disabled={isExporting}
              variant="outline"
              size="sm"
              className={isMobile ? 'flex-1' : ''}
            >
              {isExporting ? "Exportando..." : "Exportar PDF"}
              <FileText className="ml-2 h-4 w-4" />
            </Button>
            
            <Button
              onClick={handleExportImage}
              disabled={isExportingImage}
              variant="outline"
              size="sm"
              className={isMobile ? 'flex-1' : ''}
            >
              {isExportingImage ? "Exportando..." : "Exportar Imagem"}
              <Image className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div id="season-report-by-id" className={`space-y-4 ${isMobile ? 'px-1' : ''}`}>
          {/* Resumo da Temporada */}
          <Card>
            <CardHeader className={isMobile ? 'pb-3' : ''}>
              <CardTitle className={isMobile ? "text-base" : "text-xl"}>Resumo da Temporada</CardTitle>
            </CardHeader>
            <CardContent className={isMobile ? 'pt-0' : ''}>
              <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
                <div className="bg-poker-green/30 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total de Partidas</p>
                  <p className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                    {seasonSummary?.totalGames || 0}
                  </p>
                </div>
                
                <div className="bg-poker-green/30 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total de Jogadores</p>
                  <p className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                    {seasonSummary?.totalPlayers || 0}
                  </p>
                </div>
                
                <div className="bg-poker-green/30 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Premiação</p>
                  <p className={`font-bold text-poker-gold ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(seasonSummary?.totalPrizePool || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Card de Destaques */}
          <BestWorstPlayersCard playerStats={playerStats} />
          
          {/* Card de Ganhadores do Jackpot */}
          <JackpotWinnersCard 
            jackpotWinners={jackpotWinners} 
            totalJackpot={season.jackpot}
          />
          
          {/* Resumo financeiro da temporada */}
          {seasonSummary && <SeasonPrizePoolSummary seasonSummary={seasonSummary} />}
          
          {/* Tabela de desempenho dos jogadores */}
          <PlayerPerformanceTable playerStats={playerStats} />
        </div>
      </div>
    </div>
  );
}
