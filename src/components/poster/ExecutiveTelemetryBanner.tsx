"use client";

/**
 * ExecutiveTelemetryBanner.tsx - Painel Executivo de Telemetria de Despacho no Topo
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Exibição Unificada em Tempo Real dos 4 Indicadores Estratégicos:
 * 1. Total Disparados: volume consolidado de postagens e transmissões
 * 2. Taxa de Sucesso: confiabilidade de entrega nas APIs parceiras
 * 3. DMs Enviadas: alcance direto via automações Comment-to-DM com UTMs
 * 4. Alcance Estimado: projeção de impressões da rede onicanal
 */

import React, { useState } from "react";
import { usePosterStore } from "@/store/usePosterStore";
import {
  calculateExecutiveTelemetry,
  formatCompactNumber,
  formatPercentage
} from "@/lib/analytics/executiveTelemetry";
import {
  Send,
  ShieldCheck,
  MessageSquare,
  TrendingUp,
  Activity,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  Zap,
  Radio,
  Layers
} from "lucide-react";

export function ExecutiveTelemetryBanner() {
  const { posts, deals, commentRules, dispatchQueue, logs } = usePosterStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const telemetry = calculateExecutiveTelemetry({
    posts,
    deals,
    commentRules,
    dispatchQueue,
    logs
  });

  return (
    <div className="bg-gradient-to-b from-zinc-900/90 via-zinc-950/80 to-zinc-950 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Luz ambiente de fundo */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-1/3 w-80 h-28 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />

      {/* Cabeçalho do Painel Executivo */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center gap-2">
                Telemetria Executiva de Despacho
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Sync
                </span>
              </h2>
            </div>
            <p className="text-[11px] text-zinc-400">
              Métricas consolidadas de tráfego, entrega oficial e engajamento da holding.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-zinc-950/80 border border-zinc-800 text-[11px] font-mono text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Latência Média:</span>
            <strong className="text-zinc-200">~{telemetry.averageLatencyMs}ms</strong>
          </div>

          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
            title={isExpanded ? "Recolher painel" : "Expandir painel"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Grid de 4 Cards de Métricas Principais */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1 animate-in fade-in duration-200">
          {/* Card 1: Total Disparados */}
          <div className="bg-zinc-950/70 border border-zinc-800/80 hover:border-amber-500/30 rounded-xl p-3.5 transition group relative">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Total Disparados
              </span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Send className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-zinc-100 font-mono tracking-tight">
                {formatCompactNumber(telemetry.totalDispatched)}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                +{telemetry.dailyTrendPercent}%
              </span>
            </div>

            <div className="mt-2 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span>{telemetry.pendingQueueCount} na fila aguardando</span>
              <span className="text-zinc-400">Onicanal</span>
            </div>
          </div>

          {/* Card 2: Taxa de Sucesso de Entrega */}
          <div className="bg-zinc-950/70 border border-zinc-800/80 hover:border-emerald-500/30 rounded-xl p-3.5 transition group relative">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Taxa de Sucesso
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
                {formatPercentage(telemetry.successRatePercent)}
              </span>
              <span className="text-[10px] text-zinc-400 font-sans">
                {telemetry.failedDispatchesCount === 0 ? "100% íntegro" : `${telemetry.failedDispatchesCount} falhas`}
              </span>
            </div>

            {/* Barra de Progresso Visual */}
            <div className="mt-2.5 w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, Math.min(100, telemetry.successRatePercent))}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span>APIs Oficiais Cloud</span>
              <span className="text-emerald-400">Zero Extensão</span>
            </div>
          </div>

          {/* Card 3: DMs & Leads Comment-to-DM */}
          <div className="bg-zinc-950/70 border border-zinc-800/80 hover:border-blue-500/30 rounded-xl p-3.5 transition group relative">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                DMs & Leads Capturados
              </span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-400 font-mono tracking-tight">
                {formatCompactNumber(telemetry.dmsSentCount)}
              </span>
              <span className="text-[10px] text-blue-300 font-mono">
                {telemetry.activeAutomationsCount} regras ativas
              </span>
            </div>

            <div className="mt-2 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span>UTMs Rastreadas</span>
              <span className="text-zinc-400">ChatbotX Core</span>
            </div>
          </div>

          {/* Card 4: Alcance Estimado Global */}
          <div className="bg-zinc-950/70 border border-zinc-800/80 hover:border-purple-500/30 rounded-xl p-3.5 transition group relative">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Alcance Estimado
              </span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-purple-400 font-mono tracking-tight">
                ~{formatCompactNumber(telemetry.totalReachEstimated)}
              </span>
              <span className="text-[10px] text-zinc-400">
                impressões
              </span>
            </div>

            <div className="mt-2 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span>11 Canais Conectados</span>
              <span className="text-purple-300 font-semibold">V5 Holding</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
