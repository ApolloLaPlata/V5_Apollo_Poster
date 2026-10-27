/**
 * instagramCaptionGenerator.ts - Gerador Especializado de Legendas para Instagram
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Gera legendas de alta conversão para o feed e reels do Instagram:
 * - Parágrafos espaçados com separadores limpos contra colapso de texto
 * - Gancho de primeira linha otimizado para não ser cortado antes do "...mais"
 * - Integração nativa com Comment-to-DM (palavras-chave rotativas "LINK", "QUERO", etc.)
 * - Cluster de hashtags estratégicas divididas por Nicho, Indústria e Marca
 * - 3 formatos editoriais: Carrossel Educativo, Reels Viral e Estudo de Caso
 */

import { MultimodalDispatchPayload } from "@/types/poster";
import { slugify } from "@/lib/dispatch/multimodalEngine";
import { formatHashtags, extractBulletPoints, buildSocialUtmUrl } from "./socialTeaserEngine";

export type InstagramPostFormat = "carousel" | "reels" | "case_study";

export interface InstagramFormatTemplate {
  format: InstagramPostFormat;
  label: string;
  emoji: string;
  hookPrefix: (title: string) => string;
  actionCall: (keyword: string) => string;
  saveCall: string;
}

export interface InstagramHashtagCluster {
  nicheTags: string[];
  industryTags: string[];
  brandTags: string[];
  allTags: string[];
  formattedString: string;
  count: number;
}

export interface InstagramCaptionResult {
  format: InstagramPostFormat;
  formatLabel: string;
  captionText: string;
  firstLineHook: string;
  commentKeyword: string;
  charCount: number;
  charLimit: number; // 2200
  isWithinLimit: boolean;
  hashtagCluster: InstagramHashtagCluster;
  utmUrl: string;
}

export const INSTAGRAM_FORMAT_TEMPLATES: InstagramFormatTemplate[] = [
  {
    format: "carousel",
    label: "Carrossel Educativo",
    emoji: "📑",
    hookPrefix: (title) => `🔥 ARRASTA PRO LADO: ${title.toUpperCase()}`,
    actionCall: (keyword) => `💬 Comente "${keyword}" que o nosso robô envia o artigo completo com todas as referências no seu Direct na mesma hora!`,
    saveCall: "💾 Salve este carrossel para consultar na sua próxima implementação."
  },
  {
    format: "reels",
    label: "Reels / Vídeo Curto",
    emoji: "🎬",
    hookPrefix: (title) => `⚡ Você precisa entender isso antes de construir: ${title}`,
    actionCall: (keyword) => `👇 Quer o playbook prático? Comente "${keyword}" que te mando o link exclusivo por mensagem direta!`,
    saveCall: "🚀 Compartilhe com quem precisa ver isso hoje."
  },
  {
    format: "case_study",
    label: "Estudo de Caso & Bastidores",
    emoji: "🔬",
    hookPrefix: (title) => `🛠️ BASTIDORES DA HOLDING: Como implementamos "${title}"`,
    actionCall: (keyword) => `💬 Quer ter acesso aos diagramas e código-fonte? Comente "${keyword}" aqui embaixo!`,
    saveCall: "📌 Salve este post para rever as decisões de arquitetura mais tarde."
  }
];

export const COMMENT_KEYWORDS = ["LINK", "QUERO", "GUIA", "POSTER", "AUTONOMO", "AULA"];

/**
 * Monta o cluster estratégico de hashtags dividido em Nicho, Indústria e Marca
 */
export function buildInstagramHashtagCluster(
  tags: string[] = [],
  category = "Tecnologia"
): InstagramHashtagCluster {
  // 1. Tags de Marca / Holding
  const brandTags = ["#V5Apollo", "#V5Poster", "#Capitania13"];

  // 2. Tags de Indústria / Categoria
  const industryTags = formatHashtags([category, "Tecnologia", "Inovacao", "SaaS", "Automacao"], 4);

  // 3. Tags de Nicho / Artigo
  const nicheTags = formatHashtags(tags, 6);

  // Junta e remove duplicatas mantendo a ordem
  const combinedSet = new Set<string>();
  [...nicheTags, ...industryTags, ...brandTags].forEach(t => combinedSet.add(t));
  const allTags = Array.from(combinedSet).slice(0, 15); // Máximo seguro de 15 hashtags

  const formattedString = allTags.join(" ");

  return {
    nicheTags,
    industryTags,
    brandTags,
    allTags,
    formattedString,
    count: allTags.length
  };
}

/**
 * Gera a legenda completa e formatada com espaçamento anti-collapse para o Instagram
 */
export function generateInstagramCaptionFormatted(
  payload: MultimodalDispatchPayload,
  format: InstagramPostFormat = "carousel",
  commentKeyword = "LINK"
): InstagramCaptionResult {
  const limit = 2200;
  const slug = payload.slug || slugify(payload.title);
  const utmUrl = buildSocialUtmUrl(payload.canonical_url || "", slug, "instagram");

  const template = INSTAGRAM_FORMAT_TEMPLATES.find(t => t.format === format) || INSTAGRAM_FORMAT_TEMPLATES[0];

  const firstLineHook = template.hookPrefix(payload.title);
  const summaryText = payload.summary || payload.emailOptions.previewText || "";
  const bullets = extractBulletPoints(payload.contentMarkdown, 4);

  const bulletSection = bullets.map(b => `✓ ${b}`).join("\n");
  const hashtagCluster = buildInstagramHashtagCluster(payload.blogOptions.tags, payload.blogOptions.category);

  // Montagem com separadores limpos de linha (.) para impedir que o Instagram colapse o espaçamento
  const paragraphs = [
    firstLineHook,
    ".",
    summaryText,
    ".",
    "📌 O QUE VOCÊ VAI DESCOBRIR NESTE CONTEÚDO:\n" + bulletSection,
    ".",
    template.saveCall,
    ".",
    template.actionCall(commentKeyword),
    ".",
    hashtagCluster.formattedString
  ];

  let fullCaption = paragraphs.join("\n");

  // Se exceder 2200 caracteres, trunca o resumo preservando o CTA e as hashtags
  if (fullCaption.length > limit) {
    const overhead = fullCaption.length - summaryText.length;
    const allowedSummary = Math.max(80, limit - overhead - 20);
    const trimmedSummary = summaryText.substring(0, allowedSummary).trim() + "...";
    
    paragraphs[2] = trimmedSummary;
    fullCaption = paragraphs.join("\n");
  }

  const charCount = fullCaption.length;

  return {
    format: template.format,
    formatLabel: template.label,
    captionText: fullCaption,
    firstLineHook,
    commentKeyword,
    charCount,
    charLimit: limit,
    isWithinLimit: charCount <= limit,
    hashtagCluster,
    utmUrl
  };
}
