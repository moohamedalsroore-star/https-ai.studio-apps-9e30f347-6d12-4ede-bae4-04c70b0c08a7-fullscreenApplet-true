import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Truck,
  Package,
  Users,
  CreditCard,
  BookOpen,
  FolderTree,
  BarChart3,
  Settings,
  Bell,
  Coins,
  ShieldCheck,
  FileText,
  RotateCcw,
  ArrowLeftRight,
  Building2,
  Plus,
  Warehouse as WarehouseIcon,
  X,
  Sparkles,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { PlayStoreIcon } from './AppIcons';

export const Navbar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    lowStockItems,
    accounts,
    settings,
    currencies,
    branchActionModal,
    setBranchActionModal,
  } = useAccounting();

  const cashAccounts = accounts.filter(
    (a) => a.code === '1101' || a.code === '1102'
  );
  const totalLiquidCash = cashAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  const usdCurrency = currencies.find((c) => c.code === 'USD');

  const navItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'pos', label: 'نقطة البيع (POS)', icon: ShoppingCart, badge: 'سريع' },
    { id: 'invoices', label: 'فواتير المبيعات', icon: Receipt },
    { id: 'quotations', label: 'عروض الأسعار', icon: FileText },
    { id: 'purchases', label: 'المشتريات والتوريد', icon: Truck },
    { id: 'returns', label: 'المردودات', icon: RotateCcw },
    {
      id: 'inventory',
      label: 'المخزون و COGS',
      icon: Package,
      badge: lowStockItems.length > 0 ? `${lowStockItems.length}` : undefined,
      badgeColor: 'bg-amber-500',
    },
    { id: 'transfers', label: 'التحويلات والاستلام', icon: ArrowLeftRight },
    { id: 'contacts', label: 'العملاء والموردين', icon: Users },
    { id: 'vouchers', label: 'سندات القبض والصرف', icon: CreditCard },
    { id: 'journal', label: 'قيود اليومية الآلية', icon: BookOpen },
    { id: 'currencies', label: 'العملات وأسعار الصرف', icon: Coins, badge: `${currencies.length}`, badgeColor: 'bg-emerald-600' },
    { id: 'branches', label: 'الفروع والمستودعات', icon: Building2 },
    { id: 'chart', label: 'دليل الحسابات', icon: FolderTree },
    { id: 'reports', label: 'القوائم المالية والتقارير', icon: BarChart3 },
    { id: 'settings', label: 'إعدادات وتصفير النظام', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-xl backdrop-blur-md bg-opacity-95 no-print">
      {/* TV News Broadcast Ticker Banner (شريط قنوات التلفاز المتواصل) */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-red-500/40 overflow-hidden py-1 px-3 flex items-center relative select-none shadow-inner">
        {/* TV Channel Live Badge */}
        <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-0.5 rounded-md bg-red-600 text-white font-black text-[10px] z-10 shadow-md ml-3 border border-red-400/50">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span>عاجل • إعلان</span>
        </div>

        {/* Continuous Stream (Never cuts, zero gap, seamless TV ticker) */}
        <div className="overflow-hidden whitespace-nowrap w-full flex relative" dir="ltr">
          <div className="animate-tv-ticker flex">
            {/* First half */}
            <div className="flex items-center gap-8 shrink-0 pr-8">
              {[1, 2, 3, 4].map((idx) => (
                <span key={`tv1-${idx}`} className="inline-flex items-center gap-2.5 text-xs font-bold text-slate-100 shrink-0" dir="rtl">
                  <span className="text-amber-400 font-black text-sm">الغفاري سوفت برو</span>
                  <span className="text-slate-200">محاسبك المثالي</span>
                  <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono-num text-[11px] border border-emerald-500/30">
                    نسخه v. 01
                  </span>
                  <span className="text-cyan-300 font-extrabold inline-flex items-center gap-1.5">
                    <span>ستتوفر نسخه متجر بلاي</span>
                    <PlayStoreIcon className="w-4 h-4" />
                    <span>قريبآ</span>
                  </span>
                  <span className="text-amber-400/80 mr-3 text-xs">✦</span>
                </span>
              ))}
            </div>

            {/* Second identical half for 100% seamless infinite TV broadcast loop */}
            <div className="flex items-center gap-8 shrink-0 pr-8" aria-hidden="true">
              {[1, 2, 3, 4].map((idx) => (
                <span key={`tv2-${idx}`} className="inline-flex items-center gap-2.5 text-xs font-bold text-slate-100 shrink-0" dir="rtl">
                  <span className="text-amber-400 font-black text-sm">الغفاري سوفت برو</span>
                  <span className="text-slate-200">محاسبك المثالي</span>
                  <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono-num text-[11px] border border-emerald-500/30">
                    نسخه v. 01
                  </span>
                  <span className="text-cyan-300 font-extrabold inline-flex items-center gap-1.5">
                    <span>ستتوفر نسخه متجر بلاي</span>
                    <PlayStoreIcon className="w-4 h-4" />
                    <span>قريبآ</span>
                  </span>
                  <span className="text-amber-400/80 mr-3 text-xs">✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Banner with Brand, Branch/Warehouse creation button, and Live Indicators */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          {/* Official Al-Ghafari Soft Pro Logo */}
          <img
            src="/assets/aistudio/1787182612810_5ba9faf5.png"
            alt="الغفاري سوفت برو - Al-Ghafari Soft Pro"
            className="w-12 h-12 rounded-2xl object-cover shadow-lg shadow-blue-900/40 border border-amber-400/40 ring-1 ring-blue-500/30 shrink-0"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">
                الغفاري سوفت برو
              </h1>
              <span className="px-2.5 py-0.5 text-[11px] font-black tracking-wider bg-gradient-to-r from-amber-500/20 to-blue-500/20 text-amber-300 border border-amber-400/30 rounded-full shadow-sm">
                Al-Ghafari Soft Pro €
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              النظام المحاسبي والإداري السحابي الشامل
            </p>
          </div>
        </div>

        {/* Center: Create Branch or Warehouse Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBranchActionModal('MENU')}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg shadow-emerald-700/30 cursor-pointer transition-all active:scale-95 border border-emerald-400/30"
            title="إنشاء فرع جديد أو مخزن جديد"
          >
            <Plus className="w-4 h-4 text-white" />
            <Building2 className="w-4 h-4 text-emerald-200" />
            <span>إنشاء فرع أو مخزن</span>
          </button>
        </div>

        {/* Live Financial Indicators */}
        <div className="flex items-center gap-3">
          {/* Multi-Currency FX Quick Widget */}
          {usdCurrency && (
            <button
              onClick={() => setActiveView('currencies')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-emerald-500/50 transition-colors text-xs cursor-pointer"
              title="عرض وإدارة أسعار الصرف للعملات المتعددة"
            >
              <Coins className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">سعر الصرف:</span>
              <span className="font-mono-num font-bold text-white">
                1 USD = {usdCurrency.rate.toFixed(2)} {settings.baseCurrency}
              </span>
            </button>
          )}

          {/* Liquidity Counter */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">السيولة النقدية:</span>
            <span className="font-mono-num font-bold text-emerald-400 text-sm">
              {totalLiquidCash.toLocaleString('en-US', { minimumFractionDigits: 2 })} {settings.baseCurrency}
            </span>
          </div>

          {/* Low Stock Alert Button */}
          {lowStockItems.length > 0 && (
            <button
              onClick={() => setActiveView('inventory')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors text-xs font-semibold cursor-pointer animate-pulse"
              title="يوجد أصناف قاربت على النفاد، اضغط للعرض"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span>نواقص المخزون:</span>
              <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full font-bold text-[10px]">
                {lowStockItems.length}
              </span>
            </button>
          )}

          {/* Auto Posting Active Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[11px] text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>الترحيل التلقائي نشط</span>
          </div>
        </div>
      </div>

      {/* Quick Action Modal for Adding Branch or Warehouse */}
      {branchActionModal === 'MENU' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl p-6 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">إنشاء فرع أو مخزن جديد</h3>
                  <p className="text-xs text-slate-400">حدد نوع الإضافة المطلوبة لمنشأتك</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBranchActionModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => {
                  setBranchActionModal('BRANCH');
                  setActiveView('branches');
                }}
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-800 hover:bg-emerald-950/40 border border-slate-700 hover:border-emerald-500/50 text-right transition-all cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-600/20 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-white group-hover:text-emerald-300">
                    🏢 إنشاء فرع جديد
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    إضافة فرع مستقل مع كوده واسمه ومعلومات الاتصال
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBranchActionModal('WAREHOUSE');
                  setActiveView('branches');
                }}
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-800 hover:bg-cyan-950/40 border border-slate-700 hover:border-cyan-500/50 text-right transition-all cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-xl bg-cyan-600/20 text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <WarehouseIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-white group-hover:text-cyan-300">
                    🏬 إنشاء مخزن / مستودع جديد
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    إضافة مستودع تخزين بضاعة وربطه بالفرع التابع له
                  </div>
                </div>
              </button>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs text-slate-400 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setBranchActionModal(null);
                  setActiveView('branches');
                }}
                className="text-emerald-400 hover:underline cursor-pointer font-bold"
              >
                تصفح وإدارة كافة الفروع والمستودعات ←
              </button>
              <button
                type="button"
                onClick={() => setBranchActionModal(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Nav Items Scrolling Row */}
      <nav className="px-2 sm:px-4 flex items-center gap-1 overflow-x-auto py-1.5 scrollbar-none text-xs font-medium">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    item.badgeColor || 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
