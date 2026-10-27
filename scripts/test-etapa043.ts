/**
 * V5 APOLLO POSTER - ETAPA 043 TEST SUITE
 * Validação do Gerador de Meta Tags Open Graph & Twitter Cards para Compartilhamento Social
 */

import { 
  generateOpenGraphMetadata, 
  generateTwitterCardMetadata, 
  renderOpenGraphHtmlMetaTags, 
  validateOpenGraphCompleteness 
} from "../src/lib/dispatch/openGraphGenerator";

async function runEtapa043Test() {
  console.log("===============================================================================");
  console.log("🚀 TESTANDO ETAPA 043: GERADOR DE META TAGS OPEN GRAPH & TWITTER CARDS");
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

  // 1. Teste de generateOpenGraphMetadata
  const og = generateOpenGraphMetadata({
    title: "Como Escalar Agentes com Event-Driven Architecture",
    description: "Um guia definitivo sobre comunicação orientada a eventos para microsserviços autônomos de alta performance.",
    canonicalUrl: "https://v5autoblog.com/artigo/como-escalar-agentes-event-driven",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
    imageAlt: "Diagrama de barramento de eventos em tempo real",
    authorName: "Apollo La Plata",
    category: "Engenharia de Software",
    tags: ["agentes", "event-driven", "kafka", "poster"],
    siteName: "V5 AutoBlog"
  });

  assert(og.og_type === "article", "og:type definido como 'article'");
  assert(og.og_title.includes("V5 AutoBlog"), "og:title com branding V5 AutoBlog");
  assert(og.og_url === "https://v5autoblog.com/artigo/como-escalar-agentes-event-driven", "og:url canônica correta");
  assert(og.og_image.startsWith("https://"), "og:image com URL absoluta HTTPS");
  assert(og.og_image_width === 1200 && og.og_image_height === 630, "og:image com dimensões canônicas 1200x630 (aspect ratio 1.91:1)");
  assert(og.og_locale === "pt_BR", "og:locale definido como pt_BR");
  assert(og.article_author === "Apollo La Plata", "article:author configurado");
  assert(og.article_section === "Engenharia de Software", "article:section configurada");
  assert(og.article_tag.length === 4, "article:tag com 4 palavras-chave semânticas");

  // 2. Teste de generateTwitterCardMetadata
  const twitter = generateTwitterCardMetadata({
    title: "Como Escalar Agentes com Event-Driven Architecture",
    description: "Um guia definitivo sobre comunicação orientada a eventos para microsserviços autônomos de alta performance.",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
    imageAlt: "Diagrama de barramento de eventos em tempo real",
    siteHandle: "@v5apollo",
    creatorHandle: "@v5apollo",
    cardType: "summary_large_image"
  });

  assert(twitter.card === "summary_large_image", "twitter:card em modo de imagem expandida (summary_large_image)");
  assert(twitter.site === "@v5apollo" && twitter.creator === "@v5apollo", "twitter:site e twitter:creator formatados com @");
  assert(twitter.title.length <= 70, `twitter:title seguro (${twitter.title.length} caracteres)`);
  assert(twitter.description.length <= 165, `twitter:description segura (${twitter.description.length} caracteres)`);

  // 3. Teste de renderOpenGraphHtmlMetaTags
  const htmlTags = renderOpenGraphHtmlMetaTags(og, twitter);
  assert(htmlTags.includes('<meta property="og:type" content="article" />'), "Tag HTML og:type presente");
  assert(htmlTags.includes('<meta property="og:title"'), "Tag HTML og:title presente");
  assert(htmlTags.includes('<meta property="og:image:width" content="1200" />'), "Tag HTML og:image:width presente");
  assert(htmlTags.includes('<meta name="twitter:card" content="summary_large_image" />'), "Tag HTML twitter:card presente");
  assert(htmlTags.includes('<meta name="twitter:site" content="@v5apollo" />'), "Tag HTML twitter:site presente");
  assert(htmlTags.includes('<meta name="theme-color" content="#f59e0b" />'), "Tag theme-color para navegadores móveis presente");

  // 4. Teste de validateOpenGraphCompleteness
  const report = validateOpenGraphCompleteness(og, twitter);
  assert(report.isValid === true, "Validação de completude: 100% Válido");
  assert(report.score === 100, `Score de validação perfeito (${report.score}%)`);
  assert(report.previewCards.facebook.domain === "V5AUTOBLOG.COM", "Domínio de preview do Facebook extraído corretamente");
  assert(report.previewCards.twitter.account === "@v5apollo", "Conta de preview do Twitter confirmada");

  console.log(`\n🎯 RESULTADO: ${passed}/${total} TESTES APROVADOS (${Math.round((passed/total)*100)}%)`);
}

runEtapa043Test().catch(console.error);
