
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface Organization {
  id: string;
  name: string;
  role: string;
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  isLoading: boolean;
  selectOrganization: (orgId: string) => Promise<void>;
  createOrganization: (name: string) => Promise<Organization | null>;
  refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load user's organizations
  const fetchOrganizations = async () => {
    if (!user) {
      setOrganizations([]);
      setCurrentOrganization(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Use the RPC function to get user's organizations
      const { data, error } = await supabase.rpc(
        'get_user_organizations', 
        { user_id: user.id }
      );
      
      if (error) throw error;
      
      const orgs = data.map((org: any) => ({
        id: org.organization_id,
        name: org.name,
        role: org.role
      }));
      
      setOrganizations(orgs);
      
      // Try to load the last selected organization from localStorage
      const lastOrgId = localStorage.getItem('currentOrganizationId');
      if (lastOrgId && orgs.some(org => org.id === lastOrgId)) {
        setCurrentOrganization(orgs.find(org => org.id === lastOrgId) || null);
      } else if (orgs.length > 0) {
        // If no stored org or stored org not found, use the first available org
        setCurrentOrganization(orgs[0]);
        localStorage.setItem('currentOrganizationId', orgs[0].id);
      } else {
        setCurrentOrganization(null);
      }
      
    } catch (error: any) {
      console.error('Error fetching organizations:', error.message);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar suas organizações.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize organizations when user changes
  useEffect(() => {
    fetchOrganizations();
  }, [user]);

  // Select an organization
  const selectOrganization = async (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrganization(org);
      localStorage.setItem('currentOrganizationId', orgId);
      navigate('/dashboard');
    }
  };

  // Create a new organization
  const createOrganization = async (name: string): Promise<Organization | null> => {
    if (!user) return null;
    
    try {
      // Insert new organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({ name })
        .select('id, name')
        .single();
        
      if (orgError) throw orgError;
      
      // Add the current user as an admin of the new organization
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: orgData.id,
          user_id: user.id,
          role: 'admin'
        });
        
      if (memberError) throw memberError;
      
      const newOrg = {
        id: orgData.id,
        name: orgData.name,
        role: 'admin'
      };
      
      // Update the local state
      setOrganizations(prev => [...prev, newOrg]);
      setCurrentOrganization(newOrg);
      localStorage.setItem('currentOrganizationId', newOrg.id);
      
      toast({
        title: 'Sucesso',
        description: `Organização "${name}" criada com sucesso.`,
      });
      
      return newOrg;
      
    } catch (error: any) {
      console.error('Error creating organization:', error.message);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a organização.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const refreshOrganizations = fetchOrganizations;

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization,
        organizations,
        isLoading,
        selectOrganization,
        createOrganization,
        refreshOrganizations
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
