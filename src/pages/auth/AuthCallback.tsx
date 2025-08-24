/**
 * 認證回調處理頁面
 * 處理Google OAuth登錄後的重定向和會話設置
 * Created: 2024-12-28
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // 詳細記錄當前 URL 和參數
        const currentUrl = window.location.href;
        const allParams = Object.fromEntries(searchParams.entries());
        console.log('AuthCallback 開始處理:', {
          currentUrl,
          searchParams: allParams,
          origin: window.location.origin,
          pathname: window.location.pathname
        });

        // 檢查是否有錯誤參數
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (error) {
          console.error('Google OAuth 錯誤:', {
            error,
            errorDescription,
            allParams
          });
          setStatus('error');
          
          // 根據錯誤類型提供更友好的錯誤訊息
          if (error === 'access_denied') {
            setMessage('您取消了 Google 登錄授權');
          } else if (error === 'invalid_request') {
            setMessage('登錄請求無效，請重試');
          } else {
            setMessage(errorDescription || 'Google 登錄過程中發生錯誤');
          }
          
          // 3秒後重定向到登錄頁面
          setTimeout(() => {
            navigate('/auth/login', { replace: true });
          }, 3000);
          return;
        }

        // 處理Supabase認證回調
        console.log('開始處理 Supabase 認證回調...');
        
        // 檢查 URL 中是否有認證相關的參數
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        console.log('OAuth 參數:', { code: code ? '存在' : '不存在', state });
        
        // 如果有 code 參數，說明是 OAuth 回調，需要交換 token
        if (code) {
          console.log('檢測到 OAuth code，開始交換 token...');
          
          try {
            // 使用 exchangeCodeForSession 處理 OAuth 回調
            const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            
            console.log('Token 交換結果:', {
              hasSession: !!sessionData?.session,
              hasUser: !!sessionData?.user,
              error: exchangeError,
              sessionDetails: sessionData?.session ? {
                accessToken: sessionData.session.access_token ? 'present' : 'missing',
                refreshToken: sessionData.session.refresh_token ? 'present' : 'missing',
                expiresAt: sessionData.session.expires_at,
                userId: sessionData.session.user?.id
              } : null
            });
            
            if (exchangeError) {
              console.error('Token 交換失敗:', {
                error: exchangeError,
                message: exchangeError.message,
                status: exchangeError.status,
                name: exchangeError.name
              });
              
              // 特殊處理不同類型的錯誤
              if (exchangeError.message?.includes('invalid_grant') || exchangeError.message?.includes('code_expired')) {
                setStatus('error');
                setMessage('授權碼已過期或無效，請重新登入');
              } else if (exchangeError.message?.includes('redirect_uri_mismatch')) {
                setStatus('error');
                setMessage('重定向 URI 不匹配，請檢查 OAuth 配置');
              } else {
                setStatus('error');
                setMessage(`認證失敗: ${exchangeError.message}`);
              }
              
              setTimeout(() => {
                navigate('/auth/login', { replace: true });
              }, 3000);
              return;
            }
            
            if (sessionData?.session && sessionData?.user) {
              const user = sessionData.user;
              const session = sessionData.session;
              
              console.log('OAuth 認證成功:', {
                email: user.email,
                id: user.id,
                metadata: user.user_metadata,
                sessionValid: !!session.access_token,
                expiresAt: session.expires_at
              });
              
              // 驗證會話是否正確建立
              try {
                const { data: verifyData, error: verifyError } = await supabase.auth.getSession();
                console.log('會話驗證結果:', {
                  hasSession: !!verifyData?.session,
                  sessionMatches: verifyData?.session?.user?.id === user.id,
                  error: verifyError
                });
                
                if (verifyError || !verifyData?.session) {
                  console.warn('會話驗證失敗，嘗試手動設置會話');
                  // 嘗試手動設置會話
                  const { error: setError } = await supabase.auth.setSession({
                    access_token: session.access_token,
                    refresh_token: session.refresh_token
                  });
                  
                  if (setError) {
                    console.error('手動設置會話失敗:', setError);
                    setStatus('error');
                    setMessage('會話設置失敗，請重新登入');
                    setTimeout(() => {
                      navigate('/auth/login', { replace: true });
                    }, 3000);
                    return;
                  }
                }
              } catch (verifyErr) {
                console.warn('會話驗證過程中發生錯誤:', verifyErr);
              }
              
              setStatus('success');
              setMessage(`歡迎 ${user.user_metadata?.full_name || user.email}！正在跳轉到首頁...`);
              
              // 延長跳轉時間，確保會話完全建立
              setTimeout(() => {
                navigate('/', { replace: true });
              }, 1500);
              return;
            } else {
              console.error('Token 交換成功但沒有獲得有效的會話或用戶數據');
              setStatus('error');
              setMessage('認證過程中發生錯誤，未能獲得有效的用戶會話');
              setTimeout(() => {
                navigate('/auth/login', { replace: true });
              }, 3000);
              return;
            }
          } catch (codeExchangeError) {
            console.error('OAuth code 交換過程中發生異常:', codeExchangeError);
            setStatus('error');
            setMessage('認證過程中發生異常，請重新登入');
            setTimeout(() => {
              navigate('/auth/login', { replace: true });
            }, 3000);
            return;
          }
        }
        
        // 如果沒有 code 參數，嘗試獲取現有會話
        console.log('沒有 OAuth code，檢查現有會話...');
        const { data, error: authError } = await supabase.auth.getSession();
        
        console.log('會話檢查結果:', {
          hasSession: !!data?.session,
          hasUser: !!data?.session?.user,
          error: authError,
          sessionDetails: data?.session ? {
            userId: data.session.user?.id,
            email: data.session.user?.email,
            expiresAt: data.session.expires_at
          } : null
        });
        
        if (authError) {
          console.error('獲取會話失敗:', authError);
          setStatus('error');
          setMessage(`無法完成認證: ${authError.message}`);
          
          setTimeout(() => {
            navigate('/auth/login', { replace: true });
          }, 3000);
          return;
        }

        if (data.session && data.session.user) {
          const user = data.session.user;
          console.log('找到有效會話:', {
            email: user.email,
            id: user.id,
            metadata: user.user_metadata
          });
          
          setStatus('success');
          setMessage(`歡迎 ${user.user_metadata?.full_name || user.email}！正在跳轉到首頁...`);
          
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1000);
        } else {
          console.log('沒有找到有效會話，嘗試重試機制...');
          
          // 嘗試等待一下再檢查會話（有時需要一點時間）
          let retryCount = 0;
          const maxRetries = 3;
          
          const retryGetSession = async () => {
            retryCount++;
            console.log(`重試獲取會話 (${retryCount}/${maxRetries})...`);
            
            const { data: retryData, error: retryError } = await supabase.auth.getSession();
            
            console.log(`重試 ${retryCount} 結果:`, {
              hasSession: !!retryData?.session,
              hasUser: !!retryData?.session?.user,
              error: retryError
            });
            
            if (retryData?.session && retryData?.session?.user) {
              console.log('重試後找到會話:', retryData.session.user.email);
              setStatus('success');
              setMessage(`歡迎 ${retryData.session.user.user_metadata?.full_name || retryData.session.user.email}！`);
              setTimeout(() => {
                navigate('/', { replace: true });
              }, 1000);
              return;
            }
            
            if (retryCount < maxRetries) {
              setTimeout(retryGetSession, 1000);
            } else {
              console.log('所有重試都失敗，顯示錯誤');
              setStatus('error');
              setMessage('Google 登錄會話無效，請重新登錄。如果問題持續，請檢查 OAuth 配置。');
              setTimeout(() => {
                navigate('/auth/login', { replace: true });
              }, 3000);
            }
          };
          
          setTimeout(retryGetSession, 500);
        }
      } catch (error) {
        console.error('處理認證回調時發生錯誤:', {
          error,
          message: error instanceof Error ? error.message : '未知錯誤',
          stack: error instanceof Error ? error.stack : undefined,
          currentUrl: window.location.href
        });
        setStatus('error');
        setMessage('處理認證時發生未知錯誤，請重試');
        
        setTimeout(() => {
          navigate('/auth/login', { replace: true });
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              正在處理 Google 登錄...
            </h2>
            <p className="text-gray-600">
              請稍候，我們正在完成您的登錄流程
            </p>
          </>
        );
      
      case 'success':
        return (
          <>
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              登錄成功！
            </h2>
            <p className="text-gray-600">
              {message}
            </p>
          </>
        );
      
      case 'error':
        return (
          <>
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              登錄失敗
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/auth/login', { replace: true })}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                重新登錄
              </button>
              <p className="text-xs text-gray-500">
                如果問題持續發生，請聯繫系統管理員
              </p>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl text-center">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;