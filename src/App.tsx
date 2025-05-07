
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PokerProvider } from "@/contexts/PokerContext";
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

// Create a client for react-query
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PokerProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-poker-black to-poker-navy/90 text-white">
            <PokerNav />
            <main className="flex-1 container py-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/temporada" element={<SeasonConfig />} />
                <Route path="/partidas" element={<GamesList />} />
                <Route path="/partidas/:gameId" element={<GameManagement />} />
                <Route path="/partidas/:gameId/timer" element={<TimerPage />} />
                <Route path="/jogadores" element={<PlayersManagement />} />
                <Route path="/ranking" element={<RankingPage />} />
                <Route path="/relatorio-temporada" element={<SeasonReport />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </PokerProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
