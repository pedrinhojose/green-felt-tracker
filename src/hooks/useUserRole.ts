
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export type AppRole = 'admin' | 'player' | 'viewer';

export function useUserRole() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userRoles, setUserRoles] = useState<AppRole[]>([]);
  const [isCheckingRole, setIsCheckingRole] = useState<boolean>(true);

  // Carregar papéis do usuário quando o componente montar ou o usuário mudar
  const fetchUserRoles = useCallback(async () => {
    if (!user) {
      setUserRoles([]);
      setIsCheckingRole(false);
      return;
    }

    try {
      setIsCheckingRole(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      if (data) {
        const roles = data.map(item => item.role as AppRole);
        setUserRoles(roles);
      }
    } catch (error: any) {
      console.error('Erro ao buscar papéis do usuário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os papéis do usuário.',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingRole(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchUserRoles();
  }, [fetchUserRoles]);

  // Verificar se o usuário tem um papel específico
  const hasRole = useCallback((role: AppRole): boolean => {
    return userRoles.includes(role);
  }, [userRoles]);

  // Funções específicas para verificação de papéis comuns
  const isAdmin = useCallback((): boolean => {
    return hasRole('admin');
  }, [hasRole]);

  const isViewer = useCallback((): boolean => {
    return hasRole('viewer');
  }, [hasRole]);

  const isPlayer = useCallback((): boolean => {
    return hasRole('player');
  }, [hasRole]);

  // Adicionar um papel ao usuário
  const addRole = useCallback(async (role: AppRole): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: role
        });

      if (error) throw error;

      // Atualizar cache local
      setUserRoles(prev => [...prev, role]);
      
      toast({
        title: 'Sucesso',
        description: `Papel ${role} adicionado com sucesso.`
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro ao adicionar papel:', error);
      toast({
        title: 'Erro',
        description: `Não foi possível adicionar o papel ${role}.`,
        variant: 'destructive',
      });
      return false;
    }
  }, [user, toast]);

  // Remover um papel do usuário
  const removeRole = useCallback(async (role: AppRole): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id)
        .eq('role', role);

      if (error) throw error;

      // Atualizar cache local
      setUserRoles(prev => prev.filter(r => r !== role));
      
      toast({
        title: 'Sucesso',
        description: `Papel ${role} removido com sucesso.`
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro ao remover papel:', error);
      toast({
        title: 'Erro',
        description: `Não foi possível remover o papel ${role}.`,
        variant: 'destructive',
      });
      return false;
    }
  }, [user, toast]);

  return {
    userRoles,
    hasRole,
    isAdmin,
    isViewer,
    isPlayer,
    addRole,
    removeRole,
    isCheckingRole,
    refreshRoles: fetchUserRoles
  };
}
