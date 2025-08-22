/**
 * 用戶認證 Hook
 * 管理Google登錄、登出和認證狀態
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
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
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
    console.log('更新認證狀態:', session ? `用戶: ${session.user?.email}` : '清除狀態');
    setState({
      user: session?.user || null,
      session,
      loading: false,
      error: null
    });
  }, []);



  // Google 登錄
  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      // 獲取重定向URL，優先使用環境變數，否則使用當前域名
      const getRedirectUrl = () => {
        // 檢查是否有環境變數設定的基礎URL
        const baseUrl = import.meta.env.VITE_APP_URL;
        if (baseUrl) {
          return `${baseUrl}/auth/callback`;
        }
        
        // 使用當前域名
        const currentOrigin = window.location.origin;
        
        // 如果是localhost但不是開發模式，可能是部署錯誤
        if (currentOrigin.includes('localhost') && import.meta.env.PROD) {
          console.warn('生產環境檢測到localhost，這可能是配置錯誤');
        }
        
        return `${currentOrigin}/auth/callback`;
      };
      
      const redirectUrl = getRedirectUrl();
      
      console.log('環境模式:', import.meta.env.MODE);
      console.log('是否為生產環境:', import.meta.env.PROD);
      console.log('當前域名:', window.location.origin);
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

      // 檢查當前會話狀態
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.warn('獲取會話狀態失敗:', sessionError);
      }
      
      if (!session) {
        console.log('沒有活動會話，直接清除本地狀態');
        updateAuthState(null);
        setLoading(false);
        return;
      }

      console.log('正在登出用戶:', session.user?.email);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('登出錯誤:', error);
        throw error;
      }

      console.log('登出成功');
      updateAuthState(null);
      setLoading(false);
    } catch (error) {
      console.error('登出過程中發生錯誤:', error);
      const errorMessage = handleSupabaseError(error as AuthError);
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  }, [setLoading, clearError, updateAuthState, setError]);



  // 監聽認證狀態變化
  useEffect(() => {
    let mounted = true;

    // 獲取初始會話
    const getInitialSession = async () => {
      try {
        console.log('正在獲取初始會話...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('獲取會話失敗:', error);
          if (mounted) {
            setError(handleSupabaseError(error));
            setLoading(false);
          }
          return;
        }

        console.log('初始會話狀態:', session ? `用戶: ${session.user?.email}` : '無會話');
        if (mounted) {
          updateAuthState(session);
        }
      } catch (error) {
        console.error('初始化認證狀態失敗:', error);
        if (mounted) {
          setError('初始化認證狀態失敗');
          setLoading(false);
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
            console.log('用戶登錄成功:', session?.user?.email);
            // 立即更新認證狀態，確保用戶能快速進入系統
            updateAuthState(session);
            
            // 異步檢查和創建個人資料，不阻塞認證流程
            if (session?.user) {
              setTimeout(async () => {
                try {
                  const { data: profile, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .single();
                  
                  if (error && error.code === 'PGRST116') {
                    console.log('為新用戶創建個人資料...');
                    await supabase
                      .from('user_profiles')
                      .insert({
                        user_id: session.user.id,
                        display_name: session.user.user_metadata?.full_name || 
                                    session.user.user_metadata?.name || 
                                    session.user.email?.split('@')[0] || '用戶',
                        job_title: '',
                        phone: ''
                      });
                    console.log('新用戶個人資料創建完成');
                  }
                } catch (err) {
                  console.error('個人資料處理錯誤:', err);
                }
              }, 100);
            }
            break;
          case 'TOKEN_REFRESHED':
            console.log('Token已刷新:', session?.user?.email);
            updateAuthState(session);
            break;
          case 'SIGNED_OUT':
            console.log('用戶已登出');
            updateAuthState(null);
            break;
          case 'PASSWORD_RECOVERY':
            console.log('密碼重置事件');
            // 處理密碼重置
            break;
          default:
            console.log('其他認證事件:', event);
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
    signInWithGoogle,
    signOut,
    clearError
  };
};

export default useAuth;