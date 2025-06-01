
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
import { Mail, Building, Users, UserPlus } from 'lucide-react';
import { PageBreadcrumb } from '@/components/navigation/PageBreadcrumb';
import { PageHeader } from '@/components/navigation/PageHeader';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';

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

type ErrorType = 'network' | 'permission' | 'not_found' | 'unknown';

interface LoadingState {
  members: boolean;
  organization: boolean;
  invite: boolean;
}

interface ErrorState {
  type?: ErrorType;
  message: string;
  hasMembers?: boolean;
  hasOrganization?: boolean;
}

export default function OrganizationMembersPage() {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    members: true,
    organization: true,
    invite: false
  });
  const [error, setError] = useState<ErrorState | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [organizationName, setOrganizationName] = useState<string>('');
  
  const { toast } = useToast();
  const { currentOrganization } = useOrganization();
  const { organizationId } = useParams<{organizationId: string}>();
  
  const orgId = organizationId || currentOrganization?.id;
  const isCurrentOrg = orgId === currentOrganization?.id;

  const getErrorMessage = (errorType: ErrorType, context: 'members' | 'organization') => {
    switch (errorType) {
      case 'permission':
        return context === 'members' 
          ? 'Você não tem permissão para visualizar os membros desta organização.'
          : 'Você não tem permissão para acessar esta organização.';
      case 'not_found':
        return context === 'members'
          ? 'Esta organização ainda não possui membros cadastrados.'
          : 'Esta organização não foi encontrada ou não existe.';
      case 'network':
        return 'Problemas de conexão. Verifique sua internet e tente novamente.';
      default:
        return context === 'members'
          ? 'Erro inesperado ao carregar os membros.'
          : 'Erro inesperado ao carregar a organização.';
    }
  };

  const determineErrorType = (error: any): ErrorType => {
    if (!error) return 'unknown';
    
    const errorMessage = error.message?.toLowerCase() || '';
    
    if (errorMessage.includes('permission') || errorMessage.includes('policy')) {
      return 'permission';
    }
    if (errorMessage.includes('not found') || errorMessage.includes('no rows')) {
      return 'not_found';
    }
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'network';
    }
    
    return 'unknown';
  };
  
  useEffect(() => {
    if (orgId) {
      fetchOrganizationDetails(orgId);
      fetchMembers(orgId);
    } else {
      setError({
        type: 'not_found',
        message: 'ID da organização não fornecido.',
        hasOrganization: false
      });
      setLoading({ members: false, organization: false, invite: false });
    }
  }, [orgId]);

  const fetchOrganizationDetails = async (organizationId: string) => {
    try {
      setLoading(prev => ({ ...prev, organization: true }));
      setError(null);
      
      const { data, error } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', organizationId)
        .single();
      
      if (error) {
        const errorType = determineErrorType(error);
        setError({
          type: errorType,
          message: getErrorMessage(errorType, 'organization'),
          hasOrganization: false
        });
        return;
      }
      
      setOrganizationName(data.name);
    } catch (error: any) {
      console.error('Error fetching organization details:', error);
      const errorType = determineErrorType(error);
      setError({
        type: errorType,
        message: getErrorMessage(errorType, 'organization'),
        hasOrganization: false
      });
    } finally {
      setLoading(prev => ({ ...prev, organization: false }));
    }
  };

  const fetchMembers = async (organizationId: string) => {
    try {
      setLoading(prev => ({ ...prev, members: true }));
      
      // First, get organization members
      const { data: membersData, error: membersError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organizationId);
      
      if (membersError) {
        console.error('Supabase error fetching members:', membersError);
        const errorType = determineErrorType(membersError);
        setError({
          type: errorType,
          message: getErrorMessage(errorType, 'members'),
          hasMembers: false
        });
        return;
      }
      
      console.log('Members data:', membersData);
      
      if (!membersData || membersData.length === 0) {
        setMembers([]);
        setError(null);
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
        // Don't treat profile errors as critical - show members without profile data
        console.warn('Could not load profile data, showing members without profiles');
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
      setError(null);
    } catch (error: any) {
      console.error('Error fetching members:', error);
      const errorType = determineErrorType(error);
      setError({
        type: errorType,
        message: getErrorMessage(errorType, 'members'),
        hasMembers: false
      });
    } finally {
      setLoading(prev => ({ ...prev, members: false }));
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail || !orgId) return;
    
    try {
      setLoading(prev => ({ ...prev, invite: true }));
      
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
        title: 'Erro ao enviar convite',
        description: 'Não foi possível enviar o convite. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, invite: false }));
    }
  };

  const handleRetry = () => {
    if (orgId) {
      fetchOrganizationDetails(orgId);
      fetchMembers(orgId);
    }
  };

  const breadcrumbItems = [
    { label: 'Organizações', href: '/organizations', icon: Building },
    { label: organizationName || 'Carregando...', href: `/organizations/${orgId}/settings` },
    { label: 'Membros', icon: Users }
  ];

  // Show error state if organization couldn't be loaded
  if (error && !error.hasOrganization) {
    return (
      <RequireAuth>
        <div className="container mx-auto py-8">
          <PageBreadcrumb 
            items={[
              { label: 'Organizações', href: '/organizations', icon: Building },
              { label: 'Erro', icon: Users }
            ]}
            showBackButton
            backButtonLabel="Voltar para Organizações"
            backButtonHref="/organizations"
          />
          
          <ErrorState
            title="Organização não encontrada"
            description={error.message}
            onRetry={handleRetry}
          />
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="container mx-auto py-8">
        <PageBreadcrumb 
          items={breadcrumbItems}
          showBackButton
          backButtonLabel="Voltar para Organizações"
          backButtonHref="/organizations"
        />
        
        {loading.organization ? (
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        ) : (
          <PageHeader
            title="Gerenciamento de Membros"
            description={`Gerencie os membros da organização`}
            organizationId={orgId}
            organizationName={organizationName}
            isCurrentOrganization={isCurrentOrg}
          />
        )}

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
                  disabled={loading.invite || !inviteEmail}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {loading.invite ? 'Enviando...' : 'Enviar convite'}
                </Button>
              </div>
            </div>

            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-medium">Membros atuais</h3>
              <Button 
                onClick={() => fetchMembers(orgId!)} 
                variant="outline" 
                disabled={loading.members}
              >
                {loading.members ? 'Carregando...' : 'Atualizar'}
              </Button>
            </div>

            {/* Error state for members */}
            {error && error.hasMembers === false && error.type !== 'not_found' && (
              <ErrorState
                variant="alert"
                description={error.message}
                onRetry={() => fetchMembers(orgId!)}
              />
            )}

            {/* Loading state */}
            {loading.members ? (
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
                    {[1, 2, 3].map((i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-16 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : members.length === 0 ? (
              <EmptyState
                icon={UserPlus}
                title="Nenhum membro encontrado"
                description="Esta organização ainda não possui membros cadastrados. Comece convidando o primeiro membro usando o formulário acima."
                actionLabel="Convidar primeiro membro"
                onAction={() => document.querySelector('input[placeholder="Email do convidado"]')?.focus()}
                actionVariant="outline"
              />
            ) : (
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
                    {members.map((member) => (
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
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
}
