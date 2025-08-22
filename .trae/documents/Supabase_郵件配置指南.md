# Supabase 郵件配置指南

## 概述

本指南將幫助您配置 Supabase 的郵件認證功能，確保用戶註冊後能正常收到確認郵件。

## 🔧 Supabase 郵件設定步驟

### 1. 登錄 Supabase 控制台

1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇您的項目
3. 在左側導航欄中點擊 **Authentication**

### 2. 配置郵件設定

#### 2.1 基本郵件設定

1. 在 Authentication 頁面中，點擊 **Settings** 標籤
2. 找到 **SMTP Settings** 區域
3. 配置以下設定：

```
SMTP Host: smtp.gmail.com (以 Gmail 為例)
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Pass: your-app-password
SMTP Sender Name: 報價單管理系統
SMTP Sender Email: your-email@gmail.com
```

#### 2.2 郵件模板設定

1. 在 Authentication 頁面中，點擊 **Email Templates** 標籤
2. 配置 **Confirm signup** 模板：

```html
<h2>歡迎加入報價單管理系統！</h2>
<p>感謝您註冊我們的服務。請點擊下方連結確認您的電子郵件地址：</p>
<p><a href="{{ .ConfirmationURL }}">確認我的帳號</a></p>
<p>如果您沒有註冊此帳號，請忽略此郵件。</p>
<p>此連結將在 24 小時後失效。</p>
```

### 3. 郵件提供商設定

#### 3.1 使用 Gmail SMTP

1. **啟用兩步驟驗證**：
   - 前往 Google 帳戶設定
   - 啟用兩步驟驗證

2. **生成應用程式密碼**：
   - 前往 Google 帳戶 > 安全性
   - 點擊「應用程式密碼」
   - 選擇「郵件」和「其他」
   - 輸入「Supabase」作為應用程式名稱
   - 複製生成的 16 位密碼

3. **在 Supabase 中使用應用程式密碼**：
   - SMTP User: your-gmail@gmail.com
   - SMTP Pass: 剛才生成的 16 位應用程式密碼

#### 3.2 使用其他郵件服務

**Outlook/Hotmail:**
```
SMTP Host: smtp-mail.outlook.com
SMTP Port: 587
SMTP User: your-email@outlook.com
SMTP Pass: your-password
```

**Yahoo Mail:**
```
SMTP Host: smtp.mail.yahoo.com
SMTP Port: 587
SMTP User: your-email@yahoo.com
SMTP Pass: your-app-password
```

### 4. 測試郵件配置

1. 在 Supabase Dashboard 中，前往 **Authentication > Users**
2. 點擊 **Invite a user** 按鈕
3. 輸入測試郵件地址
4. 檢查是否收到邀請郵件

## 🐛 常見問題排除

### 問題 1：沒有收到確認郵件

**可能原因：**
- SMTP 設定錯誤
- 郵件被歸類為垃圾郵件
- 郵件服務商限制

**解決方案：**
1. 檢查 Supabase 控制台的 **Logs** 頁面是否有錯誤
2. 確認 SMTP 設定正確
3. 檢查垃圾郵件資料夾
4. 嘗試使用不同的郵件地址測試

### 問題 2：郵件發送頻率限制

**錯誤訊息：** "Email rate limit exceeded"

**解決方案：**
1. 等待一段時間後再試
2. 檢查是否在短時間內發送了太多郵件
3. 考慮升級 Supabase 方案以獲得更高的限制

### 問題 3：SMTP 認證失敗

**錯誤訊息：** "SMTP authentication failed"

**解決方案：**
1. 確認郵件地址和密碼正確
2. 對於 Gmail，確保使用應用程式密碼而非帳戶密碼
3. 檢查郵件服務商是否啟用了「安全性較低的應用程式存取權」

### 問題 4：郵件模板錯誤

**錯誤訊息：** "Invalid email template"

**解決方案：**
1. 檢查郵件模板語法是否正確
2. 確保包含必要的變數（如 `{{ .ConfirmationURL }}`）
3. 測試模板預覽功能

## 📋 檢查清單

在部署到生產環境前，請確認以下項目：

- [ ] SMTP 設定已正確配置
- [ ] 郵件模板已自定義並測試
- [ ] 確認郵件能正常發送和接收
- [ ] 郵件確認流程完整測試
- [ ] 重新發送功能正常運作
- [ ] 錯誤處理機制完善

## 🔐 安全注意事項

1. **保護 SMTP 憑證**：
   - 不要在代碼中硬編碼 SMTP 密碼
   - 使用環境變數存儲敏感信息

2. **郵件內容安全**：
   - 避免在郵件中包含敏感信息
   - 使用 HTTPS 連結

3. **防止濫用**：
   - 實施郵件發送頻率限制
   - 監控異常的郵件發送活動

## 📞 技術支援

如果您在配置過程中遇到問題：

1. 查看 [Supabase 官方文檔](https://supabase.com/docs/guides/auth/auth-email)
2. 檢查 [Supabase 社群論壇](https://github.com/supabase/supabase/discussions)
3. 聯繫技術支援團隊

---

**最後更新：** 2024-12-28  
**版本：** 1.0.0
