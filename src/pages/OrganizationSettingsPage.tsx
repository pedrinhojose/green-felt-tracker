
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import RequireAuth from '@/components/RequireAuth';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ErrorState } from '@/components/ui/error-state';

interface Organization {
  id: string;
  name: string;
  subscription_plan: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface ErrorDetails {
  type: 'network' | 'permission' | 'not_found' | 'rls_error' | 'unknown';
  message: string;
  canRetry: boolean;
}

const organizationSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'O nome deve ter pelo menos 3 caracteres' })
    .max(50, { message: 'O nome não pode ter mais de 50 caracteres' }),
});

export default function OrganizationSettingsPage() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { currentOrganization, refreshOrganizations } = useOrganization();
  const { organizationId } = useParams<{organizationId: string}>();
  const navigate = useNavigate();
  
  const orgId = organizationId || currentOrganization?.id;
  
  const form = useForm<z.infer<typeof organizationSchema>>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
    },
  });

  const analyzeError = (error: any): ErrorDetails => {
    console.error('Organization settings error:', error);
    
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
        message: 'Você não tem permissão para alterar as configurações desta organização.',
        canRetry: false
      };
    }
    
    // Organização não encontrada
    if (error?.code === 404) {
      return {
        type: 'not_found',
        message: 'Organização não encontrada. Ela pode ter sido removida.',
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
      fetchOrganization(orgId);
    } else {
      setError({
        type: 'not_found',
        message: 'Organização não especificada.',
        canRetry: false
      });
      setIsLoading(false);
    }
  }, [orgId]);
  
  const fetchOrganization = async (organizationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();
      
      if (error) throw error;
      
      setOrganization(data as Organization);
      form.reset({
        name: data.name,
      });
    } catch (error: any) {
      const errorDetails = analyzeError(error);
      setError(errorDetails);
      
      // Navega de volta para organizações se não encontrar a organização
      if (errorDetails.type === 'not_found') {
        setTimeout(() => navigate('/organizations'), 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  async function onSubmit(values: z.infer<typeof organizationSchema>) {
    if (!orgId) return;
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('organizations')
        .update({
          name: values.name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orgId);
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Organização atualizada com sucesso.',
      });
      
      // Refresh organizations list
      refreshOrganizations();
      
    } catch (error: any) {
      console.error('Error updating organization:', error);
      const errorDetails = analyzeError(error);
      
      toast({
        title: 'Erro ao salvar',
        description: errorDetails.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleRetry = () => {
    if (orgId) {
      fetchOrganization(orgId);
    }
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
            <Skeleton className="h-8 w-64" />
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-80" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-48" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-32" />
            </CardFooter>
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
            <h1 className="text-2xl font-bold">Configurações da Organização</h1>
          </div>

          <ErrorState 
            description={error.message}
            onRetry={error.canRetry ? handleRetry : undefined}
            retryLabel="Tentar novamente"
          />
          
          {error.type === 'not_found' && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                Você será redirecionado para a lista de organizações em alguns segundos...
              </p>
            </div>
          )}
        </div>
      </RequireAuth>
    );
  }

  // Success state
  return (
    <RequireAuth>
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Configurações da Organização</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Configurações da Organização</CardTitle>
            <CardDescription>
              Gerencie as configurações da organização {organization?.name}
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da organização</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Plano: {organization?.subscription_plan || 'Free'}</p>
                  <p>Criado em: {organization ? new Date(organization.created_at).toLocaleDateString() : ''}</p>
                  <p>Última atualização: {organization ? new Date(organization.updated_at).toLocaleDateString() : ''}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </RequireAuth>
  );
}
