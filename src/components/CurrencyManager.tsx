import React, { useState } from 'react';
import {
  Coins,
  RefreshCw,
  Plus,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  Scale,
  CheckCircle,
  Calendar,
  DollarSign,
  Sparkles,
  Sliders,
  Calculator,
  Trash2,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { CurrencyConfig } from '../types/accounting';

export const CurrencyManager: React.FC = () => {
  const {
    currencies,
    updateCurrencyRate,
    addCurrency,
    deleteCurrency,
    autoFetchExchangeRates,
    performCurrencyRevaluation,
    settings,
    accounts,
    openDeleteConfirm,
    showToast,
  } = useAccounting();

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  // Currency Converter Calculator State
  const [calcAmount, setCalcAmount] = useState<number>(100);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>(settings.baseCurrency);

  // Add Currency Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCurrForm, setNewCurrForm] = useState({
    code: '',
    name: '',
    symbol: '',
    rate: 1.0,
  });

  // Revaluation Modal
  const [showRevalModal, setShowRevalModal] = useState(false);
  const [revalAccountId, setRevalAccountId] = useState(accounts[0]?.id || '');
  const [revalCurrency, setRevalCurrency] = useState('USD');
  const [revalNewRate, setRevalNewRate] = useState(3.75);
  const [revalVarianceBase, setRevalVarianceBase] = useState(0);

  // Calculator computation
  const fromRate = currencies.find((c) => c.code === fromCurrency)?.rate || 1.0;
  const toRate = currencies.find((c) => c.code === toCurrency)?.rate || 1.0;
  const convertedAmount = toRate > 0 ? (calcAmount * fromRate) / toRate : 0;

  const handleAutoUpdateRates = () => {
    setIsUpdating(true);
    setTimeout(() => {
      autoFetchExchangeRates();
      setIsUpdating(false);
      setUpdateMsg('تم تحديث أسعار الصرف آلياً وفقاً لأحدث متوسطات أسواق الصرف العالمية!');
      setTimeout(() => setUpdateMsg(null), 4000);
    }, 800);
  };

  const handleSaveNewCurrency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCurrForm.code.trim()) return;

    addCurrency({
      code: newCurrForm.code.toUpperCase(),
      name: newCurrForm.name,
      symbol: newCurrForm.symbol || newCurrForm.code,
      rate: Number(newCurrForm.rate) || 1.0,
      isBase: false,
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
      change24h: 0.0,
    });

    setShowAddModal(false);
    setNewCurrForm({ code: '', name: '', symbol: '', rate: 1.0 });
  };

  const handleExecuteRevaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (revalVarianceBase === 0) {
      showToast('لا يوجد فارق تقييم مسجل.', 'info');
      return;
    }

    const acc = accounts.find((a) => a.id === revalAccountId);
    if (!acc) return;

    performCurrencyRevaluation(acc.id, acc.code, acc.nameAr, revalVarianceBase, revalCurrency, revalNewRate);
    setShowRevalModal(false);
    showToast('تم إنشاء وترحيل قيد فروق أسعار الصرف آلياً إلى دفتر الأستاذ العام بنجاح ✓', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Coins className="w-7 h-7 text-emerald-400" />
            إدارة العملات المتعددة وأسعار الصرف (Multi-Currency ERP)
          </h2>
          <p className="text-sm text-slate-400">
            تحديد أسعار الصرف، التحديث التلقائي، ومعالجة أرباح وخسائر فروق العملات في القيود والقوائم المالية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoUpdateRates}
            disabled={isUpdating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 cursor-pointer transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
            تحديث أسعار الصرف آلياً
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            إضافة عملة جديدة
          </button>

          <button
            onClick={() => setShowRevalModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 font-bold text-xs cursor-pointer transition-all"
          >
            <Scale className="w-4 h-4 text-purple-400" />
            قيد تقييم فروق الصرف (FX)
          </button>
        </div>
      </div>

      {updateMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>{updateMsg}</span>
        </div>
      )}

      {/* Quick Converter Widget & Base Currency Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Base Currency Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">العملة المحاسبية الأساسية للنظام</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              العملة الأم (Base Currency)
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-mono-num text-3xl font-black text-white">{settings.baseCurrency}</span>
            <span className="text-xs text-slate-400">
              {currencies.find((c) => c.isBase)?.name || 'ريال سعودي'}
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            جميع القيود المحاسبية، ميزان المراجعة، قائمة الدخل، والميزانية العمومية يتم تحويلها وترحيلها تلقائياً بالعملة الأساسية وفق معيار المحاسبة الدولي (IAS 21).
          </p>
        </div>

        {/* Currency Converter Tool */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Calculator className="w-4 h-4 text-cyan-400" />
              حاسبة تحويل العملات اللحظية (Instant Currency Converter)
            </h3>
            <span className="text-xs text-slate-500 font-mono-num">
              1 {fromCurrency} = {(fromRate / toRate).toFixed(4)} {toCurrency}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">المبلغ المطلوب</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={calcAmount}
                onChange={(e) => setCalcAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white font-mono-num"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">من عملة</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">إلى عملة</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center font-mono-num">
              <span className="text-[10px] text-slate-400 block">المبلغ المعادل:</span>
              <span className="text-base font-black text-emerald-400">
                {convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                <span className="text-xs font-normal">{toCurrency}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Currencies & Exchange Rates Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-800/90 text-slate-300 font-bold text-xs uppercase tracking-wider border-b border-slate-700">
            <tr>
              <th className="py-3 px-4">رمز العملة</th>
              <th className="py-3 px-4">اسم العملة</th>
              <th className="py-3 px-4 text-center">الرمز</th>
              <th className="py-3 px-4 text-center">سعر الصرف الحالي (مقابل {settings.baseCurrency})</th>
              <th className="py-3 px-4 text-center">التغير (24 ساعة)</th>
              <th className="py-3 px-4 text-center">آخر تحديث</th>
              <th className="py-3 px-4 text-center">تعديل سعر الصرف</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {currencies.map((curr) => {
              const isPositive = (curr.change24h || 0) >= 0;
              return (
                <tr key={curr.code} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono-num font-bold text-white flex items-center gap-2">
                    <span className="text-base">{curr.symbol}</span>
                    <span className="text-emerald-400 font-extrabold">{curr.code}</span>
                    {curr.isBase && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        الأساسية
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white">{curr.name}</td>
                  <td className="py-3.5 px-4 text-center font-mono-num text-slate-400">{curr.symbol}</td>
                  <td className="py-3.5 px-4 text-center font-mono-num font-black text-base text-white">
                    {curr.isBase ? (
                      <span className="text-slate-400">1.0000 (الأساس)</span>
                    ) : (
                      <span className="text-emerald-400">{curr.rate.toFixed(4)} {settings.baseCurrency}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono-num text-xs">
                    {curr.isBase ? (
                      <span className="text-slate-500">-</span>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 font-bold ${
                          isPositive ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {isPositive ? `+${curr.change24h}%` : `${curr.change24h}%`}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono-num text-xs text-slate-400">
                    {curr.lastUpdated || 'الآن'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {!curr.isBase && (
                      <div className="flex items-center justify-center gap-1.5">
                        <input
                          type="number"
                          step="0.0001"
                          min="0.0001"
                          defaultValue={curr.rate}
                          onBlur={(e) => {
                            const val = parseFloat(e.target.value);
                            if (val && val > 0) {
                              updateCurrencyRate(curr.code, val);
                            }
                          }}
                          className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-center font-mono-num text-xs text-white"
                        />
                        <button
                          onClick={() => {
                            openDeleteConfirm({
                              title: 'تأكيد حذف العملة الأجنبية',
                              itemName: `العملة: ${curr.code} (${curr.name})`,
                              message: `سعر الصرف الحالي: 1 ${curr.code} = ${curr.rate} ${settings.baseCurrency}. هل أنت متأكد من الحذف؟`,
                              onConfirm: () => deleteCurrency(curr.code),
                            });
                          }}
                          className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:text-red-300 hover:bg-red-900/60 transition-colors cursor-pointer"
                          title="حذف العملة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: ADD NEW CURRENCY */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-400" />
              إضافة عملة أجنبية جديدة
            </h3>

            <form onSubmit={handleSaveNewCurrency} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رمز العملة (ISO Code)</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: QAR, OMR, TRY, CNY"
                  value={newCurrForm.code}
                  onChange={(e) => setNewCurrForm({ ...newCurrForm, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono-num uppercase font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم العملة بالعربية</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ريال قطري"
                  value={newCurrForm.name}
                  onChange={(e) => setNewCurrForm({ ...newCurrForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رمز الاختصار / العلامة</label>
                <input
                  type="text"
                  placeholder="مثال: ر.ق أو ¥"
                  value={newCurrForm.symbol}
                  onChange={(e) => setNewCurrForm({ ...newCurrForm, symbol: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-400 mb-1">
                  سعر الصرف مقابل {settings.baseCurrency} (قيمة 1 وحدة من العملة)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  required
                  value={newCurrForm.rate}
                  onChange={(e) => setNewCurrForm({ ...newCurrForm, rate: parseFloat(e.target.value) || 1.0 })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-bold text-white font-mono-num"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white cursor-pointer shadow"
                >
                  حفظ العملة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FX REVALUATION */}
      {showRevalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl w-full max-w-lg shadow-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Scale className="w-5 h-5 text-purple-400" />
              إثبات وترحيل قيد فروق أسعار الصرف (FX Revaluation)
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              عند تغير أسعار صرف العملات الأجنبية المحتفظ بها في الحسابات البنكية أو الذمم، يمكنك إثبات فارق التقييم آلياً كأرباح فروق صرف (حساب 4104) أو خسائر فروق صرف (حساب 5207).
            </p>

            <form onSubmit={handleExecuteRevaluation} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الحساب المالي المراد تقييمه</label>
                <select
                  value={revalAccountId}
                  onChange={(e) => setRevalAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                >
                  {accounts
                    .filter((a) => a.level >= 2)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code} - {a.nameAr}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">العملة الأجنبية</label>
                  <select
                    value={revalCurrency}
                    onChange={(e) => setRevalCurrency(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    {currencies
                      .filter((c) => !c.isBase)
                      .map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} - {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">سعر الصرف الجديد</label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    value={revalNewRate}
                    onChange={(e) => setRevalNewRate(parseFloat(e.target.value) || 1.0)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white font-mono-num"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-400 mb-1">
                  مبلغ الفارق بالعملة الأساسية ({settings.baseCurrency}) (+ للربح / - للخسارة)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="مثال: +150 للأرباح أو -75 للخسائر"
                  value={revalVarianceBase || ''}
                  onChange={(e) => setRevalVarianceBase(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-bold text-white font-mono-num"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRevalModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white cursor-pointer shadow"
                >
                  ترحيل قيد التقييم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
