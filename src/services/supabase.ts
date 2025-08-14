/**
 * Supabase 客戶端配置
 * Created: 2024-12-28
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// 環境變數檢查
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('缺少 Supabase 環境變數配置，請檢查 .env 檔案');
}

/**
 * Supabase 客戶端實例
 * 用於與 Supabase 資料庫進行互動
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'quote-system@1.0.0'
    }
  }
});

/**
 * 資料庫錯誤處理函數
 * @param error - Supabase 錯誤物件
 * @returns 格式化的錯誤訊息
 */
export const handleSupabaseError = (error: any): string => {
  if (!error) return '未知錯誤';
  
  // 常見錯誤訊息對應
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': '登入憑證無效',
    'Email not confirmed': '電子郵件尚未驗證',
    'User not found': '找不到使用者',
    'Password should be at least 6 characters': '密碼至少需要6個字元',
    'Unable to validate email address': '無法驗證電子郵件地址',
    'Database connection error': '資料庫連接錯誤',
    'Row level security violation': '權限不足',
    'duplicate key value violates unique constraint': '資料重複，違反唯一性約束'
  };
  
  const message = error.message || error.error_description || '操作失敗';
  return errorMessages[message] || message;
};

/**
 * 檢查使用者登入狀態
 * @returns Promise<boolean> - 是否已登入
 */
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('檢查登入狀態失敗:', error);
    return false;
  }
};

/**
 * 登出函數
 * @returns Promise<void>
 */
export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('登出失敗:', error);
    throw new Error(handleSupabaseError(error));
  }
};

/**
 * 取得當前使用者資訊
 * @returns Promise<User | null>
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('取得使用者資訊失敗:', error);
    return null;
  }
};

// 匯出類型定義（如果需要）
export type SupabaseClient = typeof supabase;