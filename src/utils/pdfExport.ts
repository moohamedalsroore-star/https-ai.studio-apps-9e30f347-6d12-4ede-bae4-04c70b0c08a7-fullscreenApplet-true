// PDF Export & Generation Utility using html2pdf.js (loaded on demand)
// Handles document conversion to PDF, direct mobile/desktop device download, screen preview preparation, and print sanitization.
// Eliminates Tailwind CSS v4 "oklab"/"oklch" incompatibilities in html2canvas and converts dark-mode report cards into crisp white A4/A5 tabular sheets.

export type PaperFormat = 'A4' | 'A5' | 'THERMAL';

export interface PDFExportOptions {
  filename?: string;
  margin?: number | [number, number, number, number];
  landscape?: boolean;
  paperFormat?: PaperFormat;
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

    const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

    const lCube = l_ * l_ * l_;
    const mCube = m_ * m_ * m_;
    const sCube = s_ * s_ * s_;

    const rLin = +4.0767416621 * lCube - 3.3077115913 * mCube + 0.2309699292 * sCube;
    const gLin = -1.2684380046 * lCube + 2.6097574011 * mCube - 0.3413193965 * sCube;
    const bLin = -0.0041960863 * lCube - 0.7034186147 * mCube + 1.7076147010 * sCube;

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

    const hRad = (h * Math.PI) / 180;
    const a = c * Math.cos(hRad);
    const b = c * Math.sin(hRad);

    const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

    const lCube = l_ * l_ * l_;
    const mCube = m_ * m_ * m_;
    const sCube = s_ * s_ * s_;

    const rLin = +4.0767416621 * lCube - 3.3077115913 * mCube + 0.2309699292 * sCube;
    const gLin = -1.2684380046 * lCube + 2.6097574011 * mCube - 0.3413193965 * sCube;
    const bLin = -0.0041960863 * lCube - 0.7034186147 * mCube + 1.7076147010 * sCube;

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
 * Deeply clones a target DOM element and converts it into a clean, print/PDF/preview-ready white tabular document:
 * 1. Reveals all `hidden print:block` / `print-only` UnifiedDocumentLayout headers, logos & footers.
 * 2. Strips `.no-print` and `print:hidden` UI controls.
 * 3. Normalizes dark-mode UI classes (`bg-slate-900`, `text-white`, `text-slate-300`, etc.) into crisp light-paper ink & borders
 *    while preserving intentional high-contrast badges inside `.unified-onyx-document` totals/badges.
 * 4. Ensures all tables and cells have sharp readable borders and unclipped layout.
 */
export function buildCleanPrintableClone(targetElement: HTMLElement): HTMLElement {
  const clone = targetElement.cloneNode(true) as HTMLElement;

  // Reveal root if root itself was hidden for off-screen printing (e.g. #selected-invoice-document-card)
  if (
    clone.classList.contains('hidden') &&
    (clone.classList.contains('print:block') || clone.classList.contains('print-only') || clone.hasAttribute('data-print-reveal'))
  ) {
    clone.classList.remove('hidden', 'print:block');
    clone.classList.add('block');
    clone.style.display = 'block';
  }

  // Remove interactive / non-printable controls
  clone.querySelectorAll('.no-print, .print\\:hidden').forEach((el) => el.remove());

  // Reveal all print-only headers/footers (UnifiedDocumentLayout banners & footers inside inline reports)
  clone.querySelectorAll('.print\\:block, .print-only, [data-print-reveal="true"]').forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.classList.remove('hidden', 'print:block');
    htmlEl.classList.add('block');
    if (htmlEl.style.display === 'none') {
      htmlEl.style.display = 'block';
    }
  });

  // Normalize dark-theme classes into high-contrast crisp white-paper tabular styling
  const allElements: HTMLElement[] = [clone, ...Array.from(clone.querySelectorAll('*')) as HTMLElement[]];

  const DARK_BG_TOKENS = [
    'bg-slate-950',
    'bg-slate-900',
    'bg-slate-900/90',
    'bg-slate-900/80',
    'bg-slate-900/70',
    'bg-slate-900/60',
    'bg-slate-900/50',
    'bg-slate-900/40',
    'bg-slate-850',
    'bg-slate-800',
    'bg-slate-800/80',
    'bg-slate-800/60',
    'bg-slate-800/50',
    'bg-slate-800/40',
    'bg-slate-800/30',
    'bg-[#020824]',
    'bg-[#040c2e]',
    'bg-[#061340]',
    'bg-[#0c1a36]',
  ];

  const DARK_TEXT_REPLACEMENTS: Record<string, string> = {
    'text-white': 'text-slate-950',
    'text-slate-50': 'text-slate-950',
    'text-slate-100': 'text-slate-900',
    'text-slate-200': 'text-slate-900',
    'text-slate-300': 'text-slate-800',
    'text-slate-400': 'text-slate-600',
    'text-cyan-300': 'text-blue-900',
    'text-cyan-400': 'text-blue-800',
    'text-emerald-300': 'text-emerald-800',
    'text-emerald-400': 'text-emerald-800',
    'text-amber-300': 'text-amber-800',
    'text-amber-400': 'text-amber-800',
    'text-rose-300': 'text-rose-800',
    'text-rose-400': 'text-rose-800',
    'text-indigo-300': 'text-indigo-800',
    'text-indigo-400': 'text-indigo-800',
    'text-purple-300': 'text-purple-800',
    'text-purple-400': 'text-purple-800',
  };

  for (const el of allElements) {
    // Preserve intentional UnifiedDocumentLayout dark badges (e.g. Grand Total badge or type badge)
    const isKeepDarkBadge =
      el.classList.contains('print-keep-dark') ||
      (el.closest('.unified-onyx-document') !== null &&
        (el.classList.contains('bg-blue-900') ||
          (el.classList.contains('bg-slate-900') && el.tagName === 'SPAN')));

    if (isKeepDarkBadge) {
      el.classList.add('print-keep-dark');
      continue;
    }

    const classes = Array.from(el.classList);
    for (const cls of classes) {
      if (DARK_BG_TOKENS.includes(cls) || /^bg-slate-(950|900|800)(\/\d+)?$/.test(cls)) {
        el.classList.remove(cls);
        if (el.tagName === 'THEAD' || el.tagName === 'TH' || cls.includes('800')) {
          el.classList.add('bg-slate-100');
        } else {
          el.classList.add('bg-white');
        }
      } else if (DARK_TEXT_REPLACEMENTS[cls]) {
        el.classList.remove(cls);
        el.classList.add(DARK_TEXT_REPLACEMENTS[cls]);
      } else if (/^border-slate-(900|800|700)(\/\d+)?$/.test(cls)) {
        el.classList.remove(cls);
        el.classList.add('border-slate-300');
      } else if (/^divide-slate-(900|800|700)(\/\d+)?$/.test(cls)) {
        el.classList.remove(cls);
        el.classList.add('divide-slate-300');
      } else if (/^bg-(emerald|rose|amber|cyan|blue|indigo|purple)-(950|900|500)\/(10|15|20|30|40)$/.test(cls)) {
        el.classList.remove(cls);
        el.classList.add('bg-slate-50');
      }
    }

    // Unclip overflowing scroll wrappers for print/preview
    if (el.classList.contains('overflow-x-auto') || el.classList.contains('overflow-hidden')) {
      el.style.overflow = 'visible';
    }
    if (el.tagName === 'TABLE') {
      el.style.width = '100%';
      el.style.borderCollapse = 'collapse';
      el.classList.add('border', 'border-slate-300', 'bg-white', 'text-slate-900');
    } else if (el.tagName === 'TH') {
      el.style.borderColor = '#cbd5e1';
      el.style.borderWidth = '1px';
      el.style.borderStyle = 'solid';
      el.style.backgroundColor = '#f1f5f9';
      el.style.color = '#0f172a';
    } else if (el.tagName === 'TD') {
      el.style.borderColor = '#cbd5e1';
      el.style.borderWidth = '1px';
      el.style.borderStyle = 'solid';
    }
  }

  return clone;
}

/**
 * Returns clean, high-contrast white tabular HTML for Screen Preview (معاينة على الشاشة) and direct native printing.
 */
export function preparePrintableHtml(element: HTMLElement | string): string {
  const targetElement = typeof element === 'string' ? document.getElementById(element) : element;
  if (!targetElement) return '';
  const cleanClone = buildCleanPrintableClone(targetElement);
  cleanClone.removeAttribute('id');
  return cleanClone.outerHTML;
}

function getTargetPaperWidthPx(paperFormat?: PaperFormat): number {
  if (paperFormat === 'THERMAL') return 320;
  if (paperFormat === 'A5') return 560;
  return 800;
}

function getJsPdfFormat(paperFormat?: PaperFormat): 'a4' | 'a5' | [number, number] {
  if (paperFormat === 'A5') return 'a5';
  if (paperFormat === 'THERMAL') return [80, 297];
  return 'a4';
}

/**
 * Downloads a target DOM element directly to the device as a high-quality PDF.
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
  const widthPx = getTargetPaperWidthPx(options?.paperFormat);

  const printClone = buildCleanPrintableClone(targetElement);
  printClone.style.backgroundColor = '#ffffff';
  printClone.style.color = '#0f172a';
  printClone.style.padding = options?.paperFormat === 'THERMAL' ? '12px' : '24px';
  printClone.style.margin = '0';
  printClone.style.width = `${widthPx}px`;
  printClone.style.maxWidth = '100%';
  printClone.style.direction = 'rtl';
  printClone.style.position = 'fixed';
  printClone.style.left = '-9999px';
  printClone.style.top = '0';
  printClone.style.zIndex = '-9999';
  document.body.appendChild(printClone);

  sanitizeDomTreeColors(printClone);

  const opt = {
    margin: options?.margin ?? (options?.paperFormat === 'THERMAL' ? [3, 3, 3, 3] : [6, 6, 6, 6]),
    filename: cleanFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
      scrollY: 0,
      windowWidth: widthPx,
      onclone: (clonedDoc: Document) => {
        patchClonedWindowComputedStyle(clonedDoc);
        sanitizeDomTreeColors(clonedDoc);
      },
    },
    jsPDF: {
      unit: 'mm',
      format: getJsPdfFormat(options?.paperFormat),
      orientation: options?.landscape ? 'landscape' : 'portrait',
    },
  };

  try {
    // @ts-ignore html2pdf.js untyped module compatibility
    const { default: html2pdf } = await import('html2pdf.js');
    // @ts-ignore
    const pdfWorker = html2pdf().set(opt).from(printClone);
    const pdfBlob = await pdfWorker.output('blob');

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
 * Generates an object URL (blob) of the PDF for Screen Preview
 */
export async function generateElementPDFBlobUrl(
  element: HTMLElement | string,
  options?: PDFExportOptions
): Promise<string> {
  const targetElement = typeof element === 'string' ? document.getElementById(element) : element;
  if (!targetElement) {
    throw new Error('Target element not found for PDF export');
  }

  const widthPx = getTargetPaperWidthPx(options?.paperFormat);
  const printClone = buildCleanPrintableClone(targetElement);
  printClone.style.backgroundColor = '#ffffff';
  printClone.style.color = '#0f172a';
  printClone.style.padding = options?.paperFormat === 'THERMAL' ? '12px' : '24px';
  printClone.style.margin = '0';
  printClone.style.width = `${widthPx}px`;
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
      windowWidth: widthPx,
      onclone: (clonedDoc: Document) => {
        patchClonedWindowComputedStyle(clonedDoc);
        sanitizeDomTreeColors(clonedDoc);
      },
    },
    jsPDF: {
      unit: 'mm',
      format: getJsPdfFormat(options?.paperFormat),
      orientation: options?.landscape ? 'landscape' : 'portrait',
    },
  };

  try {
    // @ts-ignore html2pdf.js untyped module compatibility
    const { default: html2pdf } = await import('html2pdf.js');
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
