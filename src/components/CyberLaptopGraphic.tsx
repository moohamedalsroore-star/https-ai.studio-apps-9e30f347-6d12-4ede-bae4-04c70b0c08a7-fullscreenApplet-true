import React from 'react';

export const CyberLaptopGraphic: React.FC<{ className?: string }> = ({ className = 'w-64 h-64' }) => {
  return (
    <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
      {/* Outer Cyan Orbital Glowing Energy Rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-56 h-32 rounded-[100%] border-2 border-cyan-400/60 shadow-[0_0_30px_rgba(0,200,255,0.7)] rotate-[-18deg] animate-[pulse_3s_ease-in-out_infinite]" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-48 h-28 rounded-[100%] border border-blue-500/50 shadow-[0_0_20px_rgba(7,91,255,0.5)] rotate-[22deg]" />
      </div>

      {/* Ambient Radial Glow */}
      <div className="absolute w-44 h-44 rounded-full bg-gradient-to-tr from-cyan-500/25 via-blue-600/30 to-purple-600/20 blur-2xl" />

      {/* SVG Laptop with Isometric 3D View and Rising Financial Chart */}
      <svg
        viewBox="0 0 320 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
      >
        <defs>
          <linearGradient id="laptopLid" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0B2363" />
            <stop offset="50%" stopColor="#061642" />
            <stop offset="100%" stopColor="#020924" />
          </linearGradient>
          <linearGradient id="laptopScreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00C8FF" />
            <stop offset="30%" stopColor="#083E9E" />
            <stop offset="100%" stopColor="#031138" />
          </linearGradient>
          <linearGradient id="screenBezel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#0A1838" />
          </linearGradient>
          <linearGradient id="keyboardBase" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#091E54" />
            <stop offset="50%" stopColor="#14347E" />
            <stop offset="100%" stopColor="#06153D" />
          </linearGradient>
          <linearGradient id="goldCoinTop" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFE066" />
            <stop offset="50%" stopColor="#FFC629" />
            <stop offset="100%" stopColor="#D99B00" />
          </linearGradient>
          <linearGradient id="goldCoinSide" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E6A800" />
            <stop offset="100%" stopColor="#8A5A00" />
          </linearGradient>
          <linearGradient id="chartBarGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#075BFF" />
            <stop offset="50%" stopColor="#00C8FF" />
            <stop offset="100%" stopColor="#00D99A" />
          </linearGradient>
          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Laptop Base (Isometric Perspective) */}
        <path
          d="M 50 185 L 175 145 L 290 190 L 160 238 Z"
          fill="url(#keyboardBase)"
          stroke="#00C8FF"
          strokeWidth="1.5"
          filter="url(#glowFilter)"
        />
        {/* Laptop Base Edge Depth */}
        <path
          d="M 50 185 L 50 194 L 160 247 L 290 199 L 290 190 L 160 238 Z"
          fill="#030C28"
          stroke="#075BFF"
          strokeWidth="1"
        />

        {/* Keyboard Keys Trackpad area */}
        <path
          d="M 125 198 L 180 178 L 195 192 L 140 214 Z"
          fill="#051336"
          stroke="#00C8FF"
          strokeWidth="0.8"
          opacity="0.9"
        />
        <path
          d="M 75 178 L 175 148 L 265 183 L 165 215 Z"
          fill="#040F2D"
          stroke="#075BFF"
          strokeWidth="0.6"
          opacity="0.6"
        />

        {/* Laptop Screen / Lid (Upright Backing) */}
        <path
          d="M 70 82 L 205 32 L 210 148 L 75 188 Z"
          fill="url(#screenBezel)"
          stroke="#00C8FF"
          strokeWidth="2"
        />

        {/* Screen Display Area (Glowing) */}
        <path
          d="M 78 88 L 198 44 L 202 142 L 82 180 Z"
          fill="url(#laptopScreen)"
          stroke="#00C8FF"
          strokeWidth="1.2"
        />

        {/* Financial Upward Bar Chart on Screen */}
        {/* Bar 1 */}
        <polygon points="95,165 106,161 106,145 95,149" fill="url(#chartBarGrad)" />
        {/* Bar 2 */}
        <polygon points="112,159 123,155 123,130 112,134" fill="url(#chartBarGrad)" />
        {/* Bar 3 */}
        <polygon points="129,153 140,149 140,115 129,119" fill="url(#chartBarGrad)" />
        {/* Bar 4 */}
        <polygon points="146,147 157,143 157,98 146,102" fill="url(#chartBarGrad)" />
        {/* Bar 5 (Highest) */}
        <polygon points="163,141 174,137 174,75 163,79" fill="url(#chartBarGrad)" />

        {/* Glowing Upward Trend Line */}
        <polyline
          points="92,152 108,138 125,124 142,104 168,70"
          stroke="#00D99A"
          strokeWidth="2.5"
          fill="none"
          filter="url(#glowFilter)"
        />
        {/* Arrow Tip */}
        <polygon points="168,70 160,70 166,78" fill="#00D99A" />

        {/* Screen Top Ambient Reflection */}
        <line x1="82" y1="89" x2="195" y2="47" stroke="#FFFFFF" strokeWidth="1" opacity="0.6" />

        {/* Stacks of Golden Coins (Luxury Gold #FFC629) on the Front Left */}
        {/* Coin Stack 1 (Back) */}
        <g transform="translate(42, 175)">
          {/* Base Coins */}
          {[0, 6, 12, 18].map((offset) => (
            <g key={offset} transform={`translate(0, ${-offset})`}>
              <path d="M 0 10 C 0 16 26 16 26 10 L 26 14 C 26 20 0 20 0 14 Z" fill="url(#goldCoinSide)" />
              <ellipse cx="13" cy="10" rx="13" ry="5.5" fill="url(#goldCoinTop)" stroke="#FFF2A3" strokeWidth="0.8" />
            </g>
          ))}
        </g>

        {/* Coin Stack 2 (Front Left - Taller) */}
        <g transform="translate(25, 192)">
          {[0, 6, 12, 18, 24, 30].map((offset) => (
            <g key={offset} transform={`translate(0, ${-offset})`}>
              <path d="M 0 10 C 0 16 28 16 28 10 L 28 14 C 28 20 0 20 0 14 Z" fill="url(#goldCoinSide)" />
              <ellipse cx="14" cy="10" rx="14" ry="6" fill="url(#goldCoinTop)" stroke="#FFF2A3" strokeWidth="0.8" />
              {/* Dollar sign on top coin */}
              {offset === 30 && (
                <text x="14" y="13" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#7A4D00">
                  $
                </text>
              )}
            </g>
          ))}
        </g>

        {/* Coin Stack 3 (Front Right - Shorter) */}
        <g transform="translate(58, 202)">
          {[0, 6, 12].map((offset) => (
            <g key={offset} transform={`translate(0, ${-offset})`}>
              <path d="M 0 10 C 0 16 24 16 24 10 L 24 14 C 24 20 0 20 0 14 Z" fill="url(#goldCoinSide)" />
              <ellipse cx="12" cy="10" rx="12" ry="5" fill="url(#goldCoinTop)" stroke="#FFF2A3" strokeWidth="0.7" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};
