import React, { useState } from 'react';
import {
  Palette,
  Bell,
  Moon,
  Sun,
  Type,
  Calendar,
  Volume2,
  VolumeX,
  AlertCircle,
  CheckCircle2,
  Save,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { AppearanceAndNotificationsSettings, ThemeMode, AppFontSize, DateFormat } from '../../types/settings';
import { DEFAULT_APPEARANCE_CONFIG } from '../../utils/settingsDefaults';

interface AppearanceNotificationsTabProps {
  initialConfig?: AppearanceAndNotificationsSettings;
  onSave: (config: AppearanceAndNotificationsSettings) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AppearanceNotificationsTab: React.FC<AppearanceNotificationsTabProps> = ({
  initialConfig = DEFAULT_APPEARANCE_CONFIG,
  onSave,
  showToast,
}) => {
  const [form, setForm] = useState<AppearanceAndNotificationsSettings>({
    ...DEFAULT_APPEARANCE_CONFIG,
    ...initialConfig,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setSavedSuccess(true);
    showToast('تم حفظ إعدادات المظهر والتنبيهات بنجاح وتطبيقها فوراً ✓', 'success');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    setForm(DEFAULT_APPEARANCE_CONFIG);
    showToast('تمت استعادة إعدادات المظهر والتنبيهات الافتراضية', 'info');
  };

  // Sound test
  const playSampleSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
      showToast('تم تجربة صوت إشعار الكاشير بنجاح 🔔', 'info');
    } catch {
      showToast('ميزة الصوت مدعومة عند تفاعل المستخدم', 'info');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-right animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-400" />
            إعدادات المظهر الفاخر والتنبيهات المحلية
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            تخصيص ثيم الألوان الملكي، حجم الخطوط، تنسيقات التواريخ، وتنبيهات الديون المتأخرة
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>تم حفظ وتطبيق خيارات المظهر والتنبيهات بنجاح!</span>
        </div>
      )}

      {/* 1. Theme Mode: Black & Gold vs Classic Light */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-amber-300">
          نمط وثيم المظهر العام للتطبيق (Theme):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => setForm({ ...form, themeMode: 'DARK_GOLD' })}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
              form.themeMode === 'DARK_GOLD'
                ? 'bg-gradient-to-r from-slate-950 via-amber-950/30 to-slate-900 border-amber-500/60 shadow-xl shadow-amber-950/40 ring-1 ring-amber-500/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-white">الوضع الليلي الفاخر (الأسود والذهبي الملكي)</span>
                {form.themeMode === 'DARK_GOLD' && (
                  <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-black">
                    مفعل ✓
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                التصميم الرسمي الفاخر للغفاري سوفت PRO بخلفيات داكنة عميقة مريحة للعين مع لمسات وإطارات ذهبية راقية.
              </p>
            </div>
          </div>

          <div
            onClick={() => setForm({ ...form, themeMode: 'LIGHT' })}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
              form.themeMode === 'LIGHT'
                ? 'bg-slate-800 border-amber-500/60 shadow-xl ring-1 ring-amber-500/50 text-white'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-700 text-slate-300 flex items-center justify-center shrink-0">
              <Sun className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">الوضع النهاري الكلاسيكي</span>
                {form.themeMode === 'LIGHT' && (
                  <span className="text-[10px] bg-slate-300 text-slate-950 px-2 py-0.5 rounded-full font-black">
                    محدد ✓
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                مظهر فاتح عالي التباين مناسب للاستخدام في الأماكن المفتوحة وتحت أشعة الشمس.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Font Size & Date Format */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="text-xs font-black text-amber-300">أحجام الخطوط وتنسيقات التواريخ والأرقام</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              حجم خط واجهة التطبيق والشاشات
            </label>
            <select
              value={form.fontSize}
              onChange={(e) => setForm({ ...form, fontSize: e.target.value as AppFontSize })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
            >
              <option value="NORMAL">حجم عادي قياسي (موصى به للشاشات العادية)</option>
              <option value="LARGE">حجم كبير (+15% لأعلى وضوح وسهولة قراءة)</option>
              <option value="XLARGE">حجم ضخم (+30% ملائم لشاشات اللمس واللوحيات)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              تنسيق عرض التواريخ في الفواتير والسندات
            </label>
            <select
              value={form.dateFormat}
              onChange={(e) => setForm({ ...form, dateFormat: e.target.value as DateFormat })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
            >
              <option value="YYYY-MM-DD">سنة-شهر-يوم (مثال: 2026-10-29 - القياسي الدولي)</option>
              <option value="DD/MM/YYYY">يوم/شهر/سنة (مثال: 29/10/2026 - الكلاسيكي العربي)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Debt & Stock Notifications & Sound */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-black text-white">التنبيهات المحلية الذكية والمؤثرات الصوتية</h4>
          </div>
          <button
            type="button"
            onClick={playSampleSound}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>تجربة صوت الكاشير</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={form.enableSoundEffects}
              onChange={(e) => setForm({ ...form, enableSoundEffects: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span className="text-xs font-bold text-slate-200">تفعيل نغمة وصوت نجاح الحفظ وقراءة الباركود</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={form.enableLowStockNotifications}
              onChange={(e) => setForm({ ...form, enableLowStockNotifications: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span className="text-xs font-bold text-slate-200">تنبيهات المخزون المنخفض في لوحة التحكم</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={form.enableDuePaymentAlerts}
              onChange={(e) => setForm({ ...form, enableDuePaymentAlerts: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span className="text-xs font-bold text-slate-200">تنبيهات ديون وذمم العملاء المستحقة</span>
          </label>

          {form.enableDuePaymentAlerts && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-xs font-bold text-slate-300">تنبيه عند تجاوز الديون مدة:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={form.debtAlertDays}
                  onChange={(e) => setForm({ ...form, debtAlertDays: parseInt(e.target.value) || 30 })}
                  className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-center text-amber-400 focus:outline-none"
                />
                <span className="text-xs text-slate-400">يوماً</span>
              </div>
            </div>
          )}
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
          <span>استعادة المظهر الافتراضي</span>
        </button>

        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-600/20 cursor-pointer transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>حفظ إعدادات المظهر</span>
        </button>
      </div>
    </form>
  );
};
