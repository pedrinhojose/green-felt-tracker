
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from 'react-query';

import { AuthProvider } from '@/contexts/AuthContext';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { PokerProvider } from '@/contexts/PokerContext';
import { AudioProvider } from '@/contexts/AudioContext';

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
import NotFound from '@/pages/NotFound';
import RequireAuth from '@/components/RequireAuth';
import AppLayout from '@/components/layout/AppLayout';
import { OrganizationSelectionPage } from '@/pages/OrganizationSelectionPage';
import OrganizationsPage from '@/pages/OrganizationsPage';
import OrganizationSettingsPage from '@/pages/OrganizationSettingsPage';
import OrganizationMembersPage from '@/pages/OrganizationMembersPage';
import SeasonReport from '@/pages/SeasonReport';
import PlayerStatistics from '@/pages/PlayerStatistics';
import PlayerStatisticsDetail from '@/pages/PlayerStatisticsDetail';
import PublicSeasonView from '@/pages/PublicSeasonView';

const queryClient = new QueryClient();

function App() {
  return (
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
              <PokerProvider>
                <AudioProvider>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/organizations" element={<OrganizationsPage />} />
                    <Route path="/organization-selection" element={<OrganizationSelectionPage />} />
                    
                    {/* Rota pública sem autenticação */}
                    <Route path="/public/season/:shareToken" element={<PublicSeasonView />} />
                    
                    <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/season" element={<SeasonConfig />} />
                      <Route path="/seasons" element={<SeasonsList />} />
                      <Route path="/seasons/:seasonId" element={<SeasonDetails />} />
                      <Route path="/games" element={<GamesList />} />
                      <Route path="/games/:gameId" element={<GameManagement />} />
                      <Route path="/timer/:gameId" element={<TimerPage />} />
                      <Route path="/ranking" element={<RankingPage />} />
                      <Route path="/players" element={<PlayersManagement />} />
                      <Route path="/statistics" element={<PlayerStatistics />} />
                      <Route path="/statistics/player/:playerId" element={<PlayerStatisticsDetail />} />
                      <Route path="/house-rules" element={<HouseRules />} />
                      <Route path="/users" element={<UserManagement />} />
                      <Route path="/organization/settings" element={<OrganizationSettingsPage />} />
                      <Route path="/organization/members" element={<OrganizationMembersPage />} />
                      <Route path="/reports/season" element={<SeasonReport />} />
                    </Route>
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AudioProvider>
              </PokerProvider>
            </OrganizationProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </div>
  );
}

export default App;
