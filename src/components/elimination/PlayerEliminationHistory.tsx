import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sword, Target, Clock } from 'lucide-react';
import { usePlayerEliminationHistory } from '@/hooks/elimination/usePlayerEliminationHistory';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PlayerEliminationHistoryProps {
  playerId: string;
  seasonId?: string;
}

export function PlayerEliminationHistory({ playerId, seasonId }: PlayerEliminationHistoryProps) {
  const { asEliminator, asEliminated, recentEliminations, loading } = usePlayerEliminationHistory(playerId, seasonId);

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const totalEliminationEvents = asEliminator.count + asEliminated.count;

  if (totalEliminationEvents === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Sword className="h-5 w-5 text-primary" />
            Histórico de Eliminações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Ainda não há dados de eliminação para este jogador.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Sword className="h-5 w-5 text-primary" />
            Histórico de Eliminações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{asEliminator.count}</div>
              <div className="text-sm text-muted-foreground">Eliminou</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{asEliminated.count}</div>
              <div className="text-sm text-muted-foreground">Foi eliminado</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vítimas Favoritas */}
      {asEliminator.victims.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Target className="h-5 w-5 text-destructive" />
              Vítimas Favoritas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {asEliminator.victims.slice(0, 5).map((victim) => (
                <div key={victim.playerId} className="flex items-center justify-between">
                  <span className="text-foreground">{victim.playerName}</span>
                  <Badge variant="outline">
                    {victim.eliminations}x
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Principais Eliminadores */}
      {asEliminated.eliminators.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Sword className="h-5 w-5 text-orange-500" />
              Principais Eliminadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {asEliminated.eliminators.slice(0, 5).map((eliminator) => (
                <div key={eliminator.playerId} className="flex items-center justify-between">
                  <span className="text-foreground">{eliminator.playerName}</span>
                  <Badge variant="outline">
                    {eliminator.eliminations}x
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico Recente */}
      {recentEliminations.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Clock className="h-5 w-5 text-primary" />
              Eliminações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEliminations.map((elimination, index) => (
                <div key={index} className="flex items-center justify-between border-b border-border pb-2 last:border-b-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {elimination.type === 'eliminator' ? (
                        <Badge variant="destructive" className="text-xs">Eliminou</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Foi eliminado</Badge>
                      )}
                      <span className="text-sm text-foreground">{elimination.otherPlayer}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {elimination.gameNumber && `Jogo #${elimination.gameNumber} • `}
                      {elimination.position && `${elimination.position}º lugar • `}
                      {format(new Date(elimination.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}