import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useAccounting } from '../context/AccountingContext';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { showToast } = useAccounting();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  if (isInstalled) {
    if (compact) return null;
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
        <CheckCircle className="w-4 h-4" />
        <span>مثبت كتطبيق سطح مكتب / جوال</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstalledSuccess(true);
        setTimeout(() => setInstalledSuccess(false), 4000);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      showToast('لتثبيت التطبيق: انقر على خيارات المتصفح (⋮) ثم اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"', 'info');
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        type="button"
        title="تثبيت التطبيق للعمل بدون إنترنت مثل تطبيقات الجوال وسطح المكتب"
        className={`flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition-all shadow-md shadow-emerald-950/40 cursor-pointer ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-xs'
        }`}
      >
        <Download className="w-4 h-4" />
        <span>{compact ? 'تثبيت' : 'تثبيت التطبيق (أوفلاين)'}</span>
      </button>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                تثبيت على iPhone / iPad
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-slate-400 hover:text-white text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              لتثبيت المحاسب الذكي والعمل به بدون إنترنت من الشاشة الرئيسية لجهازك:
            </p>

            <div className="space-y-3 bg-slate-800/80 p-4 rounded-2xl text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-emerald-400">
                  1
                </div>
                <span>
                  اضغط على زر المشاركة <Share2 className="w-4 h-4 inline mx-1 text-cyan-400" /> في شريط متصفح Safari.
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-emerald-400">
                  2
                </div>
                <span>
                  مرر للأسفل واختر <span className="font-bold text-emerald-300">"إضافة إلى الشاشة الرئيسية"</span> (Add to Home Screen).
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </>
  );
};
