/**
 * test-etapa081.ts - Teste de Validação da Etapa 081
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Validação da Arquitetura da Fila de Agendamento (dispatchQueue.ts):
 * - Criação de itens de fila com defaults seguros (createQueueItem)
 * - Padrão FIFO com timestamp de execução e prioridade ponderada (sortQueueFifo)
 * - Operações de fila: enqueue, enqueueBatch, dequeue, peek
 * - Filtro de itens prontos para execução imediata (filterReadyToExecute)
 * - Transição imutável de estados (updateItemStatus, cancelQueueItem, removeQueueItem)
 * - Telemetria e estatísticas da fila (getQueueStats)
 * - Integração completa com Zustand Store (usePosterStore)
 */

import {
  createQueueItem,
  sortQueueFifo,
  enqueue,
  enqueueBatch,
  dequeue,
  peek,
  filterReadyToExecute,
  updateItemStatus,
  cancelQueueItem,
  removeQueueItem,
  clearCompletedItems,
  getQueueStats,
  PRIORITY_WEIGHTS,
  INITIAL_DISPATCH_QUEUE
} from "../src/lib/queue/dispatchQueue";
import { QueueItem } from "../src/types/poster";
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
console.log("TESTE ETAPA 081: ARQUITETURA DA FILA DE AGENDAMENTO (FIFO)");
console.log("=======================================================\n");

// 1. Criação de Itens da Fila (createQueueItem)
console.log("1. Validando createQueueItem...");
const item1 = createQueueItem({
  entityId: "post-test-1",
  entityType: "post",
  title: "Artigo de Teste SEO",
  platforms: ["autoblog", "newsletter"],
  scheduledFor: "2026-10-27T15:00:00.000Z",
  priority: "high"
});

assert(item1.id.startsWith("queue_"), "Gera ID com prefixo 'queue_'");
assert(item1.entityId === "post-test-1", "entityId preservado");
assert(item1.entityType === "post", "entityType preservado");
assert(item1.title === "Artigo de Teste SEO", "title preservado e sanitizado");
assert(item1.priority === "high", "Prioridade 'high' atribuída corretamente");
assert(item1.status === "scheduled", "Status padrão é 'scheduled'");
assert(item1.attempts === 0, "Contagem inicial de tentativas é 0");
assert(item1.maxAttempts === 3, "maxAttempts padrão é 3");
assert(Boolean(item1.createdAt && item1.updatedAt), "Possui timestamps ISO de criação e atualização");

// 2. Pesos de Prioridade
console.log("\n2. Validando PRIORITY_WEIGHTS...");
assert(PRIORITY_WEIGHTS.urgent === 4, "urgent possui peso 4");
assert(PRIORITY_WEIGHTS.high === 3, "high possui peso 3");
assert(PRIORITY_WEIGHTS.normal === 2, "normal possui peso 2");
assert(PRIORITY_WEIGHTS.low === 1, "low possui peso 1");

// 3. Ordenação FIFO Estrita com Timestamp e Prioridade
console.log("\n3. Validando Ordenação FIFO Temporal e Prioritária (sortQueueFifo)...");

const timeEarlier = "2026-10-27T10:00:00.000Z";
const timeLater = "2026-10-27T12:00:00.000Z";

const itemNormalEarly: QueueItem = {
  ...item1,
  id: "q_norm_early",
  priority: "normal",
  scheduledFor: timeEarlier,
  createdAt: "2026-10-27T08:00:00.000Z"
};

const itemNormalLate: QueueItem = {
  ...item1,
  id: "q_norm_late",
  priority: "normal",
  scheduledFor: timeLater,
  createdAt: "2026-10-27T08:00:00.000Z"
};

const itemUrgentLate: QueueItem = {
  ...item1,
  id: "q_urg_late",
  priority: "urgent",
  scheduledFor: timeLater,
  createdAt: "2026-10-27T08:00:00.000Z"
};

// Urgent vem antes de normal, mesmo agendado para mais tarde
const sortedPriority = sortQueueFifo([itemNormalEarly, itemUrgentLate]);
assert(sortedPriority[0].id === "q_urg_late", "Prioridade 'urgent' ultrapassa item 'normal' na fila");

// Na mesma prioridade, menor scheduledFor vem primeiro (FIFO temporal)
const sortedFifoTime = sortQueueFifo([itemNormalLate, itemNormalEarly]);
assert(sortedFifoTime[0].id === "q_norm_early", "Menor scheduledFor tem precedência FIFO temporal estrita");

// Em empate de prioridade e scheduledFor, menor createdAt desempata (ordem de chegada)
const itemSameTimeNewer: QueueItem = {
  ...itemNormalEarly,
  id: "q_norm_same_new",
  createdAt: "2026-10-27T09:00:00.000Z"
};
const sortedFifoCreated = sortQueueFifo([itemSameTimeNewer, itemNormalEarly]);
assert(sortedFifoCreated[0].id === "q_norm_early", "createdAt mais antigo desempata ordem FIFO de chegada");

// Itens em processamento vêm sempre no topo
const itemProcessing: QueueItem = {
  ...itemNormalLate,
  id: "q_processing",
  status: "processing"
};
const sortedWithProcessing = sortQueueFifo([itemUrgentLate, itemProcessing]);
assert(sortedWithProcessing[0].id === "q_processing", "Item com status 'processing' assume o topo absoluto");

// Itens published/cancelled vão para o fim da fila
const itemPublished: QueueItem = {
  ...itemNormalEarly,
  id: "q_published",
  status: "published"
};
const sortedWithFinished = sortQueueFifo([itemPublished, itemNormalEarly]);
assert(sortedWithFinished[0].id === "q_norm_early", "Itens ativos vêm antes de itens concluídos");
assert(sortedWithFinished[1].id === "q_published", "Itens concluídos vão para o fim da fila");

// 4. Operações de Enqueue, Dequeue e Peek
console.log("\n4. Validando Enqueue, Dequeue e Peek...");
let queue: QueueItem[] = [];
queue = enqueue(queue, itemNormalLate);
queue = enqueue(queue, itemNormalEarly);

assert(queue.length === 2, "Enqueue adicionou 2 itens");
assert(queue[0].id === "q_norm_early", "Enqueue manteve a ordem FIFO automática");

// Enqueue idempotente (atualiza se já existir)
const itemNormalEarlyUpdated: QueueItem = { ...itemNormalEarly, title: "Título Atualizado" };
queue = enqueue(queue, itemNormalEarlyUpdated);
assert(queue.length === 2, "Enqueue com mesmo ID não duplica elemento");
assert(queue[0].title === "Título Atualizado", "Enqueue atualiza dados do item existente");

// Peek não altera a fila
const peeked = peek(queue);
assert(peeked?.id === "q_norm_early", "Peek retorna o próximo item da fila");
assert(queue.length === 2, "Peek preserva a fila intacta");

// Dequeue remove o próximo item ativo
const dequeued = dequeue(queue);
assert(dequeued.nextItem?.id === "q_norm_early", "Dequeue extrai o primeiro item ativo");
assert(dequeued.remainingQueue.length === 1, "Fila restante possui 1 item");
assert(dequeued.remainingQueue[0].id === "q_norm_late", "Item restante é o próximo da fila");

// Enqueue em lote (enqueueBatch)
const batchItems: QueueItem[] = [
  createQueueItem({ entityId: "b1", entityType: "post", title: "Batch 1", platforms: ["autoblog"], scheduledFor: "2026-10-27T16:00:00Z" }),
  createQueueItem({ entityId: "b2", entityType: "deal", title: "Batch 2", platforms: ["telegram"], scheduledFor: "2026-10-27T14:00:00Z" })
];
const batchQueue = enqueueBatch(dequeued.remainingQueue, batchItems);
assert(batchQueue.length === 3, "enqueueBatch adicionou todos os itens");

// 5. Filtro de Itens Prontos para Execução (filterReadyToExecute)
console.log("\n5. Validando filterReadyToExecute...");
const nowRef = "2026-10-27T11:00:00.000Z";
const readyItems = filterReadyToExecute([itemNormalEarly, itemNormalLate, itemPublished], nowRef);
assert(readyItems.length === 1, "Apenas o item com scheduledFor <= referência foi selecionado");
assert(readyItems[0].id === "q_norm_early", "Item correto retornado como pronto para execução");

// 6. Transições Imutáveis de Status
console.log("\n6. Validando Transições de Status...");
const updatedQueue = updateItemStatus([itemNormalEarly], itemNormalEarly.id, "processing");
assert(updatedQueue[0].status === "processing", "Status atualizado para 'processing'");
assert(updatedQueue[0].attempts === 1, "attempts incrementado para 1 em 'processing'");

const publishedQueue = updateItemStatus(updatedQueue, itemNormalEarly.id, "published");
assert(publishedQueue[0].status === "published", "Status atualizado para 'published'");
assert(Boolean(publishedQueue[0].completedAt), "completedAt preenchido ao publicar");

const cancelledQueue = cancelQueueItem([itemNormalEarly], itemNormalEarly.id);
assert(cancelledQueue[0].status === "cancelled", "cancelQueueItem marca status como 'cancelled'");

const clearedQueue = clearCompletedItems([...publishedQueue, itemNormalLate]);
assert(clearedQueue.length === 1, "clearCompletedItems remove itens publicados");
assert(clearedQueue[0].id === itemNormalLate.id, "Item pendente mantido na fila");

// 7. Estatísticas e Telemetria (getQueueStats)
console.log("\n7. Validando getQueueStats...");
const stats = getQueueStats(INITIAL_DISPATCH_QUEUE);
assert(stats.totalItems === 5, "Total de 5 itens no seed inicial");
assert(stats.scheduledCount === 4, "4 itens com status 'scheduled'");
assert(stats.publishedCount === 1, "1 item com status 'published'");
assert(stats.activeCount === 4, "4 itens ativos na fila");
assert(Boolean(stats.nextScheduledAt), "Próximo horário de disparo calculado");
assert(stats.averageWaitTimeSeconds === 60, "Tempo médio estimado de espera de 60s (4 ativos * 15s)");

// 8. Integração com Zustand Store
console.log("\n8. Validando Integração no Zustand Store (usePosterStore)...");
const store = usePosterStore.getState();
assert(store.dispatchQueue.length >= 5, "Zustand inicializado com itens da fila");

const newQueueItem = createQueueItem({
  entityId: "post-zustand-test",
  entityType: "post",
  title: "Teste Integração Zustand Queue",
  platforms: ["instagram"],
  scheduledFor: "2026-10-27T18:00:00.000Z",
  priority: "urgent"
});

store.enqueueQueueItem(newQueueItem);
const updatedStore = usePosterStore.getState();
assert(updatedStore.dispatchQueue.some(i => i.id === newQueueItem.id), "enqueueQueueItem gravou item no store");

store.updateQueueItemStatus(newQueueItem.id, "published");
const storeAfterPublish = usePosterStore.getState();
const foundItem = storeAfterPublish.dispatchQueue.find(i => i.id === newQueueItem.id);
assert(foundItem?.status === "published", "updateQueueItemStatus atualizou status no store");

store.removeQueueItem(newQueueItem.id);
const storeAfterRemove = usePosterStore.getState();
assert(!storeAfterRemove.dispatchQueue.some(i => i.id === newQueueItem.id), "removeQueueItem removeu item do store");

console.log("\n=======================================================");
console.log(`TOTAL DE ASSERÇÕES: ${passed + failed}`);
console.log(`PASSOU: ${passed}`);
console.log(`FALHOU: ${failed}`);
console.log("=======================================================\n");

if (failed === 0) {
  console.log("✅ TODOS OS TESTES DA ETAPA 081 FORAM APROVADOS COM SUCESSO!");
  process.exit(0);
} else {
  console.error("❌ FALHA NOS TESTES DA ETAPA 081.");
  process.exit(1);
}
