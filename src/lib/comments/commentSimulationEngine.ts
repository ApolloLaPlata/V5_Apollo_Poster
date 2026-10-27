/**
 * commentSimulationEngine.ts - Motor de Simulação Interativa de Comentários de Ponta a Ponta
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Pipeline Completo de Simulação em Tempo Real:
 * 1. Normalização do Comentário & Reconhecimento Cognitivo (triggerMatcher)
 * 2. Evasão Anti-Spam: Seleção de Resposta Pública Rotativa sem Repetição (publicReplyRotator)
 * 3. Compilação da DM com Interpolação de Placeholders e Cupom (dmTemplateBuilder)
 * 4. Despacho Meta Graph API com Bypass da Janela de 24h Ancorado no comment_id (metaPrivateReplyClient)
 * 5. Telemetria em Tempo Real (latência calculada, taxa de confiança, verificação de conformidade)
 */

import { matchCommentTrigger, TriggerMatchMode, TriggerMatchResult } from "./triggerMatcher";
import { getNextPublicReply, formatPublicReply } from "./publicReplyRotator";
import { compileDmMessage, validateDmTemplate, DmTemplateValidation } from "./dmTemplateBuilder";
import { sendMetaPrivateReply, MetaPrivateReplyResponse } from "./metaPrivateReplyClient";
import { CommentRule } from "@/types/poster";

export interface SimulationInput {
  commentText: string;
  username: string;
  rule: CommentRule;
  platform?: "instagram" | "tiktok";
  simulatedLatencyMs?: number;
}

export interface SimulationExecutionResult {
  success: boolean;
  isTriggerMatched: boolean;
  matchResult: TriggerMatchResult;
  publicReplyText?: string;
  publicReplyIndex?: number;
  dmMessageText?: string;
  dmValidation?: DmTemplateValidation;
  couponApplied?: string;
  metaCommentId?: string;
  metaMessageId?: string;
  bypass24hVerified: boolean;
  latencyMs: number;
  timestamp: string;
  executionSteps: Array<{
    step: string;
    status: "success" | "skipped" | "failed";
    details: string;
  }>;
}

export interface QuickTestScenario {
  id: string;
  title: string;
  category: "hot_lead" | "typo_fuzzy" | "coupon_request" | "false_positive" | "neutral";
  username: string;
  commentText: string;
  expectedResult: "match" | "no_match";
  description: string;
}

/**
 * Biblioteca Curada de Cenários de Teste Rápido com 1 Clique
 */
export const QUICK_TEST_SCENARIOS: QuickTestScenario[] = [
  {
    id: "hot_lead_quero",
    title: "Lead Quente ('EU QUERO O LINK')",
    category: "hot_lead",
    username: "@marcos_growth",
    commentText: "Eu quero o link desse conteúdo agora mesmo! 🔥🚀",
    expectedResult: "match",
    description: "Comentário enfático com emojis e repetição que ativa o gatilho principal QUERO/LINK."
  },
  {
    id: "typo_fuzzy_linck",
    title: "Typo Tolerado ('linck')",
    category: "typo_fuzzy",
    username: "@dev_juliana",
    commentText: "Manda o linck no direct por favorrrr!!",
    expectedResult: "match",
    description: "Erro de digitação leve ('linck') capturado com sucesso pelo cálculo de Levenshtein."
  },
  {
    id: "coupon_request",
    title: "Pedido de Cupom ('tem cupom?')",
    category: "coupon_request",
    username: "@felipe_compras",
    commentText: "Tem cupom de desconto ou menor preço?",
    expectedResult: "match",
    description: "Ativação via dicionário de sinônimos de e-commerce e injeção do cupom na DM."
  },
  {
    id: "false_positive_blink",
    title: "Anti-Falso Positivo ('blinkar')",
    category: "false_positive",
    username: "@andre_tech",
    commentText: "A luz do aparelho começou a piscar e blinkar sem parar",
    expectedResult: "no_match",
    description: "Palavra 'blinkar' contém 'link', mas a fronteira de palavra \\b impede o disparo indevido."
  },
  {
    id: "neutral_compliment",
    title: "Comentário Neutro ('Muito bonito')",
    category: "neutral",
    username: "@carla_design",
    commentText: "Parabéns pelo trabalho, adorei a edição do vídeo!",
    expectedResult: "no_match",
    description: "Elogio comum sem intenção de compra ou pedido de link que não deve acionar a DM."
  }
];

/**
 * Executa o fluxo completo de simulação de um comentário contra uma regra
 */
export async function simulateCommentInteraction(
  input: SimulationInput
): Promise<SimulationExecutionResult> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  const steps: SimulationExecutionResult["executionSteps"] = [];

  const { commentText, username, rule, simulatedLatencyMs = 120 } = input;
  const cleanUsername = username ? username.trim() : "@usuario_teste";
  const rawUsernameWithoutAt = cleanUsername.replace("@", "");

  // ETAPA 1: Reconhecimento de Gatilho Cognitivo
  const matchMode = (rule.matchMode as TriggerMatchMode) || "contains";
  const matchResult = matchCommentTrigger(commentText, rule.keywords, {
    mode: matchMode,
    useSynonyms: true,
    fuzzyMaxDistance: 1
  });

  if (!matchResult.isMatch) {
    steps.push({
      step: "Trigger Matcher",
      status: "failed",
      details: `Nenhum gatilho ativado para o comentário: "${commentText}" (Modo: ${matchMode.toUpperCase()})`
    });

    const latencyMs = Date.now() - startTime + simulatedLatencyMs;

    return {
      success: false,
      isTriggerMatched: false,
      matchResult,
      bypass24hVerified: false,
      latencyMs,
      timestamp,
      executionSteps: steps
    };
  }

  steps.push({
    step: "Trigger Matcher",
    status: "success",
    details: `Gatilho detectado: "${matchResult.matchedKeyword}" com ${Math.round(matchResult.confidence * 100)}% de confiança.`
  });

  // ETAPA 2: Seleção de Resposta Pública Rotativa Anti-Spam
  const { reply: publicReplyTemplate, selectedIndex } = getNextPublicReply(
    rule.publicReplyVariants,
    rule.id,
    "random_no_repeat"
  );

  const publicReplyText = formatPublicReply(publicReplyTemplate, {
    username: cleanUsername,
    name: rawUsernameWithoutAt
  });

  steps.push({
    step: "Public Reply Rotator",
    status: "success",
    details: `Variação #${selectedIndex + 1} selecionada sem repetição consecutiva: "${publicReplyText}"`
  });

  // ETAPA 3: Compilação e Validação do Template de Direct Message
  const dmMessageText = compileDmMessage(rule.dmMessageTemplate, {
    name: rawUsernameWithoutAt,
    username: cleanUsername,
    ctaUrl: rule.ctaUrl,
    couponCode: rule.couponCode || "PROMO10",
    postTitle: rule.name
  });

  const dmValidation = validateDmTemplate(rule.dmMessageTemplate);

  steps.push({
    step: "DM Template Builder",
    status: "success",
    details: `DM compilada (${dmMessageText.length}c) com placeholders preenchidos e link rastreado.`
  });

  // ETAPA 4: Despacho Meta Graph API Ancorado no comment_id (Bypass 24h)
  const metaCommentId = `17841400${Math.floor(10000000 + Math.random() * 90000000)}`;

  const metaReply: MetaPrivateReplyResponse = await sendMetaPrivateReply({
    commentId: metaCommentId,
    text: dmMessageText,
    forceSimulation: true
  });

  steps.push({
    step: "Meta Graph Private Reply",
    status: metaReply.success ? "success" : "failed",
    details: metaReply.success
      ? `Bypass de 24h ativado. Message ID gerado: ${metaReply.messageId} ancorado em ${metaCommentId}`
      : `Falha no despacho Meta: ${metaReply.error}`
  });

  const latencyMs = Date.now() - startTime + simulatedLatencyMs;

  return {
    success: metaReply.success,
    isTriggerMatched: true,
    matchResult,
    publicReplyText,
    publicReplyIndex: selectedIndex,
    dmMessageText,
    dmValidation,
    couponApplied: rule.couponCode,
    metaCommentId,
    metaMessageId: metaReply.messageId,
    bypass24hVerified: metaReply.bypass24hVerified,
    latencyMs,
    timestamp,
    executionSteps: steps
  };
}
