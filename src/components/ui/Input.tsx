/**
 * 輸入框組件
 * Created: 2024-12-28
 */

import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

/**
 * 輸入框組件屬性介面
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * 通用輸入框組件
 * 支援標籤、錯誤訊息、輔助文字和圖示
 */
export const Input = forwardRef<HTMLInputElement, InputProps>((
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    className,
    id,
    ...props
  },
  ref
) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseStyles = 'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm';
  const errorStyles = 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500';
  const iconPadding = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';
  
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">
              {leftIcon}
            </div>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={cn(
            baseStyles,
            iconPadding,
            error ? errorStyles : '',
            className
          )}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">
              {rightIcon}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';