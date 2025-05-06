
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { Season } from "@/lib/db/models";
import { Button } from "@/components/ui/button";
import { AddJackpotDialog } from "@/components/jackpot/AddJackpotDialog";
import { PlusCircle } from "lucide-react";

interface JackpotCardProps {
  activeSeason: Season;
}

export function JackpotCard({ activeSeason }: JackpotCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Jackpot Final</CardTitle>
        <AddJackpotDialog />
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
