import { useOrganization } from '@/contexts/OrganizationContext';

/**
 * Papel do usuário no clube atualmente selecionado.
 * O papel vem de `organization_members.role` (carregado por OrganizationContext).
 */
export function useOrgMemberRole() {
  const { currentOrganization } = useOrganization();
  const role = currentOrganization?.role ?? null;

  return {
    role,
    isViewer: role === 'viewer',
    isAdmin: role === 'admin' || role === 'owner',
    isOwner: role === 'owner',
    canEdit: role !== 'viewer',
  };
}
