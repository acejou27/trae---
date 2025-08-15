/**
 * PDF匯出工具函數
 * Created: 2024-12-28
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Quote } from '../types';

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
    
    // 設定字體（支援中文）
    pdf.setFont('helvetica');
    
    // 標題
    pdf.setFontSize(20);
    pdf.text('報價單列表', 105, 20, { align: 'center' });
    
    // 生成日期
    pdf.setFontSize(10);
    pdf.text(`生成日期: ${new Date().toLocaleDateString('zh-TW')}`, 20, 30);
    
    // 表格標題
    pdf.setFontSize(12);
    let yPosition = 50;
    const lineHeight = 8;
    
    // 表格標題行
    pdf.text('報價單號', 20, yPosition);
    pdf.text('客戶名稱', 60, yPosition);
    pdf.text('聯絡人', 100, yPosition);
    pdf.text('報價日期', 130, yPosition);
    pdf.text('總金額', 160, yPosition);
    pdf.text('狀態', 180, yPosition);
    
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
      pdf.text(quote.customer?.company_name || '未知', 60, yPosition);
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
    pdf.text(`總計: ${quotes.length} 筆報價單`, 20, yPosition);
    
    const totalAmount = quotes.reduce((sum, quote) => sum + quote.total, 0);
    pdf.text(`總金額: NT$ ${totalAmount.toLocaleString()}`, 20, yPosition + 10);
    
    // 儲存PDF
    pdf.save(filename);
    
    console.log(`報價單列表PDF匯出成功: ${filename}`);
  } catch (error) {
    console.error('報價單列表PDF匯出失敗:', error);
    throw new Error(`報價單列表PDF匯出失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}

/**
 * 取得狀態顯示文字
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