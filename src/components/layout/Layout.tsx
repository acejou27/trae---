/**
 * 主要佈局組件
 * Created: 2024-12-28
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  DocumentTextIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  UsersIcon,
  CubeIcon,
  UserGroupIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * 導航選單項目介面
 */
interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children?: NavItem[];
}

/**
 * 導航選單配置
 */
const navigation: NavItem[] = [
  {
    name: '首頁',
    href: '/',
    icon: HomeIcon
  },
  {
    name: '報價單管理',
    href: '/quotes',
    icon: DocumentTextIcon
  },
  {
    name: '基礎資料',
    href: '/settings',
    icon: CogIcon,
    children: [
      {
        name: '公司設定',
        href: '/settings/company',
        icon: BuildingOfficeIcon
      },
      {
        name: '客戶管理',
        href: '/settings/customers',
        icon: UsersIcon
      },
      {
        name: '產品管理',
        href: '/settings/products',
        icon: CubeIcon
      },
      {
        name: '負責人管理',
        href: '/settings/staff',
        icon: UserGroupIcon
      },
      {
        name: '銀行資料',
        href: '/settings/banks',
        icon: BanknotesIcon
      }
    ]
  }
];

/**
 * 主要佈局組件
 * 提供側邊欄導航和主要內容區域
 */
export function Layout({ children }: LayoutProps): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // 點擊外部關閉用戶選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  /**
   * 檢查當前路由是否為活躍狀態
   * @param href - 路由路徑
   * @returns boolean - 是否為活躍狀態
   */
  const isActive = (href: string): boolean => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  /**
   * 渲染導航項目
   * @param item - 導航項目
   * @param level - 層級深度
   * @returns JSX.Element
   */
  const renderNavItem = (item: NavItem, level: number = 0): JSX.Element => {
    const active = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    
    return (
      <div key={item.href}>
        <Link
          to={item.href}
          className={cn(
            'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200',
            level === 0 ? 'pl-3' : 'pl-8',
            active
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          )}
          onClick={() => setSidebarOpen(false)}
        >
          <item.icon
            className={cn(
              'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200',
              active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
            )}
            aria-hidden="true"
          />
          {item.name}
        </Link>
        
        {/* 子選單 */}
        {hasChildren && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 手機版側邊欄遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 側邊欄 */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo 區域 */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-900">
                  報價單系統
                </h1>
              </div>
            </div>
            
            {/* 手機版關閉按鈕 */}
            <button
              type="button"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-gray-400" />
            </button>
          </div>

          {/* 導航選單 */}
          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
            {navigation.map(item => renderNavItem(item))}
          </nav>

          {/* 使用者資訊區域 */}
          <div className="border-t border-gray-200 p-4">
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                className="flex w-full items-center rounded-lg p-2 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="flex-shrink-0">
                  {user?.user_metadata?.avatar_url ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user.user_metadata.avatar_url}
                      alt="用戶頭像"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {user?.user_metadata?.full_name || '使用者'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </button>
              
              {/* 用戶選單下拉 */}
              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link
                    to="/settings/profile"
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <UserCircleIcon className="h-4 w-4 mr-3 text-gray-400" />
                    個人資料
                  </Link>
                  <hr className="my-1 border-gray-200" />
                  <button
                    type="button"
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    onClick={async () => {
                      setUserMenuOpen(false);
                      console.log('側邊欄登出按鈕被點擊');
                      try {
                        console.log('開始執行登出...');
                        await signOut();
                        console.log('登出成功完成');
                      } catch (error) {
                        console.error('登出失敗:', error);
                        // 可以在這裡添加用戶友好的錯誤提示
                        alert(`登出失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
                      }
                    }}
                    disabled={loading}
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3 text-red-500" />
                    {loading ? '登出中...' : '登出'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 頂部導航欄 */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6 text-gray-500" />
            </button>
            
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {/* 這裡可以根據當前路由顯示頁面標題 */}
              </h2>
              
              {/* 桌面版用戶資訊 */}
              <div className="hidden lg:flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  歡迎，{user?.user_metadata?.full_name || user?.email?.split('@')[0] || '使用者'}
                </span>
                <div className="h-6 w-px bg-gray-300" />
                <button
                  type="button"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={async () => {
                    console.log('頂部導航登出按鈕被點擊');
                    try {
                      console.log('開始執行登出...');
                      await signOut();
                      console.log('登出成功完成');
                    } catch (error) {
                      console.error('登出失敗:', error);
                      // 可以在這裡添加用戶友好的錯誤提示
                      alert(`登出失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? '登出中...' : '登出'}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* 主要內容 */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}