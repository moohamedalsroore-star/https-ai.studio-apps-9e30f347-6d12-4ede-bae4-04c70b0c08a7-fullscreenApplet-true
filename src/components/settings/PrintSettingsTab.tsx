import React, { useState } from 'react';
import {
  Printer,
  FileText,
  Sliders,
  CheckCircle2,
  RotateCcw,
  Save,
  Eye,
  FileDown,
  Layout,
  Type,
  Maximize2,
  Copy,
} from 'lucide-react';
import { PrintSettings, PaperSize, PageOrientation, MarginSize, PrintFontSize } from '../../types/settings';
import { DEFAULT_PRINT_SETTINGS } from '../../utils/settingsDefaults';

interface PrintSettingsTabProps {
  initialSettings?: PrintSettings;
  onSave: (settings: PrintSettings) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const PrintSettingsTab: React.FC<PrintSettingsTabProps> = ({
  initialSettings = DEFAULT_PRINT_SETTINGS,
  onSave,
  showToast,
}) => {
  const [form, setForm] = useState<PrintSettings>({
    ...DEFAULT_PRINT_SETTINGS,
    ...initialSettings,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setSavedSuccess(true);
    showToast('تم حفظ إعدادات الطباعة بنجاح وتطبيقها على جميع المستندات ✓', 'success');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    setForm(DEFAULT_PRINT_SETTINGS);
    showToast('تمت استعادة إعدادات الطباعة الافتراضية بنجاح', 'info');
  };

  const paperSizes: { id: PaperSize; label: string; desc: string }[] = [
    { id: 'A4', label: 'ورق A4 قياسي', desc: 'الحجم المعتمد للفواتير الكاملة والتقارير المالية الرسمية (210×297 مم)' },
    { id: 'A5', label: 'ورق A5 نصف صفحة', desc: 'مناسب لسندات القبض والصرف وفواتير المبيعات المختصرة (148×210 مم)' },
    { id: 'THERMAL_80MM', label: 'إيصال حراري 80 مم', desc: 'طابعات نقاط البيع (POS) والكاشير والمطاعم مع قص آلي' },
    { id: 'THERMAL_58MM', label: 'إيصال حراري 58 مم', desc: 'الطابعات الحرارية الصغيرة المحمولة وطابعات البلوتوث الميدانية' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-right animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            إعدادات الطباعة وهوامش المستندات
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            تخصيص مقاسات الورق، الطابعات، الإيصالات الحرارية، الهوامش، وخطوط الطباعة المعتمدة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTestModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-cyan-500/30 text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>معاينة نموذج طباعة</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>تم حفظ إعدادات الطباعة بنجاح وتطبيقها على كافة فواتير وسندات النظام!</span>
        </div>
      )}

      {/* 1. Paper Size Selector */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-amber-300">
          حجم ومقاس ورق الطباعة الافتراضي:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {paperSizes.map((item) => (
            <div
              key={item.id}
              onClick={() => setForm({ ...form, paperSize: item.id })}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                form.paperSize === item.id
                  ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-950/50 ring-1 ring-amber-500/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  form.paperSize === item.id
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{item.label}</span>
                  {form.paperSize === item.id && (
                    <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-black">
                      محدد ✓
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Orientation & Margins */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2">اتجاه الصفحة (Orientation)</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, orientation: 'PORTRAIT' })}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                form.orientation === 'PORTRAIT'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              عمودي (Portrait)
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, orientation: 'LANDSCAPE' })}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                form.orientation === 'LANDSCAPE'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              أفقي (Landscape)
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2">هوامش الصفحة (Margins)</label>
          <select
            value={form.margin}
            onChange={(e) => setForm({ ...form, margin: e.target.value as MarginSize })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
          >
            <option value="NONE">بدون هوامش (0 مم - لطباعة الإيصالات)</option>
            <option value="NARROW">هوامش ضيقة (5 مم)</option>
            <option value="NORMAL">هوامش عادية (10 مم - موصى به)</option>
            <option value="WIDE">هوامش عريضة (15 مم)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2">حجم خط النصوص والأرقام</label>
          <select
            value={form.fontSize}
            onChange={(e) => setForm({ ...form, fontSize: e.target.value as PrintFontSize })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
          >
            <option value="SMALL">صغير (9pt - للمستندات الكثيفة)</option>
            <option value="MEDIUM">متوسط (11pt - متوازن وواضح)</option>
            <option value="LARGE">كبير (13pt - لأعلى وضوح وقراءة)</option>
          </select>
        </div>
      </div>

      {/* 3. Printing Options & Behaviors */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="text-xs font-black text-amber-300">خيارات وسلوكيات الطباعة المتقدمة</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={form.showLogo}
              onChange={(e) => setForm({ ...form, showLogo: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span className="text-xs font-bold text-slate-200">طباعة شعار المؤسسة في الترويسة</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={form.autoShowPreview}
              onChange={(e) => setForm({ ...form, autoShowPreview: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span className="text-xs font-bold text-slate-200">فتح معاينة الشاشة تلقائياً قبل الإصدار</span>
          </label>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <span className="text-xs font-bold text-slate-300">عدد النسخ الافتراضية:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, copiesCount: Math.max(1, form.copiesCount - 1) })}
                className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center cursor-pointer"
              >
                -
              </button>
              <span className="font-mono-num font-black text-amber-400 text-sm px-1">
                {form.copiesCount}
              </span>
              <button
                type="button"
                onClick={() => setForm({ ...form, copiesCount: Math.min(5, form.copiesCount + 1) })}
                className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              اسم الطابعة الافتراضية المفضلة (اختياري)
            </label>
            <input
              type="text"
              value={form.printerName}
              onChange={(e) => setForm({ ...form, printerName: e.target.value })}
              placeholder="مثال: EPSON TM-T20III أو طابعة المكتب"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              💡 يفتح النظام مربع الطباعة المباشر أو المحاكي المتوافق مع هاتفك ونظام التشغيل
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              الإجراء السريع الافتراضي عند الضغط على أيقونة المستند
            </label>
            <select
              value={form.defaultAction}
              onChange={(e) => setForm({ ...form, defaultAction: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
            >
              <option value="PDF_DOWNLOAD">تنزيل ملف PDF وحفظه مباشرة بالجهاز</option>
              <option value="PREVIEW">فتح شاشة المعاينة التفاعلية مع خيارات التكبير</option>
              <option value="PRINT">طباعة فورية عبر الطابعة المتصلة</option>
            </select>
          </div>
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
          <span>استعادة الإعدادات الافتراضية</span>
        </button>

        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-600/20 cursor-pointer transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>حفظ إعدادات الطباعة</span>
        </button>
      </div>

      {/* Test Sample Print Preview Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-400" />
                معاينة نموذج الفاتورة حسب الإعدادات الحالية
              </h4>
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-white text-slate-950 rounded-2xl text-xs space-y-3 font-mono">
              <div className="text-center border-b pb-2">
                <div className="font-black text-sm">الغفاري سوفت برو - تجربة طباعة</div>
                <div className="text-[10px] text-slate-600">المقاس: {form.paperSize} | الاتجاه: {form.orientation}</div>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>رقم النموذج: #TEST-2026</span>
                <span>التاريخ: {new Date().toISOString().split('T')[0]}</span>
              </div>
              <table className="w-full text-right border-collapse text-[11px]">
                <thead>
                  <tr className="border-b bg-slate-100">
                    <th className="p-1">الصنف</th>
                    <th className="p-1 text-center">الكمية</th>
                    <th className="p-1 text-left">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-1">صنف تجريبي رقم 1</td>
                    <td className="p-1 text-center">2</td>
                    <td className="p-1 text-left">100.00 ر.س</td>
                  </tr>
                </tbody>
              </table>
              <div className="text-left font-bold text-sm pt-1 border-t">
                الصافي: 115.00 ر.س (شامل الضريبة)
              </div>
              <div className="text-center text-[10px] text-slate-500 pt-2 border-t">
                {form.footerNote}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
              >
                طباعة تجريبية
              </button>
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
