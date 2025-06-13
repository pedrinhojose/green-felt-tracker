
import { Outlet } from 'react-router-dom';
import { PokerNav } from '@/components/PokerNav';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AppLayout() {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Navbar principal */}
      <PokerNav />

      {/* Conteúdo principal */}
      <main className={`flex-1 overflow-auto ${isMobile ? 'pb-4' : ''}`}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className={`border-t bg-background ${isMobile ? 'py-2' : 'py-4'}`}>
        <div className={`container flex justify-between items-center ${isMobile ? 'px-2' : ''}`}>
          <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
            © {new Date().getFullYear()} APA Poker Manager
          </div>
        </div>
      </footer>
    </div>
  );
}
