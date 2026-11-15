/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AccountingProvider, useAccounting } from './context/AccountingContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ArrowRight } from 'lucide-react';
import { OfflineIndicator } from './components/OfflineIndicator';
import { WhatsAppIcon } from './components/AppIcons';
import { SplashScreen } from './components/SplashScreen';
import { AuthGateView } from './components/AuthGateView';
import { AppErrorBoundary } from './components/AppErrorBoundary';

// Lazy-load secondary modules so initial app startup opens instantaneously
const POSView = lazy(() => import('./components/POSView').then((m) => ({ default: m.POSView })));
const InvoicesView = lazy(() => import('./components/InvoicesView').then((m) => ({ default: m.InvoicesView })));
const QuotationsView = lazy(() => import('./components/QuotationsView').then((m) => ({ default: m.QuotationsView })));
const PurchasesView = lazy(() => import('./components/PurchasesView').then((m) => ({ default: m.PurchasesView })));
const ReturnsView = lazy(() => import('./components/ReturnsView').then((m) => ({ default: m.ReturnsView })));
const InventoryManager = lazy(() => import('./components/InventoryManager').then((m) => ({ default: m.InventoryManager })));
const StockOperationsView = lazy(() => import('./components/StockOperationsView').then((m) => ({ default: m.StockOperationsView })));
const ContactsManager = lazy(() => import('./components/ContactsManager').then((m) => ({ default: m.ContactsManager })));
const VouchersView = lazy(() => import('./components/VouchersView').then((m) => ({ default: m.VouchersView })));
const JournalView = lazy(() => import('./components/JournalView').then((m) => ({ default: m.JournalView })));
const CurrencyManager = lazy(() => import('./components/CurrencyManager').then((m) => ({ default: m.CurrencyManager })));
const BranchesView = lazy(() => import('./components/BranchesView').then((m) => ({ default: m.BranchesView })));
const ChartOfAccountsView = lazy(() => import('./components/ChartOfAccountsView').then((m) => ({ default: m.ChartOfAccountsView })));
const ReportsView = lazy(() => import('./components/ReportsView').then((m) => ({ default: m.ReportsView })));
const SettingsView = lazy(() => import('./components/SettingsView').then((m) => ({ default: m.SettingsView })));

const ViewLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
  </div>
);

const MainContent: React.FC = () => {
  const { authUser, userProfile, isAuthReady, isLoadingProfile } = useAuth();
  const { activeView, setActiveView, settings } = useAccounting();
  const [showSplash, setShowSplash] = React.useState<boolean>(true);

  const isAuthenticated = Boolean(
    isAuthReady &&
      !isLoadingProfile &&
      authUser &&
      userProfile &&
      userProfile.status !== 'SUSPENDED'
  );

  const handleSplashComplete = React.useCallback(() => {
    setShowSplash(false);
  }, []);

  // Warm secondary modules during browser idle time after splash & authentication
  React.useEffect(() => {
    if (showSplash || !isAuthenticated) return;

    const preloadSecondaryViews = () => {
      void import('./components/POSView');
      void import('./components/InvoicesView');
      void import('./components/InventoryManager');
      void import('./components/ContactsManager');
      void import('./components/VouchersView');
      void import('./components/ReportsView');
      void import('./components/SettingsView');
    };

    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof win.requestIdleCallback === 'function') {
      const idleId = win.requestIdleCallback(preloadSecondaryViews, { timeout: 2000 });
      return () => win.cancelIdleCallback?.(idleId);
    }

    const timer = window.setTimeout(preloadSecondaryViews, 1500);
    return () => window.clearTimeout(timer);
  }, [showSplash, isAuthenticated]);

  // Sync activeView with browser history for Android back navigation
  React.useEffect(() => {
    if (activeView !== 'dashboard') {
      window.history.pushState({ view: activeView }, '');
    }

    const handlePopState = () => {
      if (activeView !== 'dashboard') {
        setActiveView('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeView, setActiveView]);

  return (
    <div className="min-h-screen cosmic-mesh-bg text-[#F5F8FF] flex flex-col selection:bg-cyan-500 selection:text-black relative overflow-x-hidden">
      {/* Stable SplashScreen mount position so auth resolution never restarts the intro video */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {!isAuthenticated ? (
        !showSplash ? <AuthGateView /> : null
      ) : (
        <>
          {/* Subtle Cyber Dots Background overlay on left & right sides */}
          <div className="fixed inset-y-0 left-0 w-32 cyber-dots-bg pointer-events-none opacity-40 z-0 hidden lg:block" />
          <div className="fixed inset-y-0 right-0 w-32 cyber-dots-bg pointer-events-none opacity-40 z-0 hidden lg:block" />

          {/* Real-time Offline Status Banner */}
          <OfflineIndicator />

          {/* Top Navbar with Multi-Branch Support & Authenticated Tenant Badge (sticky z-30 inside Navbar) */}
          <Navbar />

          {/* Main App Body with generous free space at the bottom for all screens */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 pb-36 sm:pb-28 relative">
            {/* Universal Back Arrow for all views with Neon Cyan Trim */}
            {activeView !== 'dashboard' && (
              <div className="mb-5 flex items-center justify-between no-print">
                <button
                  type="button"
                  onClick={() => setActiveView('dashboard')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#040C2E]/95 hover:bg-[#07174D] text-cyan-200 hover:text-white text-xs font-bold border border-cyan-400/40 shadow-[0_0_15px_rgba(0,200,255,0.2)] cursor-pointer transition-all active:scale-95 group"
                  title="الرجوع إلى لوحة التحكم الرئيسية"
                >
                  <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                  <span>رجوع إلى الشاشة الرئيسية</span>
                </button>
                <span className="text-xs text-[#AAB8D6] font-medium hidden sm:inline">
                  نظام الغفاري سوفت برو • محاسبك المثالي
                </span>
              </div>
            )}

            {activeView === 'dashboard' && <DashboardView />}
            {activeView !== 'dashboard' && (
              <Suspense fallback={<ViewLoadingFallback />}>
                {activeView === 'pos' && <POSView />}
                {activeView === 'invoices' && <InvoicesView />}
                {activeView === 'quotations' && <QuotationsView />}
                {activeView === 'purchases' && <PurchasesView />}
                {activeView === 'returns' && <ReturnsView />}
                {activeView === 'inventory' && <InventoryManager />}
                {activeView === 'transfers' && <StockOperationsView />}
                {activeView === 'contacts' && <ContactsManager />}
                {activeView === 'vouchers' && <VouchersView />}
                {activeView === 'journal' && <JournalView />}
                {activeView === 'currencies' && <CurrencyManager />}
                {activeView === 'branches' && <BranchesView />}
                {activeView === 'chart' && <ChartOfAccountsView />}
                {activeView === 'reports' && <ReportsView />}
                {activeView === 'settings' && <SettingsView />}
              </Suspense>
            )}
          </main>

          {/* Global Footer (no-print) */}
          <footer className="border-t border-blue-950/80 bg-[#020824]/95 backdrop-blur-md py-5 text-center text-xs text-[#AAB8D6] no-print relative z-10">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="font-bold text-[#F5F8FF]">تطبيق الغفاري سوفت برو (Al-Ghafari Soft Pro)</span>
                <span className="text-blue-500">•</span>
                <span>{settings.companyName}</span>
                <span className="text-blue-500">•</span>
                <span className="font-mono-num text-cyan-300">السنة المالية {settings.fiscalYear}</span>
                <span className="text-blue-500">•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  قاعدة بيانات مستقلة ومعزولة للمستخدم
                </span>
              </div>

              {/* Developer / Execution Credit & WhatsApp Direct Contact */}
              <div className="flex flex-col items-center md:items-end gap-1.5">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowSplash(true)}
                    className="text-[11px] text-cyan-300 hover:text-amber-300 underline cursor-pointer transition-colors"
                    title="إعادة تشغيل فيديو الشعار الترحيبي"
                  >
                    🎬 تشغيل فيديو المقدمة
                  </button>
                  <span className="text-slate-600">•</span>
                  <div className="text-xs font-bold text-amber-300/95 tracking-wide flex items-center gap-1">
                    <span>إعداد وتنفيذ / محمد عبد الغفار السروري</span>
                  </div>
                </div>
                <a
                  href="https://wa.me/967775587939"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-950/60 transition-all hover:scale-105 active:scale-95 cursor-pointer ring-1 ring-emerald-400/50 glow-emerald"
                  title="تواصل معنا مباشرة عبر واتساب على الرقم 775587939"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-white" />
                  <span>للتواصل معنا: 775587939</span>
                </a>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <AccountingProvider>
          <MainContent />
        </AccountingProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}
