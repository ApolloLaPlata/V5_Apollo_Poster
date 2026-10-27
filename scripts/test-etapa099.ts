/**
 * test-etapa099.ts - Teste de Homologação da Etapa 099
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Validações:
 * 1. Monitoramento dos 8 serviços oficiais (Gateway, Meta, TikTok, YouTube, Telegram, Newsletter, AutoBlog)
 * 2. Avaliação de saúde global (100% operacional, score 100)
 * 3. Detecção e classificação de degradação por Rate Limit 429 ou alta latência
 * 4. Detecção e classificação de indisponibilidade crítica (Outage 5xx)
 * 5. Detecção de credenciais expiradas (401/403)
 * 6. Cálculo exato do SLA Health Score proporcional
 */

import { evaluateSystemHealth } from "../src/lib/analytics/systemHealthMonitor";
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
console.log("🚀 INICIANDO TESTES DA ETAPA 099 - SYSTEM HEALTH MONITOR");
console.log("=======================================================\n");

// 1. Catálogo Base de Serviços
console.log("--- 1. Integridade do Catálogo de APIs Parceiras e Gateway ---");
const emptyReport = evaluateSystemHealth([]);
assert(emptyReport.totalServices === 8, "Monitora exatamente 8 serviços essenciais");
assert(emptyReport.services.some((s) => s.serviceId === "v5-core-gateway"), "Inclui o V5 Apollo API Gateway (:3011)");
assert(emptyReport.services.some((s) => s.serviceId === "meta-graph-api"), "Inclui Meta Graph API (Instagram)");
assert(emptyReport.services.some((s) => s.serviceId === "meta-whatsapp-cloud"), "Inclui WhatsApp Cloud API");
assert(emptyReport.services.some((s) => s.serviceId === "telegram-bot-api"), "Inclui Telegram Bot API");
assert(emptyReport.services.some((s) => s.serviceId === "tiktok-content-api"), "Inclui TikTok Content Posting API");
assert(emptyReport.services.some((s) => s.serviceId === "youtube-data-api"), "Inclui YouTube Data API v3");
assert(emptyReport.services.some((s) => s.serviceId === "resend-beehiiv-api"), "Inclui Resend/Beehiiv (Newsletter)");
assert(emptyReport.services.some((s) => s.serviceId === "autoblog-wordpress-rest"), "Inclui V5 AutoBlog & WordPress REST");

// 2. Sistema 100% Saudável
console.log("\n--- 2. Avaliação de Sistema Operacional Saudável ---");
const healthyLogs: DispatchLogEntry[] = [
  { id: "1", channel: "whatsapp", action: "group_broadcast", status: "success", statusCode: 200, message: "", payloadSummary: "", timestamp: "2026-10-27T12:00:00Z", latencyMs: 65 },
  { id: "2", channel: "telegram", action: "group_broadcast", status: "success", statusCode: 200, message: "", payloadSummary: "", timestamp: "2026-10-27T12:01:00Z", latencyMs: 70 },
  { id: "3", channel: "instagram", action: "publish", status: "success", statusCode: 200, message: "", payloadSummary: "", timestamp: "2026-10-27T12:02:00Z", latencyMs: 90 },
  { id: "4", channel: "newsletter", action: "publish", status: "success", statusCode: 201, message: "", payloadSummary: "", timestamp: "2026-10-27T12:03:00Z", latencyMs: 80 }
];

const healthyReport = evaluateSystemHealth(healthyLogs);
assert(healthyReport.overallStatus === "operational", "Status global é 'operational'");
assert(healthyReport.overallHealthScore === 100, "Health Score é 100%");
assert(healthyReport.activeIncidents.length === 0, "Zero incidentes ativos registrados");
assert(healthyReport.operationalCount === 8, "Todos os 8 serviços estão operacionais");

// 3. Detecção de Degradação (Rate Limit 429)
console.log("\n--- 3. Detecção de Degradação por Rate Limit (HTTP 429) ---");
const rateLimitLogs: DispatchLogEntry[] = [
  ...healthyLogs,
  { id: "rl1", channel: "instagram", action: "publish", status: "failed", statusCode: 429, message: "Rate limit Graph API", payloadSummary: "", timestamp: "2026-10-27T12:05:00Z", latencyMs: 95 }
];

const degradedReport = evaluateSystemHealth(rateLimitLogs);
assert(degradedReport.overallStatus === "degraded", "Status global passa para 'degraded'");
assert(degradedReport.degradedCount === 1, "Exatamente 1 serviço degradado identificado");
assert(degradedReport.activeIncidents.length === 1, "Gera 1 incidente ativo");
assert(degradedReport.activeIncidents[0].severity === "warning", "Incidente de rate limit possui severidade 'warning'");
assert(degradedReport.activeIncidents[0].serviceId === "meta-graph-api", "Incidente isola corretamente a Meta Graph API");

const igService = degradedReport.services.find((s) => s.serviceId === "meta-graph-api");
assert(igService?.status === "degraded", "Serviço Instagram está com status 'degraded'");
assert(Boolean(igService?.incidentMessage?.includes("Rate limit 429")), "Exibe mensagem contextual de Rate Limit");

// 4. Detecção de Indisponibilidade Crítica (Outage por 5xx Repetidos)
console.log("\n--- 4. Detecção de Indisponibilidade Crítica (Outage por Erros 5xx) ---");
const outageLogs: DispatchLogEntry[] = [
  { id: "err1", channel: "tiktok", action: "publish", status: "failed", statusCode: 500, message: "Internal Error", payloadSummary: "", timestamp: "2026-10-27T12:10:00Z" },
  { id: "err2", channel: "tiktok", action: "publish", status: "failed", statusCode: 503, message: "Service Unavailable", payloadSummary: "", timestamp: "2026-10-27T12:11:00Z" }
];

const outageReport = evaluateSystemHealth(outageLogs);
assert(outageReport.overallStatus === "outage", "Status global passa para 'outage'");
assert(outageReport.outageCount === 1, "Identifica 1 serviço em outage");
assert(outageReport.activeIncidents.some((i) => i.severity === "critical"), "Incidente classificado como 'critical'");

const tiktokService = outageReport.services.find((s) => s.serviceId === "tiktok-content-api");
assert(tiktokService?.status === "outage", "TikTok classificado como 'outage'");
assert(Boolean(tiktokService && tiktokService.uptimePercent < 96), "Uptime reduzido proporcionalmente ao incidente");

// 5. Detecção de Credenciais / Tokens Expirados (401/403)
console.log("\n--- 5. Detecção de Credenciais / Tokens Expirados (HTTP 401/403) ---");
const tokenLogs: DispatchLogEntry[] = [
  { id: "t1", channel: "youtube", action: "publish", status: "failed", statusCode: 401, message: "Token expired", payloadSummary: "", timestamp: "2026-10-27T12:20:00Z" },
  { id: "t2", channel: "youtube", action: "publish", status: "failed", statusCode: 403, message: "Permission denied", payloadSummary: "", timestamp: "2026-10-27T12:21:00Z" }
];

const tokenReport = evaluateSystemHealth(tokenLogs);
const ytService = tokenReport.services.find((s) => s.serviceId === "youtube-data-api");
assert(ytService?.status === "degraded", "YouTube classificado como degraded devido a falha de token");
assert(Boolean(ytService?.incidentMessage?.includes("token")), "Mensagem de incidente menciona credencial/token");

// 6. Proporção do Health Score
console.log("\n--- 6. Cálculo do Health Score Global Proporcional ---");
// 7 operacionais (1.0 cada = 7) + 1 degradado (0.5 = 0.5) = 7.5 / 8 = 93.75% -> 94%
assert(degradedReport.overallHealthScore === 94, "Health Score com 1 serviço degradado é 94%");

console.log("\n=======================================================");
console.log(`📊 RESULTADO FINAL: ${passedTests}/${totalTests} TESTES APROVADOS!`);
console.log("=======================================================\n");

if (passedTests !== totalTests) {
  process.exit(1);
}
