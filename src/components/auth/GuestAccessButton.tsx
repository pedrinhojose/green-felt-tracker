
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useGuestAccess } from '@/hooks/useGuestAccess';

export function GuestAccessButton() {
  const { signInAsGuest, isLoading } = useGuestAccess();

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full border-poker-gold/30 text-poker-gold hover:bg-poker-gold/10"
      onClick={signInAsGuest}
      disabled={isLoading}
    >
      <Eye className="mr-2 h-4 w-4" />
      {isLoading ? 'Entrando...' : 'Acesso de Visitante'}
    </Button>
  );
}
