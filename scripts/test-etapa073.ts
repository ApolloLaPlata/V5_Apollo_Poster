/**
 * test-etapa073.ts - Suíte de Testes da Etapa 073:
 * Compilador de Formatação Especial para WhatsApp (Padrão de texto com ~preço original~, cupom e link curto)
 * Capitania #13: V5 Apollo Poster (:3011)
 */

import { 
  compileWhatsAppMessage, 
  sanitizeWhatsAppText, 
  validateWhatsAppMessageLength,
  formatCurrencyBr,
  WHATSAPP_MAX_CAPTION_CHARS,
  WHATSAPP_MAX_MESSAGE_CHARS
} from "../src/lib/finders/whatsappFormatter";
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

console.log("=== INICIANDO TESTES DA ETAPA 073 (COMPILADOR DE FORMATAÇÃO WHATSAPP VIP) ===\n");

// 1. TESTE DE SANITIZAÇÃO DE TEXTO PARA WHATSAPP
console.log("[Grupo 1] Sanitização de Texto WhatsApp (sanitizeWhatsAppText):");
assert(
  sanitizeWhatsAppText("Monitor *Gamer* Ultra ~Fast~ ```Pro```") === "Monitor Gamer Ultra -Fast- Pro",
  "Remove ou substitui caracteres conflitantes de formatação (*, ~, ```)"
);
assert(
  sanitizeWhatsAppText("Produto Normal 100%") === "Produto Normal 100%",
  "Preserva textos limpos sem alterações"
);

// 2. TESTE DE FORMATAÇÃO MONETÁRIA BRASILEIRA
console.log("\n[Grupo 2] Formatação de Moeda Brasileira (formatCurrencyBr):");
assert(
  formatCurrencyBr(1299.9) === "1.299,90",
  "Formata milhares e decimais no padrão R$ brasileiro (1.299,90)"
);
assert(
  formatCurrencyBr(49.0) === "49,00",
  "Garante duas casas decimais para valores redondos (49,00)"
);

// 3. TESTE DE COMPILAÇÃO OFICIAL PARA WHATSAPP
console.log("\n[Grupo 3] Compilação Oficial de Mensagem WhatsApp (compileWhatsAppMessage):");
const mockDealShopee: GroupBroadcastDeal = {
  id: "deal-whatsapp-1",
  productName: "Monitor Gamer Curvo 27\" 165Hz 1ms IPS FreeSync",
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

const waMessage = compileWhatsAppMessage(mockDealShopee);

assert(waMessage.includes("🚨 *ACHADINHO IMPERDÍVEL!* 🚨"), "Contém cabeçalho urgente padrão");
assert(waMessage.includes("🔥 *Monitor Gamer Curvo 27\" 165Hz 1ms IPS FreeSync*"), "Título formatado em negrito (*)");
assert(waMessage.includes("🏬 *Loja:* Shopee _(Frete Grátis Shopee)_"), "Contém loja em negrito e badge oficial em itálico");
assert(waMessage.includes("❌ ~De: R$ 1.299,90~"), "Preço original formatado com til tachado (~) oficial do WhatsApp");
assert(waMessage.includes("💥 *Por apenas: R$ 749,00* (42% OFF)"), "Preço promocional formatado em negrito (*)");
assert(waMessage.includes("📉 _Você economiza: R$ 550,90_"), "Economia real formatada em itálico (_)");
assert(waMessage.includes("🏷️ *Use o Cupom:* ```APOLLO40```"), "Cupom formatado em monospace triplo (```) para cópia");
assert(waMessage.includes("🛒 *Compre aqui com desconto exclusivo:*"), "Contém chamada para ação em negrito");
assert(waMessage.includes("https://shope.ee/v5_curvo_27?utm_source=v5poster_vip"), "Contém URL de afiliado em linha isolada para gerar Rich Card");
assert(waMessage.includes("⚠️ _Preço e estoque sujeitos a alteração"), "Contém alerta de expiração em itálico");
assert(waMessage.includes("#AchadinhosVIP • V5 Finders Hub"), "Contém assinatura VIP da holding");

// 4. TESTE DE OFERTA SEM CUPOM
console.log("\n[Grupo 4] Oferta sem Cupom de Desconto:");
const mockDealNoCoupon: GroupBroadcastDeal = {
  id: "deal-whatsapp-2",
  productName: "Air Fryer Touch 5L",
  store: "Mercado Livre",
  originalPrice: 489.0,
  promoPrice: 289.9,
  discountPercentage: 41,
  savingsAmount: 199.1,
  affiliateUrl: "https://mercadolivre.com.br/sec/airfryer",
  targetChannels: ["whatsapp"],
  scheduledTime: "16:00",
  status: "pending"
};

const waMessageNoCoupon = compileWhatsAppMessage(mockDealNoCoupon);
assert(!waMessageNoCoupon.includes("🏷️ *Use o Cupom:*"), "Omite bloco de cupom quando ausente");
assert(waMessageNoCoupon.includes("Envio FULL Rápido"), "Contém badge oficial do Mercado Livre");

// 5. TESTE DE VARIAÇÃO DE CUPOM EM NEGRITO (SEM MONOSPACE)
console.log("\n[Grupo 5] Opção de Cupom em Negrito (*CUPOM*):");
const waBoldCoupon = compileWhatsAppMessage(mockDealShopee, { useMonospaceCoupon: false });
assert(waBoldCoupon.includes("🏷️ *Use o Cupom:* *APOLLO40*"), "Gera cupom com asterisco negrito quando useMonospaceCoupon=false");

// 6. TESTE DO VALIDADOR DE LIMITES DO WHATSAPP
console.log("\n[Grupo 6] Validador de Limites de Caracteres do WhatsApp:");
const lengthCheck = validateWhatsAppMessageLength(waMessage);
assert(lengthCheck.isValidForCaption === true, `Mensagem cabe no limite de legenda de foto (${lengthCheck.charCount} / ${WHATSAPP_MAX_CAPTION_CHARS}c)`);
assert(lengthCheck.isValidForMessage === true, `Mensagem cabe no limite de mensagem simples (${lengthCheck.charCount} / ${WHATSAPP_MAX_MESSAGE_CHARS}c)`);
assert(lengthCheck.charCount > 100 && lengthCheck.charCount < 800, "Comprimento da mensagem dentro do padrão ótimo de CTR");

console.log(`\n======================================================`);
console.log(`TOTAL DE TESTES: ${totalTests}`);
console.log(`APROVADOS:       ${passedTests}`);
console.log(`FALHAS:          ${totalTests - passedTests}`);
console.log(`TAXA DE SUCESSO: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
console.log(`======================================================`);

if (passedTests === totalTests) {
  console.log(">> HOMOLOGAÇÃO DA ETAPA 073 CONCLUÍDA COM SUCESSO! <<");
  process.exit(0);
} else {
  process.exit(1);
}
