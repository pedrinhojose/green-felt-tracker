
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { PlayerStatisticsCard } from './PlayerStatisticsCard';

interface PlayerStatisticsListProps {
  loading: boolean;
  filteredPlayers: any[];
  playerStats: any[];
  selectedSeasonId: string;
  searchTerm: string;
}

export function PlayerStatisticsList({
  loading,
  filteredPlayers,
  playerStats,
  selectedSeasonId,
  searchTerm
}: PlayerStatisticsListProps) {
  if (loading) {
    return (
      <Card className="bg-poker-black/50 border-white/10 mb-6">
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-poker-gold" />
            <p className="text-white/70">Carregando estatísticas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (filteredPlayers.length === 0) {
    return (
      <Card className="bg-poker-black/50 border-white/10">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-white/70 mb-2">
              {searchTerm ? 'Nenhum jogador encontrado.' : 'Nenhum dado de estatística disponível para esta temporada.'}
            </p>
            {!searchTerm && (
              <p className="text-white/50 text-sm">
                Esta temporada pode não ter dados de jogos ou rankings ainda.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {filteredPlayers.map((playerRating, index) => {
        const playerData = playerStats.find(p => p.playerId === playerRating.playerId);
        if (!playerData) return null;

        return (
          <PlayerStatisticsCard
            key={playerRating.playerId}
            playerRating={playerRating}
            playerData={playerData}
            index={index}
            selectedSeasonId={selectedSeasonId}
          />
        );
      })}
    </div>
  );
}
