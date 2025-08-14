/**
 * 文字區域組件
 * Created: 2024-12-28
 */

import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

/**
 * 文字區域組件屬性介面
 */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

/**
 * 通用文字區域組件
 * 支援標籤、錯誤訊息、輔助文字和調整大小選項
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>((
  {
    label,
    error,
    helperText,
    resize = 'vertical',
    className,
    id,
    rows = 3,
    ...props
  },
  ref
) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseStyles = 'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm';
  const errorStyles = 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500';
  
  const resizeStyles = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  };
  
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={cn(
          baseStyles,
          resizeStyles[resize],
          error ? errorStyles : '',
          className
        )}
        {...props}
      />
      
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

Textarea.displayName = 'Textarea';