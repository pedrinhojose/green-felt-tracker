
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/statistics/StarRating';
import { formatCurrency } from '@/lib/utils/dateUtils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface PlayerStatisticsCardProps {
  playerRating: any;
  playerData: any;
  index: number;
  selectedSeasonId: string;
}

export function PlayerStatisticsCard({
  playerRating,
  playerData,
  index,
  selectedSeasonId
}: PlayerStatisticsCardProps) {
  const isMobile = useIsMobile();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Link 
      to={`/statistics/player/${playerRating.playerId}?season=${selectedSeasonId}`}
      className="block transition-transform hover:scale-[1.02]"
    >
      <Card className="bg-poker-black/50 border-white/10 hover:border-poker-gold/30 transition-colors">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-4">
            {/* Posição */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-poker-gold/10 flex items-center justify-center">
                <span className="text-poker-gold font-bold text-sm md:text-base">
                  #{index + 1}
                </span>
              </div>
            </div>

            {/* Avatar */}
            <Avatar className="h-12 w-12 md:h-16 md:w-16">
              <AvatarImage src={playerData.photoUrl} alt={playerData.playerName} />
              <AvatarFallback className="bg-poker-gold text-poker-black font-bold">
                {getInitials(playerData.playerName)}
              </AvatarFallback>
            </Avatar>

            {/* Informações do Jogador */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-white text-lg md:text-xl truncate">
                    {playerData.playerName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={playerRating.stars} size={isMobile ? 'sm' : 'md'} />
                    <span className="text-xs md:text-sm text-white/70">
                      Rating: {playerRating.rating}
                    </span>
                  </div>
                </div>

                {/* Estatísticas Principais */}
                <div className="flex flex-wrap gap-2 md:gap-3">
                  <Badge variant="outline" className="border-white/20 text-white text-xs">
                    {playerData.gamesPlayed} jogos
                  </Badge>
                  <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                    {playerData.victories} vitórias
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      playerData.balance >= 0 
                        ? 'border-green-500/30 text-green-400' 
                        : 'border-red-500/30 text-red-400'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {playerData.balance >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {formatCurrency(playerData.balance)}
                    </div>
                  </Badge>
                </div>
              </div>

              {/* Métricas Detalhadas (Desktop) */}
              {!isMobile && (
                <div className="mt-3 grid grid-cols-5 gap-4 text-xs text-white/70">
                  <div>
                    <span className="block font-medium">Taxa Vitória</span>
                    <span>{playerData.winRate.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="block font-medium">ROI</span>
                    <span className={playerData.roi >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {playerData.roi.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="block font-medium">ITM</span>
                    <span>{playerData.itmRate.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="block font-medium">Pos. Média</span>
                    <span>{playerData.averagePosition.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="block font-medium">Pontos</span>
                    <span className="text-poker-gold">{playerData.totalPoints}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
