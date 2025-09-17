import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePoker } from "@/contexts/PokerContext";
import { Calendar, User, ChefHat } from "lucide-react";
import { format, isAfter, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export function UpcomingDinnerCard() {
  const { activeSeason } = usePoker();
  const navigate = useNavigate();

  if (!activeSeason || !activeSeason.hostSchedule || activeSeason.hostSchedule.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat size={20} />
            Próximos Jantares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Calendar size={32} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhum jantar agendado
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filtrar jantares futuros e ordenar por data
  const upcomingDinners = activeSeason.hostSchedule
    .filter(entry => {
      const scheduledDate = typeof entry.scheduledDate === 'string' 
        ? parseISO(entry.scheduledDate)
        : entry.scheduledDate;
      return isAfter(scheduledDate, new Date()) && entry.status !== 'cancelled';
    })
    .sort((a, b) => {
      const dateA = typeof a.scheduledDate === 'string' ? parseISO(a.scheduledDate) : a.scheduledDate;
      const dateB = typeof b.scheduledDate === 'string' ? parseISO(b.scheduledDate) : b.scheduledDate;
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 4); // Mostrar apenas os próximos 4

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'scheduled':
        return 'secondary';
      case 'completed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'scheduled':
        return 'Agendado';
      case 'completed':
        return 'Realizado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Agendado';
    }
  };

  const handleCardClick = () => {
    navigate('/seasons');
  };

  return (
    <Card 
      className="cursor-pointer hover:scale-[1.02] transition-all duration-200 ease-out"
      onClick={handleCardClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChefHat size={20} />
          Próximos Jantares
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingDinners.length === 0 ? (
          <div className="text-center py-4">
            <Calendar size={32} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhum jantar futuro agendado
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingDinners.map((dinner) => {
              const scheduledDate = typeof dinner.scheduledDate === 'string' 
                ? parseISO(dinner.scheduledDate)
                : dinner.scheduledDate;
              
              return (
                <div
                  key={dinner.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {format(scheduledDate, "dd 'de' MMMM", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-muted-foreground" />
                      <span className="text-sm">
                        {dinner.playerName || 'Não definido'}
                      </span>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(dinner.status) as any}>
                    {getStatusLabel(dinner.status)}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}