import React, { useState } from 'react';
import {
  Download,
  Upload,
  ShieldCheck,
  ShieldAlert,
  Database,
  FileCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Lock,
  Clock,
  HardDrive,
} from 'lucide-react';
import { Account, Invoice, Product, Contact, Voucher, JournalEntry } from '../../types/accounting';

interface BackupRestoreTabProps {
  exportDatabaseJson: () => string;
  importDatabaseJson: (json: string) => boolean;
  radicalFactoryReset: () => void;
  accounts: Account[];
  invoices: Invoice[];
  products: Product[];
  contacts: Contact[];
  vouchers: Voucher[];
  journalEntries: JournalEntry[];
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const BackupRestoreTab: React.FC<BackupRestoreTabProps> = ({
  exportDatabaseJson,
  importDatabaseJson,
  radicalFactoryReset,
  accounts,
  invoices,
  products,
  contacts,
  vouchers,
  journalEntries,
  showToast,
}) => {
  // Safety confirmation dialogs
  const [showConfirmRestoreModal, setShowConfirmRestoreModal] = useState(false);
  const [pendingFileContent, setPendingFileContent] = useState<string | null>(null);
  const [pendingFileInfo, setPendingFileInfo] = useState<{
    date?: string;
    accountsCount?: number;
    invoicesCount?: number;
    productsCount?: number;
  } | null>(null);

  // Radical reset modal
  const [showResetSecurityModal, setShowResetSecurityModal] = useState(false);
  const [confirmationPhrase, setConfirmationPhrase] = useState('');

  // Check if a safety snapshot exists
  const hasSafetySnapshot = Boolean(localStorage.getItem('alghafari_safety_snapshot_before_restore'));
  const lastBackupDate = localStorage.getItem('alghafari_last_backup_date') || 'لم يتم تصدير نسخة بعد';

  // Calculate approximate database size in KB
  const totalRecords =
    accounts.length +
    invoices.length +
    products.length +
    contacts.length +
    vouchers.length +
    journalEntries.length;

  const approximateSizeKb = Math.max(12, Math.round(exportDatabaseJson().length / 1024));

  // 1. Download Backup
  const handleDownloadBackup = () => {
    const jsonStr = exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `alghafari_soft_pro_backup_${dateStr}.json`;
    link.click();
    URL.revokeObjectURL(url);

    const nowFormatted = new Date().toLocaleString('ar-SA');
    localStorage.setItem('alghafari_last_backup_date', nowFormatted);
    showToast('تم تصدير وتنزيل النسخة الاحتياطية بنجاح ✓', 'success');
  };

  // 2. Select file & Validate
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      try {
        const parsed = JSON.parse(content);
        // Integrity check: Must contain accounts or products
        if (!parsed.accounts && !parsed.invoices && !parsed.products) {
          showToast('فشل التحقق: الملف المحدد ليس ملف نسخة احتياطية صالح لنظام الغفاري سوفت!', 'error');
          return;
        }

        setPendingFileContent(content);
        setPendingFileInfo({
          date: parsed.exportedAt || 'غير محدد',
          accountsCount: parsed.accounts?.length || 0,
          invoicesCount: parsed.invoices?.length || 0,
          productsCount: parsed.products?.length || 0,
        });
        setShowConfirmRestoreModal(true);
      } catch (err) {
        showToast('الملف المحدد تالف أو غير صالح كملف JSON!', 'error');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  // 3. Perform Restore with Automatic Safety Snapshot First
  const handleExecuteRestore = () => {
    if (!pendingFileContent) return;

    try {
      // Step A: Create safety snapshot of CURRENT state first!
      const currentSnapshot = exportDatabaseJson();
      localStorage.setItem('alghafari_safety_snapshot_before_restore', currentSnapshot);
      localStorage.setItem('alghafari_safety_snapshot_date', new Date().toLocaleString('ar-SA'));

      // Step B: Import new data
      const success = importDatabaseJson(pendingFileContent);
      if (success) {
        setShowConfirmRestoreModal(false);
        setPendingFileContent(null);
        showToast('تم حفظ نسخة أمان من بياناتك السابقة واستعادة النسخة بنجاح! جاري التحديث...', 'success');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showToast('تعذر استيراد البيانات: فشل في بنية الجداول.', 'error');
      }
    } catch (err) {
      showToast('حدث خطأ غير متوقع أثناء استعادة النسخة.', 'error');
    }
  };

  // 4. Revert to Safety Snapshot
  const handleRevertSafetySnapshot = () => {
    const snapshot = localStorage.getItem('alghafari_safety_snapshot_before_restore');
    if (!snapshot) {
      showToast('لا توجد نسخة أمان محفوظة للتراجع عنها!', 'error');
      return;
    }

    const success = importDatabaseJson(snapshot);
    if (success) {
      showToast('تمت استعادة نسخة الأمان السابقة بنجاح! جاري التحديث...', 'success');
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            النسخ الاحتياطي وحماية البيانات واستعادتها بأمان
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            تصدير واستيراد قواعد البيانات المحلية مع إنشاء نسخة أمان تلقائية وفحص السلامة المسبق
          </p>
        </div>
      </div>

      {/* 1. Database Health & Statistics Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="text-xs font-black text-amber-300">إحصائيات وحجم قاعدة البيانات الحالية</h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block mb-1">إجمالي السجلات المحفوظة</span>
            <span className="font-mono-num font-black text-white text-base">{totalRecords}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">سجل محاسبي</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block mb-1">الحجم التقديري للبيانات</span>
            <span className="font-mono-num font-black text-cyan-400 text-base">{approximateSizeKb}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">كيلوبايت (KB)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block mb-1">الفواتير والسندات</span>
            <span className="font-mono-num font-black text-emerald-400 text-base">
              {invoices.length + vouchers.length}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">مستند مرحّل</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block mb-1">تاريخ آخر تصدير</span>
            <span className="font-mono-num font-bold text-amber-300 text-xs block truncate mt-1">
              {lastBackupDate}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Actions: Export & Import */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Backup Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Download className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">تصدير نسخة احتياطية فورية (JSON)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              ينشئ ملفاً مستقلاً يحتوي على كافة بيانات الحسابات، الفواتير، المخزون، والقيود لتخزينه على جهازك أو إرساله للأمان.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadBackup}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-700/20 cursor-pointer active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>تنزيل النسخة الاحتياطية الآن</span>
          </button>
        </div>

        {/* Restore Backup Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">استعادة نسخة احتياطية مع حماية مسبقة</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              يقوم النظام بفحص سلامة الملف أولاً وإنشاء نسخة أمان تلقائية من بياناتك الحالية قبل تطبيق الاستعادة.
            </p>
          </div>

          <label className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 cursor-pointer active:scale-95 transition-all">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>اختيار ملف النسخة الاحتياطية (.json)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelected}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 3. Safety Snapshot Revert Card (If available) */}
      {hasSafetySnapshot && (
        <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-blue-400 shrink-0" />
            <div>
              <h5 className="font-bold text-white text-xs">تتوفر نسخة أمان تلقائية محفوظة في النظام</h5>
              <p className="text-[11px] text-blue-300">
                تم حفظها تلقائياً قبل آخر عملية استعادة (تاريخ: {localStorage.getItem('alghafari_safety_snapshot_date') || 'سابقاً'})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRevertSafetySnapshot}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer active:scale-95 transition-all shadow-md shrink-0"
          >
            التراجع واستعادة نسخة الأمان
          </button>
        </div>
      )}

      {/* 4. Radical Factory Reset Card */}
      <div className="p-5 rounded-2xl bg-red-950/20 border-2 border-red-500/40 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-red-400 text-sm flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            التصفير الجذري الشامل للنظام (Factory Reset)
          </h4>
          <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/30">
            محمي برمز أمان
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          يقوم بمسح جميع الفواتير والقيود والأصناف وتصفير أرصدة الحسابات ليعود النظام نظيفاً تماماً من الصفر (0.00).
        </p>

        <div className="pt-1">
          <button
            type="button"
            onClick={() => {
              setConfirmationPhrase('');
              setShowResetSecurityModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs cursor-pointer shadow-lg shadow-red-600/30 transition-all active:scale-95"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>بدء إجراءات التصفير الجذري الشامل</span>
          </button>
        </div>
      </div>

      {/* Confirm Restore Modal with Integrity Details */}
      {showConfirmRestoreModal && pendingFileInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl p-6 text-right space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">تم فحص النسخة والتحقق من سلامتها ✓</h4>
                <p className="text-[11px] text-cyan-400">تأكيد استعادة البيانات المحاسبية</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">تاريخ تصدير النسخة:</span>
                <span className="font-mono font-bold text-white">{pendingFileInfo.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">عدد الحسابات المكتشفة:</span>
                <span className="font-mono-num font-bold text-emerald-400">{pendingFileInfo.accountsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">عدد الفواتير المكتشفة:</span>
                <span className="font-mono-num font-bold text-amber-400">{pendingFileInfo.invoicesCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">عدد الأصناف المكتشفة:</span>
                <span className="font-mono-num font-bold text-cyan-400">{pendingFileInfo.productsCount}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300">
              🛡️ <strong>حماية فائقة:</strong> سيقوم النظام تلقائياً بإنشاء نسخة أمان من بياناتك الحالية قبل الاستبدال لتتمكن من الرجوع إليها إن أردت.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleExecuteRestore}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer shadow-lg active:scale-95 transition-all"
              >
                تأكيد الاستعادة الآن
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmRestoreModal(false);
                  setPendingFileContent(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Radical Reset Security Phrase Modal */}
      {showResetSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border-2 border-red-500 rounded-3xl w-full max-w-md shadow-2xl p-6 text-right space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center border border-red-500/40">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">تأكيد التصفير الجذري الشامل للنظام</h4>
                <p className="text-[11px] text-red-400 font-bold">هذا الإجراء نهائي ولا يمكن التراجع عنه</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              لتأكيد تصفير كافة الحسابات والفواتير والعملاء والمخازن إلى الصفر (0.00)، يرجى كتابة العبارة التالية بدقة في المربع أدناه:
            </p>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center select-all">
              <code className="text-xs text-red-400 font-black font-mono">
                أوافق على تصفير النظام بالكامل
              </code>
            </div>

            <input
              type="text"
              value={confirmationPhrase}
              onChange={(e) => setConfirmationPhrase(e.target.value)}
              placeholder="اكتب العبارة أعلاه هنا للتأكيد..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border-2 border-red-500/40 focus:border-red-500 rounded-xl text-xs text-white text-center font-bold focus:outline-none"
            />

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                disabled={confirmationPhrase.trim() !== 'أوافق على تصفير النظام بالكامل'}
                onClick={() => {
                  radicalFactoryReset();
                  setShowResetSecurityModal(false);
                  setConfirmationPhrase('');
                  showToast('تم تصفير النظام بالكامل وتصفير كافة الحسابات بنجاح ✓', 'success');
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs cursor-pointer shadow-lg shadow-red-700/30 transition-all active:scale-95"
              >
                تأكيد التصفير النهائي للصفر
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetSecurityModal(false);
                  setConfirmationPhrase('');
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
