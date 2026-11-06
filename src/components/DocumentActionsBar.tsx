import React, { useState } from 'react';
import { Printer, Download, Eye, Loader2, CheckCircle2, FileText, Maximize2, X, ArrowRight } from 'lucide-react';
import { downloadElementAsPDF } from '../utils/pdfExport';

interface DocumentActionsBarProps {
  /** The DOM ID or ref of the element to be printed / exported as PDF */
  targetElementId: string;
  /** Suggested filename for downloading PDF (e.g. "فاتورة_INV-001") */
  filename: string;
  /** Document title for preview header */
  documentTitle?: string;
  /** Whether to show in compact mode */
  compact?: boolean;
  /**
   * Onyx Pro (Yemen Soft) Behavior:
   * Whether saved data exists in the database.
   * If false, the buttons will NOT render at all (strictly hidden).
   * Once data is saved, they appear automatically.
   * If all data is deleted, they disappear automatically.
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
  hasData = true,
  className = '',
  onAction,
}) => {
  // Onyx Pro rule: If no saved data exists, do not render buttons at all
  if (hasData === false) {
    return null;
  }
  const [isExporting, setIsExporting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showScreenPreview, setShowScreenPreview] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // 1. Download directly to device as PDF
  const handleDownloadPDF = async () => {
    try {
      setIsExporting(true);
      const element = document.getElementById(targetElementId);
      if (!element) {
        throw new Error('تعذر العثور على محتوى المستند للطباعة');
      }

      onAction?.();
      await downloadElementAsPDF(element, filename);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      console.error('PDF export error:', err);
      // Fallback: prompt print dialog if direct canvas fails
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Native Print
  const handleNativePrint = () => {
    onAction?.();
    window.print();
  };

  return (
    <>
      <div className={`flex flex-wrap items-center gap-2.5 no-print ${className}`}>
        {/* Screen Preview Button (معاينة شاشة) - Matching Onyx Pro reference screenshot */}
        <button
          type="button"
          onClick={() => {
            onAction?.();
            setShowScreenPreview(true);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#0c1a36] hover:bg-[#142850] text-[#00C8FF] hover:text-white border border-[#00C8FF]/50 text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 shadow-[0_0_12px_rgba(0,200,255,0.2)]"
          title="معاينة المستند على الشاشة بدقة كاملة (Onyx Pro style)"
        >
          <Eye className="w-4 h-4 text-[#00C8FF]" />
          <span>{compact ? 'معاينة' : 'معاينة شاشة'}</span>
        </button>

        {/* Download PDF to Device Button (تنزيل PDF إلى الجهاز) - Vibrant Emerald Glow pill */}
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#00D99A] to-[#00b876] hover:from-[#00c58b] hover:to-[#00a86b] text-slate-950 font-black text-xs sm:text-sm transition-all cursor-pointer active:scale-95 shadow-[0_0_18px_rgba(0,217,154,0.45)] border border-emerald-300/60 disabled:opacity-50"
          title="تنزيل المستند كملف PDF وحفظه مباشرة في الهاتف أو الكمبيوتر"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>جاري التحويل إلى PDF...</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>تم التنزيل بنجاح!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-slate-950" />
              <span>تنزيل PDF إلى الجهاز</span>
            </>
          )}
        </button>

        {/* Native Print Button (طباعة) - Matching Onyx Pro reference screenshot */}
        <button
          type="button"
          onClick={handleNativePrint}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#13223d] hover:bg-[#1d3254] text-slate-200 hover:text-white border border-slate-700/80 text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
          title="طباعة عبر الطابعة المتصلة"
        >
          <Printer className="w-4 h-4 text-slate-300" />
          <span>طباعة</span>
        </button>
      </div>

      {/* Screen Preview Modal (معاينة شاشة تفاعلية كاملة مع تكبير وتنزيل) */}
      {showScreenPreview && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-150 p-2 sm:p-6 overflow-hidden">
          {/* Top Bar for Screen Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-white shadow-xl mb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>معاينة شاشة:</span>
                  <span className="text-cyan-300 font-mono-num">{documentTitle}</span>
                </h4>
                <p className="text-[11px] text-slate-400">معاينة المستند قبل التنزيل أو الطباعة</p>
              </div>
            </div>

            {/* Zoom & Action Controls */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(z - 15, 70))}
                  className="px-2 py-0.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                >
                  -
                </button>
                <span className="px-2 font-mono-num text-[11px] text-cyan-300">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(z + 15, 150))}
                  className="px-2 py-0.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(100)}
                  className="px-2 py-0.5 rounded text-slate-400 hover:text-white text-[10px] cursor-pointer"
                >
                  100%
                </button>
              </div>

              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">تنزيل PDF</span>
              </button>

              <button
                type="button"
                onClick={handleNativePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">طباعة</span>
              </button>

              <button
                type="button"
                onClick={() => setShowScreenPreview(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 cursor-pointer transition-all active:scale-95 shadow-sm"
                title="الرجوع إلى الشاشة السابقة"
              >
                <ArrowRight className="w-4 h-4 text-emerald-400" />
                <span>رجوع للخلف</span>
              </button>
            </div>
          </div>

          {/* Interactive Document Viewport */}
          <div className="flex-1 overflow-auto flex items-start justify-center p-2 sm:p-4 bg-slate-900/50 rounded-2xl border border-slate-800/80">
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
              className="bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full text-right"
              dangerouslySetInnerHTML={{
                __html: document.getElementById(targetElementId)?.innerHTML || '<p class="text-center p-8">جاري تجهيز محتوى المستند...</p>',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};
