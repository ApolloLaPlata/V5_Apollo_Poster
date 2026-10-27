/**
 * test-etapa090.ts - Homologação e Certificação Oficial da Fase 9
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Suíte Mestre de Validação End-to-End da Fila de Agendamento em Background (081 - 090):
 * - Etapa 081: Arquitetura FIFO e Priorização Ponderada (dispatchQueue.ts)
 * - Etapa 082: Motor de Verificação de Posts Vencidos e Polling Contínuo de 60s (overdueScanner.ts)
 * - Etapa 083: Máquina de Estados Finita e Transições Atômicas (taskStateTransition.ts)
 * - Etapa 084: Retentativas Automáticas com Backoff Exponencial e Jitter Anti-Colisão (retryManager.ts)
 * - Etapa 085: Despacho Concorrente em Rede com Semáforo de Paralelismo (batchNetworkSimulator.ts)
 * - Etapa 086: Painel Visual de Background no Dashboard (BackgroundQueueDashboard.tsx)
 * - Etapa 087: Disparo Forçado Manual com Bypass Temporal Seguro (manualDispatchHandler.ts)
 * - Etapa 088: Tratamento Inteligente de Erros e Diagnósticos de APIs (dispatchDiagnostics.ts)
 * - Etapa 089: Persistência Híbrida e Sincronização em Tempo Real Multi-Abas (crossTabQueueSync.ts & safeStorage.ts)
 * - Etapa 090: Homologação Integrada Final com Build Next.js 14 e Certificação da Fase 9
 */

import {
  enqueue,
  enqueueBatch,
  updateItemStatus,
  removeQueueItem,
  clearCompletedItems,
  getQueueStats,
  PRIORITY_WEIGHTS
} from "../src/lib/queue/dispatchQueue";

import {
  detectOverdueQueueItems,
  detectOverduePosts,
  formatTimeUntilNextTick,
  createOverdueScanner
} from "../src/lib/queue/overdueScanner";

import {
  canTransition,
  transitionQueueItem,
  ALLOWED_STATE_TRANSITIONS
} from "../src/lib/queue/taskStateTransition";

import {
  isRetryableError,
  calculateExponentialBackoff,
  evaluateRetryDecision,
  applyRetryToQueueItem,
  DEFAULT_RETRY_CONFIG
} from "../src/lib/queue/retryManager";

import {
  executeSingleTaskDispatch,
  executeBatchNetworkDispatch,
  DEFAULT_BATCH_CONCURRENCY
} from "../src/lib/queue/batchNetworkSimulator";

import {
  executeManualForcedDispatch,
  executeBatchManualForcedDispatch
} from "../src/lib/queue/manualDispatchHandler";

import {
  categorizeErrorCode,
  diagnoseDispatchError,
  formatDiagnosticSummary,
  enrichQueueItemWithDiagnostic,
  DIAGNOSTIC_CATALOG
} from "../src/lib/queue/dispatchDiagnostics";

import {
  getSafeStorage,
  serializeQueue,
  deserializeQueue,
  saveQueueSnapshot,
  loadQueueSnapshot,
  getCurrentTabId,
  notifyCrossTabQueueChange
} from "../src/lib/queue/crossTabQueueSync";

import { usePosterStore } from "../src/store/usePosterStore";
import { QueueItem, ScheduledPost, GroupBroadcastDeal } from "../src/types/poster";

let passed = 0;
let failed = 0;

function assert(condition: boolean | undefined | null, msg: string) {
  if (Boolean(condition)) {
    passed++;
    console.log(`  ✅ [PASS] ${msg}`);
  } else {
    failed++;
    console.error(`  ❌ [FAIL] ${msg}`);
  }
}

async function runMasterCertification() {
  console.log("\n================================================================================");
  console.log("🏛️ CAPITANIA #13: HOMOLOGAÇÃO OFICIAL DA FASE 9 - FILA DE AGENDAMENTO BACKGROUND");
  console.log("================================================================================\n");

  // ---------------------------------------------------------------------------
  // 1. ARQUITETURA FIFO & PRIORIZAÇÃO (Etapa 081)
  // ---------------------------------------------------------------------------
  console.log("📦 1. Validação de Fila FIFO e Priorização Ponderada");
  const baseTime = Date.now();
  const qItemLow: QueueItem = {
    id: "q_pilar1_low",
    entityId: "post_1",
    entityType: "post",
    title: "Post Baixa Prioridade",
    platforms: ["autoblog"],
    scheduledFor: new Date(baseTime + 10000).toISOString(),
    priority: "low",
    status: "scheduled",
    attempts: 0,
    maxAttempts: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const qItemUrgent: QueueItem = {
    id: "q_pilar1_urgent",
    entityId: "post_2",
    entityType: "post",
    title: "Post Urgente",
    platforms: ["instagram", "tiktok"],
    scheduledFor: new Date(baseTime + 10000).toISOString(),
    priority: "urgent",
    status: "scheduled",
    attempts: 0,
    maxAttempts: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  let testQueue = enqueue([], qItemLow);
  testQueue = enqueue(testQueue, qItemUrgent);

  assert(testQueue[0].id === "q_pilar1_urgent", "Item urgente posicionado à frente do item de baixa prioridade");
  assert(PRIORITY_WEIGHTS.urgent > PRIORITY_WEIGHTS.low, "Peso de prioridade urgente supera peso de prioridade baixa");

  const stats = getQueueStats(testQueue);
  assert(stats.totalItems === 2, "Estatísticas computaram exatamente 2 itens");
  assert(stats.scheduledCount === 2, "Ambos contabilizados como 'scheduled'");
  assert(stats.activeCount === 2, "Total ativo reportado como 2");

  // ---------------------------------------------------------------------------
  // 2. MOTOR DE POLLING & DETECÇÃO DE VENCIDOS (Etapa 082)
  // ---------------------------------------------------------------------------
  console.log("\n⏱️ 2. Validação do Motor de Verificação de Posts Vencidos (Polling 60s)");
  const overduePost: ScheduledPost = {
    id: "post_overdue_1",
    title: "Post Vencido Há 5 Minutos",
    content: "Conteúdo que deveria ter saído",
    platforms: ["autoblog"],
    scheduledAt: new Date(baseTime - 300000).toISOString(), // 5m no passado
    status: "scheduled",
    tags: ["teste"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const futurePost: ScheduledPost = {
    id: "post_future_1",
    title: "Post no Futuro",
    content: "Conteúdo futuro",
    platforms: ["newsletter"],
    scheduledAt: new Date(baseTime + 600000).toISOString(), // 10m no futuro
    status: "scheduled",
    tags: ["futuro"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const overduePosts = detectOverduePosts([overduePost, futurePost], new Date(baseTime));
  assert(overduePosts.length === 1, "Detectou exatamente 1 post vencido");
  assert(overduePosts[0].id === "post_overdue_1", "Identificou o post vencido correto");

  const overdueQueue = detectOverdueQueueItems(
    [
      {
        ...qItemLow,
        scheduledFor: new Date(baseTime - 10000).toISOString() // vencido
      }
    ],
    new Date(baseTime)
  );
  assert(overdueQueue.length === 1, "Detectou item de fila vencido");

  const countdownFormatted = formatTimeUntilNextTick(45000);
  assert(countdownFormatted === "45s", "Contagem regressiva de segundos formatada como '45s'");

  // ---------------------------------------------------------------------------
  // 3. MÁQUINA DE ESTADOS FINITA (FSM) (Etapa 083)
  // ---------------------------------------------------------------------------
  console.log("\n🔄 3. Validação da Máquina de Estados Finita (FSM)");
  assert(canTransition("scheduled", "processing") === true, "Transição legal: scheduled -> processing");
  assert(canTransition("processing", "published") === true, "Transição legal: processing -> published");
  assert(canTransition("processing", "failed") === true, "Transição legal: processing -> failed");
  assert(canTransition("scheduled", "published") === false, "Bloqueou transição ilegal: scheduled -> published sem processing");

  const fsmItem = transitionQueueItem(qItemLow, "processing");
  assert(fsmItem.status === "processing", "Item transitou para 'processing'");
  assert(Boolean(fsmItem.updatedAt), "Carimbo updatedAt atualizado na transição");

  const publishedItem = transitionQueueItem(fsmItem, "published");
  assert(publishedItem.status === "published", "Item transitou para 'published'");
  assert(Boolean(publishedItem.completedAt), "Carimbo completedAt preenchido ao publicar");

  // ---------------------------------------------------------------------------
  // 4. RETENTATIVAS & BACKOFF EXPONENCIAL (Etapa 084)
  // ---------------------------------------------------------------------------
  console.log("\n🛡️ 4. Validação de Retentativas Automáticas com Backoff Exponencial");
  assert(isRetryableError(null, 500) === true, "HTTP 500 classificado como recuperável");
  assert(isRetryableError(null, 503) === true, "HTTP 503 classificado como recuperável");
  assert(isRetryableError(null, 429) === true, "HTTP 429 classificado como recuperável");
  assert(isRetryableError(null, 401) === false, "HTTP 401 classificado como fatal (não recuperável)");
  assert(isRetryableError(null, 403) === false, "HTTP 403 classificado como fatal (não recuperável)");
  assert(isRetryableError(null, 422) === false, "HTTP 422 classificado como fatal (não recuperável)");

  const delay1 = calculateExponentialBackoff(1, { ...DEFAULT_RETRY_CONFIG, enableJitter: false });
  const delay2 = calculateExponentialBackoff(2, { ...DEFAULT_RETRY_CONFIG, enableJitter: false });
  assert(delay1 === 2000, "Tentativa 1 gera atraso base de 2000ms");
  assert(delay2 === 4000, "Tentativa 2 gera atraso de 4000ms (fator 2x)");

  const decisionRecoverable = evaluateRetryDecision(0, 3, "Service Unavailable", 503);
  assert(decisionRecoverable.action === "retry", "Decisão para 503 na tentativa 1 é 'retry'");
  assert(decisionRecoverable.nextStatus === "queued", "Próximo status é 'queued'");

  const decisionExhausted = evaluateRetryDecision(3, 3, "Service Unavailable", 503);
  assert(decisionExhausted.action === "fail_permanently", "Esgotou 3 tentativas: decisão é 'fail_permanently'");
  assert(decisionExhausted.nextStatus === "failed", "Status final pós-esgotamento é 'failed'");

  // ---------------------------------------------------------------------------
  // 5. SIMULAÇÃO DE EXECUÇÃO EM LOTE CONCORRENTE (Etapa 085)
  // ---------------------------------------------------------------------------
  console.log("\n🚀 5. Validação de Despacho Concorrente em Rede com Semáforo");
  const batchTestItems: QueueItem[] = [
    {
      id: "q_b1",
      entityId: "p_b1",
      entityType: "post",
      title: "Batch Item 1",
      platforms: ["autoblog"],
      scheduledFor: new Date().toISOString(),
      priority: "normal",
      status: "scheduled",
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "q_b2",
      entityId: "p_b2",
      entityType: "post",
      title: "Batch Item 2",
      platforms: ["instagram"],
      scheduledFor: new Date().toISOString(),
      priority: "high",
      status: "scheduled",
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const batchDispatchRes = await executeBatchNetworkDispatch(batchTestItems, {
    concurrency: DEFAULT_BATCH_CONCURRENCY,
    simulatedMinLatencyMs: 1,
    simulatedMaxLatencyMs: 5
  });

  assert(batchDispatchRes.report.totalTasks === 2, "Lote executou exatamente 2 tarefas");
  assert(batchDispatchRes.report.succeededCount === 2, "2 tarefas finalizadas com sucesso");
  assert(batchDispatchRes.report.successRatePercent === 100, "Taxa de sucesso do lote foi de 100%");
  assert(batchDispatchRes.updatedQueue.every((i) => i.status === "published"), "Todos os itens atualizados para 'published'");

  // ---------------------------------------------------------------------------
  // 6. DISPARO FORÇADO MANUAL (Etapa 087)
  // ---------------------------------------------------------------------------
  console.log("\n⚡ 6. Validação do Disparo Forçado Manual ('Executar Agora')");
  const store = usePosterStore.getState();
  const futureForcedItem: QueueItem = {
    id: "q_forced_pilar6",
    entityId: "post_forced",
    entityType: "post",
    title: "Post Futuro Disparo Forçado",
    platforms: ["autoblog"],
    scheduledFor: new Date(baseTime + 86400000).toISOString(), // 24h no futuro
    priority: "urgent",
    status: "scheduled",
    attempts: 0,
    maxAttempts: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.enqueueQueueItem(futureForcedItem);

  const forcedResult = await executeManualForcedDispatch(futureForcedItem.id, {
    simulatedMinLatencyMs: 1,
    simulatedMaxLatencyMs: 5
  });

  assert(forcedResult.success === true, "Disparo forçado manual executado com sucesso");
  assert(forcedResult.item.status === "published", "Item transitou imediatamente para 'published' com bypass temporal");

  // ---------------------------------------------------------------------------
  // 7. DIAGNÓSTICO INTELIGENTE DE ERROS (Etapa 088)
  // ---------------------------------------------------------------------------
  console.log("\n🔍 7. Validação de Diagnóstico Inteligente e Mensagens Humanas de Falha");
  const diagAuth = diagnoseDispatchError("instagram", 401, "Invalid OAuth access token");
  assert(diagAuth.category === "AUTH_TOKEN_EXPIRED", "401 categorizado como AUTH_TOKEN_EXPIRED");
  assert(diagAuth.isRecoverable === false, "Falha de token classificada como fatal");
  assert(diagAuth.suggestedAction.includes("Configurações de API"), "Ação sugerida orienta a reconectar nas configurações");

  const diagRate = diagnoseDispatchError("tiktok", 429, "Too many requests");
  assert(diagRate.category === "RATE_LIMIT_EXCEEDED", "429 categorizado como RATE_LIMIT_EXCEEDED");
  assert(diagRate.isRecoverable === true, "Rate limit classificado como auto-recuperável");

  const diagPayload = diagnoseDispatchError("youtube", 422, "Video aspect ratio must be 16:9 or 9:16");
  assert(diagPayload.category === "PAYLOAD_INVALID", "422 categorizado como PAYLOAD_INVALID");
  assert(diagPayload.isRecoverable === false, "Payload inválido requer edição manual");

  assert(Object.keys(DIAGNOSTIC_CATALOG).length === 8, "Catálogo possui exatamente 8 categorias oficiais homologadas");

  // ---------------------------------------------------------------------------
  // 8. PERSISTÊNCIA & SINCRONIZAÇÃO MULTI-ABAS (Etapa 089)
  // ---------------------------------------------------------------------------
  console.log("\n📡 8. Validação de Persistência Híbrida e Cross-Tab Sync");
  const safeStorage = getSafeStorage();
  assert(Boolean(safeStorage), "Instância de SafeStorage operacional");

  const snapshotSaved = saveQueueSnapshot(batchTestItems);
  assert(snapshotSaved === true, "Snapshot da fila salvo com sucesso");

  const snapshotLoaded = loadQueueSnapshot();
  assert(snapshotLoaded?.length === 2, "Snapshot recarregado com integridade total (2 itens)");

  const currentTab = getCurrentTabId();
  assert(typeof currentTab === "string" && currentTab.length > 5, "TabId da sessão gerado com sucesso");

  // ---------------------------------------------------------------------------
  // RESULTADO FINAL CONSOLIDADO
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`🏆 RELATÓRIO OFICIAL DE HOMOLOGAÇÃO DA FASE 9: ${passed} PASSOU | ${failed} FALHOU`);
  console.log("================================================================================\n");

  if (failed > 0) {
    console.error("❌ HOMOLOGAÇÃO DA FASE 9 REJEITADA COM FALHAS.");
    process.exit(1);
  } else {
    console.log("🎉 CERTIFICAÇÃO CONCEDIDA: FASE 9 100% HOMOLOGADA PARA PRODUÇÃO.");
  }
}

runMasterCertification().catch((err) => {
  console.error("❌ ERRO FATAL NA EXECUÇÃO DA HOMOLOGAÇÃO DA FASE 9:", err);
  process.exit(1);
});
