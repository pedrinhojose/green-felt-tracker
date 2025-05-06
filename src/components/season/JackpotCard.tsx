
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { Season } from "@/lib/db/models";
import { AddJackpotDialog } from "@/components/jackpot/AddJackpotDialog";

interface JackpotCardProps {
  activeSeason: Season;
}

export function JackpotCard({ activeSeason }: JackpotCardProps) {
  // Usar o valor do jackpot diretamente do objeto activeSeason
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
}
