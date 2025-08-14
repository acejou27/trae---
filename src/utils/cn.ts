/**
 * 樣式合併工具函數
 * Created: 2024-12-28
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合併 Tailwind CSS 類名的工具函數
 * 使用 clsx 處理條件類名，使用 tailwind-merge 處理衝突的 Tailwind 類名
 * 
 * @param inputs - 類名輸入，可以是字串、物件、陣列等
 * @returns 合併後的類名字串
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}