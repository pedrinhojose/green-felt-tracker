
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import GameManagement from '@/pages/GameManagement';
import PlayersManagement from '@/pages/PlayersManagement';
import PlayerStatistics from '@/pages/PlayerStatistics';
import PlayerStatisticsDetail from '@/pages/PlayerStatisticsDetail';
import RankingPage from '@/pages/RankingPage';
import SeasonConfig from '@/pages/SeasonConfig';
import UserManagement from '@/pages/UserManagement';
import GamesList from '@/pages/GamesList';
import SeasonsList from '@/pages/SeasonsList';
import SeasonDetails from '@/pages/SeasonDetails';
import SeasonReport from '@/pages/SeasonReport';
import SeasonReportById from '@/pages/SeasonReportById';
import TimerPage from '@/pages/TimerPage';
import HouseRules from '@/pages/HouseRules';
import NotFound from '@/pages/NotFound';
import { OrganizationSelectionPage } from '@/pages/OrganizationSelectionPage';
import OrganizationsPage from '@/pages/OrganizationsPage';
import OrganizationSettingsPage from '@/pages/OrganizationSettingsPage';
import OrganizationMembersPage from '@/pages/OrganizationMembersPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      
      {/* Dashboard */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      {/* Games routes */}
      <Route path="/games" element={
        <ProtectedRoute>
          <GamesList />
        </ProtectedRoute>
      } />
      
      <Route path="/games/:gameId" element={
        <ProtectedRoute>
          <GameManagement />
        </ProtectedRoute>
      } />
      
      <Route path="/timer/:gameId" element={
        <ProtectedRoute useLayout={false}>
          <TimerPage />
        </ProtectedRoute>
      } />
      
      {/* Players routes */}
      <Route path="/players" element={
        <ProtectedRoute>
          <PlayersManagement />
        </ProtectedRoute>
      } />
      
      {/* Statistics routes */}
      <Route path="/statistics" element={
        <ProtectedRoute>
          <PlayerStatistics />
        </ProtectedRoute>
      } />
      
      <Route path="/statistics/:playerId" element={
        <ProtectedRoute>
          <PlayerStatisticsDetail />
        </ProtectedRoute>
      } />
      
      {/* Ranking */}
      <Route path="/ranking" element={
        <ProtectedRoute>
          <RankingPage />
        </ProtectedRoute>
      } />
      
      {/* Season routes */}
      <Route path="/season" element={
        <ProtectedRoute>
          <SeasonConfig />
        </ProtectedRoute>
      } />
      
      <Route path="/seasons" element={
        <ProtectedRoute>
          <SeasonsList />
        </ProtectedRoute>
      } />
      
      <Route path="/seasons/:seasonId" element={
        <ProtectedRoute>
          <SeasonDetails />
        </ProtectedRoute>
      } />
      
      <Route path="/seasons/:seasonId/report" element={
        <ProtectedRoute>
          <SeasonReportById />
        </ProtectedRoute>
      } />
      
      <Route path="/reports/season" element={
        <ProtectedRoute>
          <SeasonReport />
        </ProtectedRoute>
      } />
      
      {/* House Rules */}
      <Route path="/house-rules" element={
        <ProtectedRoute>
          <HouseRules />
        </ProtectedRoute>
      } />
      
      {/* User Management - Admin only */}
      <Route path="/users" element={
        <ProtectedRoute requiredRole="admin">
          <UserManagement />
        </ProtectedRoute>
      } />
      
      {/* Organization management routes */}
      <Route path="/organization-selection" element={
        <ProtectedRoute requireOrganization={false} useLayout={false}>
          <OrganizationSelectionPage />
        </ProtectedRoute>
      } />
      
      <Route path="/organizations" element={
        <ProtectedRoute requireOrganization={false}>
          <OrganizationsPage />
        </ProtectedRoute>
      } />
      
      <Route path="/organizations/:organizationId/settings" element={
        <ProtectedRoute requireOrganization={false}>
          <OrganizationSettingsPage />
        </ProtectedRoute>
      } />
      
      <Route path="/organizations/:organizationId/members" element={
        <ProtectedRoute requireOrganization={false}>
          <OrganizationMembersPage />
        </ProtectedRoute>
      } />
      
      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
