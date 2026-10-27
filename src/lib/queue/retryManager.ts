/**
 * retryManager.ts - Sistema de Retentativas Automáticas com Backoff Exponencial
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Arquitetura Resiliente de Retentativas para APIs Oficiais de Postagem:
 * - Filtro rigoroso de erros recuperáveis: HTTP 5xx (500, 502, 503, 504), 429 e erros de conexão de rede
 * - Erros fatais (400, 401, 403, 404, 422) falham imediatamente sem desperdiçar retentativas
 * - Algoritmo de Backoff Exponencial com Jitter anti-colisão (Thundering Herd prevention)
 * - Até 3 tentativas máximas padronizadas com carimbo determinístico de `nextAttemptAt`
 * - Rastreabilidade completa da decisão de retry (delayMs, nextAttemptAt, attemptsRemaining)
 */

import { QueueItem, ScheduledPost } from "@/types/poster";
import { transitionQueueItem, transitionScheduledPost } from "./taskStateTransition";

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  backoffFactor: number;
  maxDelayMs: number;
  enableJitter: boolean;
  jitterFactor?: number; // Variação percentual (padrão 0.2 -> ±20%)
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 2000, // 2 segundos iniciais
  backoffFactor: 2,  // 2s -> 4s -> 8s
  maxDelayMs: 60000, // Teto máximo de 1 minuto
  enableJitter: true,
  jitterFactor: 0.2
};

export interface ErrorContext {
  statusCode?: number;
  errorMessage?: string;
  errorName?: string;
  errorCode?: string;
  headers?: Record<string, string>;
}

export interface RetryDecision {
  action: "retry" | "fail_permanently";
  nextStatus: "queued" | "failed";
  attemptNumber: number;
  attemptsRemaining: number;
  delayMs: number;
  nextAttemptAt?: string; // ISO 8601
  reason: string;
  isRetryable: boolean;
  exhausted: boolean;
}

/**
 * Códigos HTTP considerados temporários e recuperáveis por padrão
 */
export const RETRYABLE_HTTP_STATUS_CODES = new Set([
  408, // Request Timeout
  429, // Too Many Requests (Rate Limit)
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504  // Gateway Timeout
]);

/**
 * Códigos ou termos de erros de rede de baixo nível recuperáveis
 */
export const RETRYABLE_NETWORK_ERROR_TERMS = [
  "ETIMEDOUT",
  "ECONNRESET",
  "ECONNREFUSED",
  "ENOTFOUND",
  "EAI_AGAIN",
  "FETCH_ERROR",
  "NETWORK_ERROR",
  "TIMEOUT",
  "RATE_LIMIT",
  "OVERLOADED"
];

/**
 * Identifica se um erro ou código de status HTTP é transitório e apto a retentativa
 */
export function isRetryableError(error: unknown, statusCode?: number): boolean {
  // 1. Checa código de status HTTP direto se fornecido
  if (statusCode && RETRYABLE_HTTP_STATUS_CODES.has(statusCode)) {
    return true;
  }

  // 2. Erros 4xx (exceto 408 e 429) são falhas fatais de cliente (token inválido, bad request)
  if (statusCode && statusCode >= 400 && statusCode < 500 && statusCode !== 408 && statusCode !== 429) {
    return false;
  }

  // 3. Checa mensagem e nome de erro de exceções
  if (error instanceof Error) {
    const errorString = `${error.name} ${error.message} ${(error as any).code || ""}`.toUpperCase();
    return RETRYABLE_NETWORK_ERROR_TERMS.some((term) => errorString.includes(term));
  }

  // 4. Checa string pura de erro
  if (typeof error === "string") {
    const upper = error.toUpperCase();
    return RETRYABLE_NETWORK_ERROR_TERMS.some((term) => upper.includes(term));
  }

  // 5. Se tiver statusCode 5xx implícito no objeto
  if (typeof error === "object" && error !== null) {
    const objCode = (error as any).status || (error as any).statusCode || (error as any).code;
    if (typeof objCode === "number" && RETRYABLE_HTTP_STATUS_CODES.has(objCode)) {
      return true;
    }
  }

  return false;
}

/**
 * Calcula o tempo de espera do Backoff Exponencial com opção de Jitter
 *
 * Fórmula: baseDelay * (factor ^ (attempt - 1))
 * Tentativa 1 (primeira falha): 2000 * 2^0 = 2000 ms (2s)
 * Tentativa 2 (segunda falha): 2000 * 2^1 = 4000 ms (4s)
 * Tentativa 3 (terceira falha): 2000 * 2^2 = 8000 ms (8s)
 */
export function calculateExponentialBackoff(
  attempt: number,
  config: Partial<RetryConfig> = {},
  fixedRandomForTesting?: number
): number {
  const merged: RetryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  const safeAttempt = Math.max(1, attempt);

  // Cálculo da curva exponencial pura
  const rawDelay = merged.baseDelayMs * Math.pow(merged.backoffFactor, safeAttempt - 1);
  const boundedDelay = Math.min(merged.maxDelayMs, rawDelay);

  if (!merged.enableJitter) {
    return Math.round(boundedDelay);
  }

  // Jitter para diluir a concorrência (±20% de dispersão temporal)
  const jitterFactor = merged.jitterFactor ?? 0.2;
  const randomMultiplier = fixedRandomForTesting !== undefined 
    ? fixedRandomForTesting 
    : Math.random();

  // Mapeia de 0..1 para (1 - jitter) .. (1 + jitter)
  const jitterSpread = (1 - jitterFactor) + (randomMultiplier * 2 * jitterFactor);
  const finalDelay = Math.round(boundedDelay * jitterSpread);

  return Math.max(100, Math.min(merged.maxDelayMs, finalDelay));
}

/**
 * Avalia de forma determinística a decisão de retentativa para uma tarefa
 */
export function evaluateRetryDecision(
  currentAttempts: number,
  maxAttempts: number = DEFAULT_RETRY_CONFIG.maxAttempts,
  error: unknown,
  statusCode?: number,
  config: Partial<RetryConfig> = {},
  referenceDate: Date = new Date(),
  fixedRandomForTesting?: number
): RetryDecision {
  const retryable = isRetryableError(error, statusCode);
  const nextAttemptNumber = currentAttempts + 1;
  const attemptsRemaining = Math.max(0, maxAttempts - nextAttemptNumber);
  const isExhausted = nextAttemptNumber > maxAttempts;

  // Se não for recuperável ou esgotou tentativas -> Falha Permanente
  if (!retryable || isExhausted) {
    const errorText = error instanceof Error 
      ? error.message 
      : typeof error === "string" 
      ? error 
      : statusCode 
      ? `Erro HTTP ${statusCode}` 
      : "Falha irrecuperável na requisição";

    const reason = !retryable
      ? `Erro não recuperável (${statusCode || "fatal"}): retentativa cancelada imediatamente.`
      : `Limite de retentativas esgotado (${currentAttempts}/${maxAttempts}): post marcado como falha permanente.`;

    return {
      action: "fail_permanently",
      nextStatus: "failed",
      attemptNumber: currentAttempts,
      attemptsRemaining: 0,
      delayMs: 0,
      reason,
      isRetryable: retryable,
      exhausted: isExhausted
    };
  }

  // Erro recuperável e possui tentativas restantes -> Agenda Nova Tentativa
  const delayMs = calculateExponentialBackoff(currentAttempts, config, fixedRandomForTesting);
  const nextAttemptAt = new Date(referenceDate.getTime() + delayMs).toISOString();

  return {
    action: "retry",
    nextStatus: "queued",
    attemptNumber: nextAttemptNumber,
    attemptsRemaining,
    delayMs,
    nextAttemptAt,
    reason: `Erro temporário (${statusCode || "rede"}). Nova tentativa agendada para ${nextAttemptAt} (backoff: ${Math.round(delayMs / 1000)}s, restam ${attemptsRemaining} tentativas).`,
    isRetryable: true,
    exhausted: false
  };
}

/**
 * Aplica a decisão de retry de forma atômica e imutável a um QueueItem
 */
export function applyRetryToQueueItem(
  item: QueueItem,
  error: unknown,
  statusCode?: number,
  config: Partial<RetryConfig> = {},
  referenceDate: Date = new Date(),
  fixedRandomForTesting?: number
): { item: QueueItem; decision: RetryDecision } {
  const decision = evaluateRetryDecision(
    item.attempts,
    item.maxAttempts || DEFAULT_RETRY_CONFIG.maxAttempts,
    error,
    statusCode,
    config,
    referenceDate,
    fixedRandomForTesting
  );

  const errorString = error instanceof Error 
    ? error.message 
    : typeof error === "string" 
    ? error 
    : statusCode 
    ? `HTTP ${statusCode}` 
    : "Erro desconhecido";

  if (decision.action === "retry") {
    // Retorna para queued com nextAttemptAt carimbado
    const updated = transitionQueueItem(item, "queued", {
      reason: decision.reason,
      errorMessage: errorString,
      timestamp: referenceDate
    });

    return {
      item: {
        ...updated,
        nextAttemptAt: decision.nextAttemptAt,
        scheduledFor: decision.nextAttemptAt || updated.scheduledFor
      },
      decision
    };
  }

  // Falha definitiva
  const failed = transitionQueueItem(item, "failed", {
    reason: decision.reason,
    errorMessage: `${errorString} (${decision.reason})`,
    timestamp: referenceDate
  });

  return {
    item: {
      ...failed,
      nextAttemptAt: undefined
    },
    decision
  };
}

/**
 * Aplica a decisão de retry a um ScheduledPost tradicional
 */
export function applyRetryToScheduledPost(
  post: ScheduledPost,
  error: unknown,
  statusCode?: number,
  config: Partial<RetryConfig> = {},
  referenceDate: Date = new Date(),
  fixedRandomForTesting?: number
): { post: ScheduledPost; decision: RetryDecision } {
  const decision = evaluateRetryDecision(
    post.retryCount || 0,
    DEFAULT_RETRY_CONFIG.maxAttempts,
    error,
    statusCode,
    config,
    referenceDate,
    fixedRandomForTesting
  );

  const errorString = error instanceof Error 
    ? error.message 
    : typeof error === "string" 
    ? error 
    : statusCode 
    ? `HTTP ${statusCode}` 
    : "Erro desconhecido";

  if (decision.action === "retry") {
    const updated = transitionScheduledPost(post, "scheduled", {
      reason: decision.reason,
      errorMessage: errorString,
      timestamp: referenceDate,
      force: true // Permite reagendar
    });

    return {
      post: {
        ...updated,
        scheduledAt: decision.nextAttemptAt || updated.scheduledAt,
        retryCount: decision.attemptNumber
      },
      decision
    };
  }

  const failed = transitionScheduledPost(post, "failed", {
    reason: decision.reason,
    errorMessage: `${errorString} (${decision.reason})`,
    timestamp: referenceDate
  });

  return {
    post: failed,
    decision
  };
}

/**
 * Formata contagem regressiva amigável até a próxima retentativa
 */
export function formatRetryCountdown(nextAttemptAt: string, now: Date | string = new Date()): string {
  const targetTime = new Date(nextAttemptAt).getTime();
  const currTime = (typeof now === "string" ? new Date(now) : now).getTime();

  const diffMs = targetTime - currTime;
  if (diffMs <= 0) return "Imediato";

  const totalSeconds = Math.ceil(diffMs / 1000);
  if (totalSeconds < 60) {
    return `em ${totalSeconds}s`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `em ${minutes}m ${seconds}s`;
}
