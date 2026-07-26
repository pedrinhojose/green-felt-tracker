import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Loader2 } from 'lucide-react';
import { useApahubAppLink } from '@/hooks/useApahubAppLink';

export function ApahubAppLinkCard() {
  const { appUrl, isLoading, isSaving, saveLink } = useApahubAppLink();
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(appUrl);
  }, [appUrl]);

  return (
    <Card className="bg-slate-900/60 border-white/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-poker-gold" />
          <CardTitle className="text-lg text-white">Link de download do app ApaHub</CardTitle>
        </div>
        <CardDescription className="text-white/60">
          Link único usado por todos os clubes no botão "Enviar app ao jogador".
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="apahub-app-url" className="text-white/80">URL do app</Label>
          <Input
            id="apahub-app-url"
            placeholder="https://play.google.com/store/apps/details?id=..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button onClick={() => saveLink(value)} disabled={isSaving || isLoading}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar link
        </Button>
      </CardContent>
    </Card>
  );
}
