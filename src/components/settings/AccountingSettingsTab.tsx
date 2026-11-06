import React, { useState } from 'react';
import {
  Coins,
  BookOpen,
  CheckCircle2,
  Save,
  RotateCcw,
  CreditCard,
  Percent,
  Sliders,
  DollarSign,
  ArrowRightLeft,
} from 'lucide-react';
import { Account } from '../../types/accounting';
import { AccountingSettings, RoundingPolicy } from '../../types/settings';
import { DEFAULT_ACCOUNTING_CONFIG } from '../../utils/settingsDefaults';

interface AccountingSettingsTabProps {
  initialConfig?: AccountingSettings;
  accounts: Account[];
  onSave: (config: AccountingSettings) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AccountingSettingsTab: React.FC<AccountingSettingsTabProps> = ({
  initialConfig = DEFAULT_ACCOUNTING_CONFIG,
  accounts,
  onSave,
  showToast,
}) => {
  const [form, setForm] = useState<AccountingSettings>({
    ...DEFAULT_ACCOUNTING_CONFIG,
    ...initialConfig,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setSavedSuccess(true);
    showToast('تم حفظ إعدادات المحاسبة والربط الآلي بنجاح ✓', 'success');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    setForm(DEFAULT_ACCOUNTING_CONFIG);
    showToast('تمت استعادة إعدادات المحاسبة الافتراضية', 'info');
  };

  // Helper to render account select dropdown
  const renderAccountSelect = (
    label: string,
    value: string,
    onChange: (id: string) => void,
    categoryFilter?: string
  ) => {
    const filtered = categoryFilter
      ? accounts.filter((a) => a.category === categoryFilter)
      : accounts;

    return (
      <div>
        <label className="block text-xs font-bold text-slate-300 mb-1">{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-500"
        >
          {filtered.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.code} - {acc.nameAr}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-right animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            إعدادات المحاسبة والربط الآلي لدليل الحسابات
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            تحديد الحسابات الافتراضية لترحيل القيود التلقائية، طرق الدفع، الخصومات، وسياسات التقريب
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>تم حفظ الإعدادات وتوجيه قيود اليومية المحاسبية الآلية بنجاح!</span>
        </div>
      )}

      {/* 1. Default Assets & Cash Accounts */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-black text-white">الحسابات الافتراضية للنقدية والبنوك والذمم</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {renderAccountSelect('حساب الصندوق النقدي الافتراضي (الخزينة)', form.defaultCashAccountId, (id) =>
            setForm({ ...form, defaultCashAccountId: id })
          )}

          {renderAccountSelect('حساب البنك / الشبكة الافتراضي', form.defaultBankAccountId, (id) =>
            setForm({ ...form, defaultBankAccountId: id })
          )}

          {renderAccountSelect('حساب العملاء (الذمم المدينة)', form.defaultReceivableAccountId, (id) =>
            setForm({ ...form, defaultReceivableAccountId: id })
          )}

          {renderAccountSelect('حساب الموردين (الذمم الدائنة)', form.defaultPayableAccountId, (id) =>
            setForm({ ...form, defaultPayableAccountId: id })
          )}
        </div>
      </div>

      {/* 2. Revenues, Costs, Inventory & VAT */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <DollarSign className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-black text-white">حسابات الإيرادات والمبيعات وتكلفة البضاعة والمخزون والضرائب</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderAccountSelect('حساب إيرادات المبيعات (Sales Revenue)', form.defaultSalesRevenueAccountId, (id) =>
            setForm({ ...form, defaultSalesRevenueAccountId: id })
          )}

          {renderAccountSelect('حساب تكلفة البضاعة المباعة (COGS)', form.defaultCostOfGoodsSoldAccountId, (id) =>
            setForm({ ...form, defaultCostOfGoodsSoldAccountId: id })
          )}

          {renderAccountSelect('حساب المخزون العام (Inventory Asset)', form.defaultInventoryAccountId, (id) =>
            setForm({ ...form, defaultInventoryAccountId: id })
          )}

          {renderAccountSelect('حساب ضريبة القيمة المضافة مخرجات (المبيعات)', form.defaultTaxPayableAccountId, (id) =>
            setForm({ ...form, defaultTaxPayableAccountId: id })
          )}

          {renderAccountSelect('حساب ضريبة القيمة المضافة مدخلات (المشتريات)', form.defaultTaxReceivableAccountId, (id) =>
            setForm({ ...form, defaultTaxReceivableAccountId: id })
          )}

          {renderAccountSelect('حساب الخصم المسموح به للعملاء', form.defaultDiscountAllowedAccountId, (id) =>
            setForm({ ...form, defaultDiscountAllowedAccountId: id })
          )}
        </div>
      </div>

      {/* 3. Payment Methods, Rounding & Auto-Posting */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="text-xs font-black text-amber-300">سلوكيات المحاسبة، طرق الدفع، وتقريب المبالغ</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              طريقة الدفع الافتراضية للفواتير
            </label>
            <select
              value={form.defaultPaymentMethod}
              onChange={(e) => setForm({ ...form, defaultPaymentMethod: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
            >
              <option value="CASH">نقدي (Cash)</option>
              <option value="CARD">شبكة / مدى / بطاقة بنكية (Card)</option>
              <option value="TRANSFER">تحويل بنكي (Bank Transfer)</option>
              <option value="CREDIT">آجل / ذمم (On Credit)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              سياسة تقريب الكسور والمبالغ (Rounding Policy)
            </label>
            <select
              value={form.roundingPolicy}
              onChange={(e) => setForm({ ...form, roundingPolicy: e.target.value as RoundingPolicy })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
            >
              <option value="NONE">بدون تقريب (احتساب المبالغ بالهللة تماماً 0.00)</option>
              <option value="NEAREST_0_05">تقريب لأقرب 5 هللات (0.05)</option>
              <option value="NEAREST_0_25">تقريب لأقرب ربع ريال (0.25)</option>
              <option value="NEAREST_0_50">تقريب لأقرب نصف ريال (0.50)</option>
              <option value="NEAREST_1_00">تقريب لأقرب ريال كامل (1.00)</option>
            </select>
          </div>

          <div className="flex flex-col justify-center space-y-2">
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={form.enableDiscounts}
                onChange={(e) => setForm({ ...form, enableDiscounts: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <span className="text-xs font-bold text-white">إتاحة الخصم على الفواتير ونقاط البيع</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={form.autoPostJournalEntries}
                onChange={(e) => setForm({ ...form, autoPostJournalEntries: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <span className="text-xs font-bold text-white">الترحيل التلقائي الفوري لقيود اليومية</span>
            </label>
          </div>
        </div>
      </div>

      {/* 4. Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
        <button
          type="button"
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>استعادة ربط الحسابات الافتراضي</span>
        </button>

        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-600/20 cursor-pointer transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>حفظ إعدادات المحاسبة</span>
        </button>
      </div>
    </form>
  );
};
