/**
 * test-etapa072.ts - Suíte de Testes da Etapa 072:
 * Compilador de Formatação Especial para Telegram (HTML/Markdown com <s>preço original</s>, preço promocional e emoji de fogo)
 * Capitania #13: V5 Apollo Poster (:3011)
 */

import { 
  compileTelegramHtmlMessage, 
  compileTelegramMarkdownMessage, 
  escapeTelegramHtml, 
  escapeTelegramMarkdownV2, 
  validateTelegramMessageLength,
  TELEGRAM_MAX_CAPTION_CHARS,
  TELEGRAM_MAX_MESSAGE_CHARS
} from "../src/lib/finders/telegramFormatter";
import { GroupBroadcastDeal } from "../src/types/poster";

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✗ [FAIL] ${testName}${details ? ` -> ${details}` : ""}`);
  }
}

console.log("=== INICIANDO TESTES DA ETAPA 072 (COMPILADOR DE FORMATAÇÃO TELEGRAM VIP) ===\n");

// 1. TESTE DE ESCAPAMENTO HTML PARA TELEGRAM BOT API
console.log("[Grupo 1] Escapamento HTML (escapeTelegramHtml):");
assert(
  escapeTelegramHtml("Monitor <Gamer> & Curvo > 165Hz") === "Monitor &lt;Gamer&gt; &amp; Curvo &gt; 165Hz",
  "Escapa adequadamente caracteres reservados <, > e &"
);
assert(
  escapeTelegramHtml("Texto normal sem tags") === "Texto normal sem tags",
  "Preserva strings sem caracteres especiais"
);

// 2. TESTE DE ESCAPAMENTO MARKDOWNV2 PARA TELEGRAM
console.log("\n[Grupo 2] Escapamento MarkdownV2 (escapeTelegramMarkdownV2):");
assert(
  escapeTelegramMarkdownV2("Promoção *Imperdível*! R$ 100,00 [Shopee]") === "Promoção \\*Imperdível\\*\\! R$ 100,00 \\[Shopee\\]",
  "Escapa caracteres especiais *, !, [, ] do MarkdownV2"
);

// 3. TESTE DE COMPILAÇÃO HTML (PADRÃO PRINCIPAL DA HOLDING)
console.log("\n[Grupo 3] Compilação HTML Oficial do Telegram (compileTelegramHtmlMessage):");
const mockDealShopee: GroupBroadcastDeal = {
  id: "deal-test-1",
  productName: "Monitor Gamer Curvo 27\" 165Hz 1ms IPS",
  store: "Shopee",
  originalPrice: 1299.90,
  promoPrice: 749.00,
  discountPercentage: 42,
  savingsAmount: 550.90,
  couponCode: "APOLLO40",
  affiliateUrl: "https://shope.ee/v5_curvo_27?utm_source=v5poster_vip",
  targetChannels: ["whatsapp", "telegram"],
  scheduledTime: "12:30",
  status: "pending"
};

const htmlMessage = compileTelegramHtmlMessage(mockDealShopee);

assert(htmlMessage.startsWith("🔥 <b>"), "Inicia com emoji de fogo e título em negrito");
assert(htmlMessage.includes("<s>De: R$ 1.299,90</s>"), "Contém tag <s> com preço original tachado");
assert(htmlMessage.includes("<code>R$ 749,00</code>"), "Contém preço promocional formatado em <code>");
assert(htmlMessage.includes("42% OFF"), "Contém percentual de desconto");
assert(htmlMessage.includes("Você economiza: R$ 550,90"), "Contém valor economizado em Reais");
assert(htmlMessage.includes("<code>APOLLO40</code>"), "Contém cupom em tag <code> para cópia em 1 toque");
assert(htmlMessage.includes("<a href=\"https://shope.ee/v5_curvo_27?utm_source=v5poster_vip\">"), "Contém link de afiliado na tag <a>");
assert(htmlMessage.includes("Frete Grátis Shopee"), "Contém badge oficial da loja Shopee");
assert(htmlMessage.includes("#AchadinhoVIP"), "Contém footer tag da holding");

// 4. TESTE DE COMPILAÇÃO MARKDOWNV2
console.log("\n[Grupo 4] Compilação MarkdownV2 (compileTelegramMarkdownMessage):");
const mdMessage = compileTelegramMarkdownMessage(mockDealShopee);

assert(mdMessage.startsWith("🔥 *"), "Inicia com emoji de fogo e título em asterisco Markdown");
assert(mdMessage.includes("~De: R$ 1\\.299,90~"), "Contém preço original tachado com til ~");
assert(mdMessage.includes("`R$ 749,00`"), "Contém preço promocional em crases inline `");
assert(mdMessage.includes("`APOLLO40`"), "Contém cupom formatado em código Markdown");
assert(mdMessage.includes("[👉 Compre aqui com desconto](https://shope.ee/v5_curvo_27?utm_source=v5poster_vip)"), "Contém link em formato [Texto](URL)");

// 5. TESTE DE OFERTA SEM CUPOM
console.log("\n[Grupo 5] Oferta sem Cupom de Desconto:");
const mockDealNoCoupon: GroupBroadcastDeal = {
  id: "deal-test-2",
  productName: "Air Fryer Touch 5L",
  store: "Mercado Livre",
  originalPrice: 400.0,
  promoPrice: 200.0,
  discountPercentage: 50,
  affiliateUrl: "https://mercadolivre.com.br/sec/airfryer",
  targetChannels: ["telegram"],
  scheduledTime: "15:00",
  status: "pending"
};

const htmlNoCoupon = compileTelegramHtmlMessage(mockDealNoCoupon);
assert(!htmlNoCoupon.includes("🏷️ Cupom:"), "Omite linha de cupom quando não há código cadastrado");
assert(htmlNoCoupon.includes("Envio FULL Rápido"), "Contém badge oficial do Mercado Livre");

// 6. TESTE DE VALIDAÇÃO DE TAMANHO DE MENSAGEM
console.log("\n[Grupo 6] Validador de Limites de Caracteres do Telegram:");
const lengthValidation = validateTelegramMessageLength(htmlMessage);
assert(lengthValidation.isValidForCaption === true, `Mensagem cabe no limite de legenda de foto (${lengthValidation.charCount} / ${TELEGRAM_MAX_CAPTION_CHARS}c)`);
assert(lengthValidation.isValidForMessage === true, `Mensagem cabe no limite de texto simples (${lengthValidation.charCount} / ${TELEGRAM_MAX_MESSAGE_CHARS}c)`);
assert(lengthValidation.charCount > 100 && lengthValidation.charCount < 700, "Tamanho da mensagem dentro da média ideal de conversão");

console.log(`\n======================================================`);
console.log(`TOTAL DE TESTES: ${totalTests}`);
console.log(`APROVADOS:       ${passedTests}`);
console.log(`FALHAS:          ${totalTests - passedTests}`);
console.log(`TAXA DE SUCESSO: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
console.log(`======================================================`);

if (passedTests === totalTests) {
  console.log(">> HOMOLOGAÇÃO DA ETAPA 072 CONCLUÍDA COM SUCESSO! <<");
  process.exit(0);
} else {
  process.exit(1);
}
