/**
 * 匯款資料狀態管理 Store
 * Created: 2024-12-28
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Bank } from '../types';
import { bankApi } from '../services/api';

interface BankState {
  banks: Bank[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchBanks: () => Promise<void>;
  createBank: (bankData: Omit<Bank, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateBank: (id: string, bankData: Partial<Bank>) => Promise<void>;
  deleteBank: (id: string) => Promise<void>;
  clearError: () => void;
}

/**
 * 匯款資料狀態管理 Store
 * 使用 Zustand 進行狀態管理
 */
export const useBankStore = create<BankState>()(devtools(
  (set, get) => ({
    banks: [],
    loading: false,
    error: null,

    /**
     * 獲取所有匯款資料
     */
    fetchBanks: async () => {
      set({ loading: true, error: null });
      try {
        const banks = await bankApi.getAll();
        set({ banks, loading: false });
      } catch (error) {
        console.error('獲取匯款資料失敗:', error);
        set({ 
          error: error instanceof Error ? error.message : '獲取匯款資料失敗',
          loading: false 
        });
      }
    },

    /**
     * 創建新匯款資料
     */
    createBank: async (bankData) => {
      set({ loading: true, error: null });
      try {
        const newBank = await bankApi.create(bankData);
        set(state => ({ 
          banks: [...state.banks, newBank],
          loading: false 
        }));
      } catch (error) {
        console.error('創建匯款資料失敗:', error);
        set({ 
          error: error instanceof Error ? error.message : '創建匯款資料失敗',
          loading: false 
        });
        throw error;
      }
    },

    /**
     * 更新匯款資料
     */
    updateBank: async (id, bankData) => {
      set({ loading: true, error: null });
      try {
        const updatedBank = await bankApi.update(id, bankData);
        set(state => ({
          banks: state.banks.map(bank => 
            bank.id === id ? updatedBank : bank
          ),
          loading: false
        }));
      } catch (error) {
        console.error('更新匯款資料失敗:', error);
        set({ 
          error: error instanceof Error ? error.message : '更新匯款資料失敗',
          loading: false 
        });
        throw error;
      }
    },

    /**
     * 刪除匯款資料
     */
    deleteBank: async (id) => {
      set({ loading: true, error: null });
      try {
        await bankApi.delete(id);
        set(state => ({
          banks: state.banks.filter(bank => bank.id !== id),
          loading: false
        }));
      } catch (error) {
        console.error('刪除匯款資料失敗:', error);
        set({ 
          error: error instanceof Error ? error.message : '刪除匯款資料失敗',
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
    name: 'bank-store'
  }
));