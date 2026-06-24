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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alert_rules: {
        Row: {
          channel: Database["public"]["Enums"]["alert_channel"]
          config: Json
          created_at: string
          enabled: boolean
          id: string
          target_account_id: string | null
          workspace_id: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["alert_channel"]
          config?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          target_account_id?: string | null
          workspace_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["alert_channel"]
          config?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          target_account_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_rules_target_account_id_fkey"
            columns: ["target_account_id"]
            isOneToOne: false
            referencedRelation: "target_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_rules_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          country: string | null
          created_at: string
          description: string | null
          domain: string
          enriched_at: string | null
          id: string
          industry: string | null
          krs: string | null
          logo_url: string | null
          name: string
          nip: string | null
          pkd: string | null
          registry_checked_at: string | null
          registry_source: string | null
          regon: string | null
          size: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          domain: string
          enriched_at?: string | null
          id?: string
          industry?: string | null
          krs?: string | null
          logo_url?: string | null
          name: string
          nip?: string | null
          pkd?: string | null
          registry_checked_at?: string | null
          registry_source?: string | null
          regon?: string | null
          size?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          domain?: string
          enriched_at?: string | null
          id?: string
          industry?: string | null
          krs?: string | null
          logo_url?: string | null
          name?: string
          nip?: string | null
          pkd?: string | null
          registry_checked_at?: string | null
          registry_source?: string | null
          regon?: string | null
          size?: string | null
          website?: string | null
        }
        Relationships: []
      }
      identify_events: {
        Row: {
          consent_proof: Json | null
          created_at: string
          id: string
          person_id: string
          session_id: string
          source: Database["public"]["Enums"]["consent_source"]
        }
        Insert: {
          consent_proof?: Json | null
          created_at?: string
          id?: string
          person_id: string
          session_id: string
          source: Database["public"]["Enums"]["consent_source"]
        }
        Update: {
          consent_proof?: Json | null
          created_at?: string
          id?: string
          person_id?: string
          session_id?: string
          source?: Database["public"]["Enums"]["consent_source"]
        }
        Relationships: [
          {
            foreignKeyName: "identify_events_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identify_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          settings: Json
          type: Database["public"]["Enums"]["integration_type"]
          workspace_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          settings?: Json
          type: Database["public"]["Enums"]["integration_type"]
          workspace_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          settings?: Json
          type?: Database["public"]["Enums"]["integration_type"]
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_company_hints: {
        Row: {
          asn: string
          company_id: string
          confidence: number
          first_seen_at: string
          id: string
          ip_prefix: string
          last_seen_at: string
        }
        Insert: {
          asn: string
          company_id: string
          confidence?: number
          first_seen_at?: string
          id?: string
          ip_prefix: string
          last_seen_at?: string
        }
        Update: {
          asn?: string
          company_id?: string
          confidence?: number
          first_seen_at?: string
          id?: string
          ip_prefix?: string
          last_seen_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ip_company_hints_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_lookups: {
        Row: {
          asn_domain: string | null
          asn_name: string | null
          company_domain: string | null
          company_name: string | null
          company_type: string | null
          country: string | null
          created_at: string
          id: string
          ip_prefix: string
          layer: string
          org: string | null
          resolved_company_id: string | null
          site_id: string
        }
        Insert: {
          asn_domain?: string | null
          asn_name?: string | null
          company_domain?: string | null
          company_name?: string | null
          company_type?: string | null
          country?: string | null
          created_at?: string
          id?: string
          ip_prefix: string
          layer: string
          org?: string | null
          resolved_company_id?: string | null
          site_id: string
        }
        Update: {
          asn_domain?: string | null
          asn_name?: string | null
          company_domain?: string | null
          company_name?: string | null
          company_type?: string | null
          country?: string | null
          created_at?: string
          id?: string
          ip_prefix?: string
          layer?: string
          org?: string | null
          resolved_company_id?: string | null
          site_id?: string
        }
        Relationships: []
      }
      pageviews: {
        Row: {
          id: string
          referrer: string | null
          session_id: string
          title: string | null
          ts: string
          url: string
        }
        Insert: {
          id?: string
          referrer?: string | null
          session_id: string
          title?: string | null
          ts?: string
          url: string
        }
        Update: {
          id?: string
          referrer?: string | null
          session_id?: string
          title?: string | null
          ts?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "pageviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          company_id: string | null
          consent_source: Database["public"]["Enums"]["consent_source"]
          consent_ts: string
          created_at: string
          email: string
          id: string
          name: string | null
          workspace_id: string
        }
        Insert: {
          company_id?: string | null
          consent_source: Database["public"]["Enums"]["consent_source"]
          consent_ts?: string
          created_at?: string
          email: string
          id?: string
          name?: string | null
          workspace_id: string
        }
        Update: {
          company_id?: string | null
          consent_source?: Database["public"]["Enums"]["consent_source"]
          consent_ts?: string
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "people_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          anon_id: string
          company_id: string | null
          country: string | null
          high_intent_hit: boolean
          id: string
          intent_score: number
          ip_hash: string | null
          last_alert_at: string | null
          last_seen_at: string
          max_scroll_pct: number
          pageview_count: number
          person_id: string | null
          site_id: string
          started_at: string
          total_duration_ms: number
          user_agent: string | null
        }
        Insert: {
          anon_id: string
          company_id?: string | null
          country?: string | null
          high_intent_hit?: boolean
          id?: string
          intent_score?: number
          ip_hash?: string | null
          last_alert_at?: string | null
          last_seen_at?: string
          max_scroll_pct?: number
          pageview_count?: number
          person_id?: string | null
          site_id: string
          started_at?: string
          total_duration_ms?: number
          user_agent?: string | null
        }
        Update: {
          anon_id?: string
          company_id?: string | null
          country?: string | null
          high_intent_hit?: boolean
          id?: string
          intent_score?: number
          ip_hash?: string | null
          last_alert_at?: string | null
          last_seen_at?: string
          max_scroll_pct?: number
          pageview_count?: number
          person_id?: string | null
          site_id?: string
          started_at?: string
          total_duration_ms?: number
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          alert_threshold: number
          created_at: string
          domain: string
          high_intent_paths: string[]
          id: string
          tracking_id: string
          workspace_id: string
        }
        Insert: {
          alert_threshold?: number
          created_at?: string
          domain: string
          high_intent_paths?: string[]
          id?: string
          tracking_id?: string
          workspace_id: string
        }
        Update: {
          alert_threshold?: number
          created_at?: string
          domain?: string
          high_intent_paths?: string[]
          id?: string
          tracking_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sites_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      target_accounts: {
        Row: {
          company_id: string | null
          created_at: string
          domain_pattern: string | null
          id: string
          label: string | null
          workspace_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          domain_pattern?: string | null
          id?: string
          label?: string | null
          workspace_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          domain_pattern?: string | null
          id?: string
          label?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "target_accounts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "target_accounts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
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
      workspace_members: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          plan: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          plan?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          plan?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_workspace_role: {
        Args: {
          _roles: Database["public"]["Enums"]["workspace_role"][]
          _user_id: string
          _workspace_id: string
        }
        Returns: boolean
      }
      increment_ip_hint: {
        Args: { _asn: string; _company_id: string; _prefix: string }
        Returns: undefined
      }
      is_workspace_member: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
    }
    Enums: {
      alert_channel: "slack" | "teams" | "webhook"
      app_role: "admin"
      consent_source: "form_submit" | "email_link" | "logged_in" | "cmp_signal"
      integration_type: "slack" | "teams" | "webhook"
      workspace_role: "owner" | "admin" | "member"
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
      alert_channel: ["slack", "teams", "webhook"],
      app_role: ["admin"],
      consent_source: ["form_submit", "email_link", "logged_in", "cmp_signal"],
      integration_type: ["slack", "teams", "webhook"],
      workspace_role: ["owner", "admin", "member"],
    },
  },
} as const
