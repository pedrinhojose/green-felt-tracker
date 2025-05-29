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
import { Mail, Building, Users } from 'lucide-react';
import { PageBreadcrumb } from '@/components/navigation/PageBreadcrumb';
import { PageHeader } from '@/components/navigation/PageHeader';

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
  const [organizationName, setOrganizationName] = useState<string>('');
  
  const { toast } = useToast();
  const { currentOrganization } = useOrganization();
  const { organizationId } = useParams<{organizationId: string}>();
  
  const orgId = organizationId || currentOrganization?.id;
  const isCurrentOrg = orgId === currentOrganization?.id;
  
  useEffect(() => {
    if (orgId) {
      fetchOrganizationDetails(orgId);
      fetchMembers(orgId);
    }
  }, [orgId]);

  const fetchOrganizationDetails = async (organizationId: string) => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', organizationId)
        .single();
      
      if (error) throw error;
      setOrganizationName(data.name);
    } catch (error: any) {
      console.error('Error fetching organization details:', error);
    }
  };

  const fetchMembers = async (organizationId: string) => {
    try {
      setIsLoading(true);
      
      // First, get organization members
      const { data: membersData, error: membersError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organizationId);
      
      if (membersError) {
        console.error('Supabase error fetching members:', membersError);
        throw membersError;
      }
      
      console.log('Members data:', membersData);
      
      if (!membersData || membersData.length === 0) {
        setMembers([]);
        return;
      }
      
      // Get all user IDs
      const userIds = membersData.map(member => member.user_id);
      
      // Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', userIds);
      
      if (profilesError) {
        console.error('Supabase error fetching profiles:', profilesError);
        throw profilesError;
      }
      
      console.log('Profiles data:', profilesData);
      
      // Combine members with their profiles
      const membersWithProfiles = membersData.map(member => {
        const profile = profilesData?.find(p => p.id === member.user_id);
        return {
          ...member,
          profile: profile ? {
            username: profile.username,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url
          } : null
        };
      });
      
      setMembers(membersWithProfiles as OrganizationMember[]);
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

  const breadcrumbItems = [
    { label: 'Organizações', href: '/organizations', icon: Building },
    { label: organizationName || 'Carregando...', href: `/organizations/${orgId}/settings` },
    { label: 'Membros', icon: Users }
  ];

  return (
    <RequireAuth>
      <div className="container mx-auto py-8">
        <PageBreadcrumb 
          items={breadcrumbItems}
          showBackButton
          backButtonLabel="Voltar para Organizações"
          backButtonHref="/organizations"
        />
        
        <PageHeader
          title="Gerenciamento de Membros"
          description={`Gerencie os membros da organização`}
          organizationId={orgId}
          organizationName={organizationName}
          isCurrentOrganization={isCurrentOrg}
        />

        <Card>
          <CardHeader>
            <CardTitle>Membros da Organização</CardTitle>
            <CardDescription>
              Convide novos membros e gerencie os papéis dos membros atuais
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
