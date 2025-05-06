
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { Season } from "@/lib/db/models";

interface JackpotCardProps {
  activeSeason: Season;
}

export function JackpotCard({ activeSeason }: JackpotCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Jackpot Final</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-3xl font-bold text-poker-gold mb-2">
            {formatCurrency(activeSeason.jackpot)}
          </div>
          <p className="text-muted-foreground">
            O jackpot será distribuído ao encerrar a temporada conforme a configuração de premiação final.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
