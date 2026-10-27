/**
 * test-etapa085.ts - Teste de Validação da Etapa 085
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Validação do Simulador de Execução de Rede em Lote (batchNetworkSimulator.ts):
 * - Geração de IDs remotos por plataforma (generateRemoteMessageId)
 * - Simulação de chamadas HTTP com latência e injeção de falhas (simulatePlatformNetworkCall)
 * - Pool de promessas com controle de concorrência (executeBatchWithConcurrencyLimit)
 * - Despacho de tarefa individual com FSM e retry (executeSingleTaskDispatch)
 * - Despacho em lote com telemetria e relatório executivo (executeBatchNetworkDispatch)
 * - Integração completa com Zustand Store (usePosterStore)
 */

import {
  DEFAULT_BATCH_CONCURRENCY,
  generateRemoteMessageId,
  simulatePlatformNetworkCall,
  executeBatchWithConcurrencyLimit,
  executeSingleTaskDispatch,
  executeBatchNetworkDispatch,
  BatchExecutionReport
} from "../src/lib/queue/batchNetworkSimulator";
import { createQueueItem, filterReadyToExecute } from "../src/lib/queue/dispatchQueue";
import { QueueItem, SocialPlatform } from "../src/types/poster";
import { usePosterStore } from "../src/store/usePosterStore";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${label}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${label}`);
  }
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("TESTE ETAPA 085: SIMULADOR DE EXECUÇÃO DE REDE EM LOTE");
  console.log("=======================================================\n");

  // 1. Constante Oficial de Concorrência
  console.log("1. Validando DEFAULT_BATCH_CONCURRENCY...");
  assert(DEFAULT_BATCH_CONCURRENCY === 3, "Concorrência padrão definida em 3 workers paralelos");

  // 2. Geração de IDs Remotos por Plataforma
  console.log("\n2. Validando generateRemoteMessageId...");
  assert(generateRemoteMessageId("instagram").startsWith("ig_media_"), "Instagram gera ID com prefixo 'ig_media_'");
  assert(generateRemoteMessageId("tiktok").startsWith("tk_v_publish_"), "TikTok gera ID com prefixo 'tk_v_publish_'");
  assert(generateRemoteMessageId("youtube").startsWith("yt_data_v3_"), "YouTube gera ID com prefixo 'yt_data_v3_'");
  assert(generateRemoteMessageId("whatsapp").startsWith("wamid.HBgM"), "WhatsApp gera WAMID oficial 'wamid.HBgM'");
  assert(generateRemoteMessageId("telegram").startsWith("tg_msg_"), "Telegram gera ID com prefixo 'tg_msg_'");
  assert(generateRemoteMessageId("newsletter").startsWith("resend_email_"), "Newsletter gera ID com prefixo 'resend_email_'");
  assert(generateRemoteMessageId("autoblog").startsWith("autoblog_post_"), "AutoBlog gera ID com prefixo 'autoblog_post_'");

  // 3. Simulação de Chamada de Rede de Plataforma
  console.log("\n3. Validando simulatePlatformNetworkCall...");
  const igRes = await simulatePlatformNetworkCall("instagram", { simulatedMinLatencyMs: 10, simulatedMaxLatencyMs: 20 });
  assert(igRes.success === true, "Instagram responde com success=true");
  assert(igRes.statusCode === 200, "Instagram retorna HTTP 200 OK");
  assert(Boolean(igRes.remoteMessageId), "Instagram retorna ID remoto gerado");
  assert(igRes.latencyMs >= 10, "Latência medida maior ou igual à mínima");

  const blogRes = await simulatePlatformNetworkCall("autoblog", { simulatedMinLatencyMs: 10, simulatedMaxLatencyMs: 20 });
  assert(blogRes.statusCode === 201, "AutoBlog retorna HTTP 201 Created");

  // Simulação com falha injetada
  const failRes = await simulatePlatformNetworkCall("tiktok", {
    simulatedPlatformFailures: {
      tiktok: { statusCode: 503, errorMessage: "TikTok Upload Gateway Down" }
    }
  });
  assert(failRes.success === false, "Falha injetada reportada com success=false");
  assert(failRes.statusCode === 503, "Código de falha 503 retornado");
  assert(failRes.error === "TikTok Upload Gateway Down", "Mensagem de falha capturada");

  // 4. Pool de Concorrência Controlada
  console.log("\n4. Validando executeBatchWithConcurrencyLimit...");
  let activeConcurrency = 0;
  let maxObservedConcurrency = 0;

  const testItems = [1, 2, 3, 4, 5, 6];
  const poolResults = await executeBatchWithConcurrencyLimit(testItems, 2, async (num) => {
    activeConcurrency++;
    maxObservedConcurrency = Math.max(maxObservedConcurrency, activeConcurrency);
    await new Promise((r) => setTimeout(r, 15));
    activeConcurrency--;
    return num * 10;
  });

  assert(maxObservedConcurrency <= 2, `Concorrência respeitou o teto máximo de 2 (máximo observado: ${maxObservedConcurrency})`);
  assert(poolResults.length === 6, "Retornou 6 resultados");
  assert(poolResults[0] === 10 && poolResults[5] === 60, "Preservou o mapeamento indexado original");

  // 5. Despacho Individual de Tarefa (executeSingleTaskDispatch)
  console.log("\n5. Validando executeSingleTaskDispatch...");
  const sampleSuccessItem = createQueueItem({
    entityId: "post-success-1",
    entityType: "post",
    title: "Post Sucesso Total",
    platforms: ["autoblog", "newsletter"],
    scheduledFor: "2026-10-27T10:00:00Z"
  });

  const { result: succResult, updatedItem: succItem } = await executeSingleTaskDispatch(sampleSuccessItem, {
    simulatedMinLatencyMs: 5,
    simulatedMaxLatencyMs: 15
  });

  assert(succResult.overallSuccess === true, "Despacho individual reportou sucesso geral");
  assert(succResult.finalStatus === "published", "Status final da tarefa é 'published'");
  assert(succItem.status === "published", "Item atualizado transitou para 'published'");
  assert(Boolean(succItem.completedAt), "completedAt carimbado no item");
  assert(succResult.platformResponses.autoblog.success === true, "Plataforma AutoBlog respondeu com sucesso");
  assert(succResult.platformResponses.newsletter.success === true, "Plataforma Newsletter respondeu com sucesso");

  // Tarefa com falha recuperável 503 -> Retry
  const sampleRetryItem = createQueueItem({
    entityId: "post-retry-1",
    entityType: "post",
    title: "Post com Falha Temporária 503",
    platforms: ["instagram"],
    scheduledFor: "2026-10-27T10:00:00Z"
  });

  const { result: retResult, updatedItem: retItem } = await executeSingleTaskDispatch(sampleRetryItem, {
    simulatedPlatformFailures: {
      instagram: { statusCode: 503, errorMessage: "Meta Graph API 503 Overloaded" }
    }
  });

  assert(retResult.overallSuccess === false, "Despacho com falha reportou overallSuccess=false");
  assert(retResult.finalStatus === "queued", "Item com erro 503 foi reencaminhado para 'queued'");
  assert(retItem.status === "queued", "Item de fila atualizado está em 'queued'");
  assert(Boolean(retItem.nextAttemptAt), "nextAttemptAt carimbado para nova tentativa");
  assert(retResult.retryDecision?.action === "retry", "Decisão de retry reportada");

  // 6. Despacho em Lote de Rede (executeBatchNetworkDispatch)
  console.log("\n6. Validando executeBatchNetworkDispatch...");
  const batchQueueItems: QueueItem[] = [
    createQueueItem({ entityId: "b1", entityType: "post", title: "Lote Item 1", platforms: ["autoblog"], scheduledFor: "2026-10-27T10:00:00Z" }),
    createQueueItem({ entityId: "b2", entityType: "deal", title: "Lote Item 2", platforms: ["telegram"], scheduledFor: "2026-10-27T10:00:00Z" }),
    createQueueItem({ entityId: "b3", entityType: "deal", title: "Lote Item 3 (Falha)", platforms: ["whatsapp"], scheduledFor: "2026-10-27T10:00:00Z" })
  ];

  let completedCallbacks = 0;
  const { report, updatedQueue } = await executeBatchNetworkDispatch(batchQueueItems, {
    concurrency: 2,
    simulatedMinLatencyMs: 5,
    simulatedMaxLatencyMs: 15,
    simulatedPlatformFailures: {
      whatsapp: { statusCode: 503, errorMessage: "WhatsApp Cloud Gateway 503" }
    },
    onTaskCompleted: () => {
      completedCallbacks++;
    }
  });

  assert(report.totalTasks === 3, "Relatório totalizou 3 tarefas");
  assert(report.succeededCount === 2, "2 tarefas sucedidas");
  assert(report.retriedCount === 1, "1 tarefa encaminhada para retry");
  assert(report.failedCount === 0, "0 tarefas em falha definitiva");
  assert(report.successRatePercent === 67, "Taxa de sucesso calculada em 67%");
  assert(completedCallbacks === 3, "Callback onTaskCompleted chamado 3 vezes");
  assert(report.results.length === 3, "3 resultados individuais detalhados");
  assert(updatedQueue.length === 3, "updatedQueue possui os 3 itens atualizados");
  assert(updatedQueue[0].status === "published", "Item 1 do lote publicado");
  assert(updatedQueue[1].status === "published", "Item 2 do lote publicado");
  assert(updatedQueue[2].status === "queued", "Item 3 do lote em fila de retry");

  // 7. Integração com Zustand Store (usePosterStore)
  console.log("\n7. Validando Integração no Zustand Store (usePosterStore)...");
  const store = usePosterStore.getState();

  // Adiciona itens de teste na fila do store
  const storeItem1 = createQueueItem({ entityId: "store-b1", entityType: "post", title: "Store Batch 1", platforms: ["autoblog"], scheduledFor: "2026-10-27T08:00:00Z" });
  const storeItem2 = createQueueItem({ entityId: "store-b2", entityType: "deal", title: "Store Batch 2", platforms: ["telegram"], scheduledFor: "2026-10-27T08:00:00Z" });

  store.enqueueBatchQueue([storeItem1, storeItem2]);
  const readyItems = filterReadyToExecute(usePosterStore.getState().dispatchQueue, "2026-10-27T12:00:00Z")
    .filter(i => i.id === storeItem1.id || i.id === storeItem2.id);

  assert(readyItems.length === 2, "Filtro detectou os 2 itens de teste prontos para disparo");

  // Executa o despacho em lote
  const batchExecution = await executeBatchNetworkDispatch(readyItems, {
    simulatedMinLatencyMs: 5,
    simulatedMaxLatencyMs: 15
  });

  // Atualiza os itens no Zustand store de forma atômica
  store.syncQueueItems(batchExecution.updatedQueue);

  const stateAfterBatch = usePosterStore.getState();
  const found1 = stateAfterBatch.dispatchQueue.find(i => i.id === storeItem1.id);
  const found2 = stateAfterBatch.dispatchQueue.find(i => i.id === storeItem2.id);
  assert(found1?.status === "published", "Zustand store registrou publicação do item 1");
  assert(found2?.status === "published", "Zustand store registrou publicação do item 2");

  // Limpeza
  store.removeQueueItem(storeItem1.id);
  store.removeQueueItem(storeItem2.id);

  console.log("\n=======================================================");
  console.log(`TOTAL DE ASSERÇÕES: ${passed + failed}`);
  console.log(`PASSOU: ${passed}`);
  console.log(`FALHOU: ${failed}`);
  console.log("=======================================================\n");

  if (failed === 0) {
    console.log("✅ TODOS OS TESTES DA ETAPA 085 FORAM APROVADOS COM SUCESSO!");
    process.exit(0);
  } else {
    console.error("❌ FALHA NOS TESTES DA ETAPA 085.");
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Erro fatal na execução dos testes:", err);
  process.exit(1);
});
