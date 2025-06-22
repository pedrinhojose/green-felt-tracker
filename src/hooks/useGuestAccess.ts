
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useGuestAccess() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const signInAsGuest = async () => {
    try {
      setIsLoading(true);
      
      // Tentar fazer login com a conta de visitante
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'apapoker@visitante.com',
        password: '123456',
      });

      if (error) {
        // Se a conta não existir, criar uma nova conta de visitante
        if (error.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: 'apapoker@visitante.com',
            password: '123456',
            options: {
              data: {
                full_name: 'Visitante APA Poker',
                username: 'visitante'
              },
              emailRedirectTo: `${window.location.origin}/`
            }
          });

          if (signUpError) {
            throw signUpError;
          }

          if (signUpData.user) {
            // Adicionar papel viewer ao usuário recém-criado
            const { error: roleError } = await supabase
              .from('user_roles')
              .insert({
                user_id: signUpData.user.id,
                role: 'viewer'
              });

            if (roleError) {
              console.error('Erro ao adicionar papel viewer:', roleError);
            }

            toast({
              title: 'Acesso de visitante ativado',
              description: 'Você está navegando como visitante com acesso somente leitura.',
            });

            // Redirecionar para o dashboard
            window.location.href = '/dashboard';
          }
        } else {
          throw error;
        }
      } else if (data.user) {
        toast({
          title: 'Acesso de visitante ativado',
          description: 'Você está navegando como visitante com acesso somente leitura.',
        });

        // Redirecionar para o dashboard
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      console.error('Erro no acesso de visitante:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível ativar o acesso de visitante. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signInAsGuest,
    isLoading
  };
}
