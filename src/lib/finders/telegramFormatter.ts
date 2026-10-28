/**
 * telegramFormatter.ts - Compilador de Formatação Especial de Ofertas para Telegram
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Suporte a Formatação Rica Oficial do Telegram Bot API:
 * - parse_mode: "HTML" (<s>tachado</s>, <b>negrito</b>, <code>cupom copiado em 1 toque</code>, <a href="...">links</a>)
 * - parse_mode: "MarkdownV2" (~tachado~, *negrito*, `cupom`, [links](url))
 * - Escapamento rigoroso de entidades para evasão de erro 400 Bad Request
 * - Validação de limite estrito de legenda de foto (1024 caracteres) e mensagem (4096 caracteres)
 */

import { GroupBroadcastDeal } from "@/types/poster";
import { SUPPORTED_STORES, SupportedStore } from "./storeConnector";

export interface TelegramFormatOptions {
  includeCoupon?: boolean;
  includeSavings?: boolean;
  includeStoreBadge?: boolean;
  includeDisclaimer?: boolean;
  customCallToAction?: string;
  customAffiliateUrl?: string;
  footerTag?: string;
}

export const TELEGRAM_MAX_CAPTION_CHARS = 1024;
export const TELEGRAM_MAX_MESSAGE_CHARS = 4096;

/**
 * Escapa caracteres reservados em HTML para o Telegram Bot API
 * Requer escapamento de: &, <, >
 */
export function escapeTelegramHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Escapa caracteres reservados do Telegram MarkdownV2:
 * _, *, [, ], (, ), ~, `, >, #, +, -, =, |, {, }, ., !
 */
export function escapeTelegramMarkdownV2(text: string): string {
  if (!text) return "";
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

/**
 * Formata valor monetário no padrão brasileiro R$ 0,00
 */
export function formatCurrencyBr(value: number): string {
  const safe = Number.isFinite(value) ? Number(value) : 0;
  return safe.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Compila a mensagem promocional de oferta em formato HTML oficial do Telegram
 * Padrão V5 Finders VIP Hub:
 * 🔥 [NOME DO PRODUTO]
 * 🏬 Loja: [STORE] ([BADGE])
 * <s>De: R$ 1.299,90</s>
 * 💥 Por: R$ 749,00 (42% OFF)
 * 🏷️ Cupom: [CUPOM] (Toque no código para copiar)
 * 🛒 Compre aqui: [LINK]
 */
export function compileTelegramHtmlMessage(
  deal: GroupBroadcastDeal,
  options: TelegramFormatOptions = {}
): string {
  const {
    includeCoupon = true,
    includeSavings = true,
    includeStoreBadge = true,
    includeDisclaimer = true,
    customCallToAction = "Compre aqui com desconto",
    footerTag = "#AchadinhoVIP"
  } = options;

  const safeDeal = deal || ({} as GroupBroadcastDeal);
  const storeName = safeDeal.store || "Shopee";
  const storeMeta = SUPPORTED_STORES[storeName as SupportedStore] || SUPPORTED_STORES.Shopee;
  const escapedTitle = escapeTelegramHtml((safeDeal.productName || "").trim());
  const origPrice = Number.isFinite(safeDeal.originalPrice) ? safeDeal.originalPrice : 0;
  const promoPrice = Number.isFinite(safeDeal.promoPrice) ? safeDeal.promoPrice : 0;
  const origPriceFormatted = formatCurrencyBr(origPrice);
  const promoPriceFormatted = formatCurrencyBr(promoPrice);
  const savingsAmount = safeDeal.savingsAmount ?? Math.max(0, origPrice - promoPrice);
  const savingsFormatted = formatCurrencyBr(savingsAmount);

  const lines: string[] = [];

  // 1. Título Impactante com Fogo
  lines.push(`🔥 <b>${escapedTitle}</b>\n`);

  // 2. Loja e Badge Oficial
  if (includeStoreBadge) {
    lines.push(`🏬 <b>Loja:</b> ${escapeTelegramHtml(storeName)} <i>(${escapeTelegramHtml(storeMeta.badgeText)})</i>`);
  } else {
    lines.push(`🏬 <b>Loja:</b> ${escapeTelegramHtml(storeName)}`);
  }

  // 3. Preço Original Tachado e Preço Promocional em Destaque
  lines.push(`❌ <s>De: R$ ${origPriceFormatted}</s>`);
  const discountPct = Number.isFinite(safeDeal.discountPercentage) ? safeDeal.discountPercentage : 0;
  lines.push(`💥 <b>Por apenas:</b> <code>R$ ${promoPriceFormatted}</code> (${discountPct}% OFF)`);

  // 4. Economia em Reais
  if (includeSavings && savingsAmount > 0) {
    lines.push(`📉 <i>Você economiza: R$ ${savingsFormatted}</i>`);
  }

  // 5. Cupom com Cópia Rápida em 1 Toque (Tag <code>)
  if (includeCoupon && safeDeal.couponCode && safeDeal.couponCode.trim()) {
    const cleanCoupon = escapeTelegramHtml(safeDeal.couponCode.trim().toUpperCase());
    lines.push(`\n🏷️ Cupom: <code>${cleanCoupon}</code> <i>(Toque no código para copiar)</i>`);
  }

  // 6. Link de Afiliado com Call to Action
  const targetUrl = options.customAffiliateUrl || safeDeal.trackedTelegramUrl || safeDeal.shortUrl || safeDeal.affiliateUrl || "";
  lines.push(`\n🛒 <a href="${escapeTelegramHtml(targetUrl)}"><b>👉 ${escapeTelegramHtml(customCallToAction)}</b></a>`);

  // 7. Alerta de Expiração e Tag de Grupo VIP
  if (includeDisclaimer) {
    lines.push(`\n⚠️ <i>Preço e estoque sujeitos a alteração a qualquer momento.</i>`);
  }

  if (footerTag) {
    lines.push(`\n${escapeTelegramHtml(footerTag)} • V5 Finders Hub`);
  }

  return lines.join("\n");
}

/**
 * Compila a mensagem promocional de oferta em formato MarkdownV2 alternativo para Telegram
 */
export function compileTelegramMarkdownMessage(
  deal: GroupBroadcastDeal,
  options: TelegramFormatOptions = {}
): string {
  const {
    includeCoupon = true,
    includeSavings = true,
    includeStoreBadge = true,
    includeDisclaimer = true,
    customCallToAction = "Compre aqui com desconto",
    footerTag = "#AchadinhoVIP"
  } = options;

  const safeDeal = deal || ({} as GroupBroadcastDeal);
  const storeName = safeDeal.store || "Shopee";
  const storeMeta = SUPPORTED_STORES[storeName as SupportedStore] || SUPPORTED_STORES.Shopee;
  const escapedTitle = escapeTelegramMarkdownV2((safeDeal.productName || "").trim());
  const origPrice = Number.isFinite(safeDeal.originalPrice) ? safeDeal.originalPrice : 0;
  const promoPrice = Number.isFinite(safeDeal.promoPrice) ? safeDeal.promoPrice : 0;
  const origPriceFormatted = escapeTelegramMarkdownV2(formatCurrencyBr(origPrice));
  const promoPriceFormatted = escapeTelegramMarkdownV2(formatCurrencyBr(promoPrice));
  const savingsAmount = safeDeal.savingsAmount ?? Math.max(0, origPrice - promoPrice);
  const savingsFormatted = escapeTelegramMarkdownV2(formatCurrencyBr(savingsAmount));

  const lines: string[] = [];

  // Título
  lines.push(`🔥 *${escapedTitle}*\n`);

  // Loja
  if (includeStoreBadge) {
    lines.push(`🏬 *Loja:* ${escapeTelegramMarkdownV2(storeName)} _(${escapeTelegramMarkdownV2(storeMeta.badgeText)})_`);
  } else {
    lines.push(`🏬 *Loja:* ${escapeTelegramMarkdownV2(storeName)}`);
  }

  // Preços
  lines.push(`❌ ~De: R$ ${origPriceFormatted}~`);
  const discountPct = Number.isFinite(safeDeal.discountPercentage) ? safeDeal.discountPercentage : 0;
  lines.push(`💥 *Por apenas:* \`R$ ${promoPriceFormatted}\` \\(${discountPct}% OFF\\)`);

  if (includeSavings && savingsAmount > 0) {
    lines.push(`📉 _Você economiza: R$ ${savingsFormatted}_`);
  }

  // Cupom
  if (includeCoupon && safeDeal.couponCode && safeDeal.couponCode.trim()) {
    const cleanCoupon = escapeTelegramMarkdownV2(safeDeal.couponCode.trim().toUpperCase());
    lines.push(`\n🏷️ Cupom: \`${cleanCoupon}\` _\\(Toque no código para copiar\\)_`);
  }

  // Link
  const targetUrl = options.customAffiliateUrl || safeDeal.trackedTelegramUrl || safeDeal.shortUrl || safeDeal.affiliateUrl || "";
  lines.push(`\n🛒 [👉 ${escapeTelegramMarkdownV2(customCallToAction)}](${targetUrl})`);

  if (includeDisclaimer) {
    lines.push(`\n⚠️ _Preço e estoque sujeitos a alteração a qualquer momento\\._`);
  }

  if (footerTag) {
    lines.push(`\n${escapeTelegramMarkdownV2(footerTag)} • V5 Finders Hub`);
  }

  return lines.join("\n");
}

/**
 * Validador de Conformidade de Comprimento da Mensagem Telegram
 */
export function validateTelegramMessageLength(message: string): {
  isValidForCaption: boolean;
  isValidForMessage: boolean;
  charCount: number;
  captionLimit: number;
  messageLimit: number;
} {
  const charCount = message ? message.length : 0;
  return {
    isValidForCaption: charCount <= TELEGRAM_MAX_CAPTION_CHARS,
    isValidForMessage: charCount <= TELEGRAM_MAX_MESSAGE_CHARS,
    charCount,
    captionLimit: TELEGRAM_MAX_CAPTION_CHARS,
    messageLimit: TELEGRAM_MAX_MESSAGE_CHARS
  };
}
