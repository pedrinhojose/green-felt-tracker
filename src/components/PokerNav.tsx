
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  path: string;
}

const navItems: NavItem[] = [
  { name: 'Painel', path: '/' },
  { name: 'Temporada', path: '/temporada' },
  { name: 'Partidas', path: '/partidas' },
  { name: 'Ranking', path: '/ranking' },
  { name: 'Jogadores', path: '/jogadores' },
];

export default function PokerNav() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-poker-black/80 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-4 flex h-16 justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-poker-gold to-amber-300 bg-clip-text text-transparent">
            APA POKER
          </h1>
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
        <nav className="hidden md:flex items-center">
          <ul className="flex space-x-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "nav-tab",
                    location.pathname === item.path ? "nav-tab-active" : "nav-tab-inactive"
                  )}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <nav className="md:hidden bg-poker-navy/90 backdrop-blur-md">
          <ul className="flex flex-col">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "block py-3 px-4 border-b border-white/5",
                    location.pathname === item.path ? "text-poker-gold" : "text-white"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
