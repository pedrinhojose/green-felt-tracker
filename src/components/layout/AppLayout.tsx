
import { Outlet } from 'react-router-dom';
import { PokerNav } from '@/components/PokerNav';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AppLayout() {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground w-full">
      {/* Navbar principal */}
      <PokerNav />

      {/* Conteúdo principal - otimizado para mobile */}
      <main className="flex-1 overflow-auto w-full">
        <div className={`w-full ${isMobile ? 'px-3 py-2' : 'px-4 py-4'} max-w-full`}>
          <Outlet />
        </div>
      </main>

      {/* Footer - compacto em mobile */}
      <footer className={`border-t bg-background/80 backdrop-blur-sm ${isMobile ? 'py-2' : 'py-4'} w-full`}>
        <div className={`mobile-container flex justify-between items-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
          <div className="text-muted-foreground">
            © {new Date().getFullYear()} APA Poker Manager
          </div>
        </div>
      </footer>
    </div>
  );
}
