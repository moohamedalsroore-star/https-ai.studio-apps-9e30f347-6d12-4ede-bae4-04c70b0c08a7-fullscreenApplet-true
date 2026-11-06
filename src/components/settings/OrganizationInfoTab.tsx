import React, { useState } from 'react';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Coins,
  Calendar,
  Percent,
  CheckCircle2,
  Save,
  RotateCcw,
  Upload,
  Image,
} from 'lucide-react';
import { SystemSettings, BusinessSector, CurrencyConfig } from '../../types/accounting';

interface OrganizationInfoTabProps {
  settings: SystemSettings;
  currencies: CurrencyConfig[];
  onSave: (updates: Partial<SystemSettings>) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const OrganizationInfoTab: React.FC<OrganizationInfoTabProps> = ({
  settings,
  currencies,
  onSave,
  showToast,
}) => {
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
    decimalPlaces: settings.decimalPlaces ?? 2,
    logoUrl: settings.logoUrl || '/assets/aistudio/1787182612810_5ba9faf5.png',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setSavedSuccess(true);
    showToast('تم حفظ وتحديث بيانات المنشأة بنجاح في جميع أجزاء النظام ✓', 'success');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setForm({ ...form, logoUrl: dataUrl });
        showToast('تم تحميل شعار المنشأة الجديد بنجاح', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-right animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            بيانات المنشأة والهوية التجارية والضرائب
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            تخصيص اسم المؤسسة، الشعار، الرقم الضريبي، العملة الافتراضية، والسنة المالية
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>تم حفظ بيانات المؤسسة وتحديث كافة الفواتير والتقارير تلقائياً!</span>
        </div>
      )}

      {/* 1. Logo & Identity Section */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-5">
        <div className="relative group shrink-0">
          <div className="w-24 h-24 rounded-2xl bg-slate-950 border-2 border-amber-500/40 p-1 flex items-center justify-center overflow-hidden shadow-xl shadow-amber-950/30">
            <img
              src={form.logoUrl}
              alt="شعار المنشأة"
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
            />
          </div>
        </div>

        <div className="flex-1 space-y-2 text-center sm:text-right">
          <h4 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-2">
            <span>شعار المؤسسة الرسمي</span>
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
              يظهر في الفواتير والتقارير
            </span>
          </h4>
          <p className="text-xs text-slate-400">
            يمكنك رفع شعار مخصص لمؤسستك (PNG, JPG, SVG) ليظهر في أعلى الفواتير وسندات القبض والصرف.
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 cursor-pointer transition-colors active:scale-95">
              <Upload className="w-3.5 h-3.5" />
              <span>رفع شعار جديد</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={() => setForm({ ...form, logoUrl: '/assets/aistudio/1787182612810_5ba9faf5.png' })}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              استعادة الشعار الأصلي
            </button>
          </div>
        </div>
      </div>

      {/* 2. Basic Company Names & Sector */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="text-xs font-black text-amber-300">الأسماء والنشاط التجاري</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              اسم المؤسسة / النشاط (بالعربي) *
            </label>
            <input
              type="text"
              required
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              اسم المؤسسة (بالإنجليزي)
            </label>
            <input
              type="text"
              value={form.companyNameEn}
              onChange={(e) => setForm({ ...form, companyNameEn: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              النشاط والقطاع التجاري
            </label>
            <select
              value={form.businessSector}
              onChange={(e) => setForm({ ...form, businessSector: e.target.value as BusinessSector })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-500"
            >
              <option value="GENERAL">تجارة عامة وخدمات</option>
              <option value="RETAIL">متاجر تجزئة وسوبرماركت</option>
              <option value="WHOLESALE">تجارة جملة وتوزيع</option>
              <option value="SERVICES">خدمات ومهن واستشارات</option>
              <option value="RESTAURANT">مطاعم ومقاهي وكافيهات</option>
              <option value="CONTRACTING">مقاولات وتوريدات هندسية</option>
              <option value="PHARMACY">صيدليات وأدوية ومستلزمات طبية</option>
              <option value="PERSONAL">أنشطة وأعمال فردية</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Tax, CR, Phone, Address */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="text-xs font-black text-amber-300">البيانات القانونية والاتصال</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              الرقم الضريبي (15 رقم)
            </label>
            <input
              type="text"
              value={form.taxNumber}
              onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
              placeholder="300000000000003"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              رقم السجل التجاري (CR)
            </label>
            <input
              type="text"
              value={form.commercialRecord}
              onChange={(e) => setForm({ ...form, commercialRecord: e.target.value })}
              placeholder="1010000000"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              رقم الهاتف / الجوال
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="0500000000"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              العنوان الوطني / المدينة
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="الرياض - حي العليا"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* 4. Financial Currency, Year, Decimals, Taxes */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="text-xs font-black text-amber-300">العملة الافتراضية، السنة المالية، والضرائب</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-emerald-400 mb-1">
              العملة المحاسبية الأساسية للنظام
            </label>
            <select
              value={form.baseCurrency}
              onChange={(e) => setForm({ ...form, baseCurrency: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-500"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code} - {c.symbol})
                </option>
              ))}
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
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              المنازل العشرية (Decimal Places)
            </label>
            <select
              value={form.decimalPlaces}
              onChange={(e) => setForm({ ...form, decimalPlaces: parseInt(e.target.value) || 2 })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-500"
            >
              <option value="0">بدون كسور (0 منازل - 100)</option>
              <option value="2">منزلتان عشريتان (0.00 - قياسي موصى به)</option>
              <option value="3">ثلاث منازل عشرية (0.000 - للذهب والوزن)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              نسبة ضريبة القيمة المضافة
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                disabled={!form.taxEnabled}
                value={form.defaultTaxRate}
                onChange={(e) => setForm({ ...form, defaultTaxRate: parseFloat(e.target.value) || 0 })}
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white disabled:opacity-40 focus:outline-none"
              />
              <span className="text-xs font-bold text-amber-400">
                {(form.defaultTaxRate * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:border-slate-700 w-fit">
            <input
              type="checkbox"
              checked={form.taxEnabled}
              onChange={(e) => setForm({ ...form, taxEnabled: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span className="text-xs font-bold text-white">تفعيل نظام وحساب ضريبة القيمة المضافة في الفواتير</span>
          </label>
        </div>
      </div>

      {/* 5. Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
        <button
          type="button"
          onClick={() => {
            setForm({
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
              decimalPlaces: settings.decimalPlaces ?? 2,
              logoUrl: settings.logoUrl || '/assets/aistudio/1787182612810_5ba9faf5.png',
            });
            showToast('تم إلغاء التعديلات واستعادة القيم المحفوظة', 'info');
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>تراجع عن التعديلات</span>
        </button>

        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-600/20 cursor-pointer transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>حفظ بيانات المنشأة</span>
        </button>
      </div>
    </form>
  );
};
