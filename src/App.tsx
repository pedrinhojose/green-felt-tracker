
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
import Auth from '@/pages/Auth';

// Components
import RequireAuth from '@/components/RequireAuth';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="poker-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <PokerProvider>
                    <Dashboard />
                  </PokerProvider>
                </RequireAuth>
              }
            />
            
            <Route
              path="/players"
              element={
                <RequireAuth>
                  <PokerProvider>
                    <PlayersManagement />
                  </PokerProvider>
                </RequireAuth>
              }
            />
            
            <Route
              path="/game/:id"
              element={
                <RequireAuth>
                  <PokerProvider>
                    <GameManagement />
                  </PokerProvider>
                </RequireAuth>
              }
            />
            
            <Route
              path="/games"
              element={
                <RequireAuth>
                  <PokerProvider>
                    <GamesList />
                  </PokerProvider>
                </RequireAuth>
              }
            />
            
            <Route
              path="/ranking"
              element={
                <RequireAuth>
                  <PokerProvider>
                    <RankingPage />
                  </PokerProvider>
                </RequireAuth>
              }
            />
            
            <Route
              path="/timer"
              element={
                <RequireAuth>
                  <PokerProvider>
                    <TimerPage />
                  </PokerProvider>
                </RequireAuth>
              }
            />
            
            <Route
              path="/season"
              element={
                <RequireAuth>
                  <PokerProvider>
                    <SeasonConfig />
                  </PokerProvider>
                </RequireAuth>
              }
            />
            
            <Route
              path="/report"
              element={
                <RequireAuth>
                  <PokerProvider>
                    <SeasonReport />
                  </PokerProvider>
                </RequireAuth>
              }
            />
            
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
