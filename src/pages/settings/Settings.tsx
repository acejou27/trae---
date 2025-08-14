/**
 * 基礎資料設定頁面組件
 * Created: 2024-12-28
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  CubeIcon,
  UserGroupIcon,
  BanknotesIcon,
  CogIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useQuoteStore } from '../../stores/useQuoteStore';

/**
 * 設定項目介面
 */
interface SettingItem {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  count?: number;
}

/**
 * 基礎資料設定頁面組件
 * 提供各種基礎資料管理的入口和概覽
 */
export function Settings(): JSX.Element {
  const { customers, products, staff, banks } = useQuoteStore();

  /**
   * 設定項目配置
   */
  const settingItems: SettingItem[] = [
    {
      title: '客戶管理',
      description: '管理客戶資料，包括公司名稱、聯絡人、電話、地址等資訊',
      href: '/settings/customers',
      icon: UsersIcon,
      color: 'bg-blue-500',
      count: customers.length
    },
    {
      title: '產品管理',
      description: '管理產品資料，包括產品名稱、說明、預設價格、單位等資訊',
      href: '/settings/products',
      icon: CubeIcon,
      color: 'bg-green-500',
      count: products.length
    },
    {
      title: '負責人管理',
      description: '管理專案負責人資料，包括姓名、職稱、聯絡方式等資訊',
      href: '/settings/staff',
      icon: UserGroupIcon,
      color: 'bg-purple-500',
      count: staff.length
    },
    {
      title: '銀行資料',
      description: '管理銀行帳戶資料，用於報價單的匯款資訊顯示',
      href: '/settings/banks',
      icon: BanknotesIcon,
      color: 'bg-orange-500',
      count: banks.length
    }
  ];

  /**
   * 系統統計資料
   */
  const systemStats = [
    {
      title: '客戶總數',
      value: customers.length,
      icon: UsersIcon,
      color: 'text-blue-600'
    },
    {
      title: '產品總數',
      value: products.length,
      icon: CubeIcon,
      color: 'text-green-600'
    },
    {
      title: '負責人總數',
      value: staff.length,
      icon: UserGroupIcon,
      color: 'text-purple-600'
    },
    {
      title: '銀行帳戶',
      value: banks.length,
      icon: BanknotesIcon,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">基礎資料設定</h1>
        <p className="mt-1 text-sm text-gray-500">
          管理系統的基礎資料，包括客戶、產品、負責人和銀行資料
        </p>
      </div>

      {/* 統計概覽 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {systemStats.map((stat, index) => (
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

      {/* 設定項目 */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">管理項目</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {settingItems.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className="group relative bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
            >
              <div>
                <span className={`rounded-lg inline-flex p-3 ${item.color} text-white`}>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                    {item.title}
                  </h3>
                  {item.count !== undefined && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.count} 筆
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {item.description}
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

      {/* 系統資訊 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">系統資訊</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-gray-500">系統版本</h3>
            <p className="mt-1 text-sm text-gray-900">v1.0.0</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">最後更新</h3>
            <p className="mt-1 text-sm text-gray-900">
              {new Date().toLocaleDateString('zh-TW')}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">資料庫狀態</h3>
            <div className="mt-1 flex items-center">
              <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-900">正常</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">儲存空間</h3>
            <p className="mt-1 text-sm text-gray-900">使用中</p>
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <CogIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-blue-800">
              設定建議
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                {customers.length === 0 && (
                  <li>建議先新增客戶資料，以便建立報價單時選擇</li>
                )}
                {products.length === 0 && (
                  <li>建議先新增產品資料，以便快速建立報價單項目</li>
                )}
                {staff.length === 0 && (
                  <li>建議先新增負責人資料，以便在報價單中指定負責人</li>
                )}
                {banks.length === 0 && (
                  <li>建議先新增銀行資料，以便在報價單中顯示匯款資訊</li>
                )}
                {customers.length > 0 && products.length > 0 && staff.length > 0 && banks.length > 0 && (
                  <li>所有基礎資料已設定完成，可以開始建立報價單</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}