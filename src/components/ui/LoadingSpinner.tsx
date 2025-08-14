/**
 * 載入指示器組件
 * Created: 2024-12-28
 */

import React from 'react';
import { cn } from '../../utils/cn';

/**
 * 載入指示器大小類型
 */
type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * 載入指示器組件屬性介面
 */
interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
  text?: string;
  overlay?: boolean;
}

/**
 * 載入指示器大小樣式映射
 */
const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

/**
 * 載入指示器組件
 * 提供不同大小的載入動畫，支援覆蓋層模式
 */
export function LoadingSpinner({
  size = 'md',
  className,
  text,
  overlay = false
}: LoadingSpinnerProps): JSX.Element {
  const spinner = (
    <div className={cn('flex items-center justify-center', overlay && 'flex-col')}>
      <svg
        className={cn(
          'animate-spin text-blue-600',
          sizeStyles[size],
          className
        )}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      
      {text && (
        <p className={cn(
          'text-gray-600',
          overlay ? 'mt-2 text-sm' : 'ml-2 text-sm'
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75">
        {spinner}
      </div>
    );
  }

  return spinner;
}

/**
 * 頁面載入指示器組件
 * 用於整個頁面的載入狀態
 */
export function PageLoadingSpinner({ text = '載入中...' }: { text?: string }): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

/**
 * 內容載入指示器組件
 * 用於內容區域的載入狀態
 */
export function ContentLoadingSpinner({ text = '載入中...' }: { text?: string }): JSX.Element {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner size="md" text={text} />
    </div>
  );
}