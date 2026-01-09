
import { useOrganization } from '@/contexts/OrganizationContext';
import { Building } from 'lucide-react';

/**
 * Componente simplificado que exibe apenas o nome do clube atual
 * (sem dropdown de seleção, pois cada usuário tem apenas um clube)
 */
export function OrganizationSelector() {
  const { currentOrganization } = useOrganization();

  if (!currentOrganization) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/10">
      <Building className="h-4 w-4 text-poker-gold" />
      <span className="text-sm text-white/80 truncate max-w-[150px] sm:max-w-[200px]">
        {currentOrganization.name}
      </span>
    </div>
  );
}
