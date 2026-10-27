/**
 * publicReplyRotator.ts - Construtor e Motor de Rotação de Respostas Públicas Anti-Spam
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Arquitetura de Evasão de Detecção Algorítmica (Meta Graph & TikTok Anti-Spam):
 * - Rotação sem repetição consecutiva (Fisher-Yates Shuffle / Round-Robin com memória do último índice)
 * - Avaliação do Anti-Spam Health Score (Exige mínimo de 3 a 5 variações com diversidade léxica)
 * - Cálculo de similaridade entre variações (detecção de repetições triviais)
 * - Biblioteca curada de templates por nicho (Conteúdo/Blog, Achadinhos/Afiliados, VIP/Comunidade, Cursos/Info)
 * - Interpolação de variáveis dinâmicas ({{username}}, {{nome}}, etc.)
 */

import { calculateLevenshteinDistance } from "./triggerMatcher";

export type RotationStrategy = "random_no_repeat" | "round_robin" | "pure_random";

export type ContentNiche = "content_blog" | "ecommerce_finders" | "vip_community" | "course_lead";

export interface AntiSpamHealthCheck {
  score: number; // 0 a 100
  status: "critical" | "warning" | "healthy" | "excellent";
  variantCount: number;
  averageSimilarity: number; // 0.0 a 1.0 (menor é melhor)
  warnings: string[];
  recommendations: string[];
  isSafeToDispatch: boolean;
}

export interface SuggestedVariantPack {
  niche: ContentNiche;
  title: string;
  description: string;
  variants: string[];
}

/**
 * Biblioteca de Pacotes de Variações Prontas para Evasão de Bloqueio por Nicho
 */
export const NICHE_VARIANT_PACKS: Record<ContentNiche, SuggestedVariantPack> = {
  content_blog: {
    niche: "content_blog",
    title: "Blog & Conteúdo Técnico (Auto Blog)",
    description: "Foco em entrega de artigos, estudos de caso e análises técnicas completas.",
    variants: [
      "Acabei de te enviar no Direct! Dá uma olhada lá 🔥",
      "Te mandei o artigo completo com todos os detalhes na sua DM! 🚀",
      "Prontinho! Link enviado no seu direct, aproveite a leitura 👀",
      "Confere suas mensagens diretas, acabei de despachar o acesso! ⚡",
      "Enviado! O link direto pro conteúdo está te esperando na DM 📖"
    ]
  },
  ecommerce_finders: {
    niche: "ecommerce_finders",
    title: "Achadinhos & Ofertas (Finders Hub)",
    description: "Foco em cupons, menor preço garantido e links de compra rápida.",
    variants: [
      "Te mandei o link com menor preço no direct! Corre antes que acabe 🔥",
      "Prontinho! O cupom e link da loja já estão na sua DM 🛒",
      "Acabei de despachar no seu direct! Confere lá pra garantir o desconto 💸",
      "Link e cupom enviados nas suas mensagens! Aproveite a promo 👀",
      "Dá uma olhada no seu Direct, mandei o achadinho completo por lá ⚡"
    ]
  },
  vip_community: {
    niche: "vip_community",
    title: "Grupos VIP & Transmissão (WhatsApp/Telegram)",
    description: "Foco em convites exclusivos para comunidades e canais fechados.",
    variants: [
      "Seu convite exclusivo pro Grupo VIP acabou de chegar na DM! 🎟️",
      "Te mandei o acesso prioritário no direct, corre pra não perder a vaga! 🚀",
      "Prontinho! Link do grupo e instruções na sua mensagem direta 📲",
      "Confere seu Direct! Acabei de enviar o passe livre pro canal VIP 🔥",
      "Enviado com sucesso! Te espero lá no grupo privado 👀"
    ]
  },
  course_lead: {
    niche: "course_lead",
    title: "Cursos, Guias & Captura de Leads (Hotmart/PLR)",
    description: "Foco em entrega de materiais gratuitos, playbooks em PDF e VSLs.",
    variants: [
      "Acabei de liberar seu material completo lá no Direct! 📚",
      "Te mandei o playbook na sua DM, aproveite o conteúdo! 💡",
      "Prontinho! Dá uma olhada nas suas mensagens diretas pra baixar o guia 🚀",
      "Acesso liberado! Mandei o link da aula diretamente no seu direct 🎓",
      "Confere a sua DM, o PDF exclusivo acabou de ser despachado! ⚡"
    ]
  }
};

/**
 * Cache em memória do último índice utilizado por regra para garantir evasão sem repetição
 */
const lastIndexCache: Map<string, number> = new Map();

/**
 * Normaliza e interpola tokens dinâmicos no texto da resposta pública
 */
export function formatPublicReply(
  template: string, 
  variables: { username?: string; name?: string } = {}
): string {
  if (!template) return "";

  let result = template;
  const username = variables.username 
    ? (variables.username.startsWith("@") ? variables.username : `@${variables.username}`)
    : "";
  const name = variables.name || (username ? username.replace("@", "") : "amigo");

  result = result.replace(/{{username}}/gi, username);
  result = result.replace(/{{nome}}/gi, name);
  result = result.replace(/{{name}}/gi, name);

  return result.trim();
}

/**
 * Calcula a similaridade entre duas strings usando a razão de Levenshtein (0.0 a 1.0)
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 1.0;

  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;

  const dist = calculateLevenshteinDistance(s1, s2);
  return Math.max(0, 1 - (dist / maxLen));
}

/**
 * Validador de Saúde Anti-Spam: analisa o conjunto de variações e emite recomendações
 */
export function validateAntiSpamDiversity(variants: string[]): AntiSpamHealthCheck {
  const safeVariants = Array.isArray(variants) ? variants : [];
  const cleanVariants = safeVariants.map(v => (v || "").trim()).filter(Boolean);
  const count = cleanVariants.length;
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // 1. Verificação de Quantidade
  if (count === 0) {
    return {
      score: 0,
      status: "critical",
      variantCount: 0,
      averageSimilarity: 1.0,
      warnings: ["Nenhuma resposta pública cadastrada. O bot não responderá no post."],
      recommendations: ["Adicione pelo menos 3 a 5 variações distintas para evitar banimento."],
      isSafeToDispatch: false
    };
  }

  if (count === 1) {
    warnings.push("Apenas 1 variação cadastrada. Alto risco de detecção por algoritmos anti-spam da Meta/TikTok.");
    recommendations.push("Adicione mais 4 variações com ganchos e pontuações variadas.");
  } else if (count === 2) {
    warnings.push("Apenas 2 variações cadastradas. Risco moderado de bloqueio por repetição.");
    recommendations.push("Recomendamos o mínimo de 3 a 5 variações para segurança operacional.");
  }

  // 2. Verificação de Similaridade Pareada
  let totalSim = 0;
  let comparisons = 0;
  let highestSim = 0;
  let highestPair: [string, string] | null = null;

  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      const sim = calculateStringSimilarity(cleanVariants[i], cleanVariants[j]);
      totalSim += sim;
      comparisons++;
      if (sim > highestSim) {
        highestSim = sim;
        highestPair = [cleanVariants[i], cleanVariants[j]];
      }
    }
  }

  const avgSimilarity = comparisons > 0 ? Number((totalSim / comparisons).toFixed(2)) : 0;

  if (highestSim > 0.85 && highestPair) {
    warnings.push(`Variações muito semelhantes detectadas (${Math.round(highestSim * 100)}% de similaridade).`);
    recommendations.push(`Diferencie mais as frases (ex: "${highestPair[0].substring(0, 25)}..." vs "${highestPair[1].substring(0, 25)}...").`);
  }

  // 3. Verificação de Emojis e Pontuações
  const hasEmojis = cleanVariants.some(v => /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]/.test(v));
  if (!hasEmojis) {
    recommendations.push("Considere alternar emojis no final das mensagens (ex: 🔥, 🚀, 👀, ⚡) para criar assinaturas únicas.");
  }

  // 4. Cálculo do Score Ponderado (0 - 100)
  // - Quantidade: 5+ variações = 50 pts, 4 = 40 pts, 3 = 30 pts, 2 = 15 pts, 1 = 5 pts
  let qtyPoints = 0;
  if (count >= 5) qtyPoints = 50;
  else if (count === 4) qtyPoints = 40;
  else if (count === 3) qtyPoints = 30;
  else if (count === 2) qtyPoints = 15;
  else qtyPoints = 5;

  // - Diversidade: menor similaridade média gera mais pontos (até 50 pts)
  // Só pontua diversidade se houver pelo menos 2 variações para comparar
  let diversityPoints = 0;
  if (count > 1) {
    const simPenalty = Math.min(50, Math.round(avgSimilarity * 50));
    diversityPoints = Math.max(0, 50 - simPenalty);
  }

  const finalScore = Math.min(100, qtyPoints + diversityPoints);

  let status: AntiSpamHealthCheck["status"] = "critical";
  if (finalScore >= 80) status = "excellent";
  else if (finalScore >= 65) status = "healthy";
  else if (finalScore >= 40) status = "warning";
  else status = "critical";

  const isSafeToDispatch = count >= 3 && finalScore >= 50;

  return {
    score: finalScore,
    status,
    variantCount: count,
    averageSimilarity: avgSimilarity,
    warnings,
    recommendations,
    isSafeToDispatch
  };
}

/**
 * Seleciona a próxima resposta pública respeitando a estratégia anti-repetição
 */
export function getNextPublicReply(
  variants: string[],
  ruleId: string = "default",
  strategy: RotationStrategy = "random_no_repeat"
): { reply: string; selectedIndex: number } {
  const safeVariants = Array.isArray(variants) ? variants : [];
  const cleanVariants = safeVariants.map(v => (v || "").trim()).filter(Boolean);
  if (cleanVariants.length === 0) {
    return { reply: "Te mandei no Direct! Dá uma olhada lá 👀", selectedIndex: -1 };
  }
  if (cleanVariants.length === 1) {
    return { reply: cleanVariants[0], selectedIndex: 0 };
  }

  const lastIndex = lastIndexCache.get(ruleId) ?? -1;

  if (strategy === "round_robin") {
    const nextIdx = (lastIndex + 1) % cleanVariants.length;
    lastIndexCache.set(ruleId, nextIdx);
    return { reply: cleanVariants[nextIdx], selectedIndex: nextIdx };
  }

  if (strategy === "pure_random") {
    const randIdx = Math.floor(Math.random() * cleanVariants.length);
    lastIndexCache.set(ruleId, randIdx);
    return { reply: cleanVariants[randIdx], selectedIndex: randIdx };
  }

  // Estratégia Padrão: random_no_repeat (Sorteia entre todos EXCETO o último utilizado)
  const candidateIndices = cleanVariants
    .map((_, idx) => idx)
    .filter(idx => idx !== lastIndex);

  const chosenIndex = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];
  lastIndexCache.set(ruleId, chosenIndex);

  return { reply: cleanVariants[chosenIndex], selectedIndex: chosenIndex };
}

/**
 * Reseta o histórico de rotação em memória (útil para testes ou limpeza)
 */
export function resetRotationMemory(ruleId?: string): void {
  if (ruleId) {
    lastIndexCache.delete(ruleId);
  } else {
    lastIndexCache.clear();
  }
}
