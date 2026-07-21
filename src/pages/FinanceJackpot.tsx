import { Coins } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/navigation/PageHeader';

export default function FinanceJackpot() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Jackpot"
        description="Gestão do jackpot acumulado e premiações do clube"
      />

      <Card className="surface-card">
        <CardContent className="p-8 text-center">
          <Coins className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Funcionalidade de jackpot em desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
