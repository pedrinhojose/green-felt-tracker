
import { Button } from '@/components/ui/button';
import { AppRole } from '@/hooks/useUserRole';

interface UserRoleToggleProps {
  userId: string;
  role: AppRole;
  hasRole: boolean;
  onToggle: (userId: string, role: AppRole, hasRole: boolean) => Promise<void>;
}

export function UserRoleToggle({ userId, role, hasRole, onToggle }: UserRoleToggleProps) {
  return (
    <Button
      variant={hasRole ? 'destructive' : 'outline'}
      size="sm"
      onClick={() => onToggle(userId, role, hasRole)}
    >
      {hasRole ? `Remover ${role}` : `Tornar ${role}`}
    </Button>
  );
}
