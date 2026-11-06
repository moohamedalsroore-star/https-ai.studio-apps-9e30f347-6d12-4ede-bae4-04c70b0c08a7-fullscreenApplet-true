// PDF Export & Generation Utility using html2pdf.js
// Handles document conversion to PDF, direct mobile/desktop device download, and screen preview blob generation
// Specifically engineered to eliminate Tailwind CSS v4 "oklab" and "oklch" color function incompatibilities in html2canvas.
// @ts-ignore html2pdf.js untyped module compatibility
import html2pdf from 'html2pdf.js';

export interface PDFExportOptions {
  filename?: string;
  margin?: number | [number, number, number, number];
  landscape?: boolean;
}

// Canvas-based parser to accurately convert any modern CSS color (oklab, oklch, lab, rgb, etc.) to standard rgb/rgba
let helperCtx: CanvasRenderingContext2D | null = null;
function getHelperCtx(): CanvasRenderingContext2D | null {
  if (!helperCtx && typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    helperCtx = canvas.getContext('2d');
  }
  return helperCtx;
}

/**
 * Mathematical fallback converting OKLab to standard sRGB string
 * Follows W3C CSS Color Module Level 4 specification.
 */
export function fallbackOklabToRgb(str: string): string {
  try {
    const match = str.match(/oklab\(\s*([\d.]+%?)\s+([\d.-]+%?)\s+([\d.-]+%?)(?:\s*\/\s*([\d.]+%?))?\s*\)/i);
    if (!match) return '#334155';
    let l = parseFloat(match[1]);
    if (match[1].endsWith('%')) l = l / 100;
    let a = parseFloat(match[2]);
    if (match[2].endsWith('%')) a = (a / 100) * 0.4;
    let b = parseFloat(match[3]);
    if (match[3].endsWith('%')) b = (b / 100) * 0.4;
    const alpha = match[4] ? (match[4].endsWith('%') ? parseFloat(match[4]) / 100 : parseFloat(match[4])) : 1;

    // Convert OKLab to linear RGB
    const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

    const lCube = l_ * l_ * l_;
    const mCube = m_ * m_ * m_;
    const sCube = s_ * s_ * s_;

    const rLin = +4.0767416621 * lCube - 3.3077115913 * mCube + 0.2309699292 * sCube;
    const gLin = -1.2684380046 * lCube + 2.6097574011 * mCube - 0.3413193965 * sCube;
    const bLin = -0.0041960863 * lCube - 0.7034186147 * mCube + 1.7076147010 * sCube;

    // Gamma correction to sRGB
    const gamma = (val: number) => {
      const clamped = Math.max(0, Math.min(1, val));
      return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
    };

    const r = Math.round(gamma(rLin) * 255);
    const g = Math.round(gamma(gLin) * 255);
    const bColor = Math.round(gamma(bLin) * 255);

    if (alpha < 1) {
      return `rgba(${r}, ${g}, ${bColor}, ${alpha})`;
    }
    return `rgb(${r}, ${g}, ${bColor})`;
  } catch {
    return '#1e293b';
  }
}

/**
 * Mathematical fallback converting OKLCH to standard sRGB string
 * Follows W3C CSS Color Module Level 4 specification.
 */
export function fallbackOklchToRgb(str: string): string {
  try {
    const match = str.match(/oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)/i);
    if (!match) return '#334155';
    let l = parseFloat(match[1]);
    if (match[1].endsWith('%')) l = l / 100;
    const c = parseFloat(match[2]);
    const h = parseFloat(match[3]);
    const alpha = match[4] ? (match[4].endsWith('%') ? parseFloat(match[4]) / 100 : parseFloat(match[4])) : 1;

    // Convert OKLCH to OKLab
    const hRad = (h * Math.PI) / 180;
    const a = c * Math.cos(hRad);
    const b = c * Math.sin(hRad);

    // Convert OKLab to linear RGB
    const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

    const lCube = l_ * l_ * l_;
    const mCube = m_ * m_ * m_;
    const sCube = s_ * s_ * s_;

    const rLin = +4.0767416621 * lCube - 3.3077115913 * mCube + 0.2309699292 * sCube;
    const gLin = -1.2684380046 * lCube + 2.6097574011 * mCube - 0.3413193965 * sCube;
    const bLin = -0.0041960863 * lCube - 0.7034186147 * mCube + 1.7076147010 * sCube;

    // Gamma correction to sRGB
    const gamma = (val: number) => {
      const clamped = Math.max(0, Math.min(1, val));
      return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
    };

    const r = Math.round(gamma(rLin) * 255);
    const g = Math.round(gamma(gLin) * 255);
    const bColor = Math.round(gamma(bLin) * 255);

    if (alpha < 1) {
      return `rgba(${r}, ${g}, ${bColor}, ${alpha})`;
    }
    return `rgb(${r}, ${g}, ${bColor})`;
  } catch {
    return '#1e293b';
  }
}

/**
 * Converts any CSS color string containing modern color functions (oklab, oklch, lab, lch) to standard rgb/rgba
 */
export function convertModernCssColors(colorStr: string): string {
  if (!colorStr || typeof colorStr !== 'string') {
    return colorStr;
  }

  // Quick check if string has any modern CSS color function
  if (!colorStr.includes('oklab') && !colorStr.includes('oklch') && !colorStr.includes('lab(') && !colorStr.includes('lch(')) {
    return colorStr;
  }

  return colorStr.replace(/(?:oklab|oklch|lab|lch)\([^)]+\)/gi, (singleColor) => {
    const ctx = getHelperCtx();
    if (ctx) {
      try {
        ctx.fillStyle = '#000000';
        ctx.fillStyle = singleColor;
        const res = ctx.fillStyle;
        if (
          res &&
          !res.includes('oklab') &&
          !res.includes('oklch') &&
          !res.includes('lab')
        ) {
          return res;
        }
      } catch {
        // Fallback to math converter
      }
    }

    const lower = singleColor.toLowerCase();
    if (lower.startsWith('oklab')) {
      return fallbackOklabToRgb(singleColor);
    }
    if (lower.startsWith('oklch')) {
      return fallbackOklchToRgb(singleColor);
    }
    return '#334155';
  });
}

// Backwards compatibility alias
export const convertOklchStringToRgb = convertModernCssColors;

const COLOR_PROPERTIES = [
  'color',
  'backgroundColor',
  'borderColor',
  'borderTopColor',
  'borderBottomColor',
  'borderLeftColor',
  'borderRightColor',
  'outlineColor',
  'textDecorationColor',
  'fill',
  'stroke',
  'boxShadow',
  'caretColor',
] as const;

/**
 * Sanitizes all elements in a DOM subtree by replacing any computed OKLAB / OKLCH colors
 * with explicit standard RGB inline styles so html2canvas never encounters unsupported color functions.
 */
function sanitizeDomTreeColors(root: HTMLElement | Document) {
  const elements: Element[] = [];
  if ('style' in root && (root as HTMLElement).tagName) {
    elements.push(root as HTMLElement);
  }
  elements.push(...Array.from(root.querySelectorAll('*')));

  for (const el of elements) {
    const htmlEl = el as HTMLElement;
    if (!htmlEl.style) continue;

    try {
      const computed = window.getComputedStyle(htmlEl);
      for (const prop of COLOR_PROPERTIES) {
        // @ts-ignore
        const val = computed[prop];
        if (
          val &&
          typeof val === 'string' &&
          (val.includes('oklab') || val.includes('oklch') || val.includes('lab(') || val.includes('lch('))
        ) {
          const safeVal = convertModernCssColors(val);
          // @ts-ignore
          htmlEl.style[prop] = safeVal;
        }
      }
    } catch {
      // ignore detached or inaccessible elements
    }
  }

  // Also replace any oklab / oklch in all <style> blocks
  const styleTags = root.querySelectorAll('style');
  styleTags.forEach((styleTag) => {
    if (
      styleTag.textContent &&
      (styleTag.textContent.includes('oklab') ||
        styleTag.textContent.includes('oklch') ||
        styleTag.textContent.includes('lab(') ||
        styleTag.textContent.includes('lch('))
    ) {
      styleTag.textContent = convertModernCssColors(styleTag.textContent);
    }
  });
}

/**
 * Patches window.getComputedStyle in cloned iframe/document to transparently intercept
 * and convert any oklab / oklch return values on the fly.
 */
function patchClonedWindowComputedStyle(clonedDoc: Document) {
  const clonedWin = clonedDoc.defaultView || window;
  if (!clonedWin) return;

  const origGetComputedStyle = clonedWin.getComputedStyle.bind(clonedWin);
  clonedWin.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
    const style = origGetComputedStyle(elt, pseudoElt);
    return new Proxy(style, {
      get(target, prop, receiver) {
        const val = Reflect.get(target, prop, receiver);
        if (typeof val === 'function') {
          if (prop === 'getPropertyValue') {
            return (property: string) => {
              const res = target.getPropertyValue(property);
              return convertModernCssColors(res);
            };
          }
          return val.bind(target);
        }
        if (typeof val === 'string') {
          return convertModernCssColors(val);
        }
        return val;
      },
    });
  };
}

/**
 * Downloads a target DOM element directly to the device as a high-quality PDF.
 * Optimized for mobile Android, iOS & desktop without OKLAB / OKLCH crashes or freezing.
 */
export async function downloadElementAsPDF(
  element: HTMLElement | string,
  filename: string = 'document.pdf',
  options?: PDFExportOptions
): Promise<void> {
  const targetElement = typeof element === 'string' ? document.getElementById(element) : element;
  if (!targetElement) {
    throw new Error('تعذر العثور على محتوى المستند للطباعة والتصدير');
  }

  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  // Clone element into an off-screen container with explicit white theme
  const printClone = targetElement.cloneNode(true) as HTMLElement;
  printClone.style.backgroundColor = '#ffffff';
  printClone.style.color = '#0f172a';
  printClone.style.padding = '24px';
  printClone.style.margin = '0';
  printClone.style.width = '800px';
  printClone.style.maxWidth = '100%';
  printClone.style.direction = 'rtl';
  printClone.style.position = 'fixed';
  printClone.style.left = '-9999px';
  printClone.style.top = '0';
  printClone.style.zIndex = '-9999';
  document.body.appendChild(printClone);

  // Pre-sanitize the clone before passing to html2pdf
  sanitizeDomTreeColors(printClone);

  const opt = {
    margin: options?.margin ?? [6, 6, 6, 6],
    filename: cleanFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
      scrollY: 0,
      windowWidth: 800,
      onclone: (clonedDoc: Document) => {
        // Intercept all getComputedStyle calls in the cloned document
        patchClonedWindowComputedStyle(clonedDoc);
        // Deep sanitize all OKLAB & OKLCH colors in the cloned document
        sanitizeDomTreeColors(clonedDoc);
      },
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: options?.landscape ? 'landscape' : 'portrait',
    },
  };

  try {
    // @ts-ignore
    const pdfWorker = html2pdf().set(opt).from(printClone);
    const pdfBlob = await pdfWorker.output('blob');

    // Create safe download URL
    const blobUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = cleanFilename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 1500);
  } finally {
    if (document.body.contains(printClone)) {
      document.body.removeChild(printClone);
    }
  }
}

/**
 * Generates an object URL (blob) of the PDF for Screen Preview (معاينة شاشة)
 */
export async function generateElementPDFBlobUrl(
  element: HTMLElement | string,
  options?: PDFExportOptions
): Promise<string> {
  const targetElement = typeof element === 'string' ? document.getElementById(element) : element;
  if (!targetElement) {
    throw new Error('Target element not found for PDF export');
  }

  const printClone = targetElement.cloneNode(true) as HTMLElement;
  printClone.style.backgroundColor = '#ffffff';
  printClone.style.color = '#0f172a';
  printClone.style.padding = '24px';
  printClone.style.margin = '0';
  printClone.style.width = '800px';
  printClone.style.direction = 'rtl';
  printClone.style.position = 'fixed';
  printClone.style.left = '-9999px';
  printClone.style.top = '0';
  printClone.style.zIndex = '-9999';
  document.body.appendChild(printClone);

  sanitizeDomTreeColors(printClone);

  const opt = {
    margin: options?.margin ?? [8, 8, 8, 8],
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
      scrollY: 0,
      windowWidth: 800,
      onclone: (clonedDoc: Document) => {
        patchClonedWindowComputedStyle(clonedDoc);
        sanitizeDomTreeColors(clonedDoc);
      },
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: options?.landscape ? 'landscape' : 'portrait',
    },
  };

  try {
    // @ts-ignore
    const pdfWorker = html2pdf().set(opt).from(printClone);
    const blob = await pdfWorker.output('blob');
    return URL.createObjectURL(blob);
  } finally {
    if (document.body.contains(printClone)) {
      document.body.removeChild(printClone);
    }
  }
}
