/**
 * test-etapa091.ts - Teste de Homologação da Etapa 091
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Validação do Painel Executivo de Telemetria de Despacho:
 * 1. Formatação de números compactos (formatCompactNumber) e percentuais (formatPercentage)
 * 2. Cálculo dos 4 KPIs Executivos:
 *    - Total Disparados Onicanal
 *    - Taxa de Sucesso (%)
 *    - DMs & Leads Enviadas
 *    - Alcance Estimado Global
 * 3. Cálculo de itens pendentes em fila e falhas registradas
 * 4. Cálculo da latência média de rede ponderada por logs
 * 5. Consistência e integridade da telemetria com os dados reais do Zustand Store
 */

import {
  calculateExecutiveTelemetry,
  formatCompactNumber,
  formatPercentage
} from "../src/lib/analytics/executiveTelemetry";
import { usePosterStore } from "../src/store/usePosterStore";
import {
  ScheduledPost,
  GroupBroadcastDeal,
  CommentRule,
  QueueItem,
  DispatchLogEntry
} from "../src/types/poster";

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

async function runTests() {
  console.log("\n========================================================");
  console.log("🚀 INICIANDO TESTES DA ETAPA 091: TELEMETRIA EXECUTIVA");
  console.log("========================================================\n");

  console.log("📋 1. Teste de Formatadores Utilitários de Métricas");
  assert(formatCompactNumber(0) === "0", "0 formatado como '0'");
  assert(formatCompactNumber(450) === "450", "450 formatado como '450'");
  assert(formatCompactNumber(1000) === "1K", "1000 formatado como '1K'");
  assert(formatCompactNumber(2450) === "2,5K", "2450 formatado como '2,5K'");
  assert(formatCompactNumber(50000) === "50K", "50000 formatado como '50K'");
  assert(formatCompactNumber(1200000) === "1,2M", "1200000 formatado como '1,2M'");
  assert(formatCompactNumber(NaN) === "0", "NaN formatado com segurança como '0'");

  assert(formatPercentage(0) === "0%", "0 formatado como '0%'");
  assert(formatPercentage(100) === "100%", "100 formatado como '100%'");
  assert(formatPercentage(98.4) === "98,4%", "98.4 formatado como '98,4%'");

  console.log("\n📋 2. Teste de Cálculo Sintético dos 4 KPIs Estratégicos");
  const mockPosts: ScheduledPost[] = [
    {
      id: "p1",
      title: "Post Publicado 1",
      content: "",
      platforms: ["autoblog"],
      scheduledAt: new Date().toISOString(),
      status: "published",
      tags: [],
      createdAt: "",
      updatedAt: ""
    },
    {
      id: "p2",
      title: "Post Publicado 2",
      content: "",
      platforms: ["instagram"],
      scheduledAt: new Date().toISOString(),
      status: "published",
      tags: [],
      createdAt: "",
      updatedAt: ""
    },
    {
      id: "p3",
      title: "Post Agendado",
      content: "",
      platforms: ["tiktok"],
      scheduledAt: new Date().toISOString(),
      status: "scheduled",
      tags: [],
      createdAt: "",
      updatedAt: ""
    },
    {
      id: "p4",
      title: "Post com Falha",
      content: "",
      platforms: ["youtube"],
      scheduledAt: new Date().toISOString(),
      status: "failed",
      tags: [],
      createdAt: "",
      updatedAt: ""
    }
  ];

  const mockDeals: GroupBroadcastDeal[] = [
    {
      id: "d1",
      productName: "Oferta VIP 1",
      store: "Amazon",
      originalPrice: 100,
      promoPrice: 50,
      discountPercentage: 50,
      affiliateUrl: "https://v5p.st/1",
      status: "sent",
      targetChannels: ["telegram", "whatsapp"],
      scheduledTime: "2026-10-27T10:00:00Z"
    },
    {
      id: "d2",
      productName: "Oferta Pendente",
      store: "Shopee",
      originalPrice: 200,
      promoPrice: 100,
      discountPercentage: 50,
      affiliateUrl: "https://v5p.st/2",
      status: "pending",
      targetChannels: ["telegram"],
      scheduledTime: "2026-10-27T12:00:00Z"
    }
  ];

  const mockCommentRules: CommentRule[] = [
    {
      id: "r1",
      name: "Regra Reels 1",
      platform: "instagram",
      targetPostId: "post_1",
      keywords: ["EU QUERO"],
      publicReplyVariants: ["Enviado!"],
      dmMessageTemplate: "Olá!",
      ctaUrl: "https://v5p.st/dm1",
      isActive: true,
      totalTriggered: 150
    },
    {
      id: "r2",
      name: "Regra TikTok 2",
      platform: "tiktok",
      targetPostId: "post_2",
      keywords: ["LINK"],
      publicReplyVariants: ["Link na bio!"],
      dmMessageTemplate: "Link: ",
      ctaUrl: "https://v5p.st/dm2",
      isActive: true,
      totalTriggered: 50
    }
  ];

  const mockQueue: QueueItem[] = [
    {
      id: "q1",
      entityId: "e1",
      entityType: "post",
      title: "Fila Publicada",
      platforms: ["autoblog"],
      scheduledFor: new Date().toISOString(),
      priority: "normal",
      status: "published",
      attempts: 1,
      maxAttempts: 3,
      createdAt: "",
      updatedAt: ""
    },
    {
      id: "q2",
      entityId: "e2",
      entityType: "post",
      title: "Fila Pendente",
      platforms: ["telegram"],
      scheduledFor: new Date().toISOString(),
      priority: "urgent",
      status: "scheduled",
      attempts: 0,
      maxAttempts: 3,
      createdAt: "",
      updatedAt: ""
    }
  ];

  const mockLogs: DispatchLogEntry[] = [
    {
      id: "l1",
      timestamp: new Date().toISOString(),
      channel: "instagram",
      action: "publish",
      status: "success",
      statusCode: 200,
      message: "Publicado",
      payloadSummary: "",
      latencyMs: 40
    },
    {
      id: "l2",
      timestamp: new Date().toISOString(),
      channel: "autoblog",
      action: "publish",
      status: "success",
      statusCode: 201,
      message: "Publicado",
      payloadSummary: "",
      latencyMs: 60
    }
  ];

  const summary = calculateExecutiveTelemetry({
    posts: mockPosts,
    deals: mockDeals,
    commentRules: mockCommentRules,
    dispatchQueue: mockQueue,
    logs: mockLogs
  });

  // KPI 1: Total Disparados
  // 2 posts published + 1 deal sent + 1 queue published = 4
  assert(summary.totalDispatched === 4, `Total disparados computado com precisão: ${summary.totalDispatched} (esperado 4)`);

  // Falhas: 1 post failed = 1
  assert(summary.failedDispatchesCount === 1, "Computou 1 falha");

  // KPI 2: Taxa de Sucesso
  // 4 sucessos / (4 + 1 tentativas) = 80.0%
  assert(summary.successRatePercent === 80, `Taxa de sucesso calculada: ${summary.successRatePercent}% (esperado 80%)`);

  // KPI 3: DMs Enviadas
  // 150 + 50 = 200
  assert(summary.dmsSentCount === 200, `DMs enviadas somadas: ${summary.dmsSentCount} (esperado 200)`);
  assert(summary.activeAutomationsCount === 2, "2 automações ativas computadas");

  // KPI 4: Alcance Estimado
  // (4 disparados * 2400) + (200 DMs * 15) = 9600 + 3000 = 12600
  assert(summary.totalReachEstimated === 12600, `Alcance estimado global: ${summary.totalReachEstimated} (esperado 12600)`);

  // Pendentes em Fila: 1 post scheduled + 1 deal pending + 1 queue scheduled = 3
  assert(summary.pendingQueueCount === 3, `Total de pendentes em fila: ${summary.pendingQueueCount} (esperado 3)`);

  // Latência Média: (40 + 60) / 2 = 50ms
  assert(summary.averageLatencyMs === 50, `Latência média calculada: ${summary.averageLatencyMs}ms (esperado 50ms)`);

  console.log("\n📋 3. Teste de Telemetria com os Dados do Store Oficial");
  const storeState = usePosterStore.getState();
  const storeTelemetry = calculateExecutiveTelemetry(storeState);

  assert(typeof storeTelemetry.totalDispatched === "number", "totalDispatched é número válido no store");
  assert(storeTelemetry.successRatePercent >= 0 && storeTelemetry.successRatePercent <= 100, "successRatePercent entre 0 e 100%");
  assert(storeTelemetry.dmsSentCount >= 0, "dmsSentCount é maior ou igual a zero");
  assert(storeTelemetry.totalReachEstimated >= 0, "totalReachEstimated é maior ou igual a zero");
  assert(Boolean(storeTelemetry.calculatedAt), "Timestamp de cálculo preenchido");

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
