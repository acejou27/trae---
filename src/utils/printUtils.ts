/**
 * 列印工具函數
 * Created: 2024-12-28
 */

import type { Quote } from '../types';

/**
 * 列印報價單
 * @param quote - 報價單資料
 */
export async function printQuote(quote: Quote): Promise<void> {
  try {
    // 獲取公司設定
    const companySettings = getCompanySettings();
    
    // 生成列印用的HTML內容
    const printContent = generatePrintHTML(quote, companySettings);
    
    // 創建隱藏的iframe用於列印
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    
    document.body.appendChild(iframe);
    
    // 寫入HTML內容
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error('無法創建列印文檔');
    }
    
    iframeDoc.open();
    iframeDoc.write(printContent);
    iframeDoc.close();
    
    // 等待內容載入完成後列印
    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        
        // 列印完成後移除iframe
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      } catch (printError) {
        console.error('列印執行失敗:', printError);
        document.body.removeChild(iframe);
        throw printError;
      }
    };
    
  } catch (error) {
    console.error('列印失敗:', error);
    throw error;
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
    logo: null
  };
}

/**
 * 生成列印用的HTML內容
 * @param quote - 報價單資料
 * @param companySettings - 公司設定
 */
function generatePrintHTML(quote: Quote, companySettings: any): string {
  const logoHtml = companySettings.logo 
    ? `<img src="${companySettings.logo}" alt="公司Logo" style="max-height: 80px; max-width: 200px; margin-bottom: 20px;">` 
    : '';

  return `
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>報價單 - ${quote.quote_number}</title>
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
          background: white;
          padding: 20px;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 20px;
        }
        
        .company-info {
          margin-bottom: 20px;
        }
        
        .quote-title {
          font-size: 28px;
          font-weight: bold;
          color: #1f2937;
          margin: 10px 0;
        }
        
        .quote-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }
        
        .info-section {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
        }
        
        .info-title {
          font-size: 16px;
          font-weight: bold;
          color: #374151;
          margin-bottom: 15px;
          border-bottom: 1px solid #d1d5db;
          padding-bottom: 5px;
        }
        
        .info-item {
          margin-bottom: 8px;
          display: flex;
        }
        
        .info-label {
          font-weight: 600;
          color: #6b7280;
          min-width: 80px;
        }
        
        .info-value {
          color: #1f2937;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .items-table th,
        .items-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .items-table th {
          background-color: #f3f4f6;
          font-weight: 600;
          color: #374151;
        }
        
        .items-table tr:hover {
          background-color: #f9fafb;
        }
        
        .text-right {
          text-align: right;
        }
        
        .total-section {
          margin-top: 20px;
          text-align: right;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          padding: 8px 0;
        }
        
        .total-label {
          font-weight: 600;
          color: #6b7280;
        }
        
        .total-value {
          font-weight: 600;
          color: #1f2937;
        }
        
        .grand-total {
          border-top: 2px solid #e5e7eb;
          padding-top: 12px;
          font-size: 18px;
          font-weight: bold;
          color: #dc2626;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          .container {
            max-width: none;
            margin: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="company-info">
            ${logoHtml}
            <h1>${companySettings.companyName}</h1>
            ${companySettings.address ? `<p>${companySettings.address}</p>` : ''}
            ${companySettings.phone ? `<p>電話: ${companySettings.phone}</p>` : ''}
            ${companySettings.email ? `<p>Email: ${companySettings.email}</p>` : ''}
          </div>
          <h2 class="quote-title">報價單</h2>
        </div>
        
        <div class="quote-info">
          <div class="info-section">
            <h3 class="info-title">報價單資訊</h3>
            <div class="info-item">
              <span class="info-label">報價單號:</span>
              <span class="info-value">${quote.quote_number}</span>
            </div>
            <div class="info-item">
              <span class="info-label">報價日期:</span>
              <span class="info-value">${new Date(quote.quote_date).toLocaleDateString('zh-TW')}</span>
            </div>
            <div class="info-item">
              <span class="info-label">有效期限:</span>
              <span class="info-value">${new Date(quote.valid_until).toLocaleDateString('zh-TW')}</span>
            </div>
            <div class="info-item">
              <span class="info-label">負責人:</span>
              <span class="info-value">${quote.staff?.name || '未指定'}</span>
            </div>
          </div>
          
          <div class="info-section">
            <h3 class="info-title">客戶資訊</h3>
            <div class="info-item">
              <span class="info-label">公司名稱:</span>
              <span class="info-value">${quote.customer?.company_name || '未知客戶'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">聯絡人:</span>
              <span class="info-value">${quote.contact_person}</span>
            </div>
            ${quote.customer?.phone ? `
            <div class="info-item">
              <span class="info-label">電話:</span>
              <span class="info-value">${quote.customer.phone}</span>
            </div>` : ''}
            ${quote.customer?.email ? `
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">${quote.customer.email}</span>
            </div>` : ''}
            ${quote.customer?.address ? `
            <div class="info-item">
              <span class="info-label">地址:</span>
              <span class="info-value">${quote.customer.address}</span>
            </div>` : ''}
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>項目名稱</th>
              <th>說明</th>
              <th class="text-right">數量</th>
              <th class="text-right">單位</th>
              <th class="text-right">單價</th>
              <th class="text-right">小計</th>
            </tr>
          </thead>
          <tbody>
            ${quote.items?.map(item => `
              <tr>
                <td>${item.product_name}</td>
                <td>${item.description || '-'}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">${item.unit}</td>
                <td class="text-right">NT$ ${item.unit_price.toLocaleString()}</td>
                <td class="text-right">NT$ ${(item.quantity * item.unit_price).toLocaleString()}</td>
              </tr>
            `).join('') || '<tr><td colspan="6" style="text-align: center; color: #6b7280;">無項目資料</td></tr>'}
          </tbody>
        </table>
        
        <div class="total-section">
          <div class="total-row">
            <span class="total-label">小計:</span>
            <span class="total-value">NT$ ${quote.subtotal?.toLocaleString() || '0'}</span>
          </div>
          <div class="total-row">
            <span class="total-label">稅額 (5%):</span>
            <span class="total-value">NT$ ${quote.tax?.toLocaleString() || '0'}</span>
          </div>
          <div class="total-row grand-total">
            <span class="total-label">總計:</span>
            <span class="total-value">NT$ ${quote.total.toLocaleString()}</span>
          </div>
        </div>
        
        ${quote.notes ? `
        <div style="margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px;">
          <h3 style="margin-bottom: 10px; color: #374151;">備註:</h3>
          <p style="color: #6b7280; white-space: pre-wrap;">${quote.notes}</p>
        </div>` : ''}
        
        <div class="footer">
          <p>此報價單由系統自動生成，列印時間: ${new Date().toLocaleString('zh-TW')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}