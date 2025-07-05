
import React from 'react';
import RequireAuth from '@/components/RequireAuth';
import { OrganizationRequired } from '@/components/organizations/OrganizationRequired';
import AppLayout from '@/components/layout/AppLayout';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOrganization?: boolean;
  useLayout?: boolean;
  requiredRole?: 'admin' | 'player' | 'viewer';
}

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requireOrganization = true, 
  useLayout = true,
  requiredRole 
}: ProtectedRouteProps) => {
  let content = children;

  // Wrap with layout if needed
  if (useLayout) {
    content = <AppLayout>{content}</AppLayout>;
  }

  // Wrap with organization requirement if needed
  if (requireOrganization) {
    content = <OrganizationRequired>{content}</OrganizationRequired>;
  }

  // Wrap with auth requirement if needed
  if (requireAuth) {
    content = <RequireAuth requiredRole={requiredRole}>{content}</RequireAuth>;
  }

  return <>{content}</>;
};

export default ProtectedRoute;
