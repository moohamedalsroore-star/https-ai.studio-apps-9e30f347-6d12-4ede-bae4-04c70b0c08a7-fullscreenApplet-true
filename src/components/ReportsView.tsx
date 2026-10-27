import React, { useState } from 'react';
import {
  BarChart3,
  Scale,
  FileSpreadsheet,
  FileText,
  Printer,
  Calendar,
  Percent,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Download,
  Coins,
  Users,
  Building2,
  DollarSign,
  ArrowRightLeft,
  ChevronDown,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import {
  generateAccountLedger,
  generateBalanceSheet,
  generateIncomeStatement,
  generateTrialBalance,
  generateVatReport,
} from '../utils/accountingEngine';
import { tafqeet } from '../utils/tafqeet';

export const ReportsView: React.FC = () => {
  const { accounts, journalEntries, invoices, settings, currencies, contacts } = useAccounting();

  const [activeReport, setActiveReport] = useState<
    'INCOME_STATEMENT' | 'BALANCE_SHEET' | 'TRIAL_BALANCE' | 'ACCOUNT_LEDGER' | 'DEBTS_BOOK' | 'FX_VALUATION' | 'VAT_RETURN'
  >('INCOME_STATEMENT');

  const [selectedAccountId, setSelectedAccountId] = useState<string>('acc-1101');
  const [reportCurrency, setReportCurrency] = useState<string>(settings.baseCurrency);

  // Multi-Currency Converter
  const targetCurrency = currencies.find((c) => c.code === reportCurrency) || {
    code: settings.baseCurrency,
    name: 'الريال السعودي',
    rate: 1.0,
    symbol: 'ر.س',
    isBase: true,
  };

  const rateToBase = targetCurrency.rate || 1.0;
  // If base currency, factor = 1. If foreign currency with rate X base units per 1 foreign unit:
  // e.g. 1 USD = 3.75 SAR -> amountBase / 3.75 = amountUSD
  const convertVal = (amountBase: number): number => {
    if (targetCurrency.isBase || rateToBase <= 0) return amountBase;
    return amountBase / rateToBase;
  };

  const fmt = (amountBase: number): string => {
    const val = convertVal(amountBase);
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Generate real-time reports
  const trialBalance = generateTrialBalance(accounts, journalEntries);
  const incomeStatement = generateIncomeStatement(accounts);
  const balanceSheet = generateBalanceSheet(accounts, incomeStatement.netProfit);
  const vatReport = generateVatReport(invoices);
  const accountLedger = generateAccountLedger(selectedAccountId, accounts, journalEntries);

  // FX Gain / Loss Accounts
  const fxGainAcc = accounts.find((a) => a.code === '4104');
  const fxLossAcc = accounts.find((a) => a.code === '5207');
  const netFxProfit = (fxGainAcc?.balance || 0) - (fxLossAcc?.balance || 0);

  // Customers & Suppliers Debts Book (Smart Accountant)
  const customersWithDebt = contacts
    .filter((c) => c.type === 'CUSTOMER')
    .sort((a, b) => (b.balance || 0) - (a.balance || 0));

  const suppliersWithDebt = contacts
    .filter((c) => c.type === 'SUPPLIER')
    .sort((a, b) => (b.balance || 0) - (a.balance || 0));

  const totalCustomerDebt = customersWithDebt.reduce((sum, c) => sum + (c.balance || 0), 0);
  const totalSupplierDebt = suppliersWithDebt.reduce((sum, c) => sum + (c.balance || 0), 0);

  const reportTabs = [
    { id: 'INCOME_STATEMENT', label: 'قائمة الدخل والأرباح', icon: TrendingUp },
    { id: 'BALANCE_SHEET', label: 'الميزانية العمومية', icon: Scale },
    { id: 'TRIAL_BALANCE', label: 'ميزان المراجعة', icon: FileSpreadsheet },
    { id: 'ACCOUNT_LEDGER', label: 'كشف الأستاذ العام', icon: FileText },
    { id: 'DEBTS_BOOK', label: 'دفتر الديون والذمم', icon: Users, badge: customersWithDebt.filter(c => c.balance > 0).length || undefined },
    { id: 'FX_VALUATION', label: 'تقييم العملات الأجنبية (FX)', icon: Coins },
    { id: 'VAT_RETURN', label: 'إقرار ضريبة القيمة المضافة', icon: Percent },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Print Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-emerald-400" />
            التقارير والقوائم المالية الذكية
          </h2>
          <p className="text-sm text-slate-400">
            توليد لحظي متوازن للقوائم المالية، دفتر الديون والذمم، وتعدد العملات وفقاً للمعايير المحاسبية الدولية
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-emerald-400 font-bold hidden md:inline">💡 لحفظ التقرير بصيغة PDF: اختر "حفظ بتنسيق PDF"</span>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4 text-white" />
            طباعة / تصدير PDF للتقرير
          </button>
        </div>
      </div>

      {/* Multi-Currency View Selector Bar (no-print) */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-lg no-print">
        <div className="flex items-center gap-2.5">
          <Coins className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold text-slate-300">عرض أرقام القوائم والتقارير المالية بعملة:</span>
          <select
            value={reportCurrency}
            onChange={(e) => setReportCurrency(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none cursor-pointer"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} - {c.name} {c.isBase ? '(الأساسية)' : `(1 ${c.code} = ${c.rate} ${settings.baseCurrency})`}
              </option>
            ))}
          </select>
        </div>

        {!targetCurrency.isBase && (
          <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl font-mono-num flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>
              تم تحويل أرقام القوائم آلياً بسعر الصرف الحالي: 1 {reportCurrency} = {rateToBase.toFixed(4)} {settings.baseCurrency}
            </span>
          </div>
        )}
      </div>

      {/* Report Tabs (no-print) */}
      <div className="flex border-b border-slate-800 overflow-x-auto space-x-reverse space-x-2 scrollbar-none no-print">
        {reportTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* REPORT 1: INCOME STATEMENT (قائمة الدخل) */}
      {activeReport === 'INCOME_STATEMENT' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 printable-card">
          {/* Printable Report Header */}
          <div className="text-center border-b border-slate-800 pb-5">
            <h3 className="text-xl font-black text-white">{settings.companyName}</h3>
            <h4 className="text-lg font-bold text-emerald-400 mt-1">قائمة الدخل والأرباح والخسائر (Income Statement)</h4>
            <div className="text-xs text-slate-400 font-mono-num mt-1">
              للسنة المالية المنتهية في 31 ديسمبر {settings.fiscalYear} | العملة: {reportCurrency}{' '}
              {!targetCurrency.isBase && `(معادل بسعر صرف 1 ${reportCurrency} = ${rateToBase} ${settings.baseCurrency})`}
            </div>
          </div>

          <div className="space-y-6 text-sm">
            {/* 1. Revenues Section */}
            <div>
              <div className="p-3 bg-emerald-950/20 border-r-4 border-emerald-500 font-bold text-emerald-400 text-sm flex justify-between items-center">
                <span>أولاً: الإيرادات التشغيلية والمبيعات (Revenues)</span>
                <span className="font-mono-num font-bold">{fmt(incomeStatement.totalRevenue)} {reportCurrency}</span>
              </div>
              <div className="divide-y divide-slate-800/80 px-4 py-2 font-mono-num text-xs">
                {incomeStatement.revenues.map((r) => (
                  <div key={r.code} className="py-2 flex justify-between">
                    <span className="font-sans text-slate-300">{r.name}</span>
                    <span className="text-white font-bold">{fmt(r.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. COGS (تكلفة المبيعات) */}
            <div>
              <div className="p-3 bg-slate-800/60 border-r-4 border-cyan-500 font-bold text-cyan-300 text-sm flex justify-between items-center">
                <span>يخصم: تكلفة البضاعة المباعة (Cost of Goods Sold - COGS)</span>
                <span className="font-mono-num text-red-400 font-bold">({fmt(incomeStatement.cogs)}) {reportCurrency}</span>
              </div>
            </div>

            {/* 3. Gross Profit (مجمل الربح) */}
            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 flex justify-between items-center text-base font-black">
              <span className="text-white">إجمالي مجمل الربح التشغيلي (Gross Profit):</span>
              <span className={`font-mono-num text-lg ${incomeStatement.grossProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {fmt(incomeStatement.grossProfit)} {reportCurrency}
              </span>
            </div>

            {/* 4. Operating Expenses (المصروفات التشغيلية) */}
            <div>
              <div className="p-3 bg-slate-800/40 border-r-4 border-amber-500 font-bold text-amber-300 text-sm flex justify-between items-center">
                <span>يخصم: المصروفات العمومية والإدارية والتشغيلية (Expenses)</span>
                <span className="font-mono-num text-red-400 font-bold">({fmt(incomeStatement.totalOperatingExpenses)}) {reportCurrency}</span>
              </div>
              <div className="divide-y divide-slate-800/80 px-4 py-2 font-mono-num text-xs">
                {incomeStatement.operatingExpensesList.map((e) => (
                  <div key={e.code} className="py-2 flex justify-between">
                    <span className="font-sans text-slate-300">{e.name}</span>
                    <span className="text-slate-200">{fmt(e.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Net Profit (صافي الربح أو الخسارة) */}
            <div className={`p-6 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl ${
              incomeStatement.netProfit >= 0
                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                : 'bg-red-950/40 border-red-500 text-red-300'
            }`}>
              <div>
                <span className="text-xs uppercase font-bold text-slate-400">النتيجة المالية النهائية للفترة</span>
                <h4 className="text-2xl font-black text-white mt-1">
                  {incomeStatement.netProfit >= 0 ? 'صافي الربح للفترة (Net Profit)' : 'صافي الخسارة للفترة (Net Loss)'}
                </h4>
                <div className="text-xs mt-1 text-slate-300 italic">
                  {tafqeet(convertVal(incomeStatement.netProfit), targetCurrency.name, targetCurrency.isBase ? 'هللة' : 'سنت')}
                </div>
              </div>
              <div className="font-mono-num text-3xl font-black text-white">
                {fmt(incomeStatement.netProfit)}{' '}
                <span className="text-sm font-normal text-emerald-400">{reportCurrency}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: BALANCE SHEET (الميزانية العمومية) */}
      {activeReport === 'BALANCE_SHEET' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 printable-card">
          <div className="text-center border-b border-slate-800 pb-5">
            <h3 className="text-xl font-black text-white">{settings.companyName}</h3>
            <h4 className="text-lg font-bold text-cyan-400 mt-1">الميزانية العمومية وقائمة المركز المالي (Balance Sheet)</h4>
            <div className="text-xs text-slate-400 font-mono-num mt-1">
              كما في 31 ديسمبر {settings.fiscalYear} | العملة: {reportCurrency} | الأصول = الخصوم + حقوق الملكية
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            {/* Assets Side (الأصول) */}
            <div className="space-y-4">
              <div className="p-3 bg-emerald-950/30 border-r-4 border-emerald-500 font-bold text-emerald-400 text-sm flex justify-between">
                <span>الأصول (Assets)</span>
                <span className="font-mono-num">{fmt(balanceSheet.totalAssets)} {reportCurrency}</span>
              </div>

              {/* Current Assets */}
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 space-y-2">
                <div className="font-bold text-slate-200 border-b border-slate-700 pb-1.5 flex justify-between">
                  <span>الأصول المتداولة:</span>
                  <span className="font-mono-num text-emerald-400">{fmt(balanceSheet.totalCurrentAssets)}</span>
                </div>
                {balanceSheet.currentAssets.map((a) => (
                  <div key={a.code} className="flex justify-between font-mono-num py-1">
                    <span className="font-sans text-slate-300">{a.name}</span>
                    <span className="text-white">{fmt(a.balance)}</span>
                  </div>
                ))}
              </div>

              {/* Fixed Assets */}
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 space-y-2">
                <div className="font-bold text-slate-200 border-b border-slate-700 pb-1.5 flex justify-between">
                  <span>الأصول الثابتة (غير المتداولة):</span>
                  <span className="font-mono-num text-emerald-400">{fmt(balanceSheet.totalFixedAssets)}</span>
                </div>
                {balanceSheet.fixedAssets.map((a) => (
                  <div key={a.code} className="flex justify-between font-mono-num py-1">
                    <span className="font-sans text-slate-300">{a.name}</span>
                    <span className="text-white">{fmt(a.balance)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Liabilities & Equity Side (الخصوم وحقوق الملكية) */}
            <div className="space-y-4">
              <div className="p-3 bg-cyan-950/30 border-r-4 border-cyan-500 font-bold text-cyan-400 text-sm flex justify-between">
                <span>الالتزامات وحقوق الملكية (Liabilities & Equity)</span>
                <span className="font-mono-num">{fmt(balanceSheet.totalLiabilitiesAndEquity)} {reportCurrency}</span>
              </div>

              {/* Liabilities */}
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 space-y-2">
                <div className="font-bold text-slate-200 border-b border-slate-700 pb-1.5 flex justify-between">
                  <span>الالتزامات والخصوم المتداولة:</span>
                  <span className="font-mono-num text-cyan-400">{fmt(balanceSheet.totalLiabilities)}</span>
                </div>
                {balanceSheet.liabilities.map((l) => (
                  <div key={l.code} className="flex justify-between font-mono-num py-1">
                    <span className="font-sans text-slate-300">{l.name}</span>
                    <span className="text-white">{fmt(l.balance)}</span>
                  </div>
                ))}
              </div>

              {/* Equity */}
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 space-y-2">
                <div className="font-bold text-slate-200 border-b border-slate-700 pb-1.5 flex justify-between">
                  <span>حقوق الملكية ورأس المال:</span>
                  <span className="font-mono-num text-cyan-400">{fmt(balanceSheet.totalEquity)}</span>
                </div>
                {balanceSheet.equity.map((eq) => (
                  <div key={eq.code} className="flex justify-between font-mono-num py-1">
                    <span className="font-sans text-slate-300">{eq.name}</span>
                    <span className="text-white">{fmt(eq.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-mono-num py-1 text-emerald-400 font-bold border-t border-slate-700/60 pt-1.5">
                  <span className="font-sans">صافي ربح الفترة الحالية (من قائمة الدخل):</span>
                  <span>{fmt(incomeStatement.netProfit)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Balance Check Indicator */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold ${
            balanceSheet.isBalanced
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400'
              : 'bg-red-950/30 border-red-500/40 text-red-400'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>المعادلة المحاسبية متطابقة تماماً: الأصول ({fmt(balanceSheet.totalAssets)}) = الخصوم وحقوق الملكية ({fmt(balanceSheet.totalLiabilitiesAndEquity)})</span>
            </div>
            <span className="font-mono-num">الفارق: {fmt(balanceSheet.difference)} {reportCurrency}</span>
          </div>
        </div>
      )}

      {/* REPORT 3: TRIAL BALANCE (ميزان المراجعة) */}
      {activeReport === 'TRIAL_BALANCE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 printable-card">
          <div className="text-center border-b border-slate-800 pb-5">
            <h3 className="text-xl font-black text-white">{settings.companyName}</h3>
            <h4 className="text-lg font-bold text-purple-400 mt-1">ميزان المراجعة بالمجاميع والأرصدة (Trial Balance)</h4>
            <div className="text-xs text-slate-400 font-mono-num mt-1">
              السنة المالية {settings.fiscalYear} | العملة: {reportCurrency} | مطابقة إجمالي المدين والدائن
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-800 text-slate-300 font-bold uppercase">
                <tr>
                  <th className="py-3 px-3">كود الحساب</th>
                  <th className="py-3 px-3">اسم الحساب</th>
                  <th className="py-3 px-3 text-center">التصنيف</th>
                  <th className="py-3 px-3 text-center">مجموع المدين</th>
                  <th className="py-3 px-3 text-center">مجموع الدائن</th>
                  <th className="py-3 px-3 text-center font-bold text-emerald-400">رصيد ختامي مدين</th>
                  <th className="py-3 px-3 text-center font-bold text-cyan-400">رصيد ختامي دائن</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono-num">
                {trialBalance.rows.map((r) => (
                  <tr key={r.accountCode} className="hover:bg-slate-800/30">
                    <td className="py-2 px-3 text-emerald-400 font-bold">{r.accountCode}</td>
                    <td className="py-2 px-3 font-sans font-semibold text-white">{r.accountName}</td>
                    <td className="py-2 px-3 text-center font-sans text-slate-400">{r.category}</td>
                    <td className="py-2 px-3 text-center">{r.totalDebit > 0 ? fmt(r.totalDebit) : '-'}</td>
                    <td className="py-2 px-3 text-center">{r.totalCredit > 0 ? fmt(r.totalCredit) : '-'}</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-400">
                      {r.endingDebit > 0 ? fmt(r.endingDebit) : '-'}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-cyan-400">
                      {r.endingCredit > 0 ? fmt(r.endingCredit) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-950 font-mono-num font-extrabold text-xs border-t-2 border-slate-700">
                <tr>
                  <td colSpan={3} className="py-3 px-3 font-sans text-white text-left font-bold">
                    المجاميع الإجمالية المتوازنة ({reportCurrency}):
                  </td>
                  <td className="py-3 px-3 text-center text-slate-300">
                    {fmt(trialBalance.totals.totalDebit)}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-300">
                    {fmt(trialBalance.totals.totalCredit)}
                  </td>
                  <td className="py-3 px-3 text-center text-emerald-400 text-sm">
                    {fmt(trialBalance.totals.endingDebit)}
                  </td>
                  <td className="py-3 px-3 text-center text-cyan-400 text-sm">
                    {fmt(trialBalance.totals.endingCredit)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 4: ACCOUNT LEDGER (كشف حساب تفصيلي) */}
      {activeReport === 'ACCOUNT_LEDGER' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 printable-card">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5 no-print">
            <div>
              <h3 className="text-xl font-black text-white">{settings.companyName}</h3>
              <h4 className="text-lg font-bold text-emerald-400 mt-1">كشف حساب تفصيلي (General Ledger Statement)</h4>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-300">اختر الحساب المالي:</label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} - {a.nameAr} ({a.balance.toFixed(2)} {settings.baseCurrency})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {accountLedger.account && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-wrap items-center justify-between gap-4 text-xs font-mono-num">
                <div>
                  <span className="text-slate-400 font-sans">كود الحساب: </span>
                  <span className="font-bold text-emerald-400 text-sm">{accountLedger.account.code}</span>
                  <span className="text-slate-400 font-sans mr-3">اسم الحساب: </span>
                  <span className="font-bold text-white text-sm font-sans">{accountLedger.account.nameAr}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans">الرصيد النهائي: </span>
                  <span className="font-bold text-emerald-400 text-base">
                    {fmt(accountLedger.finalBalance)} {reportCurrency}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-800 text-slate-300 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">التاريخ</th>
                      <th className="py-2.5 px-3">رقم القيد / المرجع</th>
                      <th className="py-2.5 px-3">البيان والشرح</th>
                      <th className="py-2.5 px-3 text-center">مدين</th>
                      <th className="py-2.5 px-3 text-center">دائن</th>
                      <th className="py-2.5 px-3 text-center font-bold text-emerald-400">الرصيد المتحرك ({reportCurrency})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono-num">
                    {accountLedger.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 text-slate-400">{row.date}</td>
                        <td className="py-2 px-3 text-emerald-400 font-bold">{row.entryNumber}</td>
                        <td className="py-2 px-3 font-sans text-slate-200">{row.description}</td>
                        <td className="py-2 px-3 text-center">{row.debit > 0 ? fmt(row.debit) : '-'}</td>
                        <td className="py-2 px-3 text-center">{row.credit > 0 ? fmt(row.credit) : '-'}</td>
                        <td className="py-2 px-3 text-center font-bold text-white">{fmt(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REPORT 5: SMART DEBTS BOOK (دفتر الديون والذمم وكشوفات العملاء) */}
      {activeReport === 'DEBTS_BOOK' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 printable-card">
          <div className="text-center border-b border-slate-800 pb-5">
            <h3 className="text-xl font-black text-white">{settings.companyName}</h3>
            <h4 className="text-lg font-bold text-amber-400 mt-1">دفتر الديون والذمم وأعمار ديون العملاء والموردين</h4>
            <div className="text-xs text-slate-400 font-mono-num mt-1">
              متابعة المستحقات والمديونيات وحالة السداد | العملة: {reportCurrency}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-400 block font-bold">إجمالي ديون العملاء لنا (ذمم مدينة)</span>
                <span className="text-2xl font-black font-mono-num text-amber-400 mt-1 block">
                  {fmt(totalCustomerDebt)} {reportCurrency}
                </span>
                <span className="text-[11px] text-slate-500">
                  عدد العملاء المدينين: {customersWithDebt.filter(c => c.balance > 0).length}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold text-lg">
                ع
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-400 block font-bold">إجمالي مستحقات الموردين علينا (ذمم دائنة)</span>
                <span className="text-2xl font-black font-mono-num text-cyan-400 mt-1 block">
                  {fmt(totalSupplierDebt)} {reportCurrency}
                </span>
                <span className="text-[11px] text-slate-500">
                  عدد الموردين المستحقين: {suppliersWithDebt.filter(c => c.balance > 0).length}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold text-lg">
                م
              </div>
            </div>
          </div>

          {/* Customers Debt Table */}
          <div className="space-y-2">
            <h5 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              كشف ديون العملاء التفصيلي
            </h5>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-800 text-slate-300 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">كود العميل</th>
                    <th className="py-2.5 px-3">اسم العميل / المؤسسة</th>
                    <th className="py-2.5 px-3">رقم الهاتف</th>
                    <th className="py-2.5 px-3 text-center">الحد الائتماني</th>
                    <th className="py-2.5 px-3 text-center font-bold text-amber-400">الرصيد المدين المتبقي</th>
                    <th className="py-2.5 px-3 text-center">حالة المديونية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono-num">
                  {customersWithDebt.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                        لا يوجد عملاء مسجلين حالياً
                      </td>
                    </tr>
                  ) : (
                    customersWithDebt.map((c) => {
                      const hasDebt = c.balance > 0;
                      const isOverLimit = c.creditLimit && c.balance > c.creditLimit;
                      return (
                        <tr key={c.id} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 text-slate-400">{c.code}</td>
                          <td className="py-2.5 px-3 font-sans font-semibold text-white">{c.name}</td>
                          <td className="py-2.5 px-3 text-slate-400">{c.phone || '-'}</td>
                          <td className="py-2.5 px-3 text-center text-slate-400">
                            {c.creditLimit ? `${fmt(c.creditLimit)} ${reportCurrency}` : 'غير محدد'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-amber-400 text-sm">
                            {fmt(c.balance)} {reportCurrency}
                          </td>
                          <td className="py-2.5 px-3 text-center font-sans">
                            {isOverLimit ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                                تجاوز الحد الائتماني!
                              </span>
                            ) : hasDebt ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                ذمة مستحقة
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                                خالص الرصيد (0)
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 6: FX VALUATION (تقييم العملات الأجنبية وفروق الصرف) */}
      {activeReport === 'FX_VALUATION' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 printable-card">
          <div className="text-center border-b border-slate-800 pb-5">
            <h3 className="text-xl font-black text-white">{settings.companyName}</h3>
            <h4 className="text-lg font-bold text-purple-400 mt-1">تقرير تقييم العملات الأجنبية وأرباح وخسائر فروق أسعار الصرف</h4>
            <div className="text-xs text-slate-400 font-mono-num mt-1">
              وفقاً لمعيار المحاسبة الدولي (IAS 21) | العملة الأساسية للنظام: {settings.baseCurrency}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
              <span className="text-xs text-slate-400 block font-bold">أرباح فروق أسعار الصرف (حساب 4104)</span>
              <span className="text-2xl font-black font-mono-num text-emerald-400 mt-1 block">
                +{(fxGainAcc?.balance || 0).toFixed(2)} {settings.baseCurrency}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30">
              <span className="text-xs text-slate-400 block font-bold">خسائر فروق أسعار الصرف (حساب 5207)</span>
              <span className="text-2xl font-black font-mono-num text-red-400 mt-1 block">
                -{(fxLossAcc?.balance || 0).toFixed(2)} {settings.baseCurrency}
              </span>
            </div>

            <div className={`p-4 rounded-2xl border ${
              netFxProfit >= 0 ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' : 'bg-red-950/20 border-red-500/40 text-red-300'
            }`}>
              <span className="text-xs text-slate-400 block font-bold">صافي أثر فروق العملة على الأرباح</span>
              <span className="text-2xl font-black font-mono-num mt-1 block">
                {netFxProfit >= 0 ? `+${netFxProfit.toFixed(2)}` : netFxProfit.toFixed(2)} {settings.baseCurrency}
              </span>
            </div>
          </div>

          {/* Currencies Rates & Exposure Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-800 text-slate-300 font-bold">
                <tr>
                  <th className="py-3 px-4">رمز العملة</th>
                  <th className="py-3 px-4">اسم العملة</th>
                  <th className="py-3 px-4 text-center">سعر الصرف الحالي</th>
                  <th className="py-3 px-4 text-center">التغير 24 ساعة</th>
                  <th className="py-3 px-4 text-center">حالة العملة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono-num">
                {currencies.map((c) => (
                  <tr key={c.code} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <span className="text-emerald-400">{c.code}</span>
                      <span className="text-slate-400">({c.symbol})</span>
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-200">{c.name}</td>
                    <td className="py-3 px-4 text-center font-black text-white">
                      {c.isBase ? '1.0000 (الأساس)' : `${c.rate.toFixed(4)} ${settings.baseCurrency}`}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {c.isBase ? (
                        <span className="text-slate-500">-</span>
                      ) : (
                        <span className={`font-bold ${(c.change24h || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {(c.change24h || 0) >= 0 ? `+${c.change24h}%` : `${c.change24h}%`}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      {c.isBase ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                          العملة الأم الرئيسية
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          عملة أجنبية نشطة
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 7: VAT RETURN (إقرار ضريبة القيمة المضافة) */}
      {activeReport === 'VAT_RETURN' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 printable-card">
          <div className="text-center border-b border-slate-800 pb-5">
            <h3 className="text-xl font-black text-white">{settings.companyName}</h3>
            <h4 className="text-lg font-bold text-emerald-400 mt-1">إقرار ضريبة القيمة المضافة 15% (VAT Tax Return)</h4>
            <div className="text-xs text-slate-400 font-mono-num mt-1">
              الرقم الضريبي للمنشأة: {settings.taxNumber} | العملة: {reportCurrency}
            </div>
          </div>

          <div className="space-y-4 text-xs font-mono-num">
            {/* Sales Output Tax */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
              <div className="font-bold text-white font-sans text-sm border-b border-slate-700 pb-2">
                1. ضريبة المبيعات والمخرجات (Output Tax - 15%)
              </div>
              <div className="flex justify-between py-1">
                <span className="font-sans text-slate-300">إجمالي المبيعات الخاضعة للنسبة الأساسية:</span>
                <span className="font-bold text-white">{fmt(vatReport.salesSubtotal)} {reportCurrency}</span>
              </div>
              <div className="flex justify-between py-1 text-emerald-400 font-bold">
                <span className="font-sans">مبلغ ضريبة القيمة المضافة المحصلة (المخرجات):</span>
                <span>+{fmt(vatReport.salesVatOutput)} {reportCurrency}</span>
              </div>
            </div>

            {/* Purchase Input Tax */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
              <div className="font-bold text-white font-sans text-sm border-b border-slate-700 pb-2">
                2. ضريبة المشتريات والمدخلات القابلة للخصم (Input Tax - 15%)
              </div>
              <div className="flex justify-between py-1">
                <span className="font-sans text-slate-300">إجمالي المشتريات الخاضعة للنسبة الأساسية:</span>
                <span className="font-bold text-white">{fmt(vatReport.purchaseSubtotal)} {reportCurrency}</span>
              </div>
              <div className="flex justify-between py-1 text-cyan-400 font-bold">
                <span className="font-sans">مبلغ ضريبة القيمة المضافة المدفوعة (المدخلات):</span>
                <span>-{fmt(vatReport.purchaseVatInput)} {reportCurrency}</span>
              </div>
            </div>

            {/* Net Tax Result */}
            <div className={`p-6 rounded-2xl border-2 flex items-center justify-between ${
              vatReport.isPayable
                ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                : 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
            }`}>
              <div>
                <div className="text-xs font-sans font-bold text-slate-400 uppercase">
                  صافي الضريبة الواجبة
                </div>
                <h4 className="text-xl font-bold text-white font-sans mt-1">
                  {vatReport.isPayable
                    ? 'صافي ضريبة مستحقة السداد لهيئة الزكاة والضريبة'
                    : 'صافي رصيد ضريبي دائن مسترد لصالح المؤسسة'}
                </h4>
              </div>
              <div className="text-2xl font-black text-white">
                {fmt(Math.abs(vatReport.netTaxPayable))} {reportCurrency}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
