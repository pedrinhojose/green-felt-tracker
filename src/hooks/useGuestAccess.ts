
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
      
      console.log('=== INICIANDO ACESSO DE VISITANTE ===');
      console.log('Timestamp:', new Date().toISOString());
      
      // Limpar qualquer sessão existente primeiro
      console.log('Limpando estado de autenticação...');
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
        console.log('✅ Sessão anterior limpa');
      } catch (signOutError) {
        console.log('⚠️ Erro ao limpar sessão (ignorado):', signOutError);
      }
      
      // Aguardar um pouco para garantir que a limpeza foi processada
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('=== TENTANDO LOGIN DE VISITANTE ===');
      console.log('Email: visitante@apapoker.com');
      
      // Tentar fazer login com a conta de visitante
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'visitante@apapoker.com',
        password: '123456',
      });

      console.log('=== RESULTADO DO LOGIN ===');
      console.log('Data received:', data);
      console.log('Error received:', error);

      if (error) {
        console.error('❌ ERRO NO LOGIN:', error);
        
        // Mensagens de erro mais específicas
        let errorMessage = 'Não foi possível ativar o acesso de visitante.';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Credenciais de visitante inválidas. Entre em contato com o administrador.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Muitas tentativas de login. Aguarde um momento antes de tentar novamente.';
        } else if (error.message.includes('Database error')) {
          errorMessage = 'Erro de banco de dados. Contacte o administrador.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email do visitante não confirmado. Contacte o administrador.';
        }
        
        throw new Error(errorMessage);
      }

      if (data.user && data.session) {
        console.log('✅ LOGIN DE VISITANTE BEM-SUCEDIDO');
        console.log('User ID:', data.user.id);
        console.log('User Email:', data.user.email);
        console.log('Session válida:', !!data.session.access_token);
        
        toast({
          title: 'Acesso de visitante ativado',
          description: 'Você está navegando como visitante com acesso somente leitura.',
        });
        
        // Aguardar um pouco para garantir que o estado foi atualizado
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('🔄 Redirecionando para /dashboard...');
        window.location.href = '/dashboard';
      } else {
        console.error('❌ LOGIN SEM DADOS VÁLIDOS');
        console.log('Data completa:', data);
        throw new Error('Erro inesperado: dados de autenticação inválidos.');
      }

    } catch (error: any) {
      console.error('❌ ERRO FINAL NO ACESSO DE VISITANTE:', error);
      
      toast({
        title: 'Erro no acesso de visitante',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      console.log('=== FIM DO PROCESSO DE LOGIN ===');
    }
  };

  return {
    signInAsGuest,
    isLoading
  };
}
