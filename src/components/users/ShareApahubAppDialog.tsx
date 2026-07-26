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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Smartphone, AlertTriangle, MessageCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApahubAppLink } from '@/hooks/useApahubAppLink';

interface ShareApahubAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Email da credencial — quando informado, a mensagem completa inclui o login */
  email?: string;
  /** Senha em texto puro — só disponível logo após criar/gerar a senha */
  password?: string;
}

export function ShareApahubAppDialog({
  open,
  onOpenChange,
  email,
  password,
}: ShareApahubAppDialogProps) {
  const { appUrl, isLoading } = useApahubAppLink();
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [manualPassword, setManualPassword] = useState('');

  const effectivePassword = password || manualPassword.trim();

  const buildMessage = () => {
    const lines = [
      'Olá! Para acompanhar os dados do nosso clube, baixe o app ApaHub:',
      appUrl,
    ];
    if (email) {
      lines.push('', 'Seus dados de acesso:', `Email: ${email}`);
      if (effectivePassword) lines.push(`Senha: ${effectivePassword}`);
    }
    return lines.join('\n');
  };

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

  const openWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(buildMessage())}`, '_blank');
  };

  const hasLink = Boolean(appUrl);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" /> Enviar app ao jogador
          </DialogTitle>
          <DialogDescription>
            O jogador precisa baixar o app ApaHub e entrar com o email e a senha que você
            gerou para o clube. Copie o link (ou a mensagem completa) e envie pelo WhatsApp.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="py-4 text-sm text-muted-foreground">Carregando link...</p>
        ) : !hasLink ? (
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 flex gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              O link de download do app ainda não foi configurado pelo Super Admin da
              plataforma. Solicite o cadastro do link para poder compartilhar.
            </span>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Link do app</Label>
              <div className="flex gap-2">
                <code className="flex-1 rounded bg-muted px-3 py-2 text-sm break-all">{appUrl}</code>
                <Button type="button" variant="outline" size="icon" onClick={() => copy(appUrl, 'Link')}>
                  {copiedField === 'Link' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {email && (
              <div className="space-y-2">
                <Label>Email de acesso</Label>
                <code className="block rounded bg-muted px-3 py-2 text-sm break-all">{email}</code>
              </div>
            )}

            {email && !password && (
              <div className="space-y-2">
                <Label htmlFor="share-password">Senha do clube</Label>
                <Input
                  id="share-password"
                  type="text"
                  placeholder="Digite a senha que você cadastrou"
                  value={manualPassword}
                  onChange={(e) => setManualPassword(e.target.value)}
                />
                <div className="rounded-md border border-muted bg-muted/40 p-3 flex gap-2 text-xs text-muted-foreground">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    A senha é guardada criptografada e não pode ser recuperada pelo sistema.
                    Digite aqui a senha que você cadastrou para incluí-la na mensagem — ou use
                    <strong> Gerar nova senha</strong> no card da chave.
                  </span>
                </div>
              </div>
            )}


            <div className="rounded-md border border-muted bg-muted/40 p-3 text-sm whitespace-pre-wrap text-muted-foreground">
              {buildMessage()}
            </div>

            <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Clique em <strong>Copiar mensagem</strong> ou <strong>Copiar link</strong>.</li>
              <li>Abra seus contatos no WhatsApp.</li>
              <li>Envie a mensagem para os seus jogadores.</li>
            </ol>
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-2">
          {hasLink && (
            <>
              <Button className="w-full sm:w-auto" variant="outline" onClick={() => copy(buildMessage(), 'Mensagem')}>
                <Copy className="mr-2 h-4 w-4" /> Copiar mensagem
              </Button>
              <Button className="w-full sm:w-auto" onClick={openWhatsApp}>
                <MessageCircle className="mr-2 h-4 w-4" /> Abrir WhatsApp
              </Button>
            </>
          )}
          <Button className="w-full sm:w-auto" variant={hasLink ? 'ghost' : 'default'} onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
