/**
 * 登錄頁面
 * 支援Google登錄
 * Created: 2024-12-28
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle, user, loading, error, clearError } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 獲取重定向路徑
  const from = (location.state as any)?.from?.pathname || '/';

  // 如果已登錄，重定向到目標頁面
  useEffect(() => {
    if (user && !loading) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  // 清除錯誤當組件卸載時
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);



  // 處理Google登錄
  const handleGoogleLogin = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Google登錄失敗:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 如果正在載入，顯示載入畫面
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 標題區域 */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            歡迎使用報價單管理系統
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            請使用 Google 帳號登錄
          </p>
        </div>

        {/* 登錄卡片 */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
          <div className="space-y-6">
            {/* 錯誤訊息 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm text-red-700">{error}</div>
                  {/* OAuth 配置錯誤的特殊處理 */}
                  {error.includes('Google OAuth 配置錯誤') && (
                    <div className="mt-2 text-xs text-red-600">
                      <p>這通常是因為：</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Google OAuth 客戶端已被刪除</li>
                        <li>Supabase 中的 Google 提供商配置無效</li>
                        <li>重定向 URL 設定不正確</li>
                      </ul>
                      <p className="mt-2">
                        請參考{' '}
                        <a 
                          href="/.trae/documents/Google_OAuth_配置指南.md"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          OAuth 配置指南
                        </a>
                        {' '}或聯繫系統管理員。
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}



            {/* Google登錄按鈕 */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className={cn(
                "w-full flex justify-center items-center py-4 px-6 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white transition-all duration-200",
                isSubmitting
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:bg-gray-100 hover:shadow-md"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-3" />
                  登錄中...
                </>
              ) : (
                <>
                  <div className="w-6 h-6 mr-3 flex items-center justify-center bg-blue-500 text-white text-sm font-bold rounded">
                    G
                  </div>
                  使用 Google 帳號登錄
                </>
              )}
            </button>

            {/* 說明文字 */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                點擊上方按鈕即表示您同意我們的服務條款和隱私政策
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;