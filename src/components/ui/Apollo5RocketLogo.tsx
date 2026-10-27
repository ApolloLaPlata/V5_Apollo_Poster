import React from "react";

export function Apollo5RocketLogo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div 
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-300 shadow-lg shadow-amber-500/20"
        style={{ width: size, height: size }}
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-white transform rotate-45"
          style={{ width: size * 0.6, height: size * 0.6 }}
        >
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="font-bold tracking-tight text-white flex items-center gap-1.5 text-base">
          V5 APOLLO <span className="text-amber-400 font-extrabold">POSTER</span>
        </span>
        <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono">
          Omnichannel Dispatcher
        </span>
      </div>
    </div>
  );
}
