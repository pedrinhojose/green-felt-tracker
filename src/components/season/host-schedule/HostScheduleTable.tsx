import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { HostScheduleEntry } from "@/lib/db/models";
import { usePoker } from "@/contexts/PokerContext";
import { Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HostScheduleTableProps {
  hostSchedule: HostScheduleEntry[];
  updateEntry: (id: string, updates: Partial<HostScheduleEntry>) => void;
  removeEntry: (id: string) => void;
}

export function HostScheduleTable({ hostSchedule, updateEntry, removeEntry }: HostScheduleTableProps) {
  const { players } = usePoker();

  const getStatusBadge = (status: HostScheduleEntry['status']) => {
    const variants = {
      scheduled: 'secondary',
      confirmed: 'default',
      cancelled: 'destructive',
      completed: 'outline'
    } as const;

    const labels = {
      scheduled: 'Agendado',
      confirmed: 'Confirmado',
      cancelled: 'Cancelado',
      completed: 'Realizado'
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const sortedSchedule = [...hostSchedule].sort((a, b) => 
    new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Anfitrião</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Observações</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedSchedule.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-muted-foreground" />
                  <Input
                    type="date"
                    value={format(new Date(entry.scheduledDate), 'yyyy-MM-dd')}
                    onChange={(e) => {
                      if (e.target.value) {
                        updateEntry(entry.id, { 
                          scheduledDate: new Date(e.target.value + 'T00:00:00') 
                        });
                      }
                    }}
                    className="w-auto"
                  />
                </div>
              </TableCell>
              <TableCell>
                <Select
                  value={entry.playerId || ''}
                  onValueChange={(value) => updateEntry(entry.id, { playerId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar jogador" />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Select
                  value={entry.status}
                  onValueChange={(value: HostScheduleEntry['status']) => 
                    updateEntry(entry.id, { status: value })
                  }
                >
                  <SelectTrigger className="w-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                    <SelectItem value="completed">Realizado</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  value={entry.notes || ''}
                  onChange={(e) => updateEntry(entry.id, { notes: e.target.value })}
                  placeholder="Observações..."
                  className="min-w-[200px]"
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEntry(entry.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}