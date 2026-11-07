import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const MODERN_COLOR_FUNCTIONS = new Set(['color-mix', 'oklab', 'oklch', 'lab', 'lch', 'hwb', 'color']);

function makeColorFunctionFallback(document: Document) {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return (value: string) => value;

  return (value: string): string => {
    let output = '';
    let cursor = 0;

    while (cursor < value.length) {
      const openIndex = value.indexOf('(', cursor);
      if (openIndex < 0) {
        output += value.slice(cursor);
        break;
      }

      let nameStart = openIndex;
      while (nameStart > cursor && /[a-z-]/i.test(value[nameStart - 1]!)) nameStart -= 1;
      const functionName = value.slice(nameStart, openIndex).toLowerCase();
      if (!MODERN_COLOR_FUNCTIONS.has(functionName)) {
        output += value.slice(cursor, openIndex + 1);
        cursor = openIndex + 1;
        continue;
      }

      let depth = 1;
      let closeIndex = openIndex + 1;
      while (closeIndex < value.length && depth > 0) {
        if (value[closeIndex] === '(') depth += 1;
        else if (value[closeIndex] === ')') depth -= 1;
        closeIndex += 1;
      }
      if (depth !== 0) {
        output += value.slice(cursor);
        break;
      }

      output += value.slice(cursor, nameStart);
      const colorFunction = value.slice(nameStart, closeIndex);
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = 'rgb(1, 2, 3)';
      context.fillStyle = colorFunction;
      if (context.fillStyle === 'rgb(1, 2, 3)') {
        output += colorFunction;
      } else {
        context.fillRect(0, 0, 1, 1);
        const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
        output += alpha === 255
          ? `rgb(${red}, ${green}, ${blue})`
          : `rgba(${red}, ${green}, ${blue}, ${Number((alpha / 255).toFixed(3))})`;
      }
      cursor = closeIndex;
    }

    return output;
  };
}

function replaceUnsupportedColorsInClone(clonedDocument: Document, elementId: string, captureWidth: number): void {
  const root = clonedDocument.getElementById(elementId);
  const view = clonedDocument.defaultView;
  if (!root || !view) return;

  // Export at the chart's full layout size regardless of the on-screen zoom or viewport.
  root.style.setProperty('width', `${captureWidth}px`, 'important');
  root.style.setProperty('max-width', 'none', 'important');
  root.style.setProperty('transform', 'none', 'important');
  root.style.setProperty('transition', 'none', 'important');

  const replaceColorFunctions = makeColorFunctionFallback(clonedDocument);
  const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))];
  for (const element of elements) {
    const computedStyle = view.getComputedStyle(element);
    if (computedStyle.backgroundImage !== 'none') {
      // html2canvas builds a repeating canvas pattern for CSS backgrounds; flat paper colors
      // avoid zero-sized pattern canvases while retaining the chart's contrast in the PDF.
      const fallbackBackground = element.classList.contains('center-cell')
        ? '#fff3f3'
        : element.classList.contains('chart-title-band')
          ? '#7f1d1d'
          : '#fffafa';
      element.style.setProperty('background-image', 'none', 'important');
      element.style.setProperty('background-color', fallbackBackground, 'important');
    }
    for (let index = 0; index < computedStyle.length; index += 1) {
      const property = computedStyle.item(index);
      const value = computedStyle.getPropertyValue(property);
      if (!/(?:color-mix|oklab|oklch|\blab|\blch|\bhwb|\bcolor)\(/i.test(value)) continue;
      const fallback = replaceColorFunctions(value);
      if (fallback !== value) element.style.setProperty(property, fallback, 'important');
    }
  }
}

export interface PdfExportOptions {
  fileName?: string;
  elementId: string;
  onStart?: () => void;
  onFinish?: () => void;
  onError?: (err: Error) => void;
}

/**
 * Xuất phần tử lá số ra tệp PDF A4, tự chọn khổ dọc/ngang theo tỷ lệ lá số.
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

    await document.fonts.ready;
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const captureWidth = element.offsetWidth || element.scrollWidth;

    // Chụp bản clone sau khi font tải xong và bỏ phụ thuộc vào zoom của giao diện.
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#fffafa',
      windowWidth: Math.max(window.innerWidth, captureWidth),
      windowHeight: Math.max(window.innerHeight, element.scrollHeight),
      onclone: async clonedDocument => {
        await clonedDocument.fonts.ready;
        await new Promise<void>(resolve => {
          const clonedWindow = clonedDocument.defaultView;
          if (clonedWindow) clonedWindow.requestAnimationFrame(() => resolve());
          else resolve();
        });
        replaceUnsupportedColorsInClone(clonedDocument, elementId, captureWidth);
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Chọn hướng trang theo tỷ lệ thực tế để lá số lấp đầy trang hơn.
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
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
