/**
 * test-etapa074.ts - Suíte de Testes da Etapa 074:
 * Calculadora Automática de Porcentagem de Desconto e Destaque de Economia em Reais
 * Capitania #13: V5 Apollo Poster (:3011)
 */

import { 
  calculateFullSavings, 
  getDealUrgency, 
  formatCurrencyBr 
} from "../src/lib/finders/discountCalculator";

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

console.log("=== INICIANDO TESTES DA ETAPA 074 (CALCULADORA DE ECONOMIA E DESCONTO) ===\n");

// 1. TESTE DE FORMATAÇÃO MONETÁRIA BRASILEIRA
console.log("[Grupo 1] Formatação Monetária (formatCurrencyBr):");
assert(formatCurrencyBr(1299.90) === "1.299,90", "Formata 1299.90 como 1.299,90");
assert(formatCurrencyBr(749.00) === "749,00", "Formata 749.00 como 749,00");
assert(formatCurrencyBr(550.90) === "550,90", "Formata 550.90 como 550,90");

// 2. TESTE DE CÁLCULO BASE DE ECONOMIA E DESCONTO
console.log("\n[Grupo 2] Cálculo Base de Economia (calculateFullSavings):");
const baseCalc = calculateFullSavings({ originalPrice: 1299.90, promoPrice: 749.00 });

assert(baseCalc.isValid === true, "Cálculo válido com preços consistentes");
assert(baseCalc.discountPercentage === 42, `Calcula 42% de desconto base (obtido: ${baseCalc.discountPercentage}%)`);
assert(baseCalc.savingsAmount === 550.90, `Calcula economia de R$ 550.90 (obtido: ${baseCalc.savingsAmount})`);
assert(baseCalc.formattedOriginalPrice === "1.299,90", "Preço original formatado como 1.299,90");
assert(baseCalc.formattedPromoPrice === "749,00", "Preço promo formatado como 749,00");
assert(baseCalc.formattedSavingsAmount === "550,90", "Economia formatada como 550,90");

// 3. TESTE DE CUPOM ADICIONAL PERCENTUAL
console.log("\n[Grupo 3] Cupom Adicional Percentual:");
const couponPercentCalc = calculateFullSavings({
  originalPrice: 1000.00,
  promoPrice: 600.00, // 40% OFF base
  additionalCouponDiscount: {
    type: "percentage",
    value: 10 // 10% adicional sobre 600 = 540 final (46% OFF total)
  }
});

assert(couponPercentCalc.finalPrice === 540.00, `Preço final após cupom de 10% é R$ 540.00 (obtido: ${couponPercentCalc.finalPrice})`);
assert(couponPercentCalc.totalSavingsAmount === 460.00, `Economia total acumulada é R$ 460.00 (obtido: ${couponPercentCalc.totalSavingsAmount})`);
assert(couponPercentCalc.effectiveDiscountPercentage === 46, `Desconto efetivo acumulado é 46% (obtido: ${couponPercentCalc.effectiveDiscountPercentage}%)`);

// 4. TESTE DE CUPOM ADICIONAL FIXO EM REAIS
console.log("\n[Grupo 4] Cupom Adicional Fixo em Reais:");
const couponFixedCalc = calculateFullSavings({
  originalPrice: 500.00,
  promoPrice: 350.00,
  additionalCouponDiscount: {
    type: "fixed",
    value: 50.00 // R$ 50 OFF fixo = 300 final (40% OFF total)
  }
});

assert(couponFixedCalc.finalPrice === 300.00, `Preço final após cupom de R$ 50 é R$ 300.00 (obtido: ${couponFixedCalc.finalPrice})`);
assert(couponFixedCalc.totalSavingsAmount === 200.00, `Economia total é R$ 200.00 (obtido: ${couponFixedCalc.totalSavingsAmount})`);
assert(couponFixedCalc.effectiveDiscountPercentage === 40, `Desconto acumulado é 40% (obtido: ${couponFixedCalc.effectiveDiscountPercentage}%)`);

// 5. TESTE DE DESCONTO ADICIONAL VIA PIX
console.log("\n[Grupo 5] Desconto Adicional no PIX (À Vista):");
const pixCalc = calculateFullSavings({
  originalPrice: 2000.00,
  promoPrice: 1000.00, // 50% OFF
  pixDiscountPercentage: 10 // 10% adicional no PIX = 900 final (55% OFF)
});

assert(pixCalc.finalPrice === 900.00, `Preço final com PIX 10% é R$ 900.00 (obtido: ${pixCalc.finalPrice})`);
assert(pixCalc.totalSavingsAmount === 1100.00, `Economia total com PIX é R$ 1.100,00 (obtido: ${pixCalc.totalSavingsAmount})`);
assert(pixCalc.effectiveDiscountPercentage === 55, `Desconto acumulado com PIX é 55% (obtido: ${pixCalc.effectiveDiscountPercentage}%)`);

// 6. TESTE DE NÍVEIS DE URGÊNCIA PSICOLÓGICA (GETDEALURGENCY)
console.log("\n[Grupo 6] Classificação de Urgência Psicológica da Oferta:");
const urgencyBug = getDealUrgency(65);
assert(urgencyBug.level === "price_bug", "Desconto >= 60% classificado como price_bug");
assert(urgencyBug.badgeLabel === "BUG DE PREÇO HISTÓRICO", "Badge label 'BUG DE PREÇO HISTÓRICO'");
assert(urgencyBug.emoji === "🚨", "Emoji de sirene 🚨 para bug de preço");

const urgencySuper = getDealUrgency(45);
assert(urgencySuper.level === "super_deal", "Desconto de 45% classificado como super_deal");
assert(urgencySuper.badgeLabel === "SUPER PECHINCHA VIP", "Badge label 'SUPER PECHINCHA VIP'");
assert(urgencySuper.emoji === "🔥", "Emoji de fogo 🔥 para super pechincha");

const urgencyGreat = getDealUrgency(30);
assert(urgencyGreat.level === "great_deal", "Desconto de 30% classificado como great_deal");
assert(urgencyGreat.badgeLabel === "ÓTIMA OPORTUNIDADE", "Badge label 'ÓTIMA OPORTUNIDADE'");

const urgencyModerate = getDealUrgency(15);
assert(urgencyModerate.level === "moderate_deal", "Desconto de 15% classificado como moderate_deal");
assert(urgencyModerate.badgeLabel === "DESCONTO MODERADO", "Badge label 'DESCONTO MODERADO'");

// 7. TESTE DE HEADLINES DE DESTAQUE PRONTAS PARA TELEGRAM E WHATSAPP
console.log("\n[Grupo 7] Headlines Prontas de Economia:");
assert(
  baseCalc.headlineTelegram.includes("Você economiza: R$ 550,90 (42% OFF)"),
  "Headline Telegram contém economia e percentual formatados"
);
assert(
  baseCalc.headlineWhatsApp.includes("Você economiza: R$ 550,90 (42% OFF)"),
  "Headline WhatsApp contém economia e percentual formatados"
);

// 8. TESTE DE VALIDAÇÃO E CASOS LIMITES
console.log("\n[Grupo 8] Casos Limites e Prevenção de Erros:");
const invalidNegative = calculateFullSavings({ originalPrice: -100, promoPrice: 50 });
assert(invalidNegative.isValid === false, "Inválido com preço original negativo");

const invalidPromoHigher = calculateFullSavings({ originalPrice: 100, promoPrice: 150 });
assert(invalidPromoHigher.isValid === false, "Inválido quando preço promo é maior que original");

console.log(`\n======================================================`);
console.log(`TOTAL DE TESTES: ${totalTests}`);
console.log(`APROVADOS:       ${passedTests}`);
console.log(`FALHAS:          ${totalTests - passedTests}`);
console.log(`TAXA DE SUCESSO: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
console.log(`======================================================`);

if (passedTests === totalTests) {
  console.log(">> HOMOLOGAÇÃO DA ETAPA 074 CONCLUÍDA COM SUCESSO! <<");
  process.exit(0);
} else {
  process.exit(1);
}
