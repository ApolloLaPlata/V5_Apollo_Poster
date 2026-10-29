import React from "react";

export default function GlobalLoading() {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[60vh] py-16 animate-fade-in">
      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-[3px] z-[99999] bg-neutral-950 overflow-hidden pointer-events-none">
        <div className="h-full bg-rose-500 origin-left animate-pulse">
          <div className="w-[30%] h-full bg-white/40 animate-[shimmer_1s_infinite]" />
        </div>
      </div>

      {/* Central Cybernetic Spinner */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full scale-150 animate-pulse" />
        <svg className="animate-spin w-10 h-10 text-rose-400 relative z-10" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>

      {/* Status Text */}
      <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 animate-pulse">
        Carregando Galeria de Posters & Despacho
      </p>
    </div>
  );
}
