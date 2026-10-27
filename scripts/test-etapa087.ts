/**
 * test-etapa087.ts - Teste de Homologação da Etapa 087
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Validação do Disparo Forçado Manual ("Executar Agora"):
 * 1. Disparo manual forçado individual com bypass temporal (scheduledFor futuro -> envio imediato)
 * 2. Transição correta de status no Zustand e carimbos de auditoria
 * 3. Criação de logs de auditoria com action "manual_forced_dispatch"
 * 4. Tratamento de falhas recuperáveis com decisão de retry e backoff
 * 5. Disparo forçado manual em lote com pool de concorrência
 * 6. Disparo forçado de todos os itens pendentes sem parâmetros explícitos
 * 7. Tratamento de erro para ID inexistente e lote vazio
 */

import { usePosterStore } from "../src/store/usePosterStore";
import {
  executeManualForcedDispatch,
  executeBatchManualForcedDispatch
} from "../src/lib/queue/manualDispatchHandler";
import { QueueItem } from "../src/types/poster";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${msg}`);
  } else {
    failed++;
    console.error(`  ❌ [FAIL] ${msg}`);
  }
}

async function runTests() {
  console.log("\n========================================================");
  console.log("🚀 INICIANDO TESTES DA ETAPA 087: DISPARO FORÇADO MANUAL");
  console.log("========================================================\n");

  const store = usePosterStore.getState();

  // 1. Limpeza inicial do store
  store.clearCompletedQueue();

  console.log("📋 1. Teste de Disparo Forçado Individual com Bypass Temporal");
  const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h no futuro
  const testItem1: QueueItem = {
    id: "queue_test_manual_1",
    entityId: "post_test_1",
    entityType: "post",
    title: "Post Futuro - Disparo Imediato",
    platforms: ["autoblog", "instagram"],
    scheduledFor: futureDate,
    priority: "urgent",
    status: "scheduled",
    attempts: 0,
    maxAttempts: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.enqueueQueueItem(testItem1);

  const initialItem = usePosterStore.getState().dispatchQueue.find((i) => i.id === testItem1.id);
  assert(initialItem?.status === "scheduled", "Item 1 inserido com status inicial 'scheduled'");
  assert(initialItem?.scheduledFor === futureDate, "Item 1 tem data de agendamento 24h no futuro");

  const singleResult = await executeManualForcedDispatch(testItem1.id, {
    simulatedMinLatencyMs: 1,
    simulatedMaxLatencyMs: 5
  });

  assert(singleResult.success === true, "Disparo forçado manual retornou sucesso: true");
  assert(singleResult.dispatchResult.finalStatus === "published", "Resultado de despacho final é 'published'");
  assert(singleResult.item.status === "published", "Item retornado foi atualizado para 'published'");
  assert(Boolean(singleResult.item.completedAt), "Item possui carimbo completedAt preenchido");

  // Verifica persistência no store
  const storeItem1 = usePosterStore.getState().dispatchQueue.find((i) => i.id === testItem1.id);
  assert(storeItem1?.status === "published", "Item 1 no Zustand Store foi atualizado para 'published'");
  assert(Boolean(storeItem1?.completedAt), "Item 1 no Zustand Store possui completedAt gravado");

  // Verifica log de auditoria
  const logs = usePosterStore.getState().logs;
  const dispatchLog = logs.find(
    (l) => l.action === ("manual_forced_dispatch" as any) && l.message.includes(testItem1.title)
  );
  assert(Boolean(dispatchLog), "Entrada de log com action 'manual_forced_dispatch' gravada no store");
  assert(dispatchLog?.status === "success", "Log de auditoria registrado como 'success'");
  assert(dispatchLog?.statusCode === 200, "Log de auditoria registrado com statusCode 200");

  console.log("\n📋 2. Teste de Disparo Forçado com Falha Simulada (Erro 503) e Decisão de Retry");
  const testItem2: QueueItem = {
    id: "queue_test_manual_fail",
    entityId: "post_test_fail",
    entityType: "post",
    title: "Post com Falha de Gateway",
    platforms: ["tiktok"],
    scheduledFor: futureDate,
    priority: "high",
    status: "scheduled",
    attempts: 0,
    maxAttempts: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.enqueueQueueItem(testItem2);

  const failResult = await executeManualForcedDispatch(testItem2.id, {
    simulatedMinLatencyMs: 1,
    simulatedMaxLatencyMs: 5,
    simulatedPlatformFailures: {
      tiktok: {
        statusCode: 503,
        errorMessage: "TikTok Gateway Timeout 503"
      }
    }
  });

  assert(failResult.success === false, "Disparo com falha retornou success: false");
  assert(failResult.dispatchResult.finalStatus === "queued", "Status resultante é 'queued' (aguardando retry)");
  assert(failResult.dispatchResult.retryDecision?.action === "retry", "Decisão de retry foi 'retry'");
  assert(failResult.item.attempts === 1, "Tentativas incrementadas para 1");
  assert(Boolean(failResult.item.nextAttemptAt), "Próximo horário de tentativa (nextAttemptAt) agendado");

  const storeItem2 = usePosterStore.getState().dispatchQueue.find((i) => i.id === testItem2.id);
  assert(storeItem2?.status === "queued", "Item 2 no Zustand está 'queued'");
  assert(storeItem2?.attempts === 1, "Item 2 no Zustand registrou 1 tentativa");

  const failLog = usePosterStore.getState().logs.find(
    (l) => l.action === ("manual_forced_dispatch" as any) && l.message.includes(testItem2.title)
  );
  assert(Boolean(failLog), "Log de auditoria de falha registrado");
  assert(failLog?.status === "failed", "Log de auditoria registrado como 'failed'");

  console.log("\n📋 3. Teste de Disparo Forçado em Lote de Tarefas Selecionadas");
  const batchItems: QueueItem[] = [
    {
      id: "queue_batch_1",
      entityId: "post_b1",
      entityType: "post",
      title: "Batch Post Alpha",
      platforms: ["autoblog"],
      scheduledFor: futureDate,
      priority: "normal",
      status: "scheduled",
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "queue_batch_2",
      entityId: "deal_b2",
      entityType: "deal",
      title: "Oferta VIP Smartphone",
      platforms: ["telegram", "whatsapp"],
      scheduledFor: futureDate,
      priority: "urgent",
      status: "scheduled",
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "queue_batch_3",
      entityId: "post_b3",
      entityType: "post",
      title: "Batch Post Beta",
      platforms: ["instagram"],
      scheduledFor: futureDate,
      priority: "high",
      status: "scheduled",
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  batchItems.forEach((item) => store.enqueueQueueItem(item));

  const batchIds = batchItems.map((b) => b.id);
  const batchResult = await executeBatchManualForcedDispatch(batchIds, {
    simulatedMinLatencyMs: 1,
    simulatedMaxLatencyMs: 5,
    concurrency: 3
  });

  assert(batchResult.success === true, "Disparo em lote retornou success: true");
  assert(batchResult.report.totalTasks === 3, "Relatório do lote computou 3 tarefas");
  assert(batchResult.report.succeededCount === 3, "3 tarefas concluídas com sucesso");
  assert(batchResult.report.failedCount === 0, "Zero falhas no lote");
  assert(batchResult.report.successRatePercent === 100, "Taxa de sucesso do lote foi de 100%");

  // Verifica que todos os itens no store foram atualizados para published
  const currentQueue = usePosterStore.getState().dispatchQueue;
  batchIds.forEach((id) => {
    const item = currentQueue.find((i) => i.id === id);
    assert(item?.status === "published", `Item de lote '${id}' atualizado para 'published' no store`);
  });

  // Verifica logs de lote
  const batchLogs = usePosterStore.getState().logs.filter(
    (l) => l.action === ("manual_forced_batch_dispatch" as any)
  );
  assert(batchLogs.length >= 3, `Registrados pelo menos 3 logs com action 'manual_forced_batch_dispatch' (encontrados: ${batchLogs.length})`);

  console.log("\n📋 4. Teste de Disparo de Todos os Itens Elegíveis Pendentes sem passar IDs");
  const unassignedItem: QueueItem = {
    id: "queue_unassigned_pending",
    entityId: "post_pending_auto",
    entityType: "post",
    title: "Post Pendente Genérico",
    platforms: ["youtube"],
    scheduledFor: futureDate,
    priority: "normal",
    status: "scheduled",
    attempts: 0,
    maxAttempts: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  store.enqueueQueueItem(unassignedItem);

  const allPendingResult = await executeBatchManualForcedDispatch(undefined, {
    simulatedMinLatencyMs: 1,
    simulatedMaxLatencyMs: 5
  });

  assert(allPendingResult.success === true, "Disparo de todos os pendentes retornou sucesso");
  const foundPending = allPendingResult.report.results.find((r) => r.itemId === unassignedItem.id);
  assert(Boolean(foundPending), "Item unassigned foi capturado e executado no lote automático");
  assert(foundPending?.finalStatus === "published", "Item unassigned finalizou como 'published'");

  console.log("\n📋 5. Teste de Resiliência: ID Inexistente e Lote Vazio");
  let errorCaught = false;
  try {
    await executeManualForcedDispatch("id_que_nao_existe_na_fila");
  } catch (err: any) {
    errorCaught = true;
    assert(err.message.includes("não encontrada"), "Lançou erro esperado ao tentar disparar ID inexistente");
  }
  assert(errorCaught, "Exceção capturada com sucesso para ID inexistente");

  const emptyBatchResult = await executeBatchManualForcedDispatch(["id_fantasma_1", "id_fantasma_2"]);
  assert(emptyBatchResult.success === true, "Lote vazio retorna success: true sem lançar erro");
  assert(emptyBatchResult.report.totalTasks === 0, "Relatório de lote vazio possui totalTasks: 0");

  console.log("\n========================================================");
  console.log(`📊 RESULTADO FINAL DOS TESTES: ${passed} PASSOU | ${failed} FALHOU`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("❌ ERRO FATAL AO EXECUTAR TESTES:", err);
  process.exit(1);
});
