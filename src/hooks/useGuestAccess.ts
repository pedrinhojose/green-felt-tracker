
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useGuestAccess() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const signInAsGuest = async () => {
    try {
      setIsLoading(true);
      
      console.log('Iniciando acesso de visitante...');
      
      // Limpar qualquer sessão existente primeiro
      try {
        await supabase.auth.signOut({ scope: 'global' });
        console.log('Sessão anterior limpa com sucesso.');
      } catch (signOutError) {
        console.log('Erro ao limpar sessão (ignorado):', signOutError);
      }
      
      console.log('Tentando fazer login com visitante@apapoker.com...');
      
      // Tentar fazer login com a conta de visitante
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'visitante@apapoker.com',
        password: '123456',
      });

      if (error) {
        console.error('Erro detalhado no login de visitante:', {
          message: error.message,
          status: error.status,
          name: error.name,
          details: error
        });
        
        // Mensagens de erro mais específicas
        let errorMessage = 'Não foi possível ativar o acesso de visitante.';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Credenciais de visitante inválidas. Contacte o administrador.';
        } else if (error.message.includes('Database error')) {
          errorMessage = 'Erro de banco de dados. O usuário visitante pode não estar configurado corretamente.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Muitas tentativas de login. Aguarde um momento antes de tentar novamente.';
        }
        
        throw new Error(errorMessage);
      }

      if (data.user) {
        console.log('Login de visitante bem-sucedido:', data.user.email);
        
        toast({
          title: 'Acesso de visitante ativado',
          description: 'Você está navegando como visitante com acesso somente leitura.',
        });
        
        // Redirecionar para o dashboard
        console.log('Redirecionando para /dashboard...');
        window.location.href = '/dashboard';
      } else {
        console.error('Login aparentemente bem-sucedido mas sem dados do usuário');
        throw new Error('Erro inesperado: dados do usuário não retornados.');
      }

    } catch (error: any) {
      console.error('Erro no acesso de visitante:', error);
      
      toast({
        title: 'Erro no acesso de visitante',
        description: error.message || 'Tente novamente mais tarde.',
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
