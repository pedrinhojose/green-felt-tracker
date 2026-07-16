import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (newPassword: string) => Promise<boolean>;
  isSaving: boolean;
}

export function EditViewerPasswordDialog({ open, onOpenChange, onSave, isSaving }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (password.length < 6) return setError('A senha deve ter no mínimo 6 caracteres.');
    if (password !== confirm) return setError('As senhas não coincidem.');
    const ok = await onSave(password);
    if (ok) {
      setPassword(''); setConfirm(''); onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar Senha do Visitante</DialogTitle>
          <DialogDescription>Defina uma nova senha para a credencial de visitante deste clube.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label htmlFor="new-viewer-pw">Nova senha</Label>
            <Input id="new-viewer-pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-viewer-pw-c">Confirmar senha</Label>
            <Input id="new-viewer-pw-c" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancelar</Button>
          <Button onClick={submit} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
