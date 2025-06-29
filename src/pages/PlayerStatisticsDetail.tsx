
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePoker } from '@/contexts/PokerContext';
import { usePlayerStats } from '@/hooks/reports/usePlayerStats';
import { usePlayerRating } from '@/hooks/usePlayerRating';
import { StarRating } from '@/components/statistics/StarRating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils/dateUtils';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { PlayerExportButtons } from '@/components/statistics/PlayerExportButtons';
import { PlayerGameHistory } from '@/components/statistics/PlayerGameHistory';

export default function PlayerStatisticsDetail() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const { games, players, activeSeason } = usePoker();
  const { playerStats } = usePlayerStats();
  const playerRatings = usePlayerRating(playerStats);
  const isMobile = useIsMobile();

  const playerData = playerStats.find(p => p.playerId === playerId);
  const playerRating = playerRatings.find(r => r.playerId === playerId);
  const player = players.find(p => p.id === playerId);

  // Filtrar jogos do jogador na temporada ativa
  const playerGames = games.filter(game => 
    game.seasonId === activeSeason?.id && 
    game.players.some(p => p.playerId === playerId)
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!playerData || !player) {
    return (
      <div className="p-4 md:p-6">
        <Card className="bg-poker-black/50 border-white/10">
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-white/70">Jogador não encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/statistics')}
            className="text-white hover:text-poker-gold"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 md:h-20 md:w-20">
              <AvatarImage src={playerData.photoUrl} alt={playerData.playerName} />
              <AvatarFallback className="bg-poker-gold text-poker-black font-bold text-xl">
                {getInitials(playerData.playerName)}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {playerData.playerName}
              </h1>
              {playerRating && (
                <div className="flex items-center gap-2 mt-2">
                  <StarRating rating={playerRating.stars} size="lg" showNumber />
                  <Badge variant="outline" className="border-poker-gold/30 text-poker-gold">
                    Rating: {playerRating.rating}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botões de Exportação */}
        <PlayerExportButtons 
          playerId={playerId!}
          playerName={playerData.playerName}
        />
      </div>

      {/* Conteúdo Exportável */}
      <div id={`player-stats-${playerId}`} className="space-y-6">
        {/* Cards de Estatísticas Principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-poker-black/50 border-white/10">
            <CardContent className="p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-poker-gold">
                {playerData.gamesPlayed}
              </div>
              <div className="text-xs md:text-sm text-white/70">Partidas</div>
            </CardContent>
          </Card>

          <Card className="bg-poker-black/50 border-white/10">
            <CardContent className="p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-400">
                {playerData.victories}
              </div>
              <div className="text-xs md:text-sm text-white/70">Vitórias</div>
            </CardContent>
          </Card>

          <Card className="bg-poker-black/50 border-white/10">
            <CardContent className="p-4 text-center">
              <div className={`text-2xl md:text-3xl font-bold ${
                playerData.balance >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatCurrency(playerData.balance)}
              </div>
              <div className="text-xs md:text-sm text-white/70">Saldo</div>
            </CardContent>
          </Card>

          <Card className="bg-poker-black/50 border-white/10">
            <CardContent className="p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-poker-gold">
                {playerData.totalPoints}
              </div>
              <div className="text-xs md:text-sm text-white/70">Pontos</div>
            </CardContent>
          </Card>
        </div>

        {/* Métricas Avançadas */}
        <Card className="bg-poker-black/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Métricas de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-white">
                  {playerData.winRate.toFixed(1)}%
                </div>
                <div className="text-xs md:text-sm text-white/70">Taxa de Vitórias</div>
              </div>
              
              <div className="text-center">
                <div className={`text-xl md:text-2xl font-bold ${
                  playerData.roi >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {playerData.roi.toFixed(1)}%
                </div>
                <div className="text-xs md:text-sm text-white/70">ROI</div>
              </div>
              
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-blue-400">
                  {playerData.itmRate.toFixed(1)}%
                </div>
                <div className="text-xs md:text-sm text-white/70">Taxa ITM</div>
              </div>
              
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-yellow-400">
                  {playerData.averagePosition.toFixed(1)}
                </div>
                <div className="text-xs md:text-sm text-white/70">Pos. Média</div>
              </div>
              
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-purple-400">
                  {formatCurrency(playerData.biggestPrize)}
                </div>
                <div className="text-xs md:text-sm text-white/70">Maior Prêmio</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Partidas */}
        <PlayerGameHistory 
          games={playerGames}
          playerId={playerId!}
          players={players}
        />
      </div>
    </div>
  );
}
