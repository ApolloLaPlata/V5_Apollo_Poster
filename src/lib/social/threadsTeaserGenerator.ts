/**
 * threadsTeaserGenerator.ts - Gerador Especializado de Teasers para Threads (Meta)
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Gera posts conversacionais com foco em engajamento e diálogo no Threads:
 * - Limite oficial estrito de 500 caracteres
 * - 4 modelos conversacionais (Bastidores / Build in Public, Pergunta Aberta, Hot Take, Mini-História)
 * - 3 modos de CTA (Chamada para a Bio, Link Direto no Post, Link no 1º Comentário)
 * - Formatação limpa de parágrafos e tag de tópico única
 */

import { MultimodalDispatchPayload } from "@/types/poster";
import { slugify } from "@/lib/dispatch/multimodalEngine";
import { formatHashtags, buildSocialUtmUrl } from "./socialTeaserEngine";

export type ThreadsCtaMode = "bio" | "direct_link" | "first_comment";

export type ThreadsToneType = 
  | "build_in_public" 
  | "debate_question" 
  | "hot_take" 
  | "mini_story";

export interface ThreadsToneTemplate {
  type: ThreadsToneType;
  label: string;
  emoji: string;
  opener: (title: string) => string;
  closingQuestion: string;
}

export interface ThreadsTeaserVariant {
  id: string;
  toneType: ThreadsToneType;
  toneLabel: string;
  emoji: string;
  ctaMode: ThreadsCtaMode;
  text: string;
  charCount: number;
  charLimit: number;
  remainingChars: number;
  isWithinLimit: boolean;
  utmUrl: string;
  primaryTopicTag: string;
}

export const THREADS_TONE_TEMPLATES: ThreadsToneTemplate[] = [
  {
    type: "build_in_public",
    label: "Bastidores & Build in Public",
    emoji: "🛠️",
    opener: (title) => `🛠️ Nos bastidores da holding hoje: estivemos aprofundando a arquitetura sobre "${title}".`,
    closingQuestion: "Como você lida com isso na sua esteira de código?"
  },
  {
    type: "debate_question",
    label: "Debate & Pergunta Aberta",
    emoji: "💬",
    opener: (title) => `💬 Uma dúvida sincera para quem constrói software: qual a sua visão real sobre "${title}"?`,
    closingQuestion: "Concorda com essa abordagem ou prefere o método clássico?"
  },
  {
    type: "hot_take",
    label: "Opinião Forte (Hot Take)",
    emoji: "☕",
    opener: (title) => `☕ Opinião que pode soar polêmica, mas precisa ser dita sobre "${title}":`,
    closingQuestion: "Faz sentido para a sua realidade ou você vê de outra forma?"
  },
  {
    type: "mini_story",
    label: "Mini-História & Aprendizado",
    emoji: "📖",
    opener: (title) => `📖 Uma lição técnica valiosa que aprendemos na prática ao implementar "${title}":`,
    closingQuestion: "Já passou por uma situação parecida por aí?"
  }
];

export const THREADS_CTA_TEXTS: Record<ThreadsCtaMode, (url: string) => string> = {
  bio: () => `🔗 O estudo completo e detalhado tá no link da bio.`,
  direct_link: (url: string) => `👉 Para quem quiser ler a íntegra com todos os códigos:\n${url}`,
  first_comment: () => `👇 Deixei o link completo fixado no primeiro comentário para quem quiser salvar.`
};

/**
 * Gera um teaser para Threads calibrado para um determinado tom e modo de CTA
 */
export function generateThreadsVariant(
  payload: MultimodalDispatchPayload,
  tone: ThreadsToneTemplate,
  ctaMode: ThreadsCtaMode = "direct_link"
): ThreadsTeaserVariant {
  const limit = 500;
  const slug = payload.slug || slugify(payload.title);
  const utmUrl = buildSocialUtmUrl(payload.canonical_url || "", slug, "threads");

  // O Threads utiliza no máximo 1 Tag de Tópico principal recomendada
  const tags = formatHashtags(payload.blogOptions.tags, 1);
  const primaryTopicTag = tags[0] || "#Tecnologia";

  // Monta opener conciso
  let titleExcerpt = payload.title;
  if (titleExcerpt.length > 60) {
    titleExcerpt = `${titleExcerpt.substring(0, 57)}...`;
  }
  const opener = tone.opener(titleExcerpt);

  // CTA correspondente
  const ctaLine = THREADS_CTA_TEXTS[ctaMode](utmUrl);

  const summarySource = payload.summary || payload.emailOptions.previewText || "";
  const fixedOverhead = opener.length + tone.closingQuestion.length + ctaLine.length + primaryTopicTag.length + 12;
  const availableForSummary = limit - fixedOverhead;

  let body = "";
  if (availableForSummary > 40 && summarySource) {
    const rawSlice = summarySource.substring(0, availableForSummary - 5);
    const lastSpace = rawSlice.lastIndexOf(" ");
    body = (lastSpace > 25 ? rawSlice.substring(0, lastSpace) : rawSlice).trim() + "...";
  }

  // Monta o texto fluido
  const blocks = [
    opener,
    body,
    tone.closingQuestion,
    ctaLine,
    primaryTopicTag
  ].filter(Boolean);

  let assembled = blocks.join("\n\n");

  // Salvaguarda estrita contra overflow
  if (assembled.length > limit) {
    const blocksWithoutBody = [
      opener,
      tone.closingQuestion,
      ctaLine,
      primaryTopicTag
    ].filter(Boolean);
    assembled = blocksWithoutBody.join("\n\n");
  }

  if (assembled.length > limit) {
    // Caso de emergência com URL
    const emergencyCta = ctaMode === "direct_link" ? `👉 ${utmUrl}` : `🔗 Link na bio.`;
    assembled = `${opener}\n\n${emergencyCta}\n\n${primaryTopicTag}`;
    if (assembled.length > limit) {
      assembled = assembled.substring(0, limit - 3) + "...";
    }
  }

  const charCount = assembled.length;

  return {
    id: `threads-${tone.type}-${ctaMode}`,
    toneType: tone.type,
    toneLabel: tone.label,
    emoji: tone.emoji,
    ctaMode,
    text: assembled,
    charCount,
    charLimit: limit,
    remainingChars: limit - charCount,
    isWithinLimit: charCount <= limit,
    utmUrl,
    primaryTopicTag
  };
}

/**
 * Gera todas as 4 variantes de tom conversacional para o Threads
 */
export function generateAllThreadsVariants(
  payload: MultimodalDispatchPayload,
  ctaMode: ThreadsCtaMode = "direct_link"
): ThreadsTeaserVariant[] {
  return THREADS_TONE_TEMPLATES.map(tmpl => generateThreadsVariant(payload, tmpl, ctaMode));
}
