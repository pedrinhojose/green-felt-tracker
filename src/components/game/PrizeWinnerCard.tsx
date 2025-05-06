
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";

interface PrizeWinnerCardProps {
  position: number;
  playerName: string;
  photoUrl?: string | null;
  prize: number;
  showCard: boolean;
}

export default function PrizeWinnerCard({ position, playerName, photoUrl, prize, showCard }: PrizeWinnerCardProps) {
  if (!showCard) return null;

  const getPositionIcon = () => {
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

  const getPositionColor = () => {
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
    <Card className={`overflow-hidden border ${getPositionColor()} w-full`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-poker-dark-green">
              {photoUrl ? (
                <AvatarImage src={photoUrl} alt={playerName} />
              ) : (
                <AvatarFallback className="bg-poker-dark-green text-white">
                  {getInitials(playerName)}
                </AvatarFallback>
              )}
            </Avatar>
            {/* Movido o ícone para fora do avatar, agora aparece ao lado */}
            <div className="absolute -top-2 -right-6 bg-card p-1 rounded-full">
              {getPositionIcon()}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{playerName}</div>
            <div className="text-poker-gold font-bold">{formatCurrency(prize)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
