/**
 * 客戶資料狀態管理 Store
 * Created: 2024-12-28
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Customer } from '../types';
import { customerApi } from '../services/api';

interface CustomerState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchCustomers: () => Promise<void>;
  createCustomer: (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateCustomer: (id: string, customerData: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  clearError: () => void;
}

/**
 * 客戶資料狀態管理 Store
 * 使用 Zustand 進行狀態管理
 */
export const useCustomerStore = create<CustomerState>()(devtools(
  (set, get) => ({
    customers: [],
    loading: false,
    error: null,

    /**
     * 獲取所有客戶資料
     */
    fetchCustomers: async () => {
      set({ loading: true, error: null });
      try {
        const customers = await customerApi.getAll();
        set({ customers, loading: false });
      } catch (error) {
        console.error('獲取客戶資料失敗:', error);
        set({ 
          error: error instanceof Error ? error.message : '獲取客戶資料失敗',
          loading: false 
        });
      }
    },

    /**
     * 創建新客戶資料
     */
    createCustomer: async (customerData) => {
      set({ loading: true, error: null });
      try {
        const newCustomer = await customerApi.create(customerData);
        set(state => ({ 
          customers: [...state.customers, newCustomer],
          loading: false 
        }));
      } catch (error) {
        console.error('創建客戶資料失敗:', error);
        set({ 
          error: error instanceof Error ? error.message : '創建客戶資料失敗',
          loading: false 
        });
        throw error;
      }
    },

    /**
     * 更新客戶資料
     */
    updateCustomer: async (id, customerData) => {
      set({ loading: true, error: null });
      try {
        const updatedCustomer = await customerApi.update(id, customerData);
        set(state => ({
          customers: state.customers.map(customer => 
            customer.id === id ? updatedCustomer : customer
          ),
          loading: false
        }));
      } catch (error) {
        console.error('更新客戶資料失敗:', error);
        set({ 
          error: error instanceof Error ? error.message : '更新客戶資料失敗',
          loading: false 
        });
        throw error;
      }
    },

    /**
     * 刪除客戶資料
     */
    deleteCustomer: async (id) => {
      set({ loading: true, error: null });
      try {
        await customerApi.delete(id);
        set(state => ({
          customers: state.customers.filter(customer => customer.id !== id),
          loading: false
        }));
      } catch (error) {
        console.error('刪除客戶資料失敗:', error);
        set({ 
          error: error instanceof Error ? error.message : '刪除客戶資料失敗',
          loading: false 
        });
        throw error;
      }
    },

    /**
     * 清除錯誤訊息
     */
    clearError: () => {
      set({ error: null });
    }
  }),
  {
    name: 'customer-store'
  }
));