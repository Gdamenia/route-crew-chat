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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
      channel_read_cursors: {
        Row: {
          channel_id: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          location_lat: number | null
          location_lng: number | null
          media_url: string | null
          message_type: string | null
          receiver_id: string
          sender_id: string
          text_content: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          location_lat?: number | null
          location_lng?: number | null
          media_url?: string | null
          message_type?: string | null
          receiver_id: string
          sender_id: string
          text_content: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          location_lat?: number | null
          location_lng?: number | null
          media_url?: string | null
          message_type?: string | null
          receiver_id?: string
          sender_id?: string
          text_content?: string
        }
        Relationships: []
      }
      driver_presence: {
        Row: {
          current_route: string | null
          heading: number | null
          id: string
          is_visible: boolean | null
          last_seen_at: string | null
          lat: number | null
          lng: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          current_route?: string | null
          heading?: number | null
          id?: string
          is_visible?: boolean | null
          last_seen_at?: string | null
          lat?: number | null
          lng?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          current_route?: string | null
          heading?: number | null
          id?: string
          is_visible?: boolean | null
          last_seen_at?: string | null
          lat?: number | null
          lng?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_presence_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_profiles: {
        Row: {
          bio: string | null
          created_at: string | null
          display_name: string
          dnd_enabled: boolean | null
          id: string
          is_verified: boolean | null
          language: string | null
          photo_url: string | null
          status: string | null
          theme: string | null
          truck_type: string | null
          user_id: string
          visibility_mode: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          display_name: string
          dnd_enabled?: boolean | null
          id?: string
          is_verified?: boolean | null
          language?: string | null
          photo_url?: string | null
          status?: string | null
          theme?: string | null
          truck_type?: string | null
          user_id: string
          visibility_mode?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          display_name?: string
          dnd_enabled?: boolean | null
          id?: string
          is_verified?: boolean | null
          language?: string | null
          photo_url?: string | null
          status?: string | null
          theme?: string | null
          truck_type?: string | null
          user_id?: string
          visibility_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          id: string
          reason: string
          reporter_user_id: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reason: string
          reporter_user_id: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reason?: string
          reporter_user_id?: string
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_user_id_fkey"
            columns: ["reporter_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      route_channel_members: {
        Row: {
          channel_id: string
          id: string
          joined_at: string | null
          muted: boolean | null
          user_id: string
        }
        Insert: {
          channel_id: string
          id?: string
          joined_at?: string | null
          muted?: boolean | null
          user_id: string
        }
        Update: {
          channel_id?: string
          id?: string
          joined_at?: string | null
          muted?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "route_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_channel_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      route_channels: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          route_code: string
          route_name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          route_code: string
          route_name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          route_code?: string
          route_name?: string
        }
        Relationships: []
      }
      route_messages: {
        Row: {
          channel_id: string
          created_at: string | null
          id: string
          location_lat: number | null
          location_lng: number | null
          media_url: string | null
          message_type: string | null
          sender_user_id: string
          text_content: string
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          media_url?: string | null
          message_type?: string | null
          sender_user_id: string
          text_content: string
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          media_url?: string | null
          message_type?: string | null
          sender_user_id?: string
          text_content?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "route_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_messages_sender_user_id_fkey"
            columns: ["sender_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          language: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          language?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          language?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
