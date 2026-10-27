/**
 * whatsappFormatter.ts - Compilador de Formatação Especial de Ofertas para WhatsApp
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Suporte a Formatação Oficial do WhatsApp (Cloud API e Aplicativo):
 * - *Negrito*: Título, loja e preço promocional
 * - ~Tachado~: Preço original riscado (~De: R$ 1.299,90~)
 * - _Itálico_: Observações, badges e alertas de estoque
 * - ```Monospaçado```: Código do cupom em caixa alta para cópia limpa
 * - Links em linha isolada para ativação de Rich Card Preview (Open Graph)
 */

import { GroupBroadcastDeal } from "@/types/poster";
import { SUPPORTED_STORES, SupportedStore } from "./storeConnector";

export interface WhatsAppFormatOptions {
  includeCoupon?: boolean;
  includeSavings?: boolean;
  includeStoreBadge?: boolean;
  includeDisclaimer?: boolean;
  useMonospaceCoupon?: boolean;
  customCallToAction?: string;
  footerTag?: string;
}

export const WHATSAPP_MAX_CAPTION_CHARS = 1024;
export const WHATSAPP_MAX_MESSAGE_CHARS = 4096;

/**
 * Formata valor monetário no padrão brasileiro R$ 0,00
 */
export function formatCurrencyBr(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Sanitiza caracteres que possam quebrar a sintaxe do WhatsApp (*, _, ~, ```) no texto livre
 */
export function sanitizeWhatsAppText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\*/g, "")
    .replace(/~/g, "-")
    .replace(/```/g, "")
    .trim();
}

/**
 * Compila a mensagem promocional de oferta no padrão de texto oficial do WhatsApp
 *
 * Padrão V5 Finders VIP Hub:
 * 🚨 *ACHADINHO IMPERDÍVEL!* 🚨
 *
 * 🔥 *Monitor Gamer Curvo 27" 165Hz 1ms IPS*
 *
 * 🏬 *Loja:* Shopee _(Frete Grátis Shopee)_
 * ❌ ~De: R$ 1.299,90~
 * 💥 *Por apenas: R$ 749,00* (42% OFF)
 * 📉 _Você economiza: R$ 550,90_
 *
 * 🏷️ *Use o Cupom:* ```APOLLO40```
 *
 * 🛒 *Compre aqui com desconto:*
 * https://shope.ee/v5_curvo_27?utm_source=v5poster_vip
 *
 * ⚠️ _Preço e estoque sujeitos a alteração a qualquer momento._
 * #AchadinhosVIP • V5 Finders Hub
 */
export function compileWhatsAppMessage(
  deal: GroupBroadcastDeal,
  options: WhatsAppFormatOptions = {}
): string {
  const {
    includeCoupon = true,
    includeSavings = true,
    includeStoreBadge = true,
    includeDisclaimer = true,
    useMonospaceCoupon = true,
    customCallToAction = "Compre aqui com desconto exclusivo:",
    footerTag = "#AchadinhosVIP"
  } = options;

  const storeMeta = SUPPORTED_STORES[deal.store as SupportedStore] || SUPPORTED_STORES.Shopee;
  const cleanTitle = sanitizeWhatsAppText(deal.productName);
  const origPriceFormatted = formatCurrencyBr(deal.originalPrice);
  const promoPriceFormatted = formatCurrencyBr(deal.promoPrice);
  const savingsAmount = deal.savingsAmount ?? (deal.originalPrice - deal.promoPrice);
  const savingsFormatted = formatCurrencyBr(savingsAmount);

  const lines: string[] = [];

  // 1. Cabeçalho de Alerta
  lines.push(`🚨 *ACHADINHO IMPERDÍVEL!* 🚨\n`);

  // 2. Título do Produto em Negrito
  lines.push(`🔥 *${cleanTitle}*\n`);

  // 3. Loja e Badge Oficial
  if (includeStoreBadge) {
    lines.push(`🏬 *Loja:* ${deal.store} _(${storeMeta.badgeText})_`);
  } else {
    lines.push(`🏬 *Loja:* ${deal.store}`);
  }

  // 4. Preço Original Tachado com til (~) e Preço Promocional em Negrito
  lines.push(`❌ ~De: R$ ${origPriceFormatted}~`);
  lines.push(`💥 *Por apenas: R$ ${promoPriceFormatted}* (${deal.discountPercentage}% OFF)`);

  // 5. Economia em Reais em Itálico
  if (includeSavings && savingsAmount > 0) {
    lines.push(`📉 _Você economiza: R$ ${savingsFormatted}_`);
  }

  // 6. Cupom com Cópia Rápida em Monospace (```CUPOM```)
  if (includeCoupon && deal.couponCode && deal.couponCode.trim()) {
    const cleanCoupon = deal.couponCode.trim().toUpperCase();
    if (useMonospaceCoupon) {
      lines.push(`\n🏷️ *Use o Cupom:* \`\`\`${cleanCoupon}\`\`\``);
    } else {
      lines.push(`\n🏷️ *Use o Cupom:* *${cleanCoupon}*`);
    }
  }

  // 7. Link Isolado com Call to Action (Garante o preview de cartão no WhatsApp)
  lines.push(`\n🛒 *${customCallToAction}*`);
  lines.push(`${deal.affiliateUrl.trim()}`);

  // 8. Alerta de Expiração de Estoque
  if (includeDisclaimer) {
    lines.push(`\n⚠️ _Preço e estoque sujeitos a alteração a qualquer momento._`);
  }

  // 9. Assinatura do Canal VIP
  if (footerTag) {
    lines.push(`\n${footerTag} • V5 Finders Hub`);
  }

  return lines.join("\n");
}

/**
 * Validador de Conformidade de Comprimento da Mensagem WhatsApp
 */
export function validateWhatsAppMessageLength(message: string): {
  isValidForCaption: boolean;
  isValidForMessage: boolean;
  charCount: number;
  captionLimit: number;
  messageLimit: number;
} {
  const charCount = message ? message.length : 0;
  return {
    isValidForCaption: charCount <= WHATSAPP_MAX_CAPTION_CHARS,
    isValidForMessage: charCount <= WHATSAPP_MAX_MESSAGE_CHARS,
    charCount,
    captionLimit: WHATSAPP_MAX_CAPTION_CHARS,
    messageLimit: WHATSAPP_MAX_MESSAGE_CHARS
  };
}
