
import { useState } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Building, ChevronDown, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { OrganizationCreateModal } from './OrganizationCreateModal';

export function OrganizationSelector() {
  const { currentOrganization, organizations, selectOrganization } = useOrganization();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  if (!currentOrganization) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 max-w-[200px] sm:max-w-xs">
            <Building className="h-4 w-4" />
            <span className="truncate">{currentOrganization.name}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px] sm:w-[300px]">
          <DropdownMenuLabel>Suas organizações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {organizations.map(org => (
            <DropdownMenuItem 
              key={org.id} 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => selectOrganization(org.id)}
            >
              <Building className="h-4 w-4" />
              <span className="flex-1 truncate">{org.name}</span>
              {org.id === currentOrganization.id && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Nova organização</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/organizations')}
          >
            <Building className="h-4 w-4" />
            <span>Gerenciar organizações</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <OrganizationCreateModal 
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </>
  );
}
