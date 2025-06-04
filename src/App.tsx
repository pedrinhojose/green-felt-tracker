
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
          <OrganizationProvider>
            <PokerProvider>
              <AudioProvider>
                <Router>
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
                      
                      <Route path="/dashboard" element={
                        <RequireAuth>
                          <OrganizationRequired>
                            <AppLayout>
                              <Dashboard />
                            </AppLayout>
                          </OrganizationRequired>
                        </RequireAuth>
                      } />
                      
                      <Route path="/players" element={
                        <RequireAuth>
                          <OrganizationRequired>
                            <AppLayout>
                              <PlayersManagement />
                            </AppLayout>
                          </OrganizationRequired>
                        </RequireAuth>
                      } />
                      
                      <Route path="/season" element={
                        <RequireAuth>
                          <OrganizationRequired>
                            <AppLayout>
                              <SeasonConfig />
                            </AppLayout>
                          </OrganizationRequired>
                        </RequireAuth>
                      } />
                      
                      <Route path="/games" element={
                        <RequireAuth>
                          <OrganizationRequired>
                            <AppLayout>
                              <GamesList />
                            </AppLayout>
                          </OrganizationRequired>
                        </RequireAuth>
                      } />
                      
                      <Route path="/game/:gameId" element={
                        <RequireAuth>
                          <OrganizationRequired>
                            <AppLayout>
                              <GameManagement />
                            </AppLayout>
                          </OrganizationRequired>
                        </RequireAuth>
                      } />
                      
                      <Route path="/ranking" element={
                        <RequireAuth>
                          <OrganizationRequired>
                            <AppLayout>
                              <RankingPage />
                            </AppLayout>
                          </OrganizationRequired>
                        </RequireAuth>
                      } />
                      
                      <Route path="/seasons" element={
                        <RequireAuth>
                          <OrganizationRequired>
                            <AppLayout>
                              <SeasonsList />
                            </AppLayout>
                          </OrganizationRequired>
                        </RequireAuth>
                      } />
                      
                      <Route path="/seasons/:seasonId" element={
                        <RequireAuth>
                          <OrganizationRequired>
                            <AppLayout>
                              <SeasonDetails />
                            </AppLayout>
                          </OrganizationRequired>
                        </RequireAuth>
                      } />
                      
                      <Route path="/seasons/:seasonId/report" element={
                        <RequireAuth>
                          <OrganizationRequired>
                            <AppLayout>
                              <SeasonReport />
                            </AppLayout>
                          </OrganizationRequired>
                        </RequireAuth>
                      } />
                      
                      <Route path="/organizations" element={
                        <RequireAuth>
                          <AppLayout>
                            <OrganizationsPage />
                          </AppLayout>
                        </RequireAuth>
                      } />
                      
                      <Route path="/organization/settings" element={
                        <RequireAuth>
                          <OrganizationRequired>
                            <AppLayout>
                              <OrganizationSettingsPage />
                            </AppLayout>
                          </OrganizationRequired>
                        </RequireAuth>
                      } />
                      
                      <Route path="/organization/members" element={
                        <RequireAuth>
                          <OrganizationRequired>
                            <AppLayout>
                              <OrganizationMembersPage />
                            </AppLayout>
                          </OrganizationRequired>
                        </RequireAuth>
                      } />
                      
                      <Route path="/users" element={
                        <RequireAuth>
                          <OrganizationRequired>
                            <AppLayout>
                              <UserManagement />
                            </AppLayout>
                          </OrganizationRequired>
                        </RequireAuth>
                      } />
                      
                      {/* Catch all route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                  <Toaster />
                </Router>
              </AudioProvider>
            </PokerProvider>
          </OrganizationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
