import React, { useState, useMemo } from 'react';
import {
  Printer,
  Download,
  Eye,
  Loader2,
  CheckCircle2,
  FileText,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { downloadElementAsPDF, preparePrintableHtml, PaperFormat } from '../utils/pdfExport';

export interface DocumentActionsBarProps {
  /** The DOM ID of the element to be printed / previewed / exported as PDF */
  targetElementId: string;
  /** Suggested filename for downloading PDF (e.g. "فاتورة_INV-001") */
  filename: string;
  /** Document title for preview header */
  documentTitle?: string;
  /** Whether to show in compact mode */
  compact?: boolean;
  /** Optional landscape PDF orientation */
  landscape?: boolean;
  /**
   * Onyx Pro Behavior:
   * Whether saved data exists in the database.
   * If false, the buttons do NOT render.
   */
  hasData?: boolean;
  /** Optional custom container class */
  className?: string;
  /** Optional callback triggered on action */
  onAction?: () => void;
}

export const DocumentActionsBar: React.FC<DocumentActionsBarProps> = ({
  targetElementId,
  filename,
  documentTitle = 'مستند رسمي',
  compact = false,
  landscape = false,
  hasData = true,
  className = '',
  onAction,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showScreenPreview, setShowScreenPreview] = useState(false);
  const [previewRevision, setPreviewRevision] = useState(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [paperFormat, setPaperFormat] = useState<PaperFormat>('A4');

  // Build crisp white tabular HTML whenever Screen Preview is opened
  const previewHtml = useMemo(() => {
    if (!showScreenPreview) return '';
    return (
      preparePrintableHtml(targetElementId) ||
      '<p class="text-center p-8 text-slate-500 font-bold">جاري تجهيز محتوى المستند أو المستند قيد التحميل...</p>'
    );
  }, [showScreenPreview, targetElementId, previewRevision]);

  // Onyx Pro rule: If no saved data exists, do not render buttons at all
  if (hasData === false) {
    return null;
  }

  // 1. Native isolated Print (A4 / A5 / Thermal)
  const handleNativePrint = () => {
    onAction?.();
    const cleanHtml = preparePrintableHtml(targetElementId);
    if (!cleanHtml) {
      window.print();
      return;
    }

    // Remove any stale portal
    const existing = document.getElementById('alghafari-active-print-sheet');
    if (existing) existing.remove();

    const portal = document.createElement('div');
    portal.id = 'alghafari-active-print-sheet';
    portal.setAttribute('dir', 'rtl');
    portal.style.maxWidth =
      paperFormat === 'THERMAL' ? '80mm' : paperFormat === 'A5' ? '148mm' : '100%';
    portal.innerHTML = cleanHtml;
    document.body.appendChild(portal);
    document.body.setAttribute('data-printing-active', 'true');

    const cleanup = () => {
      document.body.removeAttribute('data-printing-active');
      const el = document.getElementById('alghafari-active-print-sheet');
      if (el) el.remove();
      window.removeEventListener('afterprint', cleanup);
    };

    window.addEventListener('afterprint', cleanup);
    setTimeout(() => {
      window.print();
      setTimeout(cleanup, 3000);
    }, 60);
  };

  // 2. Download directly to device as PDF
  const handleDownloadPDF = async () => {
    try {
      setIsExporting(true);
      const element = document.getElementById(targetElementId);
      if (!element) {
        throw new Error('تعذر العثور على محتوى المستند للطباعة');
      }

      onAction?.();
      await downloadElementAsPDF(element, filename, {
        paperFormat,
        landscape,
      });
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      console.error('PDF export error:', err);
      handleNativePrint();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      {/* 3 Prominent Document Action Buttons */}
      <div className={`flex flex-wrap items-center gap-2.5 no-print ${className}`}>
        {/* 1. Screen Preview Button (معاينة على الشاشة) */}
        <button
          type="button"
          onClick={() => {
            onAction?.();
            setPreviewRevision((r) => r + 1);
            setShowScreenPreview(true);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#0c1a36] hover:bg-[#142850] text-[#00C8FF] hover:text-white border border-[#00C8FF]/50 text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 shadow-[0_0_12px_rgba(0,200,255,0.2)]"
          title="معاينة المستند على الشاشة بدقة كاملة وتكبير وتصغير"
        >
          <Eye className="w-4 h-4 text-[#00C8FF]" />
          <span>{compact ? 'معاينة' : 'معاينة على الشاشة'}</span>
        </button>

        {/* 2. Download PDF to Device Button (تنزيل PDF) */}
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#00D99A] to-[#00b876] hover:from-[#00c58b] hover:to-[#00a86b] text-slate-950 font-black text-xs sm:text-sm transition-all cursor-pointer active:scale-95 shadow-[0_0_18px_rgba(0,217,154,0.45)] border border-emerald-300/60 disabled:opacity-50"
          title="تصدير المستند إلى ملف PDF منسق وجاهز للحفظ والمشاركة"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>جاري تنزيل PDF...</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>تم التنزيل بنجاح!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-slate-950" />
              <span>تنزيل PDF</span>
            </>
          )}
        </button>

        {/* 3. Native Print Button (طباعة) */}
        <button
          type="button"
          onClick={handleNativePrint}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#13223d] hover:bg-[#1d3254] text-slate-200 hover:text-white border border-slate-700/80 text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
          title="إرسال المستند مباشرة إلى الطابعة بمقاس A4"
        >
          <Printer className="w-4 h-4 text-slate-300" />
          <span>طباعة</span>
        </button>
      </div>

      {/* Screen Preview Modal */}
      {showScreenPreview && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-150 p-2 sm:p-5 overflow-hidden no-print">
          {/* Top Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-white shadow-xl mb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>معاينة المستند:</span>
                  <span className="text-cyan-300 font-mono-num">{documentTitle}</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  عرض مجدول بالهوية التجارية الكاملة قبل الطباعة وتصدير PDF
                </p>
              </div>
            </div>

            {/* Zoom, Paper Size & Action Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Paper format selector */}
              <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-700 text-xs">
                <span className="text-slate-400 text-[11px] hidden sm:inline">المقاس:</span>
                {(['A4', 'A5', 'THERMAL'] as PaperFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setPaperFormat(fmt)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                      paperFormat === fmt ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {fmt === 'THERMAL' ? 'حراري' : fmt}
                  </button>
                ))}
              </div>

              {/* Interactive Zoom Controls */}
              <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(z - 15, 50))}
                  className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                  title="تصغير (-)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-1.5 font-mono-num text-[11px] text-cyan-300 min-w-[42px] text-center">
                  {zoomLevel}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(z + 15, 180))}
                  className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                  title="تكبير (+)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(100)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer"
                  title="إعادة ضبط 100%"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>

              {/* Download PDF button inside modal */}
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                title="تنزيل PDF مباشرة"
              >
                {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>تنزيل PDF</span>
              </button>

              {/* Direct Print button inside modal */}
              <button
                type="button"
                onClick={handleNativePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                title="طباعة عبر الطابعة"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowScreenPreview(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 cursor-pointer transition-all active:scale-95 shadow-sm"
                title="الرجوع إلى الشاشة السابقة"
              >
                <ArrowRight className="w-4 h-4 text-emerald-400" />
                <span>إغلاق</span>
              </button>
            </div>
          </div>

          {/* Interactive Document Viewport with Clean Tabular White Sheet */}
          <div className="flex-1 overflow-auto flex items-start justify-center p-3 sm:p-6 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
                maxWidth: paperFormat === 'THERMAL' ? '360px' : paperFormat === 'A5' ? '600px' : '900px',
              }}
              className="bg-white text-slate-900 rounded-xl shadow-2xl p-4 sm:p-8 w-full text-right transition-all border border-slate-300"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      )}
    </>
  );
};
