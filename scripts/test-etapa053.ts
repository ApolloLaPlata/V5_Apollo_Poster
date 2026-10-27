/**
 * test-etapa053.ts - Validação Automatizada da Etapa 053
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Valida o Gerador de Teasers para Threads (Meta) com Tom Conversacional e Chamada para Bio:
 * 1. 4 Modelos de Tom Conversacional (Bastidores, Pergunta de Debate, Hot Take, Mini-História)
 * 2. 3 Modos de CTA (Link na Bio, Link Direto no Post, 1º Comentário)
 * 3. Garantia matemática de conformidade com o limite de 500 caracteres
 * 4. Tag única de tópico recomendada para o Threads
 * 5. Injeção de link canônico com UTM rastreada para threads
 * 6. Teste de resiliência e adaptação a textos ultra-extensos
 */

import { 
  generateAllThreadsVariants, 
  generateThreadsVariant,
  THREADS_TONE_TEMPLATES,
  THREADS_CTA_TEXTS,
  ThreadsCtaMode,
  ThreadsToneType
} from "../src/lib/social/threadsTeaserGenerator";
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
console.log(" INICIANDO BATERIA DE TESTES - ETAPA 053: GERADOR DE TEASERS PARA THREADS");
console.log("================================================================================\n");

const samplePayload: MultimodalDispatchPayload = {
  id: "threads_test_053",
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
    utmCampaign: "threads_launch"
  },
  socialTeaserOptions: {
    enabled: true,
    platforms: ["threads"]
  },
  dispatchStatus: {
    overall: "idle",
    email: { status: "idle" },
    blog: { status: "idle" },
    social: { status: "idle" }
  }
};

// 1. Teste de Modelos de Tom Conversacional
console.log("[1/6] Testando Templates de Tons Conversacionais do Threads...");
assert(THREADS_TONE_TEMPLATES.length === 4, "Exatamente 4 modelos de tom configurados");
const toneTypes = THREADS_TONE_TEMPLATES.map(t => t.type);
assert(toneTypes.includes("build_in_public"), "Tom de Bastidores / Build in Public presente (🛠️)");
assert(toneTypes.includes("debate_question"), "Tom de Debate / Pergunta Aberta presente (💬)");
assert(toneTypes.includes("hot_take"), "Tom de Opinião Forte / Hot Take presente (☕)");
assert(toneTypes.includes("mini_story"), "Tom de Mini-História presente (📖)");
console.log("  -> Tons conversacionais validados com sucesso.\n");

// 2. Teste dos 3 Modos de Chamada para Ação (CTA)
console.log("[2/6] Testando os 3 Modos de CTA (Bio, Link Direto, 1º Comentário)...");
const ctaBio = generateThreadsVariant(samplePayload, THREADS_TONE_TEMPLATES[0], "bio");
assert(ctaBio.text.includes("link da bio"), "Modo 'bio' inclui chamada para o link na bio");
assert(ctaBio.ctaMode === "bio", "ctaMode registrado como 'bio'");

const ctaDirect = generateThreadsVariant(samplePayload, THREADS_TONE_TEMPLATES[0], "direct_link");
assert(ctaDirect.text.includes("https://v5autoblog.com"), "Modo 'direct_link' inclui a URL no corpo do post");
assert(ctaDirect.utmUrl.includes("utm_source=threads"), "UTM para threads presente no link direto");

const ctaComment = generateThreadsVariant(samplePayload, THREADS_TONE_TEMPLATES[0], "first_comment");
assert(ctaComment.text.includes("primeiro comentário"), "Modo 'first_comment' inclui chamada para o comentário fixado");
console.log("  -> Todos os 3 modos de CTA validados com sucesso.\n");

// 3. Teste de Limite Estrito de 500 Caracteres
console.log("[3/6] Testando Limite Estrito de 500 Caracteres em Todas as Combinações...");
const ctaModes: ThreadsCtaMode[] = ["bio", "direct_link", "first_comment"];

for (const tmpl of THREADS_TONE_TEMPLATES) {
  for (const mode of ctaModes) {
    const variant = generateThreadsVariant(samplePayload, tmpl, mode);
    assert(variant.charCount <= 500, `Tom ${tmpl.type} + CTA ${mode}: ${variant.charCount}/500 caracteres (<= 500)`);
    assert(variant.isWithinLimit === true, `isWithinLimit é true para ${tmpl.type} + ${mode}`);
    assert(variant.primaryTopicTag.startsWith("#"), "Tag de tópico presente com prefixo #");
  }
}
console.log("  -> Todas as 12 combinações respeitam rigorosamente os 500 caracteres.\n");

// 4. Teste de Geração Completa de Variantes (generateAllThreadsVariants)
console.log("[4/6] Testando generateAllThreadsVariants...");
const allVariants = generateAllThreadsVariants(samplePayload, "direct_link");
assert(allVariants.length === 4, "Retorna as 4 variantes de tom para o operador");
assert(allVariants.every(v => v.charLimit === 500), "charLimit é 500 em todas as variantes");
assert(allVariants.every(v => v.remainingChars >= 0), "remainingChars é não-negativo em todas");
console.log("  -> generateAllThreadsVariants aprovado.\n");

// 5. Teste de Resiliência a Título e Resumo Gigantes
console.log("[5/6] Testando Resiliência a Conteúdo Gigante...");
const giantPayload: MultimodalDispatchPayload = {
  ...samplePayload,
  title: "Guia Absolutamente Completo e Abrangente Sobre a Engenharia de Agentes Autônomos de Alta Concorrência em Sistemas Distribuídos Modernos",
  summary: "Este é um resumo colossal com centenas de palavras explicativas concebido propositalmente para tentar causar overflow acima do limite de quinhentos caracteres no Threads da Meta."
};

for (const tmpl of THREADS_TONE_TEMPLATES) {
  const giantVariant = generateThreadsVariant(giantPayload, tmpl, "direct_link");
  assert(giantVariant.charCount <= 500, `Conteúdo gigante (${tmpl.type}): ${giantVariant.charCount}/500 caracteres`);
  assert(giantVariant.isWithinLimit === true, "isWithinLimit permanece true em condições de stress");
}
console.log("  -> Resiliência e truncamento seguro do Threads homologados com sucesso.\n");

// 6. Teste de Metadados e IDs para Renderização em UI
console.log("[6/6] Validando IDs e Metadados para Renderização no ThreadsTeaserCard...");
const ids = new Set(allVariants.map(v => v.id));
assert(ids.size === 4, "IDs únicos para todas as 4 variantes de tom");
assert(allVariants.every(v => v.toneLabel.length > 5), "Labels de tom informativos");
console.log("  -> Metadados e IDs para UI validados com sucesso.\n");

console.log("================================================================================");
console.log(` RESULTADO FINAL: ${passedTests}/${totalTests} TESTES APROVADOS COM SUCESSO!`);
console.log(" ETAPA 053 CONCLUÍDA E HOMOLOGADA COM PRECISÃO CIRÚRGICA.");
console.log("================================================================================");
