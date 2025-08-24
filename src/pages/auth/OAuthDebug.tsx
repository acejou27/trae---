/**
 * OAuth 調試頁面
 * 用於檢查 Google OAuth 配置和環境設定
 * Created: 2024-12-28
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Info, Copy, RefreshCw } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface ConfigCheck {
  name: string;
  status: 'success' | 'warning' | 'error' | 'info';
  message: string;
  value?: string;
}

const OAuthDebug: React.FC = () => {
  const navigate = useNavigate();
  const [checks, setChecks] = useState<ConfigCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('複製失敗:', error);
    }
  };

  const runConfigChecks = async () => {
    setLoading(true);
    const newChecks: ConfigCheck[] = [];

    // 檢查環境變數
    const viteAppUrl = import.meta.env.VITE_APP_URL;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const currentOrigin = window.location.origin;
    const currentHref = window.location.href;

    // 1. 檢查 VITE_APP_URL
    if (viteAppUrl) {
      if (viteAppUrl === currentOrigin) {
        newChecks.push({
          name: 'VITE_APP_URL 配置',
          status: 'success',
          message: '環境變數與當前域名匹配',
          value: viteAppUrl
        });
      } else {
        newChecks.push({
          name: 'VITE_APP_URL 配置',
          status: 'warning',
          message: `環境變數 (${viteAppUrl}) 與當前域名 (${currentOrigin}) 不匹配`,
          value: viteAppUrl
        });
      }
    } else {
      newChecks.push({
        name: 'VITE_APP_URL 配置',
        status: 'error',
        message: '未設定 VITE_APP_URL 環境變數',
        value: '未設定'
      });
    }

    // 2. 檢查 Supabase URL
    if (supabaseUrl) {
      try {
        new URL(supabaseUrl);
        newChecks.push({
          name: 'Supabase URL',
          status: 'success',
          message: 'Supabase URL 格式正確',
          value: supabaseUrl
        });
      } catch {
        newChecks.push({
          name: 'Supabase URL',
          status: 'error',
          message: 'Supabase URL 格式無效',
          value: supabaseUrl
        });
      }
    } else {
      newChecks.push({
        name: 'Supabase URL',
        status: 'error',
        message: '未設定 VITE_SUPABASE_URL',
        value: '未設定'
      });
    }

    // 3. 檢查 Supabase Anon Key
    if (supabaseAnonKey) {
      newChecks.push({
        name: 'Supabase Anon Key',
        status: 'success',
        message: 'Supabase 匿名金鑰已設定',
        value: `${supabaseAnonKey.substring(0, 20)}...`
      });
    } else {
      newChecks.push({
        name: 'Supabase Anon Key',
        status: 'error',
        message: '未設定 VITE_SUPABASE_ANON_KEY',
        value: '未設定'
      });
    }

    // 4. 檢查重定向 URL
    const redirectUrl = viteAppUrl ? `${viteAppUrl}/auth/callback` : `${currentOrigin}/auth/callback`;
    newChecks.push({
      name: 'OAuth 重定向 URL',
      status: 'info',
      message: '這是將用於 Google OAuth 的重定向 URL',
      value: redirectUrl
    });

    // 5. 檢查 Supabase 連接
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        newChecks.push({
          name: 'Supabase 連接',
          status: 'error',
          message: `Supabase 連接失敗: ${error.message}`,
          value: error.message
        });
      } else {
        newChecks.push({
          name: 'Supabase 連接',
          status: 'success',
          message: 'Supabase 連接正常',
          value: '連接成功'
        });
      }
    } catch (error) {
      newChecks.push({
        name: 'Supabase 連接',
        status: 'error',
        message: `Supabase 連接異常: ${error instanceof Error ? error.message : '未知錯誤'}`,
        value: '連接失敗'
      });
    }

    // 6. 檢查當前會話
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        newChecks.push({
          name: '當前會話',
          status: 'success',
          message: `用戶已登入: ${sessionData.session.user?.email}`,
          value: sessionData.session.user?.email || '已登入'
        });
      } else {
        newChecks.push({
          name: '當前會話',
          status: 'info',
          message: '用戶未登入',
          value: '未登入'
        });
      }
    } catch (error) {
      newChecks.push({
        name: '當前會話',
        status: 'error',
        message: `會話檢查失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
        value: '檢查失敗'
      });
    }

    setChecks(newChecks);
    setLoading(false);
  };

  useEffect(() => {
    runConfigChecks();
  }, []);

  const getStatusIcon = (status: ConfigCheck['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status: ConfigCheck['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'info':
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">OAuth 配置調試</h1>
                <p className="text-blue-100 mt-1">檢查 Google OAuth 和 Supabase 配置</p>
              </div>
              <button
                onClick={runConfigChecks}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                重新檢查
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-lg text-gray-600">正在檢查配置...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {checks.map((check, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${getStatusColor(check.status)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getStatusIcon(check.status)}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{check.name}</h3>
                          <p className="text-gray-700 mt-1">{check.message}</p>
                          {check.value && (
                            <div className="mt-2 flex items-center space-x-2">
                              <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-800">
                                {check.value}
                              </code>
                              <button
                                onClick={() => copyToClipboard(check.value!, check.name)}
                                className="inline-flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                {copied === check.name ? '已複製' : '複製'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 配置指南 */}
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">配置指南</h2>
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <h3 className="font-medium text-gray-900">1. Supabase Dashboard 設定</h3>
                  <p>在 Supabase Dashboard → Authentication → Providers → Google 中：</p>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>啟用 Google 提供商</li>
                    <li>設定正確的 Client ID 和 Client Secret</li>
                    <li>在 "Authorized redirect URIs" 中添加: <code className="bg-gray-200 px-1 rounded">{window.location.origin}/auth/callback</code></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">2. Google Cloud Console 設定</h3>
                  <p>在 Google Cloud Console → APIs & Services → Credentials 中：</p>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>創建 OAuth 2.0 客戶端 ID</li>
                    <li>在 "Authorized redirect URIs" 中添加: <code className="bg-gray-200 px-1 rounded">{window.location.origin}/auth/callback</code></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">3. 環境變數設定</h3>
                  <p>確保 .env 文件中包含正確的配置：</p>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li><code className="bg-gray-200 px-1 rounded">VITE_APP_URL={window.location.origin}</code></li>
                    <li><code className="bg-gray-200 px-1 rounded">VITE_SUPABASE_URL=你的Supabase項目URL</code></li>
                    <li><code className="bg-gray-200 px-1 rounded">VITE_SUPABASE_ANON_KEY=你的Supabase匿名金鑰</code></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="mt-8 flex space-x-4">
              <button
                onClick={() => navigate('/auth/login')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                返回登入頁面
              </button>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                返回首頁
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthDebug;