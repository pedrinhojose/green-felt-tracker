
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileDropdown } from './ProfileDropdown';
import { OrganizationSelector } from '@/components/organizations/OrganizationSelector';
import { ViewerBadge } from '@/components/ViewerBadge';
import { useUserRole } from '@/hooks/useUserRole';
import { ShieldAlert } from 'lucide-react';

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
  { name: 'Usuários', path: '/users', requiredRole: 'admin' },
];

export default function PokerNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { hasRole } = useUserRole();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filtragem dos itens de navegação com base nos papéis do usuário
  const filteredNavItems = navItems.filter(item => {
    if (!item.requiredRole) return true;
    return hasRole(item.requiredRole);
  });

  return (
    <header className="sticky top-0 z-50 w-full bg-poker-black/80 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Logo e seletor de organização */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-poker-gold to-amber-300 bg-clip-text text-transparent">
              APA POKER
            </h1>
          </Link>
          <OrganizationSelector />
          <ViewerBadge />
        </div>
        
        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-poker-gold"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu">
              <line x1="4" x2="20" y1="12" y2="12"></line>
              <line x1="4" x2="20" y1="6" y2="6"></line>
              <line x1="4" x2="20" y1="18" y2="18"></line>
            </svg>
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
              className="text-sm font-medium bg-poker-gold hover:bg-amber-500 text-white px-4 py-2 rounded"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <nav className="md:hidden bg-poker-black/95 backdrop-blur-md">
          <ul className="flex flex-col">
            {filteredNavItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center py-3 px-4 border-b border-white/5",
                    location.pathname === item.path ? "text-poker-gold" : "text-white"
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
            {user && (
              <li className="p-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <ViewerBadge />
                  <ProfileDropdown />
                </div>
              </li>
            )}
            
            {/* Link de autenticação para mobile */}
            {!user && (
              <li>
                <Link
                  to="/auth"
                  className="block py-3 px-4 text-white"
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
