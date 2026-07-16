import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';

export function AddClubAdminDialog() {
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const reset = () => {
    setFullName('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization) {
      toast({ title: 'Erro', description: 'Nenhum clube selecionado.', variant: 'destructive' });
      return;
    }
    if (fullName.trim().length < 2) {
      toast({ title: 'Nome inválido', description: 'Informe o nome completo.', variant: 'destructive' });
      return;
    }
    if (!email.includes('@')) {
      toast({ title: 'Email inválido', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Senha muito curta', description: 'Mínimo 6 caracteres.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-club-admin', {
        body: {
          organization_id: currentOrganization.id,
          email: email.trim(),
          password,
          full_name: fullName.trim(),
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      toast({
        title: 'Admin criado',
        description: `${fullName} agora é administrador de ${currentOrganization.name}.`,
      });
      reset();
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Erro ao criar admin',
        description: err?.message ?? 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Adicionar Admin no Clube
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Admin no Clube</DialogTitle>
          <DialogDescription>
            Cria uma conta nova e vincula como administrador de{' '}
            <strong>{currentOrganization?.name ?? 'este clube'}</strong>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo</Label>
            <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Admin'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
