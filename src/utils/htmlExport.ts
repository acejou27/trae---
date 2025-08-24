/**
 * HTML匯出工具函數
 * Created: 2024-12-28
 */

import type { Quote } from '../types';

/**
 * HTML匯出選項
 */
interface HTMLExportOptions {
  filename?: string;
  includeStyles?: boolean;
}

/**
 * 匯出報價單為HTML
 * @param quote - 報價單資料
 * @param options - 匯出選項
 */
export async function exportQuoteToHTML(
  quote: Quote,
  options: HTMLExportOptions = {}
): Promise<void> {
  try {
    const {
      filename = `報價單_${quote.quote_number}_${new Date().toISOString().split('T')[0]}.html`,
      includeStyles = true
    } = options;

    // 生成HTML內容
    const htmlContent = generateQuoteHTML(quote, includeStyles);

    // 創建Blob並下載
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 清理URL
    URL.revokeObjectURL(url);
    
    console.log(`HTML匯出成功: ${filename}`);
  } catch (error) {
    console.error('HTML匯出失敗:', error);
    throw new Error(`HTML匯出失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}

/**
 * 獲取公司設定
 */
function getCompanySettings() {
  const settings = localStorage.getItem('companySettings');
  return settings ? JSON.parse(settings) : {
    companyName: '您的公司名稱',
    address: '',
    phone: '',
    email: '',
    website: '',
    taxId: '',
    logo: null
  };
}

/**
 * 生成報價單HTML內容
 * @param quote - 報價單資料
 * @param includeStyles - 是否包含樣式
 */
function generateQuoteHTML(quote: Quote, includeStyles: boolean): string {
  const styles = includeStyles ? getQuoteStyles() : '';
  const companySettings = getCompanySettings();
  
  // 計算小計、稅額和總計
  const items = quote.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const taxRate = 0.05; // 5% 稅率
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>報價單 - ${quote.quote_number}</title>
  ${styles}
</head>
<body>
  <div class="quote-container">
    <!-- 公司標題 -->
    <div class="header">
      ${companySettings.logo ? `<div class="company-logo"><img src="${companySettings.logo}" alt="公司Logo" style="width: 120px; height: 120px; object-fit: contain; margin-bottom: 20px;" /></div>` : ''}
      <h1>報價單</h1>
      <div class="company-name">${companySettings.companyName}</div>
      ${companySettings.address ? `<div class="company-address">${companySettings.address}</div>` : ''}
      <div class="company-contact">
        ${companySettings.phone ? `<span>電話: ${companySettings.phone}</span>` : ''}
        ${companySettings.email ? `<span>Email: ${companySettings.email}</span>` : ''}
      </div>
      ${companySettings.taxId ? `<div class="company-tax-id">統一編號: ${companySettings.taxId}</div>` : ''}
    </div>
    
    <!-- 基本資訊 -->
    <div class="basic-info">
      <div class="info-section">
        <div class="info-column">
          <h3>客戶資訊</h3>
          <div class="info-details">
            <div class="info-item">
              <span class="label">公司名稱:</span>
              <span class="value">${quote.customer?.company_name || '未知客戶'}</span>
            </div>
            <div class="info-item">
              <span class="label">聯絡人:</span>
              <span class="value">${quote.contact_person}</span>
            </div>
            ${quote.customer?.phone ? `
            <div class="info-item">
              <span class="label">電話:</span>
              <span class="value">${quote.customer.phone}</span>
            </div>` : ''}
            ${quote.customer?.email ? `
            <div class="info-item">
              <span class="label">電子郵件:</span>
              <span class="value">${quote.customer.email}</span>
            </div>` : ''}
            ${quote.customer?.address ? `
            <div class="info-item">
              <span class="label">地址:</span>
              <span class="value">${quote.customer.address}</span>
            </div>` : ''}
          </div>
        </div>
        
        <div class="info-column">
          <h3>報價資訊</h3>
          <div class="info-details">
            <div class="info-item">
              <span class="label">報價單號:</span>
              <span class="value">${quote.quote_number}</span>
            </div>
            <div class="info-item">
              <span class="label">報價日期:</span>
              <span class="value">${new Date(quote.quote_date).toLocaleDateString('zh-TW')}</span>
            </div>
            <div class="info-item">
              <span class="label">有效期限:</span>
              <span class="value">${new Date(quote.valid_until).toLocaleDateString('zh-TW')}</span>
            </div>
            <div class="info-item">
              <span class="label">負責人:</span>
              <span class="value">${quote.contact_person}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 報價項目 -->
    <div class="items-section">
      <h3>報價項目</h3>
      <table class="items-table">
        <thead>
          <tr>
            <th>項目</th>
            <th>說明</th>
            <th>數量</th>
            <th>單位</th>
            <th>單價</th>
            <th>小計</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
          <tr>
            <td>${item.product_name}</td>
            <td>${item.description || '-'}</td>
            <td>${item.quantity}</td>
            <td>${item.unit}</td>
            <td>NT$ ${item.unit_price.toLocaleString()}</td>
            <td>NT$ ${(item.quantity * item.unit_price).toLocaleString()}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    
    <!-- 報價章和金額計算 -->
    <div class="quote-footer">
      <!-- 報價章 -->
      <div class="stamp-section">
        <div class="stamp-container">
          <h4>報價章</h4>
          ${companySettings.stamp ? `
          <div class="stamp-image">
            <img src="${companySettings.stamp}" alt="報價章" />
          </div>` : `
          <div class="stamp-placeholder">
            <span>報價章</span>
          </div>`}
        </div>
      </div>

      <!-- 金額計算 -->
      <div class="totals-section">
        <div class="totals-table">
          <div class="total-row">
            <span class="total-label">小計:</span>
            <span class="total-value">NT$ ${subtotal.toLocaleString()}</span>
          </div>
          <div class="total-row">
            <span class="total-label">稅額 (5%):</span>
            <span class="total-value">NT$ ${tax.toLocaleString()}</span>
          </div>
          <div class="total-row final-total">
            <span class="total-label">總計:</span>
            <span class="total-value">NT$ ${total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 備註 -->
    ${quote.notes ? `
    <div class="notes-section">
      <h3>備註</h3>
      <div class="notes-content">
        <p>${quote.notes}</p>
      </div>
    </div>` : ''}
    
    <!-- 頁尾 -->
    <div class="footer">
      <p>此報價單由系統自動生成，生成時間: ${new Date().toLocaleString('zh-TW')}</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * 獲取報價單樣式
 */
function getQuoteStyles(): string {
  return `
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Microsoft JhengHei', 'PingFang TC', 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      padding: 20px;
    }
    
    .quote-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #e5e5e5;
      padding-bottom: 20px;
    }
    
    .header h1 {
      font-size: 2.5em;
      color: #2c3e50;
      margin-bottom: 10px;
      font-weight: bold;
    }
    
    .company-logo {
      margin-bottom: 15px;
      display: flex;
      justify-content: center;
    }
    
    .company-logo img {
      width: 120px;
      height: 120px;
      object-fit: contain;
    }
    
    .company-name {
      font-size: 1.2em;
      color: #2c3e50;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .company-address {
      font-size: 0.9em;
      color: #7f8c8d;
      margin-bottom: 5px;
    }
    
    .company-contact {
      font-size: 0.9em;
      color: #7f8c8d;
      margin-bottom: 5px;
    }
    
    .company-contact span {
      margin-right: 15px;
    }
    
    .company-tax-id {
      font-size: 0.9em;
      color: #7f8c8d;
    }
    
    .basic-info {
      margin-bottom: 30px;
    }
    
    .info-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    
    .info-column h3 {
      color: #2c3e50;
      margin-bottom: 15px;
      font-size: 1.125em;
      font-weight: 500;
    }
    
    .info-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .info-item {
      display: flex;
      align-items: flex-start;
    }
    
    .info-item .label {
      font-weight: 500;
      color: #6b7280;
      font-size: 0.875em;
      min-width: 80px;
      margin-right: 8px;
    }
    
    .info-item .value {
      color: #111827;
      font-size: 0.875em;
      flex: 1;
    }
    
    .items-section {
      margin-bottom: 30px;
    }
    
    .items-section h3 {
      color: #2c3e50;
      margin-bottom: 15px;
      font-size: 1.125em;
      font-weight: 500;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      overflow: hidden;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }
    
    .items-table th {
      background-color: #f9fafb;
      padding: 12px 24px;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 500;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .items-table td {
      padding: 16px 24px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 0.875rem;
      color: #111827;
    }
    
    .items-table tbody tr:last-child td {
      border-bottom: none;
    }
    
    .items-table td:nth-child(1) {
      font-weight: 500;
    }
    
    .items-table td:nth-child(3),
    .items-table td:nth-child(4),
    .items-table td:nth-child(5),
    .items-table td:nth-child(6) {
      white-space: nowrap;
    }
    
    .quote-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      gap: 24px;
    }
    
    .stamp-section {
      flex-shrink: 0;
    }
    
    .stamp-container {
      text-align: center;
    }
    
    .stamp-container h4 {
      font-size: 0.875rem;
      font-weight: 500;
      color: #111827;
      margin-bottom: 8px;
    }
    
    .stamp-image img {
      width: 96px;
      height: 96px;
      object-fit: contain;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
    }
    
    .stamp-placeholder {
      width: 96px;
      height: 96px;
      background-color: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .stamp-placeholder span {
      font-size: 0.75rem;
      color: #6b7280;
    }
    
    .totals-section {
      width: 256px;
    }
    
    .totals-table {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .total-row.final-total {
      border-top: 1px solid #e5e7eb;
      padding-top: 8px;
      margin-top: 8px;
    }
    
    .total-label {
      font-size: 0.875rem;
      color: #6b7280;
    }
    
    .total-value {
      font-size: 0.875rem;
      font-weight: 500;
      color: #111827;
    }
    
    .final-total .total-label {
      font-size: 1rem;
      font-weight: 500;
      color: #111827;
    }
    
    .final-total .total-value {
      font-size: 1rem;
      font-weight: 700;
      color: #111827;
    }
    
    .notes-section {
      margin-bottom: 30px;
    }
    
    .notes-section h3 {
      color: #2c3e50;
      margin-bottom: 15px;
      font-size: 1.125em;
      font-weight: 500;
    }
    
    .notes-section .notes-content {
      background-color: #f9fafb;
      padding: 16px;
      border-radius: 8px;
    }
    
    .notes-section p {
      font-size: 0.875rem;
      color: #374151;
      white-space: pre-wrap;
      margin: 0;
      line-height: 1.5;
    }
    
    .footer {
      text-align: center;
      color: #7f8c8d;
      font-size: 0.9em;
      border-top: 1px solid #e5e5e5;
      padding-top: 20px;
    }
    

    
    @media print {
      body {
        background-color: white;
        padding: 0;
      }
      
      .quote-container {
        box-shadow: none;
        border-radius: 0;
        padding: 20px;
      }
    }
    
    @media (max-width: 768px) {
      .quote-container {
        padding: 20px;
      }
      
      .info-section {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .quote-footer {
        flex-direction: column;
        align-items: center;
        gap: 16px;
      }
      
      .totals-section {
        width: 100%;
        max-width: 300px;
      }
      
      .items-table {
        font-size: 0.8rem;
      }
      
      .items-table th,
      .items-table td {
        padding: 8px 12px;
      }
      
      .items-table th {
        font-size: 0.7rem;
      }
    }
  </style>`;
}

/**
 * 預覽報價單HTML
 * @param quote - 報價單資料
 */
export function previewQuoteHTML(quote: Quote): void {
  const htmlContent = generateQuoteHTML(quote, true);
  const newWindow = window.open('', '_blank');
  
  if (newWindow) {
    // 使用安全的方法替代 document.write
    const doc = newWindow.document;
    doc.open();
    doc.documentElement.innerHTML = htmlContent;
    doc.close();
  } else {
    alert('無法開啟預覽視窗，請檢查瀏覽器設定');
  }
}