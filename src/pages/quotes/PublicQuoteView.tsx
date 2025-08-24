/**
 * 公開報價單查看組件
 * 不需要登入即可查看報價單內容
 * Created: 2024-12-28
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DocumentTextIcon, PrinterIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import type { Quote } from '../../types';
import { supabase } from '../../services/supabase';

/**
 * 公司設定介面
 */
interface CompanySettings {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  logo: string;
  stamp: string;
}

/**
 * 銀行設定介面
 */
interface BankSettings {
  bankbookImage: string;
}

/**
 * 公開報價單查看組件
 */
export function PublicQuoteView(): JSX.Element {
  const { shareId } = useParams<{ shareId: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: '您的公司名稱',
    address: '',
    phone: '',
    email: '',
    website: '',
    taxId: '',
    logo: '',
    stamp: ''
  });
  const [bankSettings, setBankSettings] = useState<BankSettings>({
    bankbookImage: ''
  });

  /**
   * 載入公開報價單資料
   */
  useEffect(() => {
    const loadPublicQuote = async () => {
      if (!shareId) {
        setError('無效的分享連結');
        setLoading(false);
        return;
      }

      try {
        console.log('載入公開報價單:', shareId);
        
        // 查詢公開分享的報價單
        const { data: shareData, error: shareError } = await supabase
          .from('quote_shares')
          .select(`
            id,
            quote_id,
            is_active,
            expires_at,
            quotes (
              id,
              quote_number,
              quote_date,
              valid_until,
              contact_person,
              status,
              notes,
              customer_id,
              customers (
                id,
                company_name,
                contact_person,
                phone,
                email,
                address
              )
            )
          `)
          .eq('share_id', shareId)
          .eq('is_active', true)
          .single();

        if (shareError) {
          console.error('載入分享報價單失敗:', shareError);
          setError('找不到分享的報價單或連結已失效');
          setLoading(false);
          return;
        }

        // 檢查是否過期
        if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
          setError('分享連結已過期');
          setLoading(false);
          return;
        }

        const quoteData = shareData.quotes as any;
        if (!quoteData) {
          setError('報價單資料不存在');
          setLoading(false);
          return;
        }

        // 載入報價單項目
        const { data: itemsData, error: itemsError } = await supabase
          .from('quote_items')
          .select(`
            id,
            product_name,
            description,
            quantity,
            unit,
            unit_price
          `)
          .eq('quote_id', quoteData.id)
          .order('created_at');

        if (itemsError) {
          console.error('載入報價單項目失敗:', itemsError);
        }

        // 組合完整的報價單資料
        const fullQuote: Quote = {
          ...quoteData,
          customer: quoteData.customers,
          items: (itemsData || []).map((item: any) => ({
            ...item,
            quote_id: quoteData.id,
            amount: item.quantity * item.unit_price,
            sort_order: 0
          }))
        } as Quote;

        setQuote(fullQuote);
        console.log('公開報價單載入成功:', fullQuote);
        
      } catch (error) {
        console.error('載入公開報價單失敗:', error);
        setError('載入報價單失敗，請稍後再試');
      } finally {
        setLoading(false);
      }
    };

    loadPublicQuote();
  }, [shareId]);

  /**
   * 載入公司設定
   */
  useEffect(() => {
    // 從報價單的用戶設定中載入公司資訊
    // 這裡可以根據報價單的創建者來載入對應的公司設定
    // 暫時使用預設設定
    const defaultSettings = {
      companyName: '報價單系統',
      address: '',
      phone: '',
      email: '',
      website: '',
      taxId: '',
      logo: '',
      stamp: ''
    };
    setCompanySettings(defaultSettings);
  }, [quote]);

  /**
   * 處理列印
   */
  const handlePrint = (): void => {
    window.print();
  };

  /**
   * 處理HTML匯出
   */
  const handleExportHTML = async (): Promise<void> => {
    if (!quote) return;
    
    try {
      const { exportQuoteToHTML } = await import('../../utils/htmlExport');
      await exportQuoteToHTML(quote);
      alert('HTML匯出成功！');
    } catch (error) {
      console.error('HTML匯出失敗:', error);
      alert('HTML匯出失敗，請稍後再試');
    }
  };

  /**
   * 取得狀態顯示樣式
   */
  const getStatusBadge = (status: Quote['status']): string => {
    const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium';
    
    switch (status) {
      case 'draft':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'sent':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'accepted':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  /**
   * 取得狀態顯示文字
   */
  const getStatusText = (status: Quote['status']): string => {
    switch (status) {
      case 'draft': return '草稿';
      case 'sent': return '已發送';
      case 'accepted': return '已接受';
      case 'rejected': return '已拒絕';
      default: return '未知';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">載入中...</span>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {error || '找不到報價單'}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            請檢查分享連結是否正確或聯繫報價單提供者
          </p>
        </div>
      </div>
    );
  }

  // 計算金額
  const items = quote.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const taxRate = 0.05; // 5% 稅率
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 頁面標題和操作按鈕 */}
        <div className="mb-6 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-4">
            <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">報價單查看</h1>
              <p className="text-sm text-gray-500">公開分享的報價單</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <PrinterIcon className="-ml-0.5 mr-2 h-4 w-4" />
              列印
            </button>
            <button
              onClick={handleExportHTML}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <DocumentArrowDownIcon className="-ml-0.5 mr-2 h-4 w-4" />
              匯出HTML
            </button>
          </div>
        </div>

        {/* 報價單內容 */}
        <div id="quote-preview" className="bg-white shadow overflow-hidden sm:rounded-lg print:shadow-none">
          <div className="px-6 py-8">
            {/* 公司標題 */}
            <div className="text-center mb-8">
              {/* 公司Logo */}
              <div className="flex justify-center mb-4">
                {companySettings.logo ? (
                  <img 
                    src={companySettings.logo} 
                    alt="公司Logo" 
                    className="w-24 h-24 object-contain"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">報價單</h1>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">{companySettings.companyName}</h2>
              
              {/* 公司資訊 */}
              <div className="text-sm text-gray-600 space-y-1">
                {companySettings.address && (
                  <div>{companySettings.address}</div>
                )}
                <div className="flex justify-center space-x-4">
                  {companySettings.phone && (
                    <span>電話: {companySettings.phone}</span>
                  )}
                  {companySettings.email && (
                    <span>Email: {companySettings.email}</span>
                  )}
                </div>
                {companySettings.taxId && (
                  <div>統一編號: {companySettings.taxId}</div>
                )}
              </div>
            </div>

            {/* 報價單資訊 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  報價單資訊
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">報價單號:</span>
                    <span className="ml-2 text-sm text-gray-900">{quote.quote_number}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">報價日期:</span>
                    <span className="ml-2 text-sm text-gray-900">
                      {new Date(quote.quote_date).toLocaleDateString('zh-TW')}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">有效期限:</span>
                    <span className="ml-2 text-sm text-gray-900">
                      {new Date(quote.valid_until).toLocaleDateString('zh-TW')}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">負責人:</span>
                    <span className="ml-2 text-sm text-gray-900">{quote.contact_person}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">狀態:</span>
                    <span className={`ml-2 ${getStatusBadge(quote.status)}`}>
                      {getStatusText(quote.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 客戶資訊 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  客戶資訊
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">公司名稱:</span>
                    <span className="ml-2 text-sm text-gray-900">
                      {quote.customer?.company_name || '未提供'}
                    </span>
                  </div>
                  {quote.customer?.contact_person && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">聯絡人:</span>
                      <span className="ml-2 text-sm text-gray-900">{quote.customer.contact_person}</span>
                    </div>
                  )}
                  {quote.customer?.phone && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">電話:</span>
                      <span className="ml-2 text-sm text-gray-900">{quote.customer.phone}</span>
                    </div>
                  )}
                  {quote.customer?.email && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">電子郵件:</span>
                      <span className="ml-2 text-sm text-gray-900">{quote.customer.email}</span>
                    </div>
                  )}
                  {quote.customer?.address && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">地址:</span>
                      <span className="ml-2 text-sm text-gray-900">{quote.customer.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 報價項目表格 */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">報價項目</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        項目名稱
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        說明
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        數量
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        單位
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        單價
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        小計
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.length > 0 ? (
                      items.map((item, index) => (
                        <tr key={item.id || index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.product_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.description || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.unit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            NT$ {item.unit_price.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            NT$ {(item.quantity * item.unit_price).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          無項目資料
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 報價章和金額計算 */}
            <div className="flex justify-between items-start mb-8">
              {/* 報價章 */}
              <div className="flex-shrink-0">
                <div className="text-center">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">報價章</h4>
                  {companySettings.stamp ? (
                    <img 
                      src={companySettings.stamp} 
                      alt="報價章" 
                      className="w-24 h-24 object-contain mx-auto"
                    />
                  ) : (
                    <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-gray-400">報價章</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 金額計算 */}
              <div className="w-64">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">小計:</span>
                    <span className="font-medium">NT$ {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">稅額 (5%):</span>
                    <span className="font-medium">NT$ {tax.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900">總計:</span>
                      <span className="text-blue-600">NT$ {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 銀行帳戶資訊 */}
            {bankSettings.bankbookImage && (
              <div className="mb-8">
                <h4 className="text-sm font-medium text-gray-900 mb-2">銀行帳戶資訊</h4>
                <img 
                  src={bankSettings.bankbookImage} 
                  alt="銀行帳戶資訊" 
                  className="max-w-md h-auto"
                />
              </div>
            )}

            {/* 備註 */}
            {quote.notes && (
              <div className="mb-8">
                <h4 className="text-sm font-medium text-gray-900 mb-2">備註</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}