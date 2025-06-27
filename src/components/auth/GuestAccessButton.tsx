
import { Button } from '@/components/ui/button';
import { Eye, Loader2 } from 'lucide-react';
import { useGuestAccess } from '@/hooks/useGuestAccess';

export function GuestAccessButton() {
  const { signInAsGuest, isLoading } = useGuestAccess();

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full border-poker-gold/30 text-poker-gold hover:bg-poker-gold/10 disabled:opacity-50"
      onClick={signInAsGuest}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Entrando...
        </>
      ) : (
        <>
          <Eye className="mr-2 h-4 w-4" />
          Acesso de Visitante
        </>
      )}
    </Button>
  );
}
