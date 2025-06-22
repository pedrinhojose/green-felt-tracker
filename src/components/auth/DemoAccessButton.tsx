
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useDemoMode } from '@/hooks/useDemoMode';

export function DemoAccessButton() {
  const { activateDemoMode, isLoading } = useDemoMode();

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full border-poker-gold/30 text-poker-gold hover:bg-poker-gold/10"
      onClick={activateDemoMode}
      disabled={isLoading}
    >
      <Eye className="mr-2 h-4 w-4" />
      {isLoading ? 'Entrando...' : 'Modo Demo'}
    </Button>
  );
}
