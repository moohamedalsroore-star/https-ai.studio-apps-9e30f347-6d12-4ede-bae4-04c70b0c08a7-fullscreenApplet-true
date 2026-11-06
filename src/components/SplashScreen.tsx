import React, { useState, useEffect, useRef } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isFading, setIsFading] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFinish = () => {
    setIsFading(true);
    try {
      sessionStorage.setItem('ghafari_splash_seen', 'true');
    } catch {
      // ignore
    }
    setTimeout(() => {
      onComplete();
    }, 400); // Ultra-fast smooth fade
  };

  useEffect(() => {
    // Ultra-fast safety fallback: enter within 2.8s max for buttery smooth opening
    const timer = setTimeout(() => {
      handleFinish();
    }, 2800);

    // Ensure video is muted and plays immediately
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        // Fallback smooth entry
      });
    }

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      onClick={handleFinish}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#020824] transition-opacity duration-500 select-none overflow-hidden cursor-pointer ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Quick Skip Button on Top */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleFinish();
        }}
        className="absolute top-5 left-5 z-30 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-400/40 text-xs font-bold shadow-lg backdrop-blur-md cursor-pointer transition-all active:scale-95"
      >
        <span>تخطي والدخول السريع</span>
        <span className="text-amber-400">⚡</span>
      </button>
      {/* Intro Video Element - Muted as requested */}
      <div className="w-full h-full flex items-center justify-center relative">
        {!videoFailed ? (
          <video
            ref={videoRef}
            muted
            autoPlay
            playsInline
            preload="auto"
            onEnded={handleFinish}
            onError={() => setVideoFailed(true)}
            className="max-w-full max-h-full w-auto h-auto object-contain shadow-2xl"
          >
            <source src="/intro.mp4" type="video/mp4" />
            <source src="/assets/aistudio/175748573_1793042285501015_52896e23.mp4" type="video/mp4" />
          </video>
        ) : (
          <div className="flex flex-col items-center justify-center gap-5 animate-in fade-in zoom-in duration-500">
            <img
              src="/assets/aistudio/1787182612810_5ba9faf5.png"
              alt="الغفاري سوفت برو"
              className="w-32 h-32 rounded-3xl object-cover shadow-2xl shadow-blue-900/60 border-2 border-amber-400/50 ring-4 ring-blue-500/20"
            />
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-white tracking-wide">الغفاري سوفت برو</h2>
              <p className="text-xs text-amber-300 font-bold">نظام محاسبي وإداري سحابي متكامل</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Loading Progress Indicator */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center justify-center gap-2 pointer-events-none">
        <div className="w-48 h-1 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
          <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-cyan-400 animate-[pulse_1.5s_ease-in-out_infinite]" />
        </div>
        <p className="text-[11px] text-slate-400 font-medium">
          إعداد وتنفيذ م / محمد عبد الغفار السروري
        </p>
      </div>
    </div>
  );
};
