import { Receipt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/navigation/PageHeader';

export default function FinanceReceivables() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Recebimentos"
        description="Controle de recebimentos e entradas financeiras do clube"
      />

      <Card className="surface-card">
        <CardContent className="p-8 text-center">
          <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Funcionalidade de recebimentos em desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
