
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award } from "lucide-react";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { PlayerPerformanceStats } from "@/hooks/reports/types";

interface JackpotWinner {
  playerId: string;
  playerName: string;
  photoUrl?: string;
  position: number;
  jackpotAmount: number;
}

interface JackpotWinnersCardProps {
  jackpotWinners: JackpotWinner[];
  totalJackpot: number;
}

export default function JackpotWinnersCard({ jackpotWinners, totalJackpot }: JackpotWinnersCardProps) {
  if (!jackpotWinners.length) {
    return null;
  }
  
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-poker-gold" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-700" />;
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return "border-poker-gold bg-poker-gold/10";
      case 2:
        return "border-gray-400 bg-gray-400/10";
      case 3:
        return "border-amber-700 bg-amber-700/10";
      default:
        return "border-gray-700 bg-gray-700/10";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Distribuição do Jackpot</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-muted-foreground mb-1">Valor Total do Jackpot:</p>
          <p className="text-2xl font-bold text-poker-gold">{formatCurrency(totalJackpot)}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {jackpotWinners.map((winner) => (
            <div key={winner.playerId} className={`overflow-hidden border ${getPositionColor(winner.position)} rounded-lg p-4`}>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-poker-dark-green">
                    {winner.photoUrl ? (
                      <AvatarImage src={winner.photoUrl} alt={winner.playerName} />
                    ) : (
                      <AvatarFallback className="bg-poker-dark-green text-white">
                        {getInitials(winner.playerName)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {/* Movido o ícone para fora do avatar, agora aparece ao lado */}
                  <div className="absolute -top-2 -right-6 bg-card p-1 rounded-full">
                    {getPositionIcon(winner.position)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{winner.playerName}</div>
                  <div className="text-poker-gold font-bold">{formatCurrency(winner.jackpotAmount)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
