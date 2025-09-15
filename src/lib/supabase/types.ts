// src/lib/supabase/types.ts

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string;
          external_id: string;
          amount: number;
          status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
          items: Json;
          customer_details: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          external_id: string;
          amount: number;
          status?: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
          items: Json;
          customer_details?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
          updated_at?: string;
        };
      };
      admin: {
        Row: {
          id: string
          username: string
          password: string
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          password: string
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          password?: string
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      articles: {
        Row: { // The data you can fetch from the database
          article_id: string
          title: string
          content: string // Storing BlockNote's JSON as text
          author_id: string | null
          author_name: string | null // NEW: For easier display
          article_type: string | null
          publish_date: string | null // MODIFIED: Can be null now
          created_at: string
          updated_at: string
          thumbnail: string | null
          summary: string | null
          is_published: boolean | null
          slug: string | null // NEW: For user-friendly URLs
          tags: string[] | null // NEW: For keywords/categories
        }
        Insert: { // The data you can insert
          article_id?: string
          title: string
          content: string
          author_id?: string | null
          author_name?: string | null // NEW
          article_type?: string | null
          publish_date?: string | null
          created_at?: string
          updated_at?: string
          thumbnail?: string | null
          summary?: string | null
          is_published?: boolean | null
          slug?: string | null // NEW
          tags?: string[] | null // NEW
        }
        Update: { // The data you can update
          article_id?: string
          title?: string
          content?: string
          author_id?: string | null
          author_name?: string | null // NEW
          article_type?: string | null
          publish_date?: string | null
          created_at?: string
          updated_at?: string
          thumbnail?: string | null
          summary?: string | null
          is_published?: boolean | null
          slug?: string | null // NEW
          tags?: string[] | null // NEW
        }
      }
      pricing_plans: {
        Row: {
          plan_id: string
          name: string
          description: string | null
          price: number
          billing_period: string | null
          features: Record<string, unknown> | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          plan_id?: string
          name: string
          description?: string | null
          price: number
          billing_period?: string | null
          features?: Record<string, unknown> | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          plan_id?: string
          name?: string
          description?: string | null
          price?: number
          billing_period?: string | null
          features?: Record<string, unknown> | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          member_id: string
          name: string
          role: string | null
          bio: string | null
          image_url: string | null
          linkedin_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          member_id?: string
          name: string
          role?: string | null
          bio?: string | null
          image_url?: string | null
          linkedin_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          member_id?: string
          name?: string
          role?: string | null
          bio?: string | null
          image_url?: string | null
          linkedin_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_activity_log: {
        Row: {
          log_id: string
          admin_id: string | null
          action_type: string
          table_name: string | null
          record_id: string | null
          changes: Record<string, unknown> | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          log_id?: string
          admin_id?: string | null
          action_type: string
          table_name?: string | null
          record_id?: string | null
          changes?: Record<string, unknown> | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          log_id?: string
          admin_id?: string | null
          action_type?: string
          table_name?: string | null
          record_id?: string | null
          changes?: Record<string, unknown> | null
          ip_address?: string | null
          created_at?: string
        }
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
  }
}

// Helper type for JSON columns
type Json = string | number | boolean | null | { [key: string]: Json } | Json[];
