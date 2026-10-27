/**
 * test-etapa094.ts - Teste de Homologação da Etapa 094
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Validações:
 * 1. Formatação de tamanho de payload (B, KB, MB)
 * 2. Serialização resiliente de JSON com indentação padronizada
 * 3. Geração de headers corporativos de auditoria
 * 4. Extração e síntese de payloads de Request e Response para múltiplos canais
 * 5. Tratamento de payloads de erro (401, 403, 422, 429, 500)
 * 6. Integridade sintática de strings JSON formatadas
 */

import {
  formatPayloadSize,
  formatJsonPayload,
  generateAuditHeaders,
  extractLogPayloads
} from "../src/lib/analytics/payloadInspector";
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
console.log("🚀 INICIANDO TESTES DA ETAPA 094 - LOG PAYLOAD INSPECTOR");
console.log("=======================================================\n");

// 1. Formatação de Tamanhos de Payload
console.log("--- 1. Medição e Formatação de Tamanho em Bytes ---");
assert(formatPayloadSize(500) === "500 B", "500 bytes é formatado como '500 B'");
assert(formatPayloadSize(1024) === "1.00 KB", "1024 bytes é formatado como '1.00 KB'");
assert(formatPayloadSize(2048) === "2.00 KB", "2048 bytes é formatado como '2.00 KB'");
assert(formatPayloadSize(1572864) === "1.50 MB", "1572864 bytes é formatado como '1.50 MB'");

// 2. Serialização JSON Resiliente
console.log("\n--- 2. Serialização Segura de JSON ---");
const sampleObj = { app: "Poster", version: 1 };
const jsonStr = formatJsonPayload(sampleObj);
assert(jsonStr.includes('"app": "Poster"'), "Serializa campos de objeto corretamente");
assert(jsonStr.includes("\n  "), "Aplica indentação de 2 espaços");

const nullJson = formatJsonPayload(null);
assert(nullJson === "{}", "Null é serializado como '{}'");

const undefinedJson = formatJsonPayload(undefined);
assert(undefinedJson === "{}", "Undefined é serializado como '{}'");

// 3. Headers Corporativos de Auditoria
console.log("\n--- 3. Geração de Headers HTTP Corporativos ---");
const headers = generateAuditHeaders("whatsapp", "wamid.HBgM12345");
assert(headers["content-type"].includes("application/json"), "Possui Content-Type application/json");
assert(headers["user-agent"].includes("V5-Apollo-Poster"), "Possui User-Agent institucional oficial");
assert(headers["x-apollo-dispatch-id"] === "wamid.HBgM12345", "Injeta o Remote Message ID no header x-apollo-dispatch-id");
assert(headers["x-apollo-channel"] === "whatsapp", "Injeta o canal correspondente no header x-apollo-channel");
assert(headers["x-apollo-zone"] === "sa-east-1-corp", "Identifica zona de computação corporativa");

// 4. Extração com Payloads Explícitos Fornecidos
console.log("\n--- 4. Preservação de Payloads Explícitos ---");
const explicitLog: DispatchLogEntry = {
  id: "log-exp-1",
  channel: "telegram",
  action: "group_broadcast",
  status: "success",
  statusCode: 200,
  message: "Broadcast enviado com sucesso",
  payloadSummary: "Cupom 20% OFF",
  timestamp: "2026-10-27T12:00:00Z",
  latencyMs: 42,
  ipAddress: "192.168.1.100",
  retryAttempt: 1,
  remoteMessageId: "tg_msg_custom_999",
  requestPayload: { custom_request: true, deal: "Fone Bluetooth" },
  responsePayload: { ok: true, result: { message_id: 999 } }
};

const extractedExplicit = extractLogPayloads(explicitLog);
assert(extractedExplicit.requestPayload.custom_request === true, "Preserva requestPayload original sem alterações");
assert((extractedExplicit.responsePayload.result as any).message_id === 999, "Preserva responsePayload original");
assert(extractedExplicit.remoteMessageId === "tg_msg_custom_999", "Preserva Remote Message ID original");
assert(extractedExplicit.latencyMs === 42, "Preserva latência original");
assert(extractedExplicit.ipAddress === "192.168.1.100", "Preserva IP de origem original");
assert(extractedExplicit.retryAttempt === 1, "Preserva tentativa de envio original");

// 5. Síntese de Payloads para Canais Sem Payload Bruto (WhatsApp, Telegram, TikTok, AutoBlog, Newsletter)
console.log("\n--- 5. Síntese Defensiva de Payloads por Canal ---");

// WhatsApp
const waLog: DispatchLogEntry = {
  id: "wa-101",
  channel: "whatsapp",
  action: "group_broadcast",
  status: "success",
  statusCode: 200,
  message: "Mensagem enviada",
  payloadSummary: "Oferta Notebook Dell",
  timestamp: "2026-10-27T10:00:00Z"
};
const waExtracted = extractLogPayloads(waLog);
assert(waExtracted.requestPayload.messaging_product === "whatsapp", "WhatsApp sintetiza messaging_product");
assert(waExtracted.responsePayload.status === "success", "WhatsApp sucesso sintetiza status success");
assert(JSON.parse(waExtracted.rawRequestJson).messaging_product === "whatsapp", "rawRequestJson é JSON parseável válido");
assert(JSON.parse(waExtracted.rawResponseJson).status === "success", "rawResponseJson é JSON parseável válido");

// Telegram
const tgLog: DispatchLogEntry = {
  id: "tg-102",
  channel: "telegram",
  action: "group_broadcast",
  status: "success",
  statusCode: 200,
  message: "Publicado no canal",
  payloadSummary: "Deal Cafeteira",
  timestamp: "2026-10-27T10:05:00Z"
};
const tgExtracted = extractLogPayloads(tgLog);
assert(tgExtracted.requestPayload.chat_id === "@v5_achadinhos_vip", "Telegram sintetiza chat_id oficial");

// Instagram
const igLog: DispatchLogEntry = {
  id: "ig-103",
  channel: "instagram",
  action: "publish",
  status: "success",
  statusCode: 200,
  message: "Reel publicado",
  payloadSummary: "Top 5 gadgets",
  timestamp: "2026-10-27T10:10:00Z"
};
const igExtracted = extractLogPayloads(igLog);
assert(igExtracted.requestPayload.media_type === "REELS", "Instagram sintetiza media_type REELS");

// TikTok
const tkLog: DispatchLogEntry = {
  id: "tk-104",
  channel: "tiktok",
  action: "publish",
  status: "success",
  statusCode: 200,
  message: "Vídeo publicado",
  payloadSummary: "Review Aspirador Robô",
  timestamp: "2026-10-27T10:15:00Z"
};
const tkExtracted = extractLogPayloads(tkLog);
assert((tkExtracted.requestPayload.post_info as any).privacy_level === "PUBLIC_TO_EVERYONE", "TikTok sintetiza privacy_level");

// AutoBlog
const abLog: DispatchLogEntry = {
  id: "ab-105",
  channel: "autoblog",
  action: "publish",
  status: "success",
  statusCode: 201,
  message: "Artigo publicado no blog",
  payloadSummary: "Tendências IA 2026",
  timestamp: "2026-10-27T10:20:00Z"
};
const abExtracted = extractLogPayloads(abLog);
assert(abExtracted.requestPayload.status === "publish", "AutoBlog sintetiza status publish");

// Newsletter
const nlLog: DispatchLogEntry = {
  id: "nl-106",
  channel: "newsletter",
  action: "publish",
  status: "success",
  statusCode: 200,
  message: "Newsletter enviada para assinantes",
  payloadSummary: "Weekly Tech Digest #48",
  timestamp: "2026-10-27T10:25:00Z"
};
const nlExtracted = extractLogPayloads(nlLog);
assert(String(nlExtracted.requestPayload.from).includes("Apollo La Plata"), "Newsletter sintetiza remetente institucional");

// 6. Síntese de Respostas de Erro (429, 401, 422, 500)
console.log("\n--- 6. Respostas Sintetizadas de Erros (4xx & 5xx) ---");

// 429 Rate Limit
const rateLimitLog: DispatchLogEntry = {
  id: "err-429",
  channel: "instagram",
  action: "publish",
  status: "failed",
  statusCode: 429,
  message: "Rate limit excedido",
  payloadSummary: "Post diário",
  timestamp: "2026-10-27T11:00:00Z"
};
const rateLimitExtracted = extractLogPayloads(rateLimitLog);
const rateLimitErr = rateLimitExtracted.responsePayload.error as any;
assert(rateLimitErr.code === 429 && rateLimitErr.type === "OAuthRateLimitException", "Erro 429 sintetiza OAuthRateLimitException");
assert(rateLimitErr.retry_after_seconds === 60, "Erro 429 sugere retry_after_seconds = 60");

// 401 Unauthorized
const authLog: DispatchLogEntry = {
  id: "err-401",
  channel: "tiktok",
  action: "publish",
  status: "failed",
  statusCode: 401,
  message: "Token inválido",
  payloadSummary: "Post",
  timestamp: "2026-10-27T11:05:00Z"
};
const authExtracted = extractLogPayloads(authLog);
assert((authExtracted.responsePayload.error as any).type === "OAuthPermissionsException", "Erro 401 sintetiza OAuthPermissionsException");

// 422 Unprocessable Entity
const invalidLog: DispatchLogEntry = {
  id: "err-422",
  channel: "instagram",
  action: "publish",
  status: "failed",
  statusCode: 422,
  message: "Parâmetros inválidos",
  payloadSummary: "Reel",
  timestamp: "2026-10-27T11:10:00Z"
};
const invalidExtracted = extractLogPayloads(invalidLog);
assert((invalidExtracted.responsePayload.error as any).code === 422, "Erro 422 sintetiza validation_errors com código 422");

// 500 Server Error
const serverErrLog: DispatchLogEntry = {
  id: "err-500",
  channel: "whatsapp",
  action: "group_broadcast",
  status: "failed",
  statusCode: 500,
  message: "Falha interna no gateway",
  payloadSummary: "Broadcast",
  timestamp: "2026-10-27T11:15:00Z"
};
const serverErrExtracted = extractLogPayloads(serverErrLog);
assert((serverErrExtracted.responsePayload.error as any).code === 500, "Erro 500 sintetiza falha de cluster remoto");

// 7. Validação de Tamanhos Formatados
console.log("\n--- 7. Cálculo e Medição de Tamanhos de Payloads ---");
assert(waExtracted.requestSizeFormatted.endsWith("B") || waExtracted.requestSizeFormatted.endsWith("KB"), "Calcula tamanho do request em B ou KB");
assert(waExtracted.responseSizeFormatted.endsWith("B") || waExtracted.responseSizeFormatted.endsWith("KB"), "Calcula tamanho da response em B ou KB");

console.log("\n=======================================================");
console.log(`📊 RESULTADO FINAL: ${passedTests}/${totalTests} TESTES APROVADOS!`);
console.log("=======================================================\n");

if (passedTests !== totalTests) {
  process.exit(1);
}
