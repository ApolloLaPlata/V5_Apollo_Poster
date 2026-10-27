/**
 * test-etapa069.ts - Suíte de Testes da Etapa 069:
 * Painel de Métricas de Engajamento de DM: Comentários Detectados, Respostas Enviadas, DMs Entregues e Conversão
 * Capitania #13: V5 Apollo Poster (:3011)
 */

import { 
  calculateDmEngagementMetrics, 
  exportMetricsAsJson, 
  exportKeywordsAsCsv 
} from "../src/lib/comments/dmEngagementMetrics";
import { CommentRule, CommentTriggerEvent } from "../src/types/poster";

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✗ [FAIL] ${testName}${details ? ` -> ${details}` : ""}`);
  }
}

console.log("=== INICIANDO TESTES DA ETAPA 069 (DM ENGAGEMENT METRICS PANEL) ===\n");

// MOCK DATA DE REGRAS E EVENTOS
const mockRules: CommentRule[] = [
  {
    id: "rule_tech_reel",
    name: "Automação Reel Teclado Gamer",
    platform: "instagram",
    targetPostId: "reel_1001",
    matchMode: "contains",
    keywords: ["LINK", "QUERO", "DESCONTO"],
    publicReplyVariants: ["Enviado no direct!", "Confira sua DM!"],
    dmMessageTemplate: "Aqui está o link: {{ctaUrl}}",
    ctaUrl: "https://v5finders.com/deal/teclado",
    couponCode: "TECH10",
    isActive: true,
    totalTriggered: 120
  },
  {
    id: "rule_tools_tiktok",
    name: "Captação TikTok Tools",
    platform: "tiktok",
    targetPostId: "video_2002",
    matchMode: "contains",
    keywords: ["PLANILHA", "TOOL", "ACESSO"],
    publicReplyVariants: ["Acesso liberado no privado!", "Link enviado!"],
    dmMessageTemplate: "Acesse a ferramenta: {{ctaUrl}}",
    ctaUrl: "https://v5tools.com/hub",
    isActive: true,
    totalTriggered: 80
  }
];

const mockEvents: CommentTriggerEvent[] = [
  {
    id: "evt_1",
    ruleId: "rule_tech_reel",
    platform: "instagram",
    username: "@marcos_coder",
    commentId: "cmt_101",
    commentText: "Quero o link desse produto!",
    matchedKeyword: "QUERO",
    publicReplySent: "Enviado no direct!",
    dmSent: "Aqui está o link: https://v5finders.com/deal/teclado",
    couponUsed: "TECH10",
    timestamp: new Date().toISOString(),
    status: "success"
  },
  {
    id: "evt_2",
    ruleId: "rule_tools_tiktok",
    platform: "tiktok",
    username: "@juliana_dev",
    commentId: "cmt_102",
    commentText: "Manda a planilha por favor",
    matchedKeyword: "PLANILHA",
    publicReplySent: "Acesso liberado no privado!",
    dmSent: "Acesse a ferramenta: https://v5tools.com/hub",
    timestamp: new Date().toISOString(),
    status: "success"
  },
  {
    id: "evt_3",
    ruleId: "rule_tech_reel",
    platform: "instagram",
    username: "@felipe_spam",
    commentId: "cmt_103",
    commentText: "link link link",
    matchedKeyword: "LINK",
    publicReplySent: "Confira sua DM!",
    dmSent: "Aqui está o link: https://v5finders.com/deal/teclado",
    couponUsed: "TECH10",
    timestamp: new Date().toISOString(),
    status: "throttled"
  }
];

// 1. TESTE DE CÁLCULO GERAL ONICANAL
console.log("[Grupo 1] Cálculo Geral de Métricas Onicanal (calculateDmEngagementMetrics):");
const generalMetrics = calculateDmEngagementMetrics(mockRules, mockEvents);

assert(generalMetrics.totalTriggersMatched === 200, "Calcula 200 gatilhos totais acumulados");
assert(generalMetrics.totalCommentsDetected > generalMetrics.totalTriggersMatched, "Comentários totais detectados é maior que os gatilhos ativados");
assert(generalMetrics.matchRate > 70 && generalMetrics.matchRate < 95, `Taxa de qualificação de leads dentro da faixa esperada (${generalMetrics.matchRate}%)`);
assert(generalMetrics.totalPublicRepliesSent > 0, "Registra respostas públicas emitidas com sucesso");
assert(generalMetrics.totalDmsDelivered > 0, "Registra DMs privadas entregues no Direct");
assert(generalMetrics.deliveryRate >= 95.0, `Taxa de entrega de DMs alta (${generalMetrics.deliveryRate}%) com bypass 24h`);
assert(generalMetrics.estimatedClicks > 0, `Cliques estimados via UTM calculados (${generalMetrics.estimatedClicks})`);
assert(generalMetrics.clickThroughRate === 26.4, "CTR médio de Direct Message em conformidade");
assert(generalMetrics.estimatedConversions > 0, `Conversões de vendas estimadas (${generalMetrics.estimatedConversions})`);

// 2. TESTE DOS 6 ESTÁGIOS DO FUNIL DE CONVERSÃO
console.log("\n[Grupo 2] Estrutura e Consistência do Funil de 6 Estágios:");
assert(generalMetrics.funnelStages.length === 6, "Funil possui exatamente 6 estágios");
assert(generalMetrics.funnelStages[0].name === "Comentários no Post", "Estágio 1 é Comentários no Post");
assert(generalMetrics.funnelStages[1].name === "Gatilhos Identificados", "Estágio 2 é Gatilhos Identificados");
assert(generalMetrics.funnelStages[2].name === "Respostas Públicas Feed", "Estágio 3 é Respostas Públicas Feed");
assert(generalMetrics.funnelStages[3].name === "DMs Privadas Entregues", "Estágio 4 é DMs Privadas Entregues");
assert(generalMetrics.funnelStages[4].name === "Cliques no Link UTM", "Estágio 5 é Cliques no Link UTM");
assert(generalMetrics.funnelStages[5].name === "Conversões Concluídas", "Estágio 6 é Conversões Concluídas");

// Verificação de decrescimento lógico do funil (cada estágio tem volume menor ou igual ao anterior)
const counts = generalMetrics.funnelStages.map(s => s.count);
assert(counts[0] >= counts[1], "Comentários >= Gatilhos");
assert(counts[1] >= counts[3], "Gatilhos >= DMs Entregues");
assert(counts[3] >= counts[4], "DMs Entregues >= Cliques");
assert(counts[4] >= counts[5], "Cliques >= Conversões");

// 3. TESTE DE RANKING DE TOP PALAVRAS-CHAVE
console.log("\n[Grupo 3] Ranking de Palavras-Chave de Maior Engajamento (Top Triggers):");
assert(generalMetrics.topKeywords.length > 0, "Gera ranking de palavras-chave");
const firstKw = generalMetrics.topKeywords[0];
assert(Boolean(firstKw.keyword), `Top 1 palavra-chave identificada: "${firstKw.keyword}"`);
assert(firstKw.triggerCount > 0, "Contagem de disparos positiva");
assert(firstKw.estimatedClicks > 0, "Contagem de cliques estimada positiva");
assert(firstKw.conversionRate > 0, "Taxa de conversão positiva");

// 4. TESTE DE SEPARAÇÃO POR PLATAFORMA (INSTAGRAM VS TIKTOK)
console.log("\n[Grupo 4] Separação de Telemetria por Plataforma (Instagram x TikTok):");
const igMetrics = generalMetrics.platformBreakdown.instagram;
const ttMetrics = generalMetrics.platformBreakdown.tiktok;

assert(igMetrics.platform === "instagram", "Métrica de Instagram com identificador correto");
assert(igMetrics.triggersMatched === 120, "Instagram contabiliza 120 disparos da regra Reel");
assert(igMetrics.deliveryRate === 98.0, "Taxa de entrega no Instagram é 98%");
assert(ttMetrics.platform === "tiktok", "Métrica de TikTok com identificador correto");
assert(ttMetrics.triggersMatched === 80, "TikTok contabiliza 80 disparos da regra Video");
assert(ttMetrics.deliveryRate === 96.0, "Taxa de entrega no TikTok é 96%");

// 5. TESTES DE FILTRAGEM POR PERÍODO (TIMEFRAME)
console.log("\n[Grupo 5] Filtros de Período (24h, 7d, 30d):");
const metrics24h = calculateDmEngagementMetrics(mockRules, mockEvents, { timeframe: "24h" });
const metrics7d = calculateDmEngagementMetrics(mockRules, mockEvents, { timeframe: "7d" });

assert(metrics24h.timeframe === "24h", "Timeframe registrado como 24h");
assert(metrics24h.totalTriggersMatched < generalMetrics.totalTriggersMatched, "Volume em 24h é menor que o total acumulado");
assert(metrics7d.totalTriggersMatched > metrics24h.totalTriggersMatched, "Volume em 7d é maior que em 24h");

// 6. TESTES DE FILTRAGEM POR PLATAFORMA
console.log("\n[Grupo 6] Filtro de Plataforma (Apenas Instagram vs Apenas TikTok):");
const igOnly = calculateDmEngagementMetrics(mockRules, mockEvents, { platform: "instagram" });
const ttOnly = calculateDmEngagementMetrics(mockRules, mockEvents, { platform: "tiktok" });

assert(igOnly.platformFilter === "instagram", "Filtro marcado como instagram");
assert(igOnly.totalTriggersMatched === 120, "Apenas regras do Instagram somam 120 disparos");
assert(ttOnly.platformFilter === "tiktok", "Filtro marcado como tiktok");
assert(ttOnly.totalTriggersMatched === 80, "Apenas regras do TikTok somam 80 disparos");

// 7. TESTE DOS EXPORTADORES JSON E CSV
console.log("\n[Grupo 7] Exportadores Estruturados (JSON & CSV):");
const jsonOutput = exportMetricsAsJson(generalMetrics);
assert(jsonOutput.startsWith("{") && jsonOutput.includes("totalDmsDelivered"), "JSON exportado com formato e chaves válidas");

const parsedJson = JSON.parse(jsonOutput);
assert(parsedJson.totalDmsDelivered === generalMetrics.totalDmsDelivered, "JSON re-parseado preserva valores exatos");

const csvOutput = exportKeywordsAsCsv(generalMetrics.topKeywords);
assert(csvOutput.includes("Palavra-Chave,Plataforma,Regra"), "CSV contém cabeçalho correto");
assert(csvOutput.split("\n").length >= 2, "CSV contém linhas de dados além do cabeçalho");

console.log(`\n======================================================`);
console.log(`TOTAL DE TESTES: ${totalTests}`);
console.log(`APROVADOS:       ${passedTests}`);
console.log(`FALHAS:          ${totalTests - passedTests}`);
console.log(`TAXA DE SUCESSO: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
console.log(`======================================================`);

if (passedTests === totalTests) {
  console.log(">> HOMOLOGAÇÃO DA ETAPA 069 CONCLUÍDA COM SUCESSO! <<");
  process.exit(0);
} else {
  process.exit(1);
}
