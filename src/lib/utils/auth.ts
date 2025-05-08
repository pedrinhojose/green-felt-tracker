
import { supabase } from "@/integrations/supabase/client";

export type UserProfile = {
  id: string;
  email: string | undefined;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

// Função para limpar tokens de autenticação
export const cleanupAuthState = () => {
  // Remover tokens padrão de autenticação
  localStorage.removeItem('supabase.auth.token');
  
  // Remover todas as chaves de autenticação do Supabase do localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remover de sessionStorage se estiver em uso
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });

  // Limpar indexedDB relacionados ao Supabase
  const indexedDBs = ['localforage', 'firebaseLocalStorageDb'];
  indexedDBs.forEach(db => {
    try {
      indexedDB.deleteDatabase(db);
    } catch (e) {
      console.log(`Failed to delete IndexedDB: ${db}`, e);
    }
  });
};

// Função para fazer logout
export const signOut = async () => {
  // Limpar tokens
  cleanupAuthState();
  
  // Fazer logout no Supabase
  try {
    await supabase.auth.signOut({ scope: 'global' });
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  }
  
  // Redirecionar para página de autenticação
  window.location.href = "/auth";
};

// Função para obter o perfil do usuário atual
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  try {
    // Obter sessão atual
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return null;
    
    // Obter perfil do usuário
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (error) {
      console.error("Erro ao obter perfil:", error);
      return null;
    }
    
    return {
      id: session.user.id,
      email: session.user.email,
      username: profile?.username,
      full_name: profile?.full_name,
      avatar_url: profile?.avatar_url
    };
  } catch (error) {
    console.error("Erro ao obter perfil do usuário:", error);
    return null;
  }
};

// Configurar o cliente Supabase
export const configureSupabaseClient = () => {
  // Configurar interceptor para redirecionamento quando a sessão expirar
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      // Limpar tokens e redirecionar
      cleanupAuthState();
      
      // Verificar se não está na página de autenticação
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth';
      }
    }
  });
};
