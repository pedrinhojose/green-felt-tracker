
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PokerProvider } from "@/contexts/PokerContext";
import { AuthProvider } from "@/contexts/AuthContext";
import PokerNav from "@/components/PokerNav";
import Dashboard from "@/pages/Dashboard";
import SeasonConfig from "@/pages/SeasonConfig";
import GamesList from "@/pages/GamesList";
import GameManagement from "@/pages/GameManagement";
import PlayersManagement from "@/pages/PlayersManagement";
import RankingPage from "@/pages/RankingPage";
import SeasonReport from "@/pages/SeasonReport";
import NotFound from "./pages/NotFound";
import TimerPage from "@/pages/TimerPage";
import Auth from "@/pages/Auth";
import RequireAuth from "@/components/RequireAuth";
import { ThemeProvider } from "@/components/ui/theme-provider";

// Create a client for react-query
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <AuthProvider>
          <PokerProvider>
            <BrowserRouter>
              <Toaster />
              <Sonner />
              <div className="min-h-screen flex flex-col bg-gradient-to-br from-poker-black to-poker-navy/90 text-white">
                <PokerNav />
                <main className="flex-1 container py-6">
                  <Routes>
                    {/* Rota de autenticação */}
                    <Route path="/auth" element={<Auth />} />
                    
                    {/* Rotas protegidas */}
                    <Route 
                      path="/" 
                      element={
                        <RequireAuth>
                          <Dashboard />
                        </RequireAuth>
                      } 
                    />
                    <Route 
                      path="/temporada" 
                      element={
                        <RequireAuth>
                          <SeasonConfig />
                        </RequireAuth>
                      } 
                    />
                    <Route 
                      path="/partidas" 
                      element={
                        <RequireAuth>
                          <GamesList />
                        </RequireAuth>
                      } 
                    />
                    <Route 
                      path="/partidas/:gameId" 
                      element={
                        <RequireAuth>
                          <GameManagement />
                        </RequireAuth>
                      } 
                    />
                    <Route 
                      path="/partidas/:gameId/timer" 
                      element={
                        <RequireAuth>
                          <TimerPage />
                        </RequireAuth>
                      } 
                    />
                    <Route 
                      path="/jogadores" 
                      element={
                        <RequireAuth>
                          <PlayersManagement />
                        </RequireAuth>
                      } 
                    />
                    <Route 
                      path="/ranking" 
                      element={
                        <RequireAuth>
                          <RankingPage />
                        </RequireAuth>
                      } 
                    />
                    <Route 
                      path="/relatorio-temporada" 
                      element={
                        <RequireAuth>
                          <SeasonReport />
                        </RequireAuth>
                      } 
                    />
                    
                    {/* Rota 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </BrowserRouter>
          </PokerProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
