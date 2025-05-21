
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserRole, AppRole } from '@/hooks/useUserRole';
import { UserProfile } from '@/lib/utils/auth';

interface UserWithRoles extends UserProfile {
  roles: AppRole[];
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { isAdmin } = useUserRole();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Buscar todos os usuários
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) throw profilesError;
      
      // Buscar todos os papéis
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
        
      if (rolesError) throw rolesError;
      
      // Mapear perfis e seus papéis
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
      console.error('Erro ao buscar usuários:', error);
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
        // Remover papel
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
        // Adicionar papel
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
      
      // Atualizar a lista de usuários
      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao modificar papel do usuário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível modificar o papel do usuário.',
        variant: 'destructive',
      });
    }
  };

  // Verificar se o usuário tem permissão para acessar esta página
  if (!isAdmin()) {
    return (
      <Card className="border-red-500">
        <CardHeader>
          <CardTitle className="text-red-500">Acesso negado</CardTitle>
          <CardDescription>
            Você não tem permissão para acessar esta página. Apenas administradores podem gerenciar usuários.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>
            Gerencie os usuários do sistema e seus papéis de acesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <Button onClick={fetchUsers} variant="outline" disabled={isLoading}>
              {isLoading ? 'Carregando...' : 'Atualizar'}
            </Button>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Papéis</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      {isLoading ? 'Carregando usuários...' : 'Nenhum usuário encontrado.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        {user.full_name || user.username || 'Usuário sem nome'}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map(role => (
                            <Badge key={role} variant={
                              role === 'admin' ? 'destructive' : 
                              role === 'player' ? 'default' : 'outline'
                            }>
                              {role}
                            </Badge>
                          ))}
                          {user.roles.length === 0 && (
                            <span className="text-gray-400 text-sm">Sem papéis</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant={user.roles.includes('admin') ? 'destructive' : 'outline'}
                            size="sm"
                            onClick={() => toggleUserRole(user.id, 'admin', user.roles.includes('admin'))}
                          >
                            {user.roles.includes('admin') ? 'Remover Admin' : 'Tornar Admin'}
                          </Button>
                          <Button
                            variant={user.roles.includes('player') ? 'destructive' : 'outline'}
                            size="sm"
                            onClick={() => toggleUserRole(user.id, 'player', user.roles.includes('player'))}
                          >
                            {user.roles.includes('player') ? 'Remover Player' : 'Tornar Player'}
                          </Button>
                          <Button
                            variant={user.roles.includes('viewer') ? 'destructive' : 'outline'}
                            size="sm"
                            onClick={() => toggleUserRole(user.id, 'viewer', user.roles.includes('viewer'))}
                          >
                            {user.roles.includes('viewer') ? 'Remover Viewer' : 'Tornar Viewer'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
