import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Bell,
  Coins,
  Building2,
  Plus,
  X,
  ChevronDown,
  ChevronLeft,
  CheckCircle2,
  Menu,
  Search,
  Printer,
  FileText,
  Boxes,
  ShieldCheck,
  Database,
  FileSpreadsheet,
  Palette,
  Wrench,
  Info,
  Settings,
  Lock,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { useAuth } from '../context/AuthContext';
import { useBackHandler } from '../hooks/useBackHandler';

const DRAWER_SETTINGS_ITEMS = [
  {
    id: 'print',
    title: 'إعدادات الطباعة',
    subtitle: 'الطابعات، مقاسات A4 وA5 والإيصالات، والهوامش',
    icon: Printer,
    keywords: 'طباعة طابعة ورق a4 a5 حراري ايصال هوامش pdf',
  },
  {
    id: 'documents',
    title: 'إعدادات المستندات والقوالب',
    subtitle: 'قوالب الفواتير والسندات والترقيم التلقائي والختم',
    icon: FileText,
    keywords: 'فواتير مستندات ترقيم سندات قبض صرف قوالب توقيع ختم',
  },
  {
    id: 'organization',
    title: 'بيانات المؤسسة والنشاط',
    subtitle: 'اسم النشاط، الشعار، الرقم الضريبي، العملة والسنة المالية',
    icon: Building2,
    keywords: 'مؤسسة شركة اسم شعار سجل ضريبي عملة عنوان هاتف',
  },
  {
    id: 'accounting',
    title: 'إعدادات المحاسبة والقيود',
    subtitle: 'الحسابات الافتراضية، الصندوق، البنوك، التقريب والقيود',
    icon: Coins,
    keywords: 'محاسبة صندوق بنك عملاء موردين مبيعات مشتريات قيود',
  },
  {
    id: 'inventory',
    title: 'إعدادات المخزون والمستودعات',
    subtitle: 'المستودع الافتراضي، طرق التسعير FIFO والمتوسط والتنبيهات',
    icon: Boxes,
    keywords: 'مخزون مستودع تسعير fifo متوسط تنبيه نفاد بضاعة',
  },
  {
    id: 'users',
    title: 'الأمان والمستخدمون والصلاحيات',
    subtitle: 'المستخدمون، رمز PIN، مصفوفة الصلاحيات، وسجل المراقبة',
    icon: ShieldCheck,
    keywords: 'مستخدمين صلاحيات مدير كاشير محاسب pin رمز امان خصوصية',
  },
  {
    id: 'backup',
    title: 'النسخ الاحتياطي وتصفير النظام',
    subtitle: 'تصدير واستعادة JSON، حفظ البيانات، والتصفير الشامل للنظام',
    icon: Database,
    keywords: 'نسخ احتياطي استعادة تصدير استيراد قاعدة بيانات تصفير حذف اعادة ضبط',
  },
  {
    id: 'reports',
    title: 'التقارير والتصدير المالي',
    subtitle: 'تخصيص الأعمدة وتصدير Excel وPDF المباشر',
    icon: FileSpreadsheet,
    keywords: 'تقارير اكسل excel pdf تصدير اعمدة ارباح ميزانية كشف',
  },
  {
    id: 'appearance',
    title: 'المظهر والتنبيهات والأصوات',
    subtitle: 'الثيم، حجم الخط، تنسيق التاريخ، وتنبيهات الديون والأصوات',
    icon: Palette,
    keywords: 'مظهر ثيم داكن فاتح خط تاريخ تنبيهات اصوات كاشير',
  },
  {
    id: 'maintenance',
    title: 'النظام والصيانة والدعم الفني',
    subtitle: 'فحص توازن القيود، تحسين الأداء، الكاش والترخيص',
    icon: Wrench,
    keywords: 'صيانة فحص توازن اداء كاش اصدار ترخيص دعم تحديث',
  },
  {
    id: 'about',
    title: 'نبذة عن التطبيق',
    subtitle: 'الدليل التعريفي الرسمي للغفاري سوفت PRO وملف PDF',
    icon: Info,
    keywords: 'نبذة عن التطبيق تعريف مميزات pdf دليل الغفاري مطور',
  },
] as const;

export const Navbar: React.FC = () => {
  const { authUser, userProfile, tenantCode, isSuperAdmin, signInWithGoogle, signOutAccount } = useAuth();
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
  const [drawerSearch, setDrawerSearch] = useState('');

  useBackHandler({
    isOpen: settingsDrawerOpen,
    onClose: () => setSettingsDrawerOpen(false),
    stateKey: 'navbarSettingsDrawer',
  });

  const filteredDrawerItems = useMemo(() => {
    const q = drawerSearch.trim().toLowerCase();
    if (!q) return DRAWER_SETTINGS_ITEMS;
    return DRAWER_SETTINGS_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.keywords.toLowerCase().includes(q)
    );
  }, [drawerSearch]);
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

  return (
    <header className="sticky top-0 z-30 bg-[#020824]/95 border-b border-blue-900/60 text-[#F5F8FF] shadow-2xl backdrop-blur-xl no-print">
      {/* TV News Broadcast Ticker Banner (شريط قنوات التلفاز المتواصل بأسلوب النيون) */}
      <div
        className="bg-gradient-to-r from-[#010519] via-[#020824] to-[#010519] border-b border-cyan-500/30 overflow-hidden py-1 px-3 flex items-center relative select-none shadow-inner"
      >
        {/* TV Channel Live Badge with glowing red pill */}
        <div className="flex items-center gap-1.5 shrink-0 px-3 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-rose-700 text-white font-black text-[10px] z-10 shadow-[0_0_14px_rgba(239,68,68,0.6)] ml-3 border border-red-400/70">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span>نظام متكامل</span>
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
                    <span>نظام محاسبي وإداري شامل لجميع الأنشطة</span>
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
                    <span>نظام محاسبي وإداري شامل لجميع الأنشطة</span>
                  </span>
                  <span className="text-[#FFC629] mr-3 text-xs">✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Banner with Brand, Top-Left 3-Line Settings Menu, Branch/Warehouse button, and Live Indicators */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3 border-b border-blue-900/40 bg-gradient-to-b from-[#020824] to-[#03092b]">
        {/* Right & Top Row Container on Mobile: Brand on Right + 3-Line Menu Button in Top-Left Corner */}
        <div className="w-full lg:w-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Official Al-Ghafari Soft PRO 3D Logo Badge */}
            <div className="p-0.5 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-[#FFC629] shadow-[0_0_22px_rgba(0,200,255,0.6)] hover:shadow-[0_0_28px_rgba(255,198,41,0.7)] transition-shadow shrink-0">
              <img
                src="/assets/aistudio/logo_3d_transparent.png"
                alt="الغفاري سوفت PRO"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] object-contain drop-shadow-md hover:scale-105 transition-transform"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  الغفاري سوفت PRO
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] sm:text-[11px] font-black tracking-wider bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-amber-600/30 text-[#FFC629] border border-amber-400/80 rounded-full shadow-[0_0_12px_rgba(255,198,41,0.4)] flex items-center gap-1">
                  <span>👑 PRO Official</span>
                </span>
              </div>
              <p className="text-[11px] text-[#AAB8D6] font-medium mt-0.5">
                تطبيق محاسبة متكامل لإدارة نشاطك التجاري
              </p>
            </div>
          </div>

          {/* Mobile Top-Left Corner 3-Line Hamburger Menu Button (Placed exactly at top-left spot) */}
          <button
            type="button"
            onClick={() => setSettingsDrawerOpen(true)}
            className="lg:hidden w-11 h-11 rounded-2xl bg-[#04113d] hover:bg-[#071d63] border border-cyan-400/60 shadow-[0_0_18px_rgba(0,200,255,0.35)] flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
            title="قائمة إعدادات التطبيق والنظام"
            aria-label="فتح القائمة الجانبية لإعدادات التطبيق"
          >
            <span className="w-6 h-[2.5px] rounded-full bg-gradient-to-r from-cyan-300 to-white" />
            <span className="w-6 h-[2.5px] rounded-full bg-gradient-to-r from-amber-300 to-cyan-300" />
            <span className="w-6 h-[2.5px] rounded-full bg-gradient-to-r from-cyan-300 to-white" />
          </button>
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

        {/* Left (Desktop): Live Financial Indicators + Top-Left 3-Line Menu Button */}
        <div className="flex items-center gap-2.5">
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

          {/* Desktop Top-Left Corner 3-Line Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setSettingsDrawerOpen(true)}
            className="hidden lg:flex w-11 h-11 rounded-2xl bg-[#04113d] hover:bg-[#071d63] border border-cyan-400/60 shadow-[0_0_18px_rgba(0,200,255,0.35)] flex-col items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
            title="قائمة إعدادات التطبيق والنظام"
            aria-label="فتح القائمة الجانبية لإعدادات التطبيق"
          >
            <span className="w-6 h-[2.5px] rounded-full bg-gradient-to-r from-cyan-300 to-white" />
            <span className="w-6 h-[2.5px] rounded-full bg-gradient-to-r from-amber-300 to-cyan-300" />
            <span className="w-6 h-[2.5px] rounded-full bg-gradient-to-r from-cyan-300 to-white" />
          </button>
        </div>
      </div>

      {/* Quick Action Modal for Adding Branch or Warehouse (Portaled to document.body above all menus) */}
      {branchActionModal === 'MENU' && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => setBranchActionModal(null)}
        >
          <div
            className="bg-slate-900 border border-cyan-500/40 rounded-3xl w-full max-w-md shadow-[0_0_40px_rgba(0,200,255,0.25)] p-6 text-right space-y-4 my-auto max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
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
        </div>,
        document.body
      )}

      {/* Slide-out App Settings Side Drawer (Opened via Top-Left 3-Line Icon) */}
      {settingsDrawerOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
          dir="rtl"
          onClick={() => setSettingsDrawerOpen(false)}
        >
          <aside
            className="w-full max-w-sm h-full bg-[#020824] border-r border-cyan-500/40 shadow-[0_0_50px_rgba(0,200,255,0.28)] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-blue-900/60 bg-gradient-to-r from-[#040C2E] to-[#061340] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(0,200,255,0.3)]">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-white">قائمة إعدادات التطبيق</h2>
                  <p className="text-[11px] text-cyan-300/90">اختر الإعداد أو الخاصية المطلوبة مباشرة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSettingsDrawerOpen(false)}
                className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                aria-label="إغلاق القائمة الجانبية"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input inside Drawer */}
            <div className="p-3.5 border-b border-blue-950/80 bg-[#030A29] shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-cyan-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={drawerSearch}
                  onChange={(e) => setDrawerSearch(e.target.value)}
                  placeholder="ابحث عن إعداد (طباعة، تصفير، صلاحيات...)"
                  className="w-full pr-9 pl-3 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/35 focus:border-cyan-400 text-xs text-white placeholder-slate-400 focus:outline-none"
                />
                {drawerSearch && (
                  <button
                    type="button"
                    onClick={() => setDrawerSearch('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-white cursor-pointer"
                  >
                    مسح
                  </button>
                )}
              </div>
            </div>

            {/* Full List of All Settings & System Reset Sections */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 overscroll-contain">
              {/* Open Full Settings Hub button */}
              <button
                type="button"
                onClick={() => {
                  try {
                    sessionStorage.removeItem('alghafari_settings_tab');
                  } catch {}
                  setActiveView('settings');
                  window.dispatchEvent(new CustomEvent('alghafari:open-settings-tab', { detail: null }));
                  setSettingsDrawerOpen(false);
                }}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-cyan-500/15 border border-amber-400/50 hover:border-amber-400 flex items-center justify-between text-right cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Menu className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-xs font-black text-amber-300">مركز الإعدادات الشامل (جميع البطاقات)</div>
                    <div className="text-[10px] text-slate-300">عرض كافة أقسام إعدادات وتصفير النظام</div>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-amber-400 shrink-0" />
              </button>

              {filteredDrawerItems.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
                  لا توجد نتائج مطابقة لـ "{drawerSearch}"
                </div>
              ) : (
                filteredDrawerItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        try {
                          sessionStorage.setItem('alghafari_settings_tab', item.id);
                        } catch {}
                        setActiveView('settings');
                        window.dispatchEvent(new CustomEvent('alghafari:open-settings-tab', { detail: item.id }));
                        setSettingsDrawerOpen(false);
                      }}
                      className="w-full p-3 rounded-2xl bg-[#040C2E]/90 hover:bg-[#08174d] border border-blue-900/60 hover:border-cyan-400/60 flex items-center justify-between gap-2.5 text-right cursor-pointer transition-all group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-900 border border-amber-500/35 flex items-center justify-center text-amber-400 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-white group-hover:text-cyan-300 transition-colors truncate">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {item.subtitle}
                        </div>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                    </button>
                  );
                })
              )}
            </div>

            {/* Bottom Account Identity & Sign-In/Sign-Out inside Drawer */}
            <div className="p-3.5 border-t border-blue-900/60 bg-[#030926] space-y-2.5 shrink-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-black text-white truncate flex items-center gap-1.5">
                      <span className="truncate">{userProfile?.displayName || authUser?.displayName || 'حساب مستقل'}</span>
                      {isSuperAdmin && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] border border-amber-400/40 shrink-0">
                          إدارة
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-cyan-300 truncate">{tenantCode}</div>
                  </div>
                </div>

                {authUser ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsDrawerOpen(false);
                      void signOutAccount();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-500/40 text-[11px] font-bold cursor-pointer shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>خروج</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsDrawerOpen(false);
                      void signInWithGoogle();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold cursor-pointer shrink-0"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>دخول</span>
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>,
        document.body
      )}
    </header>
  );
};
