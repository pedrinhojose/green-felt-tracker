
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
}
