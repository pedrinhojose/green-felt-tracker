
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, configureSupabaseClient, signOut } from '@/lib/utils/auth';
import { pokerDB } from '@/lib/db';
import { useDemoMode } from '@/hooks/useDemoMode';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isDemoMode, getDemoUser, getDemoSession, exitDemoMode } = useDemoMode();
  
  useEffect(() => {
    // Check if we're in demo mode first
    if (isDemoMode()) {
      const demoUser = getDemoUser();
      const demoSession = getDemoSession();
      
      if (demoUser && demoSession) {
        setUser(demoUser as User);
        setSession(demoSession as Session);
        setProfile({
          id: demoUser.id,
          email: demoUser.email,
          username: 'visitante',
          full_name: 'Visitante Demo',
          avatar_url: null
        });
      }
      
      setIsLoading(false);
      return;
    }

    // Normal Supabase auth flow
    configureSupabaseClient();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        }
        
        if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );
    
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
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
  }, [isDemoMode, getDemoUser, getDemoSession]);
  
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

  const handleSignOut = async () => {
    if (isDemoMode()) {
      exitDemoMode();
    } else {
      await signOut();
    }
  };
  
  const value = {
    user,
    session,
    profile,
    isLoading,
    signOut: handleSignOut,
    isDemoMode: isDemoMode()
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
