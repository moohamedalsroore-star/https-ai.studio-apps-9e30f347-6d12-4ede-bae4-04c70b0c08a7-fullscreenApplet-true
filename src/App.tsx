/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AccountingProvider, useAccounting } from './context/AccountingContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { POSView } from './components/POSView';
import { InvoicesView } from './components/InvoicesView';
import { PurchasesView } from './components/PurchasesView';
import { InventoryManager } from './components/InventoryManager';
import { ContactsManager } from './components/ContactsManager';
import { VouchersView } from './components/VouchersView';
import { JournalView } from './components/JournalView';
import { ChartOfAccountsView } from './components/ChartOfAccountsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { QuotationsView } from './components/QuotationsView';
import { ReturnsView } from './components/ReturnsView';
import { StockOperationsView } from './components/StockOperationsView';
import { BranchesView } from './components/BranchesView';
import { ArrowRight } from 'lucide-react';
import { CurrencyManager } from './components/CurrencyManager';
import { OfflineIndicator } from './components/OfflineIndicator';
import { WhatsAppIcon } from './components/AppIcons';
import { SplashScreen } from './components/SplashScreen';

const MainContent: React.FC = () => {
  const { activeView, setActiveView, settings } = useAccounting();
  const [showSplash, setShowSplash] = React.useState(true);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Intro Video Splash Screen on startup (Muted as requested) */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* Real-time Offline Status Banner */}
      <OfflineIndicator />

      {/* Top Navbar with Multi-Branch Support */}
      <Navbar />

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Universal Back Arrow for all views */}
        {activeView !== 'dashboard' && (
          <div className="mb-5 flex items-center justify-between no-print">
            <button
              type="button"
              onClick={() => setActiveView('dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-700/80 shadow-md cursor-pointer transition-all active:scale-95 group"
              title="الرجوع إلى لوحة التحكم الرئيسية"
            >
              <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              <span>رجوع إلى الشاشة الرئيسية</span>
            </button>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              نظام الغفاري سوفت برو • محاسبك المثالي
            </span>
          </div>
        )}

        {activeView === 'dashboard' && <DashboardView />}
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
      </main>

      {/* Global Footer (no-print) */}
      <footer className="border-t border-slate-900 bg-slate-950/95 py-5 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="font-bold text-slate-300">تطبيق الغفاري سوفت برو (Al-Ghafari Soft Pro)</span>
            <span>•</span>
            <span>{settings.companyName}</span>
            <span>•</span>
            <span className="font-mono-num">السنة المالية {settings.fiscalYear}</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">محرك الترحيل الآلي للقيود والمخزون نشط</span>
          </div>

          {/* Developer / Execution Credit & WhatsApp Direct Contact */}
          <div className="flex flex-col items-center md:items-end gap-1.5">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowSplash(true)}
                className="text-[11px] text-slate-400 hover:text-amber-400 underline cursor-pointer transition-colors"
                title="إعادة تشغيل فيديو الشعار الترحيبي"
              >
                🎬 تشغيل فيديو المقدمة
              </button>
              <span className="text-slate-600">•</span>
              <div className="text-xs font-bold text-amber-300/95 tracking-wide">
                إعداد وتنفيذ / محمد عبد الغفار السروري
              </div>
            </div>
            <a
              href="https://wa.me/967775587939"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs shadow-lg shadow-emerald-950/60 transition-all hover:scale-105 active:scale-95 cursor-pointer ring-1 ring-emerald-400/40"
              title="تواصل معنا مباشرة عبر واتساب على الرقم 775587939"
            >
              <WhatsAppIcon className="w-4 h-4 fill-white" />
              <span>للتواصل معنا: 775587939</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AccountingProvider>
      <MainContent />
    </AccountingProvider>
  );
}
