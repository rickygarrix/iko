export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      action_logs: {
        Row: {
          action: string
          created_at: string | null
          device: string | null
          id: string
          locale: string | null
          query_params: string | null
          search_conditions: Json | null
          store_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          device?: string | null
          id?: string
          locale?: string | null
          query_params?: string | null
          search_conditions?: Json | null
          store_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          device?: string | null
          id?: string
          locale?: string | null
          query_params?: string | null
          search_conditions?: Json | null
          store_id?: string | null
        }
        Relationships: []
      },
      comments: {
        Row: {
          id: string
          post_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          content?: string
          created_at?: string
        }
        Relationships: []
      },
      likes: {
        Row: {
          id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          created_at?: string
        }
        Relationships: []
      },
      area_translations: {
        Row: {
          area_id: string
          locale: string
          name: string
        }
        Insert: {
          area_id: string
          locale: string
          name: string
        }
        Update: {
          area_id?: string
          locale?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "area_translations_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      },
      areas: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      },
      contacts: {
        Row: {
          created_at: string | null
          email: string | null
          id: number
          message: string | null
          name: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: number
          message?: string | null
          name?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: number
          message?: string | null
          name?: string | null
          subject?: string | null
        }
        Relationships: []
      },
      genre_translations: {
        Row: {
          genre_id: string
          locale: string
          name: string
        }
        Insert: {
          genre_id: string
          locale: string
          name: string
        }
        Update: {
          genre_id?: string
          locale?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "genre_translations_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
        ]
      },
      genres: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      },
      payment_method_translations: {
        Row: {
          locale: string
          name: string
          payment_method_id: string
        }
        Insert: {
          locale: string
          name: string
          payment_method_id: string
        }
        Update: {
          locale?: string
          name?: string
          payment_method_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_method_translations_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      },
      payment_methods: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      },
      posts: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          image_urls: string[] | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_urls?: string[] | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_urls?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      },
      stores: {
        Row: {
          access: string | null
          address: string
          area_id: string | null
          description: string | null
          genre_ids: Json | null
          id: string
          instagram: string | null
          is_deleted: boolean | null
          is_pending: boolean | null
          is_published: boolean | null
          is_recommended: boolean | null
          latitude: number | null
          longitude: number | null
          map_embed: string | null
          name: string
          opening_hours: string | null
          store_instagrams: string | null
          store_instagrams2: string | null
          store_instagrams3: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          access?: string | null
          address: string
          area_id?: string | null
          description?: string | null
          genre_ids?: Json | null
          id?: string
          instagram?: string | null
          is_deleted?: boolean | null
          is_pending?: boolean | null
          is_published?: boolean | null
          is_recommended?: boolean | null
          latitude?: number | null
          longitude?: number | null
          map_embed?: string | null
          name: string
          opening_hours?: string | null
          store_instagrams?: string | null
          store_instagrams2?: string | null
          store_instagrams3?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          access?: string | null
          address?: string
          area_id?: string | null
          description?: string | null
          genre_ids?: Json | null
          id?: string
          instagram?: string | null
          is_deleted?: boolean | null
          is_pending?: boolean | null
          is_published?: boolean | null
          is_recommended?: boolean | null
          latitude?: number | null
          longitude?: number | null
          map_embed?: string | null
          name?: string
          opening_hours?: string | null
          store_instagrams?: string | null
          store_instagrams2?: string | null
          store_instagrams3?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
    },
    Views: {
      [_ in never]: never
    },
    Functions: {
      [_ in never]: never
    },
    Enums: {
      [_ in never]: never
    },
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// 以下の型ユーティリティは変更不要

// ... 以下省略（元の内容そのまま）


type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
  | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
