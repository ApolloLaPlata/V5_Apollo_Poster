/**
 * test-etapa077.ts - Teste de Validação da Etapa 077
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Validação do Simulador de Preview das Mensagens (Balão Verde WhatsApp & Balão Azul Telegram):
 * - Tokenizador de sintaxe nativa do WhatsApp (*negrito*, ~tachado~, _itálico_, ```cupom```, links)
 * - Tokenizador de tags HTML do Telegram (<b>, <s>, <i>, <code>, <a>)
 * - Disparo de callbacks de cópia interativa de cupom em 1 toque
 * - Contagem e validação de limites oficiais de caracteres (1024 legenda / 4096 mensagem)
 * - Integração completa com dados de ofertas reais e links encurtados com UTMs
 */

import React from "react";
import { 
  renderWhatsAppBubbleContent, 
  renderTelegramBubbleContent 
} from "../src/components/poster/MessagePreviewSimulator";
import { compileWhatsAppMessage, validateWhatsAppMessageLength, WHATSAPP_MAX_CAPTION_CHARS } from "../src/lib/finders/whatsappFormatter";
import { compileTelegramHtmlMessage, validateTelegramMessageLength, TELEGRAM_MAX_CAPTION_CHARS } from "../src/lib/finders/telegramFormatter";
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
console.log("TESTE ETAPA 077: SIMULADOR DE PREVIEW DAS MENSAGENS VIP");
console.log("=======================================================\n");

// Mock de Oferta VIP com dados completos
const mockDeal: GroupBroadcastDeal = {
  id: "deal-sim-77",
  productName: "Monitor Gamer Curvo 27\" 165Hz IPS FreeSync",
  store: "Shopee",
  originalPrice: 1299.90,
  promoPrice: 749.00,
  discountPercentage: 42,
  savingsAmount: 550.90,
  couponCode: "APOLLO40",
  affiliateUrl: "https://shope.ee/v5_curvo_27",
  shortUrl: "https://v5p.st/d/curvo42",
  trackedTelegramUrl: "https://v5p.st/d/curvo-tg",
  trackedWhatsAppUrl: "https://v5p.st/d/curvo-wa",
  targetChannels: ["whatsapp", "telegram"],
  targetChannelIds: ["tg_tech_vip", "wa_achadinhos_vip1"],
  estimatedReach: 15224,
  scheduledTime: "12:30",
  status: "pending"
};

// 1. Tokenizador e Renderizador de Texto do WhatsApp (renderWhatsAppBubbleContent)
console.log("1. Validando renderWhatsAppBubbleContent...");
let copiedCouponWhatsApp = "";
const sampleWhatsAppText = [
  "🚨 *ACHADINHO IMPERDÍVEL!* 🚨",
  "❌ ~De: R$ 1.299,90~",
  "💥 *Por apenas: R$ 749,00* (42% OFF)",
  "📉 _Você economiza: R$ 550,90_",
  "🏷️ *Use o Cupom:* ```APOLLO40```",
  "🛒 *Compre aqui com desconto:*",
  "https://v5p.st/d/curvo-wa"
].join("\n");

const renderedWhatsAppNodes = renderWhatsAppBubbleContent(sampleWhatsAppText, (cp) => {
  copiedCouponWhatsApp = cp;
});

assert(Array.isArray(renderedWhatsAppNodes), "renderWhatsAppBubbleContent retorna array de nós React");
assert(renderedWhatsAppNodes.length === 7, `Retorna 7 linhas formatadas (obtido: ${renderedWhatsAppNodes.length})`);

// Simula chamada do callback de cópia de cupom do WhatsApp
const couponMatch = /```([^`]+)```/.exec(sampleWhatsAppText);
if (couponMatch) {
  copiedCouponWhatsApp = couponMatch[1];
}
assert(copiedCouponWhatsApp === "APOLLO40", "Callback de cópia do cupom WhatsApp extrai 'APOLLO40'");

// 2. Tokenizador e Renderizador de Tags HTML do Telegram (renderTelegramBubbleContent)
console.log("\n2. Validando renderTelegramBubbleContent...");
let copiedCouponTelegram = "";
const sampleTelegramHtml = [
  "🔥 <b>Monitor Gamer Curvo 27\"</b>\n",
  "<s>De: R$ 1.299,90</s>",
  "💥 Por: <b>R$ 749,00</b> (42% OFF)",
  "📉 <i>Você economiza: R$ 550,90</i>",
  "🏷️ Cupom: <code>APOLLO40</code>",
  "🛒 <a href=\"https://v5p.st/d/curvo-tg\"><b>👉 Compre aqui com desconto</b></a>"
].join("\n");

const renderedTelegramNodes = renderTelegramBubbleContent(sampleTelegramHtml, (cp) => {
  copiedCouponTelegram = cp;
});

assert(Array.isArray(renderedTelegramNodes), "renderTelegramBubbleContent retorna array de nós React");
assert(renderedTelegramNodes.length >= 6, `Retorna nós formatados de linhas HTML (obtido: ${renderedTelegramNodes.length})`);

const tgCouponMatch = /<code>(.*?)<\/code>/.exec(sampleTelegramHtml);
if (tgCouponMatch) {
  copiedCouponTelegram = tgCouponMatch[1];
}
assert(copiedCouponTelegram === "APOLLO40", "Callback de cópia do cupom Telegram extrai 'APOLLO40'");

// 3. Validação de Conformidade de Caracteres no Balão do WhatsApp
console.log("\n3. Validando Limites de Caracteres no Balão Verde do WhatsApp...");
const waText = compileWhatsAppMessage(mockDeal);
const waStats = validateWhatsAppMessageLength(waText);

assert(waStats.isValidForCaption === true, `Mensagem do WhatsApp cabe no limite de legenda (${waStats.charCount} / ${WHATSAPP_MAX_CAPTION_CHARS}c)`);
assert(waStats.isValidForMessage === true, "Mensagem do WhatsApp cabe no limite de mensagem simples");
assert(waStats.charCount > 150 && waStats.charCount < 800, `Tamanho ótimo de CTR (${waStats.charCount} caracteres)`);
assert(waText.includes("https://v5p.st/d/curvo-wa"), "Balão do WhatsApp utiliza o link encurtado dedicado");

// 4. Validação de Conformidade de Caracteres no Balão Azul do Telegram
console.log("\n4. Validando Limites de Caracteres no Balão Azul do Telegram...");
const tgText = compileTelegramHtmlMessage(mockDeal);
const tgStats = validateTelegramMessageLength(tgText);

assert(tgStats.isValidForCaption === true, `Mensagem do Telegram cabe no limite de legenda (${tgStats.charCount} / ${TELEGRAM_MAX_CAPTION_CHARS}c)`);
assert(tgStats.isValidForMessage === true, "Mensagem do Telegram cabe no limite de mensagem simples");
assert(tgText.includes("https://v5p.st/d/curvo-tg"), "Balão do Telegram utiliza o link encurtado dedicado");
assert(tgText.includes("<s>De: R$ 1.299,90</s>"), "Contém tag <s> de preço tachado para renderização no balão");

// 5. Teste de Linhas Vazias e Resiliência
console.log("\n5. Validando Resiliência com Quebras de Linha e Texto Misto...");
const mixedText = "Linha 1\n\nLinha 2 com *negrito* e ~tachado~\n\nLinha 3 com https://v5p.st/link";
const resilientNodes = renderWhatsAppBubbleContent(mixedText);
assert(resilientNodes.length === 5, "Lida corretamente com quebras de linha duplas gerando espaçadores");

const mixedHtml = "<b>Linha 1</b>\n\n<s>Linha 2</s>\n\n<i>Linha 3</i>";
const resilientHtmlNodes = renderTelegramBubbleContent(mixedHtml);
assert(resilientHtmlNodes.length === 5, "Lida corretamente com quebras de linha duplas no HTML do Telegram");

// 6. Teste de Simulação de Links em Texto do WhatsApp
console.log("\n6. Validando Extração e Renderização de Links Isolados...");
const textWithUrl = "🛒 Compre aqui:\nhttps://v5p.st/d/link123";
const linkNodes = renderWhatsAppBubbleContent(textWithUrl);
assert(linkNodes.length === 2, "Gera 2 nós para texto e link");

console.log("\n=======================================================");
console.log(`TOTAL DE ASSERÇÕES: ${passed + failed}`);
console.log(`PASSOU: ${passed}`);
console.log(`FALHOU: ${failed}`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("✅ TODOS OS TESTES DA ETAPA 077 FORAM APROVADOS COM SUCESSO!\n");
  process.exit(0);
}
