/**
 * PDF匯出工具函數
 * Created: 2024-12-28
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import type { Quote } from '../types';

// 擴展jsPDF類型以支援autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * 取得狀態顯示文字
 * @param status - 報價單狀態
 * @returns 狀態文字
 */
function getStatusText(status: Quote['status']): string {
  switch (status) {
    case 'draft': return '草稿';
    case 'sent': return '已發送';
    case 'accepted': return '已接受';
    case 'rejected': return '已拒絕';
    default: return '未知';
  }
}

/**
 * PDF匯出選項
 */
interface PDFExportOptions {
  filename?: string;
  quality?: number;
  scale?: number;
}

/**
 * 匯出報價單為PDF
 * @param elementId - 要匯出的HTML元素ID
 * @param quote - 報價單資料
 * @param options - 匯出選項
 */
export async function exportQuoteToPDF(
  elementId: string,
  quote: Quote,
  options: PDFExportOptions = {}
): Promise<void> {
  try {
    const {
      filename = `報價單_${quote.quote_number}_${new Date().toISOString().split('T')[0]}.pdf`,
      quality = 1,
      scale = 2
    } = options;

    // 取得要匯出的HTML元素
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`找不到ID為 "${elementId}" 的元素`);
    }

    // 暫時隱藏不需要匯出的元素（如操作按鈕）
    const elementsToHide = element.querySelectorAll('.no-print');
    const originalDisplays: string[] = [];
    
    elementsToHide.forEach((el, index) => {
      const htmlEl = el as HTMLElement;
      originalDisplays[index] = htmlEl.style.display;
      htmlEl.style.display = 'none';
    });

    // 設定canvas選項
    const canvasOptions = {
      allowTaint: true,
      useCORS: true,
      scale: scale,
      width: element.scrollWidth,
      height: element.scrollHeight,
      backgroundColor: '#ffffff'
    };

    // 將HTML轉換為canvas
    const canvas = await html2canvas(element, canvasOptions);
    
    // 恢復隱藏的元素
    elementsToHide.forEach((el, index) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.display = originalDisplays[index];
    });

    // 計算PDF尺寸
    const imgWidth = 210; // A4寬度 (mm)
    const pageHeight = 295; // A4高度 (mm)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // 建立PDF文件
    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;

    // 將canvas轉換為圖片
    const imgData = canvas.toDataURL('image/png', quality);

    // 如果內容高度超過一頁，需要分頁
    if (heightLeft <= pageHeight) {
      // 單頁
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    } else {
      // 多頁
      while (heightLeft >= 0) {
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        position -= pageHeight;
        
        if (heightLeft > 0) {
          pdf.addPage();
        }
      }
    }

    // 儲存PDF
    pdf.save(filename);
    
    console.log(`PDF匯出成功: ${filename}`);
  } catch (error) {
    console.error('PDF匯出失敗:', error);
    throw new Error(`PDF匯出失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}

/**
 * 直接匯出單個報價單為PDF（不依賴DOM元素）
 * @param quote - 報價單資料
 * @param options - 匯出選項
 */
export async function exportQuoteDirectToPDF(
  quote: Quote,
  options: PDFExportOptions = {}
): Promise<void> {
  try {
    const {
      filename = `報價單_${quote.quote_number}_${new Date().toISOString().split('T')[0]}.pdf`,
    } = options;

    const pdf = new jsPDF('p', 'mm', 'a4');
     
     // 設定字體（支援中文）- 使用內建字體並設定編碼
     pdf.setFont('helvetica');
     pdf.setCharSpace(0.5); // 設定字符間距以改善中文顯示
     
     // 設定文檔屬性
     pdf.setProperties({
       title: `報價單_${quote.quote_number}`,
       subject: '報價單',
       author: '報價單系統',
       creator: '報價單系統'
     });
    
    // 標題
     pdf.setFontSize(20);
     pdf.text('\u5831\u50F9\u55AE', 105, 20, { align: 'center' }); // 報價單
     
     // 報價單號
     pdf.setFontSize(14);
     pdf.text(`\u5831\u50F9\u55AE\u865F: ${quote.quote_number}`, 20, 35); // 報價單號
    
    // 客戶資訊
     pdf.setFontSize(12);
     let yPosition = 50;
     pdf.text('\u5BA2\u6236\u8CC7\u8A0A:', 20, yPosition); // 客戶資訊
     yPosition += 8;
     
     if (quote.customer?.company_name) {
       pdf.text(`\u516C\u53F8\u540D\u7A31: ${quote.customer.company_name}`, 25, yPosition); // 公司名稱
       yPosition += 6;
     }
     
     pdf.text(`\u806F\u7D61\u4EBA: ${quote.contact_person}`, 25, yPosition); // 聯絡人
     yPosition += 6;
     
     if (quote.customer?.phone) {
       pdf.text(`\u96FB\u8A71: ${quote.customer.phone}`, 25, yPosition); // 電話
       yPosition += 6;
     }
     
     if (quote.customer?.email) {
       pdf.text(`\u96FB\u5B50\u90F5\u4EF6: ${quote.customer.email}`, 25, yPosition); // 電子郵件
       yPosition += 6;
     }
    
    // 報價資訊
     yPosition += 10;
     pdf.text('\u5831\u50F9\u8CC7\u8A0A:', 20, yPosition); // 報價資訊
     yPosition += 8;
     
     pdf.text(`\u5831\u50F9\u65E5\u671F: ${new Date(quote.quote_date).toLocaleDateString('zh-TW')}`, 25, yPosition); // 報價日期
     yPosition += 6;
     
     pdf.text(`\u6709\u6548\u671F\u9650: ${new Date(quote.valid_until).toLocaleDateString('zh-TW')}`, 25, yPosition); // 有效期限
     yPosition += 6;
     
     const statusText = getStatusText(quote.status);
     pdf.text(`\u72C0\u614B: ${statusText}`, 25, yPosition); // 狀態
     yPosition += 15;
     
     // 總金額
     pdf.setFontSize(14);
     pdf.text(`\u7E3D\u91D1\u984D: NT$ ${quote.total.toLocaleString()}`, 20, yPosition); // 總金額
    
    // 備註
     if (quote.notes) {
       yPosition += 15;
       pdf.setFontSize(10);
       pdf.text('\u5099\u8A3B:', 20, yPosition); // 備註
       yPosition += 6;
       
       // 處理長文本換行
       const lines = pdf.splitTextToSize(quote.notes, 170);
       pdf.text(lines, 25, yPosition);
     }
    
    // 儲存PDF
    pdf.save(filename);
    
    console.log(`報價單PDF匯出成功: ${filename}`);
  } catch (error) {
    console.error('報價單PDF匯出失敗:', error);
    throw new Error(`報價單PDF匯出失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}

/**
 * 匯出報價單列表為PDF
 * @param quotes - 報價單列表
 * @param options - 匯出選項
 */
export async function exportQuoteListToPDF(
  quotes: Quote[],
  options: PDFExportOptions = {}
): Promise<void> {
  try {
    const {
      filename = `報價單列表_${new Date().toISOString().split('T')[0]}.pdf`,
    } = options;

    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // 設定字體（支援中文）- 使用內建字體並設定編碼
    pdf.setFont('helvetica');
    pdf.setCharSpace(0.5); // 設定字符間距以改善中文顯示
    
    // 標題
    pdf.setFontSize(20);
    pdf.text('\u5831\u50F9\u55AE\u5217\u8868', 105, 20, { align: 'center' }); // 報價單列表
    
    // 生成日期
    pdf.setFontSize(10);
    pdf.text(`\u751F\u6210\u65E5\u671F: ${new Date().toLocaleDateString('zh-TW')}`, 20, 30); // 生成日期
    
    // 表格標題
    pdf.setFontSize(12);
    let yPosition = 50;
    const lineHeight = 8;
    
    // 表格標題行
    pdf.text('\u5831\u50F9\u55AE\u865F', 20, yPosition); // 報價單號
    pdf.text('\u5BA2\u6236\u540D\u7A31', 60, yPosition); // 客戶名稱
    pdf.text('\u806F\u7D61\u4EBA', 100, yPosition); // 聯絡人
    pdf.text('\u5831\u50F9\u65E5\u671F', 130, yPosition); // 報價日期
    pdf.text('\u7E3D\u91D1\u984D', 160, yPosition); // 總金額
    pdf.text('\u72C0\u614B', 180, yPosition); // 狀態
    
    // 畫線
    pdf.line(20, yPosition + 2, 190, yPosition + 2);
    yPosition += 10;
    
    // 資料行
    pdf.setFontSize(10);
    quotes.forEach((quote) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      
      const statusText = getStatusText(quote.status);
      
      pdf.text(quote.quote_number, 20, yPosition);
      pdf.text(quote.customer?.company_name || '\u672A\u77E5', 60, yPosition); // 未知
      pdf.text(quote.contact_person, 100, yPosition);
      pdf.text(new Date(quote.quote_date).toLocaleDateString('zh-TW'), 130, yPosition);
      pdf.text(quote.total.toLocaleString(), 160, yPosition);
      pdf.text(statusText, 180, yPosition);
      
      yPosition += lineHeight;
    });
    
    // 統計資訊
    yPosition += 10;
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(12);
    pdf.text(`\u7E3D\u8A08: ${quotes.length} \u7B46\u5831\u50F9\u55AE`, 20, yPosition); // 總計: X 筆報價單
    
    const totalAmount = quotes.reduce((sum, quote) => sum + quote.total, 0);
    pdf.text(`\u7E3D\u91D1\u984D: NT$ ${totalAmount.toLocaleString()}`, 20, yPosition + 10); // 總金額
    
    // 儲存PDF
    pdf.save(filename);
    
    console.log(`報價單列表PDF匯出成功: ${filename}`);
  } catch (error) {
    console.error('報價單列表PDF匯出失敗:', error);
    throw new Error(`報價單列表PDF匯出失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}



/**
 * 預覽PDF（在新視窗中開啟）
 * @param elementId - 要預覽的HTML元素ID
 * @param quote - 報價單資料
 */
export async function previewQuotePDF(
  elementId: string
): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`找不到ID為 "${elementId}" 的元素`);
    }

    // 暫時隱藏不需要預覽的元素
    const elementsToHide = element.querySelectorAll('.no-print');
    const originalDisplays: string[] = [];
    
    elementsToHide.forEach((el, index) => {
      const htmlEl = el as HTMLElement;
      originalDisplays[index] = htmlEl.style.display;
      htmlEl.style.display = 'none';
    });

    // 將HTML轉換為canvas
    const canvas = await html2canvas(element, {
      allowTaint: true,
      useCORS: true,
      scale: 2,
      backgroundColor: '#ffffff'
    });
    
    // 恢復隱藏的元素
    elementsToHide.forEach((el, index) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.display = originalDisplays[index];
    });

    // 建立PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL('image/png', 1);
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // 在新視窗中開啟PDF預覽
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    
    console.log('PDF預覽開啟成功');
  } catch (error) {
    console.error('PDF預覽失敗:', error);
    throw new Error(`PDF預覽失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}