import React, { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Building2, Users, Crown, Lock, Unlock, Loader2 } from 'lucide-react';

interface ClubRow {
  id: string;
  name: string;
  created_at: string;
  subscription_plan: string;
  plan_status: string;
  is_blocked: boolean;
  player_count: number;
  admin_count: number;
  last_admin_sign_in: string | null;
}

interface DashboardData {
  totalClubs: number;
  totalActivePlayers: number;
  totalAdmins: number;
  clubs: ClubRow[];
}

const PLAN_OPTIONS = ['free', 'bronze', 'prata', 'ouro', 'diamante'];
const STATUS_OPTIONS: Array<{ value: string; label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = [
  { value: 'active', label: 'Ativo', variant: 'default' },
  { value: 'pending', label: 'Pendente', variant: 'secondary' },
  { value: 'cancelled', label: 'Cancelado', variant: 'destructive' },
];

function formatDate(value: string | null) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return value;
  }
}

function formatDateOnly(value: string) {
  try {
    return new Date(value).toLocaleDateString('pt-BR');
  } catch {
    return value;
  }
}

export default function SuperAdminDashboard() {
  const { isSuperAdmin, isCheckingRole } = useUserRole();
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: raw, error } = await supabase.rpc('get_super_admin_dashboard');
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }
    setData(raw as unknown as DashboardData);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    if (!isCheckingRole && isSuperAdmin()) load();
  }, [isCheckingRole, isSuperAdmin, load]);

  if (isCheckingRole) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-poker-gold" />
      </div>
    );
  }

  if (!isSuperAdmin()) return <Navigate to="/dashboard" replace />;

  async function updateClub(
    id: string,
    patch: { plan_status?: string; is_blocked?: boolean; subscription_plan?: string },
  ) {
    setSavingId(id);
    const { error } = await supabase.rpc('super_admin_set_organization_status', {
      p_organization_id: id,
      p_plan_status: patch.plan_status ?? null,
      p_is_blocked: patch.is_blocked ?? null,
      p_subscription_plan: patch.subscription_plan ?? null,
    });
    setSavingId(null);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Atualizado', description: 'Clube atualizado com sucesso.' });
    load();
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <header className="flex items-center gap-3">
        <Crown className="h-7 w-7 text-poker-gold" />
        <div>
          <h1 className="text-2xl font-bold text-white">Painel do Super Admin</h1>
          <p className="text-white/60 text-sm">Visão global de todos os clubes da plataforma.</p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900/60 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Clubes cadastrados</CardTitle>
            <Building2 className="h-4 w-4 text-poker-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{data?.totalClubs ?? '—'}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/60 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Jogadores ativos</CardTitle>
            <Users className="h-4 w-4 text-poker-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{data?.totalActivePlayers ?? '—'}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/60 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Administradores de clube</CardTitle>
            <Crown className="h-4 w-4 text-poker-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{data?.totalAdmins ?? '—'}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/60 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Clubes cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-poker-gold" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-white/70">Clube</TableHead>
                    <TableHead className="text-white/70">Cadastro</TableHead>
                    <TableHead className="text-white/70">Plano</TableHead>
                    <TableHead className="text-white/70">Status</TableHead>
                    <TableHead className="text-white/70">Último acesso admin</TableHead>
                    <TableHead className="text-white/70">Jogadores</TableHead>
                    <TableHead className="text-white/70 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.clubs ?? []).map((club) => {
                    const status = STATUS_OPTIONS.find((s) => s.value === club.plan_status);
                    const saving = savingId === club.id;
                    return (
                      <TableRow key={club.id} className="border-white/10">
                        <TableCell className="text-white font-medium">
                          {club.name}
                          {club.is_blocked && (
                            <Badge variant="destructive" className="ml-2">Bloqueado</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-white/80">{formatDateOnly(club.created_at)}</TableCell>
                        <TableCell>
                          <Select
                            value={club.subscription_plan}
                            onValueChange={(v) => updateClub(club.id, { subscription_plan: v })}
                            disabled={saving}
                          >
                            <SelectTrigger className="w-32 bg-slate-800 border-white/10 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PLAN_OPTIONS.map((p) => (
                                <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={club.plan_status}
                            onValueChange={(v) => updateClub(club.id, { plan_status: v })}
                            disabled={saving}
                          >
                            <SelectTrigger className="w-36 bg-slate-800 border-white/10 text-white">
                              <SelectValue>
                                {status && <Badge variant={status.variant}>{status.label}</Badge>}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-white/80">{formatDate(club.last_admin_sign_in)}</TableCell>
                        <TableCell className="text-white/80">
                          {club.player_count} <span className="text-white/50">/ {club.admin_count} admin</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant={club.is_blocked ? 'default' : 'destructive'}
                            onClick={() => updateClub(club.id, { is_blocked: !club.is_blocked })}
                            disabled={saving}
                          >
                            {club.is_blocked ? (
                              <><Unlock className="h-4 w-4 mr-1" /> Desbloquear</>
                            ) : (
                              <><Lock className="h-4 w-4 mr-1" /> Bloquear</>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!data?.clubs || data.clubs.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-white/60 py-8">
                        Nenhum clube cadastrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
