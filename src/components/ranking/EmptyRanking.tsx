
import { Card, CardContent } from "@/components/ui/card";

interface EmptyRankingProps {
  activeSeason: boolean;
}

export default function EmptyRanking({ activeSeason }: EmptyRankingProps) {
  return (
    <div className="text-center py-10">
      <p className="text-muted-foreground mb-4">Nenhuma pontuação registrada ainda</p>
      <Card className="max-w-md mx-auto p-6 bg-poker-dark-green">
        <CardContent className="text-center">
          <p>
            O ranking será atualizado após a finalização das partidas.
            {!activeSeason && ' Crie uma temporada para começar.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export { EmptyRanking };
