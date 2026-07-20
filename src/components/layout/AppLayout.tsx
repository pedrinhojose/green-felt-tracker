import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useOrgMemberRole } from '@/hooks/useOrgMemberRole';

const viewerAllowedPaths = [
  '/dashboard',
  '/seasons',
  '/games',
  '/ranking',
  '/statistics',
  '/house-rules',
  '/themes',
];

function isViewerAllowedPath(pathname: string) {
  return viewerAllowedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export default function AppLayout() {
  const location = useLocation();
  const { isViewer } = useOrgMemberRole();
  const { currentOrganization } = useOrganization();

  if (isViewer && !isViewerAllowedPath(location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="sticky top-0 z-40 flex h-12 items-center gap-2 border-b border-white/5 bg-poker-black/90 backdrop-blur-md px-3">
            <SidebarTrigger className="text-poker-gold hover:bg-white/5" />
            <Link to="/dashboard" className="min-w-0">
              <span className="font-bold bg-gradient-to-r from-poker-gold to-amber-300 bg-clip-text text-transparent text-sm truncate">
                {currentOrganization?.name || 'Poker Manager'}
              </span>
            </Link>
          </header>
          <main className="flex-1 overflow-auto w-full">
            <div className="w-full px-3 md:px-4 py-3 md:py-4 max-w-full">
              <Outlet />
            </div>
          </main>
          <footer className="border-t bg-background/80 backdrop-blur-sm py-2 md:py-4 w-full">
            <div className="mobile-container flex justify-between items-center text-xs md:text-sm">
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
