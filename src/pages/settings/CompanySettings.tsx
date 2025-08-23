/**
 * 公司設定頁面組件
 * Created: 2024-12-28
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  BuildingOfficeIcon,
  PhotoIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

/**
 * 公司設定介面
 */
interface CompanySettings {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  logo: string | null;
  stamp?: string; // 報價章圖片
}

/**
 * 預設公司設定
 */
const defaultSettings: CompanySettings = {
  companyName: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  taxId: '',
  logo: null,
  stamp: undefined
};

/**
 * 公司設定頁面組件
 */
export function CompanySettings(): JSX.Element {
  const [settings, setSettings] = useState<CompanySettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 載入公司設定
   */
  useEffect(() => {
    const savedSettings = localStorage.getItem('companySettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('載入公司設定失敗:', error);
      }
    }
  }, []);

  /**
   * 處理表單輸入變更
   */
  const handleInputChange = (field: keyof CompanySettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * 處理logo上傳
   */
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 檢查檔案類型
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: '請選擇圖片檔案' });
      return;
    }

    // 檢查檔案大小 (限制為 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: '圖片檔案大小不能超過 2MB' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSettings(prev => ({
        ...prev,
        logo: result
      }));
      setMessage({ type: 'success', text: 'Logo上傳成功' });
    };
    reader.onerror = () => {
      setMessage({ type: 'error', text: 'Logo上傳失敗' });
    };
    reader.readAsDataURL(file);
  };

  /**
   * 移除logo
   */
  const handleRemoveLogo = () => {
    setSettings(prev => ({
      ...prev,
      logo: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * 儲存設定
   */
  const handleSave = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem('companySettings', JSON.stringify(settings));
      setMessage({ type: 'success', text: '公司設定已儲存' });
    } catch (error) {
      console.error('儲存設定失敗:', error);
      setMessage({ type: 'error', text: '儲存設定失敗' });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 重設設定
   */
  const handleReset = () => {
    if (window.confirm('確定要重設所有設定嗎？此操作無法復原。')) {
      setSettings(defaultSettings);
      localStorage.removeItem('companySettings');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setMessage({ type: 'success', text: '設定已重設' });
    }
  };

  // 自動清除訊息
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <BuildingOfficeIcon className="h-8 w-8 mr-3 text-blue-600" />
          公司設定
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          設定公司基本資訊和Logo，這些資訊將顯示在報價單上
        </p>
      </div>

      {/* 訊息提示 */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 公司資訊表單 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">基本資訊</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                公司名稱 *
              </label>
              <input
                type="text"
                id="companyName"
                value={settings.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="請輸入公司名稱"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                公司地址
              </label>
              <textarea
                id="address"
                rows={3}
                value={settings.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="請輸入公司地址"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  聯絡電話
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="02-1234-5678"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  電子郵件
                </label>
                <input
                  type="email"
                  id="email"
                  value={settings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="company@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  公司網站
                </label>
                <input
                  type="url"
                  id="website"
                  value={settings.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://www.example.com"
                />
              </div>

              <div>
                <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
                  統一編號
                </label>
                <input
                  type="text"
                  id="taxId"
                  value={settings.taxId}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="12345678"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logo和報價章設定 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">公司Logo和報價章</h2>
          
          <div className="space-y-4">
            {/* Logo預覽 */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {settings.logo ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <img
                      src={settings.logo}
                      alt="公司Logo"
                      className="object-contain border border-gray-200 rounded"
                      style={{ width: '120px', height: '120px' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">預覽尺寸：120 x 120 像素</p>
                  <button
                    onClick={handleRemoveLogo}
                    className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    移除Logo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-30 h-30 border-2 border-dashed border-gray-300 rounded flex items-center justify-center" style={{ width: '120px', height: '120px' }}>
                      <PhotoIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">點擊上傳公司Logo</p>
                    <p className="text-xs text-gray-500 mt-1">
                      建議尺寸：120 x 120 像素<br/>
                      支援 JPG、PNG 格式，檔案大小不超過 2MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 上傳按鈕 */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                <PhotoIcon className="h-5 w-5 mr-2" />
                {settings.logo ? '更換Logo' : '上傳Logo'}
              </label>
            </div>
          </div>
          
          {/* 報價章設定 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-md font-medium text-gray-900 mb-4">報價章</h3>
            
            <div className="space-y-4">
              {/* 報價章預覽 */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {settings.stamp ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <img
                        src={settings.stamp}
                        alt="報價章"
                        className="object-contain border border-gray-200 rounded"
                        style={{ width: '80px', height: '80px' }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">預覽尺寸：80 x 80 像素</p>
                    <button
                      onClick={() => {
                        setSettings(prev => ({ ...prev, stamp: undefined }));
                      }}
                      className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      移除報價章
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                        <PhotoIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">點擊上傳報價章</p>
                      <p className="text-xs text-gray-500 mt-1">
                        建議尺寸：80 x 80 像素<br/>
                        支援 JPG、PNG 格式，檔案大小不超過 2MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 上傳按鈕 */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) {
                        setMessage({ type: 'error', text: '檔案大小不能超過 2MB' });
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setSettings(prev => ({
                          ...prev,
                          stamp: event.target?.result as string
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  id="stamp-upload"
                />
                <label
                  htmlFor="stamp-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <PhotoIcon className="h-5 w-5 mr-2" />
                  {settings.stamp ? '更換報價章' : '上傳報價章'}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleReset}
          className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          重設
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading || !settings.companyName.trim()}
          className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '儲存中...' : '儲存設定'}
        </button>
      </div>
    </div>
  );
}