/**
 * 首頁組件
 * Created: 2024-12-28
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  PlusIcon,
  UsersIcon,
  CubeIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useQuoteStore } from '../stores/useQuoteStore';

/**
 * 快速操作卡片介面
 */
interface QuickActionCard {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
}

/**
 * 統計卡片介面
 */
interface StatCard {
  title: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  change?: string;
}

/**
 * 快速操作配置
 */
const quickActions: QuickActionCard[] = [
  {
    title: '建立報價單',
    description: '快速建立新的報價單',
    href: '/quotes/new',
    icon: PlusIcon,
    color: 'bg-blue-500'
  },
  {
    title: '報價單管理',
    description: '查看和管理所有報價單',
    href: '/quotes',
    icon: DocumentTextIcon,
    color: 'bg-green-500'
  },
  {
    title: '客戶管理',
    description: '管理客戶資料',
    href: '/settings/customers',
    icon: UsersIcon,
    color: 'bg-purple-500'
  },
  {
    title: '產品管理',
    description: '管理產品資料',
    href: '/settings/products',
    icon: CubeIcon,
    color: 'bg-orange-500'
  }
];

/**
 * 首頁組件
 * 提供系統概覽、統計資訊和快速操作入口
 */
export function Home(): JSX.Element {
  const { 
    quotes, 
    customers, 
    products, 
    loading, 
    error,
    fetchQuotes,
    fetchCustomers,
    fetchProducts,
    fetchStaff,
    fetchBanks
  } = useQuoteStore();

  /**
   * 載入基礎資料
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchQuotes(),
          fetchCustomers(),
          fetchProducts(),
          fetchStaff(),
          fetchBanks()
        ]);
      } catch (error) {
        console.error('載入資料失敗:', error);
      }
    };

    loadData();
  }, [fetchQuotes, fetchCustomers, fetchProducts, fetchStaff, fetchBanks]);

  /**
   * 計算統計資料
   */
  const stats: StatCard[] = [
    {
      title: '總報價單數',
      value: quotes.length,
      icon: DocumentTextIcon,
      color: 'text-blue-600'
    },
    {
      title: '客戶數量',
      value: customers.length,
      icon: UsersIcon,
      color: 'text-green-600'
    },
    {
      title: '產品數量',
      value: products.length,
      icon: CubeIcon,
      color: 'text-purple-600'
    },
    {
      title: '本月報價',
      value: quotes.filter(quote => {
        const quoteDate = new Date(quote.quote_date);
        const now = new Date();
        return quoteDate.getMonth() === now.getMonth() && 
               quoteDate.getFullYear() === now.getFullYear();
      }).length,
      icon: ChartBarIcon,
      color: 'text-orange-600'
    }
  ];

  /**
   * 取得最近的報價單
   */
  const recentQuotes = quotes
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">載入中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">載入失敗</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">系統首頁</h1>
        <p className="mt-1 text-sm text-gray-500">
          歡迎使用報價單管理系統，快速建立和管理您的報價單
        </p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon
                    className={`h-6 w-6 ${stat.color}`}
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.title}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 快速操作 */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">快速操作</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.href}
              className="group relative bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
            >
              <div>
                <span className={`rounded-lg inline-flex p-3 ${action.color} text-white`}>
                  <action.icon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                  {action.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {action.description}
                </p>
              </div>
              <span
                className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                aria-hidden="true"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="m11.293 17.293 1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H6v2h9.586l-4.293 4.293z" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 最近的報價單 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">最近的報價單</h2>
          <Link
            to="/quotes"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            查看全部
          </Link>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {recentQuotes.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentQuotes.map((quote) => (
                <li key={quote.id}>
                  <Link
                    to={`/quotes/${quote.id}`}
                    className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {quote.quote_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {quote.customer?.company_name || '未知客戶'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-500">
                          NT$ {quote.total.toLocaleString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {new Date(quote.quote_date).toLocaleDateString('zh-TW')}
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            quote.status === 'draft'
                              ? 'bg-gray-100 text-gray-800'
                              : quote.status === 'sent'
                              ? 'bg-blue-100 text-blue-800'
                              : quote.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {quote.status === 'draft' && '草稿'}
                          {quote.status === 'sent' && '已發送'}
                          {quote.status === 'accepted' && '已接受'}
                          {quote.status === 'rejected' && '已拒絕'}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">尚無報價單</h3>
              <p className="mt-1 text-sm text-gray-500">
                開始建立您的第一個報價單
              </p>
              <div className="mt-6">
                <Link
                  to="/quotes/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  建立報價單
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}