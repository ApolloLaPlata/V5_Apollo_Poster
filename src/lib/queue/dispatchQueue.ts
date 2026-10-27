/**
 * dispatchQueue.ts - Arquitetura da Fila de Agendamento em Background
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Implementação do Padrão FIFO (First-In, First-Out) com Timestamp de Execução:
 * - Priorização Ponderada: urgent (4) > high (3) > normal (2) > low (1)
 * - Ordenação Temporal Estrita: Itens com timestamp de agendamento menor saem primeiro
 * - Desempate FIFO: createdAt mais antigo tem precedência em timestamps idênticos
 * - Telemetria e Estatísticas de Fila em Tempo Real
 * - Transição Segura e Imutável de Estados
 */

import {
  QueueItem,
  QueueItemPriority,
  QueueItemStatus,
  QueueItemType,
  QueueStats,
  SocialPlatform
} from "@/types/poster";
import {
  transitionQueueItem,
  TransitionOptions
} from "./taskStateTransition";

export * from "./taskStateTransition";

export const PRIORITY_WEIGHTS: Record<QueueItemPriority, number> = {
  urgent: 4,
  high: 3,
  normal: 2,
  low: 1
};

export interface CreateQueueItemParams {
  entityId: string;
  entityType: QueueItemType;
  title: string;
  platforms: SocialPlatform[];
  scheduledFor: string | Date;
  priority?: QueueItemPriority;
  status?: QueueItemStatus;
  maxAttempts?: number;
  payload?: Record<string, unknown>;
}

/**
 * Cria um novo item padronizado para a fila com defaults seguros
 */
export function createQueueItem(params: CreateQueueItemParams): QueueItem {
  const now = new Date().toISOString();
  const scheduledIso = typeof params.scheduledFor === "string" 
    ? params.scheduledFor 
    : params.scheduledFor.toISOString();

  const idSuffix = Math.random().toString(36).substring(2, 8);
  const id = `queue_${Date.now()}_${idSuffix}`;

  return {
    id,
    entityId: params.entityId,
    entityType: params.entityType,
    title: params.title.trim(),
    platforms: [...params.platforms],
    scheduledFor: scheduledIso,
    priority: params.priority || "normal",
    status: params.status || "scheduled",
    attempts: 0,
    maxAttempts: params.maxAttempts || 3,
    createdAt: now,
    updatedAt: now,
    ...(params.payload ? { payload: params.payload } : {})
  };
}

/**
 * Ordena a fila de acordo com o padrão FIFO com Timestamp de Execução e Prioridades:
 * 1. Itens em processamento vêm no topo
 * 2. Itens ativos (scheduled / queued):
 *    a. Maior peso de prioridade (urgent > high > normal > low)
 *    b. Menor scheduledFor (FIFO temporal: o que está agendado para mais cedo sai primeiro)
 *    c. Menor createdAt (desempate de ordem de chegada na fila)
 * 3. Itens inativos (published, failed, cancelled) vão para o final
 */
export function sortQueueFifo(items: QueueItem[]): QueueItem[] {
  return [...items].sort((a, b) => {
    // 1. Processing sempre tem prioridade de atenção
    if (a.status === "processing" && b.status !== "processing") return -1;
    if (b.status === "processing" && a.status !== "processing") return 1;

    const aIsActive = a.status === "scheduled" || a.status === "queued";
    const bIsActive = b.status === "scheduled" || b.status === "queued";

    // Itens ativos vêm antes de itens finalizados
    if (aIsActive && !bIsActive) return -1;
    if (!aIsActive && bIsActive) return 1;

    // Se ambos forem ativos, compara prioridade e timestamps
    if (aIsActive && bIsActive) {
      const weightA = PRIORITY_WEIGHTS[a.priority] || 2;
      const weightB = PRIORITY_WEIGHTS[b.priority] || 2;

      // Se a prioridade for diferente, a maior tem preferência
      if (weightA !== weightB) {
        return weightB - weightA;
      }

      // Se a prioridade for igual, aplica FIFO estrito por scheduledFor (menor timestamp primeiro)
      const timeA = new Date(a.scheduledFor).getTime();
      const timeB = new Date(b.scheduledFor).getTime();

      if (timeA !== timeB) {
        return timeA - timeB;
      }

      // Desempate por createdAt (quem entrou na fila primeiro)
      const createdA = new Date(a.createdAt).getTime();
      const createdB = new Date(b.createdAt).getTime();
      return createdA - createdB;
    }

    // Se ambos são finalizados, ordena pelo mais recentemente atualizado
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

/**
 * Adiciona um item à fila e a reordena segundo as regras FIFO
 */
export function enqueue(queue: QueueItem[], item: QueueItem): QueueItem[] {
  const filtered = queue.filter((i) => i.id !== item.id);
  return sortQueueFifo([...filtered, item]);
}

/**
 * Adiciona múltiplos itens em lote e reordena a fila
 */
export function enqueueBatch(queue: QueueItem[], items: QueueItem[]): QueueItem[] {
  const newIds = new Set(items.map((i) => i.id));
  const filtered = queue.filter((i) => !newIds.has(i.id));
  return sortQueueFifo([...filtered, ...items]);
}

/**
 * Retira o primeiro item ativo da fila (FIFO)
 */
export function dequeue(queue: QueueItem[]): {
  nextItem: QueueItem | null;
  remainingQueue: QueueItem[];
} {
  const sorted = sortQueueFifo(queue);
  const nextItemIndex = sorted.findIndex(
    (i) => i.status === "scheduled" || i.status === "queued"
  );

  if (nextItemIndex === -1) {
    return { nextItem: null, remainingQueue: sorted };
  }

  const nextItem = sorted[nextItemIndex];
  const remainingQueue = [
    ...sorted.slice(0, nextItemIndex),
    ...sorted.slice(nextItemIndex + 1)
  ];

  return { nextItem, remainingQueue };
}

/**
 * Visualiza o próximo item a ser disparado sem alterar a fila
 */
export function peek(queue: QueueItem[]): QueueItem | null {
  const sorted = sortQueueFifo(queue);
  return (
    sorted.find((i) => i.status === "scheduled" || i.status === "queued") || null
  );
}

/**
 * Filtra itens cujo timestamp scheduledFor já venceu (prontos para execução imediata)
 */
export function filterReadyToExecute(
  queue: QueueItem[],
  referenceDate: Date | string = new Date()
): QueueItem[] {
  const refTime = typeof referenceDate === "string" 
    ? new Date(referenceDate).getTime() 
    : referenceDate.getTime();

  return queue
    .filter(
      (item) =>
        (item.status === "scheduled" || item.status === "queued") &&
        new Date(item.scheduledFor).getTime() <= refTime
    )
    .sort((a, b) => {
      // Prioridade primeiro
      const weightDiff = (PRIORITY_WEIGHTS[b.priority] || 2) - (PRIORITY_WEIGHTS[a.priority] || 2);
      if (weightDiff !== 0) return weightDiff;
      // Menor scheduledFor primeiro
      return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime();
    });
}

/**
 * Atualiza o status de um item específico na fila de maneira imutável respeitando a FSM
 */
export function updateItemStatus(
  queue: QueueItem[],
  id: string,
  newStatus: QueueItemStatus,
  errorMessage?: string,
  options: TransitionOptions = {}
): QueueItem[] {
  return queue.map((item) => {
    if (item.id !== id) return item;
    return transitionQueueItem(item, newStatus, {
      ...options,
      errorMessage: errorMessage ?? options.errorMessage
    });
  });
}

/**
 * Cancela um item agendado na fila
 */
export function cancelQueueItem(queue: QueueItem[], id: string): QueueItem[] {
  return updateItemStatus(queue, id, "cancelled");
}

/**
 * Remove definitivamente um item da fila
 */
export function removeQueueItem(queue: QueueItem[], id: string): QueueItem[] {
  return queue.filter((i) => i.id !== id);
}

/**
 * Limpa itens terminados (published, cancelled) mantendo apenas ativos ou com falha
 */
export function clearCompletedItems(queue: QueueItem[]): QueueItem[] {
  return queue.filter(
    (i) => i.status !== "published" && i.status !== "cancelled"
  );
}

/**
 * Calcula estatísticas e telemetria da fila em tempo real
 */
export function getQueueStats(queue: QueueItem[]): QueueStats {
  const totalItems = queue.length;
  let scheduledCount = 0;
  let queuedCount = 0;
  let processingCount = 0;
  let publishedCount = 0;
  let failedCount = 0;
  let cancelledCount = 0;

  const activeDates: number[] = [];

  queue.forEach((item) => {
    switch (item.status) {
      case "scheduled":
        scheduledCount++;
        activeDates.push(new Date(item.scheduledFor).getTime());
        break;
      case "queued":
        queuedCount++;
        activeDates.push(new Date(item.scheduledFor).getTime());
        break;
      case "processing":
        processingCount++;
        break;
      case "published":
        publishedCount++;
        break;
      case "failed":
        failedCount++;
        break;
      case "cancelled":
        cancelledCount++;
        break;
    }
  });

  const activeCount = scheduledCount + queuedCount + processingCount;

  let oldestScheduledAt: string | undefined;
  let nextScheduledAt: string | undefined;

  if (activeDates.length > 0) {
    activeDates.sort((a, b) => a - b);
    nextScheduledAt = new Date(activeDates[0]).toISOString();
    oldestScheduledAt = new Date(activeDates[activeDates.length - 1]).toISOString();
  }

  // Estimativa simples de tempo médio de espera baseado no número de itens ativos * 15s por item
  const averageWaitTimeSeconds = activeCount * 15;

  return {
    totalItems,
    scheduledCount,
    queuedCount,
    processingCount,
    publishedCount,
    failedCount,
    cancelledCount,
    activeCount,
    oldestScheduledAt,
    nextScheduledAt,
    averageWaitTimeSeconds
  };
}

/**
 * Seeds iniciais de demonstração da Fila de Agendamento do V5 Poster
 */
export const INITIAL_DISPATCH_QUEUE: QueueItem[] = [
  {
    id: "queue_seed_001",
    entityId: "post-seed-blog-1",
    entityType: "post",
    title: "A Revolução Silenciosa dos Agentes Autônomos em 2026",
    platforms: ["autoblog", "newsletter"],
    scheduledFor: "2026-10-27T14:00:00.000Z",
    priority: "high",
    status: "scheduled",
    attempts: 0,
    maxAttempts: 3,
    createdAt: "2026-10-27T08:00:00.000Z",
    updatedAt: "2026-10-27T08:00:00.000Z"
  },
  {
    id: "queue_seed_002",
    entityId: "deal-seed-shopee-1",
    entityType: "deal",
    title: "Monitor Gamer Curvo 27\" 165Hz 1ms IPS (42% OFF)",
    platforms: ["whatsapp", "telegram"],
    scheduledFor: "2026-10-27T14:15:00.000Z",
    priority: "urgent",
    status: "scheduled",
    attempts: 0,
    maxAttempts: 3,
    createdAt: "2026-10-27T09:00:00.000Z",
    updatedAt: "2026-10-27T09:00:00.000Z"
  },
  {
    id: "queue_seed_003",
    entityId: "post-seed-social-1",
    entityType: "post",
    title: "Teasers Onicanal: Threads + X/Twitter + Instagram",
    platforms: ["x_twitter", "threads", "instagram"],
    scheduledFor: "2026-10-27T15:30:00.000Z",
    priority: "normal",
    status: "scheduled",
    attempts: 0,
    maxAttempts: 3,
    createdAt: "2026-10-27T10:00:00.000Z",
    updatedAt: "2026-10-27T10:00:00.000Z"
  },
  {
    id: "queue_seed_004",
    entityId: "deal-seed-amazon-1",
    entityType: "deal",
    title: "Echo Dot 5ª Geração Smart Speaker com Alexa",
    platforms: ["whatsapp", "telegram"],
    scheduledFor: "2026-10-27T17:00:00.000Z",
    priority: "normal",
    status: "scheduled",
    attempts: 0,
    maxAttempts: 3,
    createdAt: "2026-10-27T10:30:00.000Z",
    updatedAt: "2026-10-27T10:30:00.000Z"
  },
  {
    id: "queue_seed_005",
    entityId: "post-seed-published-1",
    entityType: "post",
    title: "Lançamento da Capitania #13 V5 Poster",
    platforms: ["autoblog", "instagram"],
    scheduledFor: "2026-10-27T07:00:00.000Z",
    priority: "high",
    status: "published",
    attempts: 1,
    maxAttempts: 3,
    createdAt: "2026-10-27T06:00:00.000Z",
    updatedAt: "2026-10-27T07:00:15.000Z",
    completedAt: "2026-10-27T07:00:15.000Z"
  }
];
