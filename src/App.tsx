/**
 * 主應用程式組件
 * Created: 2024-12-28
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
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
import './index.css';

/**
 * 主應用程式組件
 * 負責路由配置和整體應用程式結構
 */
function App(): JSX.Element {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
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
            
            {/* 404 重導向 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;