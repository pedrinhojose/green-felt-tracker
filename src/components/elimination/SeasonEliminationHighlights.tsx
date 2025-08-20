import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sword, Target, Users, TrendingUp } from 'lucide-react';
import { useSeasonEliminationStats } from '@/hooks/elimination/useSeasonEliminationStats';

interface SeasonEliminationHighlightsProps {
  seasonId?: string;
}

export function SeasonEliminationHighlights({ seasonId }: SeasonEliminationHighlightsProps) {
  const { 
    deadliestPlayer, 
    mostTargetedPlayer, 
    biggestRival, 
    totalEliminations, 
    eliminationRate, 
    loading 
  } = useSeasonEliminationStats(seasonId);

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
            Destaques de Eliminação
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
          Destaques de Eliminação
          <Badge variant="outline" className="ml-auto">
            {totalEliminations} eliminações
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Taxa de Eliminação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Taxa por Jogo</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {eliminationRate.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">eliminações/jogo</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sword className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-foreground">Total</span>
            </div>
            <div className="text-2xl font-bold text-destructive">
              {totalEliminations}
            </div>
            <div className="text-xs text-muted-foreground">eliminações</div>
          </div>
        </div>

        {/* Jogador Mais Mortal */}
        {deadliestPlayer && (
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Sword className="h-4 w-4 text-destructive" />
              Jogador Mais Mortal
            </h4>
            <div className="flex items-center justify-between">
              <span className="text-foreground font-medium">{deadliestPlayer.playerName}</span>
              <Badge variant="destructive">
                {deadliestPlayer.eliminations} eliminações
              </Badge>
            </div>
          </div>
        )}

        {/* Jogador Mais Eliminado */}
        {mostTargetedPlayer && (
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-500" />
              Jogador Mais Eliminado
            </h4>
            <div className="flex items-center justify-between">
              <span className="text-foreground font-medium">{mostTargetedPlayer.playerName}</span>
              <Badge variant="outline">
                {mostTargetedPlayer.eliminations} eliminações
              </Badge>
            </div>
          </div>
        )}

        {/* Maior Rivalidade */}
        {biggestRival && (
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              Maior Rivalidade
            </h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-foreground">{biggestRival.player1Name}</span>
                <span className="text-muted-foreground">vs</span>
                <span className="text-foreground">{biggestRival.player2Name}</span>
              </div>
              <Badge variant="outline">
                {biggestRival.eliminations} confrontos
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Enfrentamentos diretos com eliminação
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}