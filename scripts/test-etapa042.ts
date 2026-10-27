/**
 * V5 APOLLO POSTER - ETAPA 042 TEST SUITE
 * Validação rigorosa do Gerador de Schema.org JSON-LD para BlogPosting / Article (Google Rich Results)
 */

import { 
  generateBlogPostingSchema, 
  generateBreadcrumbSchema, 
  renderSchemaJsonLdScript, 
  validateSchemaCompleteness,
  formatIsoDuration
} from "../src/lib/dispatch/schemaGenerator";

async function runEtapa042Test() {
  console.log("===============================================================================");
  console.log("🚀 TESTANDO ETAPA 042: GERADOR DE SCHEMA.ORG JSON-LD (GOOGLE RICH RESULTS)");
  console.log("===============================================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, msg: string) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${msg}`);
      process.exitCode = 1;
    }
  }

  // 1. Teste de BlogPosting Aberto (Sem Paywall)
  const openSchema = generateBlogPostingSchema({
    title: "Arquitetura Hexagonal de Agentes Autônomos em Nuvem Híbrida",
    headline: "Arquitetura Hexagonal de Agentes Autônomos em Nuvem Híbrida",
    description: "Análise profunda de desacoplamento de portas e adaptadores em microsserviços autônomos orientados a eventos.",
    contentMarkdown: `
# Introdução à Arquitetura Hexagonal

A arquitetura hexagonal, também conhecida como portas e adaptadores, permite que sistemas corporativos isolem o domínio de negócio de protocolos externos.

Neste artigo demonstramos como a Holding V5 Apollo organiza seus despachantes onicanal com contratos rígidos.
    `,
    canonicalUrl: "https://v5autoblog.com/artigo/arquitetura-hexagonal-agentes",
    coverImageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200",
    authorName: "Apollo La Plata",
    authorRole: "Editor Chefe & Arquiteto de Sistemas",
    category: "Engenharia de Software",
    tags: ["hexagonal", "agentes", "cloud", "arquitetura"],
    datePublished: "2026-10-27T10:00:00-03:00",
    dateModified: "2026-10-27T10:00:00-03:00",
    hasPaywall: false
  });

  assert(openSchema["@context"] === "https://schema.org", "Contexto definido como https://schema.org");
  assert(openSchema["@type"] === "BlogPosting", "Tipo raiz definido como BlogPosting");
  assert(openSchema.headline.length <= 110, `Headline dentro do limite de 110 chars recomendados pelo Google (${openSchema.headline.length} chars)`);
  assert(openSchema.inLanguage === "pt-BR", "Idioma definido como pt-BR");
  assert(openSchema.author["@type"] === "Person" && openSchema.author.name === "Apollo La Plata", "Autor com entidade Person e nome correto");
  assert(Boolean(openSchema.author.url?.includes("/autores/apollo-la-plata")), "URL canônica do autor estruturada");
  assert(openSchema.publisher["@type"] === "Organization" && openSchema.publisher.name === "Holding V5 Apollo", "Publisher com entidade Organization");
  assert(openSchema.publisher.logo?.url === "https://v5autoblog.com/logo.png", "Logo da editora/holding configurado");
  assert(openSchema.image["@type"] === "ImageObject" && openSchema.image.width === 1200 && openSchema.image.height === 630, "Imagem em alta resolução 1200x630 (Google Discover Ready)");
  assert(openSchema.isAccessibleForFree === true, "Artigo gratuito com isAccessibleForFree: true");
  assert(Boolean(openSchema.timeRequired?.startsWith("PT")), `Duração de leitura em formato ISO 8601 Duration (${openSchema.timeRequired})`);
  assert(openSchema.speakable?.["@type"] === "SpeakableSpecification", "Especificação Speakable para assistentes de voz presente");

  // 2. Teste de Artigo com Paywall (Mitigação de Cloaking)
  const paywalledSchema = generateBlogPostingSchema({
    title: "Estratégia Secreta de Monetização Onicanal VIP",
    description: "Conteúdo exclusivo para assinantes VIP da holding.",
    contentMarkdown: "Conteúdo restrito com [PAYWALL_BREAK].",
    canonicalUrl: "https://v5autoblog.com/artigo/estrategia-secreta-vip",
    hasPaywall: true
  });

  assert(paywalledSchema.isAccessibleForFree === false, "Artigo fechado com isAccessibleForFree: false");
  assert(
    paywalledSchema.hasPart?.cssSelector === ".v5-paywall-gate" && paywalledSchema.hasPart?.isAccessibleForFree === false,
    "hasPart com seletor CSS do paywall configurado para proteção contra penalidade de Cloaking do Google"
  );

  // 3. Teste de BreadcrumbList Schema
  const breadcrumbs = generateBreadcrumbSchema({
    category: "Inteligência Artificial",
    articleTitle: "Arquitetura Hexagonal de Agentes",
    articleUrl: "https://v5autoblog.com/artigo/arquitetura-hexagonal-agentes"
  });

  assert(breadcrumbs["@type"] === "BreadcrumbList", "BreadcrumbList tipo correto");
  assert(breadcrumbs.itemListElement.length === 3, "3 níveis de navegação na trilha (Início > Categoria > Artigo)");
  assert(breadcrumbs.itemListElement[0].name === "Início" && breadcrumbs.itemListElement[1].name === "Inteligência Artificial", "Nomes dos itens de breadcrumb corretos");

  // 4. Teste de Renderização de Tag <script>
  const scriptTag = renderSchemaJsonLdScript(openSchema);
  assert(
    scriptTag.startsWith('<script type="application/ld+json">') && scriptTag.endsWith("</script>"),
    "renderSchemaJsonLdScript envolve o objeto em tag HTML <script type=\"application/ld+json\">"
  );

  // 5. Teste do Validador de Conformidade
  const validation = validateSchemaCompleteness(openSchema);
  assert(validation.isValid === true, "Validação de conformidade Google Rich Results: 100% Válido");
  assert(validation.score === 100, `Score de validação perfeito (${validation.score}%)`);

  console.log(`\n🎯 RESULTADO: ${passed}/${total} TESTES APROVADOS (${Math.round((passed/total)*100)}%)`);
}

runEtapa042Test().catch(console.error);
