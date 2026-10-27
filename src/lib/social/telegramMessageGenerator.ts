/**
 * telegramMessageGenerator.ts - Gerador Especializado de Mensagens para Canais de Telegram
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Gera mensagens ricas em Markdown para Canais VIP, Grupos e Bots do Telegram:
 * - Formatação Markdown oficial: *negrito*, _itálico_, `código inline`, ||spoiler||
 * - Hiperlinks embutidos [Texto Âncora](url) sem poluição visual no feed
 * - 3 formatos estratégicos: Broadcast Digest, Alerta VIP e Deep Dive Técnico
 * - Botão inline interativo simulado (InlineKeyboardMarkup do Telegram Bot API)
 * - Rastreamento por UTMs dedicadas para o Telegram (canal público, VIP ou bot)
 * - Deep-link oficial de compartilhamento via t.me/share
 */

import { MultimodalDispatchPayload } from "@/types/poster";
import { slugify } from "@/lib/dispatch/multimodalEngine";
import { extractBulletPoints, buildSocialUtmUrl, formatHashtags, SOCIAL_CHAR_LIMITS } from "./socialTeaserEngine";

export type TelegramMessageFormat = "broadcast_digest" | "vip_alert" | "technical_deepdive";
export type TelegramChannelType = "public_channel" | "vip_channel" | "announcements";
export type TelegramLinkMode = "embedded_anchor" | "inline_button" | "both";

export interface TelegramFormatTemplate {
  format: TelegramMessageFormat;
  label: string;
  emoji: string;
  badge: string;
  headerPrefix: string;
  ctaAnchorText: string;
  footerSign: string;
}

export interface TelegramChannelConfig {
  type: TelegramChannelType;
  label: string;
  channelHandle: string;
  utmMedium: string;
}

export interface TelegramMessageOptions {
  format?: TelegramMessageFormat;
  channelType?: TelegramChannelType;
  linkMode?: TelegramLinkMode;
  includeBullets?: boolean;
  includeHashtags?: boolean;
  includeSpoiler?: boolean;
  customHeader?: string;
  customCta?: string;
}

export interface TelegramInlineButton {
  text: string;
  url: string;
}

export interface TelegramMessageResult {
  format: TelegramMessageFormat;
  formatLabel: string;
  emoji: string;
  channelType: TelegramChannelType;
  channelLabel: string;
  channelHandle: string;
  text: string;
  charCount: number;
  charLimit: number;
  mediaCaptionLimit: number;
  remainingChars: number;
  isWithinLimit: boolean;
  isWithinMediaLimit: boolean;
  isSweetSpot: boolean;
  bulletPoints: string[];
  utmUrl: string;
  inlineButton: TelegramInlineButton;
  encodedShareUrl: string;
  hashtags: string[];
}

export const TELEGRAM_FORMAT_TEMPLATES: Record<TelegramMessageFormat, TelegramFormatTemplate> = {
  broadcast_digest: {
    format: "broadcast_digest",
    label: "Broadcast Digest",
    emoji: "📢",
    badge: "Completo & Estilizado",
    headerPrefix: "📢 *V5 APOLLO DIGEST* |",
    ctaAnchorText: "👉 Ler Análise Técnica Completa no AutoBlog",
    footerSign: "📡 *Transmissão Oficial* • Capitania #13 Poster"
  },
  vip_alert: {
    format: "vip_alert",
    label: "Alerta VIP",
    emoji: "⚡",
    badge: "Urgente com Spoiler",
    headerPrefix: "⚡ *ALERTA EXCLUSIVO CANAL VIP* ||NOVO ARTIGO LIBERADO||",
    ctaAnchorText: "🚀 Acessar Estudo Técnico Sem Paywall",
    footerSign: "💎 *Canal Fechado de Engenharia* • V5 Apollo Holding"
  },
  technical_deepdive: {
    format: "technical_deepdive",
    label: "Deep Dive Técnico",
    emoji: "🔬",
    badge: "Curadoria & Código",
    headerPrefix: "🔬 *DEEP DIVE DE ENGENHARIA*",
    ctaAnchorText: "📚 Acessar Repositório e Especificação Completa",
    footerSign: "⚡ *V5 Architecture Guild* • Build in Public"
  }
};

export const TELEGRAM_CHANNEL_CONFIGS: Record<TelegramChannelType, TelegramChannelConfig> = {
  public_channel: {
    type: "public_channel",
    label: "Canal Público Oficial",
    channelHandle: "@v5apollo_official",
    utmMedium: "telegram_public_channel"
  },
  vip_channel: {
    type: "vip_channel",
    label: "Canal VIP / Holding",
    channelHandle: "@v5apollo_vip",
    utmMedium: "telegram_vip_channel"
  },
  announcements: {
    type: "announcements",
    label: "Mural de Atualizações",
    channelHandle: "@v5apollo_updates",
    utmMedium: "telegram_announcements"
  }
};

/**
 * Converte e sanitiza formatação de texto para Markdown compatível com Telegram
 * - Garante que links [texto](url) estejam íntegros
 * - Converte <b>/<strong> para *negrito*
 * - Converte <i>/<em> para _itálico_
 * - Converte <code> para `inline code`
 * - Balanceia delimitadores para evitar erros na Telegram Bot API
 */
export function toTelegramMarkdown(text: string): string {
  if (!text) return "";

  let formatted = text
    // Converte tags HTML comuns para Markdown do Telegram
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "*$1*")
    .replace(/<b[^>]*>(.*?)<\/b>/gi, "*$1*")
    .replace(/<em[^>]*>(.*?)<\/em>/gi, "_$1_")
    .replace(/<i[^>]*>(.*?)<\/i>/gi, "_$1_")
    .replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`")
    .replace(/<a\s+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, "[$2]($1)")
    .replace(/<\/?[^>]+(>|$)/g, "")
    // Converte negrito duplo **texto** para negrito padrão Telegram *texto*
    .replace(/\*\*(.*?)\*\*/g, "*$1*")
    // Converte headers ### Título -> *Título*
    .replace(/^#{1,6}\s+(.+)$/gm, "*$1*")
    .replace(/[ \t]+/g, " ");

  // Preserva blocos de código inline temporariamente para não corromper delimitadores internos
  const codeBlocks: string[] = [];
  formatted = formatted.replace(/`([^`]+)`/g, (_, code) => {
    codeBlocks.push(code);
    return `__TG_CODE_${codeBlocks.length - 1}__`;
  });

  // Balanceamento básico de asteriscos
  const asteriskCount = (formatted.match(/\*/g) || []).length;
  if (asteriskCount % 2 !== 0) {
    const lastIndex = formatted.lastIndexOf("*");
    formatted = formatted.substring(0, lastIndex) + formatted.substring(lastIndex + 1);
  }

  // Balanceamento de underscores fora de código inline
  const underscoreCount = (formatted.match(/_/g) || []).length;
  if (underscoreCount % 2 !== 0) {
    const lastIndex = formatted.lastIndexOf("_");
    formatted = formatted.substring(0, lastIndex) + formatted.substring(lastIndex + 1);
  }

  // Restaura blocos de código inline intactos
  codeBlocks.forEach((code, idx) => {
    formatted = formatted.replace(`__TG_CODE_${idx}__`, `\`${code}\``);
  });

  return formatted.trim();
}

/**
 * Gera bullets estilizados para o Telegram com símbolos refinados
 */
export function formatTelegramBullets(bullets: string[], format: TelegramMessageFormat = "broadcast_digest"): string {
  if (!bullets || bullets.length === 0) return "";
  
  const icon = format === "technical_deepdive" ? "▫️" : format === "vip_alert" ? "⚡" : "🔹";
  return bullets
    .map(b => `${icon} *${toTelegramMarkdown(b)}*`)
    .join("\n");
}

/**
 * Constrói a URL de compartilhamento nativo do Telegram (t.me/share)
 */
export function buildTelegramShareUrl(url: string, text: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

/**
 * Gera a mensagem especializada para o Telegram com Markdown e Link Embutido
 */
export function generateTelegramMessageVariant(
  payload: MultimodalDispatchPayload,
  options: TelegramMessageOptions = {}
): TelegramMessageResult {
  const format = options.format || "broadcast_digest";
  const channelType = options.channelType || "public_channel";
  const linkMode = options.linkMode || "embedded_anchor";
  const includeBullets = options.includeBullets !== false;
  const includeHashtags = options.includeHashtags !== false;

  const template = TELEGRAM_FORMAT_TEMPLATES[format] || TELEGRAM_FORMAT_TEMPLATES.broadcast_digest;
  const channelConfig = TELEGRAM_CHANNEL_CONFIGS[channelType] || TELEGRAM_CHANNEL_CONFIGS.public_channel;

  const limit = SOCIAL_CHAR_LIMITS.telegram; // 4.096 caracteres
  const mediaLimit = 1024; // Limite se enviado com foto/mídia
  const slug = payload.slug || slugify(payload.title);
  const utmUrl = buildSocialUtmUrl(payload.canonical_url || "", slug, "telegram", channelConfig.utmMedium);

  // 1. Cabeçalho Oficial
  const categoryTag = payload.blogOptions?.category ? ` *${payload.blogOptions.category.toUpperCase()}*` : "";
  let header = options.customHeader;
  if (!header) {
    if (format === "broadcast_digest") {
      header = `${template.headerPrefix}${categoryTag}`;
    } else {
      header = template.headerPrefix;
    }
  }

  // 2. Título do Artigo
  const titleClean = toTelegramMarkdown(payload.title.trim());
  const titleBlock = `*${titleClean}*`;

  // 3. Resumo / Lead do Artigo em Itálico
  const rawSummary = payload.summary || payload.emailOptions?.previewText || "";
  const summaryClean = toTelegramMarkdown(rawSummary);
  const summaryBlock = summaryClean ? `_${summaryClean}_` : "";

  // 4. Bullets de Destaque
  const bullets = extractBulletPoints(payload.contentMarkdown, 3);
  const bulletsFormatted = formatTelegramBullets(bullets, format);
  const bulletsSection = bulletsFormatted 
    ? `🎯 *Pontos Centrais da Publicação:*\n${bulletsFormatted}`
    : "";

  // 5. Chamada de Ação (CTA) com Link Embutido (Markdown [texto](url))
  const anchorText = options.customCta || template.ctaAnchorText;
  let ctaSection = "";
  if (linkMode === "embedded_anchor" || linkMode === "both") {
    ctaSection = `🔗 [${anchorText}](${utmUrl})`;
  }
  if (linkMode === "both") {
    ctaSection += `\n🌐 Link direto: \`${utmUrl}\``;
  }

  // 6. Hashtags & Assinatura de Canal
  const tags = formatHashtags(payload.blogOptions?.tags, 4);
  const hashtagsLine = includeHashtags && tags.length > 0 ? tags.join(" ") : "";
  const footerSection = `${template.footerSign}\n${channelConfig.channelHandle} ${hashtagsLine}`.trim();

  // Montagem dos blocos
  const blocks: string[] = [header, titleBlock];
  if (summaryBlock) blocks.push(summaryBlock);
  if (includeBullets && bulletsSection) blocks.push(bulletsSection);
  if (ctaSection) blocks.push(ctaSection);
  if (footerSection) blocks.push(footerSection);

  let fullText = blocks.join("\n\n");

  // Salvaguarda: Ajuste de truncamento caso exceda 4.096 caracteres
  if (fullText.length > limit) {
    const bulletsLen = (includeBullets && bulletsSection) ? bulletsSection.length + 20 : 0;
    const fixedLength = header.length + titleBlock.length + ctaSection.length + footerSection.length + bulletsLen + 150;
    const availableForSummary = Math.max(80, limit - fixedLength);
    const trimmedSummary = summaryClean.substring(0, availableForSummary) + "...";
    
    const trimmedBlocks = [header, titleBlock, `_${trimmedSummary}_`];
    if (includeBullets && bulletsSection) trimmedBlocks.push(bulletsSection);
    if (ctaSection) trimmedBlocks.push(ctaSection);
    if (footerSection) trimmedBlocks.push(footerSection);
    fullText = trimmedBlocks.join("\n\n");

    // Salvaguarda matemática estrita final se ainda exceder
    if (fullText.length > limit) {
      const excess = fullText.length - limit + 10;
      const saferSummary = summaryClean.substring(0, Math.max(30, availableForSummary - excess)) + "...";
      trimmedBlocks[2] = `_${saferSummary}_`;
      fullText = trimmedBlocks.join("\n\n");
    }
  }

  const charCount = fullText.length;
  const isWithinLimit = charCount <= limit;
  const isWithinMediaLimit = charCount <= mediaLimit;
  // Sweet spot do Telegram: entre 300 e 1.200 caracteres (profundo porém escaneável)
  const isSweetSpot = charCount >= 300 && charCount <= 1200;

  return {
    format,
    formatLabel: template.label,
    emoji: template.emoji,
    channelType,
    channelLabel: channelConfig.label,
    channelHandle: channelConfig.channelHandle,
    text: fullText,
    charCount,
    charLimit: limit,
    mediaCaptionLimit: mediaLimit,
    remainingChars: limit - charCount,
    isWithinLimit,
    isWithinMediaLimit,
    isSweetSpot,
    bulletPoints: bullets,
    utmUrl,
    inlineButton: {
      text: "📖 Ler no V5 AutoBlog ↗",
      url: utmUrl
    },
    encodedShareUrl: buildTelegramShareUrl(utmUrl, fullText),
    hashtags: tags
  };
}

/**
 * Gera todas as variações para o Telegram simultaneamente
 */
export function generateAllTelegramVariants(
  payload: MultimodalDispatchPayload,
  channelType: TelegramChannelType = "public_channel"
): Record<TelegramMessageFormat, TelegramMessageResult> {
  return {
    broadcast_digest: generateTelegramMessageVariant(payload, { format: "broadcast_digest", channelType }),
    vip_alert: generateTelegramMessageVariant(payload, { format: "vip_alert", channelType }),
    technical_deepdive: generateTelegramMessageVariant(payload, { format: "technical_deepdive", channelType })
  };
}
