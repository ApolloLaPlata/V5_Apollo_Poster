/**
 * V5 APOLLO POSTER - ETAPA 041 TEST SUITE
 * Validação rigorosa do Compilador de Payload JSON Estruturado para o V5 AutoBlog
 */

import { compileBlogPayload, extractOptimizedExcerpt, extractKeyTakeaways } from "../src/lib/dispatch/multimodalEngine";
import { MultimodalDispatchPayload } from "../src/types/poster";

async function runEtapa041Test() {
  console.log("===============================================================================");
  console.log("🚀 TESTANDO ETAPA 041: COMPILADOR DE PAYLOAD JSON V5 AUTOBLOG COM TAGS SEO");
  console.log("===============================================================================\n");

  const samplePayload: MultimodalDispatchPayload = {
    id: "post_test_041",
    title: "Orquestração de Agentes Autônomos em Arquiteturas Escaláveis",
    slug: "orquestracao-agentes-autonomos-arquiteturas-escalaveis",
    summary: "Guia técnico avançado demonstrando como orquestrar múltiplos agentes autônomos sem gargalos de concorrência ou perda de estado.",
    contentMarkdown: `
# Arquitetura de Agentes Autônomos

A modernização dos sistemas corporativos exige a adoção de microsserviços orientados a agentes autônomos.

## Principais Pilares da Orquestração

Para implementar um pipeline resiliente, três fatores são fundamentais:

- Isolamento de estado por sessão garantindo idempotência em execuções paralelas.
- Barramento de eventos assíncrono para comunicação não-bloqueante entre capitanias.
- Recuperação automática com checkpoints determinísticos e persistência estruturada.

## Benefícios Operacionais da Capitania #13

O V5 Apollo Poster atua como a central de transmissão onicanal, conectando o blog ao ecossistema exterior via APIs oficiais.
    `,
    coverImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
    coverImageAlt: "Redes neurais e barramento de dados de alta velocidade",
    emailOptions: {
      enabled: true,
      subject: "Orquestração de Agentes Autônomos",
      previewText: "Guia técnico avançado demonstrando como orquestrar agentes autônomos.",
      fromName: "Holding V5 Apollo",
      provider: "resend",
      audienceList: "Tech VIP",
      utmCampaign: "agentes_2026"
    },
    blogOptions: {
      enabled: true,
      targetPlatform: "v5autoblog",
      targetEndpoint: "https://v5autoblog.com/api/v1/posts",
      category: "Inteligência Artificial",
      tags: ["agentes", "arquitetura", "ia", "autoblog", "poster"],
      author: "Apollo La Plata",
      generateSchema: true
    },
    socialTeaserOptions: {
      enabled: true,
      platforms: ["instagram", "x_twitter", "telegram", "whatsapp"]
    },
    dispatchStatus: {
      overall: "idle",
      email: { status: "idle" },
      blog: { status: "idle" },
      social: { status: "idle" }
    }
  };

  const blogPayload = compileBlogPayload(samplePayload);

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

  // Asserções
  assert(blogPayload.title === samplePayload.title, "Título preservado no payload");
  assert(blogPayload.slug === "orquestracao-agentes-autonomos-arquiteturas-escalaveis", "Slug canônico formatado");
  assert(blogPayload.canonical_url === "https://v5autoblog.com/artigo/orquestracao-agentes-autonomos-arquiteturas-escalaveis", "URL canônica absoluta");
  assert(blogPayload.excerpt.length > 50 && blogPayload.excerpt.length <= 165, `Excerpt otimizado (${blogPayload.excerpt.length} caracteres)`);
  assert(blogPayload.content_html.includes("<h2 id="), "HTML semântico compilado com IDs em headings");
  assert(blogPayload.content_html.includes('<ul class="list-disc'), "Listas Markdown convertidas em listas HTML estilizadas");
  assert(blogPayload.word_count > 40, `Contagem de palavras calculada (${blogPayload.word_count} palavras)`);
  assert(blogPayload.reading_time_minutes >= 1, `Tempo de leitura calculado (${blogPayload.reading_time_minutes} min)`);
  assert(blogPayload.featured_image.width === 1200 && blogPayload.featured_image.height === 630, "Imagem de destaque com resolução canônica 1200x630");
  assert(blogPayload.author.name === "Apollo La Plata", "Dados do autor estruturados");

  // Tags SEO Estendidas
  assert(blogPayload.seo.meta_title.includes("V5 AutoBlog"), "Meta title formatado com branding");
  assert(blogPayload.seo.meta_description === blogPayload.excerpt, "Meta description alinhada com o excerpt da SERP");
  assert(blogPayload.seo.robots.includes("index, follow"), "Diretivas Robots presentes");
  assert(blogPayload.seo.open_graph.og_type === "article", "Open Graph og:type definido como article");
  assert(blogPayload.seo.open_graph.og_image === samplePayload.coverImageUrl, "Open Graph og:image correspondente");
  assert(blogPayload.seo.twitter_card.card === "summary_large_image", "Twitter Card summary_large_image configurado");
  assert(blogPayload.seo.schema_org["@type"] === "BlogPosting", "Schema.org BlogPosting em JSON-LD configurado");
  assert(blogPayload.seo.schema_org.publisher.name === "Holding V5 Apollo", "Schema.org publisher atribuído à holding");
  assert(blogPayload.seo.ai_search.key_takeaways.length >= 2, `Key Takeaways para AI Search extraídos (${blogPayload.seo.ai_search.key_takeaways.length} pontos)`);
  assert(blogPayload.target_endpoint === "https://v5autoblog.com/api/v1/posts", "Target endpoint do AutoBlog configurado");

  console.log(`\n🎯 RESULTADO: ${passed}/${total} TESTES APROVADOS (${Math.round((passed/total)*100)}%)`);
}

runEtapa041Test().catch(console.error);
