"use client";

import React, { useState } from "react";
import { ShieldCheck, Zap, Sparkles } from "lucide-react";

export function V5AppActivationBanner() {
  const [apiKey] = useState(
    process.env.NEXT_PUBLIC_V5_API_KEY || "v5_live_v5_master_key_all_access_holding_apollo_2026_unlimited"
  );

  return (
    <div className="w-full bg-gradient-to-r from-zinc-900/90 via-zinc-800/80 to-zinc-900/90 border border-zinc-800/80 rounded-xl p-3 px-4 shadow-sm backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-zinc-300 font-medium flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Gateway V5 Apollo API Conectado</span>
        </span>
        <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono text-[11px] border border-zinc-700/60">
          Porta :3011
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 text-zinc-400 font-mono text-[11px]">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Tier: Unlimited 240 req/min</span>
        </div>
        <div className="bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-md border border-amber-500/20 font-medium flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Capitania #13 Ativa</span>
        </div>
      </div>
    </div>
  );
}
