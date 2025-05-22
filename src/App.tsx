
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";

// Contexts
import { PokerProvider } from '@/contexts/PokerContext';
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from '@/contexts/AuthContext';
import { OrganizationProvider } from '@/contexts/OrganizationContext';

// Pages
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import PlayersManagement from '@/pages/PlayersManagement';
import GameManagement from '@/pages/GameManagement';
import GamesList from '@/pages/GamesList';
import RankingPage from '@/pages/RankingPage';
import TimerPage from '@/pages/TimerPage';
import SeasonConfig from '@/pages/SeasonConfig';
import SeasonReport from '@/pages/SeasonReport';
import SeasonsList from '@/pages/SeasonsList';
import SeasonDetails from '@/pages/SeasonDetails';
import Auth from '@/pages/Auth';
import UserManagement from '@/pages/UserManagement';
import OrganizationsPage from '@/pages/OrganizationsPage';
import { OrganizationSelectionPage } from '@/pages/OrganizationSelectionPage';
import OrganizationMembersPage from '@/pages/OrganizationMembersPage';
import OrganizationSettingsPage from '@/pages/OrganizationSettingsPage';

// Components
import RequireAuth from '@/components/RequireAuth';
import { OrganizationRequired } from '@/components/organizations/OrganizationRequired';
import AppLayout from '@/components/layout/AppLayout';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="poker-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <OrganizationProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/404" element={<NotFound />} />
              
              {/* Organization routes */}
              <Route path="/organizations" element={
                <RequireAuth>
                  <OrganizationsPage />
                </RequireAuth>
              } />
              <Route path="/organizations/select" element={
                <RequireAuth>
                  <OrganizationSelectionPage />
                </RequireAuth>
              } />
              <Route path="/organizations/:organizationId/members" element={
                <RequireAuth>
                  <OrganizationMembersPage />
                </RequireAuth>
              } />
              <Route path="/organizations/:organizationId/settings" element={
                <RequireAuth>
                  <OrganizationSettingsPage />
                </RequireAuth>
              } />
              
              {/* Protected routes with AppLayout */}
              <Route element={
                <RequireAuth>
                  <OrganizationRequired>
                    <PokerProvider>
                      <AppLayout />
                    </PokerProvider>
                  </OrganizationRequired>
                </RequireAuth>
              }>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/players" element={<PlayersManagement />} />
                <Route path="/game/:gameId" element={<GameManagement />} />
                <Route path="/games" element={<GamesList />} />
                <Route path="/ranking" element={<RankingPage />} />
                <Route path="/timer" element={<TimerPage />} />
                <Route path="/timer/:gameId" element={<TimerPage />} />
                <Route path="/season" element={<SeasonConfig />} />
                <Route path="/report" element={<SeasonReport />} />
                <Route path="/seasons" element={<SeasonsList />} />
                <Route path="/seasons/:seasonId" element={<SeasonDetails />} />
                
                {/* Rotas de administração */}
                <Route path="/users" element={
                  <RequireAuth requiredRole="admin">
                    <UserManagement />
                  </RequireAuth>
                } />
              </Route>
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
            <Toaster />
          </OrganizationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
