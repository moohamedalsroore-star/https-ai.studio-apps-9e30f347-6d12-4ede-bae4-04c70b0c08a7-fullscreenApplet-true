import React, { useState, useMemo } from 'react';
import {
  Printer,
  FileText,
  Building2,
  Coins,
  Boxes,
  Users,
  Database,
  FileSpreadsheet,
  Palette,
  Wrench,
  Search,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  ArrowRight,
  ChevronRight,
  Sliders,
  CheckCircle2,
  Layers,
  LayoutGrid,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { PrintSettingsTab } from './settings/PrintSettingsTab';
import { DocumentTemplatesTab } from './settings/DocumentTemplatesTab';
import { OrganizationInfoTab } from './settings/OrganizationInfoTab';
import { AccountingSettingsTab } from './settings/AccountingSettingsTab';
import { InventorySettingsTab } from './settings/InventorySettingsTab';
import { UsersPermissionsTab } from './settings/UsersPermissionsTab';
import { BackupRestoreTab } from './settings/BackupRestoreTab';
import { ReportsSettingsTab } from './settings/ReportsSettingsTab';
import { AppearanceNotificationsTab } from './settings/AppearanceNotificationsTab';
import { SystemMaintenanceTab } from './settings/SystemMaintenanceTab';
import { useBackHandler } from '../hooks/useBackHandler';

type SettingsTabKey =
  | 'print'
  | 'documents'
  | 'organization'
  | 'accounting'
  | 'inventory'
  | 'users'
  | 'backup'
  | 'reports'
  | 'appearance'
  | 'maintenance';

interface SettingCardItem {
  id: SettingsTabKey;
  number: number;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badge?: string;
  keywords: string[];
}

const SETTING_CARDS: SettingCardItem[] = [
  {
    id: 'print',
    number: 1,
    title: 'إعدادات الطباعة',
    subtitle: 'اختيار الطابعات، أحجام A4 وA5 والإيصالات الحرارية 58 و80 مم، الهوامش، وحفظ الـ PDF',
    icon: Printer,
    badge: 'طابعات وPDF',
    keywords: ['طباعة', 'طابعة', 'ورق', 'a4', 'a5', 'حراري', 'إيصال', 'هوامش', 'خط', 'pdf'],
  },
  {
    id: 'documents',
    number: 2,
    title: 'إعدادات المستندات والقوالب',
    subtitle: 'تخصيص قوالب فواتير البيع والشراء والسندات، الترقيم التلقائي والبادئات، والختم والتوقيع',
    icon: FileText,
    badge: 'قوالب وترقيم',
    keywords: ['فواتير', 'مستندات', 'ترقيم', 'سندات', 'قبض', 'صرف', 'عروض', 'توقيع', 'ختم', 'بادئة'],
  },
  {
    id: 'organization',
    number: 3,
    title: 'بيانات المؤسسة والنشاط',
    subtitle: 'اسم المنشأة، الشعار، السجل التجاري، الرقم الضريبي، العملة الافتراضية، والسنة المالية',
    icon: Building2,
    badge: 'الهوية والضريبة',
    keywords: ['مؤسسة', 'شركة', 'اسم', 'شعار', 'سجل تجاري', 'رقم ضريبي', 'ضريبة', 'عملة', 'عنوان', 'هاتف'],
  },
  {
    id: 'accounting',
    number: 4,
    title: 'إعدادات المحاسبة والقيود',
    subtitle: 'الحسابات الافتراضية، الصندوق، العملاء، الموردون، المبيعات والمشتريات، والتقريب والقيود',
    icon: Coins,
    badge: 'شجرة الحسابات',
    keywords: ['محاسبة', 'صندوق', 'بنك', 'عملاء', 'موردين', 'مبيعات', 'مشتريات', 'خصم', 'تقريب', 'قيود'],
  },
  {
    id: 'inventory',
    number: 5,
    title: 'إعدادات المخزون والمستودعات',
    subtitle: 'المستودع الافتراضي، طرق التسعير FIFO والمتوسط، حد التنبيه، وسياسة البيع عند النفاد',
    icon: Boxes,
    badge: 'المستودعات والتسعير',
    keywords: ['مخزون', 'مستودع', 'تسعير', 'fifo', 'متوسط', 'تنبيه', 'نفاد', 'كمية', 'بضاعة'],
  },
  {
    id: 'users',
    number: 6,
    title: 'الأمان والمستخدمون والصلاحيات',
    subtitle: 'إدارة المستخدمين، كلمات المرور ورمز PIN، مصفوفة الصلاحيات، وسجل العمليات المحاسبية',
    icon: ShieldCheck,
    badge: 'أدوار وPIN',
    keywords: ['مستخدمين', 'صلاحيات', 'مدير', 'كاشير', 'محاسب', 'pin', 'رمز', 'سجل', 'أمان'],
  },
  {
    id: 'backup',
    number: 7,
    title: 'النسخ الاحتياطي وقاعدة البيانات',
    subtitle: 'حفظ واستعادة النسخ الاحتياطية JSON، التحقق من السلامة، نسخة الأمان، والتصفير الشامل',
    icon: Database,
    badge: 'حفظ واستعادة',
    keywords: ['نسخ', 'احتياطي', 'استعادة', 'تصدير', 'استيراد', 'قاعدة بيانات', 'حجم', 'تصفير', 'أمان'],
  },
  {
    id: 'reports',
    number: 8,
    title: 'التقارير والتصدير المالي',
    subtitle: 'الفترات الافتراضية، تخصيص الأعمدة، وتصدير إكسل Excel وPDF الحقيقي المباشر',
    icon: FileSpreadsheet,
    badge: 'Excel & PDF',
    keywords: ['تقارير', 'إكسل', 'excel', 'xlsx', 'pdf', 'تصدير', 'أعمدة', 'أرباح', 'ميزانية', 'كشف'],
  },
  {
    id: 'appearance',
    number: 9,
    title: 'المظهر والتنبيهات والأصوات',
    subtitle: 'الوضع الداكن والفاتح، حجم الخط، تنسيق التاريخ، وتنبيهات الديون والنواقص والمؤثرات',
    icon: Palette,
    badge: 'الثيم والأصوات',
    keywords: ['مظهر', 'ثيم', 'داكن', 'فاتح', 'خط', 'تاريخ', 'تنبيهات', 'أصوات', 'كاشير', 'ديون'],
  },
  {
    id: 'maintenance',
    number: 10,
    title: 'النظام والصيانة والدعم الفني',
    subtitle: 'فحص توازن القيود، تحسين الأداء، تفريغ الكاش بأمان، والترخيص الرسمي والدعم',
    icon: Wrench,
    badge: 'فحص وتراخيص',
    keywords: ['صيانة', 'فحص', 'توازن', 'أداء', 'كاش', 'إصدار', 'ترخيص', 'دعم فني', 'تحديث'],
  },
];

// Grouped view representation matching the user's screenshot
interface GroupedCardItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  defaultTab: SettingsTabKey;
  subTabs: { id: SettingsTabKey; label: string }[];
}

const GROUPED_CARDS: GroupedCardItem[] = [
  {
    id: 'grp-print',
    title: 'الطباعة والمستندات',
    subtitle: 'الطابعات، الفواتير، القوالب، الترقيم',
    icon: Printer,
    defaultTab: 'print',
    subTabs: [
      { id: 'print', label: 'إعدادات الطباعة' },
      { id: 'documents', label: 'إعدادات المستندات والقوالب' },
    ],
  },
  {
    id: 'grp-org',
    title: 'المؤسسة والحسابات',
    subtitle: 'العملة، السنة المالية، الضرائب، الحسابات، المخزون',
    icon: Building2,
    defaultTab: 'organization',
    subTabs: [
      { id: 'organization', label: 'بيانات المؤسسة' },
      { id: 'accounting', label: 'إعدادات المحاسبة' },
      { id: 'inventory', label: 'إعدادات المخزون' },
    ],
  },
  {
    id: 'grp-backup',
    title: 'النسخ الاحتياطي والبيانات',
    subtitle: 'حفظ، استعادة، استيراد وتصدير، تصفير النظام',
    icon: Database,
    defaultTab: 'backup',
    subTabs: [{ id: 'backup', label: 'النسخ الاحتياطي وقاعدة البيانات' }],
  },
  {
    id: 'grp-security',
    title: 'الأمان والصلاحيات',
    subtitle: 'المستخدمون، كلمات المرور، رمز PIN، سجل العمليات',
    icon: ShieldCheck,
    defaultTab: 'users',
    subTabs: [{ id: 'users', label: 'المستخدمون والصلاحيات' }],
  },
  {
    id: 'grp-system',
    title: 'التقارير والمظهر والنظام',
    subtitle: 'التقارير، التنبيهات، الأداء، معلومات التطبيق والصيانة',
    icon: Sliders,
    defaultTab: 'reports',
    subTabs: [
      { id: 'reports', label: 'التقارير والتصدير' },
      { id: 'appearance', label: 'المظهر والتنبيهات' },
      { id: 'maintenance', label: 'النظام والصيانة' },
    ],
  },
];

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    currencies,
    accounts,
    warehouses,
    invoices,
    products,
    contacts,
    vouchers,
    journalEntries,
    exportDatabaseJson,
    importDatabaseJson,
    radicalFactoryReset,
    showToast,
  } = useAccounting();

  // Active subpage (null means user is looking at the Cards Hub overview)
  const [selectedSection, setSelectedSection] = useState<SettingsTabKey | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grouped' | 'detailed'>('grouped');

  // Android hardware back button returns to cards hub
  useBackHandler({
    isOpen: Boolean(selectedSection),
    onClose: () => setSelectedSection(null),
    stateKey: 'settingsSection',
  });

  // Filter cards by search
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return SETTING_CARDS;
    const q = searchQuery.toLowerCase().trim();
    return SETTING_CARDS.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q) ||
        c.keywords.some((k) => k.includes(q))
    );
  }, [searchQuery]);

  const filteredGroupedCards = useMemo(() => {
    if (!searchQuery.trim()) return GROUPED_CARDS;
    const q = searchQuery.toLowerCase().trim();
    return GROUPED_CARDS.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.subtitle.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const activeCardInfo = useMemo(() => {
    if (!selectedSection) return null;
    return SETTING_CARDS.find((c) => c.id === selectedSection) || SETTING_CARDS[0];
  }, [selectedSection]);

  // Handle opening a card
  const handleOpenSection = (tabKey: SettingsTabKey) => {
    setSelectedSection(tabKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle navigating back to cards hub
  const handleBackToHub = () => {
    setSelectedSection(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If a subpage is opened, render the clean focused dedicated view
  if (selectedSection && activeCardInfo) {
    const Icon = activeCardInfo.icon;
    const currentIndex = SETTING_CARDS.findIndex((c) => c.id === selectedSection);
    const prevSection = currentIndex > 0 ? SETTING_CARDS[currentIndex - 1] : null;
    const nextSection = currentIndex < SETTING_CARDS.length - 1 ? SETTING_CARDS[currentIndex + 1] : null;

    return (
      <div className="space-y-6 pb-20 max-w-5xl mx-auto animate-in fade-in duration-200">
        {/* Top Return & Header Bar */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 p-5 md:p-6 shadow-2xl shadow-amber-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            {/* Back Button */}
            <button
              type="button"
              onClick={handleBackToHub}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 cursor-pointer transition-all active:scale-95 group w-fit"
            >
              <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>العودة لجميع بطاقات الإعدادات</span>
            </button>

            {/* Quick Breadcrumb & Step Indicator */}
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span className="text-amber-400 font-bold">مركز الإعدادات</span>
              <span>/</span>
              <span className="text-white font-bold">{activeCardInfo.title}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 font-bold border border-slate-700 text-[11px]">
                {activeCardInfo.number} من 10
              </span>
            </div>
          </div>

          {/* Subpage Header Title with Icon */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-950 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10 shrink-0">
                <Icon className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-white">
                  {activeCardInfo.title}
                </h1>
                <p className="text-xs md:text-sm text-slate-300 mt-0.5 leading-relaxed">
                  {activeCardInfo.subtitle}
                </p>
              </div>
            </div>

            {/* Fast Next / Prev Navigation */}
            <div className="flex items-center gap-2 shrink-0">
              {prevSection && (
                <button
                  type="button"
                  onClick={() => handleOpenSection(prevSection.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
                  title={prevSection.title}
                >
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline">السابق: {prevSection.title.slice(0, 14)}...</span>
                  <span className="md:hidden">السابق</span>
                </button>
              )}
              {nextSection && (
                <button
                  type="button"
                  onClick={() => handleOpenSection(nextSection.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
                  title={nextSection.title}
                >
                  <span className="hidden md:inline">التالي: {nextSection.title.slice(0, 14)}...</span>
                  <span className="md:hidden">التالي</span>
                  <ChevronLeft className="w-4 h-4 text-amber-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Focused Subpage Tab Content - No Clutter */}
        <div className="bg-slate-950/60 rounded-3xl p-1 md:p-2 border border-slate-800">
          {selectedSection === 'print' && (
            <PrintSettingsTab
              initialSettings={settings.printSettings}
              onSave={(newPrint) => updateSettings({ printSettings: newPrint })}
              showToast={showToast}
            />
          )}

          {selectedSection === 'documents' && (
            <DocumentTemplatesTab
              initialTemplates={settings.documentTemplates}
              onSave={(newTemplates) => updateSettings({ documentTemplates: newTemplates })}
              showToast={showToast}
            />
          )}

          {selectedSection === 'organization' && (
            <OrganizationInfoTab
              settings={settings}
              currencies={currencies}
              onSave={(updates) => updateSettings(updates)}
              showToast={showToast}
            />
          )}

          {selectedSection === 'accounting' && (
            <AccountingSettingsTab
              initialConfig={settings.accountingConfig}
              accounts={accounts}
              onSave={(newAccConfig) => updateSettings({ accountingConfig: newAccConfig })}
              showToast={showToast}
            />
          )}

          {selectedSection === 'inventory' && (
            <InventorySettingsTab
              initialConfig={settings.inventoryConfig}
              warehouses={warehouses}
              onSave={(newInvConfig) => updateSettings({ inventoryConfig: newInvConfig })}
              showToast={showToast}
            />
          )}

          {selectedSection === 'users' && <UsersPermissionsTab showToast={showToast} />}

          {selectedSection === 'backup' && (
            <BackupRestoreTab
              exportDatabaseJson={exportDatabaseJson}
              importDatabaseJson={importDatabaseJson}
              radicalFactoryReset={radicalFactoryReset}
              accounts={accounts}
              invoices={invoices}
              products={products}
              contacts={contacts}
              vouchers={vouchers}
              journalEntries={journalEntries}
              showToast={showToast}
            />
          )}

          {selectedSection === 'reports' && (
            <ReportsSettingsTab
              initialConfig={settings.reportConfig}
              accounts={accounts}
              invoices={invoices}
              products={products}
              contacts={contacts}
              baseCurrency={settings.baseCurrency}
              onSave={(newRepConfig) => updateSettings({ reportConfig: newRepConfig })}
              showToast={showToast}
            />
          )}

          {selectedSection === 'appearance' && (
            <AppearanceNotificationsTab
              initialConfig={settings.appearanceConfig}
              onSave={(newAppConfig) => updateSettings({ appearanceConfig: newAppConfig })}
              showToast={showToast}
            />
          )}

          {selectedSection === 'maintenance' && (
            <SystemMaintenanceTab
              accounts={accounts}
              journalEntries={journalEntries}
              showToast={showToast}
            />
          )}
        </div>

        {/* Bottom Back Button Bar */}
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={handleBackToHub}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-sm border-2 border-amber-500/40 shadow-xl transition-all cursor-pointer active:scale-95"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لجميع بطاقات الإعدادات</span>
          </button>
        </div>
      </div>
    );
  }

  // Cards Hub Overview (Exact Match to User's Screenshot Design)
  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/30 p-6 md:p-8 shadow-2xl shadow-amber-950/20">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-600/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 border border-amber-500/40 text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                مركز إعدادات النظام
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                نظام أوفلاين 100%
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>إعدادات</span>
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                «الغفاري سوفت PRO»
              </span>
            </h1>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl">
              اختر أي بطاقة من القائمة أدناه لفتح شاشة إعداداتها المستقلة وتخصيص الطباعة، الفواتير، بيانات المؤسسة، المحاسبة، والمخزون بدون أي ازدحام.
            </p>
          </div>

          {/* Quick Search Input */}
          <div className="w-full md:w-72 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-amber-400/80 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في الإعدادات..."
                className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-slate-900/90 border border-amber-500/40 focus:border-amber-400 text-xs md:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  مسح
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mode Switcher Toggle: Grouped (كما في الصورة المرفقة) vs Detailed (10 أقسام تفصيلية) */}
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-bold text-slate-300">طريقة عرض البطاقات:</span>
        <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('grouped')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'grouped'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>بطاقات رئيسية مجمعة (كما بالصورة)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('detailed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'detailed'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>بطاقات تفصيلية (10 أقسام)</span>
          </button>
        </div>
      </div>

      {/* Cards List Container - Sleek Pure Black Luxury Look Matching User's Attached Screenshot */}
      <div className="rounded-3xl bg-slate-950 border-2 border-slate-800/90 p-4 md:p-6 shadow-2xl space-y-3">
        {viewMode === 'grouped' ? (
          // Grouped Cards (Exact Replica of the User's Attached Screenshot)
          filteredGroupedCards.map((group) => {
            const Icon = group.icon;

            return (
              <div
                key={group.id}
                className="group w-full flex items-center justify-between p-4 md:p-5 rounded-2xl bg-[#0b0f17] hover:bg-[#111726] border border-slate-800/80 hover:border-amber-500/50 transition-all duration-200 cursor-pointer shadow-md hover:shadow-amber-500/10 active:scale-[0.99]"
                onClick={() => handleOpenSection(group.defaultTab)}
              >
                {/* Left: Chevron Arrow */}
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 group-hover:text-amber-400 group-hover:-translate-x-1 transition-all shrink-0">
                  <ChevronLeft className="w-5 h-5" />
                </div>

                {/* Middle: Title & Subtitle */}
                <div className="flex-1 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <h3 className="text-white font-black text-base md:text-lg group-hover:text-amber-300 transition-colors">
                      {group.title}
                    </h3>
                  </div>
                  <p className="text-slate-400 text-xs md:text-sm mt-1 leading-relaxed">
                    {group.subtitle}
                  </p>

                  {/* Sub-tabs quick buttons if group contains multiple */}
                  {group.subTabs.length > 1 && (
                    <div className="flex flex-wrap items-center justify-end gap-1.5 mt-2.5 pt-2 border-t border-slate-800/60">
                      {group.subTabs.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenSection(st.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 text-[11px] font-bold border border-slate-800 transition-colors"
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Golden Icon Box */}
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-slate-900 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:border-amber-400 group-hover:bg-slate-800 group-hover:shadow-lg group-hover:shadow-amber-500/20 transition-all shrink-0">
                  <Icon className="w-7 h-7 text-amber-400" />
                </div>
              </div>
            );
          })
        ) : (
          // Detailed Cards (10 Distinct Cards with Individual Access)
          filteredCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.id}
                onClick={() => handleOpenSection(card.id)}
                className="group w-full flex items-center justify-between p-4 md:p-5 rounded-2xl bg-[#0b0f17] hover:bg-[#111726] border border-slate-800/80 hover:border-amber-500/50 transition-all duration-200 cursor-pointer shadow-md hover:shadow-amber-500/10 active:scale-[0.99]"
              >
                {/* Left: Chevron Arrow */}
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 group-hover:text-amber-400 group-hover:-translate-x-1 transition-all shrink-0">
                  <ChevronLeft className="w-5 h-5" />
                </div>

                {/* Middle: Title & Subtitle */}
                <div className="flex-1 px-4 text-right">
                  <div className="flex items-center justify-end gap-2.5">
                    {card.badge && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                        {card.badge}
                      </span>
                    )}
                    <h3 className="text-white font-black text-base md:text-lg group-hover:text-amber-300 transition-colors">
                      {card.title}
                    </h3>
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-slate-400 text-[11px] font-mono flex items-center justify-center border border-slate-800">
                      {card.number}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs md:text-sm mt-1 leading-relaxed">
                    {card.subtitle}
                  </p>
                </div>

                {/* Right: Golden Icon Box */}
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-slate-900 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:border-amber-400 group-hover:bg-slate-800 group-hover:shadow-lg group-hover:shadow-amber-500/20 transition-all shrink-0">
                  <Icon className="w-7 h-7 text-amber-400" />
                </div>
              </div>
            );
          })
        )}

        {/* Empty Search State */}
        {((viewMode === 'grouped' && filteredGroupedCards.length === 0) ||
          (viewMode === 'detailed' && filteredCards.length === 0)) && (
          <div className="p-8 text-center space-y-3">
            <p className="text-sm font-bold text-slate-400">لا توجد بطاقات تطابق بحثك: &quot;{searchQuery}&quot;</p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              عرض جميع البطاقات
            </button>
          </div>
        )}
      </div>

      {/* Footer Info Notice */}
      <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400/60" />
        <span>جميع الإعدادات يتم حفظها محلياً وبشكل دائم وفوري دون الحاجة إلى اتصال بالإنترنت</span>
      </div>
    </div>
  );
};
