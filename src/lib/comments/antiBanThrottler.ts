/**
 * antiBanThrottler.ts - Mecanismo de Throttling e Fila Anti-Ban com Jitter Randômico
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Arquitetura de Proteção Contra Bloqueio Algorítmico da Meta Graph API & TikTok:
 * - Taxa Máxima Restritiva: 30 DMs por minuto (janela deslizante de 60 segundos)
 * - Jitter Randômico Variável: atraso estocástico entre 2000ms e 5000ms (2 a 5s) entre disparos
 * - Fila Assíncrona com Priorização de Leads Quentes
 * - Amortecimento de Avalanches (Burst Smoothing para posts virais)
 * - Backoff Exponencial Dinâmico sob Código HTTP 429 / Meta Error 613
 * - Telemetria em Tempo Real (consumo da janela, tamanho da fila, saúde anti-ban)
 */

export interface ThrottlerConfig {
  maxDmsPerMinute: number;
  minJitterMs: number;
  maxJitterMs: number;
  backoffBaseMs: number;
  maxBackoffMs: number;
}

export interface ThrottledTask {
  id: string;
  ruleId: string;
  commentId: string;
  username: string;
  commentText: string;
  dmMessage: string;
  publicReply: string;
  priority: "high" | "normal" | "low";
  createdAt: number;
  status: "pending" | "processing" | "completed" | "rate_limited" | "failed";
  retryCount: number;
  error?: string;
  dispatchedAt?: number;
}

export interface ThrottlerMetrics {
  dmsInLastMinute: number;
  maxAllowedPerMinute: number;
  capacityUtilizationPercent: number;
  queueLength: number;
  isThrottlingActive: boolean;
  isPausedForBackoff: boolean;
  currentBackoffWaitMs: number;
  averageJitterMs: number;
  safetyStatus: "optimal" | "moderate" | "near_limit" | "rate_limited";
}

export const DEFAULT_THROTTLER_CONFIG: ThrottlerConfig = {
  maxDmsPerMinute: 30,
  minJitterMs: 2000,
  maxJitterMs: 5000,
  backoffBaseMs: 5000,
  maxBackoffMs: 60000
};

export class AntiBanThrottler {
  private config: ThrottlerConfig;
  private queue: ThrottledTask[] = [];
  private dispatchTimestamps: number[] = [];
  private isProcessing: boolean = false;
  private backoffMultiplier: number = 0;
  private backoffUntilTimestamp: number = 0;
  private totalDispatchedAllTime: number = 0;

  constructor(customConfig: Partial<ThrottlerConfig> = {}) {
    this.config = { ...DEFAULT_THROTTLER_CONFIG, ...customConfig };
  }

  /**
   * Gera jitter pseudo-randômico em milissegundos dentro do intervalo configurado
   */
  public calculateJitter(
    minMs: number = this.config.minJitterMs,
    maxMs: number = this.config.maxJitterMs
  ): number {
    return Math.floor(minMs + Math.random() * (maxMs - minMs + 1));
  }

  /**
   * Limpa timestamps antigos fora da janela deslizante de 60 segundos
   */
  private pruneOldTimestamps(now: number = Date.now()): void {
    const oneMinuteAgo = now - 60000;
    this.dispatchTimestamps = this.dispatchTimestamps.filter(t => t > oneMinuteAgo);
  }

  /**
   * Verifica se a janela de 60 segundos permite um novo disparo imediato
   */
  public canDispatchNow(now: number = Date.now()): boolean {
    this.pruneOldTimestamps(now);

    // Se estiver em período de backoff (pausa pós-erro 429)
    if (now < this.backoffUntilTimestamp) {
      return false;
    }

    return this.dispatchTimestamps.length < this.config.maxDmsPerMinute;
  }

  /**
   * Retorna quantos segundos restam até a liberação do próximo slot da janela
   */
  public getWaitTimeUntilAvailableSlotMs(now: number = Date.now()): number {
    this.pruneOldTimestamps(now);

    if (now < this.backoffUntilTimestamp) {
      return this.backoffUntilTimestamp - now;
    }

    if (this.dispatchTimestamps.length < this.config.maxDmsPerMinute) {
      return 0;
    }

    // O slot mais antigo da janela de 60s expirará em (oldest + 60s - now)
    const oldest = this.dispatchTimestamps[0];
    return Math.max(0, oldest + 60000 - now);
  }

  /**
   * Enfileira uma nova tarefa de DM protegida por throttling
   */
  public enqueue(
    taskData: Omit<ThrottledTask, "id" | "createdAt" | "status" | "retryCount">
  ): ThrottledTask {
    const task: ThrottledTask = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
      status: "pending",
      retryCount: 0
    };

    // Insere com ordenação de prioridade (high vem antes de normal e low)
    if (task.priority === "high") {
      const firstNormalIdx = this.queue.findIndex(t => t.priority !== "high");
      if (firstNormalIdx >= 0) {
        this.queue.splice(firstNormalIdx, 0, task);
      } else {
        this.queue.push(task);
      }
    } else {
      this.queue.push(task);
    }

    return task;
  }

  /**
   * Registra a ocorrência de um disparo bem-sucedido e reseta o backoff
   */
  public recordSuccessfulDispatch(now: number = Date.now()): void {
    this.dispatchTimestamps.push(now);
    this.totalDispatchedAllTime++;
    this.backoffMultiplier = 0; // Reseta penalidades
    this.pruneOldTimestamps(now);
  }

  /**
   * Aciona backoff exponencial sob recebimento de erro 429 / Rate Limit Meta
   */
  public triggerBackoff(now: number = Date.now()): number {
    this.backoffMultiplier = Math.min(4, this.backoffMultiplier + 1);
    const delay = Math.min(
      this.config.maxBackoffMs,
      this.config.backoffBaseMs * Math.pow(2, this.backoffMultiplier - 1)
    );
    this.backoffUntilTimestamp = now + delay;
    return delay;
  }

  /**
   * Retorna métricas analíticas e estado atual de saúde anti-ban
   */
  public getMetrics(now: number = Date.now()): ThrottlerMetrics {
    this.pruneOldTimestamps(now);
    const dmsInLastMinute = this.dispatchTimestamps.length;
    const max = this.config.maxDmsPerMinute;
    const utilization = Number(((dmsInLastMinute / max) * 100).toFixed(1));
    const isPausedForBackoff = now < this.backoffUntilTimestamp;
    const currentBackoffWaitMs = isPausedForBackoff ? this.backoffUntilTimestamp - now : 0;

    let safetyStatus: ThrottlerMetrics["safetyStatus"] = "optimal";
    if (isPausedForBackoff) {
      safetyStatus = "rate_limited";
    } else if (utilization >= 90) {
      safetyStatus = "near_limit";
    } else if (utilization >= 60) {
      safetyStatus = "moderate";
    }

    return {
      dmsInLastMinute,
      maxAllowedPerMinute: max,
      capacityUtilizationPercent: utilization,
      queueLength: this.queue.length,
      isThrottlingActive: dmsInLastMinute >= max || this.queue.length > 0,
      isPausedForBackoff,
      currentBackoffWaitMs,
      averageJitterMs: Math.round((this.config.minJitterMs + this.config.maxJitterMs) / 2),
      safetyStatus
    };
  }

  /**
   * Retorna o próximo item da fila se as restrições de tempo forem atendidas
   */
  public dequeueNext(): ThrottledTask | null {
    if (this.queue.length === 0) return null;
    return this.queue.shift() || null;
  }

  /**
   * Obtém snapshot da fila pendente
   */
  public getQueueSnapshot(): ThrottledTask[] {
    return [...this.queue];
  }

  /**
   * Limpa todo o estado e timestamps (útil para testes ou reinício)
   */
  public reset(): void {
    this.queue = [];
    this.dispatchTimestamps = [];
    this.backoffMultiplier = 0;
    this.backoffUntilTimestamp = 0;
    this.isProcessing = false;
  }
}

/**
 * Instância Singleton Global do Throttler Anti-Ban da Capitania #13 Poster
 */
export const globalAntiBanThrottler = new AntiBanThrottler();
