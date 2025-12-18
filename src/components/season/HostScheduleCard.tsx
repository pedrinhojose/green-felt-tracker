import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User } from "lucide-react";
import { HostScheduleEntry } from "@/lib/db/models";
import { formatDate } from "@/lib/utils/dateUtils";

interface HostScheduleCardProps {
  hostSchedule: HostScheduleEntry[];
  title?: string;
  description?: string;
}

export function HostScheduleCard({ 
  hostSchedule, 
  title = "Cronograma de Jantares",
  description = "Lista de anfitriões e datas dos jantares da temporada."
}: HostScheduleCardProps) {
  if (!hostSchedule || hostSchedule.length === 0) {
    return null;
  }

  // Ordenar por data
  const sortedSchedule = [...hostSchedule].sort((a, b) => {
    const dateA = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0;
    const dateB = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0;
    return dateA - dateB;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedSchedule.map((entry, index) => {
            const entryDate = entry.scheduledDate ? new Date(entry.scheduledDate) : null;
            const isPast = entryDate && entryDate < today;
            const isToday = entryDate && entryDate.toDateString() === today.toDateString();
            
            return (
              <div 
                key={entry.id || index} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isToday 
                    ? 'border-primary bg-primary/10' 
                    : isPast 
                      ? 'border-muted bg-muted/30 opacity-60' 
                      : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    isToday 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {entry.playerName || 'Anfitrião não definido'}
                    </p>
                    {entry.scheduledDate && (
                      <p className="text-sm text-muted-foreground">
                        {formatDate(new Date(entry.scheduledDate))}
                        {isToday && <span className="ml-2 text-primary font-medium">(Hoje)</span>}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  #{index + 1}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
