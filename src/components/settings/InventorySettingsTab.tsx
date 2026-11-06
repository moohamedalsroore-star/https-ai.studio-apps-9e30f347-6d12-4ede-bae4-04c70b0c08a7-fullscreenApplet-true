import React, { useState } from 'react';
import {
  Boxes,
  Warehouse as WarehouseIcon,
  AlertTriangle,
  CheckCircle2,
  Save,
  RotateCcw,
  ShieldAlert,
  Sliders,
  DollarSign,
} from 'lucide-react';
import { Warehouse } from '../../types/accounting';
import { InventorySettings, InventoryCostingMethod, OutOfStockPolicy } from '../../types/settings';
import { DEFAULT_INVENTORY_CONFIG } from '../../utils/settingsDefaults';

interface InventorySettingsTabProps {
  initialConfig?: InventorySettings;
  warehouses: Warehouse[];
  onSave: (config: InventorySettings) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const InventorySettingsTab: React.FC<InventorySettingsTabProps> = ({
  initialConfig = DEFAULT_INVENTORY_CONFIG,
  warehouses,
  onSave,
  showToast,
}) => {
  const [form, setForm] = useState<InventorySettings>({
    ...DEFAULT_INVENTORY_CONFIG,
    ...initialConfig,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setSavedSuccess(true);
    showToast('تم حفظ إعدادات وسياسات المخزون بنجاح ✓', 'success');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    setForm(DEFAULT_INVENTORY_CONFIG);
    showToast('تمت استعادة إعدادات المخزون الافتراضية', 'info');
  };

  const costingMethods: { id: InventoryCostingMethod; label: string; desc: string }[] = [
    {
      id: 'WEIGHTED_AVERAGE',
      label: 'المتوسط المرجح للتكلفة (Weighted Average)',
      desc: 'المعيار المحاسبي الدولي الموصى به: يعيد احتساب تكلفة الوحدة تلقائياً مع كل فاتورة مشتريات جديدة.',
    },
    {
      id: 'FIFO',
      label: 'الوارد أولاً يصرف أولاً (FIFO)',
      desc: 'تقييم الأصناف الخارجة بناءً على أقدم أسعار شراء مسجلة في المستودع.',
    },
    {
      id: 'LATEST_PURCHASE',
      label: 'آخر سعر شراء (Latest Purchase Price)',
      desc: 'يعتمد سعر آخر فاتورة توريد لحساب تكلفة البضاعة المباعة وهوامش الربح.',
    },
  ];

  const outOfStockPolicies: { id: OutOfStockPolicy; label: string; desc: string; icon: any }[] = [
    {
      id: 'ALLOW_WITH_WARNING',
      label: 'السماح بالبيع بالسالب مع إظهار تحذير (مرن)',
      desc: 'يسمح للكاشير بإتمام الفاتورة حتى لو كان المخزون 0 مع تنبيهه لمتابعة التوريد، وهو الأنسب للمحلات السريعة.',
      icon: AlertTriangle,
    },
    {
      id: 'PREVENT_SALE',
      label: 'منع البيع نهائياً عند نفاد الكمية (حازم ومقفل)',
      desc: 'يمنع إصدار أي فاتورة بيع لصنف رصيده صفر أو غير كافٍ حتى يتم توريده للمخزن أولاً.',
      icon: ShieldAlert,
    },
    {
      id: 'ALLOW_SILENTLY',
      label: 'السماح بالبيع المفتوح دون تنبيه',
      desc: 'مناسب لشركات الخدمات والمطاعم والأعمال التي تصنع المنتجات فورياً عند الطلب.',
      icon: CheckCircle2,
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-right animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-amber-400" />
            إعدادات المخزون والمستودعات والتسعير
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            تحديد المستودع الافتراضي، طرق تقييم التكلفة، حدود المخزون المنخفض، وسياسات البيع
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>تم حفظ وتفعيل سياسات المخزون وتطبيقها فوراً في الفواتير ونقاط البيع!</span>
        </div>
      )}

      {/* 1. Default Warehouse & Threshold */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="text-xs font-black text-amber-300">المستودع الافتراضي وحدود التنبيه</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              المستودع الافتراضي لإنشاء الفواتير ونقاط البيع
            </label>
            <select
              value={form.defaultWarehouseId}
              onChange={(e) => setForm({ ...form, defaultWarehouseId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-500"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.code} - {w.nameAr} {w.isMain ? '(المستودع الرئيسي)' : ''}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-500 mt-1 block">
              يتم سحب وإضافة البضاعة من هذا المستودع تلقائياً عند إنشاء الفواتير
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              حد التنبيه الافتراضي للمخزون المنخفض (قطع / وحدات)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={form.defaultLowStockThreshold}
                onChange={(e) => setForm({ ...form, defaultLowStockThreshold: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
              />
              <span className="text-xs text-slate-400 shrink-0">وحدة</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              عند وصول كمية أي صنف لهذا الحد أو أقل، يتم إدراجه في قائمة التنبيهات الفورية
            </span>
          </div>
        </div>

        <div className="pt-1">
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:border-slate-700 w-fit">
            <input
              type="checkbox"
              checked={form.enableStockAlerts}
              onChange={(e) => setForm({ ...form, enableStockAlerts: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span className="text-xs font-bold text-white">إظهار شارة وعداد الأصناف المنخفضة في لوحة التحكم والشريط العلوي</span>
          </label>
        </div>
      </div>

      {/* 2. Costing & Valuation Methods */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-amber-300">
          طريقة تسعير وتقييم المخزون المحاسبي (Inventory Valuation Method):
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {costingMethods.map((m) => (
            <div
              key={m.id}
              onClick={() => setForm({ ...form, costingMethod: m.id })}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                form.costingMethod === m.id
                  ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-950/50 ring-1 ring-amber-500/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-white">{m.label}</span>
                  {form.costingMethod === m.id && (
                    <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-black">
                      مفعل ✓
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Out of Stock Sale Policy */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-amber-300">
          سياسة وإجراءات البيع عند نفاد الكمية (Out of Stock Policy):
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {outOfStockPolicies.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                onClick={() => setForm({ ...form, outOfStockPolicy: p.id })}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  form.outOfStockPolicy === p.id
                    ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-950/50 ring-1 ring-amber-500/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-xs text-white">{p.label}</span>
                    </div>
                    {form.outOfStockPolicy === p.id && (
                      <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-black">
                        محدد ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            );
          })}
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
          <span>استعادة الإعدادات الافتراضية للمخزون</span>
        </button>

        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-600/20 cursor-pointer transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>حفظ إعدادات المخزون</span>
        </button>
      </div>
    </form>
  );
};
