
import { Building, Settings, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  description?: string;
  organizationId?: string;
  organizationName?: string;
  isCurrentOrganization?: boolean;
  children?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  description, 
  organizationId, 
  organizationName,
  isCurrentOrganization = false,
  children 
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-2">{description}</p>
          )}
          {organizationName && (
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <Building className="h-4 w-4 mr-1" />
              {organizationName}
              {isCurrentOrganization && (
                <span className="ml-2 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                  Organização atual
                </span>
              )}
            </div>
          )}
        </div>
        
        {organizationId && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/organizations/${organizationId}/settings`}>
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Link>
            </Button>
            
            {isCurrentOrganization && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Painel
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
      
      {children}
    </div>
  );
}
