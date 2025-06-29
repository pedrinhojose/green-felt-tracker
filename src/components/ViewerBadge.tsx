
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';

export function ViewerBadge() {
  const { isViewer } = useUserRole();
  const { user, profile } = useAuth();

  // Verificar se é o usuário visitante específico ou tem role de viewer
  const isGuestUser = user?.email === 'visitante@apapoker.com' || 
                      profile?.username === 'visitante' || 
                      isViewer;

  if (!isGuestUser) return null;

  return (
    <Badge variant="outline" className="border-poker-gold/50 text-poker-gold bg-poker-gold/10 animate-pulse">
      <Eye className="mr-1 h-3 w-3" />
      Modo Visitante
    </Badge>
  );
}
