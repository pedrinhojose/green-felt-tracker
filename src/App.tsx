
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";

// Contexts
import { PokerProvider } from '@/contexts/PokerContext';
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from '@/contexts/AuthContext';

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

// Components
import RequireAuth from '@/components/RequireAuth';
import AppLayout from '@/components/layout/AppLayout';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="poker-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/404" element={<NotFound />} />
            
            {/* Protected routes with AppLayout */}
            <Route element={
              <RequireAuth>
                <PokerProvider>
                  <AppLayout />
                </PokerProvider>
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
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
