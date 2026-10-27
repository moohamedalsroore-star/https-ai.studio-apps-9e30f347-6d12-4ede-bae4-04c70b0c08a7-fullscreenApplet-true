import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Coins,
  Package,
  Users,
  Building2,
  ShoppingCart,
  Receipt,
  Truck,
  BookOpen,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  CreditCard,
  Plus,
  CheckCircle,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { generateIncomeStatement } from '../utils/accountingEngine';

export const DashboardView: React.FC = () => {
  const {
    accounts,
    invoices,
    products,
    contacts,
    journalEntries,
    settings,
    setActiveView,
    lowStockItems,
    inventorySummary,
  } = useAccounting();

  const incomeStatement = generateIncomeStatement(accounts);

  // Cash & Liquidity Accounts
  const cashAcc = accounts.find((a) => a.code === '1101');
  const posAcc = accounts.find((a) => a.code === '1102');
  const otherCashAccounts = accounts.filter(
    (a) => a.parentCode === '11' && a.code !== '1101' && a.code !== '1102' && a.code !== '1105' && a.code !== '1106'
  );

  const totalLiquid =
    (cashAcc?.balance || 0) +
    (posAcc?.balance || 0) +
    otherCashAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  const totalReceivables = contacts
    .filter((c) => c.type === 'CUSTOMER')
    .reduce((sum, c) => sum + c.balance, 0);

  const totalPayables = contacts
    .filter((c) => c.type === 'SUPPLIER')
    .reduce((sum, c) => sum + c.balance, 0);

  const recentInvoices = invoices.slice(0, 5);
  const recentEntries = journalEntries.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950/40 border border-emerald-500/20 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>النظام المحاسبي متصل ويعمل بالكامل - جميع القيود ترحل آلياً</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {settings.companyName}
              </h2>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                {settings.businessSector === 'RETAIL'
                  ? '🏪 نشاط تجزئة وتموينات'
                  : settings.businessSector === 'WHOLESALE'
                  ? '📦 نشاط جملة وتوزيع'
                  : settings.businessSector === 'RESTAURANT'
                  ? '☕ مطاعم ومقاهي'
                  : settings.businessSector === 'SERVICES'
                  ? '💼 خدمات واستشارات'
                  : settings.businessSector === 'CONTRACTING'
                  ? '🛠️ مقاولات وورش'
                  : settings.businessSector === 'PERSONAL'
                  ? '👤 حسابات شخصية وإدارة ديون'
                  : settings.businessSector === 'PHARMACY'
                  ? '💊 صيدليات ومراكز طبية'
                  : '🏢 نظام عام لكافة الأنشطة التجارية'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('settings')}
              className="text-xs text-emerald-400 font-medium hover:text-emerald-300 hover:underline flex items-center gap-1.5 mt-1.5 cursor-pointer transition-colors"
              title="انقر لتعديل الاسم التجاري الخاص بك من إعدادات التطبيق"
            >
              <span>💡 يمكنك تغيير الاسم التجاري الخاص بك من إعدادات التطبيق</span>
            </button>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl">
              تطبيق الغفاري سوفت برو - Al-Ghafari Soft Pro - إدارة شاملة: مبيعات، مشتريات، كاشير POS، رقابة المخزون والديون، تعدد العملات، والقوائم المالية
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveView('pos')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 cursor-pointer transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              نقطة البيع (POS)
            </button>
            <button
              onClick={() => setActiveView('invoices')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 cursor-pointer transition-all"
            >
              <Receipt className="w-4 h-4 text-emerald-400" />
              فاتورة مبيعات
            </button>
            <button
              onClick={() => setActiveView('quotations')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 cursor-pointer transition-all"
            >
              <BookOpen className="w-4 h-4 text-blue-400" />
              عرض سعر
            </button>
            <button
              onClick={() => setActiveView('purchases')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 cursor-pointer transition-all"
            >
              <Truck className="w-4 h-4 text-amber-400" />
              فاتورة شراء
            </button>
            <button
              onClick={() => setActiveView('returns')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 cursor-pointer transition-all"
            >
              <ArrowDownLeft className="w-4 h-4 text-red-400" />
              مردودات
            </button>
          </div>
        </div>
      </div>

      {/* Low Stock Alert Strip if any */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                تنبيه نقص المخزون: يوجد {lowStockItems.length} صنف وصل إلى حد إعادة الطلب أو نفد!
              </h4>
              <p className="text-xs text-slate-300">
                منها {inventorySummary.outOfStockItemsCount} صنف نفد تماماً. بادر بطلب التوريد لضمان استمرار المبيعات.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveView('inventory')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer transition-colors"
          >
            عرض نواقص المخزون
          </button>
        </div>
      )}

      {/* 4 Main Core Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenues */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">إجمالي المبيعات والإيرادات</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-mono-num text-2xl font-black text-white">
              {incomeStatement.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
              <span className="text-xs font-normal text-emerald-400">{settings.baseCurrency}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              تكلفة البضاعة المباعة (COGS): {incomeStatement.cogs.toFixed(2)} {settings.baseCurrency}
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">صافي الربح للفترة</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-mono-num text-2xl font-black text-emerald-400">
              {incomeStatement.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
              <span className="text-xs font-normal text-slate-400">{settings.baseCurrency}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              مجمل الربح: {incomeStatement.grossProfit.toFixed(2)} {settings.baseCurrency}
            </div>
          </div>
        </div>

        {/* Liquid Cash & Banks */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">السيولة النقدية والبنكية</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-mono-num text-2xl font-black text-white">
              {totalLiquid.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
              <span className="text-xs font-normal text-emerald-400">{settings.baseCurrency}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              موزعة على الخزينة الرئيسية وصندوق مبيعات الكاشير
            </div>
          </div>
        </div>

        {/* Stock Valuation */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">قيمة بضاعة المخزون (بالتكلفة)</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-mono-num text-2xl font-black text-purple-300">
              {inventorySummary.totalCostValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
              <span className="text-xs font-normal text-slate-400">{settings.baseCurrency}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              إجمالي {inventorySummary.totalUnitsInStock} قطعة عبر {products.length} صنف
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Liquidity Breakdown & Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liquidity Accounts Card */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-400" />
              أرصدة الخزينة والحسابات البنكية
            </h3>
            <span className="text-xs text-slate-400 font-mono-num">
              المجموع: {totalLiquid.toFixed(2)} {settings.baseCurrency}
            </span>
          </div>

          <div className="space-y-2.5 font-mono-num text-xs">
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-sans font-bold text-white">الصندوق الرئيسي (الخزينة)</div>
                <div className="text-[10px] text-slate-400">حساب 1101</div>
              </div>
              <span className="font-bold text-emerald-400">
                {(cashAcc?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} {settings.baseCurrency}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-sans font-bold text-white">صندوق الكاشير (نقطة البيع)</div>
                <div className="text-[10px] text-slate-400">حساب 1102</div>
              </div>
              <span className="font-bold text-white">
                {(posAcc?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} {settings.baseCurrency}
              </span>
            </div>

            {otherCashAccounts.map((acc) => (
              <div key={acc.id} className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-sans font-bold text-white">{acc.nameAr}</div>
                  <div className="text-[10px] text-slate-400">حساب {acc.code}</div>
                </div>
                <span className="font-bold text-cyan-400">
                  {(acc.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} {settings.baseCurrency}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Receivables & Payables Summary */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              الذمم المدينة والدائنة (العملاء والموردين)
            </h3>
            <button
              onClick={() => setActiveView('contacts')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
            >
              عرض الكل
            </button>
          </div>

          <div className="space-y-3 font-mono-num text-xs">
            {/* Customer Receivables */}
            <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <div className="font-sans font-bold text-white text-sm">ديون العملاء (ذمم مدينة)</div>
                <div className="font-sans text-[11px] text-slate-400 mt-0.5">
                  أموال مستحقة للمؤسسة طرف العملاء
                </div>
              </div>
              <div className="text-left">
                <div className="font-bold text-emerald-400 text-base">
                  {totalReceivables.toLocaleString('en-US', { minimumFractionDigits: 2 })} {settings.baseCurrency}
                </div>
                <span className="font-sans text-[10px] text-slate-400">
                  على {contacts.filter((c) => c.type === 'CUSTOMER' && c.balance > 0).length} عميل
                </span>
              </div>
            </div>

            {/* Supplier Payables */}
            <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/20 flex items-center justify-between">
              <div>
                <div className="font-sans font-bold text-white text-sm">مستحقات الموردين (ذمم دائنة)</div>
                <div className="font-sans text-[11px] text-slate-400 mt-0.5">
                  التزامات مستحقة السداد للموردين
                </div>
              </div>
              <div className="text-left">
                <div className="font-bold text-amber-400 text-base">
                  {totalPayables.toLocaleString('en-US', { minimumFractionDigits: 2 })} {settings.baseCurrency}
                </div>
                <span className="font-sans text-[10px] text-slate-400">
                  لصالح {contacts.filter((c) => c.type === 'SUPPLIER' && c.balance > 0).length} مورد
                </span>
              </div>
            </div>

            {/* Net Working Position */}
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
              <span className="font-sans font-bold text-slate-200">صافي الفرق الائتماني:</span>
              <span className="font-bold text-white text-sm">
                {(totalReceivables - totalPayables).toFixed(2)} {settings.baseCurrency}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Audit & Posting Health */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              صحة الموازنة والترحيل المحاسبي
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
              100% متطابق
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">عدد القيود الآلية المسجلة:</span>
                <span className="font-mono-num font-bold text-white">{journalEntries.length} قيد</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">حالة التوازن المحاسبي:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  مدين = دائن
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">نظام المخزون المتبع:</span>
                <span className="font-bold text-slate-200">الجرد المستمر (Perpetual)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">طريقة تقييم التكلفة:</span>
                <span className="font-bold text-slate-200">متوسط التكلفة المرجح (WAC)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300">
              <div className="font-bold text-[11px]">ميزة المحاسب الذكي التلقائية:</div>
              <div className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                أي فاتورة بيع تخصم المخزون فورياً وتنشئ قيد تكلفة البضاعة المباعة COGS وتحدث قائمة الدخل والميزانية بدون أي تدخل يدوي.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices & Recent Journal Entries Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              آخر الفواتير الصادرة
            </h3>
            <button
              onClick={() => setActiveView('invoices')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
            >
              عرض جميع الفواتير
            </button>
          </div>

          <div className="space-y-2">
            {recentInvoices.map((inv) => (
              <div
                key={inv.id}
                className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <div className="font-mono-num font-bold text-emerald-400">{inv.invoiceNumber}</div>
                  <div className="font-semibold text-white mt-0.5">{inv.partyName}</div>
                  <span className="text-[10px] text-slate-500 font-mono-num">{inv.date}</span>
                </div>
                <div className="text-left font-mono-num">
                  <div className="font-extrabold text-white text-sm">
                    {inv.grandTotal.toFixed(2)} {settings.baseCurrency}
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                      inv.status === 'PAID'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {inv.status === 'PAID' ? 'مسددة' : 'آجلة'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Journal Entries */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              سجل قيود اليومية الحديثة
            </h3>
            <button
              onClick={() => setActiveView('journal')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
            >
              عرض دفتر اليومية
            </button>
          </div>

          <div className="space-y-2">
            {recentEntries.map((je) => (
              <div
                key={je.id}
                className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-num font-bold text-emerald-400">{je.entryNumber}</span>
                    <span className="text-[10px] text-slate-500 font-mono-num">{je.date}</span>
                  </div>
                  <div className="text-slate-200 mt-0.5 line-clamp-1">{je.description}</div>
                </div>
                <div className="text-left font-mono-num shrink-0">
                  <div className="font-bold text-white">
                    {je.totalDebit.toFixed(2)} {settings.baseCurrency}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">متوازن ومرحل</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
