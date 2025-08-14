/**
 * 驗證工具函數
 * Created: 2024-12-28
 */

/**
 * 驗證電子郵件格式
 * @param email - 電子郵件字串
 * @returns 是否為有效的電子郵件格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 驗證台灣手機號碼格式
 * @param phone - 手機號碼字串
 * @returns 是否為有效的台灣手機號碼
 */
export function isValidTaiwanMobile(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  const mobileRegex = /^09\d{8}$/;
  return mobileRegex.test(cleaned);
}

/**
 * 驗證台灣市話號碼格式
 * @param phone - 市話號碼字串
 * @returns 是否為有效的台灣市話號碼
 */
export function isValidTaiwanLandline(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // 台灣市話格式：區碼(2-3碼) + 號碼(6-8碼)
  const landlineRegex = /^0[2-8]\d{7,8}$/;
  return landlineRegex.test(cleaned);
}

/**
 * 驗證台灣統一編號
 * @param taxId - 統一編號字串
 * @returns 是否為有效的統一編號
 */
export function isValidTaiwanTaxId(taxId: string): boolean {
  const cleaned = taxId.replace(/\D/g, '');
  
  if (cleaned.length !== 8) {
    return false;
  }
  
  // 統一編號檢查碼驗證
  const weights = [1, 2, 1, 2, 1, 2, 4, 1];
  let sum = 0;
  
  for (let i = 0; i < 8; i++) {
    const digit = parseInt(cleaned[i]);
    let product = digit * weights[i];
    
    if (product >= 10) {
      product = Math.floor(product / 10) + (product % 10);
    }
    
    sum += product;
  }
  
  return sum % 10 === 0;
}

/**
 * 驗證密碼強度
 * @param password - 密碼字串
 * @returns 密碼強度等級和訊息
 */
export function validatePasswordStrength(password: string): {
  strength: 'weak' | 'medium' | 'strong';
  message: string;
  isValid: boolean;
} {
  if (password.length < 8) {
    return {
      strength: 'weak',
      message: '密碼長度至少需要 8 個字符',
      isValid: false
    };
  }
  
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const criteriaCount = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
  
  if (criteriaCount < 2) {
    return {
      strength: 'weak',
      message: '密碼需要包含至少兩種類型的字符（大寫字母、小寫字母、數字、特殊字符）',
      isValid: false
    };
  }
  
  if (criteriaCount === 2) {
    return {
      strength: 'medium',
      message: '密碼強度中等',
      isValid: true
    };
  }
  
  return {
    strength: 'strong',
    message: '密碼強度良好',
    isValid: true
  };
}

/**
 * 驗證數字範圍
 * @param value - 數值
 * @param min - 最小值
 * @param max - 最大值
 * @returns 是否在有效範圍內
 */
export function isNumberInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * 驗證字串長度
 * @param text - 字串
 * @param minLength - 最小長度
 * @param maxLength - 最大長度
 * @returns 是否在有效長度範圍內
 */
export function isValidStringLength(text: string, minLength: number, maxLength: number): boolean {
  return text.length >= minLength && text.length <= maxLength;
}

/**
 * 驗證必填欄位
 * @param value - 值
 * @returns 是否為有效的必填值
 */
export function isRequired(value: any): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  
  return true;
}

/**
 * 驗證 URL 格式
 * @param url - URL 字串
 * @returns 是否為有效的 URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 驗證日期格式
 * @param dateString - 日期字串
 * @returns 是否為有效的日期
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * 驗證未來日期
 * @param dateString - 日期字串
 * @returns 是否為未來日期
 */
export function isFutureDate(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return date > now;
}