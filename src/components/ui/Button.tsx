/**
 * 按鈕組件
 * Created: 2024-12-28
 */

import React from 'react';
import { cn } from '../../utils/cn';

/**
 * 按鈕變體類型
 */
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';

/**
 * 按鈕大小類型
 */
type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * 按鈕組件屬性介面
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

/**
 * 按鈕變體樣式映射
 */
const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  outline: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500',
  ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
};

/**
 * 按鈕大小樣式映射
 */
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
};

/**
 * 通用按鈕組件
 * 提供多種變體和大小選擇，支援載入狀態
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps): JSX.Element {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
  
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  
  const isDisabled = disabled || loading;
  
  return (
    <button
      className={cn(
        baseStyles,
        variantStyle,
        sizeStyle,
        isDisabled && 'opacity-50 cursor-not-allowed',
        variant === 'outline' && 'border',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
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
      )}
      {children}
    </button>
  );
}