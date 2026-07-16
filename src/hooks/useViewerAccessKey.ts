import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface ViewerAccessKey {
  id: string;
  organization_id: string;
  access_email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useViewerAccessKey() {
  const [accessKey, setAccessKey] = useState<ViewerAccessKey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { currentOrganization } = useOrganization();

  const fetchAccessKey = useCallback(async () => {
    if (!currentOrganization?.id) {
      setAccessKey(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const { data, error } = await (supabase as any)
        .from('organization_viewer_keys')
        .select('id, organization_id, access_email, is_active, created_at, updated_at')
        .eq('organization_id', currentOrganization.id)
        .maybeSingle();
      if (error) throw error;
      setAccessKey(data);
    } catch (err: any) {
      console.error('fetch viewer key error:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a credencial de visitante.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganization?.id, toast]);

  const createOrUpdateKey = async (email: string, password: string) => {
    if (!currentOrganization?.id) return false;
    try {
      setIsSaving(true);
      const { data, error } = await supabase.functions.invoke('create-viewer-account', {
        body: {
          organization_id: currentOrganization.id,
          access_email: email,
          password,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      await fetchAccessKey();
      toast({
        title: 'Credencial salva',
        description: 'A credencial de visitante foi salva com sucesso.',
      });
      return true;
    } catch (err: any) {
      console.error('create viewer key error:', err);
      toast({
        title: 'Erro',
        description: err?.message ?? 'Não foi possível salvar a credencial.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    if (!currentOrganization?.id || !accessKey) return false;
    return createOrUpdateKey(accessKey.access_email, newPassword);
  };

  const toggleActive = async () => {
    if (!currentOrganization?.id) return false;
    try {
      setIsSaving(true);
      const { data: newStatus, error } = await (supabase.rpc as any)('toggle_organization_viewer_key', {
        p_organization_id: currentOrganization.id,
      });
      if (error) throw error;
      setAccessKey((prev) => (prev ? { ...prev, is_active: newStatus as boolean } : null));
      toast({
        title: newStatus ? 'Credencial ativada' : 'Credencial desativada',
        description: newStatus
          ? 'Os visitantes podem entrar novamente.'
          : 'Os visitantes não conseguirão mais entrar.',
      });
      return true;
    } catch (err: any) {
      console.error('toggle viewer key error:', err);
      toast({
        title: 'Erro',
        description: err?.message ?? 'Não foi possível alterar o status.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchAccessKey();
  }, [fetchAccessKey]);

  return {
    accessKey,
    isLoading,
    isSaving,
    createOrUpdateKey,
    updatePassword,
    toggleActive,
    refetch: fetchAccessKey,
  };
}
