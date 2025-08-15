/**
 * 報價單系統核心類型定義
 * Created: 2024-12-28
 */

// 使用者相關類型
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

// 客戶相關類型
export interface Customer {
  id: string;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  created_at: string;
  updated_at: string;
}

// 產品相關類型
export interface Product {
  id: string;
  name: string;
  description?: string;
  unit: string;
  default_price: number;
  created_at: string;
  updated_at: string;
}

// 專案負責人類型
export interface Staff {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  title: string;
  created_at: string;
  updated_at: string;
}

// 銀行資料類型
export interface Bank {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  branch_name?: string;
  swift_code?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 報價單項目類型
export interface QuoteItem {
  id: string;
  quote_id: string;
  product_id?: string;
  product_name: string;
  description?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  amount: number;
  sort_order: number;
}

// 報價單類型
export interface Quote {
  id: string;
  customer_id: string;
  staff_id: string;
  bank_id: string;
  quote_number: string;
  contact_person: string;
  quote_date: string;
  valid_until: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
  // 關聯資料
  customer?: Customer;
  staff?: Staff;
  bank?: Bank;
  items?: QuoteItem[];
}

// 表單相關類型
export interface QuoteFormData {
  customer_id: string;
  contact_person: string;
  quote_date: string;
  valid_until: string;
  staff_id: string;
  bank_id: string;
  tax_rate: number;
  notes?: string;
  items: Omit<QuoteItem, 'id' | 'quote_id'>[];
}

// API 回應類型
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// 查詢參數類型
export interface QuoteQueryParams {
  page?: number;
  limit?: number;
  customer_id?: string;
  status?: Quote['status'];
  date_from?: string;
  date_to?: string;
}

// 統計資料類型
export interface DashboardStats {
  total_quotes: number;
  draft_quotes: number;
  sent_quotes: number;
  accepted_quotes: number;
  rejected_quotes: number;
  total_amount: number;
  monthly_amount: number;
}