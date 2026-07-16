import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { ViewerLoginDialog } from './ViewerLoginDialog';

export function GuestAccessButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full border-poker-gold/30 text-poker-gold hover:bg-poker-gold/10 transition-all duration-200 mobile-button"
        onClick={() => setOpen(true)}
      >
        <Eye className="mr-2 h-4 w-4" />
        <span className="mobile-text">Acesso de Visitante</span>
      </Button>
      <ViewerLoginDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
