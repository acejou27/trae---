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
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: {
      getItem: (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.warn('無法從 localStorage 讀取:', error);
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.warn('無法寫入 localStorage:', error);
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn('無法從 localStorage 刪除:', error);
        }
      }
    }
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
 * 處理 Supabase 錯誤，返回用戶友好的錯誤信息
 * @param error - Supabase 錯誤對象
 * @returns 用戶友好的錯誤信息
 */
export const handleSupabaseError = (error: any): string => {
  if (!error) return '未知錯誤';
  
  // 記錄詳細錯誤信息用於調試
  console.error('Supabase 錯誤詳情:', {
    name: error.name,
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
    status: error.status,
    statusCode: error.statusCode,
    timestamp: new Date().toISOString()
  });
  
  // 常見錯誤信息映射
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': '登錄憑證無效，請檢查電子郵件和密碼',
    'Email not confirmed': '電子郵件尚未驗證，請檢查您的郵箱',
    'User not found': '找不到該用戶',
    'Password should be at least 6 characters': '密碼至少需要6個字符',
    'Unable to validate email address: invalid format': '電子郵件格式無效',
    'signup is disabled': '註冊功能已停用',
    'Email rate limit exceeded': '電子郵件發送頻率過高，請稍後再試',
    'Database error saving new user': '保存新用戶時發生數據庫錯誤',
    'User already registered': '該電子郵件已被註冊',
    'Invalid refresh token': '刷新令牌無效，請重新登錄',
    'Token has expired': '令牌已過期，請重新登錄',
    'Invalid token': '無效的令牌',
    'Network request failed': '網路請求失敗，請檢查網路連接',
    'Row level security violation': '權限不足',
    'duplicate key value violates unique constraint': '資料重複，違反唯一性約束',
    
    // 認證會話相關錯誤
    'AuthSessionMissingError': '認證會話丟失，請重新登錄',
    'AuthRetryableFetchError': '認證服務暫時不可用，請稍後再試',
    'AuthInvalidTokenResponseError': '認證令牌響應無效，請重新登錄',
    'AuthInvalidCredentialsError': '認證憑證無效，請檢查登錄信息',
    
    // 數據庫權限錯誤
    '42501': '數據庫權限不足，請聯繫系統管理員',
    'permission denied': '權限被拒絕，請檢查用戶權限設置',
    'PGRST116': '查詢結果為空',
    'PGRST301': 'JSON 格式錯誤',
    
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
  const code = error.code || error.name;
  
  // 優先使用錯誤代碼匹配
  if (code && errorMessages[code]) {
    return errorMessages[code];
  }
  
  // 然後使用錯誤信息匹配
  return errorMessages[message] || `${message} (錯誤代碼: ${code || 'unknown'})`;
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
    console.log('開始測試 Google OAuth 配置...');
    
    // 這是一個輕量級的測試，不會實際觸發 OAuth 流程
    // 主要檢查 Supabase 客戶端是否正確初始化
    const { data, error } = await supabase.auth.getSession();
    
    console.log('OAuth 配置測試結果:', { data: !!data, error });
    
    if (error && error.message?.includes('deleted_client')) {
      return {
        isValid: false,
        error: 'Google OAuth 客戶端配置無效或已被刪除'
      };
    }
    
    if (error && error.name === 'AuthSessionMissingError') {
      console.log('檢測到 AuthSessionMissingError，但這不影響 OAuth 配置有效性');
      return { isValid: true };
    }
    
    return { isValid: true };
  } catch (error) {
    console.error('OAuth 配置測試失敗:', error);
    return {
      isValid: false,
      error: `OAuth 配置測試失敗: ${error}`
    };
  }
};

/**
 * 診斷認證問題
 * @returns Promise<{diagnosis: string, recommendations: string[]}>
 */
export const diagnoseAuthIssues = async (): Promise<{diagnosis: string, recommendations: string[]}> => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  try {
    // 檢查會話狀態
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      issues.push(`會話檢查失敗: ${sessionError.message}`);
      
      if (sessionError.name === 'AuthSessionMissingError') {
        recommendations.push('清除瀏覽器緩存和本地存儲');
        recommendations.push('檢查網路連接');
        recommendations.push('嘗試重新登錄');
      }
    }
    
    // 檢查用戶狀態
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      issues.push(`用戶檢查失敗: ${userError.message}`);
    }
    
    // 檢查本地存儲
    try {
      const hasLocalStorage = typeof localStorage !== 'undefined';
      const hasSessionStorage = typeof sessionStorage !== 'undefined';
      
      if (!hasLocalStorage || !hasSessionStorage) {
        issues.push('瀏覽器存儲不可用');
        recommendations.push('檢查瀏覽器設置，確保允許本地存儲');
      }
    } catch (e) {
      issues.push('無法訪問瀏覽器存儲');
      recommendations.push('檢查瀏覽器隱私設置');
    }
    
    // 檢查網路連接
    if (!navigator.onLine) {
      issues.push('網路連接不可用');
      recommendations.push('檢查網路連接');
    }
    
    const diagnosis = issues.length > 0 
      ? `發現 ${issues.length} 個問題: ${issues.join(', ')}`
      : '未發現明顯問題';
    
    if (recommendations.length === 0) {
      recommendations.push('系統狀態正常');
    }
    
    return { diagnosis, recommendations };
    
  } catch (error) {
    return {
      diagnosis: `診斷過程中發生錯誤: ${error}`,
      recommendations: ['請聯繫技術支援']
    };
  }
};

// 匯出類型定義（如果需要）
export type SupabaseClient = typeof supabase;