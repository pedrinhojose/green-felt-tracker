import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import RequireAuth from '@/components/RequireAuth';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Settings, ArrowLeft, Users } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';

interface OrganizationMember {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    username: string | null;
  } | null;
}

interface ErrorDetails {
  type: 'network' | 'permission' | 'not_found' | 'rls_error' | 'unknown';
  message: string;
  canRetry: boolean;
}

const inviteSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  role: z.enum(['admin', 'member'], {
    required_error: 'Selecione um papel',
  }),
});

export default function OrganizationMembersPage() {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { currentOrganization } = useOrganization();
  const { organizationId } = useParams<{organizationId: string}>();
  const navigate = useNavigate();
  
  const orgId = organizationId || currentOrganization?.id;
  
  const form = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });

  const analyzeError = (error: any): ErrorDetails => {
    console.error('Organization members error:', error);
    
    // Erro de recursão RLS
    if (error?.code === '42P17' || error?.message?.includes('infinite recursion')) {
      return {
        type: 'rls_error',
        message: 'Há um problema temporário com as permissões. Nossa equipe está trabalhando na solução.',
        canRetry: true
      };
    }
    
    // Erro de rede/servidor
    if (error?.code >= 500 || error?.message?.includes('fetch')) {
      return {
        type: 'network',
        message: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
        canRetry: true
      };
    }
    
    // Erro de permissão
    if (error?.code === 403 || error?.message?.includes('permission')) {
      return {
        type: 'permission',
        message: 'Você não tem permissão para gerenciar membros desta organização.',
        canRetry: false
      };
    }
    
    // Organização não encontrada
    if (error?.code === 404) {
      return {
        type: 'not_found',
        message: 'Organização não encontrada.',
        canRetry: false
      };
    }
    
    return {
      type: 'unknown',
      message: 'Ocorreu um erro inesperado. Tente novamente em alguns instantes.',
      canRetry: true
    };
  };
  
  useEffect(() => {
    if (orgId) {
      fetchMembers();
    } else {
      setError({
        type: 'not_found',
        message: 'Organização não especificada.',
        canRetry: false
      });
      setIsLoading(false);
    }
  }, [orgId]);
  
  const fetchMembers = async () => {
    if (!orgId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Primeiro, buscar os membros da organização
      const { data: membersData, error: membersError } = await supabase
        .from('organization_members')
        .select('id, user_id, role, created_at')
        .eq('organization_id', orgId);
      
      if (membersError) throw membersError;
      
      if (!membersData || membersData.length === 0) {
        setMembers([]);
        setIsLoading(false);
        return;
      }
      
      // Buscar os perfis dos usuários separadamente
      const userIds = membersData.map(member => member.user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, username')
        .in('id', userIds);
      
      // Combinar os dados
      const membersWithProfiles = membersData.map(member => {
        const profile = profilesData?.find(p => p.id === member.user_id);
        return {
          ...member,
          profiles: profile ? {
            full_name: profile.full_name,
            username: profile.username
          } : null
        };
      });
      
      setMembers(membersWithProfiles);
    } catch (error: any) {
      const errorDetails = analyzeError(error);
      setError(errorDetails);
      
      // Só mostra toast para erros graves, não para ausência de dados
      if (errorDetails.type !== 'permission') {
        toast({
          title: 'Erro ao carregar membros',
          description: errorDetails.message,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  async function onInvite(values: z.infer<typeof inviteSchema>) {
    if (!orgId) return;
    
    try {
      // Simulação de convite por email
      console.log('Sending invite:', { ...values, organizationId: orgId });
      
      toast({
        title: 'Convite enviado',
        description: `Convite enviado para ${values.email}`,
      });
      
      setIsInviteDialogOpen(false);
      form.reset();
    } catch (error: any) {
      console.error('Error sending invite:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o convite.',
        variant: 'destructive',
      });
    }
  }

  const handleRetry = () => {
    fetchMembers();
  };

  const handleBack = () => {
    navigate('/organizations');
  };

  // Loading state
  if (isLoading) {
    return (
      <RequireAuth>
        <div className="container mx-auto py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Skeleton className="h-8 w-48" />
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </RequireAuth>
    );
  }

  // Error state
  if (error) {
    return (
      <RequireAuth>
        <div className="container mx-auto py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold">Membros da Organização</h1>
          </div>

          <ErrorState 
            description={error.message}
            onRetry={error.canRetry ? handleRetry : undefined}
            retryLabel="Tentar novamente"
          />
        </div>
      </RequireAuth>
    );
  }

  // Empty state
  if (members.length === 0) {
    return (
      <RequireAuth>
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-2xl font-bold">Membros da Organização</h1>
            </div>
          </div>

          <EmptyState
            icon={Users}
            title="Nenhum membro encontrado"
            description="Esta organização ainda não possui membros. Convide pessoas para colaborar com você."
            actionLabel="Convidar primeiro membro"
            onAction={() => setIsInviteDialogOpen(true)}
          />

          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convidar membro</DialogTitle>
                <DialogDescription>
                  Envie um convite por email para adicionar um novo membro à organização.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onInvite)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="exemplo@email.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Papel</FormLabel>
                        <FormControl>
                          <select {...field} className="w-full p-2 border rounded-md">
                            <option value="member">Membro</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar convite
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </RequireAuth>
    );
  }

  // Success state with members
  return (
    <RequireAuth>
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold">Membros da Organização</h1>
          </div>
          
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Convidar membro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convidar membro</DialogTitle>
                <DialogDescription>
                  Envie um convite por email para adicionar um novo membro à organização.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onInvite)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="exemplo@email.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Papel</FormLabel>
                        <FormControl>
                          <select {...field} className="w-full p-2 border rounded-md">
                            <option value="member">Membro</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar convite
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Membros ativos</CardTitle>
            <CardDescription>
              Gerencie os membros e suas permissões na organização
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {member.profiles?.full_name?.[0] || member.profiles?.username?.[0] || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {member.profiles?.full_name || member.profiles?.username || 'Usuário sem nome'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Membro desde {new Date(member.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={member.role === 'admin' ? 'destructive' : 'secondary'}>
                      {member.role === 'admin' ? 'Admin' : 'Membro'}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
}
