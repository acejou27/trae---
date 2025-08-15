/**
 * API 服務層
 * Created: 2024-12-28
 */

import { createClient } from '@supabase/supabase-js';
import type { PostgrestError, Session } from '@supabase/supabase-js';
import type {
  Quote,
  QuoteItem,
  Customer,
  Product,
  Staff,
  Bank,
  Database
} from '../types/database';

// Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Supabase 客戶端實例
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * API 錯誤處理
 */
class ApiError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 處理 Supabase 回應
 */
function handleSupabaseResponse<T>(response: { data: T | null; error: PostgrestError | null }) {
  if (response.error) {
    throw new ApiError(response.error.message, response.error.code);
  }
  return response.data;
}

/**
 * 報價單 API 服務
 */
export const quoteApi = {
  /**
   * 獲取所有報價單
   */
  async getAll(): Promise<Quote[]> {
    const response = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });
    
    return handleSupabaseResponse(response) || [];
  },
  
  /**
   * 根據 ID 獲取報價單
   */
  async getById(id: string): Promise<Quote | null> {
    const response = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .single();
    
    return handleSupabaseResponse(response);
  },
  
  /**
   * 建立新報價單
   */
  async create(quote: Omit<Quote, 'id' | 'created_at' | 'updated_at'>): Promise<Quote> {
    const response = await supabase
      .from('quotes')
      .insert(quote)
      .select()
      .single();
    
    return handleSupabaseResponse(response)!;
  },
  
  /**
   * 更新報價單
   */
  async update(id: string, quote: Partial<Quote>): Promise<Quote> {
    const response = await supabase
      .from('quotes')
      .update({ ...quote, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    return handleSupabaseResponse(response)!;
  },
  
  /**
   * 刪除報價單
   */
  async delete(id: string): Promise<void> {
    const response = await supabase
      .from('quotes')
      .delete()
      .eq('id', id);
    
    handleSupabaseResponse(response);
  },
  
  /**
   * 根據狀態篩選報價單
   */
  async getByStatus(status: Quote['status']): Promise<Quote[]> {
    const response = await supabase
      .from('quotes')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    return handleSupabaseResponse(response) || [];
  }
};

/**
 * 報價單項目 API 服務
 */
export const quoteItemApi = {
  /**
   * 根據報價單 ID 獲取項目
   */
  async getByQuoteId(quoteId: string): Promise<QuoteItem[]> {
    const response = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', quoteId)
      .order('id');
    
    return handleSupabaseResponse(response) || [];
  },
  
  /**
   * 批量建立報價單項目
   */
  async createBatch(items: Omit<QuoteItem, 'id'>[]): Promise<QuoteItem[]> {
    const response = await supabase
      .from('quote_items')
      .insert(items)
      .select();
    
    return handleSupabaseResponse(response) || [];
  },
  
  /**
   * 刪除報價單的所有項目
   */
  async deleteByQuoteId(quoteId: string): Promise<void> {
    const response = await supabase
      .from('quote_items')
      .delete()
      .eq('quote_id', quoteId);
    
    handleSupabaseResponse(response);
  }
};

/**
 * 客戶 API 服務
 */
export const customerApi = {
  /**
   * 獲取所有客戶
   */
  async getAll(): Promise<Customer[]> {
    const response = await supabase
      .from('customers')
      .select('*')
      .order('company_name');
    
    return handleSupabaseResponse(response) || [];
  },
  
  /**
   * 根據 ID 獲取客戶
   */
  async getById(id: string): Promise<Customer | null> {
    const response = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    
    return handleSupabaseResponse(response);
  },
  
  /**
   * 建立新客戶
   */
  async create(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    const response = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();
    
    return handleSupabaseResponse(response)!;
  },
  
  /**
   * 更新客戶
   */
  async update(id: string, customer: Partial<Customer>): Promise<Customer> {
    const response = await supabase
      .from('customers')
      .update({ ...customer, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    return handleSupabaseResponse(response)!;
  },
  
  /**
   * 刪除客戶
   */
  async delete(id: string): Promise<void> {
    const response = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    handleSupabaseResponse(response);
  },
  
  /**
   * 搜尋客戶
   */
  async search(query: string): Promise<Customer[]> {
    const response = await supabase
      .from('customers')
      .select('*')
      .or(`company_name.ilike.%${query}%,contact_person.ilike.%${query}%,email.ilike.%${query}%`)
      .order('company_name');
    
    return handleSupabaseResponse(response) || [];
  }
};

/**
 * 產品 API 服務
 */
export const productApi = {
  /**
   * 獲取所有產品
   */
  async getAll(): Promise<Product[]> {
    const response = await supabase
      .from('products')
      .select('*')
      .order('name');
    
    return handleSupabaseResponse(response) || [];
  },
  
  /**
   * 根據 ID 獲取產品
   */
  async getById(id: string): Promise<Product | null> {
    const response = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    return handleSupabaseResponse(response);
  },
  
  /**
   * 建立新產品
   */
  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const response = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    
    return handleSupabaseResponse(response)!;
  },
  
  /**
   * 更新產品
   */
  async update(id: string, product: Partial<Product>): Promise<Product> {
    const response = await supabase
      .from('products')
      .update({ ...product, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    return handleSupabaseResponse(response)!;
  },
  
  /**
   * 刪除產品
   */
  async delete(id: string): Promise<void> {
    const response = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    handleSupabaseResponse(response);
  },
  
  /**
   * 搜尋產品
   */
  async search(query: string): Promise<Product[]> {
    const response = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('name');
    
    return handleSupabaseResponse(response) || [];
  }
};

/**
 * 負責人 API 服務
 */
export const staffApi = {
  /**
   * 獲取所有負責人
   */
  async getAll(): Promise<Staff[]> {
    const response = await supabase
      .from('staff')
      .select('*')
      .order('name');
    
    return handleSupabaseResponse(response) || [];
  },
  
  /**
   * 根據 ID 獲取負責人
   */
  async getById(id: string): Promise<Staff | null> {
    const response = await supabase
      .from('staff')
      .select('*')
      .eq('id', id)
      .single();
    
    return handleSupabaseResponse(response);
  },
  
  /**
   * 建立新負責人
   */
  async create(staff: Omit<Staff, 'id' | 'created_at' | 'updated_at'>): Promise<Staff> {
    const response = await supabase
      .from('staff')
      .insert(staff)
      .select()
      .single();
    
    return handleSupabaseResponse(response)!;
  },
  
  /**
   * 更新負責人
   */
  async update(id: string, staff: Partial<Staff>): Promise<Staff> {
    const response = await supabase
      .from('staff')
      .update({ ...staff, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    return handleSupabaseResponse(response)!;
  },
  
  /**
   * 刪除負責人
   */
  async delete(id: string): Promise<void> {
    const response = await supabase
      .from('staff')
      .delete()
      .eq('id', id);
    
    handleSupabaseResponse(response);
  }
};

/**
 * 銀行 API 服務
 */
export const bankApi = {
  /**
   * 獲取所有銀行帳戶
   */
  async getAll(): Promise<Bank[]> {
    const response = await supabase
      .from('banks')
      .select('*')
      .order('bank_name');
    
    return handleSupabaseResponse(response) || [];
  },
  
  /**
   * 根據 ID 獲取銀行帳戶
   */
  async getById(id: string): Promise<Bank | null> {
    const response = await supabase
      .from('banks')
      .select('*')
      .eq('id', id)
      .single();
    
    return handleSupabaseResponse(response);
  },
  
  /**
   * 建立新銀行帳戶
   */
  async create(bank: Omit<Bank, 'id' | 'created_at' | 'updated_at'>): Promise<Bank> {
    const response = await supabase
      .from('banks')
      .insert(bank)
      .select()
      .single();
    
    return handleSupabaseResponse(response)!;
  },
  
  /**
   * 更新銀行帳戶
   */
  async update(id: string, bank: Partial<Bank>): Promise<Bank> {
    const response = await supabase
      .from('banks')
      .update({ ...bank, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    return handleSupabaseResponse(response)!;
  },
  
  /**
   * 刪除銀行帳戶
   */
  async delete(id: string): Promise<void> {
    const response = await supabase
      .from('banks')
      .delete()
      .eq('id', id);
    
    handleSupabaseResponse(response);
  }
};

/**
 * 身份驗證 API 服務
 */
export const authApi = {
  /**
   * 登入
   */
  async signIn(email: string, password: string) {
    const response = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (response.error) {
      throw new ApiError(response.error.message);
    }
    
    return response.data;
  },
  
  /**
   * 登出
   */
  async signOut() {
    const response = await supabase.auth.signOut();
    
    if (response.error) {
      throw new ApiError(response.error.message);
    }
  },
  
  /**
   * 獲取當前使用者
   */
  async getCurrentUser() {
    const response = await supabase.auth.getUser();
    
    if (response.error) {
      throw new ApiError(response.error.message);
    }
    
    return response.data.user;
  },
  
  /**
   * 監聽身份驗證狀態變化
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};