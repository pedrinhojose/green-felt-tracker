
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useGuestAccess() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const signInAsGuest = async () => {
    try {
      setIsLoading(true);
      
      // Tentar fazer login diretamente
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'apapoker@visitante.com',
        password: '123456',
      });

      if (signInData.user && !signInError) {
        // Login bem-sucedido
        toast({
          title: 'Acesso de visitante ativado',
          description: 'Você está navegando como visitante com acesso somente leitura.',
        });
        window.location.href = '/dashboard';
        return;
      }

      // Se falhou, verificar se existe um usuário com esse email
      if (signInError && signInError.message.includes('Invalid login credentials')) {
        // Vamos tentar resetar a senha e criar uma nova conta
        console.log('Tentando criar nova conta de visitante...');
        
        // Usar um email único baseado em timestamp para evitar conflitos
        const uniqueEmail = `visitante-${Date.now()}@apapoker.com`;
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: uniqueEmail,
          password: '123456',
          options: {
            data: {
              full_name: 'Visitante APA Poker',
              username: 'visitante'
            }
          }
        });

        if (signUpError) {
          throw signUpError;
        }

        if (signUpData.user) {
          // Aguardar um pouco para o usuário ser criado
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Adicionar papel viewer
          try {
            const { error: roleError } = await supabase
              .from('user_roles')
              .insert({
                user_id: signUpData.user.id,
                role: 'viewer'
              });

            if (roleError) {
              console.error('Erro ao adicionar papel viewer:', roleError);
            }
          } catch (roleErr) {
            console.error('Erro ao inserir papel:', roleErr);
          }

          toast({
            title: 'Acesso de visitante ativado',
            description: 'Você está navegando como visitante com acesso somente leitura.',
          });
          window.location.href = '/dashboard';
        }
      } else {
        throw signInError || new Error('Erro desconhecido no login');
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
