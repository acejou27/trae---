/**
 * 報價單查看組件
 * Created: 2024-12-28
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { useQuoteStore } from '../../stores/useQuoteStore';
import type { Quote } from '../../types';

// 公司設定介面
interface CompanySettings {
  companyName: string;
  logo: string;
  stamp?: string; // 報價章圖片
}

// 銀行設定介面
interface BankSettings {
  bankbookImage?: string; // 存摺圖檔
}

/**
 * 處理描述文字中的格式化
 * 將以「＊」開頭、以「：」或「:」結尾的中間字元轉為粗體
 */
const formatDescriptionText = (text: string): JSX.Element => {
  if (!text) return <span>-</span>;
  
  // 使用正則表達式匹配以「＊」開頭、以「：」或「:」結尾的文字
  // 將中間的字元轉為粗體，保留「＊」和「：」符號
  const formattedText = text.replace(/＊([^：:]*)(：|:)/g, (match, middleText, colon) => {
    return `＊<strong>${middleText}</strong>${colon}`;
  });
  
  // 將格式化後的文字轉換為 JSX
  return (
    <span 
      className="whitespace-pre-wrap"
      dangerouslySetInnerHTML={{ __html: formattedText }}
    />
  );
};

/**
 * 報價單查看組件
 * 提供報價單的詳細查看、列印和匯出功能
 */
export function QuoteView(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    quotes, 
    currentQuote,
    loading,
    error,
    fetchQuotes,
    fetchQuoteById,
    fetchQuoteItems,
    setCurrentQuote,
    clearCurrentQuote
  } = useQuoteStore();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: '您的公司名稱',
    logo: '',
    stamp: ''
  });
  const [bankSettings, setBankSettings] = useState<BankSettings>({
    bankbookImage: ''
  });

  /**
   * 載入報價單資料
   */
  useEffect(() => {
    const loadQuote = async () => {
      if (id) {
        try {
          console.log('開始載入報價單:', id);
          // 直接使用 fetchQuoteById 載入特定報價單
          await fetchQuoteById(id);
          console.log('報價單基本資料載入完成');
        } catch (error) {
          console.error('載入報價單失敗:', error);
          setQuote(null);
        }
      }
    };
    
    loadQuote();
    
    // 載入公司設定
    const savedSettings = localStorage.getItem('companySettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setCompanySettings(prev => ({
          ...prev,
          ...settings,
          // 確保logo有預設值
          logo: settings.logo || '',
          stamp: settings.stamp || ''
        }));
      } catch (error) {
        console.error('載入公司設定失敗:', error);
      }
    }
    
    // 載入銀行設定
    const savedBankSettings = localStorage.getItem('bankSettings');
    if (savedBankSettings) {
      try {
        const settings = JSON.parse(savedBankSettings);
        setBankSettings({
          bankbookImage: settings.bankbookImage || ''
        });
      } catch (error) {
        console.error('載入銀行設定失敗:', error);
      }
    }
    
    // 清理函數
    return () => {
      clearCurrentQuote();
    };
  }, [id, fetchQuoteById, clearCurrentQuote]); // 添加必要的依賴項
  
  // 監聽 currentQuote 的變化
  useEffect(() => {
    if (currentQuote && currentQuote.id === id) {
      // 載入報價單項目並合併到quote中
      const loadQuoteWithItems = async () => {
        try {
          const items = await fetchQuoteItems(id!);
          console.log('成功載入報價單項目:', items);
          setQuote({
            ...currentQuote,
            items: items || []
          });
        } catch (error) {
          console.error('載入報價單項目失敗:', error);
          // 即使載入項目失敗，也要設置基本的報價單資料
          setQuote({
            ...currentQuote,
            items: []
          });
        }
      };
      
      loadQuoteWithItems();
    }
  }, [currentQuote, id, fetchQuoteItems]);

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
   * 處理分享
   */
  const handleShare = async (): Promise<void> => {
    if (!quote) return;
    
    try {
      const { quoteShareApi } = await import('../../services/api');
      const { shareUrl } = await quoteShareApi.createShare(quote.id);
      
      // 複製分享連結到剪貼簿
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        alert(`分享連結已複製到剪貼簿！\n\n任何人都可以通過此連結查看報價單：\n${shareUrl}`);
      } else {
        // 降級處理：顯示連結讓用戶手動複製
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert(`分享連結已複製到剪貼簿！\n\n任何人都可以通過此連結查看報價單：\n${shareUrl}`);
      }
    } catch (error) {
      console.error('創建分享連結失敗:', error);
      alert('創建分享連結失敗，請稍後再試');
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
      <div className="flex justify-center items-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">載入中...</span>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">找不到報價單</h3>
        <p className="mt-1 text-sm text-gray-500">請檢查報價單編號是否正確</p>
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-md">
            <p className="text-sm text-red-600">錯誤: {error}</p>
          </div>
        )}
        <div className="mt-6">
          <Link
            to="/quotes"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            返回報價單列表
          </Link>
        </div>
      </div>
    );
  }

  // 調試信息
  console.log('當前報價單:', quote);
  console.log('報價單項目:', quote.items);
  console.log('公司設定:', companySettings);

  return (
    <div className="space-y-6">
      {/* 頁面標題和操作按鈕 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/quotes')}
            className="text-gray-400 hover:text-gray-500"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              報價單 {quote.quote_number}
            </h1>
            <div className="mt-1 flex items-center space-x-3">
              <span className={getStatusBadge(quote.status)}>
                {getStatusText(quote.status)}
              </span>
              <span className="text-sm text-gray-500">
                建立於 {new Date(quote.created_at).toLocaleDateString('zh-TW')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 no-print">
          <button
            onClick={handleShare}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ShareIcon className="-ml-0.5 mr-2 h-4 w-4" />
            分享
          </button>
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
          <Link
            to={`/quotes/${quote.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <PencilIcon className="-ml-1 mr-2 h-5 w-5" />
            編輯
          </Link>
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
                  className="w-30 h-30 object-contain"
                  style={{ width: '120px', height: '120px' }}
                  onError={(e) => {
                    console.error('圖片載入失敗:', companySettings.logo);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div 
                  className="w-30 h-30 bg-gray-200 rounded-lg flex items-center justify-center"
                  style={{ width: '120px', height: '120px' }}
                >
                  <span className="text-gray-500 text-sm">公司Logo</span>
                </div>
              )}
            </div>
            <h2 className="text-3xl font-bold text-gray-900">報價單</h2>
          </div>

          {/* 基本資訊 */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">客戶資訊</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">公司名稱:</span>
                  <span className="ml-2 text-sm text-gray-900">
                    {quote.customer?.company_name || '未知客戶'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">聯絡人:</span>
                  <span className="ml-2 text-sm text-gray-900">{quote.contact_person}</span>
                </div>
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

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">報價資訊</h3>
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
                  <span className="ml-2 text-sm text-gray-900">
                    {quote.staff?.name || '未指定'}
                  </span>
                </div>
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
                      規格說明
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
                  {quote.items && quote.items.length > 0 ? (
                    quote.items.map((item, index) => (
                      <tr key={item.id || index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.product_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDescriptionText(item.description || '')}
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
                        暫無報價項目
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
                  <div className="relative group">
                    <img 
                      src={companySettings.stamp} 
                      alt="報價章" 
                      className="w-24 h-24 object-contain border border-gray-200 rounded cursor-pointer"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            // 檢查文件類型
                           if (!file.type.startsWith('image/')) {
                             alert('請選擇圖片文件（PNG、JPG、GIF等）');
                             (e.target as HTMLInputElement).value = '';
                             return;
                           }
                           
                           // 檢查文件大小（10MB限制）
                           if (file.size > 10 * 1024 * 1024) {
                             alert('文件大小不能超過10MB');
                             (e.target as HTMLInputElement).value = '';
                             return;
                           }
                           
                           // 檢查FileReader支援
                           if (!window.FileReader) {
                             alert('您的瀏覽器不支援文件上傳功能');
                             (e.target as HTMLInputElement).value = '';
                             return;
                           }
                            
                            const reader = new FileReader();
                            
                            reader.onload = (event) => {
                              try {
                                const result = event.target?.result;
                                if (result) {
                                  const newSettings = {
                                    ...companySettings,
                                    stamp: result as string
                                  };
                                  localStorage.setItem('companySettings', JSON.stringify(newSettings));
                                  alert('報價章上傳成功！');
                                  window.location.reload();
                                }
                              } catch (error) {
                                console.error('處理報價章時發生錯誤:', error);
                                alert('處理報價章時發生錯誤，請重試');
                              }
                            };
                            
                            reader.onerror = () => {
                              console.error('讀取報價章文件時發生錯誤');
                              alert('讀取報價章文件時發生錯誤，請重試');
                            };
                            
                            reader.onabort = () => {
                              console.log('報價章文件讀取被中斷');
                              alert('報價章文件讀取被中斷');
                            };
                            
                            try {
                              reader.readAsDataURL(file);
                            } catch (error) {
                              console.error('啟動報價章文件讀取時發生錯誤:', error);
                              alert('啟動報價章文件讀取時發生錯誤，請重試');
                            }
                          }
                          
                          // 清除input值，允許重新選擇相同文件
                          setTimeout(() => {
                            (e.target as HTMLInputElement).value = '';
                          }, 100);
                        };
                        input.click();
                      }}
                      onError={(e) => {
                        console.error('報價章載入失敗:', companySettings.stamp);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded flex items-center justify-center">
                      <span className="text-white text-xs">點擊更換</span>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="w-24 h-24 bg-gray-100 border border-gray-200 rounded flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          // 檢查文件類型
                                 if (!file.type.startsWith('image/')) {
                                   alert('請選擇圖片文件（PNG、JPG、GIF等）');
                                   (e.target as HTMLInputElement).value = '';
                                   return;
                                 }
                                 
                                 // 檢查文件大小（10MB限制）
                                 if (file.size > 10 * 1024 * 1024) {
                                   alert('文件大小不能超過10MB');
                                   (e.target as HTMLInputElement).value = '';
                                   return;
                                 }
                                 
                                 // 檢查FileReader支援
                                 if (!window.FileReader) {
                                   alert('您的瀏覽器不支援文件上傳功能');
                                   (e.target as HTMLInputElement).value = '';
                                   return;
                                 }
                          
                          const reader = new FileReader();
                          
                          reader.onload = (event) => {
                            try {
                              const result = event.target?.result;
                              if (result) {
                                const newSettings = {
                                  ...companySettings,
                                  stamp: result as string
                                };
                                localStorage.setItem('companySettings', JSON.stringify(newSettings));
                                alert('報價章上傳成功！');
                                window.location.reload();
                              }
                            } catch (error) {
                              console.error('處理報價章時發生錯誤:', error);
                              alert('處理報價章時發生錯誤，請重試');
                            }
                          };
                          
                          reader.onerror = () => {
                            console.error('讀取報價章文件時發生錯誤');
                            alert('讀取報價章文件時發生錯誤，請重試');
                          };
                          
                          reader.onabort = () => {
                            console.log('報價章文件讀取被中斷');
                            alert('報價章文件讀取被中斷');
                          };
                          
                          try {
                            reader.readAsDataURL(file);
                          } catch (error) {
                            console.error('啟動報價章文件讀取時發生錯誤:', error);
                            alert('啟動報價章文件讀取時發生錯誤，請重試');
                          }
                        }
                        
                        // 清除input值，允許重新選擇相同文件
                         setTimeout(() => {
                           (e.target as HTMLInputElement).value = '';
                         }, 100);
                      };
                      input.click();
                    }}
                  >
                    <span className="text-xs text-gray-500">點擊上傳報價章</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">可在公司管理設定中配置或直接點擊上傳</p>
              </div>
            </div>

            {/* 金額計算 */}
            <div className="w-64">
              <div className="space-y-2">
                {(() => {
                  if (!quote.items || quote.items.length === 0) {
                    return (
                      <div className="text-center text-gray-500">
                        <span className="text-sm">暫無項目</span>
                      </div>
                    );
                  }
                  
                  const subtotal = quote.items.reduce((sum, item) => {
                    const quantity = Number(item.quantity) || 0;
                    const unitPrice = Number(item.unit_price) || 0;
                    return sum + (quantity * unitPrice);
                  }, 0);
                  const taxRate = quote.tax_rate || 5; // 預設稅率 5%
                  const taxAmount = subtotal * (taxRate / 100);
                  const total = subtotal + taxAmount;
                  
                  return (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">小計:</span>
                        <span className="text-sm font-medium">NT$ {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">稅額 ({taxRate}%):</span>
                        <span className="text-sm font-medium">NT$ {taxAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-base font-medium text-gray-900">總計:</span>
                        <span className="text-base font-bold text-gray-900">NT$ {total.toLocaleString()}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* 備註 */}
          {quote.notes && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">備註</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
              </div>
            </div>
          )}

          {/* 銀行資訊 */}
          {quote.bank && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">匯款資訊</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 銀行資訊 */}
                <div className="lg:col-span-2">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-blue-900">銀行名稱:</span>
                        <span className="ml-2 text-sm text-blue-800">{quote.bank.bank_name}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-blue-900">帳戶號碼:</span>
                        <span className="ml-2 text-sm text-blue-800">{quote.bank.account_number}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-blue-900">戶名:</span>
                        <span className="ml-2 text-sm text-blue-800">{quote.bank.account_name}</span>
                      </div>
                      {quote.bank.branch_name && (
                        <div>
                          <span className="text-sm font-medium text-blue-900">分行:</span>
                          <span className="ml-2 text-sm text-blue-800">{quote.bank.branch_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* 存摺圖檔顯示區域 */}
                <div className="lg:col-span-1">
                  <div className="text-center">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">存摺圖檔</h4>
                    {bankSettings.bankbookImage ? (
                      <div className="relative group">
                        <img 
                          src={bankSettings.bankbookImage} 
                          alt="存摺圖檔" 
                          className="w-full max-w-96 h-64 object-cover mx-auto border border-gray-200 rounded-lg shadow-sm cursor-pointer"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) {
                                // 檢查文件類型
                               if (!file.type.startsWith('image/')) {
                                 alert('請選擇圖片文件（PNG、JPG、GIF等）');
                                 (e.target as HTMLInputElement).value = '';
                                 return;
                               }
                               
                               // 檢查文件大小（10MB限制）
                               if (file.size > 10 * 1024 * 1024) {
                                 alert('文件大小不能超過10MB');
                                 (e.target as HTMLInputElement).value = '';
                                 return;
                               }
                               
                               // 檢查FileReader支援
                               if (!window.FileReader) {
                                 alert('您的瀏覽器不支援文件上傳功能');
                                 (e.target as HTMLInputElement).value = '';
                                 return;
                               }
                                
                                const reader = new FileReader();
                                
                                reader.onload = (event) => {
                                  try {
                                    const result = event.target?.result;
                                    if (result) {
                                      const newBankSettings = {
                                        ...bankSettings,
                                        bankbookImage: result as string
                                      };
                                      localStorage.setItem('bankSettings', JSON.stringify(newBankSettings));
                                      alert('存摺圖檔上傳成功！');
                                      window.location.reload();
                                    }
                                  } catch (error) {
                                    console.error('處理存摺圖檔時發生錯誤:', error);
                                    alert('處理存摺圖檔時發生錯誤，請重試');
                                  }
                                };
                                
                                reader.onerror = () => {
                                  console.error('讀取存摺圖檔時發生錯誤');
                                  alert('讀取存摺圖檔時發生錯誤，請重試');
                                };
                                
                                reader.onabort = () => {
                                  console.log('存摺圖檔讀取被中斷');
                                  alert('存摺圖檔讀取被中斷');
                                };
                                
                                try {
                                  reader.readAsDataURL(file);
                                } catch (error) {
                                  console.error('啟動存摺圖檔讀取時發生錯誤:', error);
                                  alert('啟動存摺圖檔讀取時發生錯誤，請重試');
                                }
                              }
                              
                              // 清除input值，允許重新選擇相同文件
                               setTimeout(() => {
                                 (e.target as HTMLInputElement).value = '';
                               }, 100);
                            };
                            input.click();
                          }}
                          onError={(e) => {
                            console.error('存摺圖檔載入失敗:', bankSettings.bankbookImage);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs">點擊更換</span>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="w-full max-w-96 h-64 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              // 檢查文件類型
                               if (!file.type.startsWith('image/')) {
                                 alert('請選擇圖片文件（PNG、JPG、GIF等）');
                                 (e.target as HTMLInputElement).value = '';
                                 return;
                               }
                               
                               // 檢查文件大小（10MB限制）
                               if (file.size > 10 * 1024 * 1024) {
                                 alert('文件大小不能超過10MB');
                                 (e.target as HTMLInputElement).value = '';
                                 return;
                               }
                               
                               // 檢查FileReader支援
                               if (!window.FileReader) {
                                 alert('您的瀏覽器不支援文件上傳功能');
                                 (e.target as HTMLInputElement).value = '';
                                 return;
                               }
                              
                              const reader = new FileReader();
                              
                              reader.onload = (event) => {
                                try {
                                  const result = event.target?.result;
                                  if (result) {
                                    const newBankSettings = {
                                      ...bankSettings,
                                      bankbookImage: result as string
                                    };
                                    localStorage.setItem('bankSettings', JSON.stringify(newBankSettings));
                                    alert('存摺圖檔上傳成功！');
                                    window.location.reload();
                                  }
                                } catch (error) {
                                  console.error('處理存摺圖檔時發生錯誤:', error);
                                  alert('處理存摺圖檔時發生錯誤，請重試');
                                }
                              };
                              
                              reader.onerror = () => {
                                console.error('讀取存摺圖檔時發生錯誤');
                                alert('讀取存摺圖檔時發生錯誤，請重試');
                              };
                              
                              reader.onabort = () => {
                                console.log('存摺圖檔讀取被中斷');
                                alert('存摺圖檔讀取被中斷');
                              };
                              
                              try {
                                reader.readAsDataURL(file);
                              } catch (error) {
                                console.error('啟動存摺圖檔讀取時發生錯誤:', error);
                                alert('啟動存摺圖檔讀取時發生錯誤，請重試');
                              }
                            }
                            
                            // 清除input值，允許重新選擇相同文件
                             setTimeout(() => {
                               (e.target as HTMLInputElement).value = '';
                             }, 100);
                          };
                          input.click();
                        }}
                      >
                        <span className="text-xs text-gray-500">點擊上傳存摺圖檔</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">可在銀行管理設定中配置或直接點擊上傳</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 頁尾 */}
          <div className="text-center text-sm text-gray-500 border-t pt-6">
            <p>感謝您的詢價，如有任何問題請隨時與我們聯繫</p>
            {quote.staff?.phone && (
              <p className="mt-1">
                聯絡電話: 
                <a 
                  href={`tel:${quote.staff.phone}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
                >
                  {quote.staff.phone}
                </a>
              </p>
            )}
            {quote.staff?.email && (
              <>
                <p className="mt-1">
                  電子郵件: 
                  <a 
                    href={`mailto:${quote.staff.email}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
                  >
                    {quote.staff.email}
                  </a>
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  技術提供：
                  <a 
                    href="https://zhenhe-dm.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
                  >
                    振禾有限公司
                  </a>
                </p>
              </>
            )}
            {!quote.staff?.email && (
              <p className="mt-2 text-sm text-gray-600">
                技術提供：
                <a 
                  href="https://zhenhe-dm.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
                >
                  振禾有限公司
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}