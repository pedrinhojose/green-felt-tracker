import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Trash2, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { AddClubAdminDialog } from './AddClubAdminDialog';

interface ClubAdmin {
  user_id: string;
  role: string;
  created_at: string;
  full_name: string | null;
  email: string | null;
}

export function ClubAdminsCard() {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<ClubAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [pwdTarget, setPwdTarget] = useState<ClubAdmin | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAdmins = useCallback(async () => {
    if (!currentOrganization) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('club-admins', {
        body: { action: 'list', organization_id: currentOrganization.id },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setAdmins((data as any).admins ?? []);
    } catch (err: any) {
      toast({ title: 'Erro ao carregar admins', description: err?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [currentOrganization, toast]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleRemove = async (target: ClubAdmin) => {
    if (!currentOrganization) return;
    if (!confirm(`Remover ${target.full_name ?? target.email} como admin de ${currentOrganization.name}?`)) return;
    try {
      const { data, error } = await supabase.functions.invoke('club-admins', {
        body: { action: 'remove', organization_id: currentOrganization.id, user_id: target.user_id },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast({ title: 'Admin removido' });
      fetchAdmins();
    } catch (err: any) {
      toast({ title: 'Erro', description: err?.message, variant: 'destructive' });
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentOrganization || !pwdTarget) return;
    if (newPassword.length < 6) {
      toast({ title: 'Senha muito curta', description: 'Mínimo 6 caracteres.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('club-admins', {
        body: {
          action: 'update_password',
          organization_id: currentOrganization.id,
          user_id: pwdTarget.user_id,
          password: newPassword,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast({ title: 'Senha atualizada' });
      setPwdTarget(null);
      setNewPassword('');
    } catch (err: any) {
      toast({ title: 'Erro', description: err?.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (!currentOrganization) return null;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Administradores deste Clube</CardTitle>
            <CardDescription>
              Admins de <strong>{currentOrganization.name}</strong>. Poder total dentro do clube, sem acesso ao painel de Super Admin.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchAdmins} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <AddClubAdminDialog onCreated={fetchAdmins} />
          </div>
        </CardHeader>
        <CardContent>
          {loading && admins.length === 0 ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : admins.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum administrador cadastrado.</p>
          ) : (
            <div className="space-y-3">
              {admins.map((a) => {
                const isSelf = a.user_id === user?.id;
                return (
                  <div key={a.user_id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{a.full_name ?? 'Sem nome'}</p>
                        <Badge variant={a.role === 'owner' ? 'default' : 'secondary'}>{a.role}</Badge>
                        {isSelf && <Badge variant="outline">você</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{a.email ?? '—'}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setPwdTarget(a); setNewPassword(''); }}>
                        <KeyRound className="h-4 w-4 mr-2" /> Alterar senha
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemove(a)}
                        disabled={isSelf}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Remover
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!pwdTarget} onOpenChange={(o) => { if (!o) { setPwdTarget(null); setNewPassword(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
            <DialogDescription>
              Nova senha para <strong>{pwdTarget?.full_name ?? pwdTarget?.email}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="new_password">Nova senha</Label>
            <Input
              id="new_password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwdTarget(null)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleUpdatePassword} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
