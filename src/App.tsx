
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from '@/contexts/AuthContext';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { PokerProvider } from '@/contexts/PokerContext';
import { AudioProvider } from '@/contexts/AudioContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import SeasonConfig from '@/pages/SeasonConfig';
import SeasonsList from '@/pages/SeasonsList';
import SeasonDetails from '@/pages/SeasonDetails';
import GamesList from '@/pages/GamesList';
import GameManagement from '@/pages/GameManagement';
import TimerPage from '@/pages/TimerPage';
import RankingPage from '@/pages/RankingPage';
import PlayersManagement from '@/pages/PlayersManagement';
import HouseRules from '@/pages/HouseRules';
import UserManagement from '@/pages/UserManagement';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import NotFound from '@/pages/NotFound';
import RequireAuth from '@/components/RequireAuth';
import { RequireEditor } from '@/components/auth/RequireEditor';
import { OrganizationRequired } from '@/components/organizations/OrganizationRequired';
import AppLayout from '@/components/layout/AppLayout';
import OrganizationSettingsPage from '@/pages/OrganizationSettingsPage';
import OrganizationMembersPage from '@/pages/OrganizationMembersPage';
import { Navigate } from 'react-router-dom';
import SeasonReport from '@/pages/SeasonReport';
import PlayerStatistics from '@/pages/PlayerStatistics';
import PlayerStatisticsDetail from '@/pages/PlayerStatisticsDetail';
import Finance from '@/pages/Finance';
import FinanceReceivables from '@/pages/FinanceReceivables';
import FinanceJackpot from '@/pages/FinanceJackpot';
import CaixinhaManagement from '@/pages/CaixinhaManagement';
import PublicSeasonView from '@/pages/PublicSeasonView';
import PublicGameView from '@/pages/PublicGameView';
import ResetPassword from '@/pages/ResetPassword';
import GalleryPage from '@/pages/GalleryPage';
import ThemesPage from '@/pages/ThemesPage';

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider>
    <div className="min-h-screen bg-gradient-to-br from-poker-black via-slate-900 to-poker-black">
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <Router 
          future={{ 
            v7_startTransition: true,
            v7_relativeSplatPath: true 
          }}
        >
          <AuthProvider>
            <OrganizationProvider>
              <AudioProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Auth />} />
                  <Route path="/auth" element={<Auth />} />
                  {/* Redirecionar rotas de organização antigas para dashboard */}
                  <Route path="/organizations" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/organization-selection" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Rotas públicas sem autenticação */}
                  <Route path="/public/season/:shareToken" element={<PublicSeasonView />} />
                  <Route path="/public/game/:shareToken" element={<PublicGameView />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  
                  <Route element={<RequireAuth><OrganizationRequired><PokerProvider><AppLayout /></PokerProvider></OrganizationRequired></RequireAuth>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/seasons" element={<SeasonsList />} />
                    <Route path="/seasons/:seasonId" element={<SeasonDetails />} />
                    <Route path="/games" element={<GamesList />} />
                    <Route path="/games/:gameId" element={<GameManagement />} />
                    <Route path="/timer/:gameId" element={<TimerPage />} />
                    <Route path="/ranking" element={<RankingPage />} />
                    <Route path="/statistics" element={<PlayerStatistics />} />
                    <Route path="/statistics/player/:playerId" element={<PlayerStatisticsDetail />} />
                    <Route path="/house-rules" element={<HouseRules />} />
                    <Route path="/reports/season" element={<SeasonReport />} />
                    <Route path="/gallery" element={<GalleryPage />} />
                    <Route path="/themes" element={<ThemesPage />} />

                    {/* Rotas bloqueadas para visitantes */}
                    <Route element={<RequireEditor />}>
                      <Route path="/season" element={<SeasonConfig />} />
                      <Route path="/players" element={<PlayersManagement />} />
                      <Route path="/users" element={<UserManagement />} />
                      <Route path="/organization/settings" element={<OrganizationSettingsPage />} />
                      <Route path="/organization/members" element={<OrganizationMembersPage />} />
                      <Route path="/caixinha" element={<Navigate to="/finance/caixinha" replace />} />
                      <Route path="/finance/club-cash" element={<Navigate to="/finance/caixinha" replace />} />
                      <Route path="/finance" element={<Finance />}>
                        <Route index element={<Navigate to="/finance/receivables" replace />} />
                        <Route path="receivables" element={<FinanceReceivables />} />
                        <Route path="jackpot" element={<FinanceJackpot />} />
                        <Route path="caixinha" element={<CaixinhaManagement />} />
                      </Route>
                      <Route path="/super-admin" element={<SuperAdminDashboard />} />
                    </Route>
                  </Route>
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AudioProvider>
            </OrganizationProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </div>
    </ThemeProvider>
  );
}

export default App;
