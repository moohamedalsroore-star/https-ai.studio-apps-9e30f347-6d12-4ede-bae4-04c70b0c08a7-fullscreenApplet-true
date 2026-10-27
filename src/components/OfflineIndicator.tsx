import React from 'react';
import { Wifi, WifiOff, HardDrive, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  return (
    <div className="no-print">
      {!isOnline ? (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3 rounded-2xl bg-amber-600/95 text-white px-4 py-2.5 shadow-2xl backdrop-blur-md border border-amber-400/40 text-xs font-bold animate-in fade-in slide-in-from-bottom duration-300">
          <div className="w-8 h-8 rounded-xl bg-amber-700/60 flex items-center justify-center shrink-0">
            <WifiOff className="w-4 h-4 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-200 animate-ping" />
              <span>أنت الآن في وضع عدم الاتصال (Offline)</span>
            </div>
            <p className="text-[11px] font-normal text-amber-100 mt-0.5">
              النظام يعمل بكافة مميزاته ومخازنه وفواتيره دون انقطاع ويحفظ البيانات محلياً.
            </p>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex fixed bottom-4 left-4 z-40 items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold backdrop-blur-sm shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <HardDrive className="w-3.5 h-3.5" />
          <span>تخزين محلي آمن + جاهز للعمل بدون إنترنت</span>
        </div>
      )}
    </div>
  );
};
