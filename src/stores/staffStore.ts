/**
 * 負責人資料狀態管理 Store
 * Created: 2024-12-28
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Staff } from '../types';
import { staffApi } from '../services/api';

interface StaffState {
  staff: Staff[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchStaff: () => Promise<void>;
  createStaff: (staffData: Omit<Staff, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateStaff: (id: string, staffData: Partial<Staff>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  clearError: () => void;
}

/**
 * 負責人資料狀態管理 Store
 * 使用 Zustand 進行狀態管理
 */
export const useStaffStore = create<StaffState>()(devtools(
  (set, get) => ({
    staff: [],
    loading: false,
    error: null,

    /**
     * 獲取所有負責人資料
     */
    fetchStaff: async () => {
      set({ loading: true, error: null });
      try {
        const staff = await staffApi.getAll();
        set({ staff, loading: false });
      } catch (error) {
        console.error('獲取負責人資料失敗:', error);
        set({ 
          error: error instanceof Error ? error.message : '獲取負責人資料失敗',
          loading: false 
        });
      }
    },

    /**
     * 創建新負責人資料
     */
    createStaff: async (staffData) => {
      set({ loading: true, error: null });
      try {
        const newStaff = await staffApi.create(staffData);
        set(state => ({ 
          staff: [...state.staff, newStaff],
          loading: false 
        }));
      } catch (error) {
        console.error('創建負責人資料失敗:', error);
        set({ 
          error: error instanceof Error ? error.message : '創建負責人資料失敗',
          loading: false 
        });
        throw error;
      }
    },

    /**
     * 更新負責人資料
     */
    updateStaff: async (id, staffData) => {
      set({ loading: true, error: null });
      try {
        const updatedStaff = await staffApi.update(id, staffData);
        set(state => ({
          staff: state.staff.map(member => 
            member.id === id ? updatedStaff : member
          ),
          loading: false
        }));
      } catch (error) {
        console.error('更新負責人資料失敗:', error);
        set({ 
          error: error instanceof Error ? error.message : '更新負責人資料失敗',
          loading: false 
        });
        throw error;
      }
    },

    /**
     * 刪除負責人資料
     */
    deleteStaff: async (id) => {
      set({ loading: true, error: null });
      try {
        await staffApi.delete(id);
        set(state => ({
          staff: state.staff.filter(member => member.id !== id),
          loading: false
        }));
      } catch (error) {
        console.error('刪除負責人資料失敗:', error);
        set({ 
          error: error instanceof Error ? error.message : '刪除負責人資料失敗',
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
    name: 'staff-store'
  }
));