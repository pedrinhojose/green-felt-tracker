import { useMemo } from 'react';
import { Coins, TrendingUp, Users, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/navigation/PageHeader';
import { usePoker } from '@/contexts/PokerContext';
import { useSeasonReport } from '@/hooks/useSeasonReport';
import { formatCurrency } from '@/lib/utils/dateUtils';
import JackpotWinnersCard from '@/components/reports/JackpotWinnersCard';

export default function FinanceJackpot() {
  const { activeSeason, games } = usePoker();
  const { jackpotWinners, totalJackpot } = useSeasonReport();

  const stats = useMemo(() => {
    const seasonGames = (games || []).filter(
      (g) => g.seasonId === activeSeason?.id
    );
    const jackpotContribution =
      activeSeason?.financialParams?.jackpotContribution || 0;
    const totalPlayers = seasonGames.reduce(
      (sum, g) => sum + (g.players?.length || 0),
      0
    );
    const totalContributed = totalPlayers * jackpotContribution;
    return {
      gamesCount: seasonGames.length,
      totalPlayers,
      jackpotContribution,
      totalContributed,
    };
  }, [games, activeSeason]);

  if (!activeSeason) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Jackpot"
          description="Gestão do jackpot acumulado e premiações do clube"
        />
        <Card className="surface-card">
          <CardContent className="p-8 text-center">
            <Coins className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhuma temporada ativa. Ative uma temporada para visualizar o
              jackpot.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <PageHeader
        title="Jackpot"
        description={`Relatório completo do jackpot — Temporada: ${activeSeason.name}`}
      />

      {/* Valor atual do Jackpot */}
      <Card className="surface-card border-poker-gold/30">
        <CardContent className="p-6 text-center">
          <Coins className="w-10 h-10 text-poker-gold mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-1">Jackpot Atual</p>
          <p className="text-4xl font-bold text-poker-gold">
            {formatCurrency(totalJackpot)}
          </p>
        </CardContent>
      </Card>

      {/* Estatísticas de contribuição */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="surface-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Trophy className="w-4 h-4" /> Partidas
            </div>
            <p className="text-2xl font-bold">{stats.gamesCount}</p>
          </CardContent>
        </Card>
        <Card className="surface-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Users className="w-4 h-4" /> Total de participações
            </div>
            <p className="text-2xl font-bold">{stats.totalPlayers}</p>
          </CardContent>
        </Card>
        <Card className="surface-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <TrendingUp className="w-4 h-4" /> Contribuição por jogador
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(stats.jackpotContribution)}
            </p>
          </CardContent>
        </Card>
        <Card className="surface-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Coins className="w-4 h-4" /> Total arrecadado
            </div>
            <p className="text-2xl font-bold text-poker-gold">
              {formatCurrency(stats.totalContributed)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição projetada do Jackpot */}
      {jackpotWinners.length > 0 ? (
        <JackpotWinnersCard
          jackpotWinners={jackpotWinners}
          totalJackpot={totalJackpot}
        />
      ) : (
        <Card className="surface-card">
          <CardHeader>
            <CardTitle className="text-xl">Distribuição do Jackpot</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-6">
              A distribuição será exibida assim que houver ranking suficiente na
              temporada.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
