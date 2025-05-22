
import { useEffect } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { OrganizationSelectionPage } from '@/pages/OrganizationSelectionPage';

interface OrganizationRequiredProps {
  children: React.ReactNode;
}

export function OrganizationRequired({ children }: OrganizationRequiredProps) {
  const { isLoading, organizations, currentOrganization } = useOrganization();
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  // Listen for changes in organizations or auth state
  useEffect(() => {
    // Only proceed if everything is loaded
    if (isLoading || isAuthLoading) return;

    // If no user, RequireAuth will handle the redirect
    if (!user) return;

    // If user has no organizations, redirect to create one
    if (organizations.length === 0) {
      navigate('/organizations/new');
    }
  }, [user, isLoading, isAuthLoading, organizations, navigate]);

  // Show loading state
  if (isLoading || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-poker-gold"></div>
      </div>
    );
  }

  // If user has organizations but none is selected, show organization selection
  if (!isLoading && organizations.length > 0 && !currentOrganization) {
    return <OrganizationSelectionPage />;
  }

  // If organization is selected, render children
  return <>{children}</>;
}
