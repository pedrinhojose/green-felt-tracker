
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { useOrgMemberRole } from '@/hooks/useOrgMemberRole';

export function ViewerBadge() {
  const { isViewer } = useOrgMemberRole();

  if (!isViewer) return null;

  return (
    <Badge variant="outline" className="border-poker-gold/50 text-poker-gold bg-poker-gold/10 animate-pulse">
      <Eye className="mr-1 h-3 w-3" />
      Modo Visitante
    </Badge>
  );
}
