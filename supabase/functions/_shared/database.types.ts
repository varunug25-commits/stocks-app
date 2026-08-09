export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      company_registry: {
        Row: { id: string; symbol: string; company_name: string; exchange: string; currency: string; cik: string | null; sector: string | null; industry: string | null; logo_url: string | null; logo_source: string | null; created_at: string; updated_at: string };
        Insert: { id: string; symbol: string; company_name: string; exchange: string; currency: string; cik?: string | null; sector?: string | null; industry?: string | null; logo_url?: string | null; logo_source?: string | null; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["company_registry"]["Insert"]>;
      };
      market_data_cache: {
        Row: { cache_key: string; resource_type: Database["public"]["Enums"]["marketbrief_resource_type"]; provider: string; source: string; payload: Json; fetched_at: string; as_of: string | null; expires_at: string; error_code: string | null; created_at: string; updated_at: string };
        Insert: { cache_key: string; resource_type: Database["public"]["Enums"]["marketbrief_resource_type"]; provider: string; source: string; payload: Json; fetched_at: string; as_of?: string | null; expires_at: string; error_code?: string | null; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["market_data_cache"]["Insert"]>;
      };
      provider_request_windows: {
        Row: { provider: string; window_started_at: string; request_count: number; blocked_until: string | null; last_error_code: string | null; updated_at: string };
        Insert: { provider: string; window_started_at: string; request_count?: number; blocked_until?: string | null; last_error_code?: string | null; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["provider_request_windows"]["Insert"]>;
      };
      intelligence_request_windows: {
        Row: { scope: "identity" | "global"; identity_hash: string; window_started_at: string; request_count: number; updated_at: string };
        Insert: { scope: "identity" | "global"; identity_hash: string; window_started_at: string; request_count?: number; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["intelligence_request_windows"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      consume_provider_request_budget: {
        Args: { p_provider: string; p_window_seconds: number; p_max_requests: number; p_cooldown_seconds: number };
        Returns: Json;
      };
      consume_intelligence_request_budget: {
        Args: { p_identity_hash: string; p_window_seconds: number; p_identity_max: number; p_global_max: number };
        Returns: Json;
      };
    };
    Enums: { marketbrief_resource_type: "quote" | "bars" | "company" | "news" | "filings" | "events" | "search" };
    CompositeTypes: Record<string, never>;
  };
};
