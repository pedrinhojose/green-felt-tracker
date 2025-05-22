
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
import RequireAuth from '@/components/RequireAuth';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';

interface OrganizationMember {
  id: string;
  user_id: string;
  organization_id: string;
  role: string;
  profile?: {
    username?: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
  };
}

export default function OrganizationMembersPage() {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const { toast } = useToast();
  const { currentOrganization } = useOrganization();
  const { organizationId } = useParams<{organizationId: string}>();
  
  const orgId = organizationId || currentOrganization?.id;
  
  useEffect(() => {
    if (orgId) {
      fetchMembers(orgId);
    }
  }, [orgId]);

  const fetchMembers = async (organizationId: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          profile:profiles(username, full_name, avatar_url)
        `)
        .eq('organization_id', organizationId);
      
      if (error) throw error;
      
      setMembers(data as OrganizationMember[]);
    } catch (error: any) {
      console.error('Error fetching members:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os membros.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail || !orgId) return;
    
    try {
      setIsSending(true);
      
      // This is just a placeholder - in a real app, you would implement 
      // a server-side function to send invitations
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Convite enviado',
        description: `Um convite foi enviado para ${inviteEmail}`,
      });
      
      setInviteEmail('');
    } catch (error: any) {
      console.error('Error sending invite:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o convite.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <RequireAuth>
      <div className="container mx-auto py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Gerenciamento de Membros</CardTitle>
            <CardDescription>
              Gerencie os membros da organização {currentOrganization?.name || ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Convidar novo membro</h3>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input 
                    placeholder="Email do convidado"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={sendInvite} 
                  disabled={isSending || !inviteEmail}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {isSending ? 'Enviando...' : 'Enviar convite'}
                </Button>
              </div>
            </div>
            
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-medium">Membros atuais</h3>
              <Button onClick={() => fetchMembers(orgId!)} variant="outline" disabled={isLoading}>
                {isLoading ? 'Carregando...' : 'Atualizar'}
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8">
                        {isLoading ? 'Carregando membros...' : 'Nenhum membro encontrado.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          {member.profile?.full_name || member.profile?.username || 'Usuário sem nome'}
                        </TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                          >
                            Remover
                          </Button>
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
    </RequireAuth>
  );
}
