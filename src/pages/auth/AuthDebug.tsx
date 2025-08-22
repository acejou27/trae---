/**
 * 認證調試頁面
 * 用於調試新用戶登錄問題
 * Created: 2024-12-28
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUserProfile } from '../../hooks/useUserProfile';
import { supabase } from '../../services/supabase';
import { RefreshCw, User, Database, AlertCircle, CheckCircle } from 'lucide-react';

const AuthDebug: React.FC = () => {
  const { user, session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, error: profileError } = useUserProfile();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  const checkUserProfile = async () => {
    if (!user?.id) return;
    
    setChecking(true);
    try {
      // 檢查用戶個人資料
      const { data: profileData, error: profileErr } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id);
      
      // 檢查權限
      const { data: permissionTest, error: permissionErr } = await supabase
        .from('user_profiles')
        .select('count')
        .eq('user_id', user.id);
      
      setDebugInfo({
        userId: user.id,
        userEmail: user.email,
        userMetadata: user.user_metadata,
        profileData,
        profileError: profileErr,
        permissionTest,
        permissionError: permissionErr,
        sessionValid: !!session,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('調試檢查失敗:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      checkUserProfile();
    }
  }, [user?.id]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>載入認證狀態...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">未登錄</h2>
          <p className="text-gray-600">請先登錄以查看調試信息</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <User className="h-6 w-6 mr-2 text-blue-600" />
              認證調試信息
            </h1>
            <button
              onClick={checkUserProfile}
              disabled={checking}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {checking ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              重新檢查
            </button>
          </div>

          {/* 用戶基本信息 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <User className="h-5 w-5 mr-2 text-green-600" />
              用戶信息
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">用戶ID</label>
                  <p className="text-sm text-gray-900 font-mono">{user.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">電子郵件</label>
                  <p className="text-sm text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">顯示名稱</label>
                  <p className="text-sm text-gray-900">{user.user_metadata?.full_name || '未設定'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">會話狀態</label>
                  <p className="text-sm flex items-center">
                    {session ? (
                      <><CheckCircle className="h-4 w-4 text-green-500 mr-1" />有效</>
                    ) : (
                      <><AlertCircle className="h-4 w-4 text-red-500 mr-1" />無效</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 個人資料狀態 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <Database className="h-5 w-5 mr-2 text-blue-600" />
              個人資料狀態
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              {profileLoading ? (
                <div className="flex items-center">
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  <span>載入中...</span>
                </div>
              ) : profileError ? (
                <div className="flex items-center text-red-600">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span>錯誤: {profileError}</span>
                </div>
              ) : profile ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>個人資料已載入: {profile.display_name}</span>
                </div>
              ) : (
                <div className="flex items-center text-yellow-600">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span>個人資料不存在</span>
                </div>
              )}
            </div>
          </div>

          {/* 調試詳細信息 */}
          {debugInfo && (
            <div>
              <h2 className="text-lg font-semibold mb-3">詳細調試信息</h2>
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-auto">
                <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;