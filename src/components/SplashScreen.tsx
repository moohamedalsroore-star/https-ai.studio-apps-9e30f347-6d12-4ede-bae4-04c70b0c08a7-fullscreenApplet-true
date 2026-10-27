import React, { useState, useEffect, useRef } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isFading, setIsFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFinish = () => {
    setIsFading(true);
    setTimeout(() => {
      onComplete();
    }, 600); // Smooth fade transition duration
  };

  useEffect(() => {
    // Safety fallback: if video stalls or takes longer than 9.5s, auto-enter
    const timer = setTimeout(() => {
      handleFinish();
    }, 9500);

    // Ensure video is muted and plays immediately
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        // Autoplay may be restricted in some browsers; fallback will handle it
      });
    }

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      onClick={handleFinish}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#020b1e] transition-opacity duration-700 select-none overflow-hidden cursor-pointer ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >

      {/* Intro Video Element - Muted as requested */}
      <div className="w-full h-full flex items-center justify-center relative">
        <video
          ref={videoRef}
          muted
          autoPlay
          playsInline
          onEnded={handleFinish}
          className="max-w-full max-h-full w-auto h-auto object-contain shadow-2xl"
        >
          <source src="/intro.mp4" type="video/mp4" />
          <source src="/assets/aistudio/175748573_1793042285501015_52896e23.mp4" type="video/mp4" />
          متصفحك لا يدعم تشغيل الفيديو
        </video>
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
