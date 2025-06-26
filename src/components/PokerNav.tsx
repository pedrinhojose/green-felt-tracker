
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileDropdown } from './ProfileDropdown';
import { OrganizationSelector } from '@/components/organizations/OrganizationSelector';
import { ViewerBadge } from '@/components/ViewerBadge';
import { useUserRole } from '@/hooks/useUserRole';
import { ShieldAlert, Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavItem {
  name: string;
  path: string;
  requiredRole?: 'admin' | 'player' | 'viewer';
}

const navItems: NavItem[] = [
  { name: 'Painel', path: '/dashboard' },
  { name: 'Configuração', path: '/season' },
  { name: 'Partidas', path: '/games' },
  { name: 'Ranking', path: '/ranking' },
  { name: 'Jogadores', path: '/players' },
  { name: 'Regras da Casa', path: '/house-rules' },
  { name: 'Usuários', path: '/users', requiredRole: 'admin' },
];

export default function PokerNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { hasRole } = useUserRole();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filtragem dos itens de navegação com base nos papéis do usuário
  const filteredNavItems = navItems.filter(item => {
    if (!item.requiredRole) return true;
    return hasRole(item.requiredRole);
  });

  return (
    <header className="sticky top-0 z-50 w-full bg-poker-black/90 backdrop-blur-md border-b border-white/5">
      <div className={`w-full flex h-14 md:h-16 items-center justify-between ${isMobile ? 'px-3' : 'px-4'}`}>
        {/* Logo e seletor de organização */}
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <Link to="/dashboard" className="flex-shrink-0">
            <h1 className={`font-bold bg-gradient-to-r from-poker-gold to-amber-300 bg-clip-text text-transparent ${isMobile ? 'text-lg' : 'text-2xl'}`}>
              APA POKER
            </h1>
          </Link>
          
          {!isMobile && (
            <>
              <OrganizationSelector />
              <ViewerBadge />
            </>
          )}
        </div>
        
        {/* Mobile Menu Toggle */}
        <button 
          className={`md:hidden p-2 text-poker-gold hover:bg-white/5 rounded-md transition-colors ${isMobile ? 'min-w-[40px] min-h-[40px]' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
        
        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6">
          <ul className="flex space-x-1">
            {filteredNavItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "nav-tab flex items-center",
                    location.pathname === item.path ? "text-poker-gold font-medium px-3 py-2 rounded hover:bg-white/5" : "text-white/80 px-3 py-2 rounded hover:bg-white/5"
                  )}
                >
                  {item.requiredRole === 'admin' && (
                    <ShieldAlert className="mr-1 h-3 w-3" />
                  )}
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Perfil do Usuário - Desktop */}
          {user ? (
            <ProfileDropdown />
          ) : (
            <Link 
              to="/auth"
              className="text-sm font-medium bg-poker-gold hover:bg-amber-500 text-white px-4 py-2 rounded transition-colors"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
      
      {/* Mobile Menu Dropdown - otimizado */}
      {isMobileMenuOpen && (
        <nav className="md:hidden bg-poker-black/95 backdrop-blur-md border-t border-white/5 animate-slide-down">
          {/* Organização e Badge em mobile */}
          <div className="px-3 py-3 border-b border-white/5">
            <div className="flex items-center justify-between gap-2">
              <OrganizationSelector />
              <ViewerBadge />
            </div>
          </div>
          
          <ul className="flex flex-col">
            {filteredNavItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center py-3 px-4 border-b border-white/5 min-h-[48px] transition-colors",
                    location.pathname === item.path ? "text-poker-gold bg-white/5" : "text-white hover:bg-white/5"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.requiredRole === 'admin' && (
                    <ShieldAlert className="mr-2 h-4 w-4" />
                  )}
                  {item.name}
                </Link>
              </li>
            ))}
            
            {/* Perfil do usuário para mobile */}
            {user ? (
              <li className="p-4 border-b border-white/5">
                <div className="flex items-center justify-end">
                  <ProfileDropdown />
                </div>
              </li>
            ) : (
              <li>
                <Link
                  to="/auth"
                  className="flex items-center py-3 px-4 text-poker-gold hover:bg-white/5 transition-colors min-h-[48px]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Entrar
                </Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}

// Exportação alternativa para compatibilidade
export { PokerNav };
