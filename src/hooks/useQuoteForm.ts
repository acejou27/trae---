/**
 * 報價單表單自定義 Hook
 * Created: 2024-12-28
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuoteStore } from '../stores/useQuoteStore';
import type { Quote, QuoteItem } from '../types/database';

/**
 * 報價單表單驗證 Schema
 */
const quoteFormSchema = z.object({
  customer_id: z.string().min(1, '請選擇客戶'),
  contact_person: z.string().min(1, '請輸入聯絡人'),
  staff_id: z.string().min(1, '請選擇負責人'),
  bank_id: z.string().min(1, '請選擇銀行'),
  quote_date: z.string().min(1, '請選擇報價日期'),
  valid_until: z.string().min(1, '請選擇有效期限'),
  tax_rate: z.number().min(0).max(100),
  notes: z.string().optional(),
  items: z.array(z.object({
    product_id: z.string().optional(),
    product_name: z.string().min(1, '請輸入產品名稱'),
    description: z.string().optional(),
    quantity: z.number().min(1, '數量必須大於0'),
    unit: z.string().min(1, '請輸入單位'),
    unit_price: z.number().min(0, '單價不能為負數'),
  })).min(1, '至少需要一個項目')
});

/**
 * 報價單表單資料類型
 */
export type QuoteFormData = z.infer<typeof quoteFormSchema>;

/**
 * 報價單表單 Hook 選項
 */
interface UseQuoteFormOptions {
  quoteId?: string;
  onSuccess?: (quote: Quote) => void;
  onError?: (error: string) => void;
}

/**
 * 報價單表單自定義 Hook
 * 處理報價單的建立和編輯邏輯
 */
export function useQuoteForm({ quoteId, onSuccess, onError }: UseQuoteFormOptions = {}) {
  const {
    currentQuote,
    customers,
    products,
    staff,
    banks,
    loading,
    error,
    fetchQuoteById,
    createQuote,
    updateQuote,
    fetchCustomers,
    fetchProducts,
    fetchStaff,
    fetchBanks,
    calculateQuoteSubtotal,
    calculateQuoteTax
  } = useQuoteStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items] = useState<QuoteItem[]>([]);
  
  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      customer_id: '',
      contact_person: '',
      staff_id: '',
      bank_id: '',
      quote_date: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tax_rate: 5,
      notes: '',
      items: []
    }
  });
  
  /**
   * 載入基礎資料
   */
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchCustomers(),
        fetchProducts(),
        fetchStaff(),
        fetchBanks()
      ]);
    };
    
    loadData();
  }, [fetchCustomers, fetchProducts, fetchStaff, fetchBanks]);
  
  /**
   * 載入報價單資料（編輯模式）
   */
  useEffect(() => {
    if (quoteId) {
      fetchQuoteById(quoteId);
    }
  }, [quoteId, fetchQuoteById]);
  
  /**
   * 設定表單預設值（編輯模式）
   */
  useEffect(() => {
    if (currentQuote && quoteId) {
      form.reset({
        customer_id: currentQuote.customer_id,
        staff_id: currentQuote.staff_id,
        bank_id: currentQuote.bank_id,
        quote_date: currentQuote.quote_date,
        valid_until: currentQuote.valid_until,
        tax_rate: currentQuote.tax_rate,
        notes: currentQuote.notes || '',
        contact_person: currentQuote.contact_person,
        items: items.length > 0 ? items.map(item => ({
          product_id: item.product_id,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price
        })) : [{
          product_id: '',
          description: '',
          quantity: 1,
          unit: '',
          unit_price: 0
        }]
      });
    }
  }, [currentQuote, quoteId, form, items]);
  
  /**
   * 新增報價項目
   */
  const addItem = () => {
    const currentItems = form.getValues('items');
    form.setValue('items', [
      ...currentItems,{
        product_name: '',
        description: '',
        quantity: 1,
        unit: '個',
        unit_price: 0
      }
    ]);
  };
  
  /**
   * 移除報價項目
   */
  const removeItem = (index: number) => {
    const currentItems = form.getValues('items');
    if (currentItems.length > 1) {
      form.setValue('items', currentItems.filter((_, i) => i !== index));
    }
  };
  
  /**
   * 當產品選擇改變時，自動填入產品資訊
   */
  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const currentItems = form.getValues('items');
      currentItems[index] = {
        ...currentItems[index],
        product_id: productId,
        description: product.description || product.name,
        unit: product.unit,
        unit_price: product.default_price
      };
      form.setValue('items', currentItems);
    }
  };
  
  /**
   * 計算小計
   */
  const calculateSubtotal = () => {
    const formItems = form.getValues('items');
    return calculateQuoteSubtotal(formItems.map((item, index) => ({
      id: '',
      quote_id: '',
      product_id: item.product_id,
      product_name: products.find(p => p.id === item.product_id)?.name || '',
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      amount: item.quantity * item.unit_price,
      sort_order: index + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })));
  };
  
  /**
   * 計算稅額
   */
  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const taxRate = form.getValues('tax_rate');
    return calculateQuoteTax(subtotal, taxRate);
  };
  
  /**
   * 計算總計
   */
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };
  
  /**
   * 生成報價單號
   */
  const generateQuoteNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `Q${year}${month}${day}${random}`;
  };
  
  /**
   * 提交表單
   */
  const onSubmit = async (data: QuoteFormData) => {
    setIsSubmitting(true);
    
    try {
      const subtotal = calculateSubtotal();
      const taxAmount = calculateTax();
      const totalAmount = calculateTotal();
      
      const quoteData = {
        quote_number: generateQuoteNumber(),
        customer_id: data.customer_id,
        contact_person: data.contact_person,
        staff_id: data.staff_id,
        bank_id: data.bank_id,
        status: 'draft' as const,
        quote_date: data.quote_date,
        valid_until: data.valid_until,
        subtotal,
        tax_rate: data.tax_rate,
        tax_amount: taxAmount,
        total: totalAmount,
        notes: data.notes || ''
      };
      
      if (quoteId) {
        await updateQuote(quoteId, quoteData);
      } else {
        await createQuote(quoteData);
      }
      
      onSuccess?.(currentQuote!);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '操作失敗';
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    form,
    items,
    customers,
    products,
    staff,
    banks,
    loading: loading || isSubmitting,
    error,
    isEditing: !!quoteId,
    addItem,
    removeItem,
    handleProductChange,
    calculateSubtotal,
    calculateTax,
    calculateTotal,
    generateQuoteNumber,
    onSubmit: form.handleSubmit(onSubmit)
  };
}