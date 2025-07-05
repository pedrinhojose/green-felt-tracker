
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { PokerProvider } from "@/contexts/PokerContext";
import { AudioProvider } from "@/contexts/AudioContext";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { RequireAuth } from "@/components/RequireAuth";
import { OrganizationRequired } from "@/components/organizations/OrganizationRequired";
import AppLayout from "@/components/layout/AppLayout";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import GameManagement from "@/pages/GameManagement";
import PlayersManagement from "@/pages/PlayersManagement";
import PlayerStatistics from "@/pages/PlayerStatistics";
import PlayerStatisticsDetail from "@/pages/PlayerStatisticsDetail";
import RankingPage from "@/pages/RankingPage";
import SeasonConfig from "@/pages/SeasonConfig";
import UserManagement from "@/pages/UserManagement";
import GamesList from "@/pages/GamesList";
import SeasonsList from "@/pages/SeasonsList";
import SeasonDetails from "@/pages/SeasonDetails";
import SeasonReport from "@/pages/SeasonReport";
import SeasonReportById from "@/pages/SeasonReportById";
import TimerPage from "@/pages/TimerPage";
import HouseRules from "@/pages/HouseRules";
import NotFound from "@/pages/NotFound";
import OrganizationSelectionPage from "@/pages/OrganizationSelectionPage";
import OrganizationsPage from "@/pages/OrganizationsPage";
import OrganizationSettingsPage from "@/pages/OrganizationSettingsPage";
import OrganizationMembersPage from "@/pages/OrganizationMembersPage";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <OrganizationProvider>
                <PokerProvider>
                  <AudioProvider>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      
                      {/* Protected routes with organization requirement */}
                      <Route path="/dashboard" element={
                        <RequireAuth>
                          <OrganizationRequired>
                            <AppLayout>
                              <Dashboard />
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
                      
                      <Route path="/games/:gameId" element={
                        <RequireAuth>
                          <OrganizationRequired>
                            <AppLayout>
                              <GameManagement />
                            </AppLayout>
                          </OrganizationRequired>
                        </RequireAuth>
                      } />
                      
                      <Route path="/timer/:gameId" element={
                        <RequireAuth>
                          <OrganizationRequired>
                            <TimerPage />
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
                      
                      <Route path="/statistics" element={
                        <RequireAuth>
                          <OrganizationRequired>
                            <AppLayout>
                              <PlayerStatistics />
                            </AppLayout>
                          </OrganizationRequired>
                        </RequireAuth>
                      } />
                      
                      <Route path="/statistics/:playerId" element={
                        <RequireAuth>
                          <OrganizationRequired>
                            <AppLayout>
                              <PlayerStatisticsDetail />
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
                      
                      <Route path="/season" element={
                        <RequireAuth>
                          <OrganizationRequired>
                            <AppLayout>
                              <SeasonConfig />
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
                              <SeasonReportById />
                            </AppLayout>
                          </OrganizationRequired>
                        </RequireAuth>
                      } />
                      
                      <Route path="/reports/season" element={
                        <RequireAuth>
                          <OrganizationRequired>
                            <AppLayout>
                              <SeasonReport />
                            </AppLayout>
                          </OrganizationRequired>
                        </RequireAuth>
                      } />
                      
                      <Route path="/house-rules" element={
                        <RequireAuth>
                          <OrganizationRequired>
                            <AppLayout>
                              <HouseRules />
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
                      
                      {/* Organization management routes */}
                      <Route path="/organization-selection" element={
                        <RequireAuth>
                          <OrganizationSelectionPage />
                        </RequireAuth>
                      } />
                      
                      <Route path="/organizations" element={
                        <RequireAuth>
                          <AppLayout>
                            <OrganizationsPage />
                          </AppLayout>
                        </RequireAuth>
                      } />
                      
                      <Route path="/organizations/:organizationId/settings" element={
                        <RequireAuth>
                          <AppLayout>
                            <OrganizationSettingsPage />
                          </AppLayout>
                        </RequireAuth>
                      } />
                      
                      <Route path="/organizations/:organizationId/members" element={
                        <RequireAuth>
                          <AppLayout>
                            <OrganizationMembersPage />
                          </AppLayout>
                        </RequireAuth>
                      } />
                      
                      {/* Catch all route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <Toaster />
                    <Sonner />
                  </AudioProvider>
                </PokerProvider>
              </OrganizationProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
