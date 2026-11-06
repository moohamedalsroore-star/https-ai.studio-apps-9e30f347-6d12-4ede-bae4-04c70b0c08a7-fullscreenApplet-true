import React, { useState } from 'react';
import {
  FileText,
  Hash,
  Eye,
  CheckCircle2,
  RotateCcw,
  Save,
  Stamp,
  PenTool,
  ToggleLeft,
  ToggleRight,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw as ReturnIcon,
  Tag,
} from 'lucide-react';
import { DocumentTemplateSettings } from '../../types/settings';
import { DEFAULT_DOCUMENT_TEMPLATES } from '../../utils/settingsDefaults';

interface DocumentTemplatesTabProps {
  initialTemplates?: DocumentTemplateSettings;
  onSave: (templates: DocumentTemplateSettings) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DocumentTemplatesTab: React.FC<DocumentTemplatesTabProps> = ({
  initialTemplates = DEFAULT_DOCUMENT_TEMPLATES,
  onSave,
  showToast,
}) => {
  const [form, setForm] = useState<DocumentTemplateSettings>({
    ...DEFAULT_DOCUMENT_TEMPLATES,
    ...initialTemplates,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setSavedSuccess(true);
    showToast('تم حفظ قوالب وترقيم المستندات بنجاح وتحديث كافة السندات والفواتير ✓', 'success');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    setForm(DEFAULT_DOCUMENT_TEMPLATES);
    showToast('تمت استعادة إعدادات وقوالب المستندات الافتراضية', 'info');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-right animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Hash className="w-5 h-5 text-amber-400" />
            إعدادات قوالب المستندات والترقيم التلقائي
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            تخصيص بادئات الفواتير والسندات، أرقام البداية، إظهار وإخفاء الحقول، والأختام والتواقيع والشروط
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>تم حفظ إعدادات الترقيم والقوالب وتطبيقها على المستندات الجديدة تلقائياً!</span>
        </div>
      )}

      {/* 1. Independent Auto-Numbering Prefixes & Start Numbers */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Hash className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-black text-white">الترقيم التسلسلي التلقائي والبادئات المستقلة لكل مستند</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Sales Invoices */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5" />
                فواتير المبيعات
              </span>
              <span className="text-[10px] text-slate-400 font-mono-num">
                مثال: {form.salesInvoicePrefix}{form.salesInvoiceStartNumber}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">البادئة (Prefix)</label>
                <input
                  type="text"
                  value={form.salesInvoicePrefix}
                  onChange={(e) => setForm({ ...form, salesInvoicePrefix: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">رقم البداية</label>
                <input
                  type="number"
                  value={form.salesInvoiceStartNumber}
                  onChange={(e) => setForm({ ...form, salesInvoiceStartNumber: parseInt(e.target.value) || 1 })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Purchases */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                فواتير المشتريات
              </span>
              <span className="text-[10px] text-slate-400 font-mono-num">
                مثال: {form.purchaseInvoicePrefix}{form.purchaseInvoiceStartNumber}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">البادئة (Prefix)</label>
                <input
                  type="text"
                  value={form.purchaseInvoicePrefix}
                  onChange={(e) => setForm({ ...form, purchaseInvoicePrefix: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">رقم البداية</label>
                <input
                  type="number"
                  value={form.purchaseInvoiceStartNumber}
                  onChange={(e) => setForm({ ...form, purchaseInvoiceStartNumber: parseInt(e.target.value) || 1 })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Return Invoices */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                <ReturnIcon className="w-3.5 h-3.5" />
                إشعارات المردودات
              </span>
              <span className="text-[10px] text-slate-400 font-mono-num">
                مثال: {form.returnInvoicePrefix}{form.returnInvoiceStartNumber}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">البادئة (Prefix)</label>
                <input
                  type="text"
                  value={form.returnInvoicePrefix}
                  onChange={(e) => setForm({ ...form, returnInvoicePrefix: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">رقم البداية</label>
                <input
                  type="number"
                  value={form.returnInvoiceStartNumber}
                  onChange={(e) => setForm({ ...form, returnInvoiceStartNumber: parseInt(e.target.value) || 1 })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Receipt Vouchers */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <ArrowDownLeft className="w-3.5 h-3.5" />
                سندات القبض المالي
              </span>
              <span className="text-[10px] text-slate-400 font-mono-num">
                مثال: {form.receiptVoucherPrefix}{form.receiptVoucherStartNumber}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">البادئة (Prefix)</label>
                <input
                  type="text"
                  value={form.receiptVoucherPrefix}
                  onChange={(e) => setForm({ ...form, receiptVoucherPrefix: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">رقم البداية</label>
                <input
                  type="number"
                  value={form.receiptVoucherStartNumber}
                  onChange={(e) => setForm({ ...form, receiptVoucherStartNumber: parseInt(e.target.value) || 1 })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Vouchers */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                سندات الصرف المالي
              </span>
              <span className="text-[10px] text-slate-400 font-mono-num">
                مثال: {form.paymentVoucherPrefix}{form.paymentVoucherStartNumber}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">البادئة (Prefix)</label>
                <input
                  type="text"
                  value={form.paymentVoucherPrefix}
                  onChange={(e) => setForm({ ...form, paymentVoucherPrefix: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">رقم البداية</label>
                <input
                  type="number"
                  value={form.paymentVoucherStartNumber}
                  onChange={(e) => setForm({ ...form, paymentVoucherStartNumber: parseInt(e.target.value) || 1 })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quotations */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                عروض الأسعار الرسمية
              </span>
              <span className="text-[10px] text-slate-400 font-mono-num">
                مثال: {form.quotationPrefix}{form.quotationStartNumber}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">البادئة (Prefix)</label>
                <input
                  type="text"
                  value={form.quotationPrefix}
                  onChange={(e) => setForm({ ...form, quotationPrefix: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">رقم البداية</label>
                <input
                  type="number"
                  value={form.quotationStartNumber}
                  onChange={(e) => setForm({ ...form, quotationStartNumber: parseInt(e.target.value) || 1 })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Show / Hide Document Fields */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="text-xs font-black text-amber-300">إظهار وإخفاء حقول وبيانات المستند المطبوع</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={form.showItemBarcode}
              onChange={(e) => setForm({ ...form, showItemBarcode: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span className="text-xs font-bold text-slate-200">إظهار باركود الأصناف في الجدول</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={form.showItemUnit}
              onChange={(e) => setForm({ ...form, showItemUnit: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span className="text-xs font-bold text-slate-200">إظهار وحدة القياس (حبة، كرتون...)</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={form.showTaxPerItem}
              onChange={(e) => setForm({ ...form, showTaxPerItem: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span className="text-xs font-bold text-slate-200">إظهار نسبة ومبلغ الضريبة لكل صنف</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={form.showDiscountPerItem}
              onChange={(e) => setForm({ ...form, showDiscountPerItem: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span className="text-xs font-bold text-slate-200">إظهار عمود الخصم الممنوح</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={form.showCommercialRecord}
              onChange={(e) => setForm({ ...form, showCommercialRecord: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span className="text-xs font-bold text-slate-200">إظهار رقم السجل التجاري في الترويسة</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={form.showTaxNumber}
              onChange={(e) => setForm({ ...form, showTaxNumber: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span className="text-xs font-bold text-slate-200">إظهار الرقم الضريبي في الترويسة</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={form.showSignatureSection}
              onChange={(e) => setForm({ ...form, showSignatureSection: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span className="text-xs font-bold text-slate-200">إظهار مربعات توقيع المستلم والمحاسب</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={form.showDigitalSeal}
              onChange={(e) => setForm({ ...form, showDigitalSeal: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span className="text-xs font-bold text-slate-200">إظهار الختم الرقمي المعتمد للمؤسسة</span>
          </label>
        </div>
      </div>

      {/* 3. Invoice Terms and Conditions & Footer Notes */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <label className="block text-xs font-bold text-slate-300">
          شروط وأحكام الفاتورة وتذييل المستند الرسمي (تظهر أسفل كل فاتورة):
        </label>
        <textarea
          rows={3}
          value={form.invoiceTermsAndConditions}
          onChange={(e) => setForm({ ...form, invoiceTermsAndConditions: e.target.value })}
          placeholder="اكتب هنا الشروط والضمان وسياسة الاستبدال والاسترجاع..."
          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white leading-relaxed focus:outline-none"
        />
      </div>

      {/* 4. Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
        <button
          type="button"
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>استعادة القوالب الافتراضية</span>
        </button>

        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-600/20 cursor-pointer transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>حفظ إعدادات القوالب والترقيم</span>
        </button>
      </div>
    </form>
  );
};
