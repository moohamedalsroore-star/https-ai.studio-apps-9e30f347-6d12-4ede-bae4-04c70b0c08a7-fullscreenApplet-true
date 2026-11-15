import React from 'react';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';

interface AppErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  AppErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: unknown): AppErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : 'حدث خطأ غير متوقع أثناء تشغيل التطبيق.',
    };
  }

  componentDidCatch(error: unknown) {
    console.error('AppErrorBoundary caught error:', error);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleClearTempAndReload = () => {
    try {
      sessionStorage.clear();
      if ('caches' in window) {
        void caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
      }
    } catch {
      // ignore storage errors
    }
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-[#020824] text-[#F5F8FF] flex items-center justify-center p-6 text-right" dir="rtl">
        <div className="max-w-md w-full rounded-3xl bg-[#040C2E] border border-cyan-500/40 p-7 shadow-2xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">تعذر عرض الشاشة مؤقتاً</h2>
              <p className="text-xs text-[#AAB8D6]">بياناتك المحاسبية محفوظة بأمان تام ولن تتأثر.</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-300 font-mono break-words max-h-24 overflow-y-auto">
            {this.state.errorMessage}
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة فتح التطبيق فوراً</span>
            </button>

            <button
              type="button"
              onClick={this.handleClearTempAndReload}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>تحديث الذاكرة المؤقتة وإعادة التشغيل</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
