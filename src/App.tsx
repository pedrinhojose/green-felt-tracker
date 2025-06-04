
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { PokerProvider } from "@/contexts/PokerContext";
import { AudioProvider } from "@/contexts/AudioContext";
import RequireAuth from '@/components/RequireAuth';
import { OrganizationRequired } from '@/components/organizations/OrganizationRequired';
import AppLayout from '@/components/layout/AppLayout';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import PlayersManagement from '@/pages/PlayersManagement';
import SeasonConfig from '@/pages/SeasonConfig';
import GamesList from '@/pages/GamesList';
import GameManagement from '@/pages/GameManagement';
import TimerPage from '@/pages/TimerPage';
import RankingPage from '@/pages/RankingPage';
import SeasonsList from '@/pages/SeasonsList';
import SeasonDetails from '@/pages/SeasonDetails';
import SeasonReport from '@/pages/SeasonReport';
import OrganizationsPage from '@/pages/OrganizationsPage';
import { OrganizationSelectionPage } from '@/pages/OrganizationSelectionPage';
import OrganizationSettingsPage from '@/pages/OrganizationSettingsPage';
import OrganizationMembersPage from '@/pages/OrganizationMembersPage';
import UserManagement from '@/pages/UserManagement';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <Router>
            <OrganizationProvider>
              <PokerProvider>
                <AudioProvider>
                  <div className="min-h-screen bg-poker-black">
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/timer/:gameId?" element={<TimerPage />} />
                      
                      {/* Protected routes */}
                      <Route path="/select-organization" element={
                        <RequireAuth>
                          <OrganizationSelectionPage />
                        </RequireAuth>
                      } />
                      
                      {/* Routes that require organization and use AppLayout */}
                      <Route path="/" element={
                        <RequireAuth>
                          <OrganizationRequired>
                            <AppLayout />
                          </OrganizationRequired>
                        </RequireAuth>
                      }>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="players" element={<PlayersManagement />} />
                        <Route path="season" element={<SeasonConfig />} />
                        <Route path="games" element={<GamesList />} />
                        <Route path="game/:gameId" element={<GameManagement />} />
                        <Route path="ranking" element={<RankingPage />} />
                        <Route path="seasons" element={<SeasonsList />} />
                        <Route path="seasons/:seasonId" element={<SeasonDetails />} />
                        <Route path="seasons/:seasonId/report" element={<SeasonReport />} />
                        <Route path="organization/settings" element={<OrganizationSettingsPage />} />
                        <Route path="organization/members" element={<OrganizationMembersPage />} />
                        <Route path="users" element={<UserManagement />} />
                      </Route>
                      
                      {/* Organizations route (no organization required) */}
                      <Route path="/organizations" element={
                        <RequireAuth>
                          <AppLayout />
                        </RequireAuth>
                      }>
                        <Route index element={<OrganizationsPage />} />
                      </Route>
                      
                      {/* Catch all route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                  <Toaster />
                </AudioProvider>
              </PokerProvider>
            </OrganizationProvider>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
