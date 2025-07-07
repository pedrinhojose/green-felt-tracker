import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Users, Calendar, DollarSign, Utensils } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils/dateUtils";
import { Game, Player, RankingEntry } from "@/lib/db/models";
import { supabase } from "@/integrations/supabase/client";

export default function PublicGameView() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRankings, setLoadingRankings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPublicGameData = async () => {
      if (!shareToken) {
        setError("Token de compartilhamento não fornecido");
        setLoading(false);
        return;
      }

      try {
        // Buscar partida pelo token público
        const { data: gameData, error: gameError } = await supabase
          .from('games')
          .select('*')
          .eq('public_share_token', shareToken)
          .single();

        if (gameError || !gameData) {
          setError("Partida não encontrada ou link inválido");
          setLoading(false);
          return;
        }

        // Buscar dados dos jogadores
        const playerIds = Array.isArray(gameData.players) ? gameData.players.map((p: any) => p.playerId) : [];
        let playersData: Player[] = [];
        
        if (playerIds.length > 0) {
          const { data: playersResult, error: playersError } = await supabase
            .from('players')
            .select('*')
            .in('id', playerIds);

          if (!playersError && playersResult) {
            playersData = playersResult.map(p => ({
              id: p.id,
              name: p.name,
              city: p.city,
              phone: p.phone,
              photoUrl: p.photo_url,
              userId: p.user_id,
              organizationId: p.organization_id,
              createdAt: new Date(p.created_at),
              photoBase64: p.photo_base64
            }));
          }
        }

        // Converter dados do Supabase para tipos do modelo
        const convertedGame: Game = {
          id: gameData.id,
          number: gameData.number,
          date: new Date(gameData.date),
          seasonId: gameData.season_id,
          players: gameData.players as any,
          totalPrizePool: gameData.total_prize_pool,
          dinnerCost: gameData.dinner_cost,
          isFinished: gameData.is_finished,
          createdAt: new Date(gameData.created_at)
        };

        setGame(convertedGame);
        setPlayers(playersData);
      } catch (error) {
        console.error('Erro ao carregar partida pública:', error);
        setError("Erro ao carregar dados da partida");
      } finally {
        setLoading(false);
      }
    };

    loadPublicGameData();
  }, [shareToken]);

  // Carregar ranking da temporada
  useEffect(() => {
    const loadSeasonRankings = async () => {
      if (!game?.seasonId) return;

      try {
        setLoadingRankings(true);
        
        const { data: rankingsData, error: rankingsError } = await supabase
          .from('rankings')
          .select('*')
          .eq('season_id', game.seasonId)
          .order('total_points', { ascending: false });

        if (!rankingsError && rankingsData) {
          const convertedRankings: RankingEntry[] = rankingsData.map(r => ({
            id: r.id,
            playerId: r.player_id,
            playerName: r.player_name,
            photoUrl: r.photo_url,
            totalPoints: r.total_points,
            gamesPlayed: r.games_played,
            bestPosition: r.best_position,
            seasonId: r.season_id
          }));
          
          setRankings(convertedRankings);
        }
      } catch (error) {
        console.error('Erro ao carregar rankings:', error);
      } finally {
        setLoadingRankings(false);
      }
    };

    if (game) {
      loadSeasonRankings();
    }
  }, [game]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Oops!</h2>
            <p className="text-muted-foreground">{error || "Partida não encontrada"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player?.name || 'Jogador não encontrado';
  };

  const getPlayerPhoto = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player?.photoUrl || null;
  };

  const sortedPlayers = [...game.players].sort((a, b) => a.position - b.position);
  const winners = sortedPlayers.filter(p => p.prize > 0);
  
  // Calcular custo individual da janta
  const dinnerParticipants = game.players.filter(p => p.joinedDinner).length;
  const dinnerCostPerPlayer = game.dinnerCost && dinnerParticipants > 0 
    ? game.dinnerCost / dinnerParticipants 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Partida #{game.number.toString().padStart(3, '0')}
            </h1>
            <p className="opacity-90">{formatDate(game.date)}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Jogadores</p>
              <p className="font-semibold text-sm">{game.players.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Prêmio Total</p>
              <p className="font-semibold text-sm">{formatCurrency(game.totalPrizePool)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="font-semibold text-sm">{game.isFinished ? "Finalizada" : "Em andamento"}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Vencedores</p>
              <p className="font-semibold text-sm">{winners.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Vencedores */}
        {winners.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                Vencedores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {winners.map((winner, index) => (
                  <div key={winner.playerId} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}º`}
                      </span>
                      <div className="flex items-center">
                        {getPlayerPhoto(winner.playerId) ? (
                          <img 
                            src={getPlayerPhoto(winner.playerId)!} 
                            alt={getPlayerName(winner.playerId)} 
                            className="w-8 h-8 rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                            <span className="text-xs font-semibold">
                              {getPlayerName(winner.playerId).charAt(0)}
                            </span>
                          </div>
                        )}
                        <span className="font-medium">{getPlayerName(winner.playerId)}</span>
                      </div>
                    </div>
                    <span className="font-bold text-primary">
                      {formatCurrency(winner.prize)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Valor Total da Janta */}
        {game.dinnerCost && dinnerParticipants > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Utensils className="h-5 w-5 mr-2 text-primary" />
                Valor Total da Janta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-xl font-bold text-primary">{formatCurrency(game.dinnerCost)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Participantes</p>
                  <p className="text-xl font-bold">{dinnerParticipants}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Valor Individual</p>
                  <p className="text-xl font-bold text-primary">{formatCurrency(dinnerCostPerPlayer)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Classificação Completa */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Classificação Final</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Pos.</TableHead>
                    <TableHead>Jogador</TableHead>
                    <TableHead className="text-right">Pontos</TableHead>
                    <TableHead className="text-right">Prêmio</TableHead>
                    <TableHead className="text-right">Rebuys</TableHead>
                    <TableHead className="text-right">Add-ons</TableHead>
                    <TableHead className="text-right">Janta</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPlayers.map((player) => (
                    <TableRow key={player.playerId}>
                      <TableCell className="font-medium">
                        {player.position}º
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getPlayerPhoto(player.playerId) ? (
                            <img 
                              src={getPlayerPhoto(player.playerId)!} 
                              alt={getPlayerName(player.playerId)} 
                              className="w-6 h-6 rounded-full mr-2"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                              <span className="text-xs font-semibold">
                                {getPlayerName(player.playerId).charAt(0)}
                              </span>
                            </div>
                          )}
                          {getPlayerName(player.playerId)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {player.points}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatCurrency(player.prize)}
                      </TableCell>
                      <TableCell className="text-right">
                        {player.rebuys || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        {player.addons || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        {player.joinedDinner ? formatCurrency(dinnerCostPerPlayer) : '-'}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${
                        player.balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(player.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Ranking Completo da Temporada */}
        {rankings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                Ranking da Temporada
                {loadingRankings && (
                  <div className="ml-2 animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Pos.</TableHead>
                      <TableHead>Jogador</TableHead>
                      <TableHead className="text-right">Pontos</TableHead>
                      <TableHead className="text-right">Jogos</TableHead>
                      <TableHead className="text-right">Melhor Pos.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rankings.map((ranking, index) => (
                      <TableRow key={ranking.id}>
                        <TableCell className="font-medium">
                          {index + 1}º
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {ranking.photoUrl ? (
                              <img 
                                src={ranking.photoUrl} 
                                alt={ranking.playerName} 
                                className="w-6 h-6 rounded-full mr-2"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                                <span className="text-xs font-semibold">
                                  {ranking.playerName.charAt(0)}
                                </span>
                              </div>
                            )}
                            {ranking.playerName}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          {ranking.totalPoints}
                        </TableCell>
                        <TableCell className="text-right">
                          {ranking.gamesPlayed}
                        </TableCell>
                        <TableCell className="text-right">
                          {ranking.bestPosition}º
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
          <p>Partida finalizada em {formatDate(game.date)}</p>
          {game.dinnerCost && (
            <p>Custo da janta: {formatCurrency(game.dinnerCost)} por pessoa</p>
          )}
        </div>
      </div>
    </div>
  );
}