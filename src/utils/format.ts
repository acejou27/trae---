/**
 * 格式化工具函數
 * Created: 2024-12-28
 */

/**
 * 格式化貨幣金額
 * @param amount - 金額數字
 * @param currency - 貨幣符號，預設為 'TWD'
 * @returns 格式化後的貨幣字串
 */
export function formatCurrency(amount: number, currency: string = 'TWD'): string {
  if (currency === 'TWD') {
    return `NT$ ${amount.toLocaleString('zh-TW')}`;
  }
  
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * 格式化日期
 * @param date - 日期物件或日期字串
 * @param format - 格式類型
 * @returns 格式化後的日期字串
 */
export function formatDate(date: Date | string, format: 'short' | 'long' | 'iso' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '無效日期';
  }
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    case 'long':
      return dateObj.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    case 'iso':
      return dateObj.toISOString().split('T')[0];
    default:
      return dateObj.toLocaleDateString('zh-TW');
  }
}

/**
 * 格式化數字
 * @param number - 數字
 * @param decimals - 小數位數，預設為 0
 * @returns 格式化後的數字字串
 */
export function formatNumber(number: number, decimals: number = 0): string {
  return number.toLocaleString('zh-TW', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * 格式化百分比
 * @param value - 數值（0-1 之間）
 * @param decimals - 小數位數，預設為 1
 * @returns 格式化後的百分比字串
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return (value * 100).toFixed(decimals) + '%';
}

/**
 * 格式化電話號碼
 * @param phone - 電話號碼字串
 * @returns 格式化後的電話號碼
 */
export function formatPhone(phone: string): string {
  // 移除所有非數字字符
  const cleaned = phone.replace(/\D/g, '');
  
  // 台灣手機號碼格式 (09XX-XXX-XXX)
  if (cleaned.length === 10 && cleaned.startsWith('09')) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  // 台灣市話格式 (0X-XXXX-XXXX)
  if (cleaned.length === 9 || cleaned.length === 10) {
    if (cleaned.length === 9) {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    } else {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
  }
  
  return phone; // 如果格式不符合，返回原始字串
}

/**
 * 格式化統一編號
 * @param taxId - 統一編號字串
 * @returns 格式化後的統一編號
 */
export function formatTaxId(taxId: string): string {
  const cleaned = taxId.replace(/\D/g, '');
  
  if (cleaned.length === 8) {
    return cleaned;
  }
  
  return taxId;
}

/**
 * 截斷文字並添加省略號
 * @param text - 原始文字
 * @param maxLength - 最大長度
 * @returns 截斷後的文字
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.slice(0, maxLength) + '...';
}

/**
 * 生成報價單號碼
 * @returns 格式化的報價單號碼 (Q + YYYYMMDD + 4位數序號)
 */
export function generateQuoteNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  
  return `Q${year}${month}${day}${random}`;
}