/**
 * 自動登出警告組件
 * 顯示登出倒數計時並允許用戶延長會話
 * Created: 2024-12-28
 */

import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface AutoLogoutWarningProps {
  isVisible: boolean;
  timeUntilLogout: number;
  onContinue: () => void;
  onLogout: () => void;
}

/**
 * 自動登出警告組件
 */
export function AutoLogoutWarning({
  isVisible,
  timeUntilLogout,
  onContinue,
  onLogout
}: AutoLogoutWarningProps): JSX.Element | null {
  if (!isVisible) {
    return null;
  }

  const minutes = Math.floor(timeUntilLogout / 60);
  const seconds = timeUntilLogout % 60;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* 背景遮罩 */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        
        {/* 對話框 */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" aria-hidden="true" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  會話即將過期
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    由於長時間無操作，您的會話即將在 
                    <span className="font-bold text-red-600">
                      {minutes > 0 && `${minutes}分`}{seconds.toString().padStart(2, '0')}秒
                    </span>
                    後自動登出。
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    如果您想繼續使用，請點擊「繼續使用」按鈕。
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onContinue}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              繼續使用
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              立即登出
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AutoLogoutWarning;