
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Award, Star } from "lucide-react";

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
        // Para 4º lugar em diante, usa Star com número
        return (
          <div className="relative">
            <Star className="h-6 w-6 text-poker-blue" />
            <span className="absolute -bottom-1 -right-1 text-[10px] font-bold text-poker-blue">
              {position}º
            </span>
          </div>
        );
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
        return "border-poker-blue bg-poker-blue/10";
    }
  };

  return (
    <Card className={`overflow-hidden border ${getPositionColor()} w-full`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12 border-2 border-poker-dark-green">
            {photoUrl ? (
              <AvatarImage src={photoUrl} alt={playerName} />
            ) : (
              <AvatarFallback className="bg-poker-dark-green text-white">
                {getInitials(playerName)}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex flex-1 items-center space-x-2">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{playerName}</div>
              <div className="text-poker-gold font-bold">{formatCurrency(prize)}</div>
            </div>
            
            <div className="flex-shrink-0">
              {getPositionIcon()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
