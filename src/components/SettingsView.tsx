import React, { useState } from 'react';
import {
  Settings,
  Building,
  Save,
  Download,
  Upload,
  RotateCcw,
  Calendar,
  Lock,
  CheckCircle,
  AlertTriangle,
  Coins,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    radicalFactoryReset,
    exportDatabaseJson,
    importDatabaseJson,
    accounts,
    journalEntries,
    openDeleteConfirm,
    showToast,
  } = useAccounting();

  // Security phrase modal for radical factory reset
  const [showResetSecurityModal, setShowResetSecurityModal] = useState(false);
  const [confirmationPhrase, setConfirmationPhrase] = useState('');

  const [form, setForm] = useState({
    companyName: settings.companyName,
    companyNameEn: settings.companyNameEn,
    businessSector: settings.businessSector || 'GENERAL',
    taxNumber: settings.taxNumber,
    commercialRecord: settings.commercialRecord,
    phone: settings.phone,
    address: settings.address,
    baseCurrency: settings.baseCurrency,
    fiscalYear: settings.fiscalYear,
    taxEnabled: settings.taxEnabled !== false,
    defaultTaxRate: settings.defaultTaxRate,
    invoiceFooterNotes: settings.invoiceFooterNotes || 'شكراً لتعاملكم معنا. البضاعة المباعة ترد وتستبدل خلال المدة المحددة نظاماً.',
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart_accountant_pro_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importDatabaseJson(content);
        if (ok) {
          setImportStatus('تمت استعادة النسخة الاحتياطية بنجاح!');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setImportStatus('خطأ: الملف غير صالح أو تالف.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings className="w-7 h-7 text-emerald-400" />
          إعدادات النظام والتصفير الشامل والنسخ الاحتياطي
        </h2>
        <p className="text-sm text-slate-400">
          تخصيص بيانات المنشأة، الرقم الضريبي، العملة الافتراضية، وإدارة قواعد البيانات والتصفير الجذري
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          تم حفظ الإعدادات بنجاح وتحديث كافة الفواتير والتقارير تلقائياً!
        </div>
      )}

      {/* Radical Factory Reset Card (Requested by User) */}
      <div className="p-6 rounded-3xl bg-red-950/20 border-2 border-red-500/40 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-red-400 text-base flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-400" />
            التصفير الجذري الشامل للنظام (Factory Reset)
          </h3>
          <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/30">
            تصفير كامل للصفر
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          هذا الخيار يقوم بمسح جميع العملاء، الموردين، المخازن، الأصناف، الفواتير، عروض الأسعار، المردودات، التحويلات، القيود اليومية، والأسناد وتصفير كافة الأرصدة في دليل الحسابات إلى الصفر تماماً (0.00)، ليصبح النظام فارغاً ونظيفاً تماماً وجاهزاً لإدخال بيانات عملك الحقيقية.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => {
              setConfirmationPhrase('');
              setShowResetSecurityModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs cursor-pointer shadow-lg shadow-red-600/30 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            تنفيذ التصفير الجذري الشامل الآن
          </button>
        </div>
      </div>

      {/* Security Modal requiring typing "الغفاري سوفت برو" for Radical Factory Reset */}
      {showResetSecurityModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-red-500/60 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden p-6 text-right space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-lg text-white">تأكيد الحذف والتصفير الجذري الشامل</h3>
                <p className="text-xs text-red-400 font-bold mt-0.5">عملية تصفير حاسمة لكافة بيانات النظام</p>
              </div>
              <button
                type="button"
                onClick={() => setShowResetSecurityModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-red-950/30 border border-red-900/50 space-y-2 text-xs text-slate-300">
              <p className="font-bold text-red-300">⚠️ تنبيه أمني شديد الأهمية:</p>
              <p>
                سيتم مسح كافة الفواتير، الأصناف، المخازن، الفروع، العملاء، الموردين، القيود، والأسناد وتصفير دليل الحسابات كاملاً إلى الصفر (0.00).
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                لتأكيد الحذف الشامل، يرجى كتابة اسم النظام التالي بدقة:
              </label>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center font-black text-amber-400 text-lg tracking-wider select-all shadow-inner">
                الغفاري سوفت برو
              </div>
              <input
                type="text"
                value={confirmationPhrase}
                onChange={(e) => setConfirmationPhrase(e.target.value)}
                placeholder="اكتب هنا: الغفاري سوفت برو"
                className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 focus:border-red-500 rounded-xl text-center font-bold text-white text-base focus:outline-none transition-colors"
                autoFocus
              />
              {confirmationPhrase.trim().length > 0 && confirmationPhrase.trim() !== 'الغفاري سوفت برو' && (
                <p className="text-[11px] text-amber-400 text-center font-medium">
                  يجب كتابة: (الغفاري سوفت برو) تماماً لتفعيل زر التأكيد
                </p>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled={confirmationPhrase.trim() !== 'الغفاري سوفت برو'}
                onClick={() => {
                  if (confirmationPhrase.trim() === 'الغفاري سوفت برو') {
                    radicalFactoryReset();
                    setShowResetSecurityModal(false);
                    showToast('تم تنفيذ التصفير الجذري الشامل وإعادة النظام لحالة المصنع النقية بنجاح ✓', 'success');
                  }
                }}
                className={`flex-1 py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  confirmationPhrase.trim() === 'الغفاري سوفت برو'
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/40 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 opacity-60'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>تأكيد التصفير الجذري الشامل الآن</span>
              </button>
              <button
                type="button"
                onClick={() => setShowResetSecurityModal(false)}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm cursor-pointer transition-colors"
              >
                إلغاء الأمر
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Company Profile Form */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
          <Building className="w-5 h-5 text-emerald-400" />
          بيانات المنشأة والترخيص التجاري والضريبي
        </h3>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-emerald-400 mb-1">
                تصنيف ونوع النشاط التجاري (Activity Sector)
              </label>
              <select
                value={form.businessSector}
                onChange={(e) => setForm({ ...form, businessSector: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-800 border border-emerald-500/40 rounded-xl text-sm text-white font-bold"
              >
                <option value="GENERAL">🏢 عام لجميع الأنشطة والمؤسسات (General Business & Services)</option>
                <option value="RETAIL">🏪 تموينات وسوبرماركت ومحلات تجزئة (Retail & Groceries)</option>
                <option value="WHOLESALE">📦 تجارة جملة وتوزيع ومستودعات (Wholesale & Distribution)</option>
                <option value="RESTAURANT">☕ كافيه ومطعم ومخبز (Cafes, Restaurants & Bakeries)</option>
                <option value="SERVICES">💼 خدمات واستشارات وصيانة وتقنية (Services & Consulting)</option>
                <option value="CONTRACTING">🛠️ مقاولات وورش وتشطيبات وإنشاءات (Contracting & Workshops)</option>
                <option value="PERSONAL">👤 حسابات شخصية وإدارة ديون الأفراد (Personal Debts & Ledger)</option>
                <option value="PHARMACY">💊 صيدليات ومستلزمات ومراكز طبية (Pharmacies & Medical)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                اسم المنشأة أو الشركة (يظهر في ترويسة الفواتير والتقارير)
              </label>
              <input
                type="text"
                required
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                اسم المنشأة المطبوع على الفواتير والسندات (شعار واسم نظام الغفاري سوفت برو ثابت رسمياً كشعار للنظام)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                اسم المنشأة بالإنجليزية (اختياري)
              </label>
              <input
                type="text"
                value={form.companyNameEn}
                onChange={(e) => setForm({ ...form, companyNameEn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-sans text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                رقم السجل التجاري
              </label>
              <input
                type="text"
                value={form.commercialRecord}
                onChange={(e) => setForm({ ...form, commercialRecord: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono-num"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                الرقم الضريبي للمنشأة (VAT ID)
              </label>
              <input
                type="text"
                value={form.taxNumber}
                onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                placeholder="أدخل الرقم الضريبي أو اتركه فارغاً إذا كنت معفياً"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono-num"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف والتواصل</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono-num"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">العنوان والمقر</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
            />
          </div>

          {/* Tax Mode Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-2">
                حالة ضريبة القيمة المضافة (VAT Status)
              </label>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-white font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="taxEnabled"
                    checked={form.taxEnabled === true}
                    onChange={() => setForm({ ...form, taxEnabled: true, defaultTaxRate: 0.15 })}
                    className="text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span>خاضع للضريبة (15%)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="taxEnabled"
                    checked={form.taxEnabled === false}
                    onChange={() => setForm({ ...form, taxEnabled: false, defaultTaxRate: 0 })}
                    className="text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span>معفى / غير مسجل (0% فواتير مبسطة)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                نسبة الضريبة المفعلة
              </label>
              <input
                type="number"
                step="0.01"
                disabled={!form.taxEnabled}
                value={form.defaultTaxRate}
                onChange={(e) => setForm({ ...form, defaultTaxRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono-num font-bold disabled:opacity-40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700">
            <div>
              <label className="block text-xs font-bold text-emerald-400 mb-1">
                العملة المحاسبية الأساسية للنظام
              </label>
              <select
                value={form.baseCurrency}
                onChange={(e) => setForm({ ...form, baseCurrency: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-bold"
              >
                <option value="SAR">ريال سعودي (SAR)</option>
                <option value="USD">دولار أمريكي (USD)</option>
                <option value="YER">ريال يمني (YER)</option>
                <option value="AED">درهم إماراتي (AED)</option>
                <option value="EGP">جنيه مصري (EGP)</option>
                <option value="KWD">دينار كويتي (KWD)</option>
                <option value="JOD">دينار أردني (JOD)</option>
                <option value="EUR">يورو (EUR)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                السنة المالية الحالية
              </label>
              <input
                type="text"
                value={form.fiscalYear}
                onChange={(e) => setForm({ ...form, fiscalYear: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono-num font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              ملاحظات وتذييل الفواتير وعروض الأسعار (شروط الاسترجاع والضمان)
            </label>
            <textarea
              rows={2}
              value={form.invoiceFooterNotes}
              onChange={(e) => setForm({ ...form, invoiceFooterNotes: e.target.value })}
              placeholder="مثال: شكراً لتعاملكم معنا. البضاعة المباعة ترد وتستبدل خلال 3 أيام مع أصل الفاتورة."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              حفظ بيانات وتفضيلات المنشأة
            </button>
          </div>
        </form>
      </div>

      {/* Database Backup & Restore */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
          <Download className="w-5 h-5 text-cyan-400" />
          النسخ الاحتياطي واستعادة البيانات (JSON Backup & Restore)
        </h3>

        <p className="text-xs text-slate-400 leading-relaxed">
          يمكنك تصدير قاعدة بيانات النظام بالكامل إلى ملف خارجي، واستعادتها في أي لحظة.
        </p>

        {importStatus && (
          <div className="p-3 rounded-xl bg-slate-800 text-xs font-bold text-cyan-300">
            {importStatus}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={handleDownloadBackup}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 cursor-pointer transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            تصدير وحفظ نسخة احتياطية (JSON)
          </button>

          <label className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 cursor-pointer transition-all">
            <Upload className="w-4 h-4 text-cyan-400" />
            استعادة نسخة احتياطية من ملف
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
