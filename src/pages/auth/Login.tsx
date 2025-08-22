/**
 * 登錄頁面
 * 支援電子郵件和Google登錄
 * Created: 2024-12-28
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithGoogle, user, loading, error, clearError } = useAuth();
  
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Partial<LoginForm>>({});

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

  // 表單驗證
  const validateForm = (): boolean => {
    const errors: Partial<LoginForm> = {};

    if (!form.email.trim()) {
      errors.email = '請輸入電子郵件';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = '請輸入有效的電子郵件格式';
    }

    if (!form.password) {
      errors.password = '請輸入密碼';
    } else if (form.password.length < 6) {
      errors.password = '密碼至少需要6個字元';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 處理表單輸入
  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // 清除該欄位的驗證錯誤
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // 清除全局錯誤
    if (error) {
      clearError();
    }
  };

  // 處理電子郵件登錄
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await signIn(form.email, form.password);
      // 成功登錄後會通過useEffect重定向
    } catch (error) {
      // 錯誤已在useAuth中處理
      console.error('登錄失敗:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            歡迎回來
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            登錄到您的報價單管理系統
          </p>
        </div>

        {/* 登錄表單 */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
          <form className="space-y-6" onSubmit={handleEmailLogin}>
            {/* 全局錯誤訊息 */}
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
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={cn(
                    "block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors",
                    validationErrors.email
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  )}
                  placeholder="請輸入您的電子郵件"
                  disabled={isSubmitting}
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            {/* 密碼輸入 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                密碼
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={cn(
                    "block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors",
                    validationErrors.password
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  )}
                  placeholder="請輸入您的密碼"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
              )}
            </div>

            {/* 忘記密碼連結 */}
            <div className="flex items-center justify-end">
              <Link
                to="/auth/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
              >
                忘記密碼？
              </Link>
            </div>

            {/* 登錄按鈕 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200",
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:bg-blue-800"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  登錄中...
                </>
              ) : (
                '登錄'
              )}
            </button>

            {/* 分隔線 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">或</span>
              </div>
            </div>

            {/* Google登錄按鈕 */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className={cn(
                "w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white transition-all duration-200",
                isSubmitting
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:bg-gray-100"
              )}
            >
              <div className="w-5 h-5 mr-2 flex items-center justify-center bg-blue-500 text-white text-xs font-bold rounded">
                G
              </div>
              使用 Google 登錄
            </button>
          </form>

          {/* 註冊連結 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              還沒有帳號？{' '}
              <Link
                to="/auth/register"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                立即註冊
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;