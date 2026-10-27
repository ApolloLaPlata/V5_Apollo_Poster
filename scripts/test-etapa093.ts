/**
 * test-etapa093.ts - Teste de Homologação da Etapa 093
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Validações:
 * 1. Mapeamento de status HTTP e badges de conformidade (2xx, 4xx, 5xx, 429)
 * 2. Identificação determinística de Remote Message IDs por canal
 * 3. Filtragem multi-critério de logs (busca, canal, status)
 * 4. Paginação dinâmica e limites de fatiamento
 * 5. Formatação temporal de auditoria corporativa
 */

import {
  getHttpStatusBadgeInfo,
  getLogRemoteMessageId,
  filterAndSortLogs,
  paginateLogs,
  formatAuditDateTime
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
console.log("🚀 INICIANDO TESTES DA ETAPA 093 - AUDIT LOGS MANAGER");
console.log("=======================================================\n");

// 1. Testes de Status HTTP e Badges
console.log("--- 1. Mapeamento de Status HTTP ---");
const badge200 = getHttpStatusBadgeInfo(200);
assert(badge200.isSuccess === true && badge200.label === "200 OK", "Status 200 é marcado como sucesso '200 OK'");

const badge201 = getHttpStatusBadgeInfo(201);
assert(badge201.isSuccess === true && badge201.label === "201 CREATED", "Status 201 é marcado como '201 CREATED'");

const badge202 = getHttpStatusBadgeInfo(202);
assert(badge202.isSuccess === true && badge202.label === "202 ACCEPTED", "Status 202 é marcado como '202 ACCEPTED'");

const badge401 = getHttpStatusBadgeInfo(401);
assert(badge401.isSuccess === false && badge401.label === "401 UNAUTHORIZED", "Status 401 mapeia para 401 UNAUTHORIZED");

const badge403 = getHttpStatusBadgeInfo(403);
assert(badge403.isSuccess === false && badge403.label === "403 FORBIDDEN", "Status 403 mapeia para 403 FORBIDDEN");

const badge404 = getHttpStatusBadgeInfo(404);
assert(badge404.isSuccess === false && badge404.label === "404 NOT FOUND", "Status 404 mapeia para 404 NOT FOUND");

const badge422 = getHttpStatusBadgeInfo(422);
assert(badge422.isSuccess === false && badge422.label === "422 INVALID", "Status 422 mapeia para 422 INVALID");

const badge429 = getHttpStatusBadgeInfo(429);
assert(badge429.isSuccess === false && badge429.label === "429 RATE LIMIT" && badge429.badgeBg.includes("purple"), "Status 429 mapeia para badge roxa RATE LIMIT");

const badge500 = getHttpStatusBadgeInfo(500);
assert(badge500.isSuccess === false && badge500.label === "500 SERVER ERR", "Status 500 mapeia para 500 SERVER ERR");

const badge502 = getHttpStatusBadgeInfo(502);
assert(badge502.isSuccess === false && badge502.label === "502 BAD GATEWAY", "Status 502 mapeia para 502 BAD GATEWAY");

const badge503 = getHttpStatusBadgeInfo(503);
assert(badge503.isSuccess === false && badge503.label === "503 UNAVAILABLE", "Status 503 mapeia para 503 UNAVAILABLE");

const badge504 = getHttpStatusBadgeInfo(504);
assert(badge504.isSuccess === false && badge504.label === "504 TIMEOUT", "Status 504 mapeia para 504 TIMEOUT");

const badgeUnknown = getHttpStatusBadgeInfo(999);
assert(badgeUnknown.isSuccess === false && badgeUnknown.label === "999 UNKNOWN", "Status desconhecido possui fallback seguro");

// 2. Testes de MessageId Remoto
console.log("\n--- 2. Identificação e Prefixação de Remote Message IDs ---");
const explicitLog: DispatchLogEntry = {
  id: "log-1",
  channel: "whatsapp",
  action: "group_broadcast",
  status: "success",
  statusCode: 200,
  payloadSummary: "Envio de deal VIP",
  message: "Mensagem enviada",
  timestamp: new Date().toISOString(),
  remoteMessageId: "wamid.CUSTOM_ID_12345"
};
assert(getLogRemoteMessageId(explicitLog) === "wamid.CUSTOM_ID_12345", "Preserva remoteMessageId explícito se já fornecido");

const waLog: DispatchLogEntry = { id: "wa-abc", channel: "whatsapp", action: "group_broadcast", status: "success", statusCode: 200, payloadSummary: "", message: "", timestamp: "" };
assert(getLogRemoteMessageId(waLog).startsWith("wamid.HBgM") && getLogRemoteMessageId(waLog).endsWith(".V5=="), "Gera ID padrão WhatsApp wamid.HBgM...");

const tgLog: DispatchLogEntry = { id: "tg-abc", channel: "telegram", action: "group_broadcast", status: "success", statusCode: 200, payloadSummary: "", message: "", timestamp: "" };
assert(getLogRemoteMessageId(tgLog).startsWith("tg_msg_"), "Gera ID padrão Telegram tg_msg_...");

const igLog: DispatchLogEntry = { id: "ig-abc", channel: "instagram", action: "publish", status: "success", statusCode: 200, payloadSummary: "", message: "", timestamp: "" };
assert(getLogRemoteMessageId(igLog).startsWith("ig_media_"), "Gera ID padrão Instagram ig_media_...");

const tkLog: DispatchLogEntry = { id: "tk-abc", channel: "tiktok", action: "publish", status: "success", statusCode: 200, payloadSummary: "", message: "", timestamp: "" };
assert(getLogRemoteMessageId(tkLog).startsWith("tk_v_publish_"), "Gera ID padrão TikTok tk_v_publish_...");

const ytLog: DispatchLogEntry = { id: "yt-abc", channel: "youtube", action: "publish", status: "success", statusCode: 200, payloadSummary: "", message: "", timestamp: "" };
assert(getLogRemoteMessageId(ytLog).startsWith("yt_data_v3_"), "Gera ID padrão YouTube yt_data_v3_...");

const emailLog: DispatchLogEntry = { id: "em-abc", channel: "newsletter", action: "publish", status: "success", statusCode: 200, payloadSummary: "", message: "", timestamp: "" };
assert(getLogRemoteMessageId(emailLog).startsWith("resend_email_"), "Gera ID padrão Resend Newsletter resend_email_...");

const abLog: DispatchLogEntry = { id: "ab-abc", channel: "autoblog", action: "publish", status: "success", statusCode: 200, payloadSummary: "", message: "", timestamp: "" };
assert(getLogRemoteMessageId(abLog).startsWith("autoblog_post_"), "Gera ID padrão AutoBlog autoblog_post_...");

const wpLog: DispatchLogEntry = { id: "wp-abc", channel: "wordpress", action: "publish", status: "success", statusCode: 200, payloadSummary: "", message: "", timestamp: "" };
assert(getLogRemoteMessageId(wpLog).startsWith("wp_post_"), "Gera ID padrão WordPress wp_post_...");

// 3. Testes de Filtros e Ordenação
console.log("\n--- 3. Filtros Multi-critério e Busca Textual ---");
const sampleLogs: DispatchLogEntry[] = [
  {
    id: "l1",
    channel: "whatsapp",
    action: "group_broadcast",
    status: "success",
    statusCode: 200,
    message: "Transmissão para VIP 01 concluída",
    payloadSummary: "Deal: Notebook Dell R$ 3500",
    timestamp: "2026-10-27T10:00:00Z"
  },
  {
    id: "l2",
    channel: "instagram",
    action: "publish",
    status: "failed",
    statusCode: 429,
    message: "Rate limit excedido na Graph API",
    payloadSummary: "Reel Achadinhos",
    timestamp: "2026-10-27T11:00:00Z"
  },
  {
    id: "l3",
    channel: "newsletter",
    action: "publish",
    status: "success",
    statusCode: 201,
    message: "Disparo da edição #42 enviado para 5000 assinantes",
    payloadSummary: "Beehiiv Tech Pulse",
    timestamp: "2026-10-27T12:00:00Z"
  },
  {
    id: "l4",
    channel: "autoblog",
    action: "publish",
    status: "failed",
    statusCode: 500,
    message: "Erro interno no servidor de blog",
    payloadSummary: "Artigo IA Programática",
    timestamp: "2026-10-27T09:00:00Z"
  }
];

// Filtro por canal
const waOnly = filterAndSortLogs(sampleLogs, { channelFilter: "whatsapp" });
assert(waOnly.length === 1 && waOnly[0].channel === "whatsapp", "Filtra estritamente por canal whatsapp");

// Filtro por status
const successOnly = filterAndSortLogs(sampleLogs, { statusFilter: "success" });
assert(successOnly.length === 2 && successOnly.every(l => l.status === "success"), "Filtra apenas eventos de sucesso");

const failedOnly = filterAndSortLogs(sampleLogs, { statusFilter: "failed" });
assert(failedOnly.length === 2 && failedOnly.every(l => l.status === "failed"), "Filtra apenas eventos de falha");

// Busca textual por termo
const searchNotebook = filterAndSortLogs(sampleLogs, { searchQuery: "Notebook" });
assert(searchNotebook.length === 1 && searchNotebook[0].id === "l1", "Busca textual encontra termo dentro de payloadSummary");

const searchGraph = filterAndSortLogs(sampleLogs, { searchQuery: "Graph API" });
assert(searchGraph.length === 1 && searchGraph[0].id === "l2", "Busca textual encontra termo na mensagem de erro");

const searchCode = filterAndSortLogs(sampleLogs, { searchQuery: "429" });
assert(searchCode.length === 1 && searchCode[0].id === "l2", "Busca textual localiza logs pelo código HTTP");

// Ordenação cronológica
const sortedDesc = filterAndSortLogs(sampleLogs, { sortOrder: "desc" });
assert(sortedDesc[0].id === "l3" && sortedDesc[sortedDesc.length - 1].id === "l4", "Ordena decrescente por data/hora corretamente");

const sortedAsc = filterAndSortLogs(sampleLogs, { sortOrder: "asc" });
assert(sortedAsc[0].id === "l4" && sortedAsc[sortedAsc.length - 1].id === "l3", "Ordena crescente por data/hora corretamente");

// 4. Testes de Paginação
console.log("\n--- 4. Paginação Dinâmica ---");
const mock25Logs: DispatchLogEntry[] = Array.from({ length: 25 }, (_, i) => ({
  id: `mock-${i + 1}`,
  channel: "autoblog",
  action: "publish",
  status: "success",
  statusCode: 200,
  payloadSummary: `Resumo payload ${i + 1}`,
  message: `Log index ${i + 1}`,
  timestamp: new Date(Date.now() - i * 60000).toISOString()
}));

const p1 = paginateLogs(mock25Logs, 1, 10);
assert(p1.items.length === 10 && p1.currentPage === 1 && p1.totalPages === 3, "Página 1 contém 10 itens de 3 páginas totais");
assert(p1.startIndex === 0 && p1.endIndex === 10, "Página 1 tem fatia de 0 a 10");

const p2 = paginateLogs(mock25Logs, 2, 10);
assert(p2.items.length === 10 && p2.currentPage === 2 && p2.startIndex === 10 && p2.endIndex === 20, "Página 2 fatia de 10 a 20");

const p3 = paginateLogs(mock25Logs, 3, 10);
assert(p3.items.length === 5 && p3.currentPage === 3 && p3.startIndex === 20 && p3.endIndex === 25, "Página 3 contém os últimos 5 itens");

const pOverflow = paginateLogs(mock25Logs, 99, 10);
assert(pOverflow.currentPage === 3 && pOverflow.items.length === 5, "Página acima do limite é ajustada para a última página");

const pEmpty = paginateLogs([], 1, 10);
assert(pEmpty.items.length === 0 && pEmpty.totalCount === 0 && pEmpty.totalPages === 1, "Coleção vazia é tratada de forma resiliente");

// 5. Testes de Formatação Temporal
console.log("\n--- 5. Formatação de Data e Hora ---");
const formattedDate = formatAuditDateTime("2026-10-27T15:30:45Z");
assert(typeof formattedDate === "string" && formattedDate.length > 5, "Data ISO válida é formatada com sucesso");

const invalidFallback = formatAuditDateTime("data-invalida-xyz");
assert(invalidFallback === "data-invalida-xyz", "Data inválida retorna o texto original sem gerar exceção");

console.log("\n=======================================================");
console.log(`📊 RESULTADO FINAL: ${passedTests}/${totalTests} TESTES APROVADOS!`);
console.log("=======================================================\n");

if (passedTests !== totalTests) {
  process.exit(1);
}
