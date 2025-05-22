
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
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import RequireAuth from '@/components/RequireAuth';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  subscription_plan: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

const organizationSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'O nome deve ter pelo menos 3 caracteres' })
    .max(50, { message: 'O nome não pode ter mais de 50 caracteres' }),
});

export default function OrganizationSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [organization, setOrganization] = useState<Organization | null>(null);
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
  
  useEffect(() => {
    if (orgId) {
      fetchOrganization(orgId);
    }
  }, [orgId]);
  
  const fetchOrganization = async (organizationId: string) => {
    try {
      setIsLoading(true);
      
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
      console.error('Error fetching organization:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes da organização.',
        variant: 'destructive',
      });
      navigate('/organizations');
    } finally {
      setIsLoading(false);
    }
  };
  
  async function onSubmit(values: z.infer<typeof organizationSchema>) {
    if (!orgId) return;
    
    try {
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
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a organização.',
        variant: 'destructive',
      });
    }
  }

  return (
    <RequireAuth>
      <div className="container mx-auto py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
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
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="text-sm text-muted-foreground">
                    <p>Plano: {organization?.subscription_plan || 'Free'}</p>
                    <p>Criado em: {organization ? new Date(organization.created_at).toLocaleDateString() : ''}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/organizations')}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar alterações</Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        )}
      </div>
    </RequireAuth>
  );
}
