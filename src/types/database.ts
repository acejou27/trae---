/**
 * Supabase 資料庫類型定義
 * Created: 2024-12-28
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'user';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: 'admin' | 'user';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'admin' | 'user';
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          company_name: string;
          contact_person: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          tax_id: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_name: string;
          contact_person: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          tax_id?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_name?: string;
          contact_person?: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          tax_id?: string | null;
          notes?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description?: string;
          category?: string;
          unit: string;
          default_price: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          category?: string;
          unit: string;
          default_price: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          category?: string;
          unit?: string;
          default_price?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      staff: {
        Row: {
          id: string;
          name: string;
          email?: string;
          phone?: string;
          position: string;
          department?: string;
          notes?: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string;
          phone?: string;
          position: string;
          department?: string;
          notes?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          position?: string;
          department?: string;
          notes?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      banks: {
        Row: {
          id: string;
          bank_name: string;
          account_name: string;
          account_number: string;
          branch_name?: string;
          swift_code?: string;
          notes?: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bank_name: string;
          account_name: string;
          account_number: string;
          branch_name?: string;
          swift_code?: string;
          notes?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bank_name?: string;
          account_name?: string;
          account_number?: string;
          branch_name?: string;
          swift_code?: string;
          notes?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      quotes: {
        Row: {
          id: string;
          customer_id: string;
          staff_id: string;
          bank_id: string;
          quote_number: string;
          contact_person: string;
          quote_date: string;
          valid_until: string;
          subtotal: number;
          tax_rate: number;
          tax_amount: number;
          total: number;
          status: 'draft' | 'sent' | 'accepted' | 'rejected';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          staff_id: string;
          bank_id: string;
          quote_number: string;
          contact_person: string;
          quote_date: string;
          valid_until: string;
          subtotal: number;
          tax_rate: number;
          tax_amount: number;
          total: number;
          status?: 'draft' | 'sent' | 'accepted' | 'rejected';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          staff_id?: string;
          bank_id?: string;
          quote_number?: string;
          contact_person?: string;
          quote_date?: string;
          valid_until?: string;
          subtotal?: number;
          tax_rate?: number;
          tax_amount?: number;
          total?: number;
          status?: 'draft' | 'sent' | 'accepted' | 'rejected';
          notes?: string | null;
          updated_at?: string;
        };
      };
      quote_items: {
        Row: {
          id: string;
          quote_id: string;
          product_id: string | null;
          product_name: string;
          description: string | null;
          quantity: number;
          unit: string;
          unit_price: number;
          amount: number;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          quote_id: string;
          product_id?: string | null;
          product_name: string;
          description?: string | null;
          quantity: number;
          unit: string;
          unit_price: number;
          amount: number;
          sort_order: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          quote_id?: string;
          product_id?: string | null;
          product_name?: string;
          description?: string | null;
          quantity?: number;
          unit?: string;
          unit_price?: number;
          amount?: number;
          sort_order?: number;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'admin' | 'user';
      quote_status: 'draft' | 'sent' | 'accepted' | 'rejected';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// 匯出常用類型別名
export type Quote = Database['public']['Tables']['quotes']['Row'] & {
  customer?: Customer;
  staff?: Staff;
  bank?: Bank;
  items?: QuoteItem[];
};
export type QuoteInsert = Database['public']['Tables']['quotes']['Insert'];
export type QuoteUpdate = Database['public']['Tables']['quotes']['Update'];

export type QuoteItem = Database['public']['Tables']['quote_items']['Row'];
export type QuoteItemInsert = Database['public']['Tables']['quote_items']['Insert'];
export type QuoteItemUpdate = Database['public']['Tables']['quote_items']['Update'];

export type Customer = Database['public']['Tables']['customers']['Row'];
export type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
export type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

export type Product = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];

export type Staff = Database['public']['Tables']['staff']['Row'];
export type StaffInsert = Database['public']['Tables']['staff']['Insert'];
export type StaffUpdate = Database['public']['Tables']['staff']['Update'];

export type Bank = Database['public']['Tables']['banks']['Row'];
export type BankInsert = Database['public']['Tables']['banks']['Insert'];
export type BankUpdate = Database['public']['Tables']['banks']['Update'];

export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

// 匯出枚舉類型
export type QuoteStatus = Database['public']['Enums']['quote_status'];
export type UserRole = Database['public']['Enums']['user_role'];