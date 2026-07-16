import { Navigate, Outlet } from 'react-router-dom';
import { useOrgMemberRole } from '@/hooks/useOrgMemberRole';
import { useOrganization } from '@/contexts/OrganizationContext';

/**
 * Bloqueia acesso a rotas que envolvem edição/configuração.
 * Visitantes (role = 'viewer') são redirecionados para /dashboard.
 */
export function RequireEditor() {
  const { isLoading } = useOrganization();
  const { isViewer } = useOrgMemberRole();
  if (isLoading) return null;
  if (isViewer) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
