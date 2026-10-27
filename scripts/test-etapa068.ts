/**
 * test-etapa068.ts - Suíte de Testes da Etapa 068:
 * Gerador e Validador de Links Rastreados com Parâmetros UTM para Direct Message
 * Capitania #13: V5 Apollo Poster (:3011)
 */

import { 
  slugifyUtmParam, 
  sanitizeBaseUrl, 
  generateTrackedDmUrl, 
  parseTrackedDmUrl, 
  validateTrackedDmUrl 
} from "../src/lib/comments/trackedLinkGenerator";
import { simulateCommentInteraction } from "../src/lib/comments/commentSimulationEngine";
import { CommentRule } from "../src/types/poster";

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

console.log("=== INICIANDO TESTES DA ETAPA 068 (TRACKED LINK GENERATOR COM UTM DEDICADO) ===\n");

// 1. TESTES DE NORMALIZAÇÃO DE SLUG
console.log("[Grupo 1] Normalização de Slugs UTM (slugifyUtmParam):");
assert(
  slugifyUtmParam("Promoção de Verão 2026!") === "promocao-de-verao-2026",
  "Remove acentos e pontuação adequadamente"
);
assert(
  slugifyUtmParam("EU QUERO O LINK!!!") === "eu-quero-o-link",
  "Converte maiúsculas e remove exclamações consecutivas"
);
assert(
  slugifyUtmParam("---teste--slug---") === "teste-slug",
  "Remove hífens nas extremidades e colapsa múltiplos hífens"
);

// 2. TESTES DE SANITIZAÇÃO DE URL BASE
console.log("\n[Grupo 2] Sanitização de URL Base (sanitizeBaseUrl):");
assert(
  sanitizeBaseUrl("v5autoblog.com/artigo") === "https://v5autoblog.com/artigo",
  "Adiciona https:// quando omitido"
);
assert(
  sanitizeBaseUrl("http://insecure-site.com/oferta") === "http://insecure-site.com/oferta",
  "Preserva http:// existente"
);
assert(
  sanitizeBaseUrl("https://v5finders.com/promo") === "https://v5finders.com/promo",
  "Mantém https:// intacto"
);

// 3. TESTES DE GERAÇÃO DE LINK COM UTM DEDICADO
console.log("\n[Grupo 3] Geração de URLs Rastreadas (generateTrackedDmUrl):");
const igLink = generateTrackedDmUrl({
  baseUrl: "https://v5autoblog.com/artigo/agentes-autonomos",
  platform: "instagram",
  campaign: "Reels Agentes Autonomos",
  matchedKeyword: "QUERO",
  couponCode: "apollo10"
});

assert(igLink.isValidUrl, "URL gerada é formalmente válida");
assert(igLink.utmSource === "ig_comment_dm", "utm_source é ig_comment_dm no Instagram");
assert(igLink.utmMedium === "direct_message", "utm_medium é direct_message por padrão");
assert(igLink.utmCampaign === "reels-agentes-autonomos", "utm_campaign é o slug normalizado");
assert(igLink.utmContent === "trigger_quero", "utm_content prefixa trigger_ com o gatilho");
assert(igLink.utmTerm === "quero", "utm_term contém o termo normalizado");
assert(igLink.couponParam === "APOLLO10", "couponParam é convertido para caixa alta");
assert(igLink.finalUrl.includes("coupon=APOLLO10"), "URL final contém o parâmetro coupon");

// 4. TESTE NA PLATAFORMA TIKTOK
console.log("\n[Grupo 4] Suporte Onicanal TikTok:");
const tiktokLink = generateTrackedDmUrl({
  baseUrl: "https://v5finders.com/achadinhos",
  platform: "tiktok",
  campaign: "TikTok Viral Achadinho 01",
  matchedKeyword: "link"
});
assert(tiktokLink.utmSource === "tiktok_comment_dm", "utm_source é tiktok_comment_dm no TikTok");
assert(tiktokLink.finalUrl.includes("utm_source=tiktok_comment_dm"), "URL final reflete tiktok_comment_dm");

// 5. TESTE DE PRESERVAÇÃO DE QUERY PARAMS PREEXISTENTES E HASHES
console.log("\n[Grupo 5] Preservação de Query Params e #Hashes:");
const complexLink = generateTrackedDmUrl({
  baseUrl: "https://v5autoblog.com/checkout?ref=afiliado123&origem=live#formulario",
  platform: "instagram",
  campaign: "Live Especial",
  matchedKeyword: "desconto",
  couponCode: "VIP50"
});
assert(complexLink.finalUrl.includes("ref=afiliado123"), "Preserva parâmetro ref preexistente");
assert(complexLink.finalUrl.includes("origem=live"), "Preserva parâmetro origem preexistente");
assert(complexLink.finalUrl.includes("#formulario"), "Preserva o fragmento #formulario no final da URL");
assert(complexLink.finalUrl.includes("utm_source=ig_comment_dm"), "Adiciona utm_source junto aos existentes");
assert(complexLink.finalUrl.includes("coupon=VIP50"), "Adiciona parâmetro coupon");

// 6. TESTE DE PARSER DE URL RASTREADA
console.log("\n[Grupo 6] Parser de URLs Rastreadas (parseTrackedDmUrl):");
const parsed = parseTrackedDmUrl(complexLink.finalUrl);
assert(parsed.hasValidDmUtm === true, "Reconhece UTM de DM como válida");
assert(parsed.utmSource === "ig_comment_dm", "Decodifica utm_source corretamente");
assert(parsed.utmMedium === "direct_message", "Decodifica utm_medium corretamente");
assert(parsed.coupon === "VIP50", "Decodifica cupom de desconto");
assert(parsed.otherParams["ref"] === "afiliado123", "Decodifica outros parâmetros não-UTM");

// 7. TESTE DO VALIDADOR DE CONFORMIDADE
console.log("\n[Grupo 7] Validador de Conformidade (validateTrackedDmUrl):");
const validCheck = validateTrackedDmUrl(igLink.finalUrl);
assert(validCheck.isValid === true, "URL completa é validada como 100% conforme");
assert(validCheck.warnings.length === 0, "Nenhum aviso para URL com UTM completo");

const invalidCheck = validateTrackedDmUrl("http://v5autoblog.com/sem-utm");
assert(invalidCheck.isValid === false, "URL sem UTM e sem HTTPS é reprovada");
assert(invalidCheck.hasHttps === false, "Alerta falta de HTTPS");
assert(invalidCheck.hasSource === false, "Alerta falta de utm_source");
assert(invalidCheck.warnings.length >= 2, "Emite múltiplos alertas instrutivos");

// 8. TESTE DE INTEGRAÇÃO COM O SIMULADOR DE COMENTÁRIOS
console.log("\n[Grupo 8] Integração com o Simulador de Comentários:");
const mockRule: CommentRule = {
  id: "rule_test_utm",
  name: "Campanha Black Friday AutoBlog",
  platform: "instagram",
  targetPostId: "all_posts",
  matchMode: "contains",
  keywords: ["LINK", "QUERO"],
  publicReplyVariants: ["Enviado na DM! 🔥", "Confira seu direct! 🚀"],
  dmMessageTemplate: "Olá {{nome}}! Seu link exclusivo é: {{ctaUrl}} (Cupom: {{cupom}})",
  ctaUrl: "https://v5autoblog.com/black-friday",
  couponCode: "BF50",
  isActive: true,
  totalTriggered: 0
};

async function testSimulatorIntegration() {
  const simResult = await simulateCommentInteraction({
    commentText: "Eu quero esse link agora!",
    username: "@rodrigo_mkt",
    rule: mockRule,
    platform: "instagram"
  });

  assert(simResult.isTriggerMatched === true, "Simulador reconhece o gatilho");
  assert(simResult.trackedUrl !== undefined, "Simulador gerou o trackedUrl");
  assert(
    Boolean(simResult.trackedUrl?.finalUrl.includes("utm_source=ig_comment_dm")),
    "URL rastreada no simulador possui utm_source"
  );
  assert(
    Boolean(simResult.dmMessageText?.includes("utm_source=ig_comment_dm")),
    "Mensagem final da DM contém o link rastreado com UTM interpolado"
  );
  assert(
    Boolean(simResult.dmMessageText?.includes("BF50")),
    "Mensagem final da DM contém o cupom de desconto interpolado"
  );

  console.log(`\n======================================================`);
  console.log(`TOTAL DE TESTES: ${totalTests}`);
  console.log(`APROVADOS:       ${passedTests}`);
  console.log(`FALHAS:          ${totalTests - passedTests}`);
  console.log(`TAXA DE SUCESSO: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log(`======================================================`);

  if (passedTests === totalTests) {
    console.log(">> HOMOLOGAÇÃO DA ETAPA 068 CONCLUÍDA COM SUCESSO! <<");
    process.exit(0);
  } else {
    process.exit(1);
  }
}

testSimulatorIntegration();
