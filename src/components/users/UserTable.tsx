
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

interface UserTableProps {
  users: UserWithRoles[];
  isLoading: boolean;
  onToggleRole: (userId: string, role: AppRole, hasRole: boolean) => Promise<void>;
}

export function UserTable({ users, isLoading, onToggleRole }: UserTableProps) {
  return (
    <div className="rounded-md border">
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
