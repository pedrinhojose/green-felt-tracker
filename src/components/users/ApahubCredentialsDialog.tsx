import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Copy, Check, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApahubCredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  password: string;
  title?: string;
}

export function ApahubCredentialsDialog({
  open,
  onOpenChange,
  email,
  password,
  title = 'Credenciais de acesso ApaHub',
}: ApahubCredentialsDialogProps) {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copy = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
      toast({ title: 'Copiado', description: `${field} copiado para a área de transferência.` });
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível copiar.', variant: 'destructive' });
    }
  };

  const copyBoth = () =>
    copy(`Email: ${email}\nSenha: ${password}`, 'Credenciais');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Copie e envie ao jogador. Por segurança, a senha é armazenada com criptografia
            irreversível e <strong>não poderá ser exibida novamente</strong>. Se perder,
            será necessário gerar uma nova.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 flex gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <span>Guarde esta senha agora — depois de fechar esta janela ela não aparece mais.</span>
        </div>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="flex gap-2">
              <code className="flex-1 rounded bg-muted px-3 py-2 text-sm break-all">{email}</code>
              <Button type="button" variant="outline" size="icon" onClick={() => copy(email, 'Email')}>
                {copiedField === 'Email' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Senha</Label>
            <div className="flex gap-2">
              <code className="flex-1 rounded bg-muted px-3 py-2 text-sm break-all font-mono">
                {password}
              </code>
              <Button type="button" variant="outline" size="icon" onClick={() => copy(password, 'Senha')}>
                {copiedField === 'Senha' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={copyBoth}>
            <Copy className="mr-2 h-4 w-4" /> Copiar email e senha
          </Button>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
