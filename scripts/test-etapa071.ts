/**
 * test-etapa071.ts - Suíte de Testes da Etapa 071:
 * Conexão do Despachador de Ofertas (OfferGroupDispatcher.tsx) com os dados das lojas (Shopee, Mercado Livre, Amazon, AliExpress, Magalu)
 * Capitania #13: V5 Apollo Poster (:3011)
 */

import { 
  SUPPORTED_STORES, 
  SupportedStore, 
  detectStoreFromUrl, 
  calculateSavings, 
  validateDealData, 
  SAMPLE_FINDERS_DEALS 
} from "../src/lib/finders/storeConnector";
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

console.log("=== INICIANDO TESTES DA ETAPA 071 (CONECTOR DE LOJAS FINDERS VIP) ===\n");

// 1. TESTE DE CONFIGURAÇÃO DAS 5 LOJAS
console.log("[Grupo 1] Metadados das 5 Lojas Oficiais:");
const expectedStores: SupportedStore[] = ["Shopee", "Mercado Livre", "Amazon", "AliExpress", "Magalu"];
assert(Object.keys(SUPPORTED_STORES).length === 5, "Exatamente 5 lojas mapeadas no conector");

expectedStores.forEach((store) => {
  const meta = SUPPORTED_STORES[store];
  assert(meta !== undefined, `Loja ${store} possui metadados registrados`);
  assert(Boolean(meta.brandColor), `Loja ${store} possui cor oficial (${meta.brandColor})`);
  assert(meta.domainKeywords.length > 0, `Loja ${store} possui palavras-chave de domínio`);
  assert(Boolean(meta.badgeText), `Loja ${store} possui texto de badge oficial ("${meta.badgeText}")`);
});

// 2. TESTE DE AUTO-DETECÇÃO DE LOJA POR URL
console.log("\n[Grupo 2] Auto-Detecção de Loja por URL (detectStoreFromUrl):");
assert(
  detectStoreFromUrl("https://shope.ee/v5_teclado_gamer") === "Shopee",
  "Detecta Shopee por link curto shope.ee"
);
assert(
  detectStoreFromUrl("https://shopee.com.br/product/123/456") === "Shopee",
  "Detecta Shopee por domínio completo shopee.com.br"
);
assert(
  detectStoreFromUrl("https://mercadolivre.com.br/sec/airfryer_pro") === "Mercado Livre",
  "Detecta Mercado Livre por link mercadolivre.com.br"
);
assert(
  detectStoreFromUrl("https://amzn.to/v5_echodot") === "Amazon",
  "Detecta Amazon por link curto amzn.to"
);
assert(
  detectStoreFromUrl("https://amazon.com.br/dp/B09B8V1LZ3") === "Amazon",
  "Detecta Amazon por domínio amazon.com.br"
);
assert(
  detectStoreFromUrl("https://aliexpress.com/item/100500678.html") === "AliExpress",
  "Detecta AliExpress por domínio aliexpress.com"
);
assert(
  detectStoreFromUrl("https://s.click.aliexpress.com/e/_Dk9xyz") === "AliExpress",
  "Detecta AliExpress por link curto s.click.aliexpress.com"
);
assert(
  detectStoreFromUrl("https://magazineluiza.com.br/smart-tv/p/23490") === "Magalu",
  "Detecta Magalu por domínio magazineluiza.com.br"
);
assert(
  detectStoreFromUrl("https://site-desconhecido.com/produto") === "Shopee",
  "Fallback gracioso para Shopee em URLs desconhecidas"
);

// 3. TESTE DE CÁLCULO DE ECONOMIA E DESCONTO
console.log("\n[Grupo 3] Cálculo de Economia e Desconto (calculateSavings):");
const validSavings = calculateSavings(1000, 600);
assert(validSavings.isValid === true, "Cálculo válido com preços consistentes");
assert(validSavings.discountPercentage === 40, "Calcula 40% de desconto corretamente");
assert(validSavings.savingsAmount === 400.0, "Calcula economia de R$ 400.00");

const decimalSavings = calculateSavings(489.0, 289.9);
assert(decimalSavings.discountPercentage === 41, `Calcula 41% de desconto para R$ 489 -> R$ 289.90 (obtido: ${decimalSavings.discountPercentage}%)`);
assert(decimalSavings.savingsAmount === 199.1, "Calcula economia de R$ 199.10");

const invalidSavingsEqual = calculateSavings(100, 100);
assert(invalidSavingsEqual.isValid === false, "Inválido quando preço promocional é igual ao original");

const invalidSavingsHigher = calculateSavings(100, 150);
assert(invalidSavingsHigher.isValid === false, "Inválido quando preço promocional é maior que o original");

const invalidSavingsZero = calculateSavings(0, 50);
assert(invalidSavingsZero.isValid === false, "Inválido quando preço original é zero");

// 4. TESTE DO VALIDADOR DE OFERTAS
console.log("\n[Grupo 4] Validador de Consistência de Oferta (validateDealData):");
const validDeal: Partial<GroupBroadcastDeal> = {
  productName: "Echo Dot 5ª Geração",
  store: "Amazon",
  originalPrice: 429.0,
  promoPrice: 269.1,
  affiliateUrl: "https://amzn.to/v5_echodot"
};
const validCheck = validateDealData(validDeal);
assert(validCheck.isValid === true, "Oferta completa é aprovada sem erros");
assert(validCheck.errors.length === 0, "Lista de erros vazia para oferta válida");

const invalidDealNoName: Partial<GroupBroadcastDeal> = {
  originalPrice: 100,
  promoPrice: 80,
  affiliateUrl: "https://shope.ee/teste"
};
const noNameCheck = validateDealData(invalidDealNoName);
assert(noNameCheck.isValid === false, "Reprova oferta sem nome de produto");
assert(noNameCheck.errors.some(e => e.includes("nome do produto")), "Alerta falta de nome");

const invalidDealPrice: Partial<GroupBroadcastDeal> = {
  productName: "Produto Teste",
  originalPrice: 100,
  promoPrice: 120,
  affiliateUrl: "https://shope.ee/teste"
};
const priceCheck = validateDealData(invalidDealPrice);
assert(priceCheck.isValid === false, "Reprova oferta com preço promocional maior que original");

// 5. TESTE DO CATÁLOGO CURADO DO V5 FINDERS HUB
console.log("\n[Grupo 5] Catálogo de Ofertas Curadas do V5 Finders Hub (SAMPLE_FINDERS_DEALS):");
assert(SAMPLE_FINDERS_DEALS.length === 5, "Exatamente 5 ofertas no seed curado do Finders");

const storesInSample = new Set(SAMPLE_FINDERS_DEALS.map(d => d.store));
assert(storesInSample.size === 5, "Catálogo cobre todas as 5 lojas suportadas");
assert(storesInSample.has("Shopee"), "Catálogo possui oferta Shopee");
assert(storesInSample.has("Mercado Livre"), "Catálogo possui oferta Mercado Livre");
assert(storesInSample.has("Amazon"), "Catálogo possui oferta Amazon");
assert(storesInSample.has("AliExpress"), "Catálogo possui oferta AliExpress");
assert(storesInSample.has("Magalu"), "Catálogo possui oferta Magalu");

SAMPLE_FINDERS_DEALS.forEach(d => {
  const check = validateDealData(d);
  assert(check.isValid, `Oferta seed "${d.productName.substring(0, 25)}..." é 100% válida`);
});

console.log(`\n======================================================`);
console.log(`TOTAL DE TESTES: ${totalTests}`);
console.log(`APROVADOS:       ${passedTests}`);
console.log(`FALHAS:          ${totalTests - passedTests}`);
console.log(`TAXA DE SUCESSO: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
console.log(`======================================================`);

if (passedTests === totalTests) {
  console.log(">> HOMOLOGAÇÃO DA ETAPA 071 CONCLUÍDA COM SUCESSO! <<");
  process.exit(0);
} else {
  process.exit(1);
}
