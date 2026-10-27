/**
 * test-etapa092.ts - Teste de Homologação da Etapa 092
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Validação do Gráfico Visual de Distribuição de Posts por Canal:
 * 1. Mapeamento categórico das 11 plataformas nas 4 verticais (Blog, Email, Social, Grupos)
 * 2. Cálculo de proporção percentual acumulada e individual por canal
 * 3. Identificação determinística do canal e grupo líderes de transmissão
 * 4. Resiliência matemática a cenários de lista vazia (zero divisão por zero)
 * 5. Consistência analítica com os dados oficiais do Zustand Store
 */

import {
  getChannelGroup,
  calculateChannelDistribution,
  CHANNEL_GROUP_DEFINITIONS,
  PLATFORM_METADATA,
  PLATFORM_TO_GROUP_MAP,
  ChannelGroupKey
} from "../src/lib/analytics/channelDistribution";
import { usePosterStore } from "../src/store/usePosterStore";
import {
  ScheduledPost,
  GroupBroadcastDeal,
  QueueItem,
  DispatchLogEntry,
  SocialPlatform
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
  console.log("🚀 INICIANDO TESTES DA ETAPA 092: DISTRIBUIÇÃO POR CANAL");
  console.log("========================================================\n");

  console.log("📋 1. Teste de Mapeamento Categórico nas 4 Verticais");
  assert(getChannelGroup("autoblog") === "blog", "autoblog mapeia para 'blog'");
  assert(getChannelGroup("wordpress") === "blog", "wordpress mapeia para 'blog'");
  assert(getChannelGroup("newsletter") === "email", "newsletter mapeia para 'email'");
  assert(getChannelGroup("instagram") === "social", "instagram mapeia para 'social'");
  assert(getChannelGroup("tiktok") === "social", "tiktok mapeia para 'social'");
  assert(getChannelGroup("youtube") === "social", "youtube mapeia para 'social'");
  assert(getChannelGroup("kwai") === "social", "kwai mapeia para 'social'");
  assert(getChannelGroup("x_twitter") === "social", "x_twitter mapeia para 'social'");
  assert(getChannelGroup("threads") === "social", "threads mapeia para 'social'");
  assert(getChannelGroup("telegram") === "groups", "telegram mapeia para 'groups'");
  assert(getChannelGroup("whatsapp") === "groups", "whatsapp mapeia para 'groups'");

  console.log("\n📋 2. Teste de Metadados e Definições Oficiais");
  const requiredGroups: ChannelGroupKey[] = ["blog", "email", "social", "groups"];
  requiredGroups.forEach((groupKey) => {
    const def = CHANNEL_GROUP_DEFINITIONS[groupKey];
    assert(Boolean(def), `Definição presente para macro-grupo '${groupKey}'`);
    assert(Boolean(def.barColorHex && def.barColorHex.startsWith("#")), `Cor HEX válida para '${groupKey}'`);
    assert(Boolean(def.tailwindBg && def.tailwindText), `Classes Tailwind presentes para '${groupKey}'`);
    assert(def.channels.length > 0, `Pelo menos 1 canal mapeado para '${groupKey}'`);
  });

  const allPlatforms: SocialPlatform[] = [
    "autoblog", "wordpress", "newsletter", "instagram", "tiktok",
    "youtube", "kwai", "x_twitter", "threads", "telegram", "whatsapp"
  ];
  allPlatforms.forEach((p) => {
    const meta = PLATFORM_METADATA[p];
    assert(Boolean(meta), `Metadado de plataforma presente para '${p}'`);
    assert(meta.label.length > 0, `Rótulo legível definido para '${p}'`);
  });

  console.log("\n📋 3. Teste de Cálculo Sintético de Distribuição Proporcional");
  const mockPosts: ScheduledPost[] = [
    {
      id: "p1",
      title: "Post Blog + Social",
      content: "",
      platforms: ["autoblog", "instagram"],
      scheduledAt: new Date().toISOString(),
      status: "published",
      tags: [],
      createdAt: "",
      updatedAt: ""
    },
    {
      id: "p2",
      title: "Post Dual Beehiiv",
      content: "",
      platforms: ["newsletter"],
      scheduledAt: new Date().toISOString(),
      status: "published",
      tags: [],
      createdAt: "",
      updatedAt: ""
    }
  ];

  const mockDeals: GroupBroadcastDeal[] = [
    {
      id: "d1",
      productName: "Oferta VIP",
      store: "Amazon",
      originalPrice: 100,
      promoPrice: 50,
      discountPercentage: 50,
      affiliateUrl: "https://v5p.st/d1",
      status: "sent",
      targetChannels: ["telegram", "whatsapp"],
      scheduledTime: "2026-10-27T10:00:00Z"
    }
  ];

  const mockQueue: QueueItem[] = [
    {
      id: "q1",
      entityId: "e1",
      entityType: "post",
      title: "Fila Social",
      platforms: ["tiktok", "youtube"],
      scheduledFor: new Date().toISOString(),
      priority: "normal",
      status: "scheduled",
      attempts: 0,
      maxAttempts: 3,
      createdAt: "",
      updatedAt: ""
    }
  ];

  const report = calculateChannelDistribution({
    posts: mockPosts,
    deals: mockDeals,
    dispatchQueue: mockQueue,
    logs: []
  });

  // Total canais acionados:
  // p1: autoblog(1), instagram(1) = 2
  // p2: newsletter(1) = 1
  // d1: telegram(1), whatsapp(1) = 2
  // q1: tiktok(1), youtube(1) = 2
  // Total = 7
  assert(report.totalTracked === 7, `Total rastreado computado exatamente como 7 (obtido: ${report.totalTracked})`);

  // Grupos:
  // blog: autoblog(1) = 1/7 = 14.3%
  // email: newsletter(1) = 1/7 = 14.3%
  // social: instagram(1) + tiktok(1) + youtube(1) = 3/7 = 42.9%
  // groups: telegram(1) + whatsapp(1) = 2/7 = 28.6%
  const socialGroup = report.groups.find((g) => g.key === "social");
  const groupsGroup = report.groups.find((g) => g.key === "groups");
  const blogGroup = report.groups.find((g) => g.key === "blog");
  const emailGroup = report.groups.find((g) => g.key === "email");

  assert(socialGroup?.totalCount === 3, "Social group computou 3 canais");
  assert(groupsGroup?.totalCount === 2, "Groups group computou 2 canais");
  assert(blogGroup?.totalCount === 1, "Blog group computou 1 canal");
  assert(emailGroup?.totalCount === 1, "Email group computou 1 canal");

  // O grupo mais ativo deve ser 'social'
  assert(report.topGroup.key === "social", "Grupo líder identificado corretamente como 'social'");

  // A soma das porcentagens dos grupos deve estar próxima de 100%
  const totalPercentage = report.groups.reduce((acc, g) => acc + g.percentage, 0);
  assert(totalPercentage >= 99 && totalPercentage <= 101, `Soma das porcentagens dos grupos é ~100% (${totalPercentage}%)`);

  console.log("\n📋 4. Teste de Resiliência para Caso de Borda Vazio");
  const emptyReport = calculateChannelDistribution({});
  assert(emptyReport.totalTracked === 0, "Total rastreado é 0 quando vazio");
  assert(emptyReport.groups.every((g) => g.percentage === 0), "Todas as porcentagens zeradas sem erro de NaN");
  assert(emptyReport.channels.length === 11, "Todas as 11 plataformas presentes no relatório mesmo vazias");

  console.log("\n📋 5. Teste de Consistência com o Zustand Store Oficial");
  const storeState = usePosterStore.getState();
  const storeReport = calculateChannelDistribution(storeState);

  assert(storeReport.groups.length === 4, "Store report possui os 4 macro-grupos");
  assert(storeReport.channels.length === 11, "Store report possui as 11 plataformas");
  assert(storeReport.totalTracked >= 0, "totalTracked no store é número válido >= 0");
  assert(Boolean(storeReport.topGroup), "Identificou topGroup no store");
  assert(Boolean(storeReport.topPlatform), "Identificou topPlatform no store");

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
