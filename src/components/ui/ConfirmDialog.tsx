/**
 * 確認對話框組件
 * Created: 2024-12-28
 */

import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Modal } from './Modal';
import { Button } from './Button';

/**
 * 確認對話框組件屬性介面
 */
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

/**
 * 確認對話框組件
 * 用於重要操作的確認提示，支援不同的變體樣式
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = '確認操作',
  message = '您確定要執行此操作嗎？',
  confirmText = '確認',
  cancelText = '取消',
  variant = 'warning',
  loading = false
}: ConfirmDialogProps): JSX.Element {
  /**
   * 處理確認操作
   */
  const handleConfirm = () => {
    onConfirm();
  };

  /**
   * 獲取圖示顏色樣式
   */
  const getIconColorClass = () => {
    switch (variant) {
      case 'danger':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-yellow-600';
    }
  };

  /**
   * 獲取確認按鈕變體
   */
  const getConfirmButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'danger';
      case 'warning':
        return 'primary';
      case 'info':
        return 'primary';
      default:
        return 'primary';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      closeOnOverlayClick={!loading}
    >
      <div className="sm:flex sm:items-start">
        <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-${variant === 'danger' ? 'red' : variant === 'info' ? 'blue' : 'yellow'}-100 sm:mx-0 sm:h-10 sm:w-10`}>
          <ExclamationTriangleIcon
            className={`h-6 w-6 ${getIconColorClass()}`}
            aria-hidden="true"
          />
        </div>
        
        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            {title}
          </h3>
          
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {message}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <Button
          variant={getConfirmButtonVariant()}
          onClick={handleConfirm}
          loading={loading}
          disabled={loading}
          className="w-full sm:ml-3 sm:w-auto"
        >
          {confirmText}
        </Button>
        
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
          className="mt-3 w-full sm:mt-0 sm:w-auto"
        >
          {cancelText}
        </Button>
      </div>
    </Modal>
  );
}