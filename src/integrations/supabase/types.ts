export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      caixinha_transactions: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          description: string
          id: string
          organization_id: string | null
          season_id: string
          type: string
          user_id: string
          withdrawal_date: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by: string
          description: string
          id?: string
          organization_id?: string | null
          season_id: string
          type?: string
          user_id: string
          withdrawal_date?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          organization_id?: string | null
          season_id?: string
          type?: string
          user_id?: string
          withdrawal_date?: string
        }
        Relationships: []
      }
      club_fund_transactions: {
        Row: {
          amount: number
          created_at: string
          date: string
          description: string
          id: string
          organization_id: string | null
          season_id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          date?: string
          description: string
          id?: string
          organization_id?: string | null
          season_id: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          description?: string
          id?: string
          organization_id?: string | null
          season_id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      eliminations: {
        Row: {
          created_at: string
          eliminated_player_id: string
          elimination_time: string
          eliminator_player_id: string | null
          game_id: string
          id: string
          organization_id: string | null
          position: number
          user_id: string
        }
        Insert: {
          created_at?: string
          eliminated_player_id: string
          elimination_time?: string
          eliminator_player_id?: string | null
          game_id: string
          id?: string
          organization_id?: string | null
          position: number
          user_id: string
        }
        Update: {
          created_at?: string
          eliminated_player_id?: string
          elimination_time?: string
          eliminator_player_id?: string | null
          game_id?: string
          id?: string
          organization_id?: string | null
          position?: number
          user_id?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          created_at: string
          date: string
          dinner_cost: number | null
          id: string
          is_finished: boolean
          number: number
          organization_id: string | null
          players: Json
          public_share_token: string | null
          season_id: string
          total_prize_pool: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          dinner_cost?: number | null
          id: string
          is_finished?: boolean
          number: number
          organization_id?: string | null
          players?: Json
          public_share_token?: string | null
          season_id: string
          total_prize_pool?: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          dinner_cost?: number | null
          id?: string
          is_finished?: boolean
          number?: number
          organization_id?: string | null
          players?: Json
          public_share_token?: string | null
          season_id?: string
          total_prize_pool?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          settings: Json
          subscription_plan: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          settings?: Json
          subscription_plan?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          settings?: Json
          subscription_plan?: string
          updated_at?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          birth_date: string | null
          city: string | null
          created_at: string
          id: string
          name: string
          organization_id: string | null
          phone: string | null
          photo_base64: string | null
          photo_url: string | null
          user_id: string
        }
        Insert: {
          birth_date?: string | null
          city?: string | null
          created_at?: string
          id: string
          name: string
          organization_id?: string | null
          phone?: string | null
          photo_base64?: string | null
          photo_url?: string | null
          user_id: string
        }
        Update: {
          birth_date?: string | null
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          organization_id?: string | null
          phone?: string | null
          photo_base64?: string | null
          photo_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          default_role: Database["public"]["Enums"]["app_role"]
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          default_role?: Database["public"]["Enums"]["app_role"]
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          default_role?: Database["public"]["Enums"]["app_role"]
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      rankings: {
        Row: {
          best_position: number
          games_played: number
          id: string
          organization_id: string | null
          photo_url: string | null
          player_id: string
          player_name: string
          season_id: string
          total_points: number
          user_id: string
        }
        Insert: {
          best_position?: number
          games_played?: number
          id: string
          organization_id?: string | null
          photo_url?: string | null
          player_id: string
          player_name: string
          season_id: string
          total_points?: number
          user_id: string
        }
        Update: {
          best_position?: number
          games_played?: number
          id?: string
          organization_id?: string | null
          photo_url?: string | null
          player_id?: string
          player_name?: string
          season_id?: string
          total_points?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rankings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rankings_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      season_jackpot_distributions: {
        Row: {
          created_at: string
          distributed_at: string
          id: string
          organization_id: string | null
          percentage: number
          player_id: string
          player_name: string
          position: number
          prize_amount: number
          season_id: string
          total_jackpot: number
          user_id: string
        }
        Insert: {
          created_at?: string
          distributed_at?: string
          id?: string
          organization_id?: string | null
          percentage: number
          player_id: string
          player_name: string
          position: number
          prize_amount: number
          season_id: string
          total_jackpot: number
          user_id: string
        }
        Update: {
          created_at?: string
          distributed_at?: string
          id?: string
          organization_id?: string | null
          percentage?: number
          player_id?: string
          player_name?: string
          position?: number
          prize_amount?: number
          season_id?: string
          total_jackpot?: number
          user_id?: string
        }
        Relationships: []
      }
      seasons: {
        Row: {
          blind_structure: Json
          caixinha_balance: number
          created_at: string
          end_date: string | null
          financial_params: Json
          game_frequency: string
          games_per_period: number
          games_per_week: number
          host_schedule: Json
          house_rules: string | null
          id: string
          is_active: boolean
          jackpot: number
          name: string
          organization_id: string | null
          public_share_token: string | null
          score_schema: Json
          season_prize_schema: Json
          start_date: string
          user_id: string
          weekly_prize_schema: Json
        }
        Insert: {
          blind_structure?: Json
          caixinha_balance?: number
          created_at?: string
          end_date?: string | null
          financial_params?: Json
          game_frequency?: string
          games_per_period?: number
          games_per_week?: number
          host_schedule?: Json
          house_rules?: string | null
          id: string
          is_active?: boolean
          jackpot?: number
          name: string
          organization_id?: string | null
          public_share_token?: string | null
          score_schema?: Json
          season_prize_schema?: Json
          start_date: string
          user_id: string
          weekly_prize_schema?: Json
        }
        Update: {
          blind_structure?: Json
          caixinha_balance?: number
          created_at?: string
          end_date?: string | null
          financial_params?: Json
          game_frequency?: string
          games_per_period?: number
          games_per_week?: number
          host_schedule?: Json
          house_rules?: string | null
          id?: string
          is_active?: boolean
          jackpot?: number
          name?: string
          organization_id?: string | null
          public_share_token?: string | null
          score_schema?: Json
          season_prize_schema?: Json
          start_date?: string
          user_id?: string
          weekly_prize_schema?: Json
        }
        Relationships: [
          {
            foreignKeyName: "seasons_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_organization_with_admin: {
        Args: { p_name: string }
        Returns: {
          id: string
          name: string
        }[]
      }
      get_caixinha_stats: { Args: { p_season_id: string }; Returns: Json }
      get_user_organizations: {
        Args: { p_user_id: string }
        Returns: {
          name: string
          organization_id: string
          role: string
        }[]
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: boolean
      }
      is_admin_of_organization: { Args: { org_id: string }; Returns: boolean }
      is_member_of_organization: { Args: { org_id: string }; Returns: boolean }
      set_user_role: {
        Args: { p_role: string; p_user_id: string }
        Returns: undefined
      }
      user_can_access_organization: {
        Args: { org_id: string }
        Returns: boolean
      }
      user_can_access_organization_members: {
        Args: { org_id: string }
        Returns: boolean
      }
      user_can_admin_organization: {
        Args: { org_id: string }
        Returns: boolean
      }
      user_can_manage_organization_members: {
        Args: { org_id: string }
        Returns: boolean
      }
      user_organization_check: { Args: { org_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "player" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "player", "viewer"],
    },
  },
} as const
