
import { useState } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OrganizationCreateModal } from '@/components/organizations/OrganizationCreateModal';
import { Building, Plus, Settings, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RequireAuth from '@/components/RequireAuth';

export default function OrganizationsPage() {
  const { organizations, currentOrganization, selectOrganization } = useOrganization();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();
  
  return (
    <RequireAuth>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Suas organizações</h1>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nova organização
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizations.map(org => (
            <Card key={org.id} className={`
              ${org.id === currentOrganization?.id ? 'border-primary' : ''}
            `}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  {org.name}
                </CardTitle>
                <CardDescription>Função: {org.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  {org.id !== currentOrganization?.id ? (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => selectOrganization(org.id)}
                    >
                      Selecionar
                    </Button>
                  ) : (
                    <div className="text-sm text-center text-muted-foreground mb-2">
                      Organização atual
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => navigate(`/organizations/${org.id}/settings`)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configurações
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => navigate(`/organizations/${org.id}/members`)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Membros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <OrganizationCreateModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
        />
      </div>
    </RequireAuth>
  );
}
