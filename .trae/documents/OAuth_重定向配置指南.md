# OAuth 重定向配置指南

## 問題描述

當在 Vercel 部署後使用 Google 登錄時，可能會遇到重定向到 `localhost:3000` 而不是正確的 Vercel 域名的問題。

## 解決方案

### 1. 環境變數配置

在 `.env` 文件中添加生產環境 URL：

```env
# 生產環境URL（用於OAuth重定向）
VITE_APP_URL=https://your-vercel-domain.vercel.app
```

### 2. Supabase OAuth 設定

在 Supabase Dashboard 中配置正確的重定向 URL：

1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇您的項目
3. 前往 **Authentication** → **URL Configuration**
4. 在 **Redirect URLs** 中添加以下 URL：

```
# 開發環境
http://localhost:5173/auth/callback
http://localhost:3000/auth/callback

# 生產環境（替換為您的實際域名）
https://your-vercel-domain.vercel.app/auth/callback
```

### 3. Google Cloud Console 設定

確保 Google OAuth 客戶端也配置了正確的重定向 URI：

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇您的項目
3. 前往 **APIs & Services** → **Credentials**
4. 編輯 OAuth 2.0 客戶端 ID
5. 在 **Authorized redirect URIs** 中添加：

```
# Supabase 重定向 URI
https://rbywkdelamswevxbelty.supabase.co/auth/v1/callback
```

### 4. Vercel 環境變數設定

在 Vercel Dashboard 中設定環境變數：

1. 前往 Vercel Dashboard
2. 選擇您的項目
3. 前往 **Settings** → **Environment Variables**
4. 添加以下變數：

```
VITE_APP_URL=https://your-vercel-domain.vercel.app
VITE_SUPABASE_URL=https://rbywkdelamswevxbelty.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 重定向 URL 邏輯

系統會按以下優先順序決定重定向 URL：

1. **環境變數 VITE_APP_URL**：如果設定了此變數，將使用此 URL
2. **當前域名**：如果沒有環境變數，使用 `window.location.origin`
3. **錯誤檢測**：如果在生產環境檢測到 localhost，會顯示警告

## 調試信息

在瀏覽器控制台中，您可以看到以下調試信息：

```
環境模式: production
是否為生產環境: true
當前域名: https://your-vercel-domain.vercel.app
Google OAuth 重定向URL: https://your-vercel-domain.vercel.app/auth/callback
```

## 常見問題

### Q: 為什麼會重定向到 localhost？

A: 這通常是因為：
1. Supabase 中沒有配置正確的重定向 URL
2. 環境變數 `VITE_APP_URL` 沒有設定
3. Google OAuth 客戶端配置錯誤

### Q: 如何確認配置是否正確？

A: 檢查瀏覽器控制台的調試信息，確保重定向 URL 是正確的 Vercel 域名。

### Q: 本地開發環境會受影響嗎？

A: 不會。本地開發時，系統會自動使用 `http://localhost:5173` 作為重定向 URL。

## 部署後測試

1. 部署到 Vercel
2. 訪問生產環境 URL
3. 嘗試 Google 登錄
4. 確認重定向到正確的域名而不是 localhost

---

**最後更新：** 2024-12-28  
**版本：** 1.0.0
