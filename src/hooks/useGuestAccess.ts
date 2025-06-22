
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useGuestAccess() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const signInAsGuest = async () => {
    try {
      setIsLoading(true);
      
      // Limpar qualquer sessão existente primeiro
      await supabase.auth.signOut();
      
      // Tentar fazer login com a conta de visitante
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'visitante@apapoker.com',
        password: '123456',
      });

      if (error) {
        console.error('Erro no login de visitante:', error);
        throw error;
      }

      if (data.user) {
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
        description: 'Não foi possível ativar o acesso de visitante. Tente novamente mais tarde.',
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
