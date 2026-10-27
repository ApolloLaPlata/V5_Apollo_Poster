/**
 * taskStateTransition.ts - Máquina de Estados Finita (FSM) e Transições de Tarefas
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Controle Rigoroso do Grafo de Ciclo de Vida:
 * scheduled -> queued -> processing -> published / failed
 *
 * - Validação determinística de transições permitidas (previne estados corrompidos)
 * - Carimbos de data/hora atômicos: startedAt, completedAt, failedAt
 * - Incremento automático e rastreável de tentativas (attempts)
 * - Rastreamento e auditoria de transições com cálculo de tempo no estado anterior
 * - Adaptadores universais para QueueItem, ScheduledPost e GroupBroadcastDeal
 */

import {
  QueueItem,
  QueueItemStatus,
  ScheduledPost,
  PostStatus,
  GroupBroadcastDeal
} from "@/types/poster";

export type UniversalTaskStatus =
  | "draft"
  | "scheduled"
  | "queued"
  | "processing"
  | "published"
  | "failed"
  | "cancelled";

export interface StateTransitionRecord {
  transitionId: string;
  fromStatus: UniversalTaskStatus;
  toStatus: UniversalTaskStatus;
  timestamp: string; // ISO 8601
  reason?: string;
  durationInPreviousStateMs?: number;
  metadata?: Record<string, unknown>;
}

export interface TransitionOptions {
  reason?: string;
  errorMessage?: string;
  errorCode?: string | number;
  responsePayload?: Record<string, unknown>;
  force?: boolean; // Permite bypass explícito do operador quando necessário
  timestamp?: string | Date;
}

export interface TransitionValidationResult {
  valid: boolean;
  fromStatus: UniversalTaskStatus;
  toStatus: UniversalTaskStatus;
  reason?: string;
}

/**
 * Matriz de Adjacência de Transições Permitidas (Grafo Direcionado FSM)
 */
export const ALLOWED_STATE_TRANSITIONS: Record<UniversalTaskStatus, UniversalTaskStatus[]> = {
  draft: ["scheduled", "queued", "processing", "cancelled"],
  scheduled: ["queued", "processing", "cancelled", "draft"],
  queued: ["processing", "scheduled", "cancelled"],
  processing: ["published", "failed", "queued", "scheduled"],
  published: ["queued", "scheduled"], // Permite re-publicação manual forçada
  failed: ["queued", "processing", "scheduled", "cancelled"], // Permite retentativa ou cancelamento
  cancelled: ["scheduled", "queued", "draft"] // Permite desarquivamento
};

/**
 * Verifica se uma transição de estado é permitida pela máquina de estados finita
 */
export function canTransition(
  fromStatus: UniversalTaskStatus,
  toStatus: UniversalTaskStatus,
  force: boolean = false
): boolean {
  if (force) return true;
  if (fromStatus === toStatus) return true; // Transição no-op é idempotente e válida

  const allowedTargets = ALLOWED_STATE_TRANSITIONS[fromStatus] || [];
  return allowedTargets.includes(toStatus);
}

/**
 * Valida a transição e retorna o motivo detalhado caso seja inválida
 */
export function validateTransition(
  fromStatus: UniversalTaskStatus,
  toStatus: UniversalTaskStatus,
  force: boolean = false
): TransitionValidationResult {
  if (canTransition(fromStatus, toStatus, force)) {
    return {
      valid: true,
      fromStatus,
      toStatus
    };
  }

  return {
    valid: false,
    fromStatus,
    toStatus,
    reason: `Transição inválida de estado: '${fromStatus}' não pode transitar diretamente para '${toStatus}'. Estados permitidos: [${(ALLOWED_STATE_TRANSITIONS[fromStatus] || []).join(", ")}]`
  };
}

/**
 * Cria um registro de auditoria imutável da transição
 */
export function createTransitionAuditRecord(
  fromStatus: UniversalTaskStatus,
  toStatus: UniversalTaskStatus,
  options: TransitionOptions = {},
  previousTimestamp?: string | Date
): StateTransitionRecord {
  const now = options.timestamp 
    ? (typeof options.timestamp === "string" ? options.timestamp : options.timestamp.toISOString())
    : new Date().toISOString();

  let durationInPreviousStateMs: number | undefined;
  if (previousTimestamp) {
    const prevTime = new Date(previousTimestamp).getTime();
    const currTime = new Date(now).getTime();
    if (!isNaN(prevTime) && !isNaN(currTime)) {
      durationInPreviousStateMs = Math.max(0, currTime - prevTime);
    }
  }

  const idSuffix = Math.random().toString(36).substring(2, 7);
  return {
    transitionId: `trans_${Date.now()}_${idSuffix}`,
    fromStatus,
    toStatus,
    timestamp: now,
    ...(options.reason ? { reason: options.reason } : {}),
    ...(durationInPreviousStateMs !== undefined ? { durationInPreviousStateMs } : {}),
    ...(options.responsePayload ? { metadata: options.responsePayload } : {})
  };
}

/**
 * Executa a transição atômica de um item de fila (QueueItem)
 */
export function transitionQueueItem(
  item: QueueItem,
  targetStatus: QueueItemStatus,
  options: TransitionOptions = {}
): QueueItem {
  const currentStatus = item.status;
  const validation = validateTransition(currentStatus, targetStatus, options.force);

  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  const now = options.timestamp
    ? (typeof options.timestamp === "string" ? options.timestamp : options.timestamp.toISOString())
    : new Date().toISOString();

  const isEnteringProcessing = targetStatus === "processing";
  const isEnteringPublished = targetStatus === "published";
  const isEnteringFailed = targetStatus === "failed";

  const attempts = isEnteringProcessing ? item.attempts + 1 : item.attempts;
  const lastAttemptAt = isEnteringProcessing ? now : item.lastAttemptAt;
  const completedAt = isEnteringPublished ? now : item.completedAt;

  return {
    ...item,
    status: targetStatus,
    attempts,
    updatedAt: now,
    ...(lastAttemptAt ? { lastAttemptAt } : {}),
    ...(completedAt ? { completedAt } : {}),
    ...(isEnteringFailed && options.errorMessage ? { errorMessage: options.errorMessage } : {}),
    ...(isEnteringPublished ? { errorMessage: undefined } : {})
  };
}

/**
 * Executa a transição atômica de um post agendado tradicional (ScheduledPost)
 */
export function transitionScheduledPost(
  post: ScheduledPost,
  targetStatus: PostStatus,
  options: TransitionOptions = {}
): ScheduledPost {
  const currentStatus = post.status;
  const validation = validateTransition(currentStatus, targetStatus, options.force);

  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  const now = options.timestamp
    ? (typeof options.timestamp === "string" ? options.timestamp : options.timestamp.toISOString())
    : new Date().toISOString();

  const isEnteringProcessing = targetStatus === "processing";
  const isEnteringPublished = targetStatus === "published";
  const isEnteringFailed = targetStatus === "failed";

  const retryCount = isEnteringProcessing ? (post.retryCount || 0) + 1 : post.retryCount;
  const publishedAt = isEnteringPublished ? now : post.publishedAt;
  const lastError = isEnteringFailed && options.errorMessage ? options.errorMessage : post.lastError;

  return {
    ...post,
    status: targetStatus,
    updatedAt: now,
    ...(retryCount !== undefined ? { retryCount } : {}),
    ...(publishedAt ? { publishedAt } : {}),
    ...(lastError ? { lastError } : {}),
    ...(isEnteringPublished ? { lastError: undefined } : {})
  };
}

/**
 * Executa a transição atômica de uma oferta broadcast (GroupBroadcastDeal)
 */
export function transitionBroadcastDeal(
  deal: GroupBroadcastDeal,
  targetStatus: "pending" | "sent" | "failed",
  options: TransitionOptions = {}
): GroupBroadcastDeal {
  const now = options.timestamp
    ? (typeof options.timestamp === "string" ? options.timestamp : options.timestamp.toISOString())
    : new Date().toISOString();

  return {
    ...deal,
    status: targetStatus,
    ...(targetStatus === "sent" ? { sentAt: now } : {})
  };
}

/**
 * Executa a transição em lote de múltiplos itens de fila com tolerância a falhas parciais
 */
export function transitionBatchQueueItems(
  items: QueueItem[],
  targetIds: string[],
  targetStatus: QueueItemStatus,
  options: TransitionOptions = {}
): {
  updatedItems: QueueItem[];
  transitionedCount: number;
  errors: Array<{ id: string; error: string }>;
} {
  const idSet = new Set(targetIds);
  const errors: Array<{ id: string; error: string }> = [];
  let transitionedCount = 0;

  const updatedItems = items.map((item) => {
    if (!idSet.has(item.id)) return item;

    try {
      const transitioned = transitionQueueItem(item, targetStatus, options);
      transitionedCount++;
      return transitioned;
    } catch (err) {
      errors.push({
        id: item.id,
        error: err instanceof Error ? err.message : String(err)
      });
      return item;
    }
  });

  return {
    updatedItems,
    transitionedCount,
    errors
  };
}
