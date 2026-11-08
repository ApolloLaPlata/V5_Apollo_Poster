/**
 * test-etapa107.ts - Homologação da Integração com a Frota Colab T4 via V5 Apollo API
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Em conformidade com a 👑 [DIRETRIZ GERAL DA COLMEIA] (Pulse #229)
 * 1. Cliente de Despacho para a Frota de GPUs Colab T4 (v5GpuClusterClient.ts)
 * 2. Registro do Gateway da V5 Apollo API no Motor de Transmissão (crossCapitaniaEngine.ts)
 */

import { dispatchGpuRenderJob, COLAB_GPU_SLOTS } from "../src/lib/api/v5GpuClusterClient";
import { CAPITANIAS_REGISTRY, executeCrossCapitaniaBroadcast } from "../src/lib/dispatch/crossCapitaniaEngine";
import { generateVideoStoryboard } from "../src/lib/social/videoStoryboardEngine";

console.log("================================================================================");
console.log("   TESTE DE HOMOLOGAÇÃO ETAPA 107 - CAPITANIA #13: V5 APOLLO POSTER (:3011)     ");
console.log("================================================================================\n");

let passed = 0;
let failed = 0;

function assert(desc: string, condition: boolean) {
  if (condition) {
    console.log(`✅ [PASS] ${desc}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${desc}`);
    failed++;
  }
}

async function runTests() {
  // --------------------------------------------------------------------------------
  // BLOCO 1: Catálogo e Despacho para a Frota de GPUs Colab T4
  // --------------------------------------------------------------------------------
  console.log("--- BLOCO 1: Cliente da Frota Colab T4 (v5GpuClusterClient) ---");

  assert("Catálogo possui slots de GPU T4 cadastrados", COLAB_GPU_SLOTS.length >= 5);
  assert("Slot 04 (descarganews - Notícias & Lip Sync 9:16) presente", COLAB_GPU_SLOTS.some(s => s.slot === "Slot 04"));
  assert("Slot 14 (syntheticraveradio - Live EDM & NVENC) presente", COLAB_GPU_SLOTS.some(s => s.slot === "Slot 14"));

  const storyboard = generateVideoStoryboard("Inteligência Artificial e Automação 2026", "LINK", 15);
  assert("Storyboard gerado com 4 cenas (3 Atos)", storyboard.scenes.length === 4);

  const renderJobResponse = await dispatchGpuRenderJob({
    jobType: "video_storyboard",
    priority: "high",
    payload: {
      storyboard,
      topic: storyboard.topic,
      durationSec: 15,
      targetPlatform: "instagram_reels"
    },
    metadata: {
      capitania: "V5 Apollo Poster (:3011)",
      port: 3011,
      requestedSlot: "Slot 04 (descarganews - T4 16GB)"
    }
  });

  assert("Despacho para V5 Apollo API bem-sucedido", renderJobResponse.success);
  assert("Job ID gerado no padrão oficial", renderJobResponse.jobId.startsWith("job_"));
  assert("Cluster alocado no Warm Tier gratuito (Colab_T4_WarmTier)", renderJobResponse.cluster === "Colab_T4_WarmTier");
  assert("Slot atribuído corresponde ao pool homologado", renderJobResponse.assignedSlot.includes("Slot 04"));
  assert("URL de output de vídeo gerada no bucket seguro", renderJobResponse.outputVideoUrl?.endsWith(".mp4") === true);

  // --------------------------------------------------------------------------------
  // BLOCO 2: Registro do Gateway V5 Apollo API no Motor de Transmissão
  // --------------------------------------------------------------------------------
  console.log("\n--- BLOCO 2: Registro do Gateway V5 Apollo API no Motor Onicanal ---");

  assert("Capitania #2 (apolloApi) registrada em CAPITANIAS_REGISTRY", !!CAPITANIAS_REGISTRY.apolloApi);
  assert("Endpoint da apolloApi aponta para https://api.v5apollo.com/v1/gpu/dispatch", CAPITANIAS_REGISTRY.apolloApi.endpoint === "https://api.v5apollo.com/v1/gpu/dispatch");
  assert("Capitania #2 identificada como porta :3000", CAPITANIAS_REGISTRY.apolloApi.port === 3000);

  // Transmissão de teste incluindo apolloApi
  const broadcastReport = await executeCrossCapitaniaBroadcast(
    {
      title: "Alinhamento Geral com a Frota Colab T4",
      content: "Despacho automatizado de conteúdo via V5 Apollo API Gateway",
      mediaType: "video"
    },
    ["apolloApi", "autoblog", "studio"]
  );

  assert("Transmissão multi-alvo com apolloApi executada com sucesso", broadcastReport.successfulCount === 3);
  const apolloDelivery = broadcastReport.deliveries.find(d => d.targetId === "apolloApi");
  assert("Entrega para apolloApi confirmada com status 202 (Accepted)", apolloDelivery?.statusCode === 202);

  // --------------------------------------------------------------------------------
  // RESUMO FINAL
  // --------------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`TOTAL DE TESTES EXECUTADOS: ${passed + failed}`);
  console.log(`APROVADOS: ${passed}`);
  console.log(`FALHAS: ${failed}`);
  console.log("================================================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("🎉 TODOS OS TESTES DA ETAPA 107 PASSARAM COM SUCESSO!\n");
    process.exit(0);
  }
}

runTests();
