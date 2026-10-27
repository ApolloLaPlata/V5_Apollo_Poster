/**
 * test-etapa080.ts - Homologação e Certificação Oficial da Fase 8
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Transmissão de Grupos VIP Finders (Etapas 071 a 080):
 * - Etapa 071: Conector de Lojas Oficiais & Dados das Lojas (Shopee, Mercado Livre, Amazon, AliExpress, Magalu)
 * - Etapa 072: Compilador Telegram Bot API (HTML & MarkdownV2 com <s>tachado</s>, <code>cupom</code>, emojis)
 * - Etapa 073: Compilador WhatsApp Cloud API (~tachado~, ```monospaçado```, links isolados)
 * - Etapa 074: Calculadora de Desconto e Economia em Reais (calculateFullSavings, formatCurrencyBr)
 * - Etapa 075: Seletor de Canais VIP e Comunidades (DEFAULT_BROADCAST_CHANNELS, calculateChannelStats)
 * - Etapa 076: Encurtador de Link de Afiliado com Injeção de UTMs (v5p.st/d/, utm_source, utm_medium)
 * - Etapa 077: Simulador de Preview Fidedigno (WhatsApp & Telegram tokenizers e balões)
 * - Etapa 078: Disparo Instantâneo e Agendamento em Lote (batchDispatcher, anti-flood intervals)
 * - Etapa 079: Histórico de Transmissões & Comprovantes Oficiais (Receipts, WAMID, MsgId, métricas)
 * - Etapa 080: Homologação Integrada End-to-End da Fase 8
 */

import {
  SUPPORTED_STORES,
  SupportedStore,
  detectStoreFromUrl,
  SAMPLE_FINDERS_DEALS
} from "../src/lib/finders/storeConnector";

import {
  compileTelegramHtmlMessage,
  compileTelegramMarkdownMessage,
  escapeTelegramHtml,
  escapeTelegramMarkdownV2,
  TELEGRAM_MAX_CAPTION_CHARS
} from "../src/lib/finders/telegramFormatter";

import {
  compileWhatsAppMessage,
  sanitizeWhatsAppText,
  WHATSAPP_MAX_CAPTION_CHARS
} from "../src/lib/finders/whatsappFormatter";

import {
  calculateFullSavings,
  getDealUrgency,
  formatCurrencyBr
} from "../src/lib/finders/discountCalculator";

import {
  DEFAULT_BROADCAST_CHANNELS,
  calculateAudienceReach,
  groupChannelsByPlatform,
  getDefaultChannelIds
} from "../src/lib/finders/channelManager";

import {
  slugifyUtm,
  shortenAffiliateLink,
  generateDualPlatformLinks,
  injectUtmToUrl
} from "../src/lib/finders/affiliateLinkShortener";

import {
  renderWhatsAppBubbleContent,
  renderTelegramBubbleContent
} from "../src/components/poster/MessagePreviewSimulator";

import {
  parseTimeSlot,
  formatTimeSlot,
  calculateBatchScheduleSlots,
  getBatchSelectionSummary,
  filterEligibleDealsForDispatch
} from "../src/lib/finders/batchDispatcher";

import {
  createBroadcastReceipt,
  buildBroadcastHistoryEntry,
  calculateHistoryMetrics,
  formatDispatchedDate
} from "../src/lib/finders/broadcastHistoryManager";

import { usePosterStore } from "../src/store/usePosterStore";
import { GroupBroadcastDeal } from "../src/types/poster";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${label}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${label}`);
  }
}

console.log("\n=======================================================");
console.log("HOMOLOGAÇÃO DA FASE 8: TRANSMISSÃO DE GRUPOS VIP FINDERS");
console.log("ETAPA 080: SUÍTE DE INTEGRAÇÃO COMPLETA (071 -> 080)");
console.log("=======================================================\n");

// 1. Homologação Etapa 071: Conector de Lojas
console.log("1. Homologando Conexão de Lojas (Etapa 071)...");
assert(Object.keys(SUPPORTED_STORES).length === 5, "5 lojas parceiras oficiais configuradas");
assert(SUPPORTED_STORES.Shopee.name === "Shopee", "Shopee configurada com badge e estilo");
assert(detectStoreFromUrl("https://www.mercadolivre.com.br/p/MLB123") === "Mercado Livre", "Detecção automática de URL Mercado Livre");
assert(detectStoreFromUrl("https://shopee.com.br/product/123/456") === "Shopee", "Detecção automática de URL Shopee");
assert(SAMPLE_FINDERS_DEALS.length >= 5, "Catálogo curado do V5 Finders possui ofertas de seed");

// 2. Homologação Etapa 072: Compilador Telegram
console.log("\n2. Homologando Compilador Especial Telegram (Etapa 072)...");
const sampleDeal: GroupBroadcastDeal = SAMPLE_FINDERS_DEALS[0];
const tgHtml = compileTelegramHtmlMessage(sampleDeal, { includeCoupon: true });
assert(tgHtml.includes("<s>De: R$"), "Telegram HTML contém tag <s> de preço tachado");
assert(tgHtml.includes("<code>"), "Telegram HTML contém tag <code> para cupom com 1 toque");
assert(tgHtml.includes("🔥"), "Telegram HTML contém emoji de urgência");
const tgMd = compileTelegramMarkdownMessage(sampleDeal);
assert(tgMd.includes("~De: R$ 1\\.299,90~"), "Telegram MarkdownV2 contém ~tachado~ e escape rigoroso de caracteres");

// 3. Homologação Etapa 073: Compilador WhatsApp
console.log("\n3. Homologando Compilador Especial WhatsApp (Etapa 073)...");
const waText = compileWhatsAppMessage(sampleDeal, { includeCoupon: true });
assert(waText.includes("~De: R$"), "WhatsApp contém sintaxe nativa ~preço original~");
assert(waText.includes("```"), "WhatsApp contém bloco monoespaçado para cupom limpo");
assert(waText.includes("🛒 *Compre aqui com desconto exclusivo:*"), "WhatsApp possui CTA em negrito isolado");

// 4. Homologação Etapa 074: Calculadora de Descontos
console.log("\n4. Homologando Calculadora de Desconto e Economia (Etapa 074)...");
assert(formatCurrencyBr(1299.90) === "1.299,90", "Formatador BRL com padrão 1.299,90");
const fullSavings = calculateFullSavings({ originalPrice: 1299.90, promoPrice: 749.00 });
assert(fullSavings.discountPercentage === 42, "Cálculo completo identificou 42% de desconto");
assert(fullSavings.savingsAmount === 550.90, "Calculou economia exata de R$ 550,90");
assert(fullSavings.urgency.level === "super_deal", "Classificou nível psicológico como super_deal");

// 5. Homologação Etapa 075: Seletor de Canais VIP
console.log("\n5. Homologando Seletor de Canais VIP (Etapa 075)...");
assert(DEFAULT_BROADCAST_CHANNELS.length === 7, "Catálogo com 7 canais/comunidades oficiais");
const tgChannels = DEFAULT_BROADCAST_CHANNELS.filter(c => c.platform === "telegram");
const waChannels = DEFAULT_BROADCAST_CHANNELS.filter(c => c.platform === "whatsapp");
assert(tgChannels.length === 3, "3 canais VIP no Telegram");
assert(waChannels.length === 4, "4 canais/comunidades no WhatsApp");
const audienceStats = calculateAudienceReach(getDefaultChannelIds());
assert(audienceStats.totalMembers === 56354, `Audiência consolidada total de 56.354 membros confirmada (${audienceStats.totalMembers})`);

// 6. Homologação Etapa 076: Encurtador de Link de Afiliado com UTMs
console.log("\n6. Homologando Encurtador com Injeção de UTMs (Etapa 076)...");
const dualLinks = generateDualPlatformLinks({
  dealId: sampleDeal.id,
  productName: sampleDeal.productName,
  store: sampleDeal.store,
  rawUrl: sampleDeal.affiliateUrl,
  couponCode: sampleDeal.couponCode,
  discountPercentage: sampleDeal.discountPercentage
});
assert(dualLinks.telegram.shortUrl.startsWith("https://v5p.st/d/"), "URL encurtada com domínio v5p.st");
assert(dualLinks.telegram.trackedLongUrl.includes("utm_source=telegram_vip"), "Injetou utm_source=telegram_vip");
assert(dualLinks.whatsapp.trackedLongUrl.includes("utm_source=whatsapp_vip"), "Injetou utm_source=whatsapp_vip");

// 7. Homologação Etapa 077: Simulador de Preview Fidedigno
console.log("\n7. Homologando Simulador de Preview Fidedigno (Etapa 077)...");
const waElements = renderWhatsAppBubbleContent("~R$ 100~ *R$ 50* ```CUPOM50``` https://v5p.st/d/abc");
assert(waElements.length > 0, "Tokenizou elementos visuais do balão do WhatsApp");
const tgElements = renderTelegramBubbleContent("<s>R$ 100</s> <b>R$ 50</b> <code>CUPOM50</code> <a href=\"https://v5p.st\">Link</a>");
assert(tgElements.length > 0, "Tokenizou elementos visuais do balão do Telegram");

// 8. Homologação Etapa 078: Disparo Instantâneo e Agendamento em Lote
console.log("\n8. Homologando Disparo Instantâneo e Agendamento em Lote (Etapa 078)...");
const batchDeals = SAMPLE_FINDERS_DEALS.slice(0, 3);
const slots = calculateBatchScheduleSlots(batchDeals, { startTime: "10:00", intervalMinutes: 15 });
assert(slots.length === 3, "Gerou 3 slots de tempo sequenciais");
assert(slots[0].scheduledTime === "10:00", "Primeiro slot às 10:00");
assert(slots[1].scheduledTime === "10:15", "Segundo slot às 10:15 com espaçamento de 15 minutos anti-flood");
assert(slots[2].scheduledTime === "10:30", "Terceiro slot às 10:30");

// 9. Homologação Etapa 079: Histórico e Comprovantes Oficiais
console.log("\n9. Homologando Histórico de Transmissões e Comprovantes (Etapa 079)...");
const receipt = createBroadcastReceipt(sampleDeal);
assert(receipt.receiptId.startsWith("RCPT-"), "Gerou recibo com prefixo RCPT-");
assert(receipt.telegramConfirmed === true, "Comprovante confirmou entrega Telegram");
assert(receipt.whatsappConfirmed === true, "Comprovante confirmou entrega WhatsApp");
assert(receipt.apiStatusCode === 200, "Código de status da API é 200 OK");
assert(receipt.deliveryDurationMs > 0, "Latência de entrega positiva");

// 10. Teste End-to-End Integrado de Transmissão da Fase 8
console.log("\n10. Homologando Fluxo E2E Integrado da Fase 8 no Zustand Store...");
const store = usePosterStore.getState();
const initialHistoryCount = store.broadcastHistory.length;

// Garante que uma oferta elegível existe na lista de deals do store
const targetDeal = store.deals[0];
store.dispatchDeal(targetDeal.id);

const updatedStore = usePosterStore.getState();
assert(updatedStore.broadcastHistory.length === initialHistoryCount + 1, "Transmissão registrada atomicamente no histórico");
const lastHistoryEntry = updatedStore.broadcastHistory[0];
assert(lastHistoryEntry.dealId === targetDeal.id, "Histórico registrou o ID correto da oferta");
assert(lastHistoryEntry.receipt.whatsappConfirmed === true, "Recibo oficial valida entrega WhatsApp");
assert(lastHistoryEntry.receipt.telegramConfirmed === true, "Recibo oficial valida entrega Telegram");
assert(lastHistoryEntry.receipt.deliveryDurationMs > 0, "Latência de rede registrada no comprovante");

const metrics = calculateHistoryMetrics(updatedStore.broadcastHistory);
assert(metrics.totalDispatchedDeals >= 4, "Métricas consolidaram total de envios realizados");
assert(metrics.totalMembersReached > 100000, `Métricas consolidaram membros alcançados (${metrics.totalMembersReached})`);
assert(metrics.totalSavingsGenerated > 1000, `Métricas consolidaram economia entregue aos seguidores (R$ ${metrics.totalSavingsGenerated})`);

console.log("\n=======================================================");
console.log(`TOTAL DE ASSERÇÕES: ${passed + failed}`);
console.log(`PASSOU: ${passed}`);
console.log(`FALHOU: ${failed}`);
console.log("=======================================================\n");

if (failed === 0) {
  console.log("🏆 HOMOLOGAÇÃO DA FASE 8 CONCLUÍDA COM SUCESSO ABSOLUTO (ETAPA 080)!");
  process.exit(0);
} else {
  console.error("❌ FALHA NA HOMOLOGAÇÃO DA FASE 8.");
  process.exit(1);
}
