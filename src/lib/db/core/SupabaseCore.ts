
import { supabase } from "@/integrations/supabase/client";
import { PokerDB } from '../schema/PokerDBSchema';

export class SupabaseCore {
  constructor() {
    // Initialize any required setup
  }

  // Helper method to check if a user is authenticated
  protected async getUserId(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      throw new Error("User not authenticated");
    }
    
    return session.user.id;
  }

  // Helper to get current organization ID from local storage
  protected getCurrentOrganizationId(): string | null {
    return localStorage.getItem('currentOrganizationId');
  }

  // Helper to verify we have both user and organization
  protected async getUserAndOrgIds(): Promise<{userId: string, orgId: string}> {
    const userId = await this.getUserId();
    const orgId = this.getCurrentOrganizationId();
    
    if (!orgId) {
      throw new Error("No organization selected");
    }

    return { userId, orgId };
  }
}
