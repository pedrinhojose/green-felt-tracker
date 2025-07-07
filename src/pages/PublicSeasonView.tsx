import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, DollarSign } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils/dateUtils";
import { Season, Game, RankingEntry } from "@/lib/db/models";
import { supabase } from "@/integrations/supabase/client";

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

  // Calcular estatísticas
  const totalJackpot = season.jackpot;
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
              {rankings.slice(0, 10).map((player, index) => (
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
            
            {rankings.length > 10 && (
              <p className="text-center text-muted-foreground mt-4 text-sm">
                ... e mais {rankings.length - 10} jogadores
              </p>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>Temporada: {formatDate(season.startDate)} - {season.endDate ? formatDate(season.endDate) : "Em andamento"}</p>
        </div>
      </div>
    </div>
  );
}