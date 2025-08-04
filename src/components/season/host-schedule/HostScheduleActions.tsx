import { useState } from "react";
import { Shuffle, UserPlus, ArrowLeftRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HostScheduleEntry, Player } from "@/lib/db/models";
import { shufflePlayersToSchedule } from "./utils/scheduleUtils";

interface HostScheduleActionsProps {
  players: Player[];
  hostSchedule: HostScheduleEntry[];
  onUpdateHostSchedule: (schedule: HostScheduleEntry[]) => void;
}

export function HostScheduleActions({ 
  players, 
  hostSchedule, 
  onUpdateHostSchedule 
}: HostScheduleActionsProps) {
  const [isShuffling, setIsShuffling] = useState(false);

  const reshuffleAll = async () => {
    if (hostSchedule.length === 0 || players.length === 0) return;

    setIsShuffling(true);
    try {
      const shuffledSchedule = shufflePlayersToSchedule(hostSchedule, players);
      onUpdateHostSchedule(shuffledSchedule);
    } finally {
      setIsShuffling(false);
    }
  };

  const clearAllHosts = () => {
    const clearedSchedule = hostSchedule.map(entry => ({
      ...entry,
      playerId: '',
      playerName: '',
      status: 'scheduled' as const
    }));
    onUpdateHostSchedule(clearedSchedule);
  };

  const clearSchedule = () => {
    onUpdateHostSchedule([]);
  };

  const totalDates = hostSchedule.length;
  const assignedDates = hostSchedule.filter(entry => entry.playerId).length;
  const unassignedDates = totalDates - assignedDates;

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{totalDates}</div>
            <div className="text-sm text-muted-foreground">Total de Datas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{assignedDates}</div>
            <div className="text-sm text-muted-foreground">Atribuídas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{unassignedDates}</div>
            <div className="text-sm text-muted-foreground">Pendentes</div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shuffle className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              onClick={reshuffleAll}
              disabled={hostSchedule.length === 0 || players.length === 0 || isShuffling}
              className="flex items-center gap-2"
            >
              <Shuffle className="h-4 w-4" />
              {isShuffling ? "Sorteando..." : "Sortear Todos"}
            </Button>

            <Button 
              variant="outline"
              onClick={clearAllHosts}
              disabled={hostSchedule.length === 0}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Limpar Anfitriões
            </Button>
          </div>

          <div className="border-t pt-4">
            <Button 
              variant="destructive"
              onClick={clearSchedule}
              disabled={hostSchedule.length === 0}
              className="flex items-center gap-2 w-full"
            >
              <Trash2 className="h-4 w-4" />
              Limpar Cronograma Completo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Distribuição de Jogadores */}
      {players.length > 0 && hostSchedule.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Anfitriões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {players.map(player => {
                const playerSchedules = hostSchedule.filter(entry => entry.playerId === player.id);
                const count = playerSchedules.length;
                
                return (
                  <div key={player.id} className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">{player.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {count} {count === 1 ? 'vez' : 'vezes'}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}