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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      call_recordings: {
        Row: {
          consultation_id: string
          created_at: string
          duration_seconds: number | null
          file_size_bytes: number | null
          id: string
          recorded_by: string
          storage_path: string
        }
        Insert: {
          consultation_id: string
          created_at?: string
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          recorded_by: string
          storage_path: string
        }
        Update: {
          consultation_id?: string
          created_at?: string
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          recorded_by?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_recordings_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      call_signals: {
        Row: {
          consultation_id: string
          created_at: string
          data: Json
          id: string
          sender_id: string
          type: string
        }
        Insert: {
          consultation_id: string
          created_at?: string
          data: Json
          id?: string
          sender_id: string
          type: string
        }
        Update: {
          consultation_id?: string
          created_at?: string
          data?: Json
          id?: string
          sender_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_signals_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          client_id: string
          commission_amount: number | null
          created_at: string | null
          duration_minutes: number | null
          ended_at: string | null
          id: string
          lawyer_amount: number | null
          lawyer_id: string
          notes: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["consultation_status"] | null
          total_amount: number | null
          type: Database["public"]["Enums"]["consultation_type"]
        }
        Insert: {
          client_id: string
          commission_amount?: number | null
          created_at?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          lawyer_amount?: number | null
          lawyer_id: string
          notes?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["consultation_status"] | null
          total_amount?: number | null
          type: Database["public"]["Enums"]["consultation_type"]
        }
        Update: {
          client_id?: string
          commission_amount?: number | null
          created_at?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          lawyer_amount?: number | null
          lawyer_id?: string
          notes?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["consultation_status"] | null
          total_amount?: number | null
          type?: Database["public"]["Enums"]["consultation_type"]
        }
        Relationships: []
      }
      lawyer_categories: {
        Row: {
          category_id: string | null
          id: string
          lawyer_id: string | null
        }
        Insert: {
          category_id?: string | null
          id?: string
          lawyer_id?: string | null
        }
        Update: {
          category_id?: string | null
          id?: string
          lawyer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lawyer_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "legal_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawyer_categories_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lawyer_profiles: {
        Row: {
          bar_council_number: string | null
          bio: string | null
          created_at: string | null
          education: string | null
          experience_years: number | null
          id: string
          is_available: boolean | null
          languages: string[] | null
          price_per_minute: number | null
          rating: number | null
          session_price: number | null
          specializations: string[] | null
          status: Database["public"]["Enums"]["lawyer_status"] | null
          total_consultations: number | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bar_council_number?: string | null
          bio?: string | null
          created_at?: string | null
          education?: string | null
          experience_years?: number | null
          id?: string
          is_available?: boolean | null
          languages?: string[] | null
          price_per_minute?: number | null
          rating?: number | null
          session_price?: number | null
          specializations?: string[] | null
          status?: Database["public"]["Enums"]["lawyer_status"] | null
          total_consultations?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bar_council_number?: string | null
          bio?: string | null
          created_at?: string | null
          education?: string | null
          experience_years?: number | null
          id?: string
          is_available?: boolean | null
          languages?: string[] | null
          price_per_minute?: number | null
          rating?: number | null
          session_price?: number | null
          specializations?: string[] | null
          status?: Database["public"]["Enums"]["lawyer_status"] | null
          total_consultations?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      legal_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          consultation_id: string
          content: string
          created_at: string | null
          id: string
          sender_id: string
        }
        Insert: {
          consultation_id: string
          content: string
          created_at?: string | null
          id?: string
          sender_id: string
        }
        Update: {
          consultation_id?: string
          content?: string
          created_at?: string | null
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          commission_rate: number | null
          created_at: string | null
          id: string
          min_withdrawal: number | null
          updated_at: string | null
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          min_withdrawal?: number | null
          updated_at?: string | null
        }
        Update: {
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          min_withdrawal?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          client_id: string
          comment: string | null
          consultation_id: string
          created_at: string | null
          id: string
          lawyer_id: string
          rating: number | null
        }
        Insert: {
          client_id: string
          comment?: string | null
          consultation_id: string
          created_at?: string | null
          id?: string
          lawyer_id: string
          rating?: number | null
        }
        Update: {
          client_id?: string
          comment?: string | null
          consultation_id?: string
          created_at?: string | null
          id?: string
          lawyer_id?: string
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          amount: number
          bank_details: Json | null
          created_at: string | null
          id: string
          processed_at: string | null
          status: Database["public"]["Enums"]["withdrawal_status"] | null
          user_id: string
        }
        Insert: {
          amount: number
          bank_details?: Json | null
          created_at?: string | null
          id?: string
          processed_at?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"] | null
          user_id: string
        }
        Update: {
          amount?: number
          bank_details?: Json | null
          created_at?: string | null
          id?: string
          processed_at?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"] | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      consultation_status: "pending" | "active" | "completed" | "cancelled"
      consultation_type: "chat" | "audio" | "video"
      lawyer_status: "pending" | "approved" | "rejected" | "suspended"
      transaction_type:
        | "deposit"
        | "withdrawal"
        | "consultation_fee"
        | "commission"
        | "refund"
      user_role: "client" | "lawyer" | "admin"
      withdrawal_status: "pending" | "approved" | "rejected"
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
      consultation_status: ["pending", "active", "completed", "cancelled"],
      consultation_type: ["chat", "audio", "video"],
      lawyer_status: ["pending", "approved", "rejected", "suspended"],
      transaction_type: [
        "deposit",
        "withdrawal",
        "consultation_fee",
        "commission",
        "refund",
      ],
      user_role: ["client", "lawyer", "admin"],
      withdrawal_status: ["pending", "approved", "rejected"],
    },
  },
} as const
