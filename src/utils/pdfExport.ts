import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  fileName?: string;
  elementId: string;
  onStart?: () => void;
  onFinish?: () => void;
  onError?: (err: Error) => void;
}

/**
 * Xuất phần tử lá số ra tệp PDF chuẩn khổ A4 Landscape (khổ ngang).
 */
export async function exportChartToPdf({
  fileName = 'La_So_Tu_Vi.pdf',
  elementId,
  onStart,
  onFinish,
  onError,
}: PdfExportOptions): Promise<void> {
  try {
    if (onStart) onStart();

    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Không tìm thấy phần tử HTML có ID: "${elementId}"`);
    }

    // Chụp lại phần tử với độ phân giải cao để chữ sắc nét
    const canvas = await html2canvas(element, {
      scale: 2, // Đảm bảo độ nét cao cho chữ Hán và tiếng Việt
      useCORS: true,
      logging: false,
      backgroundColor: '#fbf9f4',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Tạo file PDF khổ A4 ngang
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Giữ lề trang 5mm
    const margin = 5;
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);

    const printWidth = imgWidth * ratio;
    const printHeight = imgHeight * ratio;

    const xPos = margin + (availableWidth - printWidth) / 2;
    const yPos = margin + (availableHeight - printHeight) / 2;

    pdf.addImage(imgData, 'JPEG', xPos, yPos, printWidth, printHeight, undefined, 'FAST');
    pdf.save(fileName);

    if (onFinish) onFinish();
  } catch (error: unknown) {
    console.error('Lỗi khi xuất PDF:', error);
    if (onError && error instanceof Error) {
      onError(error);
    } else if (onError) {
      onError(new Error(String(error)));
    }
  }
}

/**
 * Mở hộp thoại in mặc định của trình duyệt để lưu PDF vector chất lượng tối cao.
 */
export function printChart(): void {
  window.print();
}
