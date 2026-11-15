import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Database,
  LogIn,
  LogOut,
  AlertTriangle,
  Loader2,
  Cloud,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { WhatsAppIcon } from './AppIcons';

export const AuthGateView: React.FC = () => {
  const { authUser, userProfile, isAuthReady, isLoadingProfile, authError, signInWithGoogle, signOutAccount } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  const handleLogin = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } finally {
      setSigningIn(false);
    }
  };

  if (!isAuthReady || isLoadingProfile) {
    return (
      <div className="min-h-screen cosmic-mesh-bg flex items-center justify-center p-6 text-right" dir="rtl">
        <div className="bg-[#040C2E]/95 border border-cyan-500/40 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-[0_0_40px_rgba(0,200,255,0.2)]">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/15 border border-cyan-400/50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
          <h2 className="text-lg font-black text-white">جاري تهيئة بيئة الحساب المستقلة...</h2>
          <p className="text-xs text-[#AAB8D6]">
            يتم التحقق من الهوية والربط المشفر بقاعدة بياناتك المحاسبية الخاصة
          </p>
        </div>
      </div>
    );
  }

  // Suspended account screen
  if (authUser && userProfile?.status === 'SUSPENDED') {
    return (
      <div className="min-h-screen cosmic-mesh-bg flex items-center justify-center p-4 text-right" dir="rtl">
        <div className="bg-[#040C2E]/95 border-2 border-red-500/60 rounded-3xl p-7 max-w-md w-full space-y-5 shadow-[0_0_40px_rgba(239,68,68,0.25)]">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">الحساب موقوف مؤقتاً</h2>
              <p className="text-xs text-red-300 font-mono">{userProfile.tenantCode} • {userProfile.email}</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            تم إيقاف صلاحية الوصول لهذا الحساب من قِبل إدارة النظام. جميع بياناتك المحاسبية ما زالت محفوظة بأمان تام في قاعدة بياناتك المعزولة.
          </p>

          <div className="flex flex-col gap-2.5 pt-2">
            <a
              href="https://wa.me/967775587939"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg transition-all"
            >
              <WhatsAppIcon className="w-4 h-4 fill-white" />
              <span>التواصل مع الإدارة: 775587939</span>
            </a>

            <button
              type="button"
              onClick={signOutAccount}
              className="flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج والتبديل إلى حساب آخر</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Standard Sign-In / Isolated Account Creation Screen
  return (
    <div className="min-h-screen cosmic-mesh-bg flex items-center justify-center p-4 sm:p-6 text-right relative overflow-y-auto" dir="rtl">
      <div className="neon-border-card max-w-lg w-full my-auto">
        <div className="neon-border-card-inner p-6 sm:p-8 space-y-6">
          {/* Header with Brand Logo */}
          <div className="flex items-center gap-4 border-b border-blue-900/50 pb-5">
            <div className="p-0.5 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-[#FFC629] shadow-[0_0_24px_rgba(0,200,255,0.5)] shrink-0">
              <img
                src="/assets/aistudio/logo_3d_transparent.png"
                alt="الغفاري سوفت برو"
                className="w-16 h-16 rounded-[14px] object-contain"
              />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/60 text-[#FFC629] text-[10px] font-black mb-1">
                <span>👑 الغفاري سوفت PRO</span>
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                نظام الحسابات المستقلة والخصوصية الكاملة
              </h1>
              <p className="text-xs text-[#AAB8D6] mt-0.5">
                سجّل الدخول بحسابك لفتح نسختك المحاسبية الخاصة والمعزولة تماماً
              </p>
            </div>
          </div>

          {/* Privacy & Isolation Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#040C2E]/90 border border-cyan-500/30 flex items-start gap-2.5">
              <Database className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white">قاعدة بيانات مستقلة 100%</div>
                <p className="text-[11px] text-[#AAB8D6] mt-0.5 leading-relaxed">
                  عملاؤك، فواتيرك، أصنافك، وقيودك محفوظة في مساحتك الخاصة وحدك.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#040C2E]/90 border border-emerald-500/30 flex items-start gap-2.5">
              <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white">عزل وخصوصية تامة</div>
                <p className="text-[11px] text-[#AAB8D6] mt-0.5 leading-relaxed">
                  لا يمكن لأي مستخدم آخر أو الإدارة الاطلاع على بياناتك دون إذنك.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#040C2E]/90 border border-blue-500/30 flex items-start gap-2.5">
              <Cloud className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white">استمرارية عبر الأجهزة</div>
                <p className="text-[11px] text-[#AAB8D6] mt-0.5 leading-relaxed">
                  افتح حسابك من الهاتف أو الكمبيوتر لتجد كامل عملياتك كما تركتها.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#040C2E]/90 border border-amber-500/30 flex items-start gap-2.5">
              <Smartphone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white">معرف مستقل وهوية رسمية</div>
                <p className="text-[11px] text-[#AAB8D6] mt-0.5 leading-relaxed">
                  رقم تعريف خاص لكل منشأة مع طباعة PDF ومعاينة شاشة فورية.
                </p>
              </div>
            </div>
          </div>

          {authError && (
            <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/50 text-xs text-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Google Sign In CTA */}
          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={handleLogin}
              disabled={signingIn}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#00C8FF] via-[#075BFF] to-[#00D99A] hover:brightness-110 text-white font-black text-sm shadow-[0_0_25px_rgba(0,200,255,0.45)] flex items-center justify-center gap-3 cursor-pointer transition-all active:scale-95 disabled:opacity-60"
            >
              {signingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري المصادقة وفتح مساحتك المستقلة...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>تسجيل الدخول / إنشاء حساب مستقل عبر Google</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>دخول فوري ومجاني • يتم إنشاء قاعدة بياناتك تلقائياً عند أول دخول</span>
            </div>
          </div>

          {/* Footer Credit */}
          <div className="pt-3 border-t border-blue-900/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#AAB8D6]">
            <span className="inline-flex items-center gap-1.5 text-amber-300 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              إعداد وتنفيذ / محمد عبد الغفار السروري
            </span>
            <a
              href="https://wa.me/967775587939"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-bold"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 fill-emerald-400" />
              <span>775587939</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
