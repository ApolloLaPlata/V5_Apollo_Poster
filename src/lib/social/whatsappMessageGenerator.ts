/**
 * whatsappMessageGenerator.ts - Gerador Especializado de Mensagens para WhatsApp
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Gera mensagens curtas de alta conversão para Grupos, Comunidades VIP e Canais do WhatsApp:
 * - Formatação nativa de WhatsApp: asteriscos simples *negrito* (sem **markdown duplo)
 * - 3 formatos estratégicos: Alerta Rápido, Resumo Executivo e Comunidade VIP
 * - Seção de bullet points estilizados com emojis e termos em destaque
 * - CTA direto com link e UTM de rastreamento por tipo de canal
 * - Cálculo rigoroso de caracteres com Sweet Spot de leitura (250 a 650 caracteres)
 * - Geração de deep-link de despacho rápido via wa.me / web.whatsapp.com
 */

import { MultimodalDispatchPayload } from "@/types/poster";
import { slugify } from "@/lib/dispatch/multimodalEngine";
import { extractBulletPoints, buildSocialUtmUrl, SOCIAL_CHAR_LIMITS } from "./socialTeaserEngine";

export type WhatsAppMessageFormat = "alert" | "playbook" | "community_vip";
export type WhatsAppDestinationType = "group" | "vip_community" | "broadcast_channel";

export interface WhatsAppFormatTemplate {
  format: WhatsAppMessageFormat;
  label: string;
  emoji: string;
  badge: string;
  headerPrefix: string;
  ctaText: string;
  footerText: string;
}

export interface WhatsAppDestinationConfig {
  type: WhatsAppDestinationType;
  label: string;
  utmMedium: string;
  defaultFooter: string;
}

export interface WhatsAppMessageOptions {
  format?: WhatsAppMessageFormat;
  destination?: WhatsAppDestinationType;
  includeBullets?: boolean;
  includeFooter?: boolean;
  customHeader?: string;
  customCta?: string;
}

export interface WhatsAppMessageResult {
  format: WhatsAppMessageFormat;
  formatLabel: string;
  emoji: string;
  destination: WhatsAppDestinationType;
  destinationLabel: string;
  text: string;
  charCount: number;
  charLimit: number;
  remainingChars: number;
  isWithinLimit: boolean;
  isSweetSpot: boolean;
  bulletPoints: string[];
  utmUrl: string;
  encodedWhatsAppUrl: string;
}

export const WHATSAPP_FORMAT_TEMPLATES: Record<WhatsAppMessageFormat, WhatsAppFormatTemplate> = {
  alert: {
    format: "alert",
    label: "Alerta Rápido",
    emoji: "🚨",
    badge: "Urgente & Direto",
    headerPrefix: "🚨 *ALERTA V5 APOLLO:*",
    ctaText: "👉 *Acesse agora antes de sair do ar:*",
    footerText: "⚡ _Tempo de leitura estimado: 3 min_"
  },
  playbook: {
    format: "playbook",
    label: "Resumo Executivo",
    emoji: "📋",
    badge: "Destaques & Bullets",
    headerPrefix: "📋 *RESUMO EXECUTIVO:*",
    ctaText: "👉 *Leia a análise técnica na íntegra:*",
    footerText: "📢 _Compartilhe este insight com sua equipe de engenharia._"
  },
  community_vip: {
    format: "community_vip",
    label: "Comunidade VIP",
    emoji: "💎",
    badge: "Exclusivo VIP",
    headerPrefix: "💎 *MEMBROS VIP & NETWORKING:*",
    ctaText: "👉 *Link direto exclusivo para a comunidade:*",
    footerText: "💬 _O que acharam dessa estratégia? Deixem suas opiniões aqui no grupo!_"
  }
};

export const WHATSAPP_DESTINATION_CONFIGS: Record<WhatsAppDestinationType, WhatsAppDestinationConfig> = {
  group: {
    type: "group",
    label: "Grupo de WhatsApp",
    utmMedium: "whatsapp_group",
    defaultFooter: "📢 _Compartilhe com seu grupo ou equipe!_"
  },
  vip_community: {
    type: "vip_community",
    label: "Comunidade VIP",
    utmMedium: "whatsapp_vip_community",
    defaultFooter: "💎 _Conteúdo reservado aos membros da holding._"
  },
  broadcast_channel: {
    type: "broadcast_channel",
    label: "Canal Oficial de Transmissão",
    utmMedium: "whatsapp_channel",
    defaultFooter: "🔔 _Ative as notificações para receber atualizações instantâneas._"
  }
};

/**
 * Converte Markdown genérico para formatação nativa e segura do WhatsApp
 * - Substitui **texto** por *texto*
 * - Substitui <b>/<strong> por *texto*
 * - Converte headers markdown (ex: ### Título) em *Título*
 * - Remove tags HTML residuais
 * - Trata asteriscos desbalanceados
 */
export function toWhatsAppFormatting(text: string): string {
  if (!text) return "";

  let formatted = text
    // Remove tags HTML como <b>, <strong>, <i>, <em>, <p>, etc.
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "*$1*")
    .replace(/<b[^>]*>(.*?)<\/b>/gi, "*$1*")
    .replace(/<em[^>]*>(.*?)<\/em>/gi, "_$1_")
    .replace(/<i[^>]*>(.*?)<\/i>/gi, "_$1_")
    .replace(/<\/?[^>]+(>|$)/g, "")
    // Converte Markdown bold duplo **texto** para negrito simples de WhatsApp *texto*
    .replace(/\*\*(.*?)\*\*/g, "*$1*")
    // Converte headers markdown: # Título -> *TÍTULO*
    .replace(/^#{1,6}\s+(.+)$/gm, "*$1*")
    // Remove múltiplos espaços em branco mantendo quebras de linha
    .replace(/[ \t]+/g, " ");

  // Validação de asteriscos balanceados para evitar texto quebrado
  const asteriskCount = (formatted.match(/\*/g) || []).length;
  if (asteriskCount % 2 !== 0) {
    // Se ímpar, remove o último asterisco órfão
    const lastIndex = formatted.lastIndexOf("*");
    formatted = formatted.substring(0, lastIndex) + formatted.substring(lastIndex + 1);
  }

  return formatted.trim();
}

/**
 * Monta os bullet points estruturados no padrão de lista do WhatsApp
 */
export function formatWhatsAppBullets(bullets: string[]): string {
  if (!bullets || bullets.length === 0) return "";
  const icons = ["⚡", "📌", "💡", "👉"];
  return bullets
    .map((bullet, idx) => {
      const icon = icons[idx % icons.length];
      const cleanBullet = toWhatsAppFormatting(bullet);
      return `${icon} *${cleanBullet}*`;
    })
    .join("\n");
}

/**
 * Construtor da URL de compartilhamento direto no WhatsApp (wa.me)
 */
export function buildWhatsAppShareUrl(text: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

/**
 * Gera uma mensagem curta estruturada para Grupos e Comunidades de WhatsApp
 */
export function generateWhatsAppMessageVariant(
  payload: MultimodalDispatchPayload,
  options: WhatsAppMessageOptions = {}
): WhatsAppMessageResult {
  const format = options.format || "playbook";
  const destination = options.destination || "group";
  const template = WHATSAPP_FORMAT_TEMPLATES[format] || WHATSAPP_FORMAT_TEMPLATES.playbook;
  const destConfig = WHATSAPP_DESTINATION_CONFIGS[destination] || WHATSAPP_DESTINATION_CONFIGS.group;
  const includeBullets = options.includeBullets !== false;
  const includeFooter = options.includeFooter !== false;

  const limit = SOCIAL_CHAR_LIMITS.whatsapp; // 1.024 caracteres
  const slug = payload.slug || slugify(payload.title);
  const utmUrl = buildSocialUtmUrl(payload.canonical_url || "", slug, "whatsapp", destConfig.utmMedium);

  // 1. Cabeçalho com Negrito do WhatsApp
  const rawTitle = payload.title.trim();
  const titleClean = toWhatsAppFormatting(rawTitle);
  const header = options.customHeader || `${template.headerPrefix} *${titleClean.toUpperCase()}*`;

  // 2. Resumo ou Lead do Artigo
  const rawSummary = payload.summary || payload.emailOptions?.previewText || "";
  const summaryClean = toWhatsAppFormatting(rawSummary);

  // 3. Bullets de Destaque
  const bullets = extractBulletPoints(payload.contentMarkdown, 3);
  const bulletsFormatted = formatWhatsAppBullets(bullets);

  // 4. Seção de Chamada para Ação (CTA)
  const ctaLine = options.customCta || template.ctaText;
  const linkSection = `${ctaLine}\n🔗 ${utmUrl}`;

  // 5. Rodapé Informativo / Grupo
  const footerLine = template.footerText || destConfig.defaultFooter;

  // Montagem preliminar dos blocos
  const blocks: string[] = [header];

  if (summaryClean) {
    blocks.push(summaryClean);
  }

  if (includeBullets && bulletsFormatted) {
    blocks.push(`⚡ *Destaques da Análise:*\n${bulletsFormatted}`);
  }

  blocks.push(linkSection);

  if (includeFooter && footerLine) {
    blocks.push(footerLine);
  }

  let fullText = blocks.join("\n\n");

  // Salvaguarda: Ajuste de truncamento se ultrapassar o limite estrito de 1.024 caracteres
  if (fullText.length > limit) {
    // Reduz primeiro o resumo, preservando header, bullets e link
    const fixedPartLength = header.length + (bulletsFormatted ? bulletsFormatted.length + 30 : 0) + linkSection.length + (footerLine ? footerLine.length + 10 : 0) + 50;
    const availableForSummary = Math.max(80, limit - fixedPartLength);
    
    let trimmedSummary = summaryClean.substring(0, availableForSummary);
    const lastSpace = trimmedSummary.lastIndexOf(" ");
    if (lastSpace > 40) {
      trimmedSummary = trimmedSummary.substring(0, lastSpace) + "...";
    }

    const trimmedBlocks = [header];
    if (trimmedSummary) trimmedBlocks.push(trimmedSummary);
    if (includeBullets && bulletsFormatted) trimmedBlocks.push(`⚡ *Destaques da Análise:*\n${bulletsFormatted}`);
    trimmedBlocks.push(linkSection);
    if (includeFooter && footerLine) trimmedBlocks.push(footerLine);

    fullText = trimmedBlocks.join("\n\n");

    // Se ainda ultrapassar (título monstruoso), trunca o total respeitando o link
    if (fullText.length > limit) {
      const reserve = linkSection.length + 30;
      fullText = `${header.substring(0, 180)}...\n\n${linkSection}`;
    }
  }

  const charCount = fullText.length;
  const isWithinLimit = charCount <= limit;
  // Sweet spot ideal para mensagens de WhatsApp: entre 200 e 800 caracteres (escaneável no mobile)
  const isSweetSpot = charCount >= 200 && charCount <= 800;

  return {
    format,
    formatLabel: template.label,
    emoji: template.emoji,
    destination,
    destinationLabel: destConfig.label,
    text: fullText,
    charCount,
    charLimit: limit,
    remainingChars: limit - charCount,
    isWithinLimit,
    isSweetSpot,
    bulletPoints: bullets,
    utmUrl,
    encodedWhatsAppUrl: buildWhatsAppShareUrl(fullText)
  };
}

/**
 * Gera todas as variações de formato para o WhatsApp simultaneamente
 */
export function generateAllWhatsAppVariants(
  payload: MultimodalDispatchPayload,
  destination: WhatsAppDestinationType = "group"
): Record<WhatsAppMessageFormat, WhatsAppMessageResult> {
  return {
    alert: generateWhatsAppMessageVariant(payload, { format: "alert", destination }),
    playbook: generateWhatsAppMessageVariant(payload, { format: "playbook", destination }),
    community_vip: generateWhatsAppMessageVariant(payload, { format: "community_vip", destination })
  };
}
