import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Users, Calendar, DollarSign, BarChart3 } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils/dateUtils";
import { Season, Game, RankingEntry } from "@/lib/db/models";
import { supabase } from "@/integrations/supabase/client";

interface PlayerPerformanceStats {
  playerId: string;
  playerName: string;
  gamesPlayed: number;
  victories: number;
  averagePosition: number;
  totalWinnings: number;
  totalInvestment: number;
  balance: number;
  totalPoints: number;
  totalRebuys: number;
  photoUrl?: string;
  roi: number;
  winRate: number;
  itmRate: number;
  biggestPrize: number;
}

export default function PublicSeasonView() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [season, setSeason] = useState<Season | null>(null);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPublicSeasonData = async () => {
      if (!shareToken) {
        setError("Token de compartilhamento não fornecido");
        setLoading(false);
        return;
      }

      try {
        // Buscar temporada pelo token público
        const { data: seasonData, error: seasonError } = await supabase
          .from('seasons')
          .select('*')
          .eq('public_share_token', shareToken)
          .single();

        if (seasonError || !seasonData) {
          setError("Temporada não encontrada ou link inválido");
          setLoading(false);
          return;
        }

        // Buscar rankings da temporada
        const { data: rankingsData, error: rankingsError } = await supabase
          .from('rankings')
          .select('*')
          .eq('season_id', seasonData.id)
          .order('total_points', { ascending: false });

        // Buscar jogos da temporada para estatísticas
        const { data: gamesData, error: gamesError } = await supabase
          .from('games')
          .select('*')
          .eq('season_id', seasonData.id);

        if (rankingsError || gamesError) {
          console.error('Erro ao carregar dados:', { rankingsError, gamesError });
        }

        // Converter dados do Supabase para tipos do modelo
        const convertedSeason: Season = {
          id: seasonData.id,
          name: seasonData.name,
          startDate: new Date(seasonData.start_date),
          endDate: seasonData.end_date ? new Date(seasonData.end_date) : null,
          isActive: seasonData.is_active,
          jackpot: seasonData.jackpot,
          gamesPerWeek: seasonData.games_per_week,
          
          createdAt: new Date(seasonData.created_at),
          houseRules: seasonData.house_rules || '',
          scoreSchema: seasonData.score_schema as any,
          seasonPrizeSchema: seasonData.season_prize_schema as any,
          weeklyPrizeSchema: seasonData.weekly_prize_schema as any,
          financialParams: seasonData.financial_params as any,
          blindStructure: seasonData.blind_structure as any
        };

        const convertedRankings: RankingEntry[] = (rankingsData || []).map(r => ({
          id: r.id,
          playerId: r.player_id,
          playerName: r.player_name,
          seasonId: r.season_id,
          totalPoints: r.total_points,
          gamesPlayed: r.games_played,
          bestPosition: r.best_position,
          userId: r.user_id,
          organizationId: r.organization_id,
          photoUrl: r.photo_url
        }));

        const convertedGames: Game[] = (gamesData || []).map(g => ({
          id: g.id,
          number: g.number,
          date: new Date(g.date),
          seasonId: g.season_id,
          players: g.players as any,
          totalPrizePool: g.total_prize_pool,
          dinnerCost: g.dinner_cost,
          isFinished: g.is_finished,
          userId: g.user_id,
          organizationId: g.organization_id,
          createdAt: new Date(g.created_at)
        }));

        setSeason(convertedSeason);
        setRankings(convertedRankings);
        setGames(convertedGames);
      } catch (error) {
        console.error('Erro ao carregar temporada pública:', error);
        setError("Erro ao carregar dados da temporada");
      } finally {
        setLoading(false);
      }
    };

    loadPublicSeasonData();
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !season) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Oops!</h2>
            <p className="text-muted-foreground">{error || "Temporada não encontrada"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcular jackpot correto (para temporadas encerradas com jackpot zerado)
  const totalJackpot = useMemo(() => {
    if (season.isActive || season.jackpot > 0) {
      return season.jackpot;
    }
    
    // Para temporadas encerradas com jackpot zerado, calcular baseado na contribuição real
    return games.reduce((total, game) => {
      const playerCount = game.players?.length || 0;
      const jackpotContribution = season.financialParams?.jackpotContribution || 0;
      return total + (playerCount * jackpotContribution);
    }, 0);
  }, [season, games]);

  // Calcular estatísticas dos jogadores
  const playerStats = useMemo(() => {
    if (rankings.length === 0 && games.length === 0) {
      return [];
    }

    const finishedGames = games.filter(game => game.isFinished);
    const buyInValue = season?.financialParams?.buyIn || 0;
    const rebuyValue = season?.financialParams?.rebuy || 0;
    const addonValue = season?.financialParams?.addon || 0;
    const weeklyPrizePositions = season?.weeklyPrizeSchema?.length || 3;

    const playerStatsMap = new Map<string, PlayerPerformanceStats>();

    // Criar estatísticas baseadas no ranking
    rankings.forEach(ranking => {
      playerStatsMap.set(ranking.playerId, {
        playerId: ranking.playerId,
        playerName: ranking.playerName,
        photoUrl: ranking.photoUrl,
        gamesPlayed: ranking.gamesPlayed,
        victories: 0,
        averagePosition: 0,
        totalWinnings: 0,
        totalInvestment: 0,
        balance: 0,
        totalPoints: ranking.totalPoints,
        totalRebuys: 0,
        roi: 0,
        winRate: 0,
        itmRate: 0,
        biggestPrize: 0
      });
    });

    // Calcular dados financeiros e outras estatísticas dos jogos
    finishedGames.forEach(game => {
      game.players.forEach(gamePlayer => {
        let playerStat = playerStatsMap.get(gamePlayer.playerId);
        
        if (!playerStat) return; // Skip se jogador não está no ranking
        
        // Verificar se o jogador venceu esta partida
        if (gamePlayer.position === 1) {
          playerStat.victories++;
        }
        
        // Calcular ganhos (prêmios)
        const prize = gamePlayer.prize || 0;
        playerStat.totalWinnings += prize;
        
        // Atualizar maior prêmio
        if (prize > playerStat.biggestPrize) {
          playerStat.biggestPrize = prize;
        }
        
        // Calcular investimento (buy-in + rebuys + add-ons)
        const investment = 
          (gamePlayer.buyIn ? buyInValue : 0) + 
          (gamePlayer.rebuys * rebuyValue) + 
          (gamePlayer.addons * addonValue);
        
        playerStat.totalInvestment += investment;
        
        // Adicionar rebuys
        playerStat.totalRebuys += gamePlayer.rebuys || 0;
      });
    });

    // Calcular métricas finais para cada jogador
    playerStatsMap.forEach((playerStat, playerId) => {
      const playerGames = finishedGames
        .flatMap(game => game.players)
        .filter(gamePlayer => gamePlayer.playerId === playerId && gamePlayer.position);
      
      // Calcular posição média
      if (playerGames.length > 0) {
        const totalPositions = playerGames.reduce((sum, gamePlayer) => 
          sum + (gamePlayer.position || 0), 0);
        playerStat.averagePosition = totalPositions / playerGames.length;
      }
      
      // Calcular saldo final
      playerStat.balance = playerStat.totalWinnings - playerStat.totalInvestment;
      
      // Calcular ROI (Return on Investment)
      if (playerStat.totalInvestment > 0) {
        playerStat.roi = ((playerStat.totalWinnings - playerStat.totalInvestment) / playerStat.totalInvestment) * 100;
      }
      
      // Calcular taxa de vitórias
      if (playerStat.gamesPlayed > 0) {
        playerStat.winRate = (playerStat.victories / playerStat.gamesPlayed) * 100;
      }
      
      // Calcular taxa de ITM (In The Money)
      if (playerStat.gamesPlayed > 0) {
        const itmCount = playerGames.filter(gamePlayer => 
          gamePlayer.position && gamePlayer.position <= weeklyPrizePositions
        ).length;
        playerStat.itmRate = (itmCount / playerStat.gamesPlayed) * 100;
      }
    });

    return Array.from(playerStatsMap.values())
      .sort((a, b) => b.totalPoints - a.totalPoints);
  }, [season, games, rankings]);

  const totalGames = games.length;
  const totalPlayers = rankings.length;

  // Calcular ganhadores do jackpot
  const jackpotWinners = [];
  if (season.seasonPrizeSchema && Array.isArray(season.seasonPrizeSchema)) {
    const sortedRankings = [...rankings].sort((a, b) => b.totalPoints - a.totalPoints);
    
    for (let i = 0; i < Math.min(season.seasonPrizeSchema.length, sortedRankings.length); i++) {
      const prizeEntry = season.seasonPrizeSchema[i];
      const ranking = sortedRankings[i];
      
      if (prizeEntry && ranking && prizeEntry.percentage > 0) {
        jackpotWinners.push({
          playerName: ranking.playerName,
          position: i + 1,
          jackpotAmount: (totalJackpot * prizeEntry.percentage) / 100
        });
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{season.name}</h1>
            <p className="opacity-90">Ranking e Estatísticas</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Jackpot</p>
              <p className="font-semibold text-sm">{formatCurrency(totalJackpot)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Jogadores</p>
              <p className="font-semibold text-sm">{totalPlayers}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Partidas</p>
              <p className="font-semibold text-sm">{totalGames}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="font-semibold text-sm">{season.isActive ? "Ativa" : "Finalizada"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Ganhadores do Jackpot */}
        {jackpotWinners.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                Premiação do Jackpot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 text-center p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-lg border border-yellow-500/20">
                <p className="text-sm text-muted-foreground mb-2">Valor Total do Jackpot</p>
                <p className="text-3xl font-bold text-yellow-500">{formatCurrency(totalJackpot)}</p>
              </div>
              
              <div className="space-y-3">
                {jackpotWinners.map((winner, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}º`}
                      </span>
                      <span className="font-medium">{winner.playerName}</span>
                    </div>
                    <span className="font-bold text-primary">
                      {formatCurrency(winner.jackpotAmount)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ranking Geral */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ranking Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rankings.map((player, index) => (
                <div key={player.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center">
                    <span className="font-semibold mr-3 min-w-[2rem]">
                      {index + 1}º
                    </span>
                    <div className="flex items-center">
                      {player.photoUrl ? (
                        <img 
                          src={player.photoUrl} 
                          alt={player.playerName} 
                          className="w-8 h-8 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                          <span className="text-xs font-semibold">
                            {player.playerName.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="font-medium">{player.playerName}</span>
                    </div>
                  </div>
                  <span className="font-bold text-primary">{player.totalPoints} pts</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Desempenho dos Jogadores */}
        {playerStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                Desempenho dos Jogadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left">Jogador</TableHead>
                      <TableHead className="text-center w-12">J</TableHead>
                      <TableHead className="text-center w-12">V</TableHead>
                      <TableHead className="text-center w-12">RB</TableHead>
                      <TableHead className="text-center w-16">Pos.Med</TableHead>
                      <TableHead className="text-center w-16">Pontos</TableHead>
                      <TableHead className="text-right w-20">Ganhos</TableHead>
                      <TableHead className="text-right w-20">Perdas</TableHead>
                      <TableHead className="text-right w-20">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {playerStats.map((player) => (
                      <TableRow key={player.playerId}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {player.photoUrl ? (
                              <img 
                                src={player.photoUrl} 
                                alt={player.playerName} 
                                className="w-6 h-6 rounded-full mr-2"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                                <span className="text-xs font-semibold">
                                  {player.playerName.charAt(0)}
                                </span>
                              </div>
                            )}
                            {player.playerName}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{player.gamesPlayed}</TableCell>
                        <TableCell className="text-center">{player.victories}</TableCell>
                        <TableCell className="text-center">{player.totalRebuys}</TableCell>
                        <TableCell className="text-center">
                          {player.averagePosition > 0 
                            ? player.averagePosition.toFixed(1) 
                            : "-"}
                        </TableCell>
                        <TableCell className="text-center font-semibold text-primary">
                          {player.totalPoints || 0}
                        </TableCell>
                        <TableCell className="text-right text-green-600 font-medium">
                          {formatCurrency(player.totalWinnings)}
                        </TableCell>
                        <TableCell className="text-right text-red-600 font-medium">
                          {formatCurrency(player.totalInvestment)}
                        </TableCell>
                        <TableCell 
                          className={`text-right font-semibold ${
                            player.balance >= 0 ? 'text-blue-600' : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(player.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>Temporada: {formatDate(season.startDate)} - {season.endDate ? formatDate(season.endDate) : "Em andamento"}</p>
        </div>
      </div>
    </div>
  );
}