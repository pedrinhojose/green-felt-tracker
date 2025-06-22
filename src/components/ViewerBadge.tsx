
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

export function ViewerBadge() {
  const { isViewer } = useUserRole();

  if (!isViewer()) return null;

  return (
    <Badge variant="outline" className="border-poker-gold/50 text-poker-gold bg-poker-gold/10">
      <Eye className="mr-1 h-3 w-3" />
      Modo Visitante
    </Badge>
  );
}
