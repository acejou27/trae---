/**
 * 受保護的路由組件
 * 檢查用戶認證狀態，未登錄用戶重定向到登錄頁面
 * Created: 2024-12-28
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * 受保護的路由組件
 * @param children - 需要保護的子組件
 * @param fallback - 載入時顯示的組件
 * @param redirectTo - 重定向的路徑，默認為 '/auth/login'
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  redirectTo = '/auth/login'
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 如果正在載入認證狀態，顯示載入畫面
  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">驗證中...</p>
          </div>
        </div>
      )
    );
  }

  // 如果用戶未登錄，重定向到登錄頁面
  if (!user) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // 用戶已登錄，渲染子組件
  return <>{children}</>;
};

export default ProtectedRoute;