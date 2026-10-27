/**
 * overdueScanner.ts - Motor de Verificação de Posts Vencidos (Tick Engine / Polling Worker)
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Mecanismo de Polling Contínuo a Cada 60 Segundos:
 * - Detecta itens da fila (dispatchQueue) e posts agendados (posts) cujo horário de disparo expirou
 * - Proteção estrita contra concorrência e reentrância (isProcessingLock)
 * - Tolerância configurável de janela de disparo em milissegundos
 * - Sistema de observadores e callbacks para dispatch automático (Etapas 083 a 085)
 * - Telemetria completa do ciclo de varredura (duração, contagem de ticks, próximos disparos)
 */

import { QueueItem, ScheduledPost } from "@/types/poster";

export const DEFAULT_POLLING_INTERVAL_MS = 60000; // 60 segundos exatos

export type ScannerStatus = "idle" | "running" | "paused" | "stopped";

export interface TickResult {
  tickId: string;
  tickNumber: number;
  timestamp: string; // ISO string
  durationMs: number;
  overdueQueueItems: QueueItem[];
  overduePosts: ScheduledPost[];
  totalOverdue: number;
  referenceTime: string;
}

export interface ScannerState {
  status: ScannerStatus;
  intervalMs: number;
  totalTicks: number;
  lastTickAt?: string;
  lastTickDurationMs?: number;
  nextTickAt?: string;
  totalOverdueDetected: number;
  isRunning: boolean;
  isLocked: boolean;
}

export interface OverdueScannerOptions {
  intervalMs?: number;
  toleranceMs?: number; // tolerância para relógios dessincronizados
  getQueue?: () => QueueItem[];
  getPosts?: () => ScheduledPost[];
  onTick?: (result: TickResult) => void;
  onOverdueDetected?: (queueItems: QueueItem[], posts: ScheduledPost[], result: TickResult) => void;
  onError?: (error: Error) => void;
}

/**
 * Normaliza qualquer formato de data ou string ISO para timestamp numérico UTC
 */
export function parseDateToTimestamp(input: Date | string): number {
  if (input instanceof Date) return input.getTime();
  if (typeof input !== "string" || !input.trim()) return NaN;

  const trimmed = input.trim();
  // Se for ISO sem fuso (ex: "2026-10-28T14:00:00"), força UTC para evitar divergência de timezone local
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(trimmed)) {
    return new Date(`${trimmed}Z`).getTime();
  }
  return new Date(trimmed).getTime();
}

/**
 * Detecta itens de fila agendados cujo scheduledFor é menor ou igual ao horário de referência
 */
export function detectOverdueQueueItems(
  queue: QueueItem[],
  referenceDate: Date | string = new Date(),
  toleranceMs: number = 0
): QueueItem[] {
  const refTime = parseDateToTimestamp(referenceDate) + toleranceMs;

  return queue.filter((item) => {
    // Apenas itens com status 'scheduled' ou 'queued' podem vencer
    if (item.status !== "scheduled" && item.status !== "queued") {
      return false;
    }

    const scheduledTime = parseDateToTimestamp(item.scheduledFor);
    return !isNaN(scheduledTime) && scheduledTime <= refTime;
  });
}

/**
 * Detecta posts do calendário tradicional cujo scheduledAt é menor ou igual ao horário de referência
 */
export function detectOverduePosts(
  posts: ScheduledPost[],
  referenceDate: Date | string = new Date(),
  toleranceMs: number = 0
): ScheduledPost[] {
  const refTime = parseDateToTimestamp(referenceDate) + toleranceMs;

  return posts.filter((post) => {
    // Apenas posts com status 'scheduled' podem vencer
    if (post.status !== "scheduled") {
      return false;
    }

    const scheduledTime = parseDateToTimestamp(post.scheduledAt);
    return !isNaN(scheduledTime) && scheduledTime <= refTime;
  });
}

/**
 * Formata o tempo restante em milissegundos para contagem regressiva amigável (ex: "45s", "01m 20s")
 */
export function formatTimeUntilNextTick(remainingMs: number): string {
  if (remainingMs <= 0) return "Agora";

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  const paddedSeconds = seconds.toString().padStart(2, "0");
  return `${minutes}m ${paddedSeconds}s`;
}

/**
 * Classe do Motor de Varredura de Posts Vencidos (OverdueScanner)
 */
export class OverdueScanner {
  private intervalMs: number;
  private toleranceMs: number;
  private status: ScannerStatus = "idle";
  private timerId: NodeJS.Timeout | null = null;
  private tickCount: number = 0;
  private totalOverdueCount: number = 0;
  private lastTickTimestamp?: string;
  private lastTickDurationMs?: number;
  private nextTickTimestamp?: string;
  private isProcessingLock: boolean = false;

  private getQueueFn: () => QueueItem[];
  private getPostsFn: () => ScheduledPost[];

  private tickListeners: Array<(result: TickResult) => void> = [];
  private overdueListeners: Array<(queueItems: QueueItem[], posts: ScheduledPost[], result: TickResult) => void> = [];
  private errorListeners: Array<(error: Error) => void> = [];

  constructor(options: OverdueScannerOptions = {}) {
    this.intervalMs = options.intervalMs ?? DEFAULT_POLLING_INTERVAL_MS;
    this.toleranceMs = options.toleranceMs ?? 0;
    this.getQueueFn = options.getQueue ?? (() => []);
    this.getPostsFn = options.getPosts ?? (() => []);

    if (options.onTick) this.tickListeners.push(options.onTick);
    if (options.onOverdueDetected) this.overdueListeners.push(options.onOverdueDetected);
    if (options.onError) this.errorListeners.push(options.onError);
  }

  /**
   * Conecta fontes de dados externas (ex: Zustand Store)
   */
  public bindDataSources(getQueue: () => QueueItem[], getPosts: () => ScheduledPost[]): void {
    this.getQueueFn = getQueue;
    this.getPostsFn = getPosts;
  }

  /**
   * Inicia o loop de polling periódico de 60 segundos
   */
  public start(): void {
    if (this.status === "running") return;

    this.status = "running";
    this.scheduleNextTick();
  }

  /**
   * Para completamente o motor e limpa timers ativos
   */
  public stop(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.status = "stopped";
    this.nextTickTimestamp = undefined;
  }

  /**
   * Pausa temporariamente o loop sem zerar contadores
   */
  public pause(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.status = "paused";
    this.nextTickTimestamp = undefined;
  }

  /**
   * Retoma o loop caso esteja pausado
   */
  public resume(): void {
    if (this.status === "paused") {
      this.start();
    }
  }

  /**
   * Executa uma varredura atômica imediata (manual ou disparada por timer)
   */
  public tick(referenceDate: Date | string = new Date()): TickResult {
    // Proteção contra reentrância / concorrência
    if (this.isProcessingLock) {
      const skippedResult: TickResult = {
        tickId: `tick_skipped_${Date.now()}`,
        tickNumber: this.tickCount,
        timestamp: new Date().toISOString(),
        durationMs: 0,
        overdueQueueItems: [],
        overduePosts: [],
        totalOverdue: 0,
        referenceTime: typeof referenceDate === "string" ? referenceDate : referenceDate.toISOString()
      };
      return skippedResult;
    }

    this.isProcessingLock = true;
    const startTime = Date.now();
    this.tickCount++;

    try {
      const currentQueue = this.getQueueFn();
      const currentPosts = this.getPostsFn();

      const overdueQueueItems = detectOverdueQueueItems(currentQueue, referenceDate, this.toleranceMs);
      const overduePosts = detectOverduePosts(currentPosts, referenceDate, this.toleranceMs);
      const totalOverdue = overdueQueueItems.length + overduePosts.length;

      this.totalOverdueCount += totalOverdue;
      const durationMs = Date.now() - startTime;
      const nowIso = new Date().toISOString();

      this.lastTickTimestamp = nowIso;
      this.lastTickDurationMs = durationMs;

      const result: TickResult = {
        tickId: `tick_${this.tickCount}_${startTime}`,
        tickNumber: this.tickCount,
        timestamp: nowIso,
        durationMs,
        overdueQueueItems,
        overduePosts,
        totalOverdue,
        referenceTime: typeof referenceDate === "string" ? referenceDate : referenceDate.toISOString()
      };

      // Notifica ouvintes de tick
      this.tickListeners.forEach((listener) => {
        try {
          listener(result);
        } catch (err) {
          this.notifyError(err instanceof Error ? err : new Error(String(err)));
        }
      });

      // Se encontrou itens vencidos, notifica ouvintes específicos
      if (totalOverdue > 0) {
        this.overdueListeners.forEach((listener) => {
          try {
            listener(overdueQueueItems, overduePosts, result);
          } catch (err) {
            this.notifyError(err instanceof Error ? err : new Error(String(err)));
          }
        });
      }

      return result;
    } finally {
      this.isProcessingLock = false;
    }
  }

  /**
   * Versão assíncrona do tick
   */
  public async tickAsync(referenceDate?: Date | string): Promise<TickResult> {
    return Promise.resolve(this.tick(referenceDate));
  }

  /**
   * Agenda a próxima invocação do tick
   */
  private scheduleNextTick(): void {
    if (this.status !== "running") return;

    const nextTickDate = new Date(Date.now() + this.intervalMs);
    this.nextTickTimestamp = nextTickDate.toISOString();

    this.timerId = setTimeout(() => {
      if (this.status === "running") {
        this.tick();
        this.scheduleNextTick();
      }
    }, this.intervalMs);

    // Garante que o timer não bloqueia o processo Node.js se for unref
    if (this.timerId && typeof (this.timerId as any).unref === "function") {
      (this.timerId as any).unref();
    }
  }

  /**
   * Registra um ouvinte para cada tick executado
   */
  public onTick(listener: (result: TickResult) => void): () => void {
    this.tickListeners.push(listener);
    return () => {
      this.tickListeners = this.tickListeners.filter((l) => l !== listener);
    };
  }

  /**
   * Registra um ouvinte para quando itens vencidos forem detectados
   */
  public onOverdueDetected(
    listener: (queueItems: QueueItem[], posts: ScheduledPost[], result: TickResult) => void
  ): () => void {
    this.overdueListeners.push(listener);
    return () => {
      this.overdueListeners = this.overdueListeners.filter((l) => l !== listener);
    };
  }

  /**
   * Registra um ouvinte de erros
   */
  public onError(listener: (error: Error) => void): () => void {
    this.errorListeners.push(listener);
    return () => {
      this.errorListeners = this.errorListeners.filter((l) => l !== listener);
    };
  }

  private notifyError(error: Error): void {
    this.errorListeners.forEach((listener) => {
      try {
        listener(error);
      } catch (err) {
        console.error("Erro interno no listener de erro:", err);
      }
    });
  }

  /**
   * Retorna o snapshot de estado do motor
   */
  public getState(): ScannerState {
    return {
      status: this.status,
      intervalMs: this.intervalMs,
      totalTicks: this.tickCount,
      lastTickAt: this.lastTickTimestamp,
      lastTickDurationMs: this.lastTickDurationMs,
      nextTickAt: this.nextTickTimestamp,
      totalOverdueDetected: this.totalOverdueCount,
      isRunning: this.status === "running",
      isLocked: this.isProcessingLock
    };
  }

  /**
   * Retorna o tempo restante em milissegundos até o próximo tick
   */
  public getTimeUntilNextTick(): number {
    if (!this.nextTickTimestamp || this.status !== "running") return 0;
    const remaining = new Date(this.nextTickTimestamp).getTime() - Date.now();
    return Math.max(0, remaining);
  }
}

/**
 * Cria uma nova instância configurada do OverdueScanner
 */
export function createOverdueScanner(options?: OverdueScannerOptions): OverdueScanner {
  return new OverdueScanner(options);
}

// Instância singleton para uso compartilhado na aplicação
let globalScannerInstance: OverdueScanner | null = null;

export function getGlobalOverdueScanner(): OverdueScanner {
  if (!globalScannerInstance) {
    globalScannerInstance = new OverdueScanner({
      intervalMs: DEFAULT_POLLING_INTERVAL_MS
    });
  }
  return globalScannerInstance;
}
