/**
 * test-etapa049.ts - Validação Automatizada da Etapa 049
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Valida o Inspecionador de JSON Schema e Validador de Rich Results do Google:
 * 1. Conformidade estrita com Schema.org BlogPosting / Article (Search Central)
 * 2. Requisitos de elegibilidade para Google Discover (largura >= 1200px)
 * 3. Elegibilidade para Google Top Stories (Publisher Logo ImageObject)
 * 4. Salvaguardas Anti-Cloaking para Artigos com Paywall (hasPart + cssSelector)
 * 5. Resiliência de parse a tags HTML <script type="application/ld+json">
 * 6. Detecção precisa de erros bloqueantes vs avisos otimizáveis
 * 7. Avaliação de prontidão AEO (Perplexity / ChatGPT Search / Gemini AI Overviews)
 */

import { validateGoogleRichResults } from "../src/lib/seo/richResultsValidator";
import { generateBlogPostingSchema, generateBreadcrumbSchema } from "../src/lib/dispatch/schemaGenerator";

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
console.log(" INICIANDO BATERIA DE TESTES - ETAPA 049: VALIDADOR DE RICH RESULTS GOOGLE");
console.log("================================================================================\n");

// 1. Validação de Schema BlogPosting 100% Completo e Válido
console.log("[1/7] Testando Schema BlogPosting Completo e Elegível...");
const fullArticleSchema = generateBlogPostingSchema({
  title: "Como Construir Agentes Autônomos em TypeScript e Next.js 14",
  headline: "Como Construir Agentes Autônomos em TypeScript e Next.js 14",
  description: "Guia completo de arquitetura para implementar agentes autônomos cognitivos com MCP, RAG e execução serverless.",
  contentMarkdown: "Artigo detalhado de arquitetura técnica de microsserviços.",
  canonicalUrl: "https://v5autoblog.com/artigo/agentes-autonomos-typescript",
  coverImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
  coverImageAlt: "Redes neurais conectadas em cluster distribuído",
  authorName: "Apollo La Plata",
  authorRole: "Editor Chefe & Arquiteto de Sistemas",
  authorUrl: "https://v5autoblog.com/autor/apollo-laplata",
  category: "Inteligência Artificial",
  tags: ["IA", "Agentes", "NextJS"],
  hasPaywall: false,
  articleType: "BlogPosting"
});

const reportFull = validateGoogleRichResults(fullArticleSchema);

assert(reportFull.isValid, "Schema completo deve ser considerado 100% válido pelo validador");
assert(reportFull.overallScore >= 90, `Score deve ser >= 90% (obtido: ${reportFull.overallScore}%)`);
assert(reportFull.summary.errors === 0, "Nenhum erro bloqueante detectado");
assert(reportFull.detectedType === "BlogPosting", "Tipo BlogPosting detectado corretamente");
console.log("  -> Schema completo validado com pontuação máxima.\n");

// 2. Teste de Elegibilidade para Google Discover Feed
console.log("[2/7] Testando Critérios Oficiais do Google Discover (Largura >= 1200px)...");
const discoverFeature = reportFull.features.find(f => f.feature === "google_discover");
assert(discoverFeature !== undefined, "Feature Google Discover mapeada no relatório");
assert(discoverFeature?.eligible === true, "Artigo com imagem de 1200px é elegível para Google Discover");
assert(discoverFeature?.score! >= 90, "Score de elegibilidade para Discover alto");

// Teste com imagem menor que 1200px
const lowResSchema = {
  ...fullArticleSchema,
  image: {
    "@type": "ImageObject",
    url: "https://example.com/small.jpg",
    width: 800,
    height: 450
  }
};
const reportLowRes = validateGoogleRichResults(lowResSchema);
const lowResDiscover = reportLowRes.features.find(f => f.feature === "google_discover");
assert(lowResDiscover?.eligible === false, "Imagem < 1200px deve desqualificar para Discover Card");
assert(Boolean(lowResDiscover?.blockers.some(b => b.includes("1200px"))), "Mensagem explicita requisito de 1200px");
console.log("  -> Requisitos do Google Discover auditados com sucesso.\n");

// 3. Teste de Elegibilidade para Top Stories e Carrossel de Notícias
console.log("[3/7] Testando Top Stories e Validação de Publisher com Logotipo...");
const topStoriesFeature = reportFull.features.find(f => f.feature === "top_stories");
assert(topStoriesFeature !== undefined, "Feature Top Stories mapeada");
assert(topStoriesFeature?.eligible === true, "Publisher com logo ImageObject qualifica para Top Stories");

const noPublisherSchema = { ...fullArticleSchema, publisher: undefined };
const reportNoPub = validateGoogleRichResults(noPublisherSchema);
const noPubStories = reportNoPub.features.find(f => f.feature === "top_stories");
assert(noPubStories?.eligible === false, "Falta de publisher desqualifica Top Stories");
console.log("  -> Elegibilidade para Top Stories validada com sucesso.\n");

// 4. Teste de Diretivas Anti-Cloaking para Artigos com Paywall
console.log("[4/7] Testando Salvaguardas Anti-Cloaking para Paywalls...");
const paywallProtectedSchema = generateBlogPostingSchema({
  title: "Estratégia Confidencial de Arbitragem com IA",
  description: "Análise restrita com código proprietário para membros assinantes VIP.",
  contentMarkdown: "Parte pública.\n\n<!-- PAYWALL_BREAK -->\n\nParte restrita paga.",
  canonicalUrl: "https://v5autoblog.com/artigo/estrategia-confidencial-ia",
  hasPaywall: true
});

const reportPaywall = validateGoogleRichResults(paywallProtectedSchema);
const paywallCheck = reportPaywall.checks.find(c => c.id === "paywall_anticloaking");
assert(paywallCheck !== undefined, "Checagem de anti-cloaking executada");
assert(paywallCheck?.status === "pass", "Configuração de Paywall aprovada com hasPart e cssSelector");

// Artigo fechado sem hasPart (Risco de Cloaking)
const cloakingRiskSchema = {
  ...fullArticleSchema,
  isAccessibleForFree: false,
  hasPart: undefined
};
const reportCloaking = validateGoogleRichResults(cloakingRiskSchema);
const cloakingCheck = reportCloaking.checks.find(c => c.id === "paywall_anticloaking");
assert(cloakingCheck?.status === "warn", "Falta de hasPart em paywall gera aviso crítico de cloaking");
console.log("  -> Salvaguarda Anti-Cloaking para Paywalls validada com sucesso.\n");

// 5. Teste de Detecção de Erros Críticos Bloqueantes
console.log("[5/7] Testando Detecção de Erros Críticos Bloqueantes...");
const invalidSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  // Sem headline
  // Sem image
  // Sem author
  // Sem datePublished
  description: "Artigo corrompido sem campos obrigatórios"
};

const reportInvalid = validateGoogleRichResults(invalidSchema);
assert(!reportInvalid.isValid, "Schema incompleto deve falhar em isValid");
assert(reportInvalid.summary.errors >= 3, `Deve detectar múltiplos erros bloqueantes (detectados: ${reportInvalid.summary.errors})`);
assert(reportInvalid.overallScore <= 50, `Score deve ser penalizado severamente (obtido: ${reportInvalid.overallScore}%)`);
assert(reportInvalid.checks.some(c => c.id === "headline_required" && c.status === "fail"), "Erro de headline capturado");
assert(reportInvalid.checks.some(c => c.id === "image_required" && c.status === "fail"), "Erro de imagem capturado");
assert(reportInvalid.checks.some(c => c.id === "author_required" && c.status === "fail"), "Erro de autor capturado");
console.log("  -> Detecção de erros críticos bloqueantes validada com rigor.\n");

// 6. Teste de Parse de Tag HTML <script type="application/ld+json">
console.log("[6/7] Testando Parse e Limpeza de Bloco HTML <script>...");
const htmlScriptInput = `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Injeção de Script Teste",
  "image": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
  "author": { "@type": "Person", "name": "Apollo La Plata" },
  "datePublished": "2026-10-27T07:00:00Z",
  "mainEntityOfPage": "https://v5autoblog.com/artigo/teste"
}
</script>
`;

const reportHtml = validateGoogleRichResults(htmlScriptInput);
assert(reportHtml.isValid, "Validador deve extrair e parsear JSON de dentro da tag <script>");
assert(reportHtml.checks.some(c => c.id === "json_syntax" && c.status === "pass"), "Parse sintático aprovado");
assert(reportHtml.htmlScriptTag.includes("<script type=\"application/ld+json\">"), "Exportação pronta de tag script mantida");
console.log("  -> Limpeza e parse de tags HTML concluídos com sucesso.\n");

// 7. Teste de Breadcrumbs e AEO (Motores de Busca Generativos)
console.log("[7/7] Testando BreadcrumbList e Prontidão AEO (AI Search)...");
const breadcrumbs = generateBreadcrumbSchema({
  category: "Inteligência Artificial",
  articleTitle: "Como Construir Agentes Autônomos",
  articleUrl: "https://v5autoblog.com/artigo/agentes-autonomos",
  baseUrl: "https://v5autoblog.com"
});

assert(breadcrumbs["@type"] === "BreadcrumbList", "Tipo BreadcrumbList gerado");
assert(breadcrumbs.itemListElement.length === 3, "Trilha com 3 níveis (Home › Categoria › Artigo)");
assert(breadcrumbs.itemListElement[0].position === 1, "Posição inicial 1");

const aeoFeature = reportFull.features.find(f => f.feature === "ai_overviews");
assert(aeoFeature !== undefined, "Feature AEO / Citações de IA mapeada");
assert(aeoFeature?.eligible === true, "Schema estruturado com autor e data qualifica para citação em AEO");
console.log("  -> Breadcrumbs e prontidão AEO validados com sucesso.\n");

console.log("================================================================================");
console.log(` RESULTADO FINAL: ${passedTests}/${totalTests} TESTES APROVADOS COM SUCESSO!`);
console.log(" ETAPA 049 CONCLUÍDA E HOMOLOGADA COM PRECISÃO CIRÚRGICA.");
console.log("================================================================================");
