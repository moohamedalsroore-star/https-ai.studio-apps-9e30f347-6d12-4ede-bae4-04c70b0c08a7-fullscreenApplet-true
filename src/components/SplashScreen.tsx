import React, { useState, useEffect, useRef, useCallback } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isFading, setIsFading] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const finishedRef = useRef(false);
  const fallbackTimerRef = useRef<number | null>(null);
  const safetyTimerRef = useRef<number | null>(null);

  const handleFinish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (fallbackTimerRef.current !== null) window.clearTimeout(fallbackTimerRef.current);
    if (safetyTimerRef.current !== null) window.clearTimeout(safetyTimerRef.current);
    setIsFading(true);
    window.setTimeout(() => {
      onComplete();
    }, 180);
  }, [onComplete]);

  const startFallbackLogoSplash = useCallback(() => {
    setVideoFailed(true);
    if (fallbackTimerRef.current !== null || finishedRef.current) return;
    fallbackTimerRef.current = window.setTimeout(() => {
      handleFinish();
    }, 2500);
  }, [handleFinish]);

  useEffect(() => {
    // Anti-hang cap slightly above the 10s natural video duration
    safetyTimerRef.current = window.setTimeout(() => {
      handleFinish();
    }, 13000);

    const videoEl = videoRef.current;
    if (videoEl) {
      videoEl.muted = true;
      videoEl.defaultMuted = true;
      videoEl.currentTime = 0;
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          startFallbackLogoSplash();
        });
      }
    }

    return () => {
      if (fallbackTimerRef.current !== null) window.clearTimeout(fallbackTimerRef.current);
      if (safetyTimerRef.current !== null) window.clearTimeout(safetyTimerRef.current);
    };
  }, [handleFinish, startFallbackLogoSplash]);

  const handleVideoReady = () => {
    setVideoReady(true);
  };

  const handleVideoEnded = () => {
    // Enter app immediately when natural intro finishes without extra stall delay
    handleFinish();
  };

  const handleVideoError = () => {
    startFallbackLogoSplash();
  };

  return (
    <div
      className={`fixed inset-0 z-[999999] w-screen h-screen bg-[#020617] overflow-hidden flex items-center justify-center select-none pointer-events-auto cursor-default transition-opacity duration-200 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Instant 0ms Logo Frame while video initializes or if autoplay/codec fails */}
      {(!videoReady || videoFailed) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 space-y-4 bg-[#020617]">
          <img
            src="/assets/aistudio/logo_3d_transparent.png"
            alt="الغفاري سوفت PRO"
            className="w-36 h-36 sm:w-44 sm:h-44 object-contain drop-shadow-[0_0_25px_rgba(0,200,255,0.6)]"
          />
          <h1 className="text-3xl font-black text-white">
            الغفاري سوفت <span className="text-amber-400">PRO</span>
          </h1>
          <p className="text-sm text-cyan-300 font-bold">
            إعداد وتنفيذ م/ محمد عبد الغفار السروري
          </p>
        </div>
      )}

      {/* Natural Fullscreen Intro Video */}
      {!videoFailed && (
        <video
          ref={videoRef}
          muted
          autoPlay
          playsInline
          preload="auto"
          onLoadedData={handleVideoReady}
          onPlaying={handleVideoReady}
          onEnded={handleVideoEnded}
          onError={handleVideoError}
          className={`w-full h-full object-cover sm:object-contain bg-[#020617] transition-opacity duration-150 ${
            videoReady ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src="/intro.mp4" type="video/mp4" />
          <source src="/assets/aistudio/175748573_1793042285501015_52896e23.mp4" type="video/mp4" />
        </video>
      )}

      {/* Subtle Bottom Gold/Cyan Glow Accent Line */}
      <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-amber-400 to-emerald-400 shadow-[0_0_14px_rgba(0,200,255,0.8)] pointer-events-none" />
    </div>
  );
};
