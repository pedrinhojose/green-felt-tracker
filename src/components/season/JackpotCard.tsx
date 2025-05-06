
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { Season } from "@/lib/db/models";
import { AddJackpotDialog } from "@/components/jackpot/AddJackpotDialog";
import { memo } from "react";

interface JackpotCardProps {
  activeSeason: Season;
}

// Using memo to prevent unnecessary re-renders
export const JackpotCard = memo(function JackpotCard({ activeSeason }: JackpotCardProps) {
  // Get jackpot amount from active season
  const jackpotAmount = activeSeason?.jackpot || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Jackpot Final</CardTitle>
        <AddJackpotDialog />
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-3xl font-bold text-poker-gold mb-2">
            {formatCurrency(jackpotAmount)}
          </div>
          <p className="text-muted-foreground">
            O jackpot será distribuído ao encerrar a temporada conforme a configuração de premiação final.
          </p>
        </div>
      </CardContent>
    </Card>
  );
});
