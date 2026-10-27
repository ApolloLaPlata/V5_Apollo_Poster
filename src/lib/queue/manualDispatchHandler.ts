/**
 * manualDispatchHandler.ts - Manipulador de Disparo Forçado Manual ("Executar Agora")
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Permite ao Operador Disparar Posts Agendados Instantaneamente sem Esperar o Horário:
 * - Bypass seguro do cronograma temporal (scheduledFor)
 * - Transição imediata para processamento e execução de rede concorrente
 * - Registro formal de auditoria em logs com ação 'manual_forced_dispatch'
 * - Feedback detalhado por plataforma e sincronização atômica no Zustand Store
 */

import { QueueItem, SocialPlatform, DispatchLogEntry } from "@/types/poster";
import { executeSingleTaskDispatch, executeBatchNetworkDispatch, TaskDispatchResult, BatchExecutionReport, BatchSimulatorOptions } from "./batchNetworkSimulator";
import { usePosterStore } from "@/store/usePosterStore";

export interface ManualDispatchResult {
  success: boolean;
  item: QueueItem;
  dispatchResult: TaskDispatchResult;
  logEntry?: Omit<DispatchLogEntry, "id" | "timestamp">;
}

export interface BatchManualDispatchResult {
  success: boolean;
  report: BatchExecutionReport;
  updatedQueue: QueueItem[];
}

/**
 * Executa o disparo forçado manual de uma única tarefa agendada
 */
export async function executeManualForcedDispatch(
  itemId: string,
  options: BatchSimulatorOptions = {}
): Promise<ManualDispatchResult> {
  const store = usePosterStore.getState();
  const targetItem = store.dispatchQueue.find((i) => i.id === itemId);

  if (!targetItem) {
    throw new Error(`Tarefa com ID '${itemId}' não encontrada na fila de despacho.`);
  }

  // Prepara o item com bypass do horário para execução imediata
  const forcedItem: QueueItem = {
    ...targetItem,
    scheduledFor: new Date().toISOString()
  };

  // Executa o despacho de rede simulado/real
  const { result, updatedItem } = await executeSingleTaskDispatch(forcedItem, options);

  // Sincroniza no Zustand Store
  store.syncQueueItems([updatedItem]);

  // Cria entrada de log de auditoria
  const isSuccess = result.finalStatus === "published";
  const channelList = result.platforms.join(", ");
  const statusCode = isSuccess ? 200 : (result.retryDecision?.action === "retry" ? 202 : 500);

  const logEntry: Omit<DispatchLogEntry, "id" | "timestamp"> = {
    channel: (result.platforms[0] as any) || "autoblog",
    action: "manual_forced_dispatch" as any,
    status: isSuccess ? "success" : "failed",
    statusCode,
    message: isSuccess
      ? `Disparo manual forçado de "${result.title}" executado com sucesso nos canais: ${channelList}`
      : `Disparo manual forçado de "${result.title}" falhou. ${result.retryDecision?.reason || ""}`,
    payloadSummary: `Item: ${result.itemId} • Latência: ${result.totalDurationMs}ms • Plataformas: ${channelList}`,
    latencyMs: result.totalDurationMs
  };

  store.addLog(logEntry);

  return {
    success: isSuccess,
    item: updatedItem,
    dispatchResult: result,
    logEntry
  };
}

/**
 * Executa o disparo forçado manual em lote de múltiplos posts selecionados ou de toda a fila pendente
 */
export async function executeBatchManualForcedDispatch(
  itemIds?: string[],
  options: BatchSimulatorOptions = {}
): Promise<BatchManualDispatchResult> {
  const store = usePosterStore.getState();
  let candidateItems: QueueItem[];

  if (itemIds && itemIds.length > 0) {
    const idSet = new Set(itemIds);
    candidateItems = store.dispatchQueue.filter((i) => idSet.has(i.id));
  } else {
    // Todos os itens elegíveis ativos (scheduled ou queued)
    candidateItems = store.dispatchQueue.filter(
      (i) => i.status === "scheduled" || i.status === "queued"
    );
  }

  if (candidateItems.length === 0) {
    const emptyReport: BatchExecutionReport = {
      batchId: `batch_empty_${Date.now()}`,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      totalDurationMs: 0,
      totalTasks: 0,
      succeededCount: 0,
      retriedCount: 0,
      failedCount: 0,
      successRatePercent: 100,
      results: []
    };
    return {
      success: true,
      report: emptyReport,
      updatedQueue: store.dispatchQueue
    };
  }

  // Prepara itens para disparo imediato
  const now = new Date().toISOString();
  const forcedItems = candidateItems.map((item) => ({
    ...item,
    scheduledFor: now
  }));

  // Executa despacho em lote com pool de concorrência
  const { report, updatedQueue } = await executeBatchNetworkDispatch(forcedItems, options);

  // Sincroniza todos os itens de uma só vez no Zustand Store
  store.syncQueueItems(updatedQueue);

  // Registra logs para cada resultado
  report.results.forEach((res) => {
    const isSucc = res.finalStatus === "published";
    store.addLog({
      channel: (res.platforms[0] as any) || "autoblog",
      action: "manual_forced_batch_dispatch" as any,
      status: isSucc ? "success" : "failed",
      statusCode: isSucc ? 200 : 500,
      message: isSucc
        ? `[Lote] Disparo forçado de "${res.title}" concluído com sucesso (${res.platforms.join(", ")})`
        : `[Lote] Disparo forçado de "${res.title}" falhou.`,
      payloadSummary: `Batch ID: ${report.batchId} • Latência: ${res.totalDurationMs}ms`,
      latencyMs: res.totalDurationMs
    });
  });

  return {
    success: report.failedCount === 0,
    report,
    updatedQueue
  };
}
