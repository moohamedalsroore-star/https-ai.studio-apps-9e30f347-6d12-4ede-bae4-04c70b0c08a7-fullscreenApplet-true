import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  Receipt,
  Calendar,
  Package,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Plus,
  ArrowRight,
  Clock,
  Coins,
  X,
  Sparkles,
  AlertCircle,
  Truck,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Invoice } from '../types/accounting';

export interface CustomReminder {
  id: string;
  title: string;
  category: 'APPOINTMENT' | 'COLLECTION' | 'TAX' | 'SUPPLIER' | 'GENERAL';
  dueDate: string;
  priority: 'CRITICAL' | 'IMPORTANT' | 'NORMAL';
  notes?: string;
  isCompleted?: boolean;
}

interface SmartNotificationsBoardProps {
  onNavigateView?: (view: string) => void;
}

const STORAGE_KEY_REMINDERS = 'ghafari_smart_reminders';
const STORAGE_KEY_DISMISSED = 'ghafari_dismissed_alerts';

export const SmartNotificationsBoard: React.FC<SmartNotificationsBoardProps> = ({
  onNavigateView,
}) => {
  const {
    products,
    contacts,
    invoices,
    settings,
    setActiveView,
  } = useAccounting();

  const handleNavigate = (view: string) => {
    if (onNavigateView) {
      onNavigateView(view);
    } else {
      setActiveView(view);
    }
  };

  const [activeTab, setActiveTab] = useState<'ALL' | 'INVENTORY' | 'INVOICES' | 'REMINDERS'>('ALL');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [customReminders, setCustomReminders] = useState<CustomReminder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REMINDERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Initial dynamic scheduled tasks
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    return [
      {
        id: 'rem-tax-vat',
        title: 'موعد تقديم إقرار ضريبة القيمة المضافة ومطابقة الفواتير',
        category: 'TAX',
        dueDate: endOfMonth,
        priority: 'CRITICAL',
        notes: 'مراجعة إجمالي الضريبة المحصلة والضريبة المدفوعة في المشتريات لتجهيز الإقرار',
        isCompleted: false,
      },
      {
        id: 'rem-stock-audit',
        title: 'الجرد الدوري لمطابقة المخزون الفعلي مع رصيد النظام',
        category: 'APPOINTMENT',
        dueDate: nextWeek,
        priority: 'IMPORTANT',
        notes: 'جرد المستودع الرئيسي وصندوق مبيعات الكاشير للتأكد من انعدام الفروقات',
        isCompleted: false,
      },
    ];
  });

  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DISMISSED);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CustomReminder['category']>('APPOINTMENT');
  const [newDueDate, setNewDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newPriority, setNewPriority] = useState<CustomReminder['priority']>('IMPORTANT');
  const [newNotes, setNewNotes] = useState('');

  // Persist custom reminders
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(customReminders));
    } catch {}
  }, [customReminders]);

  // Persist dismissed alerts
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DISMISSED, JSON.stringify(dismissedAlertIds));
    } catch {}
  }, [dismissedAlertIds]);

  // 1. Compute Inventory Alerts (نواقص المخزون)
  const inventoryAlerts = products
    .filter((p) => (p.stockQty <= p.minStockAlert || p.stockQty <= 0) && !dismissedAlertIds.includes(`inv-${p.id}`))
    .map((p) => {
      const isOut = p.stockQty <= 0;
      return {
        id: `inv-${p.id}`,
        type: 'INVENTORY' as const,
        priority: isOut ? ('CRITICAL' as const) : ('IMPORTANT' as const),
        title: isOut ? `نفاد تام من المخزون: ${p.nameAr}` : `انخفاض المخزون عن الحد الأدنى: ${p.nameAr}`,
        subtitle: `كود: ${p.code} | الرصيد الحالي: ${p.stockQty} ${p.unit} (الحد الأدنى: ${p.minStockAlert} ${p.unit})`,
        actionLabel: 'طلب توريد ومشتريات',
        actionView: 'purchases',
        icon: isOut ? AlertCircle : AlertTriangle,
        colorClass: isOut ? 'text-rose-400 bg-rose-500/15 border-rose-500/40' : 'text-amber-400 bg-amber-500/15 border-amber-500/40',
        badge: isOut ? 'نفاد تام (0)' : 'حد إعادة الطلب',
      };
    });

  // 2. Compute Invoice Due & Overdue Alerts (فواتير مستحقة ومواعيد التحصيل)
  const unpaidInvoices = invoices
    .filter((inv: Invoice) => inv.type === 'SALES' && inv.status !== 'PAID' && !dismissedAlertIds.includes(`inv-due-${inv.id}`))
    .map((inv: Invoice) => ({
      id: `inv-due-${inv.id}`,
      type: 'INVOICES' as const,
      priority: 'CRITICAL' as const,
      title: `فاتورة مبيعات آجلة مستحقة السداد: ${inv.invoiceNumber}`,
      subtitle: `العميل: ${inv.partyName} | المتبقي للتحصيل: ${inv.grandTotal.toFixed(2)} ${settings.baseCurrency}`,
      actionLabel: 'تحصيل وسند قبض',
      actionView: 'vouchers',
      icon: Receipt,
      colorClass: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/40',
      badge: 'مستحقة التحصيل',
    }));

  // Debtors with high balances
  const customersWithDebt = contacts
    .filter((c) => c.type === 'CUSTOMER' && c.balance > 0 && !dismissedAlertIds.includes(`debt-${c.id}`))
    .slice(0, 3)
    .map((c) => ({
      id: `debt-${c.id}`,
      type: 'INVOICES' as const,
      priority: 'IMPORTANT' as const,
      title: `مستحقات ذمة مدينة على العميل: ${c.name}`,
      subtitle: `إجمالي المديونية المستحقة: ${c.balance.toFixed(2)} ${settings.baseCurrency} | هاتف: ${c.phone || 'غير مسجل'}`,
      actionLabel: 'كشف حساب العميل',
      actionView: 'contacts',
      icon: Coins,
      colorClass: 'text-amber-300 bg-amber-500/15 border-amber-500/40',
      badge: 'ذمة مدينة',
    }));

  const invoiceAlerts = [...unpaidInvoices, ...customersWithDebt];

  // 3. Compute Scheduled & Custom Reminders (تذكيرات المواعيد والالتزامات)
  const activeCustomReminders = customReminders
    .filter((r) => !r.isCompleted && !dismissedAlertIds.includes(`rem-${r.id}`))
    .map((r) => ({
      id: `rem-${r.id}`,
      originalId: r.id,
      type: 'REMINDERS' as const,
      priority: r.priority,
      title: r.title,
      subtitle: `الموعد المحدد: ${r.dueDate} ${r.notes ? `| ${r.notes}` : ''}`,
      actionLabel: r.category === 'TAX' ? 'التقارير المالية' : r.category === 'COLLECTION' ? 'سندات القبض' : 'عرض التفاصيل',
      actionView: r.category === 'TAX' ? 'reports' : r.category === 'COLLECTION' ? 'vouchers' : 'dashboard',
      icon: Calendar,
      colorClass:
        r.priority === 'CRITICAL'
          ? 'text-rose-400 bg-rose-500/15 border-rose-500/40'
          : r.priority === 'IMPORTANT'
          ? 'text-[#00C8FF] bg-blue-500/15 border-blue-500/40'
          : 'text-emerald-300 bg-emerald-500/15 border-emerald-500/40',
      badge: r.category === 'TAX' ? 'ضريبة ومطابقة' : r.category === 'COLLECTION' ? 'تحصيل مالي' : 'موعد مجدول',
    }));

  // Combined Alerts List
  const allAlerts = [...inventoryAlerts, ...invoiceAlerts, ...activeCustomReminders];

  const displayedAlerts =
    activeTab === 'ALL'
      ? allAlerts
      : activeTab === 'INVENTORY'
      ? inventoryAlerts
      : activeTab === 'INVOICES'
      ? invoiceAlerts
      : activeCustomReminders;

  // Handlers
  const handleDismissAlert = (alertId: string, originalReminderId?: string) => {
    setDismissedAlertIds((prev) => [...prev, alertId]);
    if (originalReminderId) {
      setCustomReminders((prev) =>
        prev.map((r) => (r.id === originalReminderId ? { ...r, isCompleted: true } : r))
      );
    }
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newReminder: CustomReminder = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      dueDate: newDueDate,
      priority: newPriority,
      notes: newNotes.trim() || undefined,
      isCompleted: false,
    };

    setCustomReminders((prev) => [newReminder, ...prev]);
    setNewTitle('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const criticalCount = allAlerts.filter((a) => a.priority === 'CRITICAL').length;

  return (
    <div className="rounded-3xl bg-[#040C2E]/90 border border-blue-500/30 shadow-[0_0_25px_rgba(7,91,255,0.15)] backdrop-blur-md overflow-hidden transition-all duration-300">
      {/* Board Header Bar */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-blue-500/20 bg-gradient-to-r from-[#030922]/90 via-[#07133D]/90 to-[#030922]/90">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-[#075BFF] to-[#00C8FF] flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,200,255,0.5)] border border-cyan-300/40 shrink-0">
            <Bell className="w-5 h-5 animate-bounce-slow" />
            {allAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-black flex items-center justify-center shadow-lg border-2 border-[#020617] animate-pulse">
                {allAlerts.length}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-white text-base sm:text-lg flex items-center gap-2">
                <span>لوحة الإشعارات والتنبيهات الذكية</span>
                <span className="px-2 py-0.5 rounded-full bg-[#00C8FF]/15 text-[#00C8FF] border border-[#00C8FF]/30 text-[10px] font-mono">
                  Smart Live Alerts
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              مراقبة آلية مباشرة لنواقص المخزون، الفواتير والذمم المستحقة، وتذكيرات المواعيد والالتزامات
            </p>
          </div>
        </div>

        {/* Action Controls & Collapsible Toggle */}
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{criticalCount} تنبيهات حرجة</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#075BFF] to-[#00C8FF] hover:from-[#1A6BFF] hover:to-[#1AC8FF] text-white text-xs font-bold shadow-[0_0_15px_rgba(0,200,255,0.3)] border border-cyan-400/50 cursor-pointer transition-all active:scale-95"
            title="إضافة تذكير موعد أو التزام جديد"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة تذكير موعد</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-2 rounded-xl bg-[#09153a] hover:bg-[#12245e] text-slate-300 hover:text-white border border-blue-500/20 cursor-pointer transition-colors"
            title={isExpanded ? 'طي اللوحة' : 'توسيع اللوحة'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content View */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Filter Categories Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-blue-500/20 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ALL'
                  ? 'bg-gradient-to-r from-[#075BFF] to-[#00C8FF] text-white shadow-[0_0_12px_rgba(0,200,255,0.4)] border border-cyan-300/40'
                  : 'bg-[#09153a] text-slate-300 hover:text-white border border-blue-500/20'
              }`}
            >
              <span>جميع التنبيهات</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono text-[10px]">
                {allAlerts.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('INVENTORY')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'INVENTORY'
                  ? 'bg-amber-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)] border border-amber-400/40'
                  : 'bg-[#09153a] text-slate-300 hover:text-white border border-blue-500/20'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-amber-300" />
              <span>نواقص المخزون</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono text-[10px]">
                {inventoryAlerts.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('INVOICES')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'INVOICES'
                  ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)] border border-cyan-400/40'
                  : 'bg-[#09153a] text-slate-300 hover:text-white border border-blue-500/20'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-cyan-200" />
              <span>فواتير ومستحقات</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono text-[10px]">
                {invoiceAlerts.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('REMINDERS')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'REMINDERS'
                  ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.4)] border border-purple-400/40'
                  : 'bg-[#09153a] text-slate-300 hover:text-white border border-blue-500/20'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-purple-200" />
              <span>مواعيد وتذكيرات</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono text-[10px]">
                {activeCustomReminders.length}
              </span>
            </button>
          </div>

          {/* Alerts Cards List */}
          {displayedAlerts.length === 0 ? (
            <div className="py-8 text-center bg-[#020824]/60 rounded-2xl border border-blue-500/20 p-6 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-[#00D99A] flex items-center justify-center border border-emerald-500/30 mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm">لا توجد تنبيهات نشطة حالياً في هذا القسم</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                المخزون متوفر بالكامل، لا توجد فواتير متأخرة، وكافة المواعيد المحاسبية تم جدولتها بنجاح.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {displayedAlerts.map((alert) => {
                const IconComponent = alert.icon;
                return (
                  <div
                    key={alert.id}
                    className="p-3.5 rounded-2xl bg-[#030922]/90 border border-blue-500/25 hover:border-[#00C8FF]/50 transition-all shadow-md flex flex-col justify-between gap-3 group relative overflow-hidden"
                  >
                    {/* Top Row: Icon + Badge + Dismiss */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${alert.colorClass}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${alert.colorClass}`}>
                          {alert.badge}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDismissAlert(alert.id, (alert as any).originalId)}
                        className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/80 cursor-pointer transition-colors"
                        title="إخفاء هذا التنبيه / تمت المعالجة"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Middle Info */}
                    <div>
                      <h4 className="font-bold text-white text-xs leading-relaxed group-hover:text-cyan-200 transition-colors">
                        {alert.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-normal">
                        {alert.subtitle}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 border-t border-blue-500/20 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleNavigate(alert.actionView)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00C8FF] hover:text-white transition-colors cursor-pointer group-hover:translate-x-[-2px]"
                      >
                        <span>{alert.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {alert.priority === 'CRITICAL' && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Custom Appointment / Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#040C2E] border border-blue-500/40 shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-blue-500/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#075BFF] to-[#00C8FF] flex items-center justify-center text-white shadow-md">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">إضافة تذكير موعد أو التزام مالي</h3>
                  <p className="text-[11px] text-slate-400">جدولة تنبيه ذكي يظهر مباشرة في لوحة الإشعارات</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">عنوان التذكير أو الموعد:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: موعد استلام شيك من العميل، موعد لقاء المورد، تجديد السجل..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#030922] border border-blue-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8FF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">التصنيف:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#030922] border border-blue-500/30 rounded-xl text-white focus:outline-none focus:border-[#00C8FF]"
                  >
                    <option value="APPOINTMENT">📅 موعد / مقابلة عمل</option>
                    <option value="COLLECTION">💵 تحصيل مالي / شيكات</option>
                    <option value="TAX">📊 التزام ضريبي ومحاسبي</option>
                    <option value="SUPPLIER">🚚 موعد توريد وموردين</option>
                    <option value="GENERAL">📌 مهمة عامة</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">الموعد المستهدف:</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#030922] border border-blue-500/30 rounded-xl text-white focus:outline-none focus:border-[#00C8FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">مستوى الأهمية والأولوية:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPriority('CRITICAL')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                      newPriority === 'CRITICAL'
                        ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/30'
                        : 'bg-[#030922] text-slate-400 border-slate-700'
                    }`}
                  >
                    🔴 عاجل وحرج
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewPriority('IMPORTANT')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                      newPriority === 'IMPORTANT'
                        ? 'bg-[#075BFF] text-white border-cyan-400 shadow-md shadow-blue-600/30'
                        : 'bg-[#030922] text-slate-400 border-slate-700'
                    }`}
                  >
                    🔵 مهم
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewPriority('NORMAL')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                      newPriority === 'NORMAL'
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
                        : 'bg-[#030922] text-slate-400 border-slate-700'
                    }`}
                  >
                    🟢 عادي
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">ملاحظات إضافية (اختياري):</label>
                <textarea
                  rows={2}
                  placeholder="أي تفاصيل خاصة برقم الهاتف، المكان، أو المستندات المطلوبة..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#030922] border border-blue-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8FF]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer font-bold"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  حفظ وتفعيل التنبيه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
