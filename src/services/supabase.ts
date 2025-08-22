/**
 * Supabase 客戶端配置
 * Created: 2024-12-28
 */

import { createClient } from '@supabase/supabase-js';
import type { PostgrestError } from '@supabase/supabase-js';
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
export const handleSupabaseError = (error: PostgrestError | Error | null): string => {
  if (!error) return '未知錯誤';
  
  // 常見錯誤訊息對應
  const errorMessages: Record<string, string> = {
    // 登錄相關錯誤
    'Invalid login credentials': '登入憑證無效',
    'Email not confirmed': '電子郵件尚未驗證，請檢查您的信箱並點擊確認連結',
    'User not found': '找不到使用者',
    'Password should be at least 6 characters': '密碼至少需要6個字元',
    'Unable to validate email address': '無法驗證電子郵件地址',
    
    // 註冊相關錯誤
    'User already registered': '此電子郵件已被註冊',
    'Signup is disabled': '註冊功能已停用',
    'Email address is invalid': '電子郵件地址格式無效',
    'Password is too weak': '密碼強度不足，請使用更複雜的密碼',
    
    // 郵件相關錯誤
    'Email rate limit exceeded': '郵件發送頻率過高，請稍後再試',
    'Email sending failed': '郵件發送失敗，請檢查郵件設定',
    'Invalid email template': '郵件模板設定錯誤',
    'SMTP configuration error': 'SMTP 設定錯誤，請聯繫系統管理員',
    'Email delivery failed': '郵件投遞失敗，請檢查收件地址',
    
    // 系統相關錯誤
    'Database connection error': '資料庫連接錯誤',
    'Row level security violation': '權限不足',
    'duplicate key value violates unique constraint': '資料重複，違反唯一性約束',
    
    // OAuth 相關錯誤
    'deleted_client': 'Google OAuth 配置錯誤：OAuth 客戶端已被刪除或無效',
    'invalid_client': 'Google OAuth 配置錯誤：OAuth 客戶端設定無效',
    'access_denied': 'Google OAuth 存取被拒絕：用戶取消授權或權限不足',
    'unauthorized_client': 'Google OAuth 客戶端未授權：請檢查 OAuth 設定',
    'invalid_request': 'Google OAuth 請求無效：請檢查重定向 URL 設定',
    'unsupported_response_type': 'Google OAuth 不支援的回應類型',
    'invalid_scope': 'Google OAuth 權限範圍無效',
    'server_error': 'Google OAuth 伺服器錯誤：請稍後再試',
    'temporarily_unavailable': 'Google OAuth 服務暫時無法使用：請稍後再試'
  };
  
  const message = error.message || '操作失敗';
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

/**
 * 檢查 OAuth 配置狀態
 * @returns Promise<{isConfigured: boolean, error?: string}>
 */
export const checkOAuthConfig = async (): Promise<{isConfigured: boolean, error?: string}> => {
  try {
    // 嘗試獲取 OAuth 提供商列表來檢查配置
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn('OAuth 配置檢查警告:', error);
      return {
        isConfigured: false,
        error: '無法檢查 OAuth 配置狀態'
      };
    }
    
    // 如果能正常獲取會話，表示基本配置正常
    return { isConfigured: true };
  } catch (error) {
    console.error('OAuth 配置檢查失敗:', error);
    return {
      isConfigured: false,
      error: 'OAuth 配置檢查失敗'
    };
  }
};

/**
 * 測試 Google OAuth 配置
 * @returns Promise<{isValid: boolean, error?: string}>
 */
export const testGoogleOAuthConfig = async (): Promise<{isValid: boolean, error?: string}> => {
  try {
    // 這是一個輕量級的測試，不會實際觸發 OAuth 流程
    // 主要檢查 Supabase 客戶端是否正確初始化
    const { data, error } = await supabase.auth.getSession();
    
    if (error && error.message?.includes('deleted_client')) {
      return {
        isValid: false,
        error: 'Google OAuth 客戶端已被刪除或無效'
      };
    }
    
    return { isValid: true };
  } catch (error) {
    console.error('Google OAuth 配置測試失敗:', error);
    return {
      isValid: false,
      error: 'Google OAuth 配置測試失敗'
    };
  }
};

// 匯出類型定義（如果需要）
export type SupabaseClient = typeof supabase;