/**
 * twitterTeaserGenerator.ts - Gerador Especializado de Teasers para X/Twitter
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Gera posts curtos altamente otimizados para viralização e retenção no X/Twitter:
 * - Limite rigoroso de 280 caracteres
 * - Cálculo de peso oficial do Twitter (URLs contam como 23 caracteres via t.co)
 * - 5 modelos de ganchos visuais (Contrarian, Playbook, Curiosidade, Dados e Anúncio Direto)
 * - Emojis de destaque e hashtags semânticas curtas
 * - Geração de múltiplas variantes para teste A/B do operador
 */

import { MultimodalDispatchPayload } from "@/types/poster";
import { slugify } from "@/lib/dispatch/multimodalEngine";
import { formatHashtags, buildSocialUtmUrl } from "./socialTeaserEngine";

export type TwitterHookType = 
  | "contrarian" 
  | "playbook" 
  | "curiosity" 
  | "data_insight" 
  | "direct_announcement";

export interface TwitterHookTemplate {
  type: TwitterHookType;
  label: string;
  emoji: string;
  prefix: (title: string) => string;
  ctaText: string;
}

export interface TwitterTeaserVariant {
  id: string;
  hookType: TwitterHookType;
  hookLabel: string;
  emoji: string;
  text: string;
  rawCharCount: number;
  twitterWeightedCount: number; // Considerando URL = 23 caracteres (t.co)
  isWithinLimit: boolean;
  utmUrl: string;
  hashtags: string[];
}

export const TWITTER_HOOK_TEMPLATES: TwitterHookTemplate[] = [
  {
    type: "curiosity",
    label: "Curiosidade & Segredo",
    emoji: "🧵",
    prefix: (title) => `🧵 A maioria ainda não percebeu isso sobre ${title.toLowerCase()}:`,
    ctaText: "Análise completa no fio/link:"
  },
  {
    type: "playbook",
    label: "Playbook & Passo a Passo",
    emoji: "⚡",
    prefix: (title) => `⚡ Playbook prático: como implementar ${title.toLowerCase()} do zero em produção:`,
    ctaText: "Confira o passo a passo:"
  },
  {
    type: "contrarian",
    label: "Ponto de Vista Contrário",
    emoji: "🔥",
    prefix: (title) => `🔥 Por que métodos tradicionais falham em ${title.toLowerCase()} (e o que fazer no lugar):`,
    ctaText: "Entenda o racional técnico:"
  },
  {
    type: "data_insight",
    label: "Insight de Engenharia",
    emoji: "💡",
    prefix: (title) => `💡 Arquitetura e lições reais de quem colocou em prática: "${title}"`,
    ctaText: "Documentação detalhada:"
  },
  {
    type: "direct_announcement",
    label: "Anúncio Oficial",
    emoji: "🚀",
    prefix: (title) => `🚀 NOVO ARTIGO NA CAPITANIA #13: ${title}`,
    ctaText: "Leia na íntegra:"
  }
];

/**
 * Calcula o peso ponderado do Tweet de acordo com as regras oficiais do Twitter:
 * - URLs contam como 23 caracteres independentemente do comprimento real (encurtador t.co)
 */
export function calculateTwitterWeightedLength(text: string, url: string): number {
  if (!text.includes(url)) {
    return text.length;
  }
  const rawLength = text.length;
  const urlLength = url.length;
  // Substitui o tamanho real da URL por 23 caracteres
  return rawLength - urlLength + 23;
}

/**
 * Gera um único Tweet perfeitamente calibrado para um determinado tipo de gancho
 */
export function generateTwitterVariantForHook(
  payload: MultimodalDispatchPayload,
  template: TwitterHookTemplate,
  customUtmSource = "x_twitter"
): TwitterTeaserVariant {
  const limit = 280;
  const slug = payload.slug || slugify(payload.title);
  const utmUrl = buildSocialUtmUrl(payload.canonical_url || "", slug, "x_twitter");
  
  // Hashtags concisas (máx 2 para não roubar espaço)
  const tags = formatHashtags(payload.blogOptions.tags, 2);
  const hashtagsText = tags.join(" ");

  // Monta o hook inicial calibrando o título se for muito extenso para preservar a frase do gancho
  const rawTitle = payload.title;
  const titleForHook = rawTitle.length > 50 ? `${rawTitle.substring(0, 47)}...` : rawTitle;
  let header = template.prefix(titleForHook);
  if (header.length > 115) {
    header = `${header.substring(0, 112)}...`;
  }

  const ctaWithUrl = `${template.ctaText}\n👉 ${utmUrl}`;
  const summarySource = payload.summary || payload.emailOptions.previewText || "";

  // Verifica espaço disponível usando o peso real do Twitter (URL = 23)
  const fixedLengthWeighted = calculateTwitterWeightedLength(`${header}\n\n${ctaWithUrl}\n\n${hashtagsText}`, utmUrl);
  let availableWeighted = limit - fixedLengthWeighted;

  let body = "";
  if (availableWeighted > 35 && summarySource) {
    const rawSlice = summarySource.substring(0, availableWeighted - 5);
    const lastSpace = rawSlice.lastIndexOf(" ");
    body = (lastSpace > 20 ? rawSlice.substring(0, lastSpace) : rawSlice).trim() + "...";
  }

  // Monta o texto
  let assembled = [header, body, ctaWithUrl, hashtagsText].filter(Boolean).join("\n\n");
  let rawCount = assembled.length;
  let weightedCount = calculateTwitterWeightedLength(assembled, utmUrl);

  // Se mesmo assim estourou o limite ponderado de 280, remove body ou hashtags
  if (weightedCount > limit) {
    assembled = [header, ctaWithUrl, hashtagsText].filter(Boolean).join("\n\n");
    weightedCount = calculateTwitterWeightedLength(assembled, utmUrl);
  }

  if (weightedCount > limit) {
    assembled = [header, ctaWithUrl].filter(Boolean).join("\n\n");
    weightedCount = calculateTwitterWeightedLength(assembled, utmUrl);
  }

  rawCount = assembled.length;

  return {
    id: `tw-variant-${template.type}`,
    hookType: template.type,
    hookLabel: template.label,
    emoji: template.emoji,
    text: assembled,
    rawCharCount: rawCount,
    twitterWeightedCount: weightedCount,
    isWithinLimit: weightedCount <= limit,
    utmUrl,
    hashtags: tags
  };
}

/**
 * Gera todas as variantes disponíveis (5 ganchos estratégicos)
 */
export function generateAllTwitterVariants(
  payload: MultimodalDispatchPayload
): TwitterTeaserVariant[] {
  return TWITTER_HOOK_TEMPLATES.map(tmpl => generateTwitterVariantForHook(payload, tmpl));
}
