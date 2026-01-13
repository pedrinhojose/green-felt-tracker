import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Key, Mail, Eye, EyeOff, Loader2, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { useApahubAccessKey } from '@/hooks/useApahubAccessKey';
import { EditApahubPasswordDialog } from './EditApahubPasswordDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ApahubAccessKeyCard() {
  const { accessKey, isLoading, isSaving, createAccessKey, updatePassword, toggleActive } = useApahubAccessKey();
  
  // Form state for creating new key
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Dialog state
  const [editPasswordOpen, setEditPasswordOpen] = useState(false);

  const handleCreateKey = async () => {
    setFormError('');

    if (!email.trim()) {
      setFormError('Digite um email de acesso.');
      return;
    }

    if (!email.includes('@')) {
      setFormError('Digite um email válido.');
      return;
    }

    if (password.length < 6) {
      setFormError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('As senhas não coincidem.');
      return;
    }

    const success = await createAccessKey(email, password);
    if (success) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  // If key exists, show info
  if (accessKey) {
    return (
      <>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Chave de Acesso ApaHub</CardTitle>
            </div>
            <CardDescription>
              Esta chave permite que membros do clube visualizem dados no app ApaHub.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Email de Acesso:</span>
                  <code className="rounded bg-muted px-2 py-1 text-sm">
                    {accessKey.access_email}
                  </code>
                </div>

                <div className="flex items-center gap-2">
                  {accessKey.is_active ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
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

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="active-switch" className="text-sm">
                    {accessKey.is_active ? 'Ativo' : 'Inativo'}
                  </Label>
                  <Switch
                    id="active-switch"
                    checked={accessKey.is_active}
                    onCheckedChange={toggleActive}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setEditPasswordOpen(true)}
                disabled={isSaving}
              >
                Alterar Senha
              </Button>
            </div>
          </CardContent>
        </Card>

        <EditApahubPasswordDialog
          open={editPasswordOpen}
          onOpenChange={setEditPasswordOpen}
          onSave={updatePassword}
          isSaving={isSaving}
        />
      </>
    );
  }

  // If no key exists, show create form
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Chave de Acesso ApaHub</CardTitle>
        </div>
        <CardDescription>
          Crie uma chave de acesso para que membros do clube possam visualizar dados no app ApaHub.
          Esta é uma credencial separada do seu login de administrador.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="access-email">Email de Acesso</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="access-email"
                type="email"
                placeholder="apapoker@clube.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="access-password">Senha</Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="access-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="confirm-password">Confirmar Senha</Label>
            <Input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        {formError && (
          <p className="text-sm text-destructive">{formError}</p>
        )}

        <Button onClick={handleCreateKey} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Criar Chave de Acesso
        </Button>
      </CardContent>
    </Card>
  );
}
