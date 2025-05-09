
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { PokerNav } from '../PokerNav';
import { Button } from '../ui/button';
import { Calendar, EqualSquare, GraduationCap, List, Truck, User, Users } from 'lucide-react';
import { BackupButton } from '../BackupButton';
import { ProfileDropdown } from '../ProfileDropdown';
import { useState, useEffect } from 'react';
import { usePoker } from '@/contexts/PokerContext';
import { useMobile } from '@/hooks/use-mobile';
import { Separator } from '../ui/separator';

export default function AppLayout() {
  const navigate = useNavigate();
  const isMobile = useMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { activeSeason } = usePoker();
  
  // Close menu when navigating (mobile)
  useEffect(() => {
    return () => setIsMenuOpen(false);
  }, [navigate]);
  
  // Menu Items
  const menuItems = [
    {
      name: 'Dashboard',
      icon: <EqualSquare className="h-5 w-5" />,
      path: '/dashboard'
    },
    {
      name: 'Jogadores',
      icon: <Users className="h-5 w-5" />,
      path: '/players'
    },
    {
      name: 'Partidas',
      icon: <Calendar className="h-5 w-5" />,
      path: '/games'
    },
    {
      name: 'Ranking',
      icon: <GraduationCap className="h-5 w-5" />,
      path: '/ranking'
    },
    {
      name: 'Temporadas',
      icon: <List className="h-5 w-5" />,
      path: '/seasons'
    },
    {
      name: activeSeason ? 'Temporada Ativa' : 'Nova Temporada',
      icon: <Truck className="h-5 w-5" />,
      path: '/season'
    }
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-poker-dark text-white">
      {/* Top Nav */}
      <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-poker-dark-green bg-poker-darkest px-4 md:px-6">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-poker-gold">APA</span> Poker
        </Link>
        
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden md:flex">
            <BackupButton />
          </div>
          <ProfileDropdown />
          
          {/* Mobile Menu Toggle */}
          <Button 
            variant="outline" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <List className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-1">
        {/* Side Navigation */}
        <div 
          className={`${
            isMobile 
              ? isMenuOpen 
                ? "fixed inset-0 z-20 bg-poker-darkest/80 backdrop-blur-sm"
                : "hidden"
              : "sticky top-16 h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-poker-dark-green"
          }`}
        >
          <div className={`${
            isMobile 
              ? "fixed inset-y-0 left-0 z-20 w-64 animate-in slide-in-from-left-80 bg-poker-darkest"
              : ""
          } flex h-full flex-col gap-2`}>
            
            <div className="flex flex-col gap-1 p-4">
              {menuItems.map(item => (
                <Button
                  key={item.name}
                  variant="ghost"
                  className="justify-start gap-2"
                  onClick={() => {
                    navigate(item.path);
                    setIsMenuOpen(false);
                  }}
                >
                  {item.icon}
                  {item.name}
                </Button>
              ))}
            </div>
            
            <div className="flex-1"></div>
            
            <div className="p-4 md:hidden">
              <BackupButton />
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          <PokerNav />
          <Outlet />
        </div>
      </div>
    </div>
  );
}
