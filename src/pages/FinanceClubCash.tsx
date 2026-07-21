import { Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/navigation/PageHeader';

export default function FinanceClubCash() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Caixa do Clube"
        description="Movimentação e saldo geral do caixa do clube"
      />

      <Card className="surface-card">
        <CardContent className="p-8 text-center">
          <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Funcionalidade de caixa do clube em desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
