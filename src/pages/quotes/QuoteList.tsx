/**
 * 報價單列表頁面組件
 * Created: 2024-12-28
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { useQuoteStore } from '../../stores/useQuoteStore';
import { exportQuoteToPDF } from '../../utils/pdfExport';
import type { Quote } from '../../types';

/**
 * 報價單狀態選項
 */
const statusOptions = [
  { value: '', label: '全部狀態' },
  { value: 'draft', label: '草稿' },
  { value: 'sent', label: '已發送' },
  { value: 'accepted', label: '已接受' },
  { value: 'rejected', label: '已拒絕' }
];

/**
 * 報價單列表頁面組件
 * 提供報價單的查看、搜尋、篩選和管理功能
 */
export function QuoteList(): JSX.Element {
  const { 
    quotes, 
    loading, 

    fetchQuotes, 
    deleteQuote,
    fetchCustomers,
    fetchProducts,
    fetchStaff,
    fetchBanks
  } = useQuoteStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'number' | 'total'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  /**
   * 載入資料
   */
  useEffect(() => {
    fetchQuotes();
    fetchCustomers();
    fetchProducts();
    fetchStaff();
    fetchBanks();
  }, [fetchQuotes, fetchCustomers, fetchProducts, fetchStaff, fetchBanks]);

  /**
   * 篩選和排序報價單
   */
  const filteredQuotes = quotes
    .filter(quote => {
      const matchesSearch = 
        quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.customer?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.contact_person.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || quote.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: string | number | Date, bValue: string | number | Date;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.quote_date);
          bValue = new Date(b.quote_date);
          break;
        case 'number':
          aValue = a.quote_number;
          bValue = b.quote_number;
          break;
        case 'total':
          aValue = a.total;
          bValue = b.total;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  /**
   * 處理刪除報價單
   * @param id - 報價單ID
   */
  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm('確定要刪除這個報價單嗎？此操作無法復原。')) {
      try {
        await deleteQuote(id);
      } catch (error) {
        console.error('刪除報價單失敗:', error);
        alert('刪除失敗，請稍後再試');
      }
    }
  };

  /**
   * 處理匯出所有報價單為PDF
   * Created: 2024-12-28
   */
  const handleExportAllPDF = async () => {
    if (filteredQuotes.length === 0) {
      alert('沒有報價單可以匯出');
      return;
    }

    try {
      const { exportQuoteListToPDF } = await import('../../utils/pdfExport');
      await exportQuoteListToPDF(filteredQuotes);
      alert('報價單列表PDF匯出成功！');
    } catch (error) {
      console.error('PDF匯出失敗:', error);
      alert('PDF匯出失敗，請稍後再試');
    }
  };

  /**
   * 取得狀態顯示樣式
   * @param status - 報價單狀態
   * @returns 樣式類名
   */
  const getStatusBadge = (status: Quote['status']): string => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
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
   * @param status - 報價單狀態
   * @returns 狀態文字
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

  return (
    <div className="space-y-6">
      {/* 頁面標題和操作按鈕 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">報價單管理</h1>
          <p className="mt-1 text-sm text-gray-500">
            管理所有報價單，包括建立、編輯和查看
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportAllPDF}
            disabled={filteredQuotes.length === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DocumentArrowDownIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            匯出PDF
          </button>
          <Link
            to="/quotes/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            建立報價單
          </Link>
        </div>
      </div>

      {/* 搜尋和篩選 */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {/* 搜尋框 */}
          <div className="sm:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              搜尋
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="搜尋報價單號、客戶名稱或聯絡人"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* 狀態篩選 */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              狀態
            </label>
            <select
              id="status"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 排序 */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700">
              排序
            </label>
            <select
              id="sort"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-');
                setSortBy(by as 'date' | 'number' | 'total');
                setSortOrder(order as 'asc' | 'desc');
              }}
            >
              <option value="date-desc">日期 (新到舊)</option>
              <option value="date-asc">日期 (舊到新)</option>
              <option value="number-asc">報價單號 (A-Z)</option>
              <option value="number-desc">報價單號 (Z-A)</option>
              <option value="total-desc">金額 (高到低)</option>
              <option value="total-asc">金額 (低到高)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 報價單列表 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">載入中...</p>
          </div>
        ) : filteredQuotes.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredQuotes.map((quote) => (
              <li key={quote.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {quote.quote_number}
                        </p>
                        <span className={getStatusBadge(quote.status)}>
                          {getStatusText(quote.status)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span>{quote.customer?.company_name || '未知客戶'}</span>
                        <span>•</span>
                        <span>{quote.contact_person}</span>
                        <span>•</span>
                        <span>{new Date(quote.quote_date).toLocaleDateString('zh-TW')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        NT$ {quote.total.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        有效期至 {new Date(quote.valid_until).toLocaleDateString('zh-TW')}
                      </p>
                    </div>
                  </div>
                  
                  {/* 操作按鈕 */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/quotes/${quote.id}`}
                      className="text-gray-400 hover:text-gray-500"
                      title="查看"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Link>
                    <Link
                      to={`/quotes/${quote.id}/edit`}
                      className="text-blue-400 hover:text-blue-500"
                      title="編輯"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => exportQuoteToPDF('quote-view', quote)}
                      className="text-green-400 hover:text-green-500"
                      title="匯出PDF"
                    >
                      <DocumentArrowDownIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(quote.id)}
                      className="text-red-400 hover:text-red-500"
                      title="刪除"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm || statusFilter ? '找不到符合條件的報價單' : '尚無報價單'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter 
                ? '請嘗試調整搜尋條件或篩選器'
                : '開始建立您的第一個報價單'
              }
            </p>
            {!searchTerm && !statusFilter && (
              <div className="mt-6">
                <Link
                  to="/quotes/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  建立報價單
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}