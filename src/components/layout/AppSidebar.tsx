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
  PiggyBank,
  ShieldAlert,
  Crown,
  Palette,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
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

const navItems: NavItem[] = [
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

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === 'collapsed';
  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false);
  };
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const { hasRole, isSuperAdmin } = useUserRole();
  const { isViewer } = useOrgMemberRole();

  const filteredNavItems = navItems.filter((item) => {
    if (item.superAdminOnly) return isSuperAdmin();
    if (isViewer) return !item.hideForViewer && !item.requiredRole;
    if (item.hideForViewer && isViewer) return false;
    if (!item.requiredRole) return true;
    return hasRole(item.requiredRole);
  });

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5">
      <SidebarHeader className="border-b border-white/5">
        <div className="flex items-center justify-between gap-2 px-2 py-1">
          {!collapsed && (
            <Link to="/dashboard" className="min-w-0 flex-1" onClick={handleNavClick}>
              <h1 className="font-bold bg-gradient-to-r from-poker-gold to-amber-300 bg-clip-text text-transparent text-base truncate">
                {currentOrganization?.name || 'Poker Manager'}
              </h1>
            </Link>
          )}
          <SidebarTrigger className="text-poker-gold hover:bg-white/5" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    tooltip={item.name}
                  >
                    <NavLink
                      to={item.path}
                      onClick={handleNavClick}
                      className={cn(
                        'flex items-center gap-2',
                        isActive(item.path) ? 'text-poker-gold font-medium' : 'text-white/80'
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/5 gap-2">
        {!collapsed && (
          <div className="px-2">
            <SeasonSelector />
          </div>
        )}
        <div className={cn('flex', collapsed ? 'justify-center' : 'justify-end px-2')}>
          {user ? (
            <ProfileDropdown />
          ) : (
            !collapsed && (
              <Link
                to="/login"
                className="text-sm font-medium bg-poker-gold hover:bg-amber-500 text-white px-4 py-2 rounded transition-colors"
              >
                Entrar
              </Link>
            )
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
