import { useState } from "react";
import { usePoker } from "@/contexts/PokerContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Cake, Calendar } from "lucide-react";
import { format, isSameDay, addDays, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

// Parse date string as local date (avoiding UTC timezone issues)
function parseLocalDate(dateStr: string | Date): Date {
  if (dateStr instanceof Date) return dateStr;
  // For ISO date strings like "1985-12-23", parse and adjust for local timezone
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
  return new Date(year, month - 1, day);
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export function BirthdayReminderCard() {
  const { players } = usePoker();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const today = new Date();
  const weekFromNow = addDays(today, 7);
  
  // Filter players with birthdays this week
  const thisWeekBirthdays = players.filter(player => {
    if (!player.birthDate) return false;
    
    const birthDate = parseLocalDate(player.birthDate);
    const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    
    return isWithinInterval(thisYearBirthday, { start: today, end: weekFromNow });
  }).sort((a, b) => {
    const dateA = parseLocalDate(a.birthDate!);
    const dateB = parseLocalDate(b.birthDate!);
    return dateA.getDate() - dateB.getDate();
  });
  
  // Filter players with birthdays this month
  const thisMonthBirthdays = players.filter(player => {
    if (!player.birthDate) return false;
    return parseLocalDate(player.birthDate).getMonth() === today.getMonth();
  }).sort((a, b) => parseLocalDate(a.birthDate!).getDate() - parseLocalDate(b.birthDate!).getDate());
  
  // Only show card if there are players with birthdays
  if (thisWeekBirthdays.length === 0 && thisMonthBirthdays.length === 0) {
    return null;
  }
  
  const getAge = (birthDate: Date) => {
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  
  const isBirthdayToday = (birthDate: Date) => {
    return isSameDay(
      new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()),
      today
    );
  };

  const renderPlayerRow = (player: typeof players[0]) => {
    const birthDate = parseLocalDate(player.birthDate!);
    const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    const age = getAge(birthDate);
    const isToday = isBirthdayToday(birthDate);
    
    return (
      <div 
        key={player.id}
        className={cn(
          "flex items-center gap-3 p-2 rounded-lg transition-colors",
          isToday && "bg-primary/10 border border-primary/20"
        )}
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src={player.photoUrl} alt={player.name} />
          <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-medium">
            {player.name}
            {isToday && " 🎉"}
          </p>
          <p className="text-sm text-muted-foreground">
            {format(thisYearBirthday, "dd/MM", { locale: ptBR })} • {age} anos
          </p>
        </div>
      </div>
    );
  };
  
  return (
    <>
      <Card 
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setDialogOpen(true)}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cake className="h-5 w-5" />
            Aniversariantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {thisWeekBirthdays.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Esta Semana ({thisWeekBirthdays.length})
              </h3>
              <div className="space-y-2">
                {thisWeekBirthdays.map(renderPlayerRow)}
              </div>
            </div>
          )}
          
          {thisMonthBirthdays.length > 0 && thisWeekBirthdays.length === 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Este Mês ({thisMonthBirthdays.length})
              </h3>
              <div className="space-y-2">
                {thisMonthBirthdays.map(renderPlayerRow)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cake className="h-5 w-5" />
              Aniversariantes de {format(today, "MMMM", { locale: ptBR })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            {thisMonthBirthdays.length > 0 ? (
              thisMonthBirthdays.map(renderPlayerRow)
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum aniversariante este mês
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
