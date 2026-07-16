import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cleanupAuthState } from '@/lib/utils/auth';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewerLoginDialog({ open, onOpenChange }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submit = async () => {
    if (!email.trim() || !password) {
      toast({ title: 'Preencha email e senha', variant: 'destructive' });
      return;
    }
    try {
      setLoading(true);
      cleanupAuthState();
      try { await supabase.auth.signOut({ scope: 'global' }); } catch {}
      await new Promise((r) => setTimeout(r, 200));

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw error;

      toast({
        title: 'Bem-vindo, visitante!',
        description: 'Você está em modo somente leitura.',
      });
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('viewer login error:', err);
      toast({
        title: 'Não foi possível entrar',
        description:
          err?.message?.includes('Invalid login credentials')
            ? 'Email ou senha incorretos.'
            : err?.message ?? 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" /> Acesso de Visitante
          </DialogTitle>
          <DialogDescription>
            Use o email e senha que o administrador do clube compartilhou com você. O acesso é somente leitura.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label htmlFor="viewer-login-email">Email</Label>
            <Input id="viewer-login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="visitantes@meuclube.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="viewer-login-pw">Senha</Label>
            <Input id="viewer-login-pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
          <Button onClick={submit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Entrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
