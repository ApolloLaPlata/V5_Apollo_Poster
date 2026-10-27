/**
 * test-etapa083.ts - Teste de Validação da Etapa 083
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Validação da Transição de Estados de Tarefa (taskStateTransition.ts):
 * - Grafo Direcionado de Estados Permitidos (ALLOWED_STATE_TRANSITIONS)
 * - Validador determinístico (canTransition / validateTransition)
 * - Bloqueio de transições ilegais sem processing (scheduled -> published)
 * - Carimbos atômicos e contagem de tentativas (attempts / lastAttemptAt / completedAt)
 * - Rastreamento e auditoria (createTransitionAuditRecord)
 * - Adaptadores para QueueItem, ScheduledPost e GroupBroadcastDeal
 * - Transições em lote resilientes (transitionBatchQueueItems)
 * - Integração completa com Zustand Store (usePosterStore)
 */

import {
  ALLOWED_STATE_TRANSITIONS,
  canTransition,
  validateTransition,
  createTransitionAuditRecord,
  transitionQueueItem,
  transitionScheduledPost,
  transitionBroadcastDeal,
  transitionBatchQueueItems
} from "../src/lib/queue/taskStateTransition";
import { QueueItem, ScheduledPost, GroupBroadcastDeal } from "../src/types/poster";
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
console.log("TESTE ETAPA 083: TRANSIÇÃO DE ESTADOS DE TAREFA (FSM)");
console.log("=======================================================\n");

// 1. Matriz de Estados Permitidos (ALLOWED_STATE_TRANSITIONS)
console.log("1. Validando Grafo FSM de Estados Permitidos...");
assert(ALLOWED_STATE_TRANSITIONS.scheduled.includes("processing"), "scheduled pode transitar para processing");
assert(ALLOWED_STATE_TRANSITIONS.scheduled.includes("queued"), "scheduled pode transitar para queued");
assert(ALLOWED_STATE_TRANSITIONS.scheduled.includes("cancelled"), "scheduled pode transitar para cancelled");
assert(!ALLOWED_STATE_TRANSITIONS.scheduled.includes("published"), "scheduled NÃO pode pular direto para published");

assert(ALLOWED_STATE_TRANSITIONS.processing.includes("published"), "processing pode transitar para published");
assert(ALLOWED_STATE_TRANSITIONS.processing.includes("failed"), "processing pode transitar para failed");
assert(ALLOWED_STATE_TRANSITIONS.failed.includes("queued"), "failed pode retornar para queued (retry)");

// 2. Validação com canTransition e validateTransition
console.log("\n2. Validando canTransition e validateTransition...");
assert(canTransition("scheduled", "processing") === true, "canTransition retorna true para transição válida");
assert(canTransition("scheduled", "published") === false, "canTransition retorna false para transição inválida");
assert(canTransition("scheduled", "scheduled") === true, "Transição idempotente para o mesmo estado é válida");
assert(canTransition("scheduled", "published", true) === true, "Flag force=true permite bypass explícito");

const validResult = validateTransition("queued", "processing");
assert(validResult.valid === true, "validateTransition aprova queued -> processing");

const invalidResult = validateTransition("scheduled", "published");
assert(invalidResult.valid === false, "validateTransition reprova scheduled -> published");
assert(Boolean(invalidResult.reason && invalidResult.reason.includes("Transição inválida")), "Retorna justificativa técnica detalhada");

// 3. Registro de Auditoria de Transição (createTransitionAuditRecord)
console.log("\n3. Validando createTransitionAuditRecord...");
const prevTime = "2026-10-27T10:00:00.000Z";
const currTime = "2026-10-27T10:02:30.000Z"; // 150.000 ms depois
const audit = createTransitionAuditRecord("scheduled", "processing", { reason: "Tick periódico disparou" }, prevTime);

assert(audit.transitionId.startsWith("trans_"), "Gera transitionId com prefixo 'trans_'");
assert(audit.fromStatus === "scheduled" && audit.toStatus === "processing", "Registra estados de origem e destino");
assert(audit.reason === "Tick periódico disparou", "Preserva o motivo da transição");

const auditDuration = createTransitionAuditRecord(
  "queued",
  "processing",
  { timestamp: currTime },
  prevTime
);
assert(auditDuration.durationInPreviousStateMs === 150000, "Calculou 150.000 ms (2m 30s) de permanência no estado anterior");

// 4. Transição Atômica de QueueItem (transitionQueueItem)
console.log("\n4. Validando Transição de QueueItem...");
const initialQueueItem: QueueItem = {
  id: "q_task_test",
  entityId: "post-1",
  entityType: "post",
  title: "Artigo V5 AutoBlog",
  platforms: ["autoblog"],
  scheduledFor: "2026-10-27T14:00:00.000Z",
  priority: "normal",
  status: "scheduled",
  attempts: 0,
  maxAttempts: 3,
  createdAt: "2026-10-27T08:00:00.000Z",
  updatedAt: "2026-10-27T08:00:00.000Z"
};

// scheduled -> processing
const processingItem = transitionQueueItem(initialQueueItem, "processing");
assert(processingItem.status === "processing", "Transitou para 'processing'");
assert(processingItem.attempts === 1, "Incrementou tentativas para 1");
assert(Boolean(processingItem.lastAttemptAt), "Carimbou lastAttemptAt");

// processing -> published
const publishedItem = transitionQueueItem(processingItem, "published");
assert(publishedItem.status === "published", "Transitou para 'published'");
assert(Boolean(publishedItem.completedAt), "Carimbou completedAt");
assert(publishedItem.attempts === 1, "Manteve attempts = 1");

// processing -> failed
const failedItem = transitionQueueItem(processingItem, "failed", {
  errorMessage: "HTTP 503 Service Unavailable"
});
assert(failedItem.status === "failed", "Transitou para 'failed'");
assert(failedItem.errorMessage === "HTTP 503 Service Unavailable", "Gravou mensagem de erro detalhada");

// Tentativa de transição ilegal sem passar por processing lança erro
let thrownError = false;
try {
  transitionQueueItem(initialQueueItem, "published");
} catch (err) {
  thrownError = true;
}
assert(thrownError === true, "Lançou exceção ao tentar pular scheduled diretamente para published");

// 5. Transição de ScheduledPost (transitionScheduledPost)
console.log("\n5. Validando Transição de ScheduledPost...");
const samplePost: ScheduledPost = {
  id: "p_post_test",
  title: "Post Social",
  content: "Conteúdo...",
  platforms: ["instagram"],
  scheduledAt: "2026-10-27T16:00:00",
  status: "scheduled",
  tags: []
};

const procPost = transitionScheduledPost(samplePost, "processing");
assert(procPost.status === "processing", "Post transitou para 'processing'");
assert(procPost.retryCount === 1, "retryCount incrementado para 1");

const pubPost = transitionScheduledPost(procPost, "published");
assert(pubPost.status === "published", "Post transitou para 'published'");
assert(Boolean(pubPost.publishedAt), "publishedAt preenchido ao publicar");

// 6. Transição de GroupBroadcastDeal (transitionBroadcastDeal)
console.log("\n6. Validando Transição de GroupBroadcastDeal...");
const sampleDeal: GroupBroadcastDeal = {
  id: "deal_trans_test",
  productName: "Echo Dot Alexa",
  store: "Amazon",
  originalPrice: 429.00,
  promoPrice: 269.10,
  discountPercentage: 37,
  affiliateUrl: "https://amzn.to/alexa",
  targetChannels: ["whatsapp", "telegram"],
  scheduledTime: "18:00",
  status: "pending"
};

const sentDeal = transitionBroadcastDeal(sampleDeal, "sent");
assert(sentDeal.status === "sent", "Oferta transitou de pending para sent");
assert(Boolean(sentDeal.sentAt), "sentAt preenchido ao disparar");

// 7. Transições em Lote (transitionBatchQueueItems)
console.log("\n7. Validando Transição em Lote (transitionBatchQueueItems)...");
const batchQueue: QueueItem[] = [
  { ...initialQueueItem, id: "batch_1", status: "scheduled" },
  { ...initialQueueItem, id: "batch_2", status: "scheduled" },
  { ...initialQueueItem, id: "batch_3", status: "published" } // Não pode ir para processing diretamente
];

const batchResult = transitionBatchQueueItems(batchQueue, ["batch_1", "batch_2", "batch_3"], "processing");
assert(batchResult.transitionedCount === 2, "Transitou com sucesso os 2 itens elegíveis");
assert(batchResult.errors.length === 1, "Registrou 1 erro na tentativa inválida de published -> processing");
assert(batchResult.updatedItems.find(i => i.id === "batch_1")?.status === "processing", "Item 1 atualizado para processing");
assert(batchResult.updatedItems.find(i => i.id === "batch_3")?.status === "published", "Item 3 manteve status original published");

// 8. Integração com Zustand Store (usePosterStore)
console.log("\n8. Validando Integração no Zustand Store (usePosterStore)...");
const store = usePosterStore.getState();

// Adiciona item com status scheduled
const testStoreItem: QueueItem = {
  ...initialQueueItem,
  id: "queue_fsm_zustand_test"
};
store.enqueueQueueItem(testStoreItem);

// Ciclo completo no Zustand: scheduled -> processing -> published
store.updateQueueItemStatus(testStoreItem.id, "processing");
let stateAfterProc = usePosterStore.getState();
let itemInStore = stateAfterProc.dispatchQueue.find(i => i.id === testStoreItem.id);
assert(itemInStore?.status === "processing", "Zustand atualizou atomicamente para 'processing'");
assert(itemInStore?.attempts === 1, "Zustand incrementou tentativas");

store.updateQueueItemStatus(testStoreItem.id, "published");
let stateAfterPub = usePosterStore.getState();
itemInStore = stateAfterPub.dispatchQueue.find(i => i.id === testStoreItem.id);
assert(itemInStore?.status === "published", "Zustand concluiu ciclo FSM em 'published'");
assert(Boolean(itemInStore?.completedAt), "completedAt carimbado no store");

// Limpeza do item de teste
store.removeQueueItem(testStoreItem.id);

console.log("\n=======================================================");
console.log(`TOTAL DE ASSERÇÕES: ${passed + failed}`);
console.log(`PASSOU: ${passed}`);
console.log(`FALHOU: ${failed}`);
console.log("=======================================================\n");

if (failed === 0) {
  console.log("✅ TODOS OS TESTES DA ETAPA 083 FORAM APROVADOS COM SUCESSO!");
  process.exit(0);
} else {
  console.error("❌ FALHA NOS TESTES DA ETAPA 083.");
  process.exit(1);
}
