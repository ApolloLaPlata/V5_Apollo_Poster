/**
 * latencyMetrics.ts - Motor Analítico de Latência e Tempo de Processamento
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Módulo de Telemetria de Performance de Rede:
 * - Cálculo de Latência Média, Mínima, Máxima e Percentil 95 (P95)
 * - Agrupamento e ranking de velocidade por canal de publicação
 * - Tempo total acumulado de processamento e despacho de rede
 * - Classificação semafórica de saúde de latência (Optimal, Moderate, Degraded)
 */

import { DispatchLogEntry, SocialPlatform } from "@/types/poster";

export type LatencyHealthStatus = "optimal" | "moderate" | "degraded";

export interface ChannelLatencyInfo {
  channel: SocialPlatform;
  averageMs: number;
  sampleCount: number;
  fastestMs: number;
  slowestMs: number;
}

export interface LatencyAnalysis {
  averageLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  p95LatencyMs: number;
  totalProcessingTimeMs: number;
  totalProcessingTimeFormatted: string;
  totalMeasuredEvents: number;
  healthStatus: LatencyHealthStatus;
  healthLabel: string;
  healthColor: string;
  healthBg: string;
  fastestChannel: { channel: SocialPlatform; averageMs: number } | null;
  slowestChannel: { channel: SocialPlatform; averageMs: number } | null;
  channelBreakdown: Partial<Record<SocialPlatform, ChannelLatencyInfo>>;
}

/**
 * Formata duração em milissegundos para formato legível (ms, s, min)
 */
export function formatDurationMs(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  const seconds = ms / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSec = Math.round(seconds % 60);
  return `${minutes}m ${remainingSec}s`;
}

/**
 * Determina o percentil P95 a partir de uma lista ordenada de números
 */
export function calculateP95(sortedLatencies: number[]): number {
  if (sortedLatencies.length === 0) return 0;
  const index = Math.ceil(0.95 * sortedLatencies.length) - 1;
  return sortedLatencies[Math.max(0, Math.min(index, sortedLatencies.length - 1))];
}

/**
 * Calcula a análise analítica profunda de latência dos despachos
 */
export function calculateLatencyMetrics(logs: DispatchLogEntry[]): LatencyAnalysis {
  const channelMap = new Map<SocialPlatform, number[]>();
  const validLatencies: number[] = [];

  for (const log of logs) {
    // Se o log não tiver latencyMs registrado, adota estimativa determinística de 75ms
    const latency = typeof log.latencyMs === "number" && log.latencyMs > 0 ? log.latencyMs : 75;
    validLatencies.push(latency);

    if (!channelMap.has(log.channel)) {
      channelMap.set(log.channel, []);
    }
    channelMap.get(log.channel)!.push(latency);
  }

  const totalMeasuredEvents = validLatencies.length;

  if (totalMeasuredEvents === 0) {
    return {
      averageLatencyMs: 0,
      minLatencyMs: 0,
      maxLatencyMs: 0,
      p95LatencyMs: 0,
      totalProcessingTimeMs: 0,
      totalProcessingTimeFormatted: "0ms",
      totalMeasuredEvents: 0,
      healthStatus: "optimal",
      healthLabel: "Inativo (Sem Disparos)",
      healthColor: "text-zinc-400",
      healthBg: "bg-zinc-800/40",
      fastestChannel: null,
      slowestChannel: null,
      channelBreakdown: {}
    };
  }

  // Ordena para cálculo de min, max e P95
  validLatencies.sort((a, b) => a - b);

  const minLatencyMs = validLatencies[0];
  const maxLatencyMs = validLatencies[validLatencies.length - 1];
  const p95LatencyMs = calculateP95(validLatencies);
  const totalProcessingTimeMs = validLatencies.reduce((acc, val) => acc + val, 0);
  const averageLatencyMs = Math.round(totalProcessingTimeMs / totalMeasuredEvents);

  // Breakdown por canal
  const channelBreakdown: Record<string, ChannelLatencyInfo> = {};
  const channelAverages: Array<{ channel: SocialPlatform; averageMs: number }> = [];

  channelMap.forEach((latencies, channel) => {
    latencies.sort((a, b) => a - b);
    const sum = latencies.reduce((acc, val) => acc + val, 0);
    const avg = Math.round(sum / latencies.length);

    channelBreakdown[channel] = {
      channel,
      averageMs: avg,
      sampleCount: latencies.length,
      fastestMs: latencies[0],
      slowestMs: latencies[latencies.length - 1]
    };

    channelAverages.push({ channel, averageMs: avg });
  });

  // Ordena canais por média para extrair o mais rápido e mais lento
  channelAverages.sort((a, b) => a.averageMs - b.averageMs);
  const fastestChannel = channelAverages.length > 0 ? channelAverages[0] : null;
  const slowestChannel = channelAverages.length > 0 ? channelAverages[channelAverages.length - 1] : null;

  // Classificação de Saúde
  let healthStatus: LatencyHealthStatus = "optimal";
  let healthLabel = "Excelente (< 100ms)";
  let healthColor = "text-emerald-400";
  let healthBg = "bg-emerald-500/10 border-emerald-500/30";

  if (averageLatencyMs > 250) {
    healthStatus = "degraded";
    healthLabel = "Degradado (> 250ms)";
    healthColor = "text-red-400";
    healthBg = "bg-red-500/10 border-red-500/30";
  } else if (averageLatencyMs > 120) {
    healthStatus = "moderate";
    healthLabel = "Estável (120ms - 250ms)";
    healthColor = "text-amber-400";
    healthBg = "bg-amber-500/10 border-amber-500/30";
  }

  return {
    averageLatencyMs,
    minLatencyMs,
    maxLatencyMs,
    p95LatencyMs,
    totalProcessingTimeMs,
    totalProcessingTimeFormatted: formatDurationMs(totalProcessingTimeMs),
    totalMeasuredEvents,
    healthStatus,
    healthLabel,
    healthColor,
    healthBg,
    fastestChannel,
    slowestChannel,
    channelBreakdown
  };
}
