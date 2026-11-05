/**
 * test-etapa104.ts - Teste E2E de Fluxo Grupos VIP (Finders Hub)
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Validações de Ponta a Ponta:
 * 1. Suporte às lojas de afiliados (Shopee, Mercado Livre, Amazon, AliExpress, Magalu)
 * 2. Cálculo de desconto e economia em R$ (sem imprecisões de float)
 * 3. Classificação de urgência psicológica (Bug de Preço, Super Pechincha, Ótima Oportunidade)
 * 4. Compilação para WhatsApp com formatação oficial (*negrito*, ~tachado~, link)
 * 5. Compilação para Telegram com tags HTML (<b>, <s>, <code>)
 * 6. Encurtador determinístico de links com injeção de UTMs dedicadas
 * 7. Respeito rigoroso aos limites de caracteres das plataformas
 */

import {
  SUPPORTED_STORES,
  SupportedStore,
  calculateFullSavings,
  getDealUrgency,
  formatCurrencyBr
} from "../src/lib/finders/storeConnector";
import {
  compileWhatsAppMessage,
  WHATSAPP_MAX_CAPTION_CHARS
} from "../src/lib/finders/whatsappFormatter";
import {
  compileTelegramHtmlMessage,
  TELEGRAM_MAX_CAPTION_CHARS,
  escapeTelegramHtml
} from "../src/lib/finders/telegramFormatter";
import {
  shortenAffiliateLink
} from "../src/lib/finders/affiliateLinkShortener";
import { GroupBroadcastDeal } from "../src/types/poster";

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

async function runTestEtapa104() {
  console.log("\n=======================================================");
  console.log("🚀 INICIANDO TESTE E2E DA ETAPA 104 - FLUXO GRUPOS VIP FINDERS");
  console.log("=======================================================\n");

  // 1. Conector Oficial de Lojas
  console.log("--- 1. Conexão com Lojas de Afiliados ---");
  const requiredStores: SupportedStore[] = ["Shopee", "Mercado Livre", "Amazon", "AliExpress", "Magalu"];
  for (const store of requiredStores) {
    const meta = SUPPORTED_STORES[store];
    assert(!!meta, `Loja '${store}' mapeada com sucesso.`);
    assert(!!meta.brandColor && !!meta.badgeText, `Metadados visuais de '${store}' definidos.`);
  }

  // 2. Cálculo Preciso de Desconto & Economia
  console.log("\n--- 2. Motor Financeiro & Psicológico de Descontos ---");
  const savingsResult = calculateFullSavings({
    originalPrice: 299.90,
    promoPrice: 149.95,
    additionalCouponDiscount: {
      type: "percentage",
      value: 10
    }
  });

  assert(savingsResult.isValid === true, "Cálculo de economia validado.");
  assert(savingsResult.discountPercentage === 50, "Desconto base de 50% calculado corretamente.");
  assert(savingsResult.effectiveDiscountPercentage > 50, "Desconto cumulativo de cupom aplicado com precisão.");
  assert(savingsResult.savingsAmount === 149.95, "Economia em R$ calculada sem erro de float.");

  // Urgência Psicológica
  const bugUrgency = getDealUrgency(65);
  assert(bugUrgency.level === "price_bug", "Desconto >= 60% classificado como 'BUG DE PREÇO'.");
  const superUrgency = getDealUrgency(45);
  assert(superUrgency.level === "super_deal", "Desconto entre 40% e 59% classificado como 'SUPER PECHINCHA VIP'.");

  // Oferta Mock Base para Disparo
  const mockDeal: GroupBroadcastDeal = {
    id: "deal-104-e2e",
    productName: "Headset Gamer Sem Fio 7.1 Surround RGB",
    store: "Shopee",
    originalPrice: 389.00,
    promoPrice: 194.50,
    discountPercentage: 50,
    savingsAmount: 194.50,
    affiliateUrl: "https://shopee.com.br/product/12345/67890",
    couponCode: "APOLLO50",
    targetChannels: ["whatsapp", "telegram"],
    scheduledTime: new Date().toISOString(),
    status: "pending"
  };

  // 3. Formatação WhatsApp
  console.log("\n--- 3. Formatação Oficial para WhatsApp ---");
  const waMessage = compileWhatsAppMessage(mockDeal);
  assert(waMessage.includes("*Headset Gamer Sem Fio 7.1 Surround RGB*"), "Título em *negrito* no padrão WhatsApp.");
  assert(waMessage.includes("~De: R$ 389,00~"), "Preço original com ~tachado~ no padrão WhatsApp.");
  assert(waMessage.includes("```APOLLO50```"), "Cupom em bloco ```monospaçado``` para cópia rápida.");
  assert(waMessage.length <= WHATSAPP_MAX_CAPTION_CHARS, `Mensagem do WhatsApp (${waMessage.length}c) dentro do limite de 1024c.`);

  // 4. Formatação Telegram
  console.log("\n--- 4. Formatação Oficial para Telegram ---");
  const tgMessage = compileTelegramHtmlMessage(mockDeal);
  assert(tgMessage.includes("<b>Headset Gamer Sem Fio 7.1 Surround RGB</b>"), "Título em <b>negrito</b> no HTML Telegram.");
  assert(tgMessage.includes("<s>De: R$ 389,00</s>"), "Preço original em <s>tachado</s> no HTML Telegram.");
  assert(tgMessage.includes("<code>APOLLO50</code>"), "Cupom em <code>código copiável</code> no HTML Telegram.");
  assert(tgMessage.length <= TELEGRAM_MAX_CAPTION_CHARS, `Mensagem do Telegram (${tgMessage.length}c) dentro do limite de 1024c.`);

  // 5. Encurtador de Link & Injeção de UTMs
  console.log("\n--- 5. Encurtador Determinístico de Link com UTM ---");
  const shortLinkWa = shortenAffiliateLink({
    dealId: mockDeal.id,
    productName: mockDeal.productName,
    store: mockDeal.store,
    rawUrl: mockDeal.affiliateUrl,
    couponCode: mockDeal.couponCode,
    discountPercentage: mockDeal.discountPercentage,
    platform: "whatsapp"
  });

  assert(shortLinkWa.trackedLongUrl.includes("utm_source=whatsapp_vip"), "Injetou utm_source=whatsapp_vip.");
  assert(shortLinkWa.trackedLongUrl.includes("utm_medium=community_vip"), "Injetou utm_medium=community_vip.");
  assert(shortLinkWa.shortUrl.startsWith("https://v5p.st/d/"), "Link curto gerado sob domínio seguro v5p.st.");

  const shortLinkTg = shortenAffiliateLink({
    dealId: mockDeal.id,
    productName: mockDeal.productName,
    store: mockDeal.store,
    rawUrl: mockDeal.affiliateUrl,
    couponCode: mockDeal.couponCode,
    discountPercentage: mockDeal.discountPercentage,
    platform: "telegram"
  });

  assert(shortLinkTg.trackedLongUrl.includes("utm_source=telegram_vip"), "Injetou utm_source=telegram_vip.");
  assert(shortLinkTg.trackedLongUrl.includes("utm_medium=broadcast_channel"), "Injetou utm_medium=broadcast_channel.");

  console.log("\n=======================================================");
  console.log(`🎯 RESULTADO ETAPA 104: ${passedTests}/${totalTests} TESTES APROVADOS!`);
  console.log("=======================================================\n");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTestEtapa104().catch((err) => {
  console.error("Erro fatal no teste:", err);
  process.exit(1);
});
