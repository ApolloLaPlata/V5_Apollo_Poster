"use client";

/**
 * BackgroundQueueDashboard.tsx - Painel Visual de Fila de Background no Dashboard
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Exibição em Tempo Real de:
 * - Posts e tarefas em processamento ativo (com animação de pulso)
 * - Próximos itens ordenados segundo padrão FIFO temporal e prioridade
 * - Fila de retentativas automáticas aguardando backoff exponencial
 * - Controlador do Motor de Polling de 60 segundos com contagem regressiva
 * - Telemetria de fila (tempo médio de espera, taxa de sucesso, total ativo)
 */

import React, { useState } from "react";
import { usePosterStore } from "@/store/usePosterStore";
import {
  useOverdueScanner
} from "@/lib/queue/useOverdueScanner";
import {
  getQueueStats
} from "@/lib/queue/dispatchQueue";
import { formatTimeUntilNextTick } from "@/lib/queue/overdueScanner";
import { DEFAULT_BATCH_CONCURRENCY } from "@/lib/queue/batchNetworkSimulator";
import {
  formatRetryCountdown
} from "@/lib/queue/retryManager";
import {
  executeManualForcedDispatch,
  executeBatchManualForcedDispatch
} from "@/lib/queue/manualDispatchHandler";
import { QueueItem, QueueItemPriority, SocialPlatform } from "@/types/poster";
import {
  Layers,
  Clock,
  Play,
  Pause,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Zap,
  RotateCcw,
  Trash2,
  Plus,
  Send,
  Timer,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Server
} from "lucide-react";
import { toast } from "@/lib/toast/useToast";

export function BackgroundQueueDashboard() {
  const {
    dispatchQueue,
    updateQueueItemStatus,
    removeQueueItem,
    clearCompletedQueue,
    enqueueQueueItem
  } = usePosterStore();

  const [filterType, setFilterType] = useState<"all" | "post" | "deal">("all");
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPlatform, setNewPlatform] = useState<SocialPlatform>("autoblog");
  const [newPriority, setNewPriority] = useState<QueueItemPriority>("normal");
  const [newScheduledMinutes, setNewScheduledMinutes] = useState(15);

  // Hook do scanner contínuo de 60s
  const {
    scannerState,
    countdownString,
    triggerManualScan,
    togglePause,
    isScanning
  } = useOverdueScanner({
    onOverdueDetected: (qItems, pItems) => {
      toast.info(`⚡ Varredura: ${qItems.length + pItems.length} tarefa(s) vencida(s) identificada(s) para despacho!`);
    }
  });

  const stats = getQueueStats(dispatchQueue);

  // Filtra itens
  const filteredQueue = dispatchQueue.filter((item) => {
    if (filterType !== "all" && item.entityType !== filterType) return false;
    return true;
  });

  // Separação por seções visuais
  const processingItems = filteredQueue.filter((i) => i.status === "processing");
  const scheduledOrQueuedItems = filteredQueue.filter(
    (i) => i.status === "scheduled" || i.status === "queued"
  );
  const retryAwaitingItems = filteredQueue.filter(
    (i) => i.status === "queued" && Boolean(i.nextAttemptAt)
  );
  const finishedItems = filteredQueue.filter(
    (i) => i.status === "published" || i.status === "failed" || i.status === "cancelled"
  );

  // Estados de carregamento de disparo manual
  const [dispatchingIds, setDispatchingIds] = useState<Set<string>>(new Set());
  const [isBatchDispatching, setIsBatchDispatching] = useState(false);

  // Disparo Forçado Manual de um item específico
  const handleForceDispatchItem = async (itemId: string, title: string) => {
    setDispatchingIds((prev) => new Set(prev).add(itemId));
    toast.info(`⚡ Forçando disparo imediato de "${title}"...`);
    try {
      const res = await executeManualForcedDispatch(itemId);
      if (res.success) {
        toast.success(`Publicação de "${title}" executada com sucesso!`);
      } else {
        toast.error(`Falha no envio de "${title}". Encaminhado para fila de retentativas.`);
      }
    } catch (err) {
      toast.error(`Erro ao disparar "${title}": ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setDispatchingIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  // Disparo Forçado Manual em Lote
  const handleBatchForceDispatch = async () => {
    if (scheduledOrQueuedItems.length === 0) return;
    setIsBatchDispatching(true);
    toast.info(`⚡ Disparando em lote ${scheduledOrQueuedItems.length} post(s) agora...`);
    try {
      const ids = scheduledOrQueuedItems.map((i) => i.id);
      const res = await executeBatchManualForcedDispatch(ids);
      if (res.success) {
        toast.success(`Lote executado com 100% de sucesso (${res.report.succeededCount}/${res.report.totalTasks} tarefas)!`);
      } else {
        toast.warning(`Lote concluído: ${res.report.succeededCount} sucesso, ${res.report.retriedCount} retry, ${res.report.failedCount} falhas.`);
      }
    } catch (err) {
      toast.error(`Erro no disparo em lote: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsBatchDispatching(false);
    }
  };

  const handleManualScanClick = () => {
    const res = triggerManualScan();
    if (res) {
      if (res.totalOverdue > 0) {
        toast.success(`Varredura concluída: ${res.totalOverdue} tarefa(s) vencida(s) detectada(s)!`);
      } else {
        toast.info("Varredura concluída: Nenhuma tarefa vencida pendente no momento.");
      }
    }
  };

  const handleCreateQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Informe o título da tarefa.");
      return;
    }

    const scheduledDate = new Date(Date.now() + newScheduledMinutes * 60 * 1000);
    const newItem: QueueItem = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      entityId: `entity_${Date.now()}`,
      entityType: "post",
      title: newTitle.trim(),
      platforms: [newPlatform],
      scheduledFor: scheduledDate.toISOString(),
      priority: newPriority,
      status: "scheduled",
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    enqueueQueueItem(newItem);
    toast.success(`Tarefa "${newItem.title}" adicionada à fila com agendamento para daqui a ${newScheduledMinutes}m!`);
    setNewTitle("");
    setIsNewTaskModalOpen(false);
  };

  const formatScheduledTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return isoString;
    }
  };

  const formatScheduledDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner de Telemetria e Controle do Worker de 60s */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-40 bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  Fila de Agendamento em Background
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                    FIFO Engine • 60s Polling
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Monitoramento contínuo em segundo plano, retentativas com backoff exponencial e despacho assíncrono.
                </p>
              </div>
            </div>
          </div>

          {/* Painel do Worker Polling */}
          <div className="flex flex-wrap items-center gap-3 bg-zinc-950/80 border border-zinc-800/80 p-2.5 rounded-xl text-xs">
            <div className="flex items-center gap-2 px-2 py-1 bg-zinc-900 rounded-lg">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isScanning ? "bg-emerald-400" : "bg-amber-400"
                }`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isScanning ? "bg-emerald-500" : "bg-amber-500"
                }`} />
              </span>
              <span className="text-zinc-300 font-medium">
                {isScanning ? "Worker Ativo" : "Worker Pausado"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px] px-2 py-1 bg-zinc-900/60 rounded-lg">
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              <span>Próximo Scan:</span>
              <strong className="text-zinc-200">{countdownString}</strong>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleManualScanClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition shadow-sm"
                title="Executar varredura de itens vencidos agora"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Escanear Agora</span>
              </button>

              <button
                onClick={togglePause}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 transition"
                title={isScanning ? "Pausar polling de 60s" : "Retomar polling de 60s"}
              >
                {isScanning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* 4 Cards de Métricas da Fila */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-zinc-800/60">
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3">
            <span className="text-[11px] text-zinc-400 uppercase font-medium flex items-center justify-between">
              Total em Fila
              <Layers className="w-3.5 h-3.5 text-blue-400" />
            </span>
            <div className="text-xl font-bold text-zinc-100 font-mono mt-1">
              {stats.activeCount}
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              {stats.scheduledCount} agendados • {stats.queuedCount} em espera
            </span>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3">
            <span className="text-[11px] text-zinc-400 uppercase font-medium flex items-center justify-between">
              Em Processamento
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </span>
            <div className="text-xl font-bold text-amber-400 font-mono mt-1 flex items-center gap-2">
              {processingItems.length}
              {processingItems.length > 0 && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-md font-sans font-normal animate-pulse">
                  Despachando
                </span>
              )}
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              Pool concorrente ({DEFAULT_BATCH_CONCURRENCY} workers)
            </span>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3">
            <span className="text-[11px] text-zinc-400 uppercase font-medium flex items-center justify-between">
              Aguardando Retry
              <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
            </span>
            <div className="text-xl font-bold text-orange-400 font-mono mt-1">
              {retryAwaitingItems.length}
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              Backoff exponencial ativo
            </span>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3">
            <span className="text-[11px] text-zinc-400 uppercase font-medium flex items-center justify-between">
              Tempo Médio Espera
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
            </span>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
              ~{stats.averageWaitTimeSeconds}s
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              Próximo: {stats.nextScheduledAt ? formatScheduledTime(stats.nextScheduledAt) : "Nenhum"}
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Ações de Fila */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-400 font-medium mr-1">Filtrar por:</span>
          {(["all", "post", "deal"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filterType === t
                  ? "bg-zinc-800 text-amber-400 border border-amber-500/30"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              {t === "all" ? "Todos os Itens" : t === "post" ? "Apenas Posts" : "Ofertas VIP"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {scheduledOrQueuedItems.length > 0 && (
            <button
              onClick={handleBatchForceDispatch}
              disabled={isBatchDispatching}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-xs transition disabled:opacity-50 shadow-sm"
              title="Forçar despacho de todas as tarefas pendentes agora"
            >
              {isBatchDispatching ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Disparando...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Disparar Todos ({scheduledOrQueuedItems.length})</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => setIsNewTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-medium border border-zinc-700 transition"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Adicionar Tarefa</span>
          </button>

          {finishedItems.length > 0 && (
            <button
              onClick={() => {
                clearCompletedQueue();
                toast.info("Itens concluídos removidos da fila.");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 rounded-lg font-medium border border-zinc-800 transition"
              title="Limpar itens publicados e cancelados"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Concluídos ({finishedItems.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Grade Principal: Duas Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 & 2: Itens em Processamento e Próximos da Fila FIFO */}
        <div className="lg:col-span-2 space-y-4">
          {/* Seção 1: Em Processamento Ativo (se houver) */}
          {processingItems.length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Em Processamento Ativo ({processingItems.length})
                </h3>
                <span className="text-[11px] text-amber-300/80 font-mono">
                  Enviando requisições assíncronas para as APIs parceiras...
                </span>
              </div>

              <div className="space-y-2">
                {processingItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-zinc-950/80 border border-amber-500/20 rounded-xl p-3 flex items-center justify-between gap-3 shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                        <Zap className="w-4 h-4 animate-spin" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
                          {item.title}
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                            Tentativa {item.attempts}/3
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                          <span className="capitalize">{item.entityType}</span>
                          <span>•</span>
                          <span className="font-mono text-zinc-300">
                            Canais: {item.platforms.join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seção 2: Próximos Itens da Fila FIFO */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Próximos da Fila de Agendamento (Ordem FIFO)
                </h3>
                <p className="text-xs text-zinc-400">
                  Classificados por peso de prioridade e timestamp cronológico de execução.
                </p>
              </div>

              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                {scheduledOrQueuedItems.length} tarefa(s) aguardando
              </span>
            </div>

            {scheduledOrQueuedItems.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                <CheckCircle2 className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                <p className="text-sm font-medium text-zinc-400">Fila de agendamento limpa!</p>
                <p className="text-xs text-zinc-600 mt-1">
                  Nenhum post ou oferta agendada pendente de disparo no momento.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {scheduledOrQueuedItems.map((item, idx) => {
                  const isAwaitingRetry = item.status === "queued" && Boolean(item.nextAttemptAt);
                  const isUrgent = item.priority === "urgent";
                  const isHigh = item.priority === "high";

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isAwaitingRetry
                          ? "bg-orange-500/5 border-orange-500/30"
                          : isUrgent
                          ? "bg-red-500/5 border-red-500/30"
                          : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center justify-center w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono font-bold text-zinc-400 shrink-0 mt-0.5">
                          {idx + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm text-zinc-100">
                              {item.title}
                            </h4>

                            {/* Badge de Prioridade */}
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold uppercase ${
                                isUrgent
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                  : isHigh
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              }`}
                            >
                              {item.priority}
                            </span>

                            {/* Badge de Retry */}
                            {isAwaitingRetry && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-orange-500/20 text-orange-400 font-mono flex items-center gap-1">
                                <RotateCcw className="w-2.5 h-2.5" />
                                Retry {formatRetryCountdown(item.nextAttemptAt!)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-400 flex-wrap">
                            <span className="flex items-center gap-1 font-mono text-zinc-300">
                              <Clock className="w-3 h-3 text-amber-400" />
                              {formatScheduledDate(item.scheduledFor)} às {formatScheduledTime(item.scheduledFor)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                              {item.platforms.map((p) => (
                                <span
                                  key={p}
                                  className="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] text-zinc-300 font-mono"
                                >
                                  {p}
                                </span>
                              ))}
                            </span>
                            {item.attempts > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-orange-400 font-mono text-[11px]">
                                  Tentativas: {item.attempts}/{item.maxAttempts}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Ações do Item */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                        <button
                          onClick={() => handleForceDispatchItem(item.id, item.title)}
                          disabled={dispatchingIds.has(item.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-300 text-xs font-semibold transition disabled:opacity-50"
                          title="Forçar execução imediata agora (bypass temporal)"
                        >
                          {dispatchingIds.has(item.id) ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                              <span>Enviando...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3 h-3 text-amber-400" />
                              <span>Forçar Disparo</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            removeQueueItem(item.id);
                            toast.info("Tarefa removida da fila.");
                          }}
                          className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition"
                          title="Remover item da fila"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Coluna 3: Histórico Recente e Detalhes da Arquitetura */}
        <div className="space-y-4">
          {/* Card de Itens Concluídos e Falhas */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
              <span>Execuções Recentes ({finishedItems.length})</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </h3>

            {finishedItems.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">
                Nenhum disparo concluído nesta sessão.
              </p>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {finishedItems.slice(0, 8).map((item) => {
                  const isSuccess = item.status === "published";
                  const isFailed = item.status === "failed";

                  return (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-zinc-200 truncate" title={item.title}>
                          {item.title}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-mono shrink-0 ${
                            isSuccess
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : isFailed
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                        <span>{item.platforms.join(", ")}</span>
                        <span>{item.completedAt ? formatScheduledTime(item.completedAt) : "--:--"}</span>
                      </div>

                      {item.errorMessage && (
                        <p className="text-[10px] text-red-400 bg-red-950/30 p-1.5 rounded border border-red-900/50 mt-1">
                          {item.errorMessage}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card de Regras e Garantias de Engenharia */}
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 text-xs space-y-2.5">
            <h4 className="font-bold text-zinc-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Garantias de Engenharia do Poster
            </h4>
            <ul className="space-y-1.5 text-zinc-400 text-[11px] list-disc list-inside">
              <li>
                <strong className="text-zinc-300">FIFO Rigoroso:</strong> Posts agendados primeiro são despachados primeiro.
              </li>
              <li>
                <strong className="text-zinc-300">Anti-Thundering Herd:</strong> Jitter de ±20% evita sobrecarga síncrona nas APIs.
              </li>
              <li>
                <strong className="text-zinc-300">Zero Extensão:</strong> Comunicação 100% nativa via Cloud Workers e Webhooks oficiais.
              </li>
              <li>
                <strong className="text-zinc-300">Backoff 2s/4s/8s:</strong> Até 3 tentativas automáticas para erros 5xx/429.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal Rápido de Adicionar Tarefa */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-zinc-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                Agendar Nova Tarefa na Fila
              </h3>
              <button
                onClick={() => setIsNewTaskModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuickTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Título da Publicação / Oferta
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Artigo sobre Tendências de IA 2026"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Canal Principal
                  </label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as SocialPlatform)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="autoblog">V5 AutoBlog</option>
                    <option value="newsletter">Dual Beehiiv / Resend</option>
                    <option value="instagram">Instagram Graph</option>
                    <option value="tiktok">TikTok Video</option>
                    <option value="youtube">YouTube Data v3</option>
                    <option value="whatsapp">WhatsApp Cloud API</option>
                    <option value="telegram">Telegram Bot API</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Prioridade
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as QueueItemPriority)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="normal">Normal (Peso 2)</option>
                    <option value="high">Alta (Peso 3)</option>
                    <option value="urgent">Urgente (Peso 4)</option>
                    <option value="low">Baixa (Peso 1)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Agendar Disparo Para
                </label>
                <select
                  value={newScheduledMinutes}
                  onChange={(e) => setNewScheduledMinutes(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  <option value={1}>Daqui a 1 minuto (Teste Rápido)</option>
                  <option value={5}>Daqui a 5 minutos</option>
                  <option value={15}>Daqui a 15 minutos</option>
                  <option value={30}>Daqui a 30 minutos</option>
                  <option value={60}>Daqui a 1 hora</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition shadow-md"
                >
                  Enfileirar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
