export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          balance?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      portfolio: {
        Row: {
          id: string
          user_id: string
          symbol: string
          company_name: string
          exchange: string
          quantity: number
          avg_buy_price: number
          total_investment: number
          current_price: number | null
          current_value: number | null
          unrealized_pnl: number
          unrealized_pnl_percent: number
          last_updated: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          symbol: string
          company_name: string
          exchange: string
          quantity?: number
          avg_buy_price: number
          total_investment: number
          current_price?: number | null
          current_value?: number | null
          unrealized_pnl?: number
          unrealized_pnl_percent?: number
          last_updated?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          symbol?: string
          company_name?: string
          exchange?: string
          quantity?: number
          avg_buy_price?: number
          total_investment?: number
          current_price?: number | null
          current_value?: number | null
          unrealized_pnl?: number
          unrealized_pnl_percent?: number
          last_updated?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          symbol: string
          company_name: string
          exchange: string
          transaction_type: 'BUY' | 'SELL'
          quantity: number
          price: number
          total_amount: number
          realized_pnl: number | null
          currency: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          symbol: string
          company_name: string
          exchange: string
          transaction_type: 'BUY' | 'SELL'
          quantity: number
          price: number
          total_amount: number
          realized_pnl?: number | null
          currency?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          symbol?: string
          company_name?: string
          exchange?: string
          transaction_type?: 'BUY' | 'SELL'
          quantity?: number
          price?: number
          total_amount?: number
          realized_pnl?: number | null
          currency?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      watchlist: {
        Row: {
          id: string
          user_id: string
          symbol: string
          company_name: string
          exchange: string
          added_at: string
        }
        Insert: {
          id?: string
          user_id: string
          symbol: string
          company_name: string
          exchange: string
          added_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          symbol?: string
          company_name?: string
          exchange?: string
          added_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      stocks: {
        Row: {
          symbol: string
          company_name: string
          exchange: string
          sector: string | null
          country: string
          is_active: boolean
        }
        Insert: {
          symbol: string
          company_name: string
          exchange: string
          sector?: string | null
          country?: string
          is_active?: boolean
        }
        Update: {
          symbol?: string
          company_name?: string
          exchange?: string
          sector?: string | null
          country?: string
          is_active?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      handle_transaction: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
