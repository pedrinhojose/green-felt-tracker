import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, User, X, Edit, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { HostScheduleEntry } from "@/lib/db/models";

interface HostScheduleDisplayProps {
  hostSchedule: HostScheduleEntry[];
  onUpdateEntry: (schedule: HostScheduleEntry[]) => void;
}

export function HostScheduleDisplay({ hostSchedule, onUpdateEntry }: HostScheduleDisplayProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const getStatusIcon = (status: HostScheduleEntry['status']) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: HostScheduleEntry['status']) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado';
      case 'confirmed':
        return 'Confirmado';
      case 'cancelled':
        return 'Cancelado';
      case 'completed':
        return 'Concluído';
      default:
        return 'Indefinido';
    }
  };

  const getStatusVariant = (status: HostScheduleEntry['status']) => {
    switch (status) {
      case 'scheduled':
        return 'secondary';
      case 'confirmed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'completed':
        return 'default';
      default:
        return 'outline';
    }
  };

  const updateEntryStatus = (entryId: string, newStatus: HostScheduleEntry['status']) => {
    const updatedSchedule = hostSchedule.map(entry =>
      entry.id === entryId ? { ...entry, status: newStatus } : entry
    );
    onUpdateEntry(updatedSchedule);
  };

  const removeEntry = (entryId: string) => {
    const updatedSchedule = hostSchedule.filter(entry => entry.id !== entryId);
    onUpdateEntry(updatedSchedule);
  };

  if (hostSchedule.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Nenhum cronograma configurado</h3>
          <p className="text-muted-foreground mb-4">
            Use a aba "Configuração" para gerar automaticamente o cronograma de anfitriões.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Cronograma ({hostSchedule.length} datas)
        </h3>
        <div className="text-sm text-muted-foreground">
          Clique nos cards para gerenciar cada data
        </div>
      </div>

      <div className="grid gap-3">
        {hostSchedule
          .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
          .map((entry) => (
            <Card 
              key={entry.id} 
              className={cn(
                "transition-all duration-200 hover:shadow-md",
                entry.status === 'cancelled' && "opacity-60"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(new Date(entry.scheduledDate), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({format(new Date(entry.scheduledDate), "EEEE", { locale: ptBR })})
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {entry.playerName || "Não atribuído"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(entry.status)} className="flex items-center gap-1">
                      {getStatusIcon(entry.status)}
                      {getStatusLabel(entry.status)}
                    </Badge>

                    <div className="flex items-center gap-1">
                      {entry.status !== 'completed' && (
                        <>
                          {entry.status === 'scheduled' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateEntryStatus(entry.id, 'confirmed')}
                            >
                              Confirmar
                            </Button>
                          )}
                          
                          {entry.status !== 'cancelled' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateEntryStatus(entry.id, 'cancelled')}
                            >
                              Cancelar
                            </Button>
                          )}
                        </>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeEntry(entry.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {entry.notes && (
                  <div className="mt-2 text-sm text-muted-foreground pl-6">
                    {entry.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}