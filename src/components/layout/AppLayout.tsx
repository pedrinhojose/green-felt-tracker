
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { PokerNav } from '@/components/PokerNav';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOrgMemberRole } from '@/hooks/useOrgMemberRole';

const viewerAllowedPaths = [
  '/dashboard',
  '/seasons',
  '/games',
  '/ranking',
  '/statistics',
  '/house-rules',
];

function isViewerAllowedPath(pathname: string) {
  return viewerAllowedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export default function AppLayout() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { isViewer } = useOrgMemberRole();

  if (isViewer && !isViewerAllowedPath(location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Mobile: keep existing top nav
  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground w-full">
        <PokerNav />
        <main className="flex-1 overflow-auto w-full">
          <div className="w-full px-3 py-2 max-w-full">
            <Outlet />
          </div>
        </main>
        <footer className="border-t bg-background/80 backdrop-blur-sm py-2 w-full">
          <div className="mobile-container flex justify-between items-center text-xs">
            <div className="text-muted-foreground">
              © {new Date().getFullYear()} APA Poker Manager
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Desktop/tablet: sidebar layout
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <main className="flex-1 overflow-auto w-full">
            <div className="w-full px-4 py-4 max-w-full">
              <Outlet />
            </div>
          </main>
          <footer className="border-t bg-background/80 backdrop-blur-sm py-4 w-full">
            <div className="mobile-container flex justify-between items-center text-sm">
              <div className="text-muted-foreground">
                © {new Date().getFullYear()} APA Poker Manager
              </div>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
