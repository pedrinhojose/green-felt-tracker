
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, configureSupabaseClient, signOut } from '@/lib/utils/auth';
import { pokerDB } from '@/lib/db';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Configurar o cliente Supabase
    configureSupabaseClient();
    
    // Configurar o listener de autenticação antes de verificar a sessão
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Se o usuário fizer login, buscar o perfil
        if (event === 'SIGNED_IN' && session) {
          // Usar setTimeout para evitar deadlocks
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        }
        
        // Se o usuário desconectar, limpar perfil
        if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );
    
    // Verificar se existe uma sessão ativa
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        // Se existir uma sessão, buscar o perfil do usuário
        if (data.session?.user) {
          await fetchUserProfile(data.session.user.id);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Função para buscar o perfil do usuário
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        setProfile({
          id: userId,
          email: user?.email,
          username: data.username,
          full_name: data.full_name,
          avatar_url: data.avatar_url
        });
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  };
  
  const value = {
    user,
    session,
    profile,
    isLoading,
    signOut,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}
