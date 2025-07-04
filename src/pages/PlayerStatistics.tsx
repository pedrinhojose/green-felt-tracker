
import { useState } from 'react';
import { usePoker } from '@/contexts/PokerContext';
import { usePlayerStats } from '@/hooks/reports/usePlayerStats';
import { usePlayerRating } from '@/hooks/usePlayerRating';
import { Card, CardContent } from '@/components/ui/card';
import { PlayerStatisticsHeader } from '@/components/statistics/PlayerStatisticsHeader';
import { PlayerStatisticsSearch } from '@/components/statistics/PlayerStatisticsSearch';
import { PlayerStatisticsList } from '@/components/statistics/PlayerStatisticsList';

export default function PlayerStatistics() {
  const { activeSeason, seasons } = usePoker();
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(activeSeason?.id || '');
  const { playerStats, loading } = usePlayerStats(selectedSeasonId);
  const playerRatings = usePlayerRating(playerStats);
  const [searchTerm, setSearchTerm] = useState('');

  // Encontrar a temporada selecionada
  const selectedSeason = seasons.find(s => s.id === selectedSeasonId) || activeSeason;

  // Filtrar jogadores baseado na busca
  const filteredPlayers = playerRatings.filter(player => {
    const playerData = playerStats.find(p => p.playerId === player.playerId);
    return playerData?.playerName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (!selectedSeason) {
    return (
      <div className="p-4 md:p-6">
        <Card className="bg-poker-black/50 border-white/10">
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-white/70">Nenhuma temporada encontrada.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <PlayerStatisticsHeader
        selectedSeasonId={selectedSeasonId}
        setSelectedSeasonId={setSelectedSeasonId}
        activeSeason={activeSeason}
        seasons={seasons}
        selectedSeason={selectedSeason}
      />

      <PlayerStatisticsSearch
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        loading={loading}
      />

      <PlayerStatisticsList
        loading={loading}
        filteredPlayers={filteredPlayers}
        playerStats={playerStats}
        selectedSeasonId={selectedSeasonId}
        searchTerm={searchTerm}
      />
    </div>
  );
}
