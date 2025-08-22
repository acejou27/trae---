/**
 * 註冊頁面
 * 支援電子郵件註冊和用戶資料輸入
 * Created: 2024-12-28
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import { cn } from '../../utils/cn';

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  company?: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, resendConfirmation, user, loading, error, clearError } = useAuth();
  
  const [form, setForm] = useState<RegisterForm>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    company: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Partial<RegisterForm>>({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // 如果已登錄，重定向到首頁
  useEffect(() => {
    if (user && !loading) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  // 清除錯誤當組件卸載時
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // 表單驗證
  const validateForm = (): boolean => {
    const errors: Partial<RegisterForm> = {};

    // 姓名驗證
    if (!form.fullName.trim()) {
      errors.fullName = '請輸入您的姓名';
    } else if (form.fullName.trim().length < 2) {
      errors.fullName = '姓名至少需要2個字元';
    }

    // 電子郵件驗證
    if (!form.email.trim()) {
      errors.email = '請輸入電子郵件';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = '請輸入有效的電子郵件格式';
    }

    // 密碼驗證
    if (!form.password) {
      errors.password = '請輸入密碼';
    } else if (form.password.length < 6) {
      errors.password = '密碼至少需要6個字元';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      errors.password = '密碼需包含大小寫字母和數字';
    }

    // 確認密碼驗證
    if (!form.confirmPassword) {
      errors.confirmPassword = '請確認密碼';
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = '密碼不一致';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 處理表單輸入
  const handleInputChange = (field: keyof RegisterForm, value: string) => {
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

  // 處理註冊
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      // 準備用戶元數據
      const metadata = {
        full_name: form.fullName.trim(),
        company: form.company?.trim() || null
      };

      await signUp(form.email, form.password, metadata);
      
      // 如果沒有錯誤，顯示成功訊息
      if (!error) {
        setRegistrationSuccess(true);
      }
    } catch (error) {
      // 錯誤已在useAuth中處理
      console.error('註冊失敗:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 密碼強度檢查
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^\w\s]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(form.password);
  const strengthLabels = ['很弱', '弱', '一般', '強', '很強'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  // 如果正在載入，顯示載入畫面
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  // 重新發送驗證郵件
  const handleResendVerification = async () => {
    if (!form.email) return;
    
    try {
      setIsSubmitting(true);
      await resendConfirmation(form.email);
      alert('驗證郵件已重新發送，請檢查您的信箱（包括垃圾郵件資料夾）。');
    } catch (error) {
      console.error('重新發送驗證郵件失敗:', error);
      alert('重新發送失敗，請稍後再試。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 註冊成功頁面
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white py-8 px-6 shadow-xl rounded-xl text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              註冊成功！
            </h2>
            <p className="text-gray-600 mb-4">
              我們已發送確認郵件到 <strong>{form.email}</strong>，請點擊郵件中的連結完成帳號驗證。
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-blue-800 mb-2">📧 郵件確認步驟：</h3>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>檢查您的信箱（包括垃圾郵件資料夾）</li>
                <li>找到來自 Supabase 的確認郵件</li>
                <li>點擊郵件中的「確認帳號」連結</li>
                <li>完成確認後即可使用帳號密碼登錄</li>
              </ol>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                沒有收到郵件？請檢查垃圾郵件資料夾，或點擊下方重新發送。
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleResendVerification}
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      發送中...
                    </>
                  ) : (
                    '重新發送'
                  )}
                </button>
                <Link
                  to="/auth/login"
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  前往登錄
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 標題區域 */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            建立新帳號
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            加入報價單管理系統
          </p>
        </div>

        {/* 註冊表單 */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
          <form className="space-y-6" onSubmit={handleRegister}>
            {/* 全局錯誤訊息 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* 姓名輸入 */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                姓名 *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={cn(
                    "block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors",
                    validationErrors.fullName
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  )}
                  placeholder="請輸入您的姓名"
                  disabled={isSubmitting}
                />
              </div>
              {validationErrors.fullName && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.fullName}</p>
              )}
            </div>

            {/* 公司名稱輸入（可選） */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                公司名稱（可選）
              </label>
              <input
                id="company"
                name="company"
                type="text"
                autoComplete="organization"
                value={form.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white hover:border-gray-400"
                placeholder="請輸入您的公司名稱"
                disabled={isSubmitting}
              />
            </div>

            {/* 電子郵件輸入 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                電子郵件 *
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
                    "block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors",
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
                密碼 *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={cn(
                    "block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors",
                    validationErrors.password
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  )}
                  placeholder="請輸入密碼"
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
              
              {/* 密碼要求提示 */}
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  密碼要求：至少6個字元，包含大小寫字母和數字
                </p>
              </div>
              
              {/* 密碼強度指示器 */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          strengthColors[Math.max(0, passwordStrength - 1)]
                        )}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">
                      {strengthLabels[Math.max(0, passwordStrength - 1)]}
                    </span>
                  </div>
                </div>
              )}
              
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
              )}
            </div>

            {/* 確認密碼輸入 */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                確認密碼 *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={cn(
                    "block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors",
                    validationErrors.confirmPassword
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  )}
                  placeholder="請再次輸入密碼"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* 註冊按鈕 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200",
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 active:bg-green-800"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  註冊中...
                </>
              ) : (
                '建立帳號'
              )}
            </button>
          </form>

          {/* 登錄連結 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              已經有帳號了？{' '}
              <Link
                to="/auth/login"
                className="font-medium text-green-600 hover:text-green-500 transition-colors"
              >
                立即登錄
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;