/**
 * 報價單狀態管理 Store
 * Created: 2024-12-28
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase, handleSupabaseError } from '../services/supabase';
import type {
  Quote,
  QuoteItem,
  Customer,
  Product,
  Staff,
  Bank,
  QuoteStatus
} from '../types/database';

/**
 * 報價單狀態介面
 */
interface QuoteState {
  // 報價單相關狀態
  quotes: Quote[];
  currentQuote: Quote | null;
  loading: boolean;
  error: string | null;
  
  // 基礎資料狀態
  customers: Customer[];
  products: Product[];
  staff: Staff[];
  banks: Bank[];
  
  // 報價單操作方法
  fetchQuotes: () => Promise<void>;
  fetchQuoteById: (id: string) => Promise<void>;
  fetchQuoteItems: (quoteId: string) => Promise<QuoteItem[]>;
  createQuote: (quote: Omit<Quote, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateQuote: (id: string, quote: Partial<Quote>) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  updateQuoteStatus: (id: string, status: QuoteStatus) => Promise<void>;
  setCurrentQuote: (quote: Quote | null) => void;
  
  // 基礎資料操作方法
  fetchCustomers: () => Promise<void>;
  createCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  
  fetchProducts: () => Promise<void>;
  createProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  fetchStaff: () => Promise<void>;
  createStaff: (staff: Omit<Staff, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateStaff: (id: string, staff: Partial<Staff>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  
  fetchBanks: () => Promise<void>;
  createBank: (bank: Omit<Bank, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateBank: (id: string, bank: Partial<Bank>) => Promise<void>;
  deleteBank: (id: string) => Promise<void>;
  
  // 工具方法
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearCurrentQuote: () => void;
  
  // 計算方法
  calculateQuoteTotal: (items: QuoteItem[]) => number;
  calculateQuoteSubtotal: (items: QuoteItem[]) => number;
  calculateQuoteTax: (subtotal: number, taxRate: number) => number;
}

/**
 * 報價單狀態管理 Store
 * 使用 Zustand 管理報價單系統的全域狀態
 */
export const useQuoteStore = create<QuoteState>()(devtools(
  (set, get) => ({
    // 初始狀態
    quotes: [],
    currentQuote: null,
    loading: false,
    error: null,
    customers: [],
    products: [],
    staff: [],
    banks: [],
    
    // 報價單操作方法
    fetchQuotes: async () => {
      set({ loading: true, error: null });
      try {
        const { data, error } = await supabase
          .from('quotes')
          .select(`
            *,
            customer:customers(*),
            staff:staff(*),
            bank:banks(*)
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        set({ quotes: data || [] });
      } catch (error) {
        set({ error: handleSupabaseError(error) });
      } finally {
        set({ loading: false });
      }
    },
    
    fetchQuoteById: async (id: string) => {
      set({ loading: true, error: null });
      try {
        const { data, error } = await supabase
          .from('quotes')
          .select(`
            *,
            customer:customers(*),
            staff:staff(*),
            bank:banks(*)
          `)
          .eq('id', id)
          .single();
        
        if (error) throw error;
        set({ currentQuote: data });
      } catch (error) {
        set({ error: handleSupabaseError(error) });
      } finally {
        set({ loading: false });
      }
    },
    
    createQuote: async (quoteData) => {
      set({ loading: true, error: null });
      try {
        const { data, error } = await supabase
          .from('quotes')
          .insert([quoteData])
          .select(`
            *,
            customer:customers(*),
            staff:staff(*),
            bank:banks(*)
          `)
          .single();
        
        if (error) throw error;
        
        set(state => ({
          quotes: [...state.quotes, data]
        }));
        
        return data;
      } catch (error) {
        set({ error: handleSupabaseError(error) });
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    
    updateQuote: async (id: string, quoteData) => {
      set({ loading: true, error: null });
      try {
        const { data, error } = await supabase
          .from('quotes')
          .update(quoteData)
          .eq('id', id)
          .select(`
            *,
            customer:customers(*),
            staff:staff(*),
            bank:banks(*)
          `)
          .single();
        
        if (error) throw error;
        
        set(state => ({
          quotes: state.quotes.map(quote =>
            quote.id === id ? data : quote
          ),
          currentQuote: state.currentQuote?.id === id ? data : state.currentQuote
        }));
        
        return data;
      } catch (error) {
        set({ error: handleSupabaseError(error) });
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    
    deleteQuote: async (id: string) => {
      set({ loading: true, error: null });
      try {
        // 先刪除相關的報價單項目
        const { error: itemsError } = await supabase
          .from('quote_items')
          .delete()
          .eq('quote_id', id);
        
        if (itemsError) throw itemsError;
        
        // 再刪除報價單
        const { error } = await supabase
          .from('quotes')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        set(state => ({
          quotes: state.quotes.filter(quote => quote.id !== id),
          currentQuote: state.currentQuote?.id === id ? null : state.currentQuote
        }));
      } catch (error) {
        set({ error: handleSupabaseError(error) });
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    
    updateQuoteStatus: async (id: string, status: QuoteStatus) => {
      await get().updateQuote(id, { status });
    },
    
    // 客戶操作方法
    fetchCustomers: async () => {
      set({ loading: true, error: null });
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        set({ customers: data || [] });
      } catch (error) {
        set({ error: handleSupabaseError(error) });
      } finally {
        set({ loading: false });
      }
    },
    
    createCustomer: async (customerData) => {
      set({ loading: true, error: null });
      try {
        const { data, error } = await supabase
          .from('customers')
          .insert([customerData])
          .select()
          .single();
        
        if (error) throw error;
        
        set(state => ({
          customers: [...state.customers, data]
        }));
      } catch (error) {
        set({ error: handleSupabaseError(error) });
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    
    updateCustomer: async (id: string, customerData) => {
      set({ loading: true, error: null });
      try {
        const { data, error } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        
        set(state => ({
          customers: state.customers.map(customer =>
            customer.id === id ? data : customer
          )
        }));
      } catch (error) {
        set({ error: handleSupabaseError(error) });
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    
    deleteCustomer: async (id: string) => {
      set({ loading: true, error: null });
      try {
        const { error } = await supabase
          .from('customers')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        set(state => ({
          customers: state.customers.filter(customer => customer.id !== id)
        }));
      } catch (error) {
        set({ error: handleSupabaseError(error) });
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    
    // 產品操作方法
    fetchProducts: async () => {
      set({ loading: true, error: null });
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        set({ products: data || [] });
      } catch (error) {
        set({ error: handleSupabaseError(error) });
      } finally {
        set({ loading: false });
      }
    },
    
    createProduct: async (productData) => {
      set({ loading: true, error: null });
      try {
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();
        
        if (error) throw error;
        
        set(state => ({
          products: [...state.products, data]
        }));
      } catch (error) {
        set({ error: handleSupabaseError(error) });
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    
    updateProduct: async (id: string, productData) => {
      set({ loading: true, error: null });
      try {
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        
        set(state => ({
          products: state.products.map(product =>
            product.id === id ? data : product
          )
        }));
      } catch (error) {
        set({ error: handleSupabaseError(error) });
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    
    deleteProduct: async (id: string) => {
      set({ loading: true, error: null });
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        set(state => ({
          products: state.products.filter(product => product.id !== id)
        }));
      } catch (error) {
        set({ error: handleSupabaseError(error) });
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    
    // 負責人操作方法
    fetchStaff: async () => {
      set({ loading: true, error: null });
      try {
        const { data, error } = await supabase
          .from('staff')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        set({ staff: data || [] });
      } catch (error) {
        set({ error: handleSupabaseError(error) });
      } finally {
        set({ loading: false });
      }
    },
    
    createStaff: async (staffData) => {
      set({ loading: true, error: null });
      try {
        const { data, error } = await supabase
          .from('staff')
          .insert([staffData])
          .select()
          .single();
        
        if (error) throw error;
        
        set(state => ({
          staff: [...state.staff, data]
        }));
      } catch (error) {
        set({ error: handleSupabaseError(error) });
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    
    updateStaff: async (id: string, staffData) => {
      set({ loading: true, error: null });
      try {
        const { data, error } = await supabase
          .from('staff')
          .update(staffData)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        
        set(state => ({
          staff: state.staff.map(staff =>
            staff.id === id ? data : staff
          )
        }));
      } catch (error) {
        set({ error: handleSupabaseError(error) });
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    
    deleteStaff: async (id: string) => {
      set({ loading: true, error: null });
      try {
        const { error } = await supabase
          .from('staff')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        set(state => ({
          staff: state.staff.filter(staff => staff.id !== id)
        }));
      } catch (error) {
        set({ error: handleSupabaseError(error) });
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    
    // 銀行操作方法
    fetchBanks: async () => {
      set({ loading: true, error: null });
      try {
        const { data, error } = await supabase
          .from('banks')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        set({ banks: data || [] });
      } catch (error) {
        set({ error: handleSupabaseError(error) });
      } finally {
        set({ loading: false });
      }
    },
    
    createBank: async (bankData) => {
      set({ loading: true, error: null });
      try {
        const { data, error } = await supabase
          .from('banks')
          .insert([bankData])
          .select()
          .single();
        
        if (error) throw error;
        
        set(state => ({
          banks: [...state.banks, data]
        }));
      } catch (error) {
        set({ error: handleSupabaseError(error) });
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    
    updateBank: async (id: string, bankData) => {
      set({ loading: true, error: null });
      try {
        const { data, error } = await supabase
          .from('banks')
          .update(bankData)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        
        set(state => ({
          banks: state.banks.map(bank =>
            bank.id === id ? data : bank
          )
        }));
      } catch (error) {
        set({ error: handleSupabaseError(error) });
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    
    deleteBank: async (id: string) => {
      set({ loading: true, error: null });
      try {
        const { error } = await supabase
          .from('banks')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        set(state => ({
          banks: state.banks.filter(bank => bank.id !== id)
        }));
      } catch (error) {
        set({ error: handleSupabaseError(error) });
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    
    // 報價單項目操作方法
    fetchQuoteItems: async (quoteId: string) => {
      set({ loading: true, error: null });
      try {
        const { data, error } = await supabase
          .from('quote_items')
          .select(`
            *,
            product:products(*)
          `)
          .eq('quote_id', quoteId)
          .order('sort_order', { ascending: true });
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        set({ error: handleSupabaseError(error) });
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    
    createQuoteItem: async (quoteItemData) => {
      set({ loading: true, error: null });
      try {
        const { data, error } = await supabase
          .from('quote_items')
          .insert([quoteItemData])
          .select(`
            *,
            product:products(*)
          `)
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        set({ error: handleSupabaseError(error) });
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    
    updateQuoteItem: async (id: string, quoteItemData) => {
      set({ loading: true, error: null });
      try {
        const { data, error } = await supabase
          .from('quote_items')
          .update(quoteItemData)
          .eq('id', id)
          .select(`
            *,
            product:products(*)
          `)
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        set({ error: handleSupabaseError(error) });
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    
    deleteQuoteItem: async (id: string) => {
      set({ loading: true, error: null });
      try {
        const { error } = await supabase
          .from('quote_items')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      } catch (error) {
        set({ error: handleSupabaseError(error) });
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    
    // 批量操作報價單項目
    saveQuoteItems: async (quoteId: string, items: Omit<QuoteItem, 'id' | 'created_at' | 'updated_at'>[]) => {
      set({ loading: true, error: null });
      try {
        // 先刪除現有項目
        const { error: deleteError } = await supabase
          .from('quote_items')
          .delete()
          .eq('quote_id', quoteId);
        
        if (deleteError) throw deleteError;
        
        // 新增新項目
        if (items.length > 0) {
          const { data, error } = await supabase
            .from('quote_items')
            .insert(items.map(item => ({ ...item, quote_id: quoteId })))
            .select(`
              *,
              product:products(*)
            `);
          
          if (error) throw error;
          return data || [];
        }
        
        return [];
      } catch (error) {
        set({ error: handleSupabaseError(error) });
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    // 工具方法
    setLoading: (loading: boolean) => set({ loading }),
    setError: (error: string | null) => set({ error }),
    clearCurrentQuote: () => set({ currentQuote: null }),
    setCurrentQuote: (quote: Quote | null) => set({ currentQuote: quote }),
    
    // 計算方法
    calculateQuoteSubtotal: (items: QuoteItem[]) => {
      return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    },
    
    calculateQuoteTax: (subtotal: number, taxRate: number) => {
      return subtotal * taxRate;
    },
    
    calculateQuoteTotal: (items: QuoteItem[]) => {
      const { calculateQuoteSubtotal, calculateQuoteTax } = get();
      const subtotal = calculateQuoteSubtotal(items);
      const tax = calculateQuoteTax(subtotal, 0.05); // 預設稅率 5%
      return subtotal + tax;
    }
  }),
  {
    name: 'quote-store'
  }
));