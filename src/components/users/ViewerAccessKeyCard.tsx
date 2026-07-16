import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Mail, Key, EyeOff, Loader2, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { useViewerAccessKey } from '@/hooks/useViewerAccessKey';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EditViewerPasswordDialog } from './EditViewerPasswordDialog';

export function ViewerAccessKeyCard() {
  const { accessKey, isLoading, isSaving, createOrUpdateKey, updatePassword, toggleActive } = useViewerAccessKey();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [editOpen, setEditOpen] = useState(false);

  const submit = async () => {
    setFormError('');
    if (!email.trim() || !email.includes('@')) return setFormError('Digite um email válido.');
    if (password.length < 6) return setFormError('A senha deve ter no mínimo 6 caracteres.');
    if (password !== confirmPassword) return setFormError('As senhas não coincidem.');
    const ok = await createOrUpdateKey(email, password);
    if (ok) {
      setEmail(''); setPassword(''); setConfirmPassword('');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-56" /><Skeleton className="h-4 w-72" /></CardHeader>
        <CardContent><Skeleton className="h-24 w-full" /></CardContent>
      </Card>
    );
  }

  if (accessKey) {
    return (
      <>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Credencial de Visitante</CardTitle>
            </div>
            <CardDescription>
              Compartilhe estas credenciais com quem só precisa <strong>visualizar</strong> os dados do clube.
              O visitante não consegue criar, editar ou apagar nada.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Email:</span>
                  <code className="rounded bg-muted px-2 py-1 text-sm">{accessKey.access_email}</code>
                </div>
                <div className="flex items-center gap-2">
                  {accessKey.is_active ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-destructive" />}
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={accessKey.is_active ? 'default' : 'secondary'}>
                    {accessKey.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Atualizado em:</span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(accessKey.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="viewer-active-switch" className="text-sm">
                  {accessKey.is_active ? 'Ativo' : 'Inativo'}
                </Label>
                <Switch id="viewer-active-switch" checked={accessKey.is_active} onCheckedChange={toggleActive} disabled={isSaving} />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditOpen(true)} disabled={isSaving}>
                Alterar Senha
              </Button>
            </div>
          </CardContent>
        </Card>
        <EditViewerPasswordDialog open={editOpen} onOpenChange={setEditOpen} onSave={updatePassword} isSaving={isSaving} />
      </>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Credencial de Visitante</CardTitle>
        </div>
        <CardDescription>
          Crie um email e senha que qualquer pessoa possa usar para <strong>visualizar</strong> os dados deste clube.
          O visitante entra em modo somente leitura — não consegue criar, editar ou apagar nada, e não vê as telas de Configuração, Caixinha, Jogadores nem Usuários.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="viewer-email">Email de Acesso</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="viewer-email" type="email" placeholder="visitantes@meuclube.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="viewer-password">Senha</Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="viewer-password" type={showPassword ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" />
              <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="viewer-confirm">Confirmar Senha</Label>
            <Input id="viewer-confirm" type={showPassword ? 'text' : 'password'} placeholder="Digite a senha novamente" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        </div>
        {formError && <p className="text-sm text-destructive">{formError}</p>}
        <Button onClick={submit} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Criar Credencial de Visitante
        </Button>
      </CardContent>
    </Card>
  );
}
