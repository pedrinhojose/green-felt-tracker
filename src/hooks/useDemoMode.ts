
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

// Mock user data for demo mode
const DEMO_USER = {
  id: 'demo-user-id',
  email: 'visitante@demo.com',
  user_metadata: {
    full_name: 'Visitante Demo',
    username: 'visitante'
  },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  role: 'authenticated'
};

const DEMO_SESSION = {
  access_token: 'demo-access-token',
  refresh_token: 'demo-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: DEMO_USER
};

export function useDemoMode() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const activateDemoMode = async () => {
    try {
      setIsLoading(true);

      // Store demo mode flag and user data in localStorage
      localStorage.setItem('demo_mode', 'true');
      localStorage.setItem('demo_user', JSON.stringify(DEMO_USER));
      localStorage.setItem('demo_session', JSON.stringify(DEMO_SESSION));

      toast({
        title: 'Modo Demo Ativado',
        description: 'Você está navegando em modo demo com acesso somente leitura.',
      });

      // Redirect to dashboard
      window.location.href = '/dashboard';

    } catch (error: any) {
      console.error('Erro ao ativar modo demo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível ativar o modo demo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isDemoMode = () => {
    return localStorage.getItem('demo_mode') === 'true';
  };

  const getDemoUser = () => {
    if (!isDemoMode()) return null;
    
    const userData = localStorage.getItem('demo_user');
    return userData ? JSON.parse(userData) : null;
  };

  const getDemoSession = () => {
    if (!isDemoMode()) return null;
    
    const sessionData = localStorage.getItem('demo_session');
    return sessionData ? JSON.parse(sessionData) : null;
  };

  const exitDemoMode = () => {
    localStorage.removeItem('demo_mode');
    localStorage.removeItem('demo_user');
    localStorage.removeItem('demo_session');
    window.location.href = '/auth';
  };

  return {
    activateDemoMode,
    isDemoMode,
    getDemoUser,
    getDemoSession,
    exitDemoMode,
    isLoading
  };
}
