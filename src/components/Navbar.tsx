import React, { useState } from 'react';
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
  ChevronDown,
  CheckCircle2,
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
    branches,
    warehouses,
    selectedBranchId,
    setSelectedBranchId,
    addBranch,
    showToast,
    branchActionModal,
    setBranchActionModal,
  } = useAccounting();

  // First branch creation state (defaults to المركز الرئيسي per user request)
  const [firstBranchName, setFirstBranchName] = useState('المركز الرئيسي');
  const [firstBranchCity, setFirstBranchCity] = useState('الرياض');
  const [firstBranchPhone, setFirstBranchPhone] = useState('0500000000');

  // Determine active branch or warehouse display name
  const activeBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];
  const activeWarehouse = warehouses.find((w) => w.isMain) || warehouses[0];
  const headerDisplayName = activeBranch?.nameAr || activeWarehouse?.nameAr || 'المركز الرئيسي';

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
    <header className="sticky top-0 z-40 bg-[#020824]/95 border-b border-blue-900/60 text-[#F5F8FF] shadow-2xl backdrop-blur-xl no-print">
      {/* TV News Broadcast Ticker Banner (شريط قنوات التلفاز المتواصل بأسلوب النيون) */}
      <div className="bg-gradient-to-r from-[#010519] via-[#020824] to-[#010519] border-b border-cyan-500/30 overflow-hidden py-1 px-3 flex items-center relative select-none shadow-inner">
        {/* TV Channel Live Badge with glowing red pill */}
        <div className="flex items-center gap-1.5 shrink-0 px-3 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-rose-700 text-white font-black text-[10px] z-10 shadow-[0_0_14px_rgba(239,68,68,0.6)] ml-3 border border-red-400/70">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span>عاجل • إعلان</span>
        </div>

        {/* Continuous Stream (Never cuts, zero gap, seamless TV ticker) */}
        <div className="overflow-hidden whitespace-nowrap w-full flex relative" dir="ltr">
          <div className="animate-tv-ticker flex">
            {/* First half */}
            <div className="flex items-center gap-8 shrink-0 pr-8">
              {[1, 2, 3, 4].map((idx) => (
                <span key={`tv1-${idx}`} className="inline-flex items-center gap-2.5 text-xs font-bold text-[#F5F8FF] shrink-0" dir="rtl">
                  <span className="text-[#FFC629] font-black text-sm drop-shadow-[0_0_8px_rgba(255,198,41,0.5)]">الغفاري سوفت برو</span>
                  <span className="text-[#AAB8D6]">محاسبك المثالي</span>
                  <span className="bg-cyan-950/70 text-cyan-200 px-2.5 py-0.5 rounded-full font-mono-num text-[11px] border border-cyan-400/70 shadow-[0_0_10px_rgba(0,200,255,0.4)]">
                    نسخه 01 .V
                  </span>
                  <span className="text-cyan-300 font-extrabold inline-flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(0,200,255,0.5)]">
                    <span>ستتوفر نسخه متجر بلاي</span>
                    <PlayStoreIcon className="w-4 h-4" />
                    <span>قريبآ</span>
                  </span>
                  <span className="text-[#FFC629] mr-3 text-xs">✦</span>
                </span>
              ))}
            </div>

            {/* Second identical half for 100% seamless infinite TV broadcast loop */}
            <div className="flex items-center gap-8 shrink-0 pr-8" aria-hidden="true">
              {[1, 2, 3, 4].map((idx) => (
                <span key={`tv2-${idx}`} className="inline-flex items-center gap-2.5 text-xs font-bold text-[#F5F8FF] shrink-0" dir="rtl">
                  <span className="text-[#FFC629] font-black text-sm drop-shadow-[0_0_8px_rgba(255,198,41,0.5)]">الغفاري سوفت برو</span>
                  <span className="text-[#AAB8D6]">محاسبك المثالي</span>
                  <span className="bg-cyan-950/70 text-cyan-200 px-2.5 py-0.5 rounded-full font-mono-num text-[11px] border border-cyan-400/70 shadow-[0_0_10px_rgba(0,200,255,0.4)]">
                    نسخه 01 .V
                  </span>
                  <span className="text-cyan-300 font-extrabold inline-flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(0,200,255,0.5)]">
                    <span>ستتوفر نسخه متجر بلاي</span>
                    <PlayStoreIcon className="w-4 h-4" />
                    <span>قريبآ</span>
                  </span>
                  <span className="text-[#FFC629] mr-3 text-xs">✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Banner with Brand, Branch/Warehouse creation button, and Live Indicators */}
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-blue-900/40 bg-gradient-to-b from-[#020824] to-[#03092b]">
        <div className="flex items-center gap-3.5">
          {/* Official Al-Ghafari Soft PRO Logo with Luxury Cyan/Gold Neon Trim */}
          <div className="p-0.5 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-[#FFC629] shadow-[0_0_20px_rgba(0,200,255,0.55)]">
            <img
              src="/pwa-512x512.png"
              alt="الغفاري سوفت PRO"
              className="w-12 h-12 rounded-[14px] object-cover bg-[#020824]"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                الغفاري سوفت PRO
              </h1>
              <span className="px-3 py-0.5 text-[11px] font-black tracking-wider bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-amber-600/30 text-[#FFC629] border border-amber-400/80 rounded-full shadow-[0_0_12px_rgba(255,198,41,0.4)] flex items-center gap-1">
                <span>👑 PRO Official</span>
              </span>
            </div>
            <p className="text-[11px] text-[#AAB8D6] font-medium mt-0.5">
              تطبيق محاسبة متكامل لإدارة نشاطك التجاري
            </p>
          </div>
        </div>

        {/* Center: Branch/Warehouse Action Button (Matches Reference Image Glowing Pill) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBranchActionModal('MENU')}
            className="flex items-center gap-2.5 bg-gradient-to-r from-[#00C8FF] via-[#075BFF] to-[#7900FF] hover:from-[#00E5FF] hover:to-[#9100FF] text-white px-5 py-2.5 rounded-full font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(0,200,255,0.7)] border-2 border-cyan-200/90 cursor-pointer transition-all active:scale-95 group"
            title={`الفرع الحالي: ${headerDisplayName} - انقر للتبديل أو إضافة فرع/مخزن`}
          >
            <Plus className="w-4 h-4 text-white shrink-0 group-hover:rotate-90 transition-transform stroke-[3]" />
            <Building2 className="w-4 h-4 text-cyan-100 shrink-0" />
            <span className="tracking-tight">{headerDisplayName === 'المركز الرئيسي' ? 'إنشاء فرع أو مخزن' : headerDisplayName}</span>
            {branches.length > 1 && (
              <ChevronDown className="w-3.5 h-3.5 text-cyan-100 shrink-0 opacity-80" />
            )}
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
                  <h3 className="font-black text-white text-base">
                    {branches.length === 0 ? 'تأسيس واعتماد المركز الرئيسي' : 'إدارة وتبديل الفروع والمخازن'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {branches.length === 0
                      ? 'أول إضافة في النظام هي (المركز الرئيسي) لتظهر في أعلى الشاشة'
                      : 'الفرع النشط حالياً ومتاح إضافة فروع أو مخازن جديدة'}
                  </p>
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

            {/* Scenario A: No branches exist yet -> Instant 1-tap establishment of "المركز الرئيسي" */}
            {branches.length === 0 ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addBranch({
                    code: 'BR-01',
                    nameAr: firstBranchName.trim() || 'المركز الرئيسي',
                    address: firstBranchCity.trim() || 'الرياض',
                    phone: firstBranchPhone.trim() || '0500000000',
                    isMain: true,
                  });
                  showToast('تم اعتماد وتثبيت (المركز الرئيسي) كأول فرع بنجاح ✓', 'success');
                  setBranchActionModal(null);
                }}
                className="space-y-3.5"
              >
                <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    سيتم اعتماد <strong>{firstBranchName || 'المركز الرئيسي'}</strong> ليظهر مباشرة في أعلى الشاشة بجانب علامة <strong>+</strong> وتُربط به كافة المبيعات والمشتريات.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسم الفرع الأول (المركز الرئيسي)</label>
                  <input
                    type="text"
                    required
                    value={firstBranchName}
                    onChange={(e) => setFirstBranchName(e.target.value)}
                    placeholder="المركز الرئيسي"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">كود الفرع</label>
                    <input
                      type="text"
                      disabled
                      value="BR-01"
                      className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-xs font-mono-num text-slate-400 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">المدينة / المقر</label>
                    <input
                      type="text"
                      value={firstBranchCity}
                      onChange={(e) => setFirstBranchCity(e.target.value)}
                      placeholder="الرياض"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-700/30 cursor-pointer transition-all active:scale-95"
                  >
                    ✨ حفظ وتثبيت المركز الرئيسي
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBranchActionModal('WAREHOUSE');
                      setActiveView('branches');
                    }}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 cursor-pointer"
                  >
                    🏬 أو إنشاء مستودع بضاعة جديد
                  </button>
                </div>
              </form>
            ) : (
              /* Scenario B: Branches exist -> Show active branch & switch/add options */
              <div className="space-y-3.5">
                {/* Current Active Branch Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-800 border border-emerald-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-white">{activeBranch?.nameAr || 'المركز الرئيسي'}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                          النشط حالياً
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        كود: {activeBranch?.code || 'BR-01'} | {activeBranch?.address || 'المركز الرئيسي'}
                      </div>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>

                {/* If multiple branches, quick switcher list */}
                {branches.length > 1 && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">التبديل السريع بين الفروع:</label>
                    <div className="max-h-36 overflow-y-auto space-y-1 pr-0.5">
                      {branches.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            setSelectedBranchId(b.id);
                            showToast(`تم التبديل إلى: ${b.nameAr} ✓`, 'info');
                            setBranchActionModal(null);
                          }}
                          className={`w-full p-2.5 rounded-xl border text-right text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                            b.id === activeBranch?.id
                              ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-300'
                              : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {b.nameAr} ({b.code})
                          </span>
                          {b.id === activeBranch?.id && (
                            <span className="text-[10px] text-emerald-400 font-normal">الفرع المختار</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Creation Buttons */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setBranchActionModal('BRANCH');
                      setActiveView('branches');
                    }}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-emerald-950/50 border border-slate-700 hover:border-emerald-500/50 text-white font-bold text-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>فرع جديد</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBranchActionModal('WAREHOUSE');
                      setActiveView('branches');
                    }}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-cyan-950/50 border border-slate-700 hover:border-cyan-500/50 text-white font-bold text-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-cyan-400" />
                    <span>مخزن جديد</span>
                  </button>
                </div>
              </div>
            )}

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

      {/* Main Nav Items Scrolling Row (Dark Glass Capsule with Neon Trim) */}
      <div className="px-2 sm:px-4 py-2">
        <nav className="p-1 rounded-2xl bg-[#040C2E]/90 border border-blue-500/30 shadow-[0_0_20px_rgba(7,91,255,0.2)] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#075BFF] to-[#00C8FF] text-white font-black shadow-[0_0_18px_rgba(0,200,255,0.7)] border border-cyan-300'
                    : 'text-[#AAB8D6] hover:text-[#F5F8FF] hover:bg-[#07174D]/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      item.badge === 'سريع'
                        ? 'bg-purple-950/80 text-purple-300 border border-purple-500/40 shadow-[0_0_8px_rgba(121,0,255,0.4)]'
                        : item.badgeColor || 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
