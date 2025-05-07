
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RequireAuthProps {
  children: JSX.Element;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Se estiver carregando, mostre um indicador de carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-poker-gold"></div>
      </div>
    );
  }
  
  // Se não há usuário autenticado, redirecione para a página de login
  if (!user) {
    // Redireciona para /auth, mas salva a localização atual
    // para que o usuário possa voltar após o login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  // Se há usuário, renderize o conteúdo protegido
  return children;
}
