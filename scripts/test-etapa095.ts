/**
 * test-etapa095.ts - Teste de Homologação da Etapa 095
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Validações:
 * 1. Classificação de códigos HTTP por famílias operacionais (2xx, 4xx, 5xx, 429)
 * 2. Cálculo quantitativo agregado de status e taxa de entrega percentual
 * 3. Filtragem de logs por Status de Sucesso (200/201 OK) vs. Erro (4xx/5xx/429)
 * 4. Granularidade de falhas (Erros de Cliente 4xx vs Servidor 5xx vs Rate Limit 429)
 * 5. Filtros combinados (Canal + Status Granular + Busca Textual)
 */

import {
  classifyHttpStatus,
  getLogStatusCounts,
  filterAndSortLogs
} from "../src/lib/analytics/auditLogManager";
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
console.log("🚀 INICIANDO TESTES DA ETAPA 095 - FILTRO DE STATUS HTTP");
console.log("=======================================================\n");

// 1. Classificação de Status HTTP
console.log("--- 1. Classificação de Famílias Operacionais de Status ---");
assert(classifyHttpStatus(200) === "2xx_success", "Status 200 é classificado como 2xx_success");
assert(classifyHttpStatus(201) === "2xx_success", "Status 201 é classificado como 2xx_success");
assert(classifyHttpStatus(204) === "2xx_success", "Status 204 é classificado como 2xx_success");

assert(classifyHttpStatus(400) === "4xx_client", "Status 400 é classificado como 4xx_client");
assert(classifyHttpStatus(401) === "4xx_client", "Status 401 é classificado como 4xx_client");
assert(classifyHttpStatus(403) === "4xx_client", "Status 403 é classificado como 4xx_client");
assert(classifyHttpStatus(404) === "4xx_client", "Status 404 é classificado como 4xx_client");
assert(classifyHttpStatus(422) === "4xx_client", "Status 422 é classificado como 4xx_client");

assert(classifyHttpStatus(429) === "429_rate_limit", "Status 429 é classificado como 429_rate_limit isolado");

assert(classifyHttpStatus(500) === "5xx_server", "Status 500 é classificado como 5xx_server");
assert(classifyHttpStatus(502) === "5xx_server", "Status 502 é classificado como 5xx_server");
assert(classifyHttpStatus(503) === "5xx_server", "Status 503 é classificado como 5xx_server");
assert(classifyHttpStatus(504) === "5xx_server", "Status 504 é classificado como 5xx_server");

assert(classifyHttpStatus(undefined, "success") === "2xx_success", "Fallback sem código e status 'success' classifica 2xx_success");
assert(classifyHttpStatus(undefined, "failed") === "5xx_server", "Fallback sem código e status 'failed' classifica 5xx_server");
assert(classifyHttpStatus(999) === "unknown", "Código desconhecido fora de 200-599 classifica unknown");

// 2. Cálculo Quantitativo Agregado
console.log("\n--- 2. Agregação Quantitativa de Status e Taxa de Sucesso ---");
const testLogs: DispatchLogEntry[] = [
  { id: "1", channel: "whatsapp", action: "group_broadcast", status: "success", statusCode: 200, message: "", payloadSummary: "", timestamp: "2026-10-27T10:00:00Z" },
  { id: "2", channel: "whatsapp", action: "group_broadcast", status: "success", statusCode: 201, message: "", payloadSummary: "", timestamp: "2026-10-27T10:01:00Z" },
  { id: "3", channel: "instagram", action: "publish", status: "success", statusCode: 200, message: "", payloadSummary: "", timestamp: "2026-10-27T10:02:00Z" },
  { id: "4", channel: "instagram", action: "publish", status: "failed", statusCode: 401, message: "Token expirado", payloadSummary: "", timestamp: "2026-10-27T10:03:00Z" },
  { id: "5", channel: "instagram", action: "publish", status: "failed", statusCode: 422, message: "Mídia inválida", payloadSummary: "", timestamp: "2026-10-27T10:04:00Z" },
  { id: "6", channel: "tiktok", action: "publish", status: "failed", statusCode: 429, message: "Rate limit Graph API", payloadSummary: "", timestamp: "2026-10-27T10:05:00Z" },
  { id: "7", channel: "autoblog", action: "publish", status: "failed", statusCode: 500, message: "Erro banco SQL", payloadSummary: "", timestamp: "2026-10-27T10:06:00Z" },
  { id: "8", channel: "wordpress", action: "publish", status: "failed", statusCode: 503, message: "Host indisponível", payloadSummary: "", timestamp: "2026-10-27T10:07:00Z" },
  { id: "9", channel: "newsletter", action: "publish", status: "success", statusCode: 200, message: "", payloadSummary: "", timestamp: "2026-10-27T10:08:00Z" },
  { id: "10", channel: "newsletter", action: "publish", status: "success", statusCode: 200, message: "", payloadSummary: "", timestamp: "2026-10-27T10:09:00Z" }
];

const counts = getLogStatusCounts(testLogs);
assert(counts.total === 10, "Total de eventos contabilizado: 10");
assert(counts.success2xx === 5, "Sucessos 2xx contabilizados: 5 (50%)");
assert(counts.clientErrors4xx === 2, "Erros de cliente 4xx contabilizados: 2");
assert(counts.rateLimit429 === 1, "Rate limits 429 contabilizados: 1");
assert(counts.serverErrors5xx === 2, "Erros de servidor 5xx contabilizados: 2");
assert(counts.allErrors === 5, "Todas as falhas somadas: 5 (4xx + 429 + 5xx)");
assert(counts.successRate === 50, "Taxa de sucesso percentual exata: 50%");

const emptyCounts = getLogStatusCounts([]);
assert(emptyCounts.total === 0 && emptyCounts.successRate === 100, "Coleção vazia retorna taxa defensiva 100%");

// 3. Filtragem por Status de Sucesso vs Falha
console.log("\n--- 3. Filtragem Estrita de Sucessos (2xx) vs. Falhas (4xx/5xx) ---");

// Apenas Sucesso 2xx
const onlySuccess = filterAndSortLogs(testLogs, { statusFilter: "success" });
assert(onlySuccess.length === 5, "Filtro 'success' retorna exatamente 5 itens 2xx");
assert(onlySuccess.every(l => l.statusCode >= 200 && l.statusCode < 300), "Todos os itens filtrados são estritamente 2xx");

// Todas as Falhas (4xx, 429, 5xx)
const onlyErrors = filterAndSortLogs(testLogs, { statusFilter: "all_errors" });
assert(onlyErrors.length === 5, "Filtro 'all_errors' retorna exatamente as 5 falhas");
assert(onlyErrors.every(l => l.statusCode >= 400), "Nenhum item em 'all_errors' possui status de sucesso 2xx");

// Retrocompatibilidade com 'failed'
const legacyFailed = filterAndSortLogs(testLogs, { statusFilter: "failed" });
assert(legacyFailed.length === 5, "Filtro legado 'failed' funciona identicamente a 'all_errors'");

// 4. Filtragem Granular por Subcategoria de Erro
console.log("\n--- 4. Filtragem Granular de Erros (4xx vs 429 vs 5xx) ---");

// Apenas 4xx Cliente
const only4xx = filterAndSortLogs(testLogs, { statusFilter: "client_errors_4xx" });
assert(only4xx.length === 2, "Filtro 'client_errors_4xx' retorna exatamente 2 itens");
assert(only4xx.every(l => l.statusCode === 401 || l.statusCode === 422), "Itens 4xx contêm apenas 401 e 422");

// Apenas 429 Rate Limit
const only429 = filterAndSortLogs(testLogs, { statusFilter: "rate_limit_429" });
assert(only429.length === 1 && only429[0].statusCode === 429, "Filtro 'rate_limit_429' isola especificamente o evento 429");

// Apenas 5xx Servidor
const only5xx = filterAndSortLogs(testLogs, { statusFilter: "server_errors_5xx" });
assert(only5xx.length === 2, "Filtro 'server_errors_5xx' retorna exatamente os 2 erros de servidor");
assert(only5xx.every(l => l.statusCode === 500 || l.statusCode === 503), "Itens 5xx contêm apenas 500 e 503");

// 5. Filtros Combinados (Canal + Status + Busca)
console.log("\n--- 5. Filtros Combinados Multi-dimensionais ---");

// Instagram + Erros de Cliente
const igClientErrors = filterAndSortLogs(testLogs, {
  channelFilter: "instagram",
  statusFilter: "client_errors_4xx"
});
assert(igClientErrors.length === 2 && igClientErrors.every(l => l.channel === "instagram"), "Filtra Instagram + Erros 4xx");

// WhatsApp + Sucesso
const waSuccess = filterAndSortLogs(testLogs, {
  channelFilter: "whatsapp",
  statusFilter: "success"
});
assert(waSuccess.length === 2 && waSuccess.every(l => l.channel === "whatsapp"), "Filtra WhatsApp + Sucesso 2xx");

// Busca por termo + Erros
const tokenError = filterAndSortLogs(testLogs, {
  searchQuery: "Token expirado",
  statusFilter: "all_errors"
});
assert(tokenError.length === 1 && tokenError[0].id === "4", "Busca textual combinada com filtro de erro localiza log exato");

console.log("\n=======================================================");
console.log(`📊 RESULTADO FINAL: ${passedTests}/${totalTests} TESTES APROVADOS!`);
console.log("=======================================================\n");

if (passedTests !== totalTests) {
  process.exit(1);
}
