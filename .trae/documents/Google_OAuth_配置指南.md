# Google OAuth 配置指南

## 概述

本文檔提供了在 Supabase 中配置 Google OAuth 的詳細步驟，以及解決常見問題的方法。

## 錯誤代碼 401: deleted_client

當您遇到「錯誤代碼 401: deleted_client」時，這表示 Google OAuth 客戶端已被刪除或配置無效。

### 解決步驟

#### 1. 檢查 Google Cloud Console

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇您的項目
3. 導航到「API 和服務」→「憑證」
4. 檢查是否存在 OAuth 2.0 客戶端 ID
5. 如果不存在，需要重新創建

#### 2. 創建新的 OAuth 2.0 客戶端

1. 在 Google Cloud Console 中，點擊「創建憑證」→「OAuth 客戶端 ID」
2. 選擇應用程式類型：「網頁應用程式」
3. 設定名稱（例如：「報價單系統」）
4. 添加授權的重定向 URI：
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
   將 `your-project-ref` 替換為您的 Supabase 項目參考 ID

#### 3. 配置 Supabase

1. 登入 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇您的項目
3. 導航到「Authentication」→「Providers」
4. 找到「Google」提供商
5. 啟用 Google 提供商
6. 輸入從 Google Cloud Console 獲得的：
   - **Client ID**
   - **Client Secret**
7. 點擊「Save」

#### 4. 驗證重定向 URL

確保以下 URL 已添加到 Google OAuth 客戶端的授權重定向 URI 中：

- **生產環境**：`https://your-project-ref.supabase.co/auth/v1/callback`
- **開發環境**：`http://localhost:5173/auth/callback`（如果需要本地測試）

## 常見問題排除

### 問題 1：重定向 URI 不匹配

**錯誤訊息**：`redirect_uri_mismatch`

**解決方案**：
1. 檢查 Google Cloud Console 中的授權重定向 URI
2. 確保 URI 完全匹配（包括協議、域名、路徑）
3. 不要在 URI 末尾添加斜線

### 問題 2：客戶端 ID 或密鑰無效

**錯誤訊息**：`invalid_client`

**解決方案**：
1. 重新檢查 Supabase 中的 Client ID 和 Client Secret
2. 確保沒有多餘的空格或字符
3. 重新生成客戶端密鑰（如果需要）

### 問題 3：OAuth 同意畫面未配置

**錯誤訊息**：`access_denied`

**解決方案**：
1. 在 Google Cloud Console 中配置 OAuth 同意畫面
2. 添加必要的範圍：`email`、`profile`
3. 如果是內部應用，設定為「內部」；如果是公開應用，需要通過驗證

## 測試配置

配置完成後，您可以通過以下方式測試：

1. 在應用中點擊「使用 Google 登入」
2. 應該會重定向到 Google 登入頁面
3. 登入後應該會重定向回您的應用
4. 檢查瀏覽器開發者工具的控制台是否有錯誤

## 安全注意事項

1. **永不在前端代碼中暴露 Client Secret**
2. **定期輪換 OAuth 憑證**
3. **限制重定向 URI 到已知的安全域名**
4. **監控 OAuth 使用情況和異常活動**

## 聯繫支援

如果您在配置過程中遇到問題，請：

1. 檢查 Supabase 和 Google Cloud Console 的錯誤日誌
2. 確認所有步驟都已正確執行
3. 聯繫系統管理員或技術支援團隊

---

**最後更新**：2024-12-28
**版本**：1.0
