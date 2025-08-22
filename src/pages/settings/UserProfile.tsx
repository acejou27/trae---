/**
 * 用戶個人資料設定頁面
 * 允許用戶編輯個人資料信息
 * Created: 2024-12-28
 */

import React, { useState } from 'react';
import { UserCircleIcon, PhoneIcon, BriefcaseIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useUserProfile, UserProfile as UserProfileType } from '../../hooks/useUserProfile';
import { cn } from '../../utils/cn';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading, saving, error, saveProfile, clearError } = useUserProfile();
  const [formData, setFormData] = useState<UserProfileType>({
    user_id: user?.id || '',
    display_name: '',
    job_title: '',
    phone: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 當個人資料載入時更新表單數據
  React.useEffect(() => {
    if (profile) {
      setFormData({
        user_id: profile.user_id,
        display_name: profile.display_name,
        job_title: profile.job_title,
        phone: profile.phone
      });
    }
  }, [profile]);

  // 表單驗證
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.display_name.trim()) {
      newErrors.display_name = '請輸入顯示名稱';
    } else if (formData.display_name.length > 100) {
      newErrors.display_name = '顯示名稱不能超過100個字元';
    }

    if (formData.job_title && formData.job_title.length > 100) {
      newErrors.job_title = '職務不能超過100個字元';
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = '請輸入有效的電話號碼';
    }

    if (formData.phone && formData.phone.length > 20) {
      newErrors.phone = '電話號碼不能超過20個字元';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 處理表單輸入
  const handleInputChange = (field: keyof UserProfileType, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除該欄位的錯誤訊息
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // 清除成功/錯誤訊息
    if (message) {
      setMessage(null);
    }
    
    // 清除全局錯誤
    if (error) {
      clearError();
    }
  };

  // 儲存個人資料
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user?.id) return;

    try {
      setMessage(null);
      await saveProfile(formData);
      setMessage({ type: 'success', text: '個人資料已成功更新' });
    } catch (error) {
      console.error('儲存個人資料失敗:', error);
      setMessage({ type: 'error', text: '儲存個人資料失敗，請稍後再試' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">載入中...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 頁面標題 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <UserCircleIcon className="h-8 w-8 mr-3 text-blue-600" />
          個人資料設定
        </h1>
        <p className="mt-2 text-gray-600">
          管理您的個人資料信息，這些信息將顯示在系統中。
        </p>
      </div>

      {/* 成功/錯誤訊息 */}
      {(message || error) && (
        <div className={cn(
          "mb-6 p-4 rounded-lg border",
          (message?.type === 'success') 
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-red-50 border-red-200 text-red-700"
        )}>
          {message?.text || error}
        </div>
      )}

      {/* 個人資料表單 */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">基本資料</h2>
          <p className="text-sm text-gray-500">更新您的個人基本資料信息</p>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* 電子郵件（只讀） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              電子郵件
            </label>
            <div className="relative">
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              電子郵件地址無法修改
            </p>
          </div>

          {/* 顯示名稱 */}
          <div>
            <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-2">
              顯示名稱 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="display_name"
                value={formData.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                className={cn(
                  "block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors",
                  errors.display_name
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 bg-white hover:border-gray-400"
                )}
                placeholder="請輸入您的顯示名稱"
                maxLength={100}
              />
            </div>
            {errors.display_name && (
              <p className="mt-1 text-sm text-red-600">{errors.display_name}</p>
            )}
          </div>

          {/* 職務 */}
          <div>
            <label htmlFor="job_title" className="block text-sm font-medium text-gray-700 mb-2">
              職務
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BriefcaseIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="job_title"
                value={formData.job_title}
                onChange={(e) => handleInputChange('job_title', e.target.value)}
                className={cn(
                  "block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors",
                  errors.job_title
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 bg-white hover:border-gray-400"
                )}
                placeholder="請輸入您的職務"
                maxLength={100}
              />
            </div>
            {errors.job_title && (
              <p className="mt-1 text-sm text-red-600">{errors.job_title}</p>
            )}
          </div>

          {/* 聯絡電話 */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              聯絡電話
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={cn(
                  "block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors",
                  errors.phone
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 bg-white hover:border-gray-400"
                )}
                placeholder="請輸入您的聯絡電話"
                maxLength={20}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* 儲存按鈕 */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                saving
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:bg-blue-800"
              )}
            >
              {saving ? '儲存中...' : '儲存變更'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;