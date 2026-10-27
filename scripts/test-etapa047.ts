/**
 * test-etapa047.ts - Suíte de Validação da Etapa 047
 * Sistema de Categorias e Tags Dinâmicas com Sugestão Automática de Taxonomia
 */

import { 
  analyzeContentTaxonomy, 
  normalizeTagName, 
  getStandardTaxonomies, 
  mapCategoryToWordPress, 
  V5_TAXONOMIES 
} from "../src/lib/seo/taxonomyEngine";
import { compileBlogPayload } from "../src/lib/dispatch/multimodalEngine";
import { MultimodalDispatchPayload } from "../src/types/poster";

async function runTests() {
  console.log("=== INICIANDO TESTES DA ETAPA 047: TAXONOMIA DINÂMICA & SUGESTÃO IA ===");
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, desc: string) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${desc}`);
    }
  }

  // 1. Taxonomias Canônicas da Holding V5 Apollo
  console.log("\n1. Validando Definições de Categorias Canônicas (V5_TAXONOMIES)");
  const taxonomies = getStandardTaxonomies();
  assert(taxonomies.length === 6, "Exatamente 6 categorias canônicas definidas");
  assert(taxonomies.some(t => t.slug === "inteligencia-artificial"), "Categoria 'Inteligência Artificial' presente");
  assert(taxonomies.some(t => t.slug === "afiliados-achadinhos"), "Categoria 'Afiliados & Achadinhos' presente");
  assert(taxonomies.some(t => t.slug === "saas-startups"), "Categoria 'SaaS & Startups' presente");
  assert(taxonomies.every(t => t.wpId >= 100), "Todos os itens possuem wpId válido para WordPress");
  assert(taxonomies.every(t => t.keywords.length >= 10), "Todas as categorias possuem keywords de mapeamento semântico");

  // 2. Normalização de Tags
  console.log("\n2. Validando Normalizador de Tags (normalizeTagName)");
  assert(normalizeTagName("ia") === "IA", "Sigla 'ia' normalizada para 'IA'");
  assert(normalizeTagName("seo") === "SEO", "Sigla 'seo' normalizada para 'SEO'");
  assert(normalizeTagName("rag") === "RAG", "Sigla 'rag' normalizada para 'RAG'");
  assert(normalizeTagName("#agentes_autonomos") === "Agentes Autonomos", "Limpeza de hashtag e sublinhado");
  assert(normalizeTagName("inteligencia artificial de ponta") === "Inteligencia Artificial de Ponta", "Preservação de conectivo minúsculo");

  // 3. Classificação Automática: Artigo de IA & Agentes
  console.log("\n3. Validando Classificação: Artigo de Inteligência Artificial");
  const aiArticle = `
# A Revolução Silenciosa dos Agentes Autônomos em 2026
Os modelos de linguagem LLM e os agentes autônomos operam pipelines de produção sem fricção com memória contínua RAG e MCP.
A inteligência artificial transformou a escrita de código e a automação de processos cognitivos.
`;
  const aiTaxonomy = analyzeContentTaxonomy(aiArticle, "A Revolução Silenciosa dos Agentes Autônomos em 2026");
  assert(aiTaxonomy.recommendedCategory === "Inteligência Artificial", `Classificou como 'Inteligência Artificial' (recebido: '${aiTaxonomy.recommendedCategory}')`);
  assert(aiTaxonomy.categoryConfidence >= 70, `Confiança elevada: ${aiTaxonomy.categoryConfidence}%`);
  assert(aiTaxonomy.wpCategoryId === 101, "Mapeou para wpCategoryId 101");
  assert(aiTaxonomy.topicCluster.includes("IA"), `Topic Cluster correto: ${aiTaxonomy.topicCluster}`);
  assert(aiTaxonomy.suggestedTags.length >= 5, `Gerou ${aiTaxonomy.suggestedTags.length} tags sugeridas`);

  // 4. Classificação Automática: Artigo de Achadinhos / Afiliados
  console.log("\n4. Validando Classificação: Artigo de Achadinhos & Afiliados");
  const dealsArticle = `
# 10 Achadinhos Virais da Shopee com Cupom de Frete Grátis
Confira os melhores produtos de afiliados com super desconto e menor preço histórico no Mercado Livre e Amazon.
Aproveite as ofertas exclusivas transmitidas no canal VIP do Telegram com comissão e economia real.
`;
  const dealsTaxonomy = analyzeContentTaxonomy(dealsArticle, "10 Achadinhos Virais da Shopee com Cupom de Frete Grátis");
  assert(dealsTaxonomy.recommendedCategory === "Afiliados & Achadinhos", `Classificou como 'Afiliados & Achadinhos' (recebido: '${dealsTaxonomy.recommendedCategory}')`);
  assert(dealsTaxonomy.wpCategoryId === 102, "Mapeou para wpCategoryId 102");
  assert(dealsTaxonomy.topicCluster.includes("Achadinhos"), `Topic Cluster correto: ${dealsTaxonomy.topicCluster}`);

  // 5. Classificação Automática: Artigo de SaaS & Startups
  console.log("\n5. Validando Classificação: Artigo de SaaS & Startups");
  const saasArticle = `
# Como escalar um Micro-SaaS para R$ 50k de MRR com Next.js e Supabase
Construir um software escalável com modelo de assinatura recorrente reduz o churn e acelera a receita da sua startup na nuvem.
`;
  const saasTaxonomy = analyzeContentTaxonomy(saasArticle, "Como escalar um Micro-SaaS para R$ 50k de MRR");
  assert(saasTaxonomy.recommendedCategory === "SaaS & Startups", `Classificou como 'SaaS & Startups' (recebido: '${saasTaxonomy.recommendedCategory}')`);
  assert(saasTaxonomy.wpCategoryId === 104, "Mapeou para wpCategoryId 104");

  // 6. Mapeador de WordPress
  console.log("\n6. Validando Mapeador de Taxonomia para WordPress (mapCategoryToWordPress)");
  const wpAi = mapCategoryToWordPress("Inteligência Artificial");
  assert(wpAi.id === 101, "Mapeamento correto de id 101");
  assert(wpAi.slug === "inteligencia-artificial", "Slug correto");

  const wpUnknown = mapCategoryToWordPress("Categoria Inexistente");
  assert(wpUnknown.id === 101, "Fallback resiliente para categoria padrão");

  // 7. Integração Automática com compileBlogPayload
  console.log("\n7. Validando Injeção Automática no Compilador de Blog (compileBlogPayload)");
  const payloadWithoutTaxonomy: MultimodalDispatchPayload = {
    id: "auto-tax-001",
    title: "Guia Completo de Agentes Autônomos com RAG e LLM",
    slug: "guia-agentes-autonomos-rag",
    summary: "",
    contentMarkdown: aiArticle,
    emailOptions: {
      enabled: true,
      subject: "Assunto",
      previewText: "Preview",
      fromName: "Apollo",
      provider: "resend",
      audienceList: "Geral",
      utmCampaign: "test"
    },
    blogOptions: {
      enabled: true,
      targetPlatform: "v5autoblog",
      targetEndpoint: "https://v5autoblog.com/api/v1/posts",
      category: "", // Vazia intencionalmente
      tags: [],     // Vazia intencionalmente
      author: "Apollo La Plata",
      generateSchema: true
    },
    socialTeaserOptions: { enabled: false, platforms: [] },
    dispatchStatus: {
      overall: "idle",
      email: { status: "idle" },
      blog: { status: "idle" },
      social: { status: "idle" }
    }
  };

  const compiled = compileBlogPayload(payloadWithoutTaxonomy);
  assert(compiled.category === "Inteligência Artificial", `Auto-preencheu categoria com 'Inteligência Artificial' (recebido: '${compiled.category}')`);
  assert(compiled.tags.length >= 3, `Auto-preencheu tags (${compiled.tags.length} tags geradas)`);
  assert(compiled.seo.schema_org.articleSection === "Inteligência Artificial", "Schema.org reflete a categoria sugerida");
  assert(compiled.seo.open_graph.article_section === "Inteligência Artificial", "Open Graph reflete a categoria sugerida");

  console.log(`\n=== RESULTADO FINAL: ${passed}/${total} ASSERÇÕES APROVADAS ===`);
  if (passed === total) {
    console.log("🚀 ETAPA 047 100% HOMOLOGADA COM SUCESSO!\n");
    process.exit(0);
  } else {
    console.error("❌ ALGUNS TESTES FALHARAM.\n");
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Erro fatal nos testes:", err);
  process.exit(1);
});
