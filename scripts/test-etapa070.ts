/**
 * test-etapa070.ts - Bateria de Homologação da Fase 7: Comment-to-DM Engine (ChatbotX Architecture)
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Valida a integração de ponta a ponta dos 8 submódulos cognitivos da Fase 7:
 * 1. triggerMatcher.ts (Gatilhos, Sinônimos, Fuzzy Levenshtein, Fronteira de Palavra)
 * 2. publicReplyRotator.ts (Rotação Anti-Spam, Health Diversity Score, Pacotes de Nicho)
 * 3. dmTemplateBuilder.ts (Placeholders, Presets de Alta Conversão, Validador Meta 1000c)
 * 4. metaPrivateReplyClient.ts (Bypass 24h Meta Graph API ancorado no comment_id)
 * 5. antiBanThrottler.ts (Taxa máxima de 30 DMs/min, Jitter 2s-5s, Fila de Prioridade)
 * 6. trackedLinkGenerator.ts (UTM Onicanal Dedicado, Injeção de Cupom, Preservação de Hash)
 * 7. commentSimulationEngine.ts (Pipeline Onicanal Completo de Simulação em Tempo Real)
 * 8. dmEngagementMetrics.ts (Métricas de Engajamento, Funil de 6 Estágios, Exportadores)
 */

import { matchCommentTrigger } from "../src/lib/comments/triggerMatcher";
import { getNextPublicReply, validateAntiSpamDiversity, NICHE_VARIANT_PACKS } from "../src/lib/comments/publicReplyRotator";
import { compileDmMessage, validateDmTemplate, DM_PRESET_TEMPLATES } from "../src/lib/comments/dmTemplateBuilder";
import { sendMetaPrivateReply, validateCommentEligibilityForPrivateReply } from "../src/lib/comments/metaPrivateReplyClient";
import { AntiBanThrottler, globalAntiBanThrottler } from "../src/lib/comments/antiBanThrottler";
import { generateTrackedDmUrl, validateTrackedDmUrl } from "../src/lib/comments/trackedLinkGenerator";
import { simulateCommentInteraction } from "../src/lib/comments/commentSimulationEngine";
import { calculateDmEngagementMetrics } from "../src/lib/comments/dmEngagementMetrics";
import { CommentRule, CommentTriggerEvent } from "../src/types/poster";

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✗ [FAIL] ${testName}${details ? ` -> ${details}` : ""}`);
  }
}

console.log("================================================================================");
console.log("   V5 APOLLO POSTER - HOMOLOGAÇÃO TOTAL DA FASE 7: COMMENT-TO-DM ENGINE         ");
console.log("================================================================================\n");

// 1. HOMOLOGAÇÃO: MOTOR COGNITIVO DE GATILHOS (TRIGGER MATCHER)
console.log("[Pilar 1/8] Mapeamento Cognitivo de Gatilhos (triggerMatcher):");
const matchExact = matchCommentTrigger("Eu quero esse link agora!", ["LINK", "QUERO"]);
assert(matchExact.isMatch === true && (matchExact.matchedKeyword === "LINK" || matchExact.matchedKeyword === "QUERO"), "Identifica gatilho em comentário composto");

const matchTypo = matchCommentTrigger("Manda o linck pfv", ["LINK"], { mode: "fuzzy", fuzzyMaxDistance: 1 });
assert(matchTypo.isMatch === true && matchTypo.matchedKeyword === "LINK", "Tolera erro de digitação via Levenshtein ('linck' -> 'LINK')");

const matchFalsePositive = matchCommentTrigger("A tela começou a piscar e blinkar", ["LINK"]);
assert(matchFalsePositive.isMatch === false, "Fronteira de palavra \\b impede falso positivo ('blinkar')");

// 2. HOMOLOGAÇÃO: ROTAÇÃO PÚBLICA ANTI-SPAM
console.log("\n[Pilar 2/8] Rotação Pública Anti-Spam & Health Diversity (publicReplyRotator):");
const variants = [
  "Enviado no seu direct! 🔥",
  "Te mandei na mensagem privada! 🚀",
  "Confere suas DMs, acabei de mandar! 👀",
  "Mandei o link completo no direct! ⚡",
  "Dá uma olhada no seu privado! ✨"
];
const health = validateAntiSpamDiversity(variants);
assert(health.status === "excellent" && health.score >= 80, `Health score excelente (${health.score}/100) para 5 variações`);

const seenReplies = new Set<string>();
for (let i = 0; i < 5; i++) {
  const { reply } = getNextPublicReply(variants, "rule_homolog", "random_no_repeat");
  seenReplies.add(reply);
}
assert(seenReplies.size > 1, "Rotação sem repetição consecutiva atua com diversidade");

// 3. HOMOLOGAÇÃO: TEMPLATE BUILDER DE DIRECT MESSAGE (DM)
console.log("\n[Pilar 3/8] Construtor e Validador de Template de DM (dmTemplateBuilder):");
const rawTemplate = "Olá {{nome}}! Aqui está o link: {{ctaUrl}} | Cupom: {{cupom}}";
const compiledDm = compileDmMessage(rawTemplate, {
  name: "Marcos",
  username: "@marcos_dev",
  ctaUrl: "https://v5finders.com/promo",
  couponCode: "VIP20"
});
assert(compiledDm.includes("Olá Marcos!"), "Interpola {{nome}} corretamente");
assert(compiledDm.includes("https://v5finders.com/promo"), "Interpola {{ctaUrl}} corretamente");
assert(compiledDm.includes("VIP20"), "Interpola {{cupom}} corretamente");
assert(validateDmTemplate(rawTemplate).isValid, "Validador Meta confirma conformidade com regras e limite de 1000c");

// 4. HOMOLOGAÇÃO: CLIENTE META PRIVATE REPLY COM BYPASS 24H
console.log("\n[Pilar 4/8] Bypass Oficial da Janela de 24h Meta Graph (metaPrivateReplyClient):");
const recentCommentTimestampMs = Date.now() - 3600 * 1000;
const eligibility = validateCommentEligibilityForPrivateReply(recentCommentTimestampMs, false);
assert(eligibility.eligible === true, "Comentário dentro da janela de 7 dias é elegível para Bypass de 24h");

async function runMetaDispatchTest() {
  const metaDispatch = await sendMetaPrivateReply({
    commentId: "cmt_12345",
    text: compiledDm,
    forceSimulation: true
  });
  assert(metaDispatch.success === true, "Despacho privado Meta concluído com sucesso");
  assert(metaDispatch.bypass24hVerified === true, "Bypass de 24h formalmente verificado");
  assert(Boolean(metaDispatch.messageId), `Message ID gerado: ${metaDispatch.messageId}`);

  // 5. HOMOLOGAÇÃO: FILA ANTI-BAN E THROTTLING
  console.log("\n[Pilar 5/8] Fila Anti-Ban & Throttling Deslizante (antiBanThrottler):");
  const testThrottler = new AntiBanThrottler({ maxDmsPerMinute: 30 });
  assert(testThrottler.canDispatchNow() === true, "Permite despacho quando abaixo do teto de 30 DMs/min");

  for (let i = 0; i < 30; i++) {
    testThrottler.recordSuccessfulDispatch();
  }
  assert(testThrottler.canDispatchNow() === false, "Bloqueia despacho após atingir exatamente 30 DMs no minuto");

  testThrottler.enqueue({
    ruleId: "rule_test",
    commentId: "cmt_overflow",
    username: "@user_overflow",
    commentText: "Quero link!",
    dmMessage: "Link!",
    publicReply: "Enviado!",
    priority: "high"
  });
  assert(testThrottler.getMetrics().queueLength === 1, "Enfileira requisições excedentes para amortecimento");

  // 6. HOMOLOGAÇÃO: GERADOR DE LINKS COM UTM DEDICADO
  console.log("\n[Pilar 6/8] Links Rastreados Onicanal com UTM Dedicado (trackedLinkGenerator):");
  const tracked = generateTrackedDmUrl({
    baseUrl: "https://v5autoblog.com/artigo",
    platform: "instagram",
    campaign: "Agentes Autonomos 2026",
    matchedKeyword: "QUERO",
    couponCode: "APOLLO50"
  });
  assert(tracked.isValidUrl === true, "URL rastreada gerada com sucesso");
  assert(tracked.utmSource === "ig_comment_dm", "Injeta utm_source=ig_comment_dm oficial");
  assert(tracked.utmMedium === "direct_message", "Injeta utm_medium=direct_message oficial");
  assert(tracked.utmContent === "trigger_quero", "Injeta utm_content=trigger_quero");
  assert(tracked.finalUrl.includes("coupon=APOLLO50"), "Injeta parâmetro coupon no checkout");
  assert(validateTrackedDmUrl(tracked.finalUrl).isValid, "Validador de conformidade aprova a URL rastreada");

  // 7. HOMOLOGAÇÃO: SIMULADOR DE COMENTÁRIOS DE PONTA A PONTA
  console.log("\n[Pilar 7/8] Pipeline Completo de Simulação Onicanal (commentSimulationEngine):");
  const testRule: CommentRule = {
    id: "rule_full_sim",
    name: "Campanha Viral Black Friday",
    platform: "instagram",
    targetPostId: "reel_999",
    matchMode: "contains",
    keywords: ["LINK", "QUERO", "CUPOM"],
    publicReplyVariants: variants,
    dmMessageTemplate: "Olá {{nome}}! Link: {{ctaUrl}} | Cupom: {{cupom}}",
    ctaUrl: "https://v5finders.com/promo",
    couponCode: "BF50",
    isActive: true,
    totalTriggered: 15
  };

  const simResponse = await simulateCommentInteraction({
    commentText: "Quero esse cupom agora mesmo!",
    username: "@lucas_lead",
    rule: testRule,
    platform: "instagram"
  });

  assert(simResponse.success === true, "Simulação de ponta a ponta bem-sucedida");
  assert(simResponse.isTriggerMatched === true, "Reconhece gatilho no comentário do seguidor");
  assert(Boolean(simResponse.publicReplyText), "Gera resposta pública formatada");
  assert(Boolean(simResponse.dmMessageText?.includes("BF50")), "DM contém o cupom interpolado");
  assert(Boolean(simResponse.trackedUrl?.finalUrl.includes("utm_source=ig_comment_dm")), "DM contém o link rastreado com UTM");
  assert(simResponse.bypass24hVerified === true, "Bypass de 24h executado com sucesso");

  // 8. HOMOLOGAÇÃO: MOTOR ANALÍTICO E PAINEL DE MÉTRICAS DE ENGAGEMENT
  console.log("\n[Pilar 8/8] Analytics de Engajamento & Funil Onicanal (dmEngagementMetrics):");
  const mockEvt: CommentTriggerEvent = {
    id: "evt_homolog",
    ruleId: testRule.id,
    platform: "instagram",
    username: "@lucas_lead",
    commentId: "cmt_999",
    commentText: "Quero esse cupom!",
    matchedKeyword: "QUERO",
    publicReplySent: simResponse.publicReplyText || "",
    dmSent: simResponse.dmMessageText || "",
    couponUsed: "BF50",
    timestamp: new Date().toISOString(),
    status: "success"
  };

  const metrics = calculateDmEngagementMetrics([testRule], [mockEvt]);
  assert(metrics.totalCommentsDetected > 0, "Calcula total de comentários detectados");
  assert(metrics.totalDmsDelivered > 0, "Calcula total de DMs entregues");
  assert(metrics.deliveryRate >= 95.0, "Taxa de entrega calculada corretamente");
  assert(metrics.funnelStages.length === 6, "Funil analítico de 6 estágios estruturado");
  assert(metrics.topKeywords.length > 0, "Ranking de palavras-chave consolidado");
  assert(metrics.platformBreakdown.instagram.deliveryRate > 0, "Breakdown de plataforma calculado");

  // FECHAMENTO
  console.log(`\n================================================================================`);
  console.log(`   TOTAL DE ASSERÇÕES DE INTEGRAÇÃO EXECUTADAS: ${totalTests}`);
  console.log(`   ASSERÇÕES APROVADAS COM SUCESSO:             ${passedTests}`);
  console.log(`   FALHAS ENCONTRADAS:                          ${totalTests - passedTests}`);
  console.log(`   TAXA DE SUCESSO DA FASE 7:                   ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log(`================================================================================`);

  if (passedTests === totalTests) {
    console.log(">> FASE 7: COMMENT-TO-DM ENGINE HOMOLOGADA COM 100% DE ÊXITO! <<\n");
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runMetaDispatchTest();
