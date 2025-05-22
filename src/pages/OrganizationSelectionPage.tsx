
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Plus } from 'lucide-react';
import { useState } from 'react';
import { OrganizationCreateModal } from '@/components/organizations/OrganizationCreateModal';

export function OrganizationSelectionPage() {
  const { organizations, selectOrganization } = useOrganization();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Selecione uma organização</CardTitle>
          <CardDescription className="text-center">
            Escolha uma organização para continuar ou crie uma nova.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {organizations.length > 0 ? (
            <div className="space-y-2">
              {organizations.map(org => (
                <Button
                  key={org.id}
                  variant="outline"
                  className="w-full flex items-center justify-start gap-2 h-auto py-3"
                  onClick={() => selectOrganization(org.id)}
                >
                  <Building className="h-4 w-4" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{org.name}</span>
                    <span className="text-xs text-muted-foreground">Função: {org.role}</span>
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Você não pertence a nenhuma organização.
            </div>
          )}

          <Button
            variant="default"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Criar nova organização</span>
          </Button>
        </CardContent>
      </Card>

      <OrganizationCreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
}
