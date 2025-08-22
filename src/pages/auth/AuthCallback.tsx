/**
 * 認證回調處理頁面
 * 處理Google OAuth登錄和郵件確認後的重定向和會話設置
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
        const type = searchParams.get('type'); // 確認類型：signup, recovery等
        
        if (error) {
          console.error('認證錯誤:', error, errorDescription);
          setStatus('error');
          setMessage(errorDescription || '認證過程中發生錯誤');
          
          // 3秒後重定向到登錄頁面
          setTimeout(() => {
            navigate('/auth/login', { replace: true });
          }, 3000);
          return;
        }

        // 處理Supabase認證回調
        const { data, error: authError } = await supabase.auth.getSession();
        
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

        if (data.session) {
          const user = data.session.user;
          console.log('認證成功:', user.email, '類型:', type);
          
          // 根據認證類型顯示不同訊息
          if (type === 'signup') {
            setStatus('success');
            setMessage('郵件確認成功！正在跳轉到首頁...');
          } else {
            setStatus('success');
            setMessage('登錄成功，正在跳轉...');
          }
          
          // 1.5秒後重定向到首頁
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1500);
        } else {
          // 沒有會話，可能需要處理郵件確認但未自動登錄的情況
          console.log('沒有找到有效會話，可能是郵件確認但需要手動登錄');
          
          if (type === 'signup') {
            setStatus('success');
            setMessage('郵件確認成功！請使用您的帳號密碼登錄。');
            
            // 3秒後重定向到登錄頁面
            setTimeout(() => {
              navigate('/auth/login', { replace: true });
            }, 3000);
          } else {
            setStatus('error');
            setMessage('認證會話無效，請重新登錄');
            
            // 3秒後重定向到登錄頁面
            setTimeout(() => {
              navigate('/auth/login', { replace: true });
            }, 3000);
          }
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
              正在處理認證...
            </h2>
            <p className="text-gray-600">
              請稍候，我們正在完成您的認證流程
            </p>
          </>
        );
      
      case 'success':
        return (
          <>
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              認證成功！
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
              認證失敗
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <button
              onClick={() => navigate('/auth/login', { replace: true })}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              返回登錄頁面
            </button>
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