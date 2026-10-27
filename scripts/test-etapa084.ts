/**
 * test-etapa084.ts - Teste de Validação da Etapa 084
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Validação do Sistema de Retentativas Automáticas com Backoff Exponencial (retryManager.ts):
 * - Identificação precisa de erros recuperáveis 5xx / 429 e erros de conexão (isRetryableError)
 * - Rejeição imediata de erros de autenticação/cliente 4xx sem retentativas inúteis
 * - Curva de Backoff Exponencial (2s -> 4s -> 8s) e variação anti-colisão (Jitter)
 * - Avaliação determinística da decisão de retry (evaluateRetryDecision)
 * - Limite estrito de até 3 tentativas antes de marcar como falha permanente
 * - Aplicação atômica em QueueItem e ScheduledPost
 * - Formatação de contagem regressiva de retry (formatRetryCountdown)
 * - Integração completa com Zustand Store (usePosterStore)
 */

import {
  DEFAULT_RETRY_CONFIG,
  isRetryableError,
  calculateExponentialBackoff,
  evaluateRetryDecision,
  applyRetryToQueueItem,
  applyRetryToScheduledPost,
  formatRetryCountdown
} from "../src/lib/queue/retryManager";
import { QueueItem, ScheduledPost } from "../src/types/poster";
import { usePosterStore } from "../src/store/usePosterStore";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${label}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${label}`);
  }
}

console.log("\n=======================================================");
console.log("TESTE ETAPA 084: SISTEMA DE RETENTATIVAS E BACKOFF");
console.log("=======================================================\n");

// 1. Configurações Padrão de Retentativa
console.log("1. Validando DEFAULT_RETRY_CONFIG...");
assert(DEFAULT_RETRY_CONFIG.maxAttempts === 3, "Máximo padrão fixado em 3 tentativas");
assert(DEFAULT_RETRY_CONFIG.baseDelayMs === 2000, "Delay base inicial de 2.000 ms (2s)");
assert(DEFAULT_RETRY_CONFIG.backoffFactor === 2, "Fator de multiplicação exponencial é 2");
assert(DEFAULT_RETRY_CONFIG.maxDelayMs === 60000, "Teto máximo de delay limitado em 60.000 ms (1m)");
assert(DEFAULT_RETRY_CONFIG.enableJitter === true, "Jitter anti-colisão habilitado por padrão");

// 2. Classificador de Erros Recuperáveis vs. Fatais (isRetryableError)
console.log("\n2. Validando isRetryableError...");
// Erros 5xx de Servidor (Recuperáveis)
assert(isRetryableError(null, 500) === true, "HTTP 500 é recuperável");
assert(isRetryableError(null, 502) === true, "HTTP 502 Bad Gateway é recuperável");
assert(isRetryableError(null, 503) === true, "HTTP 503 Service Unavailable é recuperável");
assert(isRetryableError(null, 504) === true, "HTTP 504 Gateway Timeout é recuperável");
assert(isRetryableError(null, 429) === true, "HTTP 429 Rate Limit é recuperável");
assert(isRetryableError(null, 408) === true, "HTTP 408 Request Timeout é recuperável");

// Erros 4xx de Cliente / Autenticação (Fatais - Não Recuperáveis)
assert(isRetryableError(null, 400) === false, "HTTP 400 Bad Request é fatal");
assert(isRetryableError(null, 401) === false, "HTTP 401 Unauthorized é fatal");
assert(isRetryableError(null, 403) === false, "HTTP 403 Forbidden é fatal");
assert(isRetryableError(null, 404) === false, "HTTP 404 Not Found é fatal");
assert(isRetryableError(null, 422) === false, "HTTP 422 Unprocessable Entity é fatal");

// Erros de Rede e Exceções
assert(isRetryableError(new Error("connect ETIMEDOUT 157.240.22.35:443")) === true, "Erro de rede ETIMEDOUT é recuperável");
assert(isRetryableError(new Error("read ECONNRESET")) === true, "Erro de conexão ECONNRESET é recuperável");
assert(isRetryableError("FETCH_ERROR: failed to fetch upstream") === true, "String com FETCH_ERROR é recuperável");
assert(isRetryableError("Validation error: field 'title' is missing") === false, "Erro de validação sem termos de rede é fatal");

// 3. Cálculo da Curva de Backoff Exponencial
console.log("\n3. Validando calculateExponentialBackoff...");
const noJitterConfig = { enableJitter: false };
assert(calculateExponentialBackoff(1, noJitterConfig) === 2000, "Tentativa 1: 2.000 ms (2s)");
assert(calculateExponentialBackoff(2, noJitterConfig) === 4000, "Tentativa 2: 4.000 ms (4s)");
assert(calculateExponentialBackoff(3, noJitterConfig) === 8000, "Tentativa 3: 8.000 ms (8s)");
assert(calculateExponentialBackoff(4, noJitterConfig) === 16000, "Tentativa 4: 16.000 ms (16s)");

// Respeito ao teto máximo (maxDelayMs)
const cappedDelay = calculateExponentialBackoff(10, { maxDelayMs: 30000, enableJitter: false });
assert(cappedDelay === 30000, "Backoff respeita o teto máximo de delay configurado");

// Jitter dentro da dispersão configurada (±20%)
const minJitterDelay = calculateExponentialBackoff(1, { enableJitter: true }, 0.0); // -20% -> 1600
const maxJitterDelay = calculateExponentialBackoff(1, { enableJitter: true }, 1.0); // +20% -> 2400
assert(minJitterDelay === 1600, "Jitter mínimo calculado em 1.600 ms (-20%)");
assert(maxJitterDelay === 2400, "Jitter máximo calculado em 2.400 ms (+20%)");

// 4. Avaliação Determinística da Decisão de Retry (evaluateRetryDecision)
console.log("\n4. Validando evaluateRetryDecision...");
const baseRefDate = new Date("2026-10-27T12:00:00.000Z");

// Falha 1 (Tentativa 1 de 3) com erro 503 -> Deve retentar
const dec1 = evaluateRetryDecision(1, 3, null, 503, noJitterConfig, baseRefDate);
assert(dec1.action === "retry", "Decisão 1 é 'retry'");
assert(dec1.nextStatus === "queued", "Próximo status é 'queued'");
assert(dec1.attemptNumber === 2, "Próxima tentativa será a 2");
assert(dec1.attemptsRemaining === 1, "Resta 1 tentativa após a próxima");
assert(dec1.delayMs === 2000, "Delay calculado de 2.000 ms");
assert(dec1.nextAttemptAt === "2026-10-27T12:00:02.000Z", "nextAttemptAt agendado para +2s");
assert(dec1.isRetryable === true, "Marcado como recuperável");
assert(dec1.exhausted === false, "Não esgotou tentativas");

// Falha 2 (Tentativa 2 de 3) com erro 502 -> Deve retentar
const dec2 = evaluateRetryDecision(2, 3, null, 502, noJitterConfig, baseRefDate);
assert(dec2.action === "retry", "Decisão 2 é 'retry'");
assert(dec2.attemptNumber === 3, "Próxima tentativa será a 3");
assert(dec2.attemptsRemaining === 0, "0 tentativas restantes após a 3");
assert(dec2.delayMs === 4000, "Delay calculado de 4.000 ms (+4s)");

// Falha 3 (Tentativa 3 de 3) -> Esgotou limite de 3 tentativas -> Falha Permanente
const dec3 = evaluateRetryDecision(3, 3, null, 500, noJitterConfig, baseRefDate);
assert(dec3.action === "fail_permanently", "Esgotamento de 3 tentativas resulta em 'fail_permanently'");
assert(dec3.nextStatus === "failed", "Próximo status é 'failed'");
assert(dec3.exhausted === true, "exhausted é true");
assert(dec3.attemptsRemaining === 0, "0 tentativas restantes");

// Erro 401 Fatal -> Falha Permanente Imediata (mesmo na tentativa 1)
const decFatal = evaluateRetryDecision(1, 3, null, 401, noJitterConfig, baseRefDate);
assert(decFatal.action === "fail_permanently", "Erro 401 resulta em 'fail_permanently' imediato");
assert(decFatal.isRetryable === false, "isRetryable é false para 401");

// 5. Aplicação Atômica em QueueItem (applyRetryToQueueItem)
console.log("\n5. Validando applyRetryToQueueItem...");
const sampleQueueItem: QueueItem = {
  id: "q_retry_item_1",
  entityId: "post-10",
  entityType: "post",
  title: "Post de Teste Retry",
  platforms: ["instagram"],
  scheduledFor: "2026-10-27T12:00:00.000Z",
  priority: "high",
  status: "processing",
  attempts: 1,
  maxAttempts: 3,
  createdAt: "2026-10-27T10:00:00.000Z",
  updatedAt: "2026-10-27T12:00:00.000Z"
};

// Aplica retry em falha 503 temporária
const { item: queuedRetryItem, decision: retryDec } = applyRetryToQueueItem(
  sampleQueueItem,
  null,
  503,
  noJitterConfig,
  baseRefDate
);
assert(queuedRetryItem.status === "queued", "QueueItem retornou para status 'queued'");
assert(Boolean(queuedRetryItem.nextAttemptAt), "nextAttemptAt gravado no QueueItem");
assert(queuedRetryItem.scheduledFor === queuedRetryItem.nextAttemptAt, "scheduledFor sincronizado com nextAttemptAt");
assert(retryDec.action === "retry", "Decisão reportada como 'retry'");

// Aplica falha fatal em item com 3 tentativas
const sampleExhaustedItem: QueueItem = {
  ...sampleQueueItem,
  attempts: 3
};
const { item: failedQueueItem, decision: failDec } = applyRetryToQueueItem(
  sampleExhaustedItem,
  null,
  503,
  noJitterConfig,
  baseRefDate
);
assert(failedQueueItem.status === "failed", "QueueItem esgotado marcado com status 'failed'");
assert(failedQueueItem.nextAttemptAt === undefined, "nextAttemptAt removido de item em falha definitiva");
assert(failDec.action === "fail_permanently", "Decisão reportada como 'fail_permanently'");

// 6. Aplicação em ScheduledPost Tradicional (applyRetryToScheduledPost)
console.log("\n6. Validando applyRetryToScheduledPost...");
const samplePost: ScheduledPost = {
  id: "post_retry_test",
  title: "Post Tradicional",
  content: "Conteúdo...",
  platforms: ["tiktok"],
  scheduledAt: "2026-10-27T12:00:00",
  status: "processing",
  retryCount: 1,
  tags: []
};

const { post: retriedPost } = applyRetryToScheduledPost(samplePost, null, 502, noJitterConfig, baseRefDate);
assert(retriedPost.status === "scheduled", "ScheduledPost retornou para status 'scheduled'");
assert(retriedPost.retryCount === 2, "retryCount atualizado para 2");
assert(retriedPost.scheduledAt === "2026-10-27T12:00:02.000Z", "scheduledAt postergado conforme delay");

// 7. Formatação de Contagem Regressiva (formatRetryCountdown)
console.log("\n7. Validando formatRetryCountdown...");
const futureRef = new Date("2026-10-27T12:00:00.000Z");
assert(formatRetryCountdown("2026-10-27T12:00:05.000Z", futureRef) === "em 5s", "Formata 5 segundos como 'em 5s'");
assert(formatRetryCountdown("2026-10-27T12:01:30.000Z", futureRef) === "em 1m 30s", "Formata 90 segundos como 'em 1m 30s'");
assert(formatRetryCountdown("2026-10-27T11:59:59.000Z", futureRef) === "Imediato", "Formata data passada como 'Imediato'");

// 8. Integração com Zustand Store (usePosterStore)
console.log("\n8. Validando Integração no Zustand Store (usePosterStore)...");
const store = usePosterStore.getState();

const testQueueItem: QueueItem = {
  ...sampleQueueItem,
  id: "queue_retry_zustand_test",
  attempts: 1,
  status: "processing"
};
store.enqueueQueueItem(testQueueItem);

// Dispara retry no store com erro 503
store.retryQueueItem(testQueueItem.id, "503 Service Unavailable", 503);
let updatedState = usePosterStore.getState();
let itemInStore = updatedState.dispatchQueue.find(i => i.id === testQueueItem.id);
assert(itemInStore?.status === "queued", "Zustand colocou o item em 'queued' para retry");
assert(Boolean(itemInStore?.nextAttemptAt), "Zustand registrou nextAttemptAt no item");

// Limpeza
store.removeQueueItem(testQueueItem.id);

console.log("\n=======================================================");
console.log(`TOTAL DE ASSERÇÕES: ${passed + failed}`);
console.log(`PASSOU: ${passed}`);
console.log(`FALHOU: ${failed}`);
console.log("=======================================================\n");

if (failed === 0) {
  console.log("✅ TODOS OS TESTES DA ETAPA 084 FORAM APROVADOS COM SUCESSO!");
  process.exit(0);
} else {
  console.error("❌ FALHA NOS TESTES DA ETAPA 084.");
  process.exit(1);
}
