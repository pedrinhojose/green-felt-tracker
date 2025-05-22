
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { AppRole } from '@/hooks/useUserRole';
import { Database } from '@/integrations/supabase/types';

// Interface for user with roles
export interface UserWithRoles {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
  default_role: Database["public"]["Enums"]["app_role"];
  roles: AppRole[];
}

export function useUserManagement() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) throw profilesError;
      
      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
        
      if (rolesError) throw rolesError;
      
      // Map profiles and their roles
      const usersWithRoles: UserWithRoles[] = profiles.map(profile => {
        const userRoles = roles
          .filter(role => role.user_id === profile.id)
          .map(role => role.role as AppRole);
          
        return {
          ...profile,
          roles: userRoles
        };
      });
      
      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserRole = async (userId: string, role: AppRole, currentlyHasRole: boolean) => {
    try {
      if (currentlyHasRole) {
        // Remove role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);
          
        if (error) throw error;
        
        toast({
          title: 'Papel removido',
          description: `O papel ${role} foi removido do usuário`,
        });
      } else {
        // Add role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: role
          });
          
        if (error) throw error;
        
        toast({
          title: 'Papel adicionado',
          description: `O papel ${role} foi adicionado ao usuário`,
        });
      }
      
      // Update the list of users
      await fetchUsers();
    } catch (error: any) {
      console.error('Error modifying user role:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível modificar o papel do usuário.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    isLoading,
    fetchUsers,
    toggleUserRole
  };
}
