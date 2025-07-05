
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import React from 'react';

interface RequireAuthProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'player' | 'viewer';
}

const RequireAuth = ({ children, requiredRole }: React.PropsWithChildren<RequireAuthProps>) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const { hasRole, isCheckingRole } = useUserRole();

  // Se estiver carregando, mostre um indicador de carregamento
  if (isLoading || isCheckingRole) {
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

  // Verificação de papel, se necessário
  if (requiredRole && !hasRole(requiredRole)) {
    // Redirecionar para o dashboard com mensagem de permissão insuficiente
    return <Navigate to="/dashboard" state={{ permissionDenied: true }} replace />;
  }
  
  // Se há usuário e tem o papel necessário (ou não necessita de papel específico), renderize o conteúdo protegido
  return <>{children}</>;
};

export default RequireAuth;
