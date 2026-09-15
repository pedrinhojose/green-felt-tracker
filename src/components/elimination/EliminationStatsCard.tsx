import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sword } from 'lucide-react';
import { useEliminationStats } from '@/hooks/elimination/useEliminationStats';
import { useEliminationRewardsSummary } from '@/hooks/elimination/useEliminationRewardsSummary';

interface EliminationStatsCardProps {
  seasonId?: string;
}

export function EliminationStatsCard({ seasonId }: EliminationStatsCardProps) {
  const { topEliminators, totalEliminations, loading } = useEliminationStats(seasonId);
  const rewards = useEliminationRewardsSummary(seasonId);

  const formatReward = (value: number) =>
    rewards.rewardType === 'points'
      ? `${value} ${value === 1 ? 'ponto' : 'pontos'}`
      : `R$ ${value.toFixed(2)}`;

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (totalEliminations === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Sword className="h-5 w-5 text-primary" />
            Estatísticas de Eliminação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Ainda não há dados de eliminação para esta temporada.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Sword className="h-5 w-5 text-primary" />
          Estatísticas de Eliminação
          <Badge variant="outline" className="ml-auto">
            {totalEliminations} eliminações
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Top Eliminadores */}
        <div>
          <h4 className="font-medium text-foreground mb-1 flex items-center gap-2">
            <Sword className="h-4 w-4 text-destructive" />
            Top Eliminadores
          </h4>
          <p className="text-xs text-muted-foreground mb-4">{rewards.ruleLabel}</p>
          {topEliminators.length > 0 ? (
            <div className="space-y-3">
              {topEliminators.map((eliminator, index) => {
                const summary = rewards.byPlayer[eliminator.playerId];

                return (
                  <div key={eliminator.playerId} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Badge variant={index === 0 ? "default" : "secondary"} className="w-7 h-7 p-0 text-sm font-semibold shrink-0">
                        {index + 1}
                      </Badge>
                      <div>
                        <span className="text-foreground font-medium">{eliminator.playerName}</span>
                        {rewards.enabled && summary && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Bônus: {formatReward(summary.rewardValue)}
                            {summary.toNextReward > 0 && rewards.frequency > 1 && (
                              <> • faltam {summary.toNextReward} para o próximo</>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="font-semibold shrink-0">
                      {eliminator.eliminations} eliminações
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-6">Nenhum dado disponível</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}