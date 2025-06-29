
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Game, Player } from '@/lib/db/models';
import { formatCurrency, formatDate } from '@/lib/utils/dateUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Trophy, Medal, Award } from 'lucide-react';

interface PlayerGameHistoryProps {
  games: Game[];
  playerId: string;
  players: Player[];
}

export function PlayerGameHistory({ games, playerId, players }: PlayerGameHistoryProps) {
  const isMobile = useIsMobile();

  // Ordenar jogos por data (mais recente primeiro)
  const sortedGames = [...games].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (position === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (position === 3) return <Award className="h-4 w-4 text-amber-600" />;
    return null;
  };

  const getPositionColor = (position: number) => {
    if (position === 1) return 'text-yellow-500 border-yellow-500/30';
    if (position === 2) return 'text-gray-400 border-gray-400/30';
    if (position === 3) return 'text-amber-600 border-amber-600/30';
    if (position <= 5) return 'text-green-400 border-green-400/30';
    return 'text-white border-white/20';
  };

  return (
    <Card className="bg-poker-black/50 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Histórico de Partidas</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedGames.length === 0 ? (
          <p className="text-white/70 text-center py-8">
            Nenhuma partida encontrada.
          </p>
        ) : (
          <div className="space-y-4">
            {sortedGames.map((game) => {
              const gamePlayer = game.players.find(p => p.playerId === playerId);
              if (!gamePlayer) return null;

              return (
                <div
                  key={game.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-4 mb-3 md:mb-0">
                    {/* Data e Número da Partida */}
                    <div className="text-center">
                      <div className="text-sm font-medium text-white">
                        Partida #{game.number.toString().padStart(3, '0')}
                      </div>
                      <div className="text-xs text-white/70">
                        {formatDate(game.date)}
                      </div>
                    </div>

                    {/* Posição */}
                    <div className="flex items-center gap-2">
                      {getPositionIcon(gamePlayer.position || 0)}
                      <Badge 
                        variant="outline" 
                        className={`${getPositionColor(gamePlayer.position || 0)} font-bold`}
                      >
                        {gamePlayer.position}º lugar
                      </Badge>
                    </div>

                    {/* Pontos */}
                    <Badge variant="outline" className="border-poker-gold/30 text-poker-gold">
                      {gamePlayer.points} pts
                    </Badge>
                  </div>

                  {/* Estatísticas da Partida */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {/* Prêmio */}
                    {gamePlayer.prize > 0 && (
                      <Badge variant="outline" className="border-green-500/30 text-green-400">
                        Prêmio: {formatCurrency(gamePlayer.prize)}
                      </Badge>
                    )}

                    {/* Rebuys */}
                    {gamePlayer.rebuys > 0 && (
                      <Badge variant="outline" className="border-red-500/30 text-red-400">
                        {gamePlayer.rebuys} rebuy{gamePlayer.rebuys > 1 ? 's' : ''}
                      </Badge>
                    )}

                    {/* Add-ons */}
                    {gamePlayer.addons > 0 && (
                      <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                        {gamePlayer.addons} addon{gamePlayer.addons > 1 ? 's' : ''}
                      </Badge>
                    )}

                    {/* Janta */}
                    {gamePlayer.joinedDinner && (
                      <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                        Janta
                      </Badge>
                    )}

                    {/* Saldo da Partida */}
                    <Badge 
                      variant="outline" 
                      className={`${
                        gamePlayer.balance >= 0 
                          ? 'border-green-500/30 text-green-400' 
                          : 'border-red-500/30 text-red-400'
                      }`}
                    >
                      {formatCurrency(gamePlayer.balance)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
