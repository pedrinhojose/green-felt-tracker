
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Building, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[];
  showBackButton?: boolean;
  backButtonLabel?: string;
  backButtonHref?: string;
}

export function PageBreadcrumb({ 
  items, 
  showBackButton = false, 
  backButtonLabel = "Voltar",
  backButtonHref 
}: PageBreadcrumbProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      {showBackButton && backButtonHref && (
        <Button variant="outline" size="sm" asChild>
          <Link to={backButtonHref}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {backButtonLabel}
          </Link>
        </Button>
      )}
      
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => (
            <div key={index} className="flex items-center">
              <BreadcrumbItem>
                {item.href ? (
                  <BreadcrumbLink asChild>
                    <Link to={item.href} className="flex items-center">
                      {item.icon && <item.icon className="h-4 w-4 mr-1" />}
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="flex items-center">
                    {item.icon && <item.icon className="h-4 w-4 mr-1" />}
                    {item.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < items.length - 1 && <BreadcrumbSeparator />}
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
