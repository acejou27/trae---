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
        // 檢查是否有錯誤參數
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (error) {
          console.error('Google OAuth 錯誤:', error, errorDescription);
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
        console.log('開始處理認證回調...');
        
        // 先嘗試從URL參數獲取會話信息
        const { data, error: authError } = await supabase.auth.getSession();
        
        console.log('會話數據:', data);
        console.log('認證錯誤:', authError);
        
        if (authError) {
          console.error('獲取會話失敗:', authError);
          setStatus('error');
          setMessage('無法完成認證，請重試');
          
          // 3秒後重定向到登錄頁面
          setTimeout(() => {
            navigate('/auth/login', { replace: true });
          }, 3000);
          return;
        }

        if (data.session && data.session.user) {
          const user = data.session.user;
          console.log('Google 登錄成功:', user.email);
          console.log('用戶資料:', user.user_metadata);
          
          setStatus('success');
          setMessage(`歡迎 ${user.user_metadata?.full_name || user.email}！正在跳轉到首頁...`);
          
          // 縮短重定向時間，讓用戶更快進入系統
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1000);
        } else {
          console.log('沒有找到有效會話，會話數據:', data);
          
          // 嘗試等待一下再檢查會話
          setTimeout(async () => {
            const { data: retryData } = await supabase.auth.getSession();
            if (retryData.session) {
              console.log('重試後找到會話:', retryData.session.user.email);
              navigate('/', { replace: true });
            } else {
              setStatus('error');
              setMessage('Google 登錄會話無效，請重新登錄');
              setTimeout(() => {
                navigate('/auth/login', { replace: true });
              }, 3000);
            }
          }, 1000);
        }
      } catch (error) {
        console.error('處理認證回調時發生錯誤:', error);
        setStatus('error');
        setMessage('處理認證時發生未知錯誤');
        
        // 3秒後重定向到登錄頁面
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