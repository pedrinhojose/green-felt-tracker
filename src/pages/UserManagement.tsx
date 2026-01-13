
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUserRole } from '@/hooks/useUserRole';
import { useUserManagement } from '@/hooks/useUserManagement';
import { UserTable } from '@/components/users/UserTable';
import { ApahubAccessKeyCard } from '@/components/users/ApahubAccessKeyCard';

export default function UserManagement() {
  const { users, isLoading, fetchUsers, toggleUserRole } = useUserManagement();
  const { isAdmin } = useUserRole();

  // Check if the user has permission to access this page
  if (!isAdmin()) {
    return (
      <Card className="border-red-500">
        <CardHeader>
          <CardTitle className="text-red-500">Acesso negado</CardTitle>
          <CardDescription>
            Você não tem permissão para acessar esta página. Apenas administradores podem gerenciar usuários.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>
            Gerencie os usuários do sistema e seus papéis de acesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <Button onClick={fetchUsers} variant="outline" disabled={isLoading}>
              {isLoading ? 'Carregando...' : 'Atualizar'}
            </Button>
          </div>
          
          <UserTable 
            users={users}
            isLoading={isLoading}
            onToggleRole={toggleUserRole}
          />
        </CardContent>
      </Card>

      {/* Seção de Chave de Acesso ApaHub */}
      <ApahubAccessKeyCard />
    </div>
  );
}
