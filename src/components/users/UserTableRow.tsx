
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserRoleToggle } from './UserRoleToggle';
import { UserWithRoles } from '@/hooks/useUserManagement';
import { AppRole } from '@/hooks/useUserRole';

interface UserTableRowProps {
  user: UserWithRoles;
  onToggleRole: (userId: string, role: AppRole, hasRole: boolean) => Promise<void>;
  isMobile?: boolean;
}

export function UserTableRow({ user, onToggleRole, isMobile = false }: UserTableRowProps) {
  if (isMobile) {
    // Mobile layout - render as card content
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {user.roles.map(role => (
            <Badge key={role} variant={
              role === 'admin' ? 'destructive' : 
              role === 'player' ? 'default' : 'outline'
            }>
              {role}
            </Badge>
          ))}
          {user.roles.length === 0 && (
            <span className="text-gray-400 text-sm">Sem papéis</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <UserRoleToggle 
            userId={user.id}
            role="admin"
            hasRole={user.roles.includes('admin')}
            onToggle={onToggleRole}
          />
          <UserRoleToggle 
            userId={user.id}
            role="player"
            hasRole={user.roles.includes('player')}
            onToggle={onToggleRole}
          />
          <UserRoleToggle 
            userId={user.id}
            role="viewer"
            hasRole={user.roles.includes('viewer')}
            onToggle={onToggleRole}
          />
        </div>
      </div>
    );
  }

  return (
    <TableRow key={user.id}>
      <TableCell>
        {user.full_name || 'Usuário sem nome'}
      </TableCell>
      <TableCell>{user.username || 'Sem nome de usuário'}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {user.roles.map(role => (
            <Badge key={role} variant={
              role === 'admin' ? 'destructive' : 
              role === 'player' ? 'default' : 'outline'
            }>
              {role}
            </Badge>
          ))}
          {user.roles.length === 0 && (
            <span className="text-gray-400 text-sm">Sem papéis</span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <UserRoleToggle 
            userId={user.id}
            role="admin"
            hasRole={user.roles.includes('admin')}
            onToggle={onToggleRole}
          />
          <UserRoleToggle 
            userId={user.id}
            role="player"
            hasRole={user.roles.includes('player')}
            onToggle={onToggleRole}
          />
          <UserRoleToggle 
            userId={user.id}
            role="viewer"
            hasRole={user.roles.includes('viewer')}
            onToggle={onToggleRole}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
