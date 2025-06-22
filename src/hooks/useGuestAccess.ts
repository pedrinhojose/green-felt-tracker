
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
      
      // Primeiro, tentar fazer login diretamente
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

      // Se o login falhou, verificar se é por credenciais inválidas
      if (signInError && signInError.message.includes('Invalid login credentials')) {
        // Tentar criar a conta
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'apapoker@visitante.com',
          password: '123456',
          options: {
            data: {
              full_name: 'Visitante APA Poker',
              username: 'visitante'
            }
          }
        });

        if (signUpError) {
          // Se falhou ao criar, pode ser porque já existe
          if (signUpError.message.includes('User already registered')) {
            // Tentar login novamente
            const { data: retrySignIn, error: retryError } = await supabase.auth.signInWithPassword({
              email: 'apapoker@visitante.com',
              password: '123456',
            });

            if (retryError) {
              throw new Error('Não foi possível fazer login com a conta de visitante');
            }

            if (retrySignIn.user) {
              toast({
                title: 'Acesso de visitante ativado',
                description: 'Você está navegando como visitante com acesso somente leitura.',
              });
              window.location.href = '/dashboard';
              return;
            }
          } else {
            throw signUpError;
          }
        }

        // Se a conta foi criada com sucesso
        if (signUpData.user) {
          // Adicionar papel viewer manualmente usando inserção direta
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

          // Criar perfil manualmente se necessário
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: signUpData.user.id,
                username: 'visitante',
                full_name: 'Visitante APA Poker',
                avatar_url: null
              }, { onConflict: 'id' });

            if (profileError) {
              console.error('Erro ao criar perfil:', profileError);
            }
          } catch (profileErr) {
            console.error('Erro ao inserir perfil:', profileErr);
          }

          toast({
            title: 'Acesso de visitante ativado',
            description: 'Você está navegando como visitante com acesso somente leitura.',
          });
          window.location.href = '/dashboard';
        }
      } else {
        // Outro tipo de erro
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
