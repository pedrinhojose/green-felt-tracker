import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  CalendarDays,
  Gamepad2,
  Trophy,
  Users as UsersIcon,
  BarChart3,
  Image as ImageIcon,
  BookOpen,
  ShieldAlert,
  Crown,
  Palette,
  Wallet,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useOrgMemberRole } from '@/hooks/useOrgMemberRole';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { SeasonSelector } from '@/components/navigation/SeasonSelector';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredRole?: 'admin' | 'player' | 'viewer';
  superAdminOnly?: boolean;
  hideForViewer?: boolean;
}

const mainNavItems: NavItem[] = [
  { name: 'Painel', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Configuração', path: '/season', icon: Settings, hideForViewer: true },
  { name: 'Temporadas', path: '/seasons', icon: CalendarDays },
  { name: 'Partidas', path: '/games', icon: Gamepad2 },
  { name: 'Ranking', path: '/ranking', icon: Trophy },
  { name: 'Jogadores', path: '/players', icon: UsersIcon, hideForViewer: true },
  { name: 'Estatísticas', path: '/statistics', icon: BarChart3 },
  { name: 'Galeria', path: '/gallery', icon: ImageIcon },
  { name: 'Regras da Casa', path: '/house-rules', icon: BookOpen },
  { name: 'Caixinha', path: '/caixinha', icon: PiggyBank, hideForViewer: true },
  { name: 'Temas', path: '/themes', icon: Palette },
  { name: 'Usuários', path: '/users', icon: ShieldAlert, requiredRole: 'admin' },
  { name: 'Super Admin', path: '/super-admin', icon: Crown, superAdminOnly: true },
];

const financeNavItems: NavItem[] = [
  { name: 'Recebimentos', path: '/finance/receivables', icon: Receipt, hideForViewer: true },
  { name: 'Jackpot', path: '/finance/jackpot', icon: Coins, hideForViewer: true },
  { name: 'Caixa do Clube', path: '/finance/club-cash', icon: Wallet, hideForViewer: true },
];

function useFilteredItems(items: NavItem[]) {
  const { hasRole, isSuperAdmin } = useUserRole();
  const { isViewer } = useOrgMemberRole();

  return items.filter((item) => {
    if (item.superAdminOnly) return isSuperAdmin();
    if (isViewer) return !item.hideForViewer && !item.requiredRole;
    if (item.hideForViewer && isViewer) return false;
    if (!item.requiredRole) return true;
    return hasRole(item.requiredRole);
  });
}

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === 'collapsed';
  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false);
  };
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();

  const filteredMainItems = useFilteredItems(mainNavItems);
  const filteredFinanceItems = useFilteredItems(financeNavItems);

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);
  const isFinanceActive = financeNavItems.some((item) => isActive(item.path));

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5">
      <SidebarHeader className="border-b border-white/5">
        <div className="flex items-center gap-2 px-1 py-1">
          {user ? (
            <ProfileDropdown />
          ) : (
            !collapsed && (
              <Link
                to="/login"
                className="text-xs font-medium bg-poker-gold hover:bg-amber-500 text-white px-2 py-1 rounded transition-colors"
              >
                Entrar
              </Link>
            )
          )}
          {!collapsed && (
            <Link to="/dashboard" className="min-w-0 flex-1" onClick={handleNavClick}>
              <h1 className="font-bold bg-gradient-to-r from-poker-gold to-amber-300 bg-clip-text text-transparent text-sm truncate">
                {currentOrganization?.name || 'Poker Manager'}
              </h1>
            </Link>
          )}
          {!collapsed && <SidebarTrigger className="text-poker-gold hover:bg-white/5 shrink-0" />}
        </div>
        {collapsed && (
          <div className="flex justify-center">
            <SidebarTrigger className="text-poker-gold hover:bg-white/5" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMainItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    tooltip={item.name}
                    size="lg"
                  >
                    <NavLink
                      to={item.path}
                      onClick={handleNavClick}
                      className={cn(
                        'flex items-center gap-3',
                        isActive(item.path) ? 'text-poker-gold font-medium' : 'text-white/80'
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="truncate text-[0.95rem]">{item.name}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {filteredFinanceItems.length > 0 && (
          <Collapsible defaultOpen={isFinanceActive} className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="w-full flex items-center justify-between cursor-pointer hover:text-sidebar-foreground">
                  <span>Financeiro</span>
                  <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filteredFinanceItems.map((item) => (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.path)}
                          tooltip={item.name}
                          size="lg"
                        >
                          <NavLink
                            to={item.path}
                            onClick={handleNavClick}
                            className={cn(
                              'flex items-center gap-3',
                              isActive(item.path) ? 'text-poker-gold font-medium' : 'text-white/80'
                            )}
                          >
                            <item.icon className="h-5 w-5 shrink-0" />
                            <span className="truncate text-[0.95rem]">{item.name}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-white/5">
        {!collapsed && (
          <div className="px-2">
            <SeasonSelector />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
