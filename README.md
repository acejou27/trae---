# 報價單管理系統

一個基於 React + TypeScript + Supabase 的現代化報價單管理系統，專為中小企業設計，提供簡單易用的報價單解決方案。

## 🚀 功能特色

### 核心功能
- 📋 **報價單管理** - 建立、編輯、查看和管理報價單
- 👥 **客戶管理** - 完整的客戶資料管理系統
- 📦 **產品管理** - 產品資料庫和價格管理
- 👨‍💼 **負責人管理** - 業務負責人資料管理
- 🏦 **銀行帳戶管理** - 收款帳戶資訊管理
- 📄 **PDF 匯出** - 專業的報價單 PDF 生成
- 🔍 **搜尋與篩選** - 強大的資料搜尋和篩選功能

### 技術特色
- ⚡ **現代化技術棧** - React 18 + TypeScript + Vite
- 🎨 **美觀的 UI** - Tailwind CSS + Headless UI
- 📱 **響應式設計** - 支援桌面和行動裝置
- 🔒 **安全可靠** - Supabase 身份驗證和 RLS
- 📊 **狀態管理** - Zustand 輕量級狀態管理
- ✅ **表單驗證** - React Hook Form + Zod

## 🛠️ 技術架構

### 前端技術棧
- **框架**: React 18 + TypeScript
- **建置工具**: Vite
- **樣式**: Tailwind CSS
- **UI 組件**: Headless UI + Heroicons
- **表單處理**: React Hook Form + Zod
- **狀態管理**: Zustand
- **PDF 生成**: jsPDF + html2canvas

### 後端服務
- **資料庫**: Supabase (PostgreSQL)
- **身份驗證**: Supabase Auth
- **即時更新**: Supabase Realtime
- **檔案儲存**: Supabase Storage

### 部署
- **前端部署**: Vercel
- **資料庫**: Supabase Cloud

## 📦 安裝與設定

### 環境需求
- Node.js 18+ 
- pnpm (推薦) 或 npm
- Supabase 帳戶

### 1. 複製專案
```bash
git clone <repository-url>
cd trae報價單
```

### 2. 安裝依賴
```bash
pnpm install
# 或
npm install
```

### 3. 環境變數設定
複製 `.env.example` 為 `.env` 並填入您的 Supabase 專案資訊：

```bash
cp .env.example .env
```

編輯 `.env` 檔案：
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Supabase 資料庫設定

在 Supabase 專案中執行以下 SQL 來建立資料表：

```sql
-- 建立使用者表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立客戶表
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立產品表
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立負責人表
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立銀行表
CREATE TABLE banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name TEXT NOT NULL,
  branch_name TEXT,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立報價單表
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL,
  staff_id UUID NOT NULL,
  bank_id UUID NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
  issue_date DATE NOT NULL,
  valid_until DATE NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0.05,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立報價單項目表
CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL,
  product_id UUID NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit TEXT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(12,2) NOT NULL DEFAULT 0
);
```

### 5. 啟動開發伺服器
```bash
pnpm dev
# 或
npm run dev
```

應用程式將在 `http://localhost:5173` 啟動。

## 📁 專案結構

```
src/
├── components/          # React 組件
│   ├── layout/         # 佈局組件
│   └── ui/             # UI 基礎組件
├── hooks/              # 自定義 Hooks
├── pages/              # 頁面組件
│   ├── quotes/         # 報價單相關頁面
│   └── settings/       # 設定相關頁面
├── services/           # API 服務層
├── stores/             # Zustand 狀態管理
├── types/              # TypeScript 類型定義
├── utils/              # 工具函數
├── App.tsx             # 主應用程式組件
└── main.tsx            # 應用程式入口點
```

## 🎯 使用指南

### 基本操作流程

1. **設定基礎資料**
   - 新增客戶資料
   - 建立產品資料庫
   - 設定負責人資訊
   - 配置銀行帳戶

2. **建立報價單**
   - 選擇客戶
   - 添加報價項目
   - 設定報價條件
   - 預覽和儲存

3. **管理報價單**
   - 查看報價單列表
   - 編輯報價內容
   - 更新報價狀態
   - 匯出 PDF

### 權限管理

系統支援兩種使用者角色：
- **管理員 (admin)**: 完整的系統管理權限
- **一般使用者 (user)**: 基本的報價單操作權限

## 🚀 部署

### Vercel 部署

1. 將專案推送到 GitHub
2. 在 Vercel 中匯入專案
3. 設定環境變數
4. 部署完成

### 環境變數設定
在 Vercel 部署設定中添加以下環境變數：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🧪 測試

```bash
# 執行單元測試
pnpm test

# 執行測試覆蓋率
pnpm test:coverage

# 執行 E2E 測試
pnpm test:e2e
```

## 📝 開發指南

### 程式碼規範
- 使用 TypeScript 進行類型安全
- 遵循 ESLint 和 Prettier 規範
- 組件使用函數式組件和 Hooks
- 使用 Zod 進行資料驗證

### 提交規範
使用 Conventional Commits 格式：
```
feat: 新增功能
fix: 修復錯誤
docs: 文件更新
style: 程式碼格式調整
refactor: 程式碼重構
test: 測試相關
chore: 建置或輔助工具變動
```

## 🤝 貢獻指南

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 📄 授權

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案。

## 🆘 支援

如果您遇到問題或需要協助：

1. 查看 [Issues](../../issues) 是否有類似問題
2. 建立新的 Issue 描述您的問題
3. 聯繫開發團隊

## 📊 版本歷史

### v1.0.0 (2024-12-28)
- ✨ 初始版本發布
- 📋 基本報價單管理功能
- 👥 客戶、產品、負責人、銀行管理
- 📄 PDF 匯出功能
- 🔍 搜尋和篩選功能

---

**開發團隊** | **技術支援** | **文件更新**: 2024-12-28