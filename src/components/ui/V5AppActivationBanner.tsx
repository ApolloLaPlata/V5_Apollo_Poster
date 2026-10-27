"use client";

import React, { useState } from "react";
import { usePosterStore } from "@/store/usePosterStore";
import { 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Globe, 
  Mail, 
  MessageSquare, 
  Send,
  Activity
} from "lucide-react";

export function V5AppActivationBanner() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { getAnalytics } = usePosterStore();
  const analytics = getAnalytics();

  const services = [
    {
      name: "Meta Graph API v21.0 (Instagram / Reels)",
      status: "connected",
      ping: "34ms",
      icon: MessageSquare,
      color: "text-blue-400"
    },
    {
      name: "V5 AutoBlog REST Gateway (:3005)",
      status: "connected",
      ping: "18ms",
      icon: Globe,
      color: "text-amber-400"
    },
    {
      name: "Resend Newsletter Engine (HTML Inline)",
      status: "connected",
      ping: "42ms",
      icon: Mail,
      color: "text-purple-400"
    },
    {
      name: "Finders VIP Gateway (WhatsApp & Telegram)",
      status: "connected",
      ping: "29ms",
      icon: Send,
      color: "text-emerald-400"
    }
  ];

  return (
    <div className="w-full bg-gradient-to-r from-zinc-900/95 via-zinc-900/90 to-zinc-950/95 border border-zinc-800/80 rounded-2xl p-3.5 px-5 shadow-lg backdrop-blur-md text-xs transition-all duration-300">
      {/* Linha Principal do Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-zinc-200 font-semibold">Gateway V5 Apollo API Conectado</span>
            <span className="bg-zinc-800/90 text-zinc-300 px-2 py-0.5 rounded font-mono text-[11px] border border-zinc-700/60">
              Porta :3011
            </span>
          </div>
        </div>

        {/* Métricas Rápidas Inline */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-zinc-300 font-mono text-[11px]">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sucesso: <strong className="text-emerald-400">{analytics.successRate}%</strong></span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-zinc-300 font-mono text-[11px]">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Despachos: <strong className="text-amber-400">{analytics.totalDispatched}</strong></span>
          </div>

          <div className="bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-md border border-amber-500/20 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Capitania #13 Ativa</span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 bg-zinc-800/60 hover:bg-zinc-800 px-2.5 py-1 rounded-md border border-zinc-700/50 transition font-medium text-[11px]"
            title="Ver status detalhado dos conectores em nuvem"
          >
            <span>{isExpanded ? "Ocultar" : "Infraestrutura"}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Painel Expansível de Conectores em Nuvem */}
      {isExpanded && (
        <div className="mt-4 pt-3.5 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
          {services.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div 
                key={idx}
                className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3 flex items-center justify-between gap-2 shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${srv.color}`} />
                  <div className="truncate">
                    <p className="text-[11px] font-semibold text-zinc-200 truncate">{srv.name}</p>
                    <p className="text-[10px] text-emerald-400 font-mono">100% Operacional</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                  {srv.ping}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
