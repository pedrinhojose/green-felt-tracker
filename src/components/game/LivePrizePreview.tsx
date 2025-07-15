import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { Season } from "@/lib/db/models";
import { Trophy, Medal, Award } from "lucide-react";

interface LivePrizePreviewProps {
  totalPrizePool: number;
  activeSeason: Season | null;
}

export default function LivePrizePreview({ totalPrizePool, activeSeason }: LivePrizePreviewProps) {
  const livePrizes = useMemo(() => {
    if (!activeSeason || !activeSeason.weeklyPrizeSchema || totalPrizePool <= 0) {
      return [];
    }

    const prizeSchema = activeSeason.weeklyPrizeSchema;
    
    // Calculate prizes for top 3 positions
    return prizeSchema
      .filter(entry => entry.position <= 3)
      .sort((a, b) => a.position - b.position)
      .map(entry => ({
        position: entry.position,
        percentage: entry.percentage,
        value: (totalPrizePool * entry.percentage) / 100
      }));
  }, [totalPrizePool, activeSeason]);

  if (livePrizes.length === 0 || totalPrizePool <= 0) {
    return null;
  }

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getPositionText = (position: number) => {
    switch (position) {
      case 1:
        return "1º Lugar";
      case 2:
        return "2º Lugar";
      case 3:
        return "3º Lugar";
      default:
        return `${position}º Lugar`;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-poker-dark-green to-poker-dark-green/80 border-poker-gold/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-poker-gold" />
            Valores em Disputa
          </CardTitle>
          <Badge variant="secondary" className="bg-poker-gold/20 text-poker-gold border-poker-gold/30">
            Em Tempo Real
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {livePrizes.map(({ position, percentage, value }) => (
            <div
              key={position}
              className="bg-background/5 rounded-lg p-3 border border-poker-gold/10 hover:border-poker-gold/30 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                {getPositionIcon(position)}
                <span className="text-sm font-medium text-white">
                  {getPositionText(position)}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-poker-gold">
                  {formatCurrency(value)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {percentage}% do prêmio total
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-poker-gold/10">
          <p className="text-xs text-muted-foreground text-center">
            * Valores calculados em tempo real baseados no prêmio total atual
          </p>
        </div>
      </CardContent>
    </Card>
  );
}