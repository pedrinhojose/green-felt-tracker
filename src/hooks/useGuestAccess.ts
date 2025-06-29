
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cleanupAuthState } from '@/lib/utils/auth';

export function useGuestAccess() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const signInAsGuest = async () => {
    try {
      setIsLoading(true);
      
      console.log('🔵 Iniciando acesso de visitante...');
      
      // Limpar qualquer sessão existente
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (signOutError) {
        console.log('⚠️ Erro ao limpar sessão (ignorado):', signOutError);
      }
      
      // Aguardar um pouco para garantir limpeza
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('🔐 Fazendo login como visitante...');
      
      // Fazer login com credenciais do visitante
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'visitante@apapoker.com',
        password: '123456',
      });

      if (error) {
        console.error('❌ Erro no login de visitante:', error);
        
        let errorMessage = 'Não foi possível ativar o acesso de visitante.';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Credenciais de visitante inválidas. Entre em contato com o administrador.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Muitas tentativas de login. Aguarde um momento.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Conta de visitante não confirmada. Entre em contato com o administrador.';
        }
        
        throw new Error(errorMessage);
      }

      if (data.user && data.session) {
        console.log('✅ Login de visitante bem-sucedido!');
        console.log('User ID:', data.user.id);
        console.log('Email:', data.user.email);
        
        toast({
          title: 'Acesso de visitante ativado',
          description: 'Você está navegando como visitante com acesso somente leitura.',
        });
        
        // Aguardar um pouco para garantir que o estado foi atualizado
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Redirecionar para o dashboard
        window.location.href = '/dashboard';
      } else {
        console.error('❌ Login sem dados válidos:', data);
        throw new Error('Erro inesperado: dados de autenticação inválidos.');
      }

    } catch (error: any) {
      console.error('❌ Erro no acesso de visitante:', error);
      
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
