/**
 * 用戶認證 Hook
 * 管理用戶登錄、註冊、登出和認證狀態
 * Created: 2024-12-28
 */

import { useState, useEffect, useCallback } from 'react';
import { User, AuthError, Session } from '@supabase/supabase-js';
import { supabase, handleSupabaseError } from '../services/supabase';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  clearError: () => void;
}

export type UseAuthReturn = AuthState & AuthActions;

/**
 * 用戶認證 Hook
 * @returns {UseAuthReturn} 認證狀態和操作方法
 */
export const useAuth = (): UseAuthReturn => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  });

  // 設置錯誤狀態
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  // 設置載入狀態
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  // 清除錯誤
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // 更新認證狀態
  const updateAuthState = useCallback((session: Session | null) => {
    setState({
      user: session?.user ?? null,
      session,
      loading: false,
      error: null
    });
  }, []);

  // 電子郵件登錄
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      clearError();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        // 特別處理郵件未驗證的情況
        if (error.message === 'Email not confirmed') {
          setError('請先驗證您的電子郵件地址。請檢查您的信箱並點擊驗證連結。');
        }
        throw error;
      }

      console.log('登錄成功:', data.user?.email);
      updateAuthState(data.session);
    } catch (error) {
      const errorMessage = handleSupabaseError(error as AuthError);
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  }, [setLoading, clearError, updateAuthState, setError]);

  // 電子郵件註冊
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    metadata?: Record<string, any>
  ) => {
    try {
      setLoading(true);
      clearError();

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: metadata || {},
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('註冊錯誤:', error);
        throw error;
      }

      console.log('註冊結果:', data);

      // 檢查註冊結果
      if (data.user) {
        if (data.user.email_confirmed_at) {
          // 郵件已確認，直接登錄
          console.log('郵件已確認，用戶可直接登錄');
          if (data.session) {
            updateAuthState(data.session);
          } else {
            setLoading(false);
          }
        } else {
          // 需要郵件確認
          console.log('用戶需要郵件驗證:', data.user.email);
          setLoading(false);
          // 不拋出錯誤，讓註冊頁面顯示成功訊息
        }
      } else {
        console.error('註冊失敗：未創建用戶');
        throw new Error('註冊失敗，請重試');
      }
    } catch (error) {
      const errorMessage = handleSupabaseError(error as AuthError);
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  }, [setLoading, clearError, updateAuthState, setError]);

  // Google 登錄
  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      // 獲取當前域名，確保重定向URL正確
      const currentOrigin = window.location.origin;
      const redirectUrl = `${currentOrigin}/auth/callback`;
      
      console.log('Google OAuth 重定向URL:', redirectUrl);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.error('Google OAuth 錯誤:', error);
        
        // 特殊處理 OAuth 客戶端錯誤
        if (error.message?.includes('deleted_client') || error.message?.includes('401')) {
          const configError = 'Google OAuth 配置錯誤：OAuth 客戶端已被刪除或無效。請聯繫系統管理員重新配置 Google OAuth 設定。';
          setError(configError);
          setLoading(false);
          throw new Error(configError);
        }
        
        throw error;
      }
    } catch (error) {
      // 如果錯誤已經被特殊處理，直接拋出
      if (error instanceof Error && error.message.includes('Google OAuth 配置錯誤')) {
        throw error;
      }
      
      const errorMessage = handleSupabaseError(error as AuthError);
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  }, [setLoading, clearError, setError]);

  // 登出
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      updateAuthState(null);
    } catch (error) {
      const errorMessage = handleSupabaseError(error as AuthError);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [setLoading, clearError, updateAuthState, setError]);

  // 重置密碼
  const resetPassword = useCallback(async (email: string) => {
    try {
      setLoading(true);
      clearError();

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        throw error;
      }

      setLoading(false);
      console.log('密碼重置郵件已發送');
    } catch (error) {
      const errorMessage = handleSupabaseError(error as AuthError);
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  }, [setLoading, clearError, setError]);

  // 重新發送確認郵件
  const resendConfirmation = useCallback(async (email: string) => {
    try {
      setLoading(true);
      clearError();

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('重新發送確認郵件失敗:', error);
        throw error;
      }

      setLoading(false);
      console.log('確認郵件已重新發送');
    } catch (error) {
      const errorMessage = handleSupabaseError(error as AuthError);
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  }, [setLoading, clearError, setError]);

  // 監聽認證狀態變化
  useEffect(() => {
    let mounted = true;

    // 獲取初始會話
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('獲取會話失敗:', error);
          if (mounted) {
            setError(handleSupabaseError(error));
          }
          return;
        }

        if (mounted) {
          updateAuthState(session);
        }
      } catch (error) {
        console.error('初始化認證狀態失敗:', error);
        if (mounted) {
          setError('初始化認證狀態失敗');
        }
      }
    };

    getInitialSession();

    // 監聽認證狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('認證狀態變化:', event, session?.user?.email);
        
        switch (event) {
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
            updateAuthState(session);
            break;
          case 'SIGNED_OUT':
            updateAuthState(null);
            break;
          case 'PASSWORD_RECOVERY':
            // 處理密碼重置
            break;
          default:
            updateAuthState(session);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [updateAuthState, setError]);

  return {
    ...state,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    resendConfirmation,
    clearError
  };
};

export default useAuth;