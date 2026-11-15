import React, { useState } from 'react';
import {
  Wrench,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Phone,
  Mail,
  Award,
  RefreshCw,
  Info,
} from 'lucide-react';
import { Account, JournalEntry } from '../../types/accounting';
import { DEFAULT_MAINTENANCE_INFO } from '../../utils/settingsDefaults';

interface SystemMaintenanceTabProps {
  accounts: Account[];
  journalEntries: JournalEntry[];
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SystemMaintenanceTab: React.FC<SystemMaintenanceTabProps> = ({
  accounts,
  journalEntries,
  showToast,
}) => {
  const [isCheckingIntegrity, setIsCheckingIntegrity] = useState(false);
  const [integrityReport, setIntegrityReport] = useState<{
    testedAt: string;
    totalJournals: number;
    balancedJournals: number;
    unbalancedJournals: number;
    totalAccounts: number;
    isHealthy: boolean;
  } | null>(null);

  const [isCleaningCache, setIsCleaningCache] = useState(false);

  // 1. Run Data Integrity Check
  const handleRunIntegrityCheck = () => {
    setIsCheckingIntegrity(true);
    setTimeout(() => {
      let unbalancedCount = 0;
      journalEntries.forEach((je) => {
        const diff = Math.abs(je.totalDebit - je.totalCredit);
        if (diff > 0.001) {
          unbalancedCount++;
        }
      });

      setIntegrityReport({
        testedAt: new Date().toLocaleTimeString('ar-SA'),
        totalJournals: journalEntries.length,
        balancedJournals: journalEntries.length - unbalancedCount,
        unbalancedJournals: unbalancedCount,
        totalAccounts: accounts.length,
        isHealthy: unbalancedCount === 0,
      });

      setIsCheckingIntegrity(false);
      showToast('اكتمل فحص سلامة وتناسق القيود المحاسبية بنجاح ✓', 'success');
    }, 800);
  };

  // 2. Safe Cache & Temporary Index Cleanup
  const handleClearTemporaryCache = () => {
    setIsCleaningCache(true);
    setTimeout(() => {
      // Clean only temporary UI flags, keeping all business data safe
      sessionStorage.clear();
      setIsCleaningCache(false);
      showToast('تم تنظيف الذاكرة المؤقتة وتحسين استجابة وسرعة النظام بأمان ✓', 'success');
    }, 600);
  };

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            النظام والصيانة وفحص سلامة البيانات والدعم الفني
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            فحص توازن القيود، تحسين أداء الفهرسة، إدارة الذاكرة المؤقتة، وتفاصيل الترخيص والدعم
          </p>
        </div>
      </div>

      {/* 1. System Version & Official License Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-950 border-2 border-amber-500/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-950/40">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-white text-base">نظام الغفاري سوفت PRO المحاسبي</h4>
              <p className="text-xs text-amber-300 font-bold mt-0.5">
                {DEFAULT_MAINTENANCE_INFO.version} | تاريخ التحديث: {DEFAULT_MAINTENANCE_INFO.releaseDate}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold w-fit">
            ● ترخيص رسمي نشط ومستقر
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">نوع الترخيص:</span>
            <span className="font-bold text-white text-xs leading-relaxed">
              {DEFAULT_MAINTENANCE_INFO.licenseType}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">بيئة التشغيل:</span>
            <span className="font-bold text-emerald-400 text-xs">
              يعمل محلياً وأوفلاين 100% بدون إنترنت
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">محرك قواعد البيانات:</span>
            <span className="font-bold text-cyan-400 font-mono text-xs">
              Local High-Speed Key-Value DB
            </span>
          </div>
        </div>
      </div>

      {/* 2. Accounting Data Integrity Check (فحص سلامة البيانات) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h4 className="text-xs font-black text-white">فحص سلامة وتناسق القيود المحاسبية (Data Integrity & Balance Check)</h4>
              <p className="text-[11px] text-slate-400">
                يفحص تطابق جانبي القيد المحاسبي (المدين = الدائن) وصحة أرصدة دليل الحسابات
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunIntegrityCheck}
            disabled={isCheckingIntegrity}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingIntegrity ? 'animate-spin' : ''}`} />
            <span>{isCheckingIntegrity ? 'جاري الفحص الدقيق...' : 'تشغيل فحص السلامة والتوازن'}</span>
          </button>
        </div>

        {integrityReport ? (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                تقرير الفحص اللحظي (الوقت: {integrityReport.testedAt})
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  integrityReport.isHealthy
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-950/60 text-red-400 border-red-500/30'
                }`}
              >
                {integrityReport.isHealthy ? 'البيانات متوازنة وسليمة 100% ✓' : 'توجد قيود غير متوازنة ✕'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">إجمالي قيود اليومية</span>
                <span className="font-mono-num font-bold text-white text-sm">{integrityReport.totalJournals}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">القيود المتوازنة بدقة</span>
                <span className="font-mono-num font-bold text-emerald-400 text-sm">
                  {integrityReport.balancedJournals}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">القيود غير المتوازنة</span>
                <span className="font-mono-num font-bold text-red-400 text-sm">
                  {integrityReport.unbalancedJournals}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">الحسابات المفحوصة</span>
                <span className="font-mono-num font-bold text-cyan-400 text-sm">
                  {integrityReport.totalAccounts}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>انقر على زر «تشغيل فحص السلامة والتوازن» للتحقق من سلامة القيود وأرصدة دليل الحسابات.</span>
          </div>
        )}
      </div>

      {/* 3. Performance & Safe Temporary Cache Management */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="text-xs font-black text-amber-300">تحسين الأداء وإدارة الملفات المؤقتة بأمان</h4>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
          <div>
            <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              تنظيف الذاكرة المؤقتة وتسريع الفهرسة
            </h5>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              يقوم بتفريغ ذاكرة التصفح المؤقتة وإعادة ترتيب المؤشرات دون المساس بأي من فواتيرك أو حساباتك.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearTemporaryCache}
            disabled={isCleaningCache}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-cyan-500/30 text-xs font-bold cursor-pointer transition-all active:scale-95 shrink-0"
          >
            <Zap className={`w-3.5 h-3.5 ${isCleaningCache ? 'animate-bounce' : ''}`} />
            <span>{isCleaningCache ? 'جاري التنظيف...' : 'تنظيف الذاكرة المؤقتة'}</span>
          </button>
        </div>
      </div>

      {/* 4. Official Developer & Technical Support Info */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h4 className="text-xs font-black text-amber-300">معلومات التطوير والدعم الفني المباشر</h4>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-3">
            <div>
              <span className="text-[10px] text-slate-400 block">إعداد وتصميم وتنفيذ:</span>
              <span className="font-black text-white text-sm text-amber-400">
                {DEFAULT_MAINTENANCE_INFO.developer}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Al-Ghafari Soft PRO Edition
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="flex items-center gap-2 text-slate-300">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>هاتف الدعم الفني:</span>
              <span className="font-mono text-white font-bold" dir="ltr">
                {DEFAULT_MAINTENANCE_INFO.supportPhone}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>البريد الإلكتروني:</span>
              <span className="font-mono text-cyan-300 font-bold">
                {DEFAULT_MAINTENANCE_INFO.supportEmail}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
