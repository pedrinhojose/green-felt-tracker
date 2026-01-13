import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface ApahubAccessKey {
  id: string;
  organization_id: string;
  access_email: string;
  organization_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useApahubAccessKey() {
  const [accessKey, setAccessKey] = useState<ApahubAccessKey | null>(null);
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
      const { data, error } = await supabase
        .from('apahub_access_keys')
        .select('id, organization_id, access_email, organization_name, is_active, created_at, updated_at')
        .eq('organization_id', currentOrganization.id)
        .maybeSingle();

      if (error) throw error;
      setAccessKey(data);
    } catch (error: any) {
      console.error('Error fetching ApaHub access key:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a chave de acesso.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganization?.id, toast]);

  const createAccessKey = async (email: string, password: string) => {
    if (!currentOrganization?.id) {
      toast({
        title: 'Erro',
        description: 'Organização não selecionada.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      setIsSaving(true);
      const { data, error } = await supabase.rpc('create_apahub_access_key', {
        p_organization_id: currentOrganization.id,
        p_access_email: email.toLowerCase(),
        p_password: password,
        p_organization_name: currentOrganization.name
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setAccessKey(data[0] as ApahubAccessKey);
      }

      toast({
        title: 'Chave criada',
        description: 'A chave de acesso ApaHub foi criada com sucesso.',
      });

      return true;
    } catch (error: any) {
      console.error('Error creating ApaHub access key:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível criar a chave de acesso.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    if (!currentOrganization?.id) {
      toast({
        title: 'Erro',
        description: 'Organização não selecionada.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      setIsSaving(true);
      const { error } = await supabase.rpc('update_apahub_access_key_password', {
        p_organization_id: currentOrganization.id,
        p_new_password: newPassword
      });

      if (error) throw error;

      await fetchAccessKey();

      toast({
        title: 'Senha atualizada',
        description: 'A senha foi alterada com sucesso.',
      });

      return true;
    } catch (error: any) {
      console.error('Error updating ApaHub access key password:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar a senha.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async () => {
    if (!currentOrganization?.id) {
      toast({
        title: 'Erro',
        description: 'Organização não selecionada.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      setIsSaving(true);
      const { data: newStatus, error } = await supabase.rpc('toggle_apahub_access_key', {
        p_organization_id: currentOrganization.id
      });

      if (error) throw error;

      setAccessKey(prev => prev ? { ...prev, is_active: newStatus } : null);

      toast({
        title: newStatus ? 'Chave ativada' : 'Chave desativada',
        description: newStatus 
          ? 'A chave de acesso foi ativada.' 
          : 'A chave de acesso foi desativada.',
      });

      return true;
    } catch (error: any) {
      console.error('Error toggling ApaHub access key:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível alterar o status da chave.',
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
    createAccessKey,
    updatePassword,
    toggleActive,
    refetch: fetchAccessKey
  };
}
