
import { Outlet } from 'react-router-dom';
import { PokerNav } from '@/components/PokerNav';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { OrganizationSelector } from '@/components/organizations/OrganizationSelector';

export default function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Navbar principal */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <OrganizationSelector />
            <PokerNav />
          </div>
        </div>
      </header>

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
