
import { useEffect } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { OrganizationSelectionPage } from '@/pages/OrganizationSelectionPage';
import React from 'react';

interface OrganizationRequiredProps {
  children: React.ReactNode;
}

const OrganizationRequired: React.FC<OrganizationRequiredProps> = ({ children }) => {
  const { isLoading, organizations, currentOrganization } = useOrganization();
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  // Debug logging
  useEffect(() => {
    console.log("OrganizationRequired: Debug info", {
      isLoading,
      isAuthLoading,
      user: user?.id || 'none',
      organizationsCount: organizations.length,
      currentOrganization: currentOrganization?.id || 'none'
    });
  }, [isLoading, isAuthLoading, user, organizations, currentOrganization]);

  // Listen for changes in organizations or auth state
  useEffect(() => {
    // Only proceed if everything is loaded
    if (isLoading || isAuthLoading) {
      console.log("OrganizationRequired: Ainda carregando...");
      return;
    }

    // If no user, RequireAuth will handle the redirect
    if (!user) {
      console.log("OrganizationRequired: Usuário não autenticado");
      return;
    }

    console.log("OrganizationRequired: Verificando organizações", {
      organizationsCount: organizations.length,
      currentOrganization: currentOrganization?.name || 'none'
    });

    // If user has no organizations, redirect to create one
    if (organizations.length === 0) {
      console.log("OrganizationRequired: Redirecionando para criar organização");
      navigate('/organizations');
      return;
    }

    // If user has organizations but none is selected, show selection page
    if (!currentOrganization) {
      console.log("OrganizationRequired: Nenhuma organização selecionada");
    }
  }, [user, isLoading, isAuthLoading, organizations, currentOrganization, navigate]);

  // Show loading state
  if (isLoading || isAuthLoading) {
    console.log("OrganizationRequired: Mostrando loading");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-poker-gold"></div>
      </div>
    );
  }

  // If user has organizations but none is selected, show organization selection
  if (!isLoading && organizations.length > 0 && !currentOrganization) {
    console.log("OrganizationRequired: Mostrando seleção de organização");
    return <OrganizationSelectionPage />;
  }

  // If organization is selected, render children
  if (currentOrganization) {
    console.log("OrganizationRequired: Renderizando children com organização:", currentOrganization.name);
  }
  
  return <>{children}</>;
};

export { OrganizationRequired };
