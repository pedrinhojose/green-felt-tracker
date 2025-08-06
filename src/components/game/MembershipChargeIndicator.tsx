import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, DollarSign } from "lucide-react";
import { Player, Season, Game } from "@/lib/db/models";
import { calculateTotalMembershipCharges, formatMembershipFrequency } from "@/utils/membershipUtils";

interface MembershipChargeIndicatorProps {
  players: Player[];
  season: Season;
  game: Game;
}

export const MembershipChargeIndicator = memo(function MembershipChargeIndicator({
  players,
  season,
  game
}: MembershipChargeIndicatorProps) {
  const { totalAmount, chargedPlayers } = calculateTotalMembershipCharges(
    players,
    season,
    game.date
  );

  if (totalAmount === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
          <DollarSign className="h-4 w-4" />
          Cobrança de Mensalidade
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Frequência: {formatMembershipFrequency(season.financialParams.clubMembershipFrequency)}
            </span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
              R$ {totalAmount.toFixed(2)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {chargedPlayers.length} jogadores serão cobrados
            </span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Valor será adicionado automaticamente ao caixa do clube
          </div>
        </div>
      </CardContent>
    </Card>
  );
});