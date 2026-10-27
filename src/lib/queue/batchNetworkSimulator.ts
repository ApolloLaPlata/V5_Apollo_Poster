/**
 * batchNetworkSimulator.ts - Simulador de Execução de Rede em Lote
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Despacho Concorrente em Paralelo de Posts e Ofertas Vencidas:
 * - Pool de execução assíncrono com controle estrito de concorrência (concurrency limit)
 * - Simulação fidedigna de chamadas de APIs parceiras (Meta Graph, TikTok, YouTube, Telegram, WhatsApp, Resend, WordPress)
 * - Medição de latência real de rede por plataforma
 * - Integração nativa com a FSM de transições (Etapa 083) e motor de retentativas com backoff (Etapa 084)
 * - Consolidação de status individual e relatório executivo do lote
 */

import { QueueItem, SocialPlatform } from "@/types/poster";
import { transitionQueueItem } from "./taskStateTransition";
import { applyRetryToQueueItem, RetryDecision } from "./retryManager";
import { diagnoseDispatchError, formatDiagnosticSummary } from "./dispatchDiagnostics";

export const DEFAULT_BATCH_CONCURRENCY = 3;

export interface PlatformDispatchResponse {
  platform: SocialPlatform;
  success: boolean;
  statusCode: number;
  remoteMessageId?: string;
  latencyMs: number;
  error?: string;
}

export interface TaskDispatchResult {
  itemId: string;
  entityId: string;
  title: string;
  finalStatus: "published" | "queued" | "failed";
  attempts: number;
  totalDurationMs: number;
  platforms: SocialPlatform[];
  platformResponses: Record<string, PlatformDispatchResponse>;
  overallSuccess: boolean;
  retryDecision?: RetryDecision;
}

export interface BatchExecutionReport {
  batchId: string;
  startedAt: string;
  completedAt: string;
  totalDurationMs: number;
  totalTasks: number;
  succeededCount: number;
  retriedCount: number;
  failedCount: number;
  successRatePercent: number;
  results: TaskDispatchResult[];
}

export interface BatchSimulatorOptions {
  concurrency?: number;
  simulatedMinLatencyMs?: number;
  simulatedMaxLatencyMs?: number;
  simulatedPlatformFailures?: Record<string, { statusCode: number; errorMessage: string }>;
  onTaskCompleted?: (result: TaskDispatchResult, index: number, total: number) => void;
  mockNetworkFn?: (platform: SocialPlatform, payload: unknown) => Promise<PlatformDispatchResponse>;
}

/**
 * Gera um identificador de mensagem remoto fidedigno por plataforma
 */
export function generateRemoteMessageId(platform: SocialPlatform): string {
  const timestamp = Date.now().toString(36);
  const randomSuffix = Math.random().toString(36).substring(2, 8);

  switch (platform) {
    case "instagram":
      return `ig_media_${timestamp}_${randomSuffix}`;
    case "tiktok":
      return `tk_v_publish_${timestamp}_${randomSuffix}`;
    case "youtube":
      return `yt_data_v3_${timestamp}_${randomSuffix}`;
    case "kwai":
      return `kw_v_${timestamp}_${randomSuffix}`;
    case "whatsapp":
      return `wamid.HBgM${timestamp}.${randomSuffix}==`;
    case "telegram":
      return `tg_msg_${timestamp}_${randomSuffix}`;
    case "newsletter":
      return `resend_email_${timestamp}_${randomSuffix}`;
    case "autoblog":
      return `autoblog_post_${timestamp}_${randomSuffix}`;
    case "wordpress":
      return `wp_rest_post_${timestamp}_${randomSuffix}`;
    case "x_twitter":
      return `tweet_v2_${timestamp}_${randomSuffix}`;
    case "threads":
      return `threads_post_${timestamp}_${randomSuffix}`;
    default:
      return `generic_msg_${timestamp}_${randomSuffix}`;
  }
}

/**
 * Simula a chamada de rede a uma API de plataforma específica
 */
export async function simulatePlatformNetworkCall(
  platform: SocialPlatform,
  options: BatchSimulatorOptions = {}
): Promise<PlatformDispatchResponse> {
  const minLatency = options.simulatedMinLatencyMs ?? 20;
  const maxLatency = options.simulatedMaxLatencyMs ?? 60;
  const latencyMs = Math.floor(minLatency + Math.random() * (maxLatency - minLatency));

  // Simula o tempo de trânsito HTTP
  await new Promise((resolve) => setTimeout(resolve, latencyMs));

  // Verifica se há falha injetada para testes da plataforma
  const injectedFailure = options.simulatedPlatformFailures?.[platform];
  if (injectedFailure) {
    return {
      platform,
      success: false,
      statusCode: injectedFailure.statusCode,
      latencyMs,
      error: injectedFailure.errorMessage
    };
  }

  // Resposta de sucesso padrão
  return {
    platform,
    success: true,
    statusCode: platform === "autoblog" || platform === "wordpress" ? 201 : 200,
    remoteMessageId: generateRemoteMessageId(platform),
    latencyMs
  };
}

/**
 * Executa o despacho individual de um QueueItem transitando estados e disparando para todas as plataformas
 */
export async function executeSingleTaskDispatch(
  item: QueueItem,
  options: BatchSimulatorOptions = {}
): Promise<{ result: TaskDispatchResult; updatedItem: QueueItem }> {
  const startTime = Date.now();

  // 1. Transita para 'processing' (FSM)
  const processingItem = transitionQueueItem(item, "processing");

  const platformResponses: Record<string, PlatformDispatchResponse> = {};
  const platformsToDispatch = processingItem.platforms.length > 0 
    ? processingItem.platforms 
    : (["autoblog"] as SocialPlatform[]);

  let anyFailure = false;
  let firstFailedStatusCode: number | undefined;
  let firstFailedErrorMessage: string | undefined;

  // 2. Dispara para as plataformas em paralelo
  const dispatchPromises = platformsToDispatch.map(async (platform) => {
    try {
      const response = options.mockNetworkFn
        ? await options.mockNetworkFn(platform, processingItem.payload)
        : await simulatePlatformNetworkCall(platform, options);

      platformResponses[platform] = response;
      if (!response.success) {
        anyFailure = true;
        if (!firstFailedStatusCode) {
          firstFailedStatusCode = response.statusCode;
          firstFailedErrorMessage = response.error;
        }
      }
    } catch (err) {
      anyFailure = true;
      const errMsg = err instanceof Error ? err.message : String(err);
      platformResponses[platform] = {
        platform,
        success: false,
        statusCode: 500,
        latencyMs: 10,
        error: errMsg
      };
      if (!firstFailedStatusCode) {
        firstFailedStatusCode = 500;
        firstFailedErrorMessage = errMsg;
      }
    }
  });

  await Promise.all(dispatchPromises);
  const totalDurationMs = Date.now() - startTime;

  // 3. Avalia o resultado global da tarefa
  if (!anyFailure) {
    // Sucesso em 100% das plataformas
    const publishedItem = transitionQueueItem(processingItem, "published", {
      reason: `Disparo concluído com sucesso em ${platformsToDispatch.length} canais.`
    });

    const result: TaskDispatchResult = {
      itemId: item.id,
      entityId: item.entityId,
      title: item.title,
      finalStatus: "published",
      attempts: publishedItem.attempts,
      totalDurationMs,
      platforms: platformsToDispatch,
      platformResponses,
      overallSuccess: true
    };

    return { result, updatedItem: publishedItem };
  }

  // Ocorreu falha: aciona o motor de retry automático e gera diagnóstico amigável
  const { item: retriedOrFailedItem, decision } = applyRetryToQueueItem(
    processingItem,
    firstFailedErrorMessage || "Erro na entrega da plataforma",
    firstFailedStatusCode || 500
  );

  const failedPlatform = (Object.keys(platformResponses).find(
    (p) => !platformResponses[p].success
  ) as SocialPlatform) || platformsToDispatch[0] || "autoblog";

  const diagnostic = diagnoseDispatchError(
    failedPlatform,
    firstFailedStatusCode || 500,
    firstFailedErrorMessage || "Erro na entrega da plataforma"
  );

  const enrichedItem: QueueItem = {
    ...retriedOrFailedItem,
    errorMessage: formatDiagnosticSummary(diagnostic),
    diagnostic
  };

  const result: TaskDispatchResult = {
    itemId: item.id,
    entityId: item.entityId,
    title: item.title,
    finalStatus: enrichedItem.status as "queued" | "failed",
    attempts: enrichedItem.attempts,
    totalDurationMs,
    platforms: platformsToDispatch,
    platformResponses,
    overallSuccess: false,
    retryDecision: decision
  };

  return { result, updatedItem: enrichedItem };
}

/**
 * Pool de Concorrência Controlada: executa uma lista de tarefas com limite máximo de promessas paralelas
 */
export async function executeBatchWithConcurrencyLimit<T, R>(
  items: T[],
  concurrencyLimit: number,
  taskFn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  async function worker(): Promise<void> {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      const item = items[index];
      results[index] = await taskFn(item, index);
    }
  }

  const workerCount = Math.min(concurrencyLimit, items.length);
  const workers = Array.from({ length: workerCount }, () => worker());
  await Promise.all(workers);

  return results;
}

/**
 * Executa o disparo em lote de itens vencidos em paralelo com controle de concorrência e relatório completo
 */
export async function executeBatchNetworkDispatch(
  items: QueueItem[],
  options: BatchSimulatorOptions = {}
): Promise<{ report: BatchExecutionReport; updatedQueue: QueueItem[] }> {
  const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const startedAt = new Date().toISOString();
  const startTime = Date.now();

  const concurrency = options.concurrency || DEFAULT_BATCH_CONCURRENCY;

  // Mapeamento dos itens atualizados
  const updatedItemsMap = new Map<string, QueueItem>();

  const results = await executeBatchWithConcurrencyLimit(
    items,
    concurrency,
    async (item, index) => {
      const { result, updatedItem } = await executeSingleTaskDispatch(item, options);
      updatedItemsMap.set(item.id, updatedItem);

      if (options.onTaskCompleted) {
        options.onTaskCompleted(result, index + 1, items.length);
      }

      return result;
    }
  );

  const completedAt = new Date().toISOString();
  const totalDurationMs = Date.now() - startTime;

  let succeededCount = 0;
  let retriedCount = 0;
  let failedCount = 0;

  results.forEach((r) => {
    if (r.finalStatus === "published") succeededCount++;
    else if (r.finalStatus === "queued") retriedCount++;
    else failedCount++;
  });

  const totalTasks = items.length;
  const successRatePercent = totalTasks > 0 ? Math.round((succeededCount / totalTasks) * 100) : 100;

  const report: BatchExecutionReport = {
    batchId,
    startedAt,
    completedAt,
    totalDurationMs,
    totalTasks,
    succeededCount,
    retriedCount,
    failedCount,
    successRatePercent,
    results
  };

  const updatedQueue = items.map((orig) => updatedItemsMap.get(orig.id) || orig);

  return {
    report,
    updatedQueue
  };
}
