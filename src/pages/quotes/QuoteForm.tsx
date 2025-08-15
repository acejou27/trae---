/**
 * 報價單表單組件
 * Created: 2024-12-28
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useQuoteStore } from '../../stores/useQuoteStore';
import { generateQuoteNumber } from '../../utils/format';
import type { QuoteFormData } from '../../types';

/**
 * 報價單表單驗證 Schema
 */
const quoteFormSchema = z.object({
  customer_id: z.string().min(1, '請選擇客戶'),
  contact_person: z.string().min(1, '請輸入聯絡人'),
  quote_date: z.string().min(1, '請選擇報價日期'),
  valid_until: z.string().min(1, '請選擇有效期限'),
  staff_id: z.string().min(1, '請選擇負責人'),
  bank_id: z.string().min(1, '請選擇銀行資料'),
  tax_rate: z.number().min(0).max(100, '稅率必須在0-100之間'),
  notes: z.string().optional(),
  items: z.array(z.object({
    product_name: z.string().min(1, '請輸入產品名稱'),
    description: z.string().optional(),
    quantity: z.number().min(0.01, '數量必須大於0'),
    unit: z.string().min(1, '請輸入單位'),
    unit_price: z.number().min(0, '單價不能為負數'),
    amount: z.number().min(0, '金額不能為負數'),
    sort_order: z.number()
  })).min(1, '至少需要一個項目')
});

/**
 * 報價單表單組件
 * 用於建立和編輯報價單
 */
export function QuoteForm(): JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  
  const {
    currentQuote,
    customers,
    products,
    staff,
    banks,

    fetchQuotes,
    fetchQuoteById,
    createQuote,
    updateQuote,
    fetchCustomers,
    fetchProducts,
    fetchStaff,
    fetchBanks,
    fetchQuoteItems,

    clearCurrentQuote
  } = useQuoteStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 表單設定
   */
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      customer_id: '',
      contact_person: '',
      quote_date: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      staff_id: '',
      bank_id: '',
      tax_rate: 5,
      notes: '',
      items: [{
        product_name: '',
        description: '',
        quantity: 1,
        unit: '個',
        unit_price: 0,
        amount: 0,
        sort_order: 0
      }]
    }
  });

  /**
   * 項目陣列管理
   */
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  /**
   * 監聽表單變化以計算金額
   */
  const watchedItems = watch('items');
  const watchedTaxRate = watch('tax_rate');

  /**
   * 計算小計、稅額和總計
   */
  const subtotal = watchedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const taxAmount = subtotal * (watchedTaxRate / 100);
  const total = subtotal + taxAmount;

  /**
   * 載入基礎資料和編輯資料
   */
  useEffect(() => {
    // 載入基礎資料
    fetchCustomers();
    fetchProducts();
    fetchStaff();
    fetchBanks();
    
    if (isEditing && id) {
      // 載入報價單資料
      fetchQuoteById(id).then(async () => {
        if (currentQuote && currentQuote.id === id) {
          // 填入表單資料
          setValue('customer_id', currentQuote.customer_id);
          setValue('contact_person', currentQuote.contact_person);
          setValue('quote_date', currentQuote.quote_date);
          setValue('valid_until', currentQuote.valid_until);
          setValue('staff_id', currentQuote.staff_id);
          setValue('bank_id', currentQuote.bank_id);
          setValue('tax_rate', currentQuote.tax_rate);
          setValue('notes', currentQuote.notes || '');
          
          // 載入並填入項目資料
          try {
            const items = await fetchQuoteItems(id);
            if (items && items.length > 0) {
              setValue('items', items.map(item => ({
                product_name: item.product_name,
                description: item.description || '',
                quantity: item.quantity,
                unit: item.unit,
                unit_price: item.unit_price,
                amount: item.amount,
                sort_order: item.sort_order
              })));
            }
          } catch (error) {
            console.error('載入報價單項目失敗:', error);
          }
        }
      });
    }
    
    return () => {
      if (!isEditing) {
        clearCurrentQuote();
      }
    };
  }, [isEditing, id, fetchCustomers, fetchProducts, fetchStaff, fetchBanks, fetchQuoteById, fetchQuoteItems, currentQuote, setValue, clearCurrentQuote]);

  /**
   * 計算項目金額
   * @param index - 項目索引
   */
  const calculateItemAmount = (index: number): void => {
    const item = watchedItems[index];
    if (item) {
      const amount = (item.quantity || 0) * (item.unit_price || 0);
      setValue(`items.${index}.amount`, amount);
    }
  };

  /**
   * 新增項目
   */
  const addItem = (): void => {
    append({
      product_name: '',
      description: '',
      quantity: 1,
      unit: '個',
      unit_price: 0,
      amount: 0,
      sort_order: fields.length
    });
  };

  /**
   * 從產品選擇填入項目資料
   * @param index - 項目索引
   * @param productId - 產品ID
   */
  const selectProduct = (index: number, productId: string): void => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setValue(`items.${index}.product_name`, product.name);
      setValue(`items.${index}.description`, product.description || '');
      setValue(`items.${index}.unit`, product.unit);
      setValue(`items.${index}.unit_price`, product.default_price);
      calculateItemAmount(index);
    }
  };

  /**
   * 提交表單
   * @param data - 表單資料
   */
  const onSubmit = async (data: QuoteFormData): Promise<void> => {
    setIsSubmitting(true);
    
    try {
      // 計算金額
      const subtotal = data.items.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = subtotal * (data.tax_rate / 100);
      const total = subtotal + taxAmount;
      
      const quoteData = {
          customer_id: data.customer_id,
          contact_person: data.contact_person,
          quote_date: data.quote_date,
          valid_until: data.valid_until,
          staff_id: data.staff_id,
          bank_id: data.bank_id,
          tax_rate: data.tax_rate,
          notes: data.notes || '',
          quote_number: generateQuoteNumber(),
          subtotal,
          tax_amount: taxAmount,
          total,
          status: 'draft' as const
        };
      
      if (isEditing && id) {
        // 更新現有報價單
        await updateQuote(id, quoteData);
      } else {
        // 建立新報價單
        await createQuote(quoteData);
      }
      
      navigate('/quotes');
    } catch (error) {
      console.error('提交失敗:', error);
      alert('提交失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/quotes')}
          className="text-gray-400 hover:text-gray-500"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? '編輯報價單' : '建立報價單'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEditing ? '修改報價單資訊' : '填寫報價單詳細資訊'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 基本資訊 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">基本資訊</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* 客戶選擇 */}
            <div>
              <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700">
                客戶 *
              </label>
              <select
                {...register('customer_id')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">請選擇客戶</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.company_name}
                  </option>
                ))}
              </select>
              {errors.customer_id && (
                <p className="mt-1 text-sm text-red-600">{errors.customer_id.message}</p>
              )}
            </div>

            {/* 聯絡人 */}
            <div>
              <label htmlFor="contact_person" className="block text-sm font-medium text-gray-700">
                聯絡人 *
              </label>
              <input
                type="text"
                {...register('contact_person')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.contact_person && (
                <p className="mt-1 text-sm text-red-600">{errors.contact_person.message}</p>
              )}
            </div>

            {/* 報價日期 */}
            <div>
              <label htmlFor="quote_date" className="block text-sm font-medium text-gray-700">
                報價日期 *
              </label>
              <input
                type="date"
                {...register('quote_date')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.quote_date && (
                <p className="mt-1 text-sm text-red-600">{errors.quote_date.message}</p>
              )}
            </div>

            {/* 有效期限 */}
            <div>
              <label htmlFor="valid_until" className="block text-sm font-medium text-gray-700">
                有效期限 *
              </label>
              <input
                type="date"
                {...register('valid_until')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.valid_until && (
                <p className="mt-1 text-sm text-red-600">{errors.valid_until.message}</p>
              )}
            </div>

            {/* 負責人 */}
            <div>
              <label htmlFor="staff_id" className="block text-sm font-medium text-gray-700">
                負責人 *
              </label>
              <select
                {...register('staff_id')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">請選擇負責人</option>
                {staff.map(person => (
                  <option key={person.id} value={person.id}>
                    {person.name} {person.title && `(${person.title})`}
                  </option>
                ))}
              </select>
              {errors.staff_id && (
                <p className="mt-1 text-sm text-red-600">{errors.staff_id.message}</p>
              )}
            </div>

            {/* 銀行資料 */}
            <div>
              <label htmlFor="bank_id" className="block text-sm font-medium text-gray-700">
                銀行資料 *
              </label>
              <select
                {...register('bank_id')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">請選擇銀行資料</option>
                {banks.map(bank => (
                  <option key={bank.id} value={bank.id}>
                    {bank.bank_name} - {bank.account_number}
                  </option>
                ))}
              </select>
              {errors.bank_id && (
                <p className="mt-1 text-sm text-red-600">{errors.bank_id.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* 報價項目 */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">報價項目</h2>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" />
              新增項目
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                  {/* 產品選擇 */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      產品
                    </label>
                    <select
                      onChange={(e) => selectProduct(index, e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">選擇產品或手動輸入</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 產品名稱 */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      產品名稱 *
                    </label>
                    <input
                      type="text"
                      {...register(`items.${index}.product_name`)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* 數量 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      數量 *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.quantity`, { 
                        valueAsNumber: true,
                        onChange: () => calculateItemAmount(index)
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* 單位 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      單位 *
                    </label>
                    <input
                      type="text"
                      {...register(`items.${index}.unit`)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* 單價 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      單價 *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.unit_price`, { 
                        valueAsNumber: true,
                        onChange: () => calculateItemAmount(index)
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* 金額 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      金額
                    </label>
                    <input
                      type="number"
                      {...register(`items.${index}.amount`, { valueAsNumber: true })}
                      readOnly
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500"
                    />
                  </div>

                  {/* 說明 */}
                  <div className="sm:col-span-5">
                    <label className="block text-sm font-medium text-gray-700">
                      說明
                    </label>
                    <input
                      type="text"
                      {...register(`items.${index}.description`)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* 刪除按鈕 */}
                  <div className="flex items-end">
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-400 hover:text-red-500"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 金額計算 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">金額計算</h2>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="tax_rate" className="block text-sm font-medium text-gray-700">
                稅率 (%)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('tax_rate', { valueAsNumber: true })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">小計:</span>
                <span className="text-sm font-medium">NT$ {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">稅額:</span>
                <span className="text-sm font-medium">NT$ {taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-base font-medium text-gray-900">總計:</span>
                <span className="text-base font-bold text-gray-900">NT$ {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 備註 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">備註</h2>
          <textarea
            {...register('notes')}
            rows={4}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="輸入備註資訊..."
          />
        </div>

        {/* 提交按鈕 */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/quotes')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? '處理中...' : (isEditing ? '更新' : '建立')}
          </button>
        </div>
      </form>
    </div>
  );
}