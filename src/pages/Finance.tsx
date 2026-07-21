import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Receipt, Coins, PiggyBank } from 'lucide-react';
import { PageHeader } from '@/components/navigation/PageHeader';
import { cn } from '@/lib/utils';

const tabs = [
  { name: 'Recebimentos', path: '/finance/receivables', icon: Receipt },
  { name: 'Jackpot', path: '/finance/jackpot', icon: Coins },
  { name: 'Caixinha', path: '/finance/caixinha', icon: PiggyBank },
];

export default function Finance() {
  const { pathname } = useLocation();

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Financeiro"
        description="Controle financeiro do clube: recebimentos, jackpot e caixinha"
      />

      <div className="mb-6">
        <nav className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
          {tabs.map((tab) => {
            const isActive = pathname === tab.path || pathname.startsWith(`${tab.path}/`);
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={cn(
                  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <Outlet />
    </div>
  );
}
