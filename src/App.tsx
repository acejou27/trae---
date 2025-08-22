/**
 * 主應用程式組件
 * Created: 2024-12-28
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Home } from './pages/Home';
import { QuoteList } from './pages/quotes/QuoteList';
import { QuoteForm } from './pages/quotes/QuoteForm';
import { QuoteView } from './pages/quotes/QuoteView';
import { CustomerManagement as CustomerList } from './pages/settings/CustomerManagement';
import { ProductManagement as ProductList } from './pages/settings/ProductManagement';
import { StaffManagement as StaffList } from './pages/settings/StaffManagement';
import { BankManagement as BankList } from './pages/settings/BankManagement';
import { Settings } from './pages/settings/Settings';
import { CompanySettings } from './pages/settings/CompanySettings';
import UserProfile from './pages/settings/UserProfile';
import Login from './pages/auth/Login';
import AuthCallback from './pages/auth/AuthCallback';
import AuthDebug from './pages/auth/AuthDebug';
import './index.css';

/**
 * 主應用程式組件
 * 負責路由配置和整體應用程式結構
 */
function App(): JSX.Element {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* 認證相關路由（不需要Layout） */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/debug" element={<AuthDebug />} />
          
          {/* 受保護的應用程式路由 */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  {/* 首頁 */}
                  <Route path="/" element={<Home />} />
                  
                  {/* 報價單相關路由 */}
                  <Route path="/quotes" element={<QuoteList />} />
                  <Route path="/quotes/new" element={<QuoteForm />} />
                  <Route path="/quotes/:id" element={<QuoteView />} />
                  <Route path="/quotes/:id/edit" element={<QuoteForm />} />
                  
                  {/* 基礎資料管理路由 */}
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/settings/company" element={<CompanySettings />} />
                  <Route path="/settings/customers" element={<CustomerList />} />
                  <Route path="/settings/products" element={<ProductList />} />
                  <Route path="/settings/staff" element={<StaffList />} />
                  <Route path="/settings/banks" element={<BankList />} />
                  <Route path="/settings/profile" element={<UserProfile />} />
                  
                  {/* 404 重導向 */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;