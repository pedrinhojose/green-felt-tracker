
import { Outlet } from 'react-router-dom';
import { PokerNav } from '@/components/PokerNav';

export default function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Navbar principal */}
      <PokerNav />

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t py-4 bg-background">
        <div className="container flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} APA Poker Manager
          </div>
        </div>
      </footer>
    </div>
  );
}
