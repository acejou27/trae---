/**
 * 忘記密碼頁面
 * 支援密碼重置功能
 * Created: 2024-12-28
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';

const ForgotPassword: React.FC = () => {
  const { resetPassword, loading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [validationError, setValidationError] = useState('');

  // 表單驗證
  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setValidationError('請輸入電子郵件');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError('請輸入有效的電子郵件格式');
      return false;
    }
    
    setValidationError('');
    return true;
  };

  // 處理表單輸入
  const handleEmailChange = (value: string) => {
    setEmail(value);
    
    // 清除驗證錯誤
    if (validationError) {
      setValidationError('');
    }
    
    // 清除全局錯誤
    if (error) {
      clearError();
    }
  };

  // 處理密碼重置
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await resetPassword(email);
      setEmailSent(true);
    } catch (error) {
      // 錯誤已在useAuth中處理
      console.error('密碼重置失敗:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 如果郵件已發送，顯示成功頁面
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white py-8 px-6 shadow-xl rounded-xl text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              郵件已發送
            </h2>
            <p className="text-gray-600 mb-6">
              我們已發送密碼重置連結到 <strong>{email}</strong>，請檢查您的信箱並點擊連結重置密碼。
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                沒有收到郵件？請檢查垃圾郵件資料夾，或稍後再試。
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                    clearError();
                  }}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  重新發送
                </button>
                <Link
                  to="/auth/login"
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  返回登錄
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 標題區域 */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            忘記密碼
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            輸入您的電子郵件地址，我們將發送密碼重置連結給您
          </p>
        </div>

        {/* 重置表單 */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
          <form className="space-y-6" onSubmit={handleResetPassword}>
            {/* 全局錯誤訊息 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* 電子郵件輸入 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                電子郵件
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={cn(
                    "block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors",
                    validationError
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  )}
                  placeholder="請輸入您的電子郵件"
                  disabled={isSubmitting}
                />
              </div>
              {validationError && (
                <p className="mt-1 text-sm text-red-600">{validationError}</p>
              )}
            </div>

            {/* 重置按鈕 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200",
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 active:bg-purple-800"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  發送中...
                </>
              ) : (
                '發送重置連結'
              )}
            </button>
          </form>

          {/* 返回登錄連結 */}
          <div className="mt-6">
            <Link
              to="/auth/login"
              className="flex items-center justify-center text-sm text-purple-600 hover:text-purple-500 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回登錄頁面
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;