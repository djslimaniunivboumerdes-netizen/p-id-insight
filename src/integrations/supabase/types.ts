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
      color_rules: {
        Row: {
          color: string
          created_at: string
          id: string
          label: string
          max: number
          min: number
          sort_order: number
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          label: string
          max?: number
          min?: number
          sort_order?: number
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          label?: string
          max?: number
          min?: number
          sort_order?: number
        }
        Relationships: []
      }
      equipment: {
        Row: {
          confidence: number
          created_at: string
          discharge: string | null
          id: string
          instruments: string[]
          line: string
          page: number
          project_id: string
          size: string
          status: string
          suction: string | null
          tag: string
          type: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          discharge?: string | null
          id?: string
          instruments?: string[]
          line?: string
          page?: number
          project_id: string
          size?: string
          status?: string
          suction?: string | null
          tag: string
          type?: string
        }
        Update: {
          confidence?: number
          created_at?: string
          discharge?: string | null
          id?: string
          instruments?: string[]
          line?: string
          page?: number
          project_id?: string
          size?: string
          status?: string
          suction?: string | null
          tag?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      exports: {
        Row: {
          created_at: string
          id: string
          name: string
          project_id: string | null
          size: string
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          project_id?: string | null
          size?: string
          status?: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          project_id?: string | null
          size?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "exports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      hazop_items: {
        Row: {
          cause: string
          consequence: string
          created_at: string
          deviation: string
          id: string
          project_id: string
          recommendation: string
          safeguard: string
          sort_order: number
        }
        Insert: {
          cause?: string
          consequence?: string
          created_at?: string
          deviation: string
          id?: string
          project_id: string
          recommendation?: string
          safeguard?: string
          sort_order?: number
        }
        Update: {
          cause?: string
          consequence?: string
          created_at?: string
          deviation?: string
          id?: string
          project_id?: string
          recommendation?: string
          safeguard?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "hazop_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      instruments: {
        Row: {
          confidence: number
          created_at: string
          id: string
          line: string
          page: number
          project_id: string
          size: string
          status: string
          tag: string
          type: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          id?: string
          line?: string
          page?: number
          project_id: string
          size?: string
          status?: string
          tag: string
          type?: string
        }
        Update: {
          confidence?: number
          created_at?: string
          id?: string
          line?: string
          page?: number
          project_id?: string
          size?: string
          status?: string
          tag?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "instruments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          action: string
          category: string
          created_at: string
          explanation: string
          id: string
          project_id: string
          severity: string
          tag: string
          title: string
        }
        Insert: {
          action?: string
          category?: string
          created_at?: string
          explanation?: string
          id?: string
          project_id: string
          severity?: string
          tag?: string
          title: string
        }
        Update: {
          action?: string
          category?: string
          created_at?: string
          explanation?: string
          id?: string
          project_id?: string
          severity?: string
          tag?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "issues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ocr_text: {
        Row: {
          content: string
          created_at: string
          id: string
          page: number
          project_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          page: number
          project_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          page?: number
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ocr_text_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          created_at: string
          fluid: string
          from_tag: string | null
          id: string
          page: number
          project_id: string
          size: string
          status: string
          tag: string
          to_tag: string | null
        }
        Insert: {
          created_at?: string
          fluid?: string
          from_tag?: string | null
          id?: string
          page?: number
          project_id: string
          size?: string
          status?: string
          tag: string
          to_tag?: string | null
        }
        Update: {
          created_at?: string
          fluid?: string
          from_tag?: string | null
          id?: string
          page?: number
          project_id?: string
          size?: string
          status?: string
          tag?: string
          to_tag?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pipelines_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          file_path: string | null
          file_size_bytes: number | null
          id: string
          name: string
          page_count: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_path?: string | null
          file_size_bytes?: number | null
          id?: string
          name: string
          page_count?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_path?: string | null
          file_size_bytes?: number | null
          id?: string
          name?: string
          page_count?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      valves: {
        Row: {
          confidence: number
          created_at: string
          id: string
          line: string
          page: number
          project_id: string
          size: string
          status: string
          tag: string
          type: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          id?: string
          line?: string
          page?: number
          project_id: string
          size?: string
          status?: string
          tag: string
          type?: string
        }
        Update: {
          confidence?: number
          created_at?: string
          id?: string
          line?: string
          page?: number
          project_id?: string
          size?: string
          status?: string
          tag?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "valves_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
