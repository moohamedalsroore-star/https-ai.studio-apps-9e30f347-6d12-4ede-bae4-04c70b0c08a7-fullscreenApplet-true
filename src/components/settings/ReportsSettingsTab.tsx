import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Calendar,
  CheckCircle2,
  Save,
  RotateCcw,
  Download,
  Table,
  Sliders,
  Printer,
} from 'lucide-react';
import { Account, Contact, Invoice, Product } from '../../types/accounting';
import { ReportSettings, DefaultDateRange } from '../../types/settings';
import { DEFAULT_REPORT_CONFIG } from '../../utils/settingsDefaults';
import {
  exportAccountsToExcel,
  exportContactsToExcel,
  exportInvoicesToExcel,
  exportProductsToExcel,
} from '../../utils/excelExport';

interface ReportsSettingsTabProps {
  initialConfig?: ReportSettings;
  accounts: Account[];
  invoices: Invoice[];
  products: Product[];
  contacts: Contact[];
  baseCurrency: string;
  onSave: (config: ReportSettings) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ReportsSettingsTab: React.FC<ReportsSettingsTabProps> = ({
  initialConfig = DEFAULT_REPORT_CONFIG,
  accounts,
  invoices,
  products,
  contacts,
  baseCurrency,
  onSave,
  showToast,
}) => {
  const [form, setForm] = useState<ReportSettings>({
    ...DEFAULT_REPORT_CONFIG,
    ...initialConfig,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setSavedSuccess(true);
    showToast('تم حفظ إعدادات التقارير وتحديث خيارات التصدير بنجاح ✓', 'success');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    setForm(DEFAULT_REPORT_CONFIG);
    showToast('تمت استعادة إعدادات التقارير الافتراضية', 'info');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-right animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            إعدادات التقارير المالية وتصدير Excel و PDF
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            تخصيص الفترات الزمنية الافتراضية، تنسيق الأعمدة، التوقيعات، والتصدير المباشر للجداول
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>تم حفظ إعدادات القوائم والتقارير المالية وتطبيقها على كافة شاشات التقارير!</span>
        </div>
      )}

      {/* 1. Direct Instant Excel Export Actions (حقيقي ومختبر) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900 to-amber-950/20 border border-emerald-500/40 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h4 className="text-xs font-black text-white">تصدير فوري ومباشر لقواعد البيانات إلى ملفات Excel (.xlsx)</h4>
          </div>
          <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
            جداول إكسل حقيقية جاهزة للتحميل
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          يمكنك تصدير أي جزء من بيانات النظام مباشرة إلى ملف مايكروسوفت إكسل منظم ومنسق بالكامل بضغطة زر واحدة:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => {
              exportAccountsToExcel(accounts, baseCurrency);
              showToast('تم تصدير دليل الحسابات إلى ملف Excel بنجاح ✓', 'success');
            }}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800/80 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-500/50 text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>تصدير دليل الحسابات (Excel)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              exportInvoicesToExcel(invoices, baseCurrency);
              showToast('تم تصدير سجل الفواتير إلى ملف Excel بنجاح ✓', 'success');
            }}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800/80 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-500/50 text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>تصدير سجل الفواتير (Excel)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              exportProductsToExcel(products, baseCurrency);
              showToast('تم تصدير جرد المخزون إلى ملف Excel بنجاح ✓', 'success');
            }}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800/80 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-500/50 text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>تصدير قائمة المخزون (Excel)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              exportContactsToExcel(contacts, baseCurrency);
              showToast('تم تصدير قائمة العملاء والموردين إلى Excel بنجاح ✓', 'success');
            }}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800/80 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-500/50 text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>تصدير العملاء والموردين (Excel)</span>
          </button>
        </div>
      </div>

      {/* 2. Default Period & Export Format */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="text-xs font-black text-amber-300">الفترات الافتراضية وصيغة التصدير المفضلة</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              الفترة الزمنية الافتراضية عند فتح شاشات التقارير
            </label>
            <select
              value={form.defaultDateRange}
              onChange={(e) => setForm({ ...form, defaultDateRange: e.target.value as DefaultDateRange })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
            >
              <option value="TODAY">اليوم الحالي فقط (Daily)</option>
              <option value="THIS_WEEK">الأسبوع الحالي (Weekly)</option>
              <option value="THIS_MONTH">الشهر الحالي (Monthly - الافتراضي الموصى به)</option>
              <option value="THIS_QUARTER">الربع المالي الحالي (Quarterly)</option>
              <option value="THIS_YEAR">السنة المالية بالكامل (Year to Date)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              صيغة التصدير الأساسية عند الضغط على زر التصدير
            </label>
            <select
              value={form.defaultExportFormat}
              onChange={(e) => setForm({ ...form, defaultExportFormat: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
            >
              <option value="PDF">مستند إلكتروني مجهز للطباعة (PDF عالي الدقة)</option>
              <option value="EXCEL">جدول بيانات قابل للتعديل والتحليل (Excel XLSX)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Column Visibility & Signatures */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="text-xs font-black text-amber-300">تخصيص أعمدة التقارير والتوقيعات</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={form.showZeroBalanceAccounts}
              onChange={(e) => setForm({ ...form, showZeroBalanceAccounts: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span className="text-xs font-bold text-slate-200">إظهار الحسابات ذات الرصيد الصفري (0.00)</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={form.showAccountCode}
              onChange={(e) => setForm({ ...form, showAccountCode: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span className="text-xs font-bold text-slate-200">إظهار كود ورقم الحساب في كشف الحساب والميزان</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={form.reportSignatures}
              onChange={(e) => setForm({ ...form, reportSignatures: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span className="text-xs font-bold text-slate-200">إظهار تذييل التوقيع والاعتماد أسفل القوائم المالية</span>
          </label>
        </div>

        {form.reportSignatures && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">المسمى الوظيفي لمعد التقرير</label>
              <input
                type="text"
                value={form.preparedByTitle}
                onChange={(e) => setForm({ ...form, preparedByTitle: e.target.value })}
                placeholder="المحاسب المسؤول"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">المسمى الوظيفي للمعتمد</label>
              <input
                type="text"
                value={form.approvedByTitle}
                onChange={(e) => setForm({ ...form, approvedByTitle: e.target.value })}
                placeholder="المدير المالي / المدير العام"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
        <button
          type="button"
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>استعادة الإعدادات الافتراضية للتقارير</span>
        </button>

        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-600/20 cursor-pointer transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>حفظ إعدادات التقارير</span>
        </button>
      </div>
    </form>
  );
};
