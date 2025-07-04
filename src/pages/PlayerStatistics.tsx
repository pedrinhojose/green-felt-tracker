
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePoker } from '@/contexts/PokerContext';
import { usePlayerStats } from '@/hooks/reports/usePlayerStats';
import { usePlayerRating } from '@/hooks/usePlayerRating';
import { StarRating } from '@/components/statistics/StarRating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils/dateUtils';
import { Search, TrendingUp, TrendingDown, Calendar, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function PlayerStatistics() {
  const { activeSeason, seasons } = usePoker();
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(activeSeason?.id || '');
  const { playerStats, loading } = usePlayerStats(selectedSeasonId);
  const playerRatings = usePlayerRating(playerStats);
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  // Encontrar a temporada selecionada
  const selectedSeason = seasons.find(s => s.id === selectedSeasonId) || activeSeason;

  // Filtrar jogadores baseado na busca
  const filteredPlayers = playerRatings.filter(player => {
    const playerData = playerStats.find(p => p.playerId === player.playerId);
    return playerData?.playerName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Estatísticas dos Jogadores
        </h1>
        
        {/* Seletor de Temporada */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-poker-gold" />
            <span className="text-white/70">Temporada:</span>
          </div>
          <Select value={selectedSeasonId} onValueChange={setSelectedSeasonId}>
            <SelectTrigger className="w-full md:w-64 bg-poker-black/50 border-white/10 text-white">
              <SelectValue placeholder="Selecione uma temporada" />
            </SelectTrigger>
            <SelectContent className="bg-poker-black border-white/10">
              {/* Temporada ativa primeiro */}
              {activeSeason && (
                <SelectItem 
                  key={activeSeason.id} 
                  value={activeSeason.id}
                  className="text-white hover:bg-poker-dark-green/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-poker-gold">●</span>
                    {activeSeason.name} (Ativa)
                  </div>
                </SelectItem>
              )}
              
              {/* Temporadas encerradas */}
              {seasons
                .filter(season => !season.isActive && season.id !== activeSeason?.id)
                .sort((a, b) => new Date(b.endDate || b.createdAt).getTime() - new Date(a.endDate || a.createdAt).getTime())
                .map(season => (
                  <SelectItem 
                    key={season.id} 
                    value={season.id}
                    className="text-white hover:bg-poker-dark-green/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">○</span>
                      {season.name} (Encerrada)
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-white/70">
          Exibindo dados de: <span className="text-poker-gold">{selectedSeason.name}</span>
          {selectedSeason.id === activeSeason?.id && <span className="text-green-400 ml-2">(Temporada Ativa)</span>}
          {selectedSeason.id !== activeSeason?.id && <span className="text-gray-400 ml-2">(Temporada Encerrada)</span>}
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar jogador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-poker-black/50 border-white/10 text-white"
            disabled={loading}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <Card className="bg-poker-black/50 border-white/10 mb-6">
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-poker-gold" />
              <p className="text-white/70">Carregando estatísticas...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Jogadores */}
      {!loading && (
        <div className="grid gap-4">
          {filteredPlayers.map((playerRating, index) => {
            const playerData = playerStats.find(p => p.playerId === playerRating.playerId);
            if (!playerData) return null;

            return (
              <Link 
                key={playerRating.playerId}
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
          })}
        </div>
      )}

      {!loading && filteredPlayers.length === 0 && (
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
      )}
    </div>
  );
}
