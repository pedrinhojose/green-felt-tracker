import { usePoker } from "@/contexts/PokerContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Cake, Calendar } from "lucide-react";
import { format, isSameDay, addDays, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export function BirthdayReminderCard() {
  const { players } = usePoker();
  const navigate = useNavigate();
  
  const today = new Date();
  const weekFromNow = addDays(today, 7);
  
  // Filter players with birthdays this week
  const thisWeekBirthdays = players.filter(player => {
    if (!player.birthDate) return false;
    
    const birthDate = new Date(player.birthDate);
    const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    
    return isWithinInterval(thisYearBirthday, { start: today, end: weekFromNow });
  }).sort((a, b) => {
    const dateA = new Date(today.getFullYear(), new Date(a.birthDate!).getMonth(), new Date(a.birthDate!).getDate());
    const dateB = new Date(today.getFullYear(), new Date(b.birthDate!).getMonth(), new Date(b.birthDate!).getDate());
    return dateA.getTime() - dateB.getTime();
  });
  
  // Filter players with birthdays this month
  const thisMonthBirthdays = players.filter(player => {
    if (!player.birthDate) return false;
    return new Date(player.birthDate).getMonth() === today.getMonth();
  });
  
  // Only show card if there are players with birthdays
  if (thisWeekBirthdays.length === 0 && thisMonthBirthdays.length === 0) {
    return null;
  }
  
  const getAge = (birthDate: Date) => {
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };
  
  const isBirthdayToday = (birthDate: Date) => {
    const birth = new Date(birthDate);
    return isSameDay(
      new Date(today.getFullYear(), birth.getMonth(), birth.getDate()),
      today
    );
  };
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate("/players")}
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
              {thisWeekBirthdays.map(player => {
                const birthDate = new Date(player.birthDate!);
                const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
                const age = getAge(birthDate) + (isBirthdayToday(birthDate) ? 0 : 1);
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
              })}
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
              {thisMonthBirthdays
                .sort((a, b) => new Date(a.birthDate!).getDate() - new Date(b.birthDate!).getDate())
                .map(player => {
                  const birthDate = new Date(player.birthDate!);
                  const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
                  const age = getAge(birthDate) + (isBirthdayToday(birthDate) ? 0 : 1);
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
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}