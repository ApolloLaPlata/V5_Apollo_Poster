"use client";

/**
 * LatencyMetricsCard.tsx - Painel de Telemetria de Latência e Tempo de Processamento
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Visualizador de Performance de Rede:
 * - Latência Média Onicanal com classificação semafórica
 * - Tempo Total Acumulado de Processamento
 * - Percentil 95 (P95) e amplitude operacional (Mínimo vs Máximo)
 * - Comparativo de velocidade por canal (Mais rápido vs Mais lento)
 */

import React from "react";
import { DispatchLogEntry } from "@/types/poster";
import { calculateLatencyMetrics } from "@/lib/analytics/latencyMetrics";
import { PLATFORM_METADATA } from "@/lib/analytics/channelDistribution";
import {
  Zap,
  Clock,
  Gauge,
  Activity,
  TrendingUp,
  Cpu,
  Layers,
  ShieldCheck,
  Flame,
  Turtle
} from "lucide-react";

interface LatencyMetricsCardProps {
  logs: DispatchLogEntry[];
}

export function LatencyMetricsCard({ logs }: LatencyMetricsCardProps) {
  const metrics = calculateLatencyMetrics(logs);

  if (logs.length === 0) {
    return null;
  }

  const fastestMeta = metrics.fastestChannel
    ? PLATFORM_METADATA[metrics.fastestChannel.channel] || { label: metrics.fastestChannel.channel }
    : null;

  const slowestMeta = metrics.slowestChannel
    ? PLATFORM_METADATA[metrics.slowestChannel.channel] || { label: metrics.slowestChannel.channel }
    : null;

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Cabeçalho do Card de Latência */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Telemetria de Latência & Tempo de Processamento</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${metrics.healthBg} ${metrics.healthColor}`}
              >
                {metrics.healthLabel}
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Métricas em tempo real de latência de disparo nas APIs oficiais parceiras
            </p>
          </div>
        </div>

        {/* Total de Eventos Medidos */}
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-400 bg-zinc-950/60 px-3 py-1.5 rounded-xl border border-zinc-800">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>{metrics.totalMeasuredEvents} amostras computadas</span>
        </div>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Card 1: Latência Média */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium">Latência Média</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {metrics.averageLatencyMs} <span className="text-xs text-zinc-400 font-normal">ms</span>
          </div>
          <p className="text-[10px] text-zinc-500 font-mono">
            Meta SLA: &lt; 150ms
          </p>
        </div>

        {/* Card 2: Tempo Total de Processamento */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium">Tempo Total de Rede</span>
            <Clock className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {metrics.totalProcessingTimeFormatted}
          </div>
          <p className="text-[10px] text-zinc-500 font-mono">
            {metrics.totalProcessingTimeMs.toLocaleString("pt-BR")} ms acumulados
          </p>
        </div>

        {/* Card 3: P95 Latency */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium">Percentil 95 (P95)</span>
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {metrics.p95LatencyMs} <span className="text-xs text-zinc-400 font-normal">ms</span>
          </div>
          <p className="text-[10px] text-zinc-500 font-mono">
            Range: {metrics.minLatencyMs}ms - {metrics.maxLatencyMs}ms
          </p>
        </div>

        {/* Card 4: Canal Mais Rápido */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium">Canal Mais Rápido</span>
            <Flame className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-base font-bold text-emerald-400 truncate mt-1">
            {fastestMeta?.label || "--"}
          </div>
          <p className="text-[10px] text-zinc-500 font-mono">
            Média: {metrics.fastestChannel?.averageMs || 0}ms
          </p>
        </div>
      </div>

      {/* Mini-grid de Canais com Latência Individual */}
      {Object.keys(metrics.channelBreakdown).length > 0 && (
        <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
              <Layers className="w-3.5 h-3.5 text-zinc-500" />
              <span>Latência Média por Canal de Despacho</span>
            </span>
            <span>Mínimo / Média / Máximo</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
            {Object.entries(metrics.channelBreakdown).map(([channelKey, info]) => {
              const meta = PLATFORM_METADATA[info.channel] || { label: channelKey };
              const isFastest = metrics.fastestChannel?.channel === info.channel;

              return (
                <div
                  key={channelKey}
                  className="bg-zinc-900/60 border border-zinc-800/80 px-2.5 py-2 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-zinc-200 truncate">{meta.label}</span>
                    {isFastest && (
                      <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                        FAST
                      </span>
                    )}
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <span
                      className={`font-bold ${
                        info.averageMs < 80
                          ? "text-emerald-400"
                          : info.averageMs < 150
                          ? "text-amber-400"
                          : "text-red-400"
                      }`}
                    >
                      {info.averageMs}ms
                    </span>
                    <span className="text-[10px] text-zinc-500 ml-1">
                      ({info.fastestMs}-{info.slowestMs})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
