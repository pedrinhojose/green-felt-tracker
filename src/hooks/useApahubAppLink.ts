import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SETTING_KEY = 'apahub_app_url';

export function useApahubAppLink() {
  const [appUrl, setAppUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchLink = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await (supabase as any)
        .from('app_settings')
        .select('value')
        .eq('key', SETTING_KEY)
        .maybeSingle();
      if (error) throw error;
      setAppUrl((data?.value as string) ?? '');
    } catch (err) {
      console.error('fetch apahub app link error:', err);
      setAppUrl('');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveLink = async (url: string) => {
    const trimmed = url.trim();
    if (trimmed && !/^https?:\/\//i.test(trimmed)) {
      toast({
        title: 'Link inválido',
        description: 'O link deve começar com http:// ou https://',
        variant: 'destructive',
      });
      return false;
    }
    try {
      setIsSaving(true);
      const { error } = await (supabase as any)
        .from('app_settings')
        .upsert({ key: SETTING_KEY, value: trimmed }, { onConflict: 'key' });
      if (error) throw error;
      setAppUrl(trimmed);
      toast({ title: 'Link salvo', description: 'O link do app ApaHub foi atualizado.' });
      return true;
    } catch (err: any) {
      console.error('save apahub app link error:', err);
      toast({
        title: 'Erro',
        description: err?.message ?? 'Não foi possível salvar o link.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchLink();
  }, [fetchLink]);

  return { appUrl, isLoading, isSaving, saveLink, refetch: fetchLink };
}
