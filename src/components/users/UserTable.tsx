
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserTableRow } from './UserTableRow';
import { UserWithRoles } from '@/hooks/useUserManagement';
import { AppRole } from '@/hooks/useUserRole';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserTableProps {
  users: UserWithRoles[];
  isLoading: boolean;
  onToggleRole: (userId: string, role: AppRole, hasRole: boolean) => Promise<void>;
}

export function UserTable({ users, isLoading, onToggleRole }: UserTableProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-3">
        {users.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground text-sm">
                {isLoading ? 'Carregando usuários...' : 'Nenhum usuário encontrado.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id} className="shadow-mobile">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{user.full_name || 'Usuário sem nome'}</CardTitle>
                <p className="text-sm text-muted-foreground">@{user.username || 'sem-username'}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <UserTableRow 
                  user={user}
                  onToggleRole={onToggleRole}
                  isMobile={true}
                />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="rounded-md border shadow-mobile">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Nome de usuário</TableHead>
            <TableHead>Papéis</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                {isLoading ? 'Carregando usuários...' : 'Nenhum usuário encontrado.'}
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <UserTableRow 
                key={user.id}
                user={user}
                onToggleRole={onToggleRole}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
