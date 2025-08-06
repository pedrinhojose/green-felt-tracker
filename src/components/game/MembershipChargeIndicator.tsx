import { memo, useState, useEffect } from 'react';
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
  const [membershipData, setMembershipData] = useState<{
    totalAmount: number;
    chargedPlayers: Player[];
    nonChargedPlayers: { player: Player; reason: string }[];
  } | null>(null);

  useEffect(() => {
    const calculateCharges = async () => {
      const data = await calculateTotalMembershipCharges(players, season, game.date);
      setMembershipData(data);
    };

    calculateCharges();
  }, [players, season, game.date]);

  if (!membershipData) {
    return null; // Carregando
  }

  const { totalAmount, chargedPlayers, nonChargedPlayers } = membershipData;

  if (totalAmount === 0) {
    return (
      <Card className="border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <DollarSign className="h-4 w-4" />
            Mensalidade
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Frequência: {formatMembershipFrequency(season.financialParams.clubMembershipFrequency)}
            </div>
            
            <div className="text-sm text-muted-foreground">
              Nenhum jogador será cobrado nesta partida.
            </div>
            
            {nonChargedPlayers.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Motivos:
                </div>
                <div className="space-y-1">
                  {nonChargedPlayers.map(({ player, reason }) => (
                    <div key={player.id} className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {player.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {reason}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
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
          
          {chargedPlayers.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-orange-700 dark:text-orange-300">
                Jogadores que serão cobrados:
              </div>
              <div className="flex flex-wrap gap-1">
                {chargedPlayers.map(player => (
                  <Badge key={player.id} className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                    {player.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {nonChargedPlayers.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">
                Jogadores não cobrados:
              </div>
              <div className="space-y-1">
                {nonChargedPlayers.map(({ player, reason }) => (
                  <div key={player.id} className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {player.name}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});