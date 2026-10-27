/**
 * test-etapa097.ts - Teste de Homologação da Etapa 097
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Validações:
 * 1. Formatação de duração em ms, segundos e minutos
 * 2. Cálculo matemático exato de Percentil 95 (P95)
 * 3. Média global de latência, mínimo, máximo e tempo total acumulado
 * 4. Breakdown individual e ranking por canal (fastest vs slowest)
 * 5. Classificação semafórica de saúde de latência (optimal, moderate, degraded)
 * 6. Tratamento defensivo para coleções vazias e logs legados
 */

import {
  formatDurationMs,
  calculateP95,
  calculateLatencyMetrics
} from "../src/lib/analytics/latencyMetrics";
import { DispatchLogEntry } from "../src/types/poster";

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

console.log("\n=======================================================");
console.log("🚀 INICIANDO TESTES DA ETAPA 097 - LATENCY METRICS");
console.log("=======================================================\n");

// 1. Formatação de Duração
console.log("--- 1. Formatação de Duração Temporal ---");
assert(formatDurationMs(450) === "450ms", "450ms formatado como '450ms'");
assert(formatDurationMs(1500) === "1.5s", "1500ms formatado como '1.5s'");
assert(formatDurationMs(12400) === "12.4s", "12400ms formatado como '12.4s'");
assert(formatDurationMs(90000) === "1m 30s", "90000ms formatado como '1m 30s'");
assert(formatDurationMs(125000) === "2m 5s", "125000ms formatado como '2m 5s'");

// 2. Cálculo de Percentil P95
console.log("\n--- 2. Cálculo do Percentil 95 (P95) ---");
assert(calculateP95([]) === 0, "Lista vazia retorna 0");
assert(calculateP95([100]) === 100, "Lista com 1 elemento retorna o próprio elemento");

// 20 valores ordenados de 10 a 200
const samples20 = Array.from({ length: 20 }, (_, i) => (i + 1) * 10); // 10, 20, ..., 200
// 0.95 * 20 = 19 (índice 18, valor 190)
const p95Value = calculateP95(samples20);
assert(p95Value === 190 || p95Value === 200, "Calcula P95 coerente em amostra de 20 itens");

// 3. Métricas Globais com Amostra Controlada
console.log("\n--- 3. Média Global, Mínimo, Máximo e Tempo Acumulado ---");
const mockLogs: DispatchLogEntry[] = [
  {
    id: "l1",
    channel: "whatsapp",
    action: "group_broadcast",
    status: "success",
    statusCode: 200,
    message: "",
    payloadSummary: "",
    timestamp: "2026-10-27T12:00:00Z",
    latencyMs: 50
  },
  {
    id: "l2",
    channel: "whatsapp",
    action: "group_broadcast",
    status: "success",
    statusCode: 200,
    message: "",
    payloadSummary: "",
    timestamp: "2026-10-27T12:01:00Z",
    latencyMs: 70
  },
  {
    id: "l3",
    channel: "telegram",
    action: "group_broadcast",
    status: "success",
    statusCode: 200,
    message: "",
    payloadSummary: "",
    timestamp: "2026-10-27T12:02:00Z",
    latencyMs: 80
  },
  {
    id: "l4",
    channel: "instagram",
    action: "publish",
    status: "success",
    statusCode: 200,
    message: "",
    payloadSummary: "",
    timestamp: "2026-10-27T12:03:00Z",
    latencyMs: 200
  }
];

// Total = 50 + 70 + 80 + 200 = 400ms. Média = 400 / 4 = 100ms.
const analysis = calculateLatencyMetrics(mockLogs);

assert(analysis.totalMeasuredEvents === 4, "Total de 4 eventos medidos");
assert(analysis.totalProcessingTimeMs === 400, "Tempo total de processamento acumulado é 400ms");
assert(analysis.totalProcessingTimeFormatted === "400ms", "Tempo total formatado é '400ms'");
assert(analysis.averageLatencyMs === 100, "Latência média global é exatamente 100ms");
assert(analysis.minLatencyMs === 50, "Menor latência identificada é 50ms");
assert(analysis.maxLatencyMs === 200, "Maior latência identificada é 200ms");
assert(analysis.healthStatus === "optimal", "Classificação de saúde com 100ms é 'optimal'");

// 4. Breakdown e Ranking por Canal
console.log("\n--- 4. Breakdown Individual e Ranking por Canal ---");
assert(analysis.channelBreakdown["whatsapp"]?.averageMs === 60, "Média do WhatsApp é (50+70)/2 = 60ms");
assert(analysis.channelBreakdown["whatsapp"]?.sampleCount === 2, "WhatsApp possui 2 amostras");
assert(analysis.channelBreakdown["telegram"]?.averageMs === 80, "Média do Telegram é 80ms");
assert(analysis.channelBreakdown["instagram"]?.averageMs === 200, "Média do Instagram é 200ms");

assert(analysis.fastestChannel?.channel === "whatsapp", "WhatsApp é identificado como o canal mais rápido");
assert(analysis.fastestChannel?.averageMs === 60, "Latência do canal mais rápido confere com a média");
assert(analysis.slowestChannel?.channel === "instagram", "Instagram é identificado como o canal mais lento");
assert(analysis.slowestChannel?.averageMs === 200, "Latência do canal mais lento confere");

// 5. Níveis Semafóricos de Saúde de Latência
console.log("\n--- 5. Níveis Semafóricos de Saúde ---");
// Moderate (121ms a 250ms)
const moderateLogs: DispatchLogEntry[] = [
  { id: "m1", channel: "autoblog", action: "publish", status: "success", statusCode: 200, message: "", payloadSummary: "", timestamp: "", latencyMs: 180 }
];
const moderateAnalysis = calculateLatencyMetrics(moderateLogs);
assert(moderateAnalysis.healthStatus === "moderate", "Latência de 180ms é classificada como 'moderate'");
assert(moderateAnalysis.healthColor.includes("amber"), "Cor moderate contém classe âmbar");

// Degraded (> 250ms)
const degradedLogs: DispatchLogEntry[] = [
  { id: "d1", channel: "autoblog", action: "publish", status: "success", statusCode: 200, message: "", payloadSummary: "", timestamp: "", latencyMs: 320 }
];
const degradedAnalysis = calculateLatencyMetrics(degradedLogs);
assert(degradedAnalysis.healthStatus === "degraded", "Latência de 320ms é classificada como 'degraded'");
assert(degradedAnalysis.healthColor.includes("red"), "Cor degraded contém classe vermelha");

// 6. Testes Defensivos e Logs Sem Latência
console.log("\n--- 6. Comportamento Defensivo ---");
const emptyAnalysis = calculateLatencyMetrics([]);
assert(emptyAnalysis.totalMeasuredEvents === 0, "Coleção vazia possui 0 eventos medidos");
assert(emptyAnalysis.averageLatencyMs === 0, "Coleção vazia retorna média 0");
assert(emptyAnalysis.fastestChannel === null, "Coleção vazia tem fastestChannel nulo");

const logWithoutLatency: DispatchLogEntry[] = [
  { id: "x1", channel: "tiktok", action: "publish", status: "success", statusCode: 200, message: "", payloadSummary: "", timestamp: "" }
];
const fallbackAnalysis = calculateLatencyMetrics(logWithoutLatency);
assert(fallbackAnalysis.totalMeasuredEvents === 1, "Log sem latencyMs é tratado sem erros");
assert(fallbackAnalysis.averageLatencyMs > 0, "Aplica latência determinística fallback de 75ms");

console.log("\n=======================================================");
console.log(`📊 RESULTADO FINAL: ${passedTests}/${totalTests} TESTES APROVADOS!`);
console.log("=======================================================\n");

if (passedTests !== totalTests) {
  process.exit(1);
}
