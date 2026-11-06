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
  RotateCcw,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { generateIncomeStatement } from '../utils/accountingEngine';
import { CyberLaptopGraphic } from './CyberLaptopGraphic';

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
      {/* Premium Neon Dark Hero Showcase Card (مطابق تماماً للصورة المرجعية) */}
      <div className="neon-border-card">
        <div className="neon-border-card-inner p-5 sm:p-7 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

          {/* Top Status Indicator with Green Neon Checkmark */}
          <div className="flex items-center justify-between gap-3 border-b border-blue-900/50 pb-3.5 mb-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-400/50 shadow-[0_0_14px_rgba(0,217,154,0.4)] text-emerald-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>النظام المحاسبي متصل ويعمل بالكامل - جميع القيود ترحل آلياً</span>
            </div>
            <span className="text-[11px] text-[#AAB8D6] font-mono-num hidden sm:inline">
              PRO Engine v1.0 • متصل وآمن
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Right Column: Title, Badges, Tip, Description, and Action Buttons (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-[#F5F8FF] tracking-tight drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
                  {settings.companyName || 'الغفاري سوفت برو'}
                </h2>
                
                {/* Sector Badge: Emerald Green Pill like reference image */}
                <div className="inline-flex items-center gap-2 mt-2 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-xs shadow-[0_0_16px_rgba(0,217,154,0.5)] border border-emerald-300/80">
                  <Calendar className="w-3.5 h-3.5 text-white" />
                  <span>
                    {settings.businessSector === 'RETAIL'
                      ? 'نشاط تجزئة وتموينات'
                      : settings.businessSector === 'WHOLESALE'
                      ? 'نشاط جملة وتوزيع'
                      : settings.businessSector === 'RESTAURANT'
                      ? 'مطاعم ومقاهي'
                      : settings.businessSector === 'SERVICES'
                      ? 'خدمات واستشارات'
                      : settings.businessSector === 'CONTRACTING'
                      ? 'مقاولات وورش'
                      : settings.businessSector === 'PERSONAL'
                      ? 'حسابات شخصية وإدارة ديون'
                      : settings.businessSector === 'PHARMACY'
                      ? 'صيدليات ومراكز طبية'
                      : 'نظام عام لكافة الانشطة التجارية'}
                  </span>
                </div>
              </div>

              {/* Editable Name Tip (Electric Cyan Glow) */}
              <button
                type="button"
                onClick={() => setActiveView('settings')}
                className="text-xs sm:text-sm font-bold text-[#00C8FF] hover:text-[#5ce1e6] flex items-center gap-1.5 cursor-pointer transition-all drop-shadow-[0_0_8px_rgba(0,200,255,0.5)]"
                title="انقر لتعديل الاسم التجاري الخاص بك من إعدادات التطبيق"
              >
                <span>💡 يمكنك تغيير الاسم التجاري الخاص بك من إعدادات التطبيق</span>
              </button>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#AAB8D6] leading-relaxed max-w-xl">
                تطبيق الغفاري سوفت برو - Al-Ghafari Soft Pro - إدارة شاملة: مبيعات، مشتريات، كاشير POS، رقابة المخزون والديون، تعدد العملات، والقوائم المالية
              </p>

              {/* Neon Quick Action Buttons Grid (Exact reference image styling) */}
              <div className="pt-2 space-y-2.5">
                {/* Row 1: POS (Large Emerald) + Sales Invoice (Electric Blue) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveView('pos')}
                    className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#00D99A] via-[#00C78A] to-[#00A876] hover:from-[#00F0AB] hover:to-[#00BD85] text-white font-black text-sm shadow-[0_0_25px_rgba(0,217,154,0.7)] border-2 border-emerald-200/90 cursor-pointer transition-all active:scale-95 group"
                  >
                    <ShoppingCart className="w-5 h-5 text-white group-hover:scale-110 transition-transform stroke-[2.5]" />
                    <span className="text-base tracking-wide">نقطة البيع (POS)</span>
                  </button>

                  <button
                    onClick={() => setActiveView('invoices')}
                    className="flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#075BFF] via-[#0084FF] to-[#00C8FF] hover:from-[#0066FF] hover:to-[#00E5FF] text-white font-black text-sm shadow-[0_0_22px_rgba(0,200,255,0.6)] border border-cyan-300/80 cursor-pointer transition-all active:scale-95 group"
                  >
                    <Receipt className="w-5 h-5 text-cyan-100 group-hover:scale-110 transition-transform stroke-[2.5]" />
                    <span className="text-base tracking-wide">فاتورة مبيعات</span>
                  </button>
                </div>

                {/* Row 2: Purchases (Purple) + Quotations (Royal Blue) + Returns (Deep Violet) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    onClick={() => setActiveView('purchases')}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#7900FF] via-[#6100E0] to-[#4200A8] hover:from-[#8F1AFF] hover:to-[#5500D4] text-white font-black text-xs sm:text-sm shadow-[0_0_18px_rgba(121,0,255,0.55)] border border-purple-400/60 cursor-pointer transition-all active:scale-95 group"
                  >
                    <Truck className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                    <span>فاتورة شراء</span>
                  </button>

                  <button
                    onClick={() => setActiveView('quotations')}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#075BFF] to-[#0084FF] hover:from-[#1A6BFF] hover:to-[#0099FF] text-white font-black text-xs sm:text-sm shadow-[0_0_18px_rgba(7,91,255,0.55)] border border-cyan-400/60 cursor-pointer transition-all active:scale-95 group"
                  >
                    <BookOpen className="w-4 h-4 text-cyan-200 group-hover:scale-110 transition-transform" />
                    <span>عرض سعر</span>
                  </button>

                  <button
                    onClick={() => setActiveView('returns')}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#4200A8] via-[#7900FF] to-[#A800FF] hover:from-[#5200D4] hover:to-[#C000FF] text-white font-black text-xs sm:text-sm shadow-[0_0_18px_rgba(168,0,255,0.45)] border border-purple-400/50 cursor-pointer transition-all active:scale-95 group"
                  >
                    <ArrowDownLeft className="w-4 h-4 text-rose-300 group-hover:scale-110 transition-transform" />
                    <span>مردودات</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Left Column: 3D Laptop with Charts & Gold Coins Graphic (4 cols) */}
            <div className="lg:col-span-4 flex items-center justify-center">
              <CyberLaptopGraphic className="w-64 sm:w-80 h-64 sm:h-80" />
            </div>
          </div>
        </div>
      </div>

      <div id="dashboard-analytics-content" className="space-y-6 printable-card">
        {/* Printable Executive Report Header (visible on print/preview) */}
        <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 text-black">
          <h2 className="text-2xl font-black">{settings.companyName}</h2>
          <div className="text-xs font-mono-num mt-1">الرقم الضريبي: {settings.taxNumber} | س.ت: {settings.commercialRecord}</div>
          <h3 className="text-lg font-bold mt-2">لوحة المؤشرات والتحليلات المالية والمركز المالي التنفيذي</h3>
          <div className="text-xs text-slate-600 font-mono-num mt-1">
            التاريخ: {new Date().toISOString().split('T')[0]} | العملة الأساسية: {settings.baseCurrency}
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
        <div className="p-5 rounded-3xl bg-[#040C2E]/90 border border-blue-500/25 shadow-xl relative overflow-hidden group hover:border-[#00C8FF]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">إجمالي المبيعات والإيرادات</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-[#00D99A] border border-emerald-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-mono text-2xl font-black text-white">
              {incomeStatement.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
              <span className="text-xs font-normal text-[#00D99A]">{settings.baseCurrency}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              تكلفة البضاعة المباعة (COGS): {incomeStatement.cogs.toFixed(2)} {settings.baseCurrency}
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="p-5 rounded-3xl bg-[#040C2E]/90 border border-blue-500/25 shadow-xl relative overflow-hidden group hover:border-[#00C8FF]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">صافي الربح للفترة</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 flex items-center justify-center text-[#00C8FF] border border-cyan-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-mono text-2xl font-black text-[#00D99A]">
              {incomeStatement.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
              <span className="text-xs font-normal text-slate-400">{settings.baseCurrency}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              مجمل الربح: {incomeStatement.grossProfit.toFixed(2)} {settings.baseCurrency}
            </div>
          </div>
        </div>

        {/* Liquid Cash & Banks */}
        <div className="p-5 rounded-3xl bg-[#040C2E]/90 border border-blue-500/25 shadow-xl relative overflow-hidden group hover:border-[#00C8FF]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">السيولة النقدية والبنكية</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-[#00D99A] border border-emerald-500/30">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-mono text-2xl font-black text-white">
              {totalLiquid.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
              <span className="text-xs font-normal text-[#00D99A]">{settings.baseCurrency}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              موزعة على الخزينة الرئيسية وصندوق مبيعات الكاشير
            </div>
          </div>
        </div>

        {/* Stock Valuation */}
        <div className="p-5 rounded-3xl bg-[#040C2E]/90 border border-blue-500/25 shadow-xl relative overflow-hidden group hover:border-[#7900FF]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">قيمة بضاعة المخزون (بالتكلفة)</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-300 border border-purple-500/30">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-mono text-2xl font-black text-purple-300">
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
        <div className="p-5 rounded-3xl bg-[#040C2E]/90 border border-blue-500/25 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#00D99A]" />
              أرصدة الخزينة والحسابات البنكية
            </h3>
            <span className="text-xs text-slate-300 font-mono">
              المجموع: {totalLiquid.toFixed(2)} {settings.baseCurrency}
            </span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-[#030922]/70 border border-blue-500/20 flex justify-between items-center">
              <div>
                <div className="font-sans font-bold text-white">الصندوق الرئيسي (الخزينة)</div>
                <div className="text-[10px] text-slate-400">حساب 1101</div>
              </div>
              <span className="font-bold text-[#00D99A]">
                {(cashAcc?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} {settings.baseCurrency}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#030922]/70 border border-blue-500/20 flex justify-between items-center">
              <div>
                <div className="font-sans font-bold text-white">صندوق الكاشير (نقطة البيع)</div>
                <div className="text-[10px] text-slate-400">حساب 1102</div>
              </div>
              <span className="font-bold text-white">
                {(posAcc?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} {settings.baseCurrency}
              </span>
            </div>

            {otherCashAccounts.map((acc) => (
              <div key={acc.id} className="p-2.5 rounded-xl bg-[#030922]/70 border border-blue-500/20 flex justify-between items-center">
                <div>
                  <div className="font-sans font-bold text-white">{acc.nameAr}</div>
                  <div className="text-[10px] text-slate-400">حساب {acc.code}</div>
                </div>
                <span className="font-bold text-[#00C8FF]">
                  {(acc.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} {settings.baseCurrency}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Receivables & Payables Summary */}
        <div className="p-5 rounded-3xl bg-[#040C2E]/90 border border-blue-500/25 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00C8FF]" />
              الذمم المدينة والدائنة (العملاء والموردين)
            </h3>
            <button
              onClick={() => setActiveView('contacts')}
              className="text-xs text-[#00C8FF] hover:text-white font-bold cursor-pointer"
            >
              عرض الكل
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Customer Receivables */}
            <div className="p-3 rounded-2xl bg-[#030922]/80 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <div className="font-sans font-bold text-white text-sm">ديون العملاء (ذمم مدينة)</div>
                <div className="font-sans text-[11px] text-slate-400 mt-0.5">
                  أموال مستحقة للمؤسسة طرف العملاء
                </div>
              </div>
              <div className="text-left">
                <div className="font-bold text-[#00D99A] text-base">
                  {totalReceivables.toLocaleString('en-US', { minimumFractionDigits: 2 })} {settings.baseCurrency}
                </div>
                <span className="font-sans text-[10px] text-slate-400">
                  على {contacts.filter((c) => c.type === 'CUSTOMER' && c.balance > 0).length} عميل
                </span>
              </div>
            </div>

            {/* Supplier Payables */}
            <div className="p-3 rounded-2xl bg-[#030922]/80 border border-amber-500/30 flex items-center justify-between">
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
            <div className="p-3 rounded-2xl bg-[#07133D]/90 border border-blue-500/30 flex items-center justify-between">
              <span className="font-sans font-bold text-slate-200">صافي الفرق الائتماني:</span>
              <span className="font-bold text-white text-sm">
                {(totalReceivables - totalPayables).toFixed(2)} {settings.baseCurrency}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Audit & Posting Health */}
        <div className="p-5 rounded-3xl bg-[#040C2E]/90 border border-blue-500/25 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00D99A]" />
              صحة الموازنة والترحيل المحاسبي
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-[#00D99A] border border-emerald-500/40">
              100% متطابق
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#030922]/70 border border-blue-500/20 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">عدد القيود الآلية المسجلة:</span>
                <span className="font-mono font-bold text-white">{journalEntries.length} قيد</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">حالة التوازن المحاسبي:</span>
                <span className="font-bold text-[#00D99A] flex items-center gap-1">
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

            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 to-cyan-950/40 border border-emerald-500/30 text-emerald-300">
              <div className="font-bold text-[11px] text-[#00D99A]">ميزة المحاسب الذكي التلقائية:</div>
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
        <div className="p-5 rounded-3xl bg-[#040C2E]/90 border border-blue-500/25 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#00D99A]" />
              آخر الفواتير الصادرة
            </h3>
            <button
              onClick={() => setActiveView('invoices')}
              className="text-xs text-[#00C8FF] hover:text-white font-bold cursor-pointer"
            >
              عرض جميع الفواتير
            </button>
          </div>

          <div className="space-y-2">
            {recentInvoices.map((inv) => (
              <div
                key={inv.id}
                className="p-3 rounded-2xl bg-[#030922]/70 border border-blue-500/20 hover:border-[#00C8FF]/50 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <div className="font-mono font-bold text-[#00D99A]">{inv.invoiceNumber}</div>
                  <div className="font-semibold text-white mt-0.5">{inv.partyName}</div>
                  <span className="text-[10px] text-slate-400 font-mono">{inv.date}</span>
                </div>
                <div className="text-left font-mono">
                  <div className="font-extrabold text-white text-sm">
                    {inv.grandTotal.toFixed(2)} {settings.baseCurrency}
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                      inv.status === 'PAID'
                        ? 'bg-emerald-500/20 text-[#00D99A] border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
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
        <div className="p-5 rounded-3xl bg-[#040C2E]/90 border border-blue-500/25 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#00C8FF]" />
              سجل قيود اليومية الحديثة
            </h3>
            <button
              onClick={() => setActiveView('journal')}
              className="text-xs text-[#00C8FF] hover:text-white font-bold cursor-pointer"
            >
              عرض دفتر اليومية
            </button>
          </div>

          <div className="space-y-2">
            {recentEntries.map((je) => (
              <div
                key={je.id}
                className="p-3 rounded-2xl bg-[#030922]/70 border border-blue-500/20 hover:border-[#00C8FF]/50 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#00C8FF]">{je.entryNumber}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{je.date}</span>
                  </div>
                  <div className="text-slate-200 mt-0.5 line-clamp-1">{je.description}</div>
                </div>
                <div className="text-left font-mono shrink-0">
                  <div className="font-bold text-white">
                    {je.totalDebit.toFixed(2)} {settings.baseCurrency}
                  </div>
                  <span className="text-[10px] text-[#00D99A] font-bold">متوازن ومرحل</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
