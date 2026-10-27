/**
 * test-etapa052.ts - Validação Automatizada da Etapa 052
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Valida o Gerador de Teasers para X/Twitter (280 caracteres, ganchos e emojis):
 * 1. 5 Modelos de Ganchos Virais pré-calibrados (Curiosity, Playbook, Contrarian, Data, Anúncio)
 * 2. Cálculo de Peso Oficial do Twitter (URLs contam como 23 caracteres via t.co)
 * 3. Garantia matemática de conformidade estrita (<= 280 caracteres ponderados)
 * 4. Preservação de URLs canônicas com UTMs dedicadas
 * 5. Resiliência de truncamento para artigos com títulos e resumos ultra-longos
 * 6. Estrutura de dados das variantes para o componente visual TwitterTeaserCard
 */

import { 
  generateAllTwitterVariants, 
  generateTwitterVariantForHook,
  calculateTwitterWeightedLength,
  TWITTER_HOOK_TEMPLATES,
  TwitterHookType
} from "../src/lib/social/twitterTeaserGenerator";
import { MultimodalDispatchPayload } from "../src/types/poster";

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("================================================================================");
console.log(" INICIANDO BATERIA DE TESTES - ETAPA 052: GERADOR DE TEASERS PARA X / TWITTER");
console.log("================================================================================\n");

// Payload com título e resumo realísticos da Holding V5
const samplePayload: MultimodalDispatchPayload = {
  id: "tw_test_052",
  title: "Como Escalar Agentes Autônomos em Produção com Alta Disponibilidade e Memória Contínua",
  slug: "como-escalar-agentes-autonomos-producao-alta-disponibilidade",
  canonical_url: "https://v5autoblog.com/artigo/como-escalar-agentes-autonomos-producao-alta-disponibilidade",
  summary: "Guia completo demonstrando a arquitetura de múltiplos agentes trabalhando em paralelo com checkpointing determinístico e recuperação de falhas sem gargalos de concorrência.",
  contentMarkdown: "Conteúdo completo com especificações técnicas e diagramas.",
  coverImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
  blogOptions: {
    enabled: true,
    targetPlatform: "v5autoblog",
    targetEndpoint: "https://v5autoblog.com/api/v1/posts",
    category: "Inteligência Artificial",
    tags: ["Agentes Autônomos", "Inteligência Artificial", "TypeScript"],
    author: "Apollo La Plata",
    generateSchema: true
  },
  emailOptions: {
    enabled: true,
    subject: "Como Escalar Agentes",
    previewText: "Guia completo demonstrando a arquitetura de agentes.",
    fromName: "Apollo La Plata",
    provider: "resend",
    audienceList: "Tech VIP",
    utmCampaign: "twitter_launch"
  },
  socialTeaserOptions: {
    enabled: true,
    platforms: ["x_twitter"]
  },
  dispatchStatus: {
    overall: "idle",
    email: { status: "idle" },
    blog: { status: "idle" },
    social: { status: "idle" }
  }
};

// 1. Teste de Modelos de Ganchos
console.log("[1/6] Testando Templates dos 5 Modelos de Ganchos para o X...");
assert(TWITTER_HOOK_TEMPLATES.length === 5, "Exatamente 5 modelos de ganchos virais configurados");
const hookTypes = TWITTER_HOOK_TEMPLATES.map(t => t.type);
assert(hookTypes.includes("curiosity"), "Gancho de Curiosidade presente (🧵)");
assert(hookTypes.includes("playbook"), "Gancho de Playbook presente (⚡)");
assert(hookTypes.includes("contrarian"), "Gancho Contrário presente (🔥)");
assert(hookTypes.includes("data_insight"), "Gancho de Insight presente (💡)");
assert(hookTypes.includes("direct_announcement"), "Gancho de Anúncio presente (🚀)");
console.log("  -> Templates de ganchos validados com sucesso.\n");

// 2. Teste do Calculador de Peso Ponderado do Twitter (t.co = 23 caracteres)
console.log("[2/6] Testando Cálculo de Peso do Twitter (t.co)...");
const sampleUrl = "https://v5autoblog.com/artigo/como-escalar-agentes-autonomos-producao-alta-disponibilidade?utm_source=x_twitter&utm_medium=social_teaser";
const sampleText = `🚀 Título de Teste\n\nLeia mais aqui: ${sampleUrl}\n\n#IA`;
const rawLength = sampleText.length;
const weightedLength = calculateTwitterWeightedLength(sampleText, sampleUrl);
const expectedWeighted = rawLength - sampleUrl.length + 23;
assert(weightedLength === expectedWeighted, `Peso ponderado calculado corretamente: ${weightedLength}c (esperado: ${expectedWeighted}c)`);
assert(weightedLength < rawLength, "Peso ponderado é menor que o raw devido ao encurtamento t.co oficial");
console.log("  -> Calculador de peso ponderado do Twitter validado com sucesso.\n");

// 3. Teste de Geração de Múltiplas Variantes
console.log("[3/6] Testando Geração de Todas as 5 Variantes (generateAllTwitterVariants)...");
const variants = generateAllTwitterVariants(samplePayload);
assert(variants.length === 5, "5 variantes geradas para o operador escolher");

for (const variant of variants) {
  assert(variant.twitterWeightedCount <= 280, `Variante ${variant.hookType} respeita limite oficial: ${variant.twitterWeightedCount}/280c`);
  assert(variant.isWithinLimit === true, `Variante ${variant.hookType} possui isWithinLimit=true`);
  assert(variant.utmUrl.includes("utm_source=x_twitter"), `Variante ${variant.hookType} contém UTM para x_twitter`);
  assert(variant.hashtags.length > 0, `Variante ${variant.hookType} contém hashtags`);
}
console.log("  -> Todas as 5 variantes geradas e validadas dentro de 280 caracteres.\n");

// 4. Teste Específico por Tipo de Gancho
console.log("[4/6] Testando Ganchos Individuais...");
const curiosityVariant = variants.find(v => v.hookType === "curiosity")!;
assert(curiosityVariant.emoji === "🧵", "Emoji 🧵 no gancho de curiosidade");
assert(curiosityVariant.text.includes("🧵 A maioria ainda não percebeu"), "Prefixo conversacional de curiosidade inserido");

const contrarianVariant = variants.find(v => v.hookType === "contrarian")!;
assert(contrarianVariant.emoji === "🔥", "Emoji 🔥 no gancho contrário");
assert(contrarianVariant.text.includes("🔥 Por que métodos tradicionais falham"), "Prefixo provocativo inserido");

const announcementVariant = variants.find(v => v.hookType === "direct_announcement")!;
assert(announcementVariant.emoji === "🚀", "Emoji 🚀 no anúncio");
assert(announcementVariant.text.includes("🚀 NOVO ARTIGO NA CAPITANIA #13"), "Prefixo de anúncio oficial inserido");
console.log("  -> Ganchos individuais validados com sucesso.\n");

// 5. Teste de Resiliência a Títulos Extremos (> 120 caracteres)
console.log("[5/6] Testando Resiliência a Título Extremamente Longo...");
const giantTitlePayload: MultimodalDispatchPayload = {
  ...samplePayload,
  title: "Guia Definitivo e Absolutamente Exaustivo Sobre a Engenharia de Agentes Autônomos em Ambientes Corporativos de Missão Crítica com Alta Concorrência e Tolerância a Falhas",
  summary: "Texto explicativo gigante para tentar forçar o estouro de limite de 280 caracteres no Twitter."
};

const giantVariants = generateAllTwitterVariants(giantTitlePayload);
for (const v of giantVariants) {
  assert(v.twitterWeightedCount <= 280, `Título gigante: Variante ${v.hookType} adaptada com sucesso (${v.twitterWeightedCount}/280c)`);
  assert(v.isWithinLimit === true, "Título gigante: isWithinLimit permanece true");
  assert(v.text.includes("https://"), "Título gigante: Link mantido preservado");
}
console.log("  -> Resiliência a títulos extremos homologada com sucesso.\n");

// 6. Teste de Metadados e IDs Únicos para UI
console.log("[6/6] Validando IDs e Metadados para Renderização no TwitterTeaserCard...");
const ids = new Set(variants.map(v => v.id));
assert(ids.size === 5, "Todos os 5 IDs de variante são únicos para uso em React keys");
assert(variants.every(v => v.hookLabel.length > 5), "Todos os labels de botões têm descrição clara");
console.log("  -> Metadados e IDs para UI validados com sucesso.\n");

console.log("================================================================================");
console.log(` RESULTADO FINAL: ${passedTests}/${totalTests} TESTES APROVADOS COM SUCESSO!`);
console.log(" ETAPA 052 CONCLUÍDA E HOMOLOGADA COM PRECISÃO CIRÚRGICA.");
console.log("================================================================================");
