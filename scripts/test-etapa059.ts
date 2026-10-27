/**
 * test-etapa059.ts - Validação Automatizada da Etapa 059
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Valida o Motor de Ativos de Mídia e Cards Sociais Gerados:
 * 1. Geração de SVG sintático e visual com tipografia e selos oficiais
 * 2. 4 Temas Visuais (Dark Apollo, Cyber Neon, Minimal Editorial, Emerald Matrix)
 * 3. 3 Proporções de Aspect Ratio (16:9, 1:1, 4:5) com dimensões oficiais
 * 4. Conversão para Data URI em tempo real (data:image/svg+xml)
 * 5. Construção dos 4 modos de ativo de mídia (cover_article, generated_card, preset_gallery, custom_url)
 * 6. Integridade da galeria curada por verticais da Holding V5 Apollo
 */

import { 
  generateSvgSocialCard,
  getSvgDataUri,
  buildSocialMediaAsset,
  ASPECT_RATIO_CONFIGS,
  SOCIAL_CARD_THEMES,
  CURATED_SOCIAL_PRESETS,
  SocialMediaAspectRatio,
  SocialCardTheme
} from "../src/lib/social/socialCardGenerator";
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
console.log(" INICIANDO BATERIA DE TESTES - ETAPA 059: SELETOR DE MÍDIA E CARDS SOCIAIS");
console.log("================================================================================\n");

const samplePayload: MultimodalDispatchPayload = {
  id: "card_test_059",
  title: "Arquitetura de Agentes Autônomos com Roteamento Semântico e Memória Persistente",
  slug: "arquitetura-agentes-autonomos-roteamento-semantico",
  canonical_url: "https://v5autoblog.com/artigo/arquitetura-agentes-autonomos-roteamento-semantico",
  summary: "Análise profunda sobre orquestração de agentes de IA usando o protocolo Hive Bus e armazenamento distribuído.",
  contentMarkdown: "Conteúdo completo com diagramas e benchmarks.",
  coverImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
  coverImageAlt: "Diagrama de inteligência artificial da holding",
  blogOptions: {
    enabled: true,
    targetPlatform: "v5autoblog",
    targetEndpoint: "https://v5autoblog.com/api/v1/posts",
    category: "Inteligência Artificial",
    tags: ["Agentes Autônomos", "Next.js", "Arquitetura"],
    author: "Apollo La Plata",
    generateSchema: true
  },
  emailOptions: {
    enabled: true,
    subject: "Arquitetura de Agentes com Roteamento",
    previewText: "Análise profunda sobre orquestração de agentes de IA.",
    fromName: "Apollo La Plata",
    provider: "resend",
    audienceList: "Tech VIP",
    utmCampaign: "social_card_059"
  },
  socialTeaserOptions: {
    enabled: true,
    platforms: ["x_twitter", "threads", "instagram", "whatsapp", "telegram"]
  },
  dispatchStatus: {
    overall: "idle",
    email: { status: "idle" },
    blog: { status: "idle" },
    social: { status: "idle" }
  }
};

// ============================================================================
// 1. TESTE DE GERAÇÃO DE CARD SOCIAL SVG
// ============================================================================
console.log("[1/6] Testando Geração de Card Social SVG...");

const svg = generateSvgSocialCard(samplePayload, "dark_apollo", "16:9");

assert(svg.includes("<svg xmlns=\"http://www.w3.org/2000/svg\""), "Gera tag raiz SVG válida");
assert(svg.includes("viewBox=\"0 0 1200 675\""), "Define viewBox correto para proporção 16:9 (1200x675)");
assert(svg.includes("V5 APOLLO POSTER :3011"), "Inclui selo oficial da Capitania #13 Poster");
assert(svg.includes("INTELIGÊNCIA ARTIFICIAL"), "Inclui categoria do artigo no badge");
assert(svg.includes("Apollo La Plata"), "Inclui nome do autor");
assert(svg.includes("v5autoblog.com"), "Inclui domínio oficial da holding");
console.log("  -> Geração de Card SVG validada com sucesso.\n");

// ============================================================================
// 2. TESTE DOS 4 TEMAS VISUAIS
// ============================================================================
console.log("[2/6] Testando os 4 Temas Visuais (Dark Apollo, Cyber Neon, Minimal, Emerald)...");

const themes: SocialCardTheme[] = ["dark_apollo", "cyber_neon", "minimal_editorial", "emerald_matrix"];

for (const th of themes) {
  const themeSvg = generateSvgSocialCard(samplePayload, th, "16:9");
  const cfg = SOCIAL_CARD_THEMES[th];
  assert(themeSvg.includes(cfg.bgGradient.from), `Tema ${th} contém stop de cor inicial ${cfg.bgGradient.from}`);
  assert(themeSvg.includes(cfg.bgGradient.to), `Tema ${th} contém stop de cor final ${cfg.bgGradient.to}`);
}
console.log("  -> 4 Temas visuais homologados com sucesso.\n");

// ============================================================================
// 3. TESTE DAS 3 PROPORÇÕES DE ASPECT RATIO (16:9, 1:1, 4:5)
// ============================================================================
console.log("[3/6] Testando Proporções de Aspect Ratio...");

// 16:9 Paisagem (1200x675)
const svg169 = generateSvgSocialCard(samplePayload, "dark_apollo", "16:9");
assert(svg169.includes("width=\"1200\" height=\"675\""), "Proporção 16:9 gera dimensões 1200x675");
assert(ASPECT_RATIO_CONFIGS["16:9"].recommendedFor.includes("X / Twitter"), "16:9 recomendado para Twitter");

// 1:1 Quadrado (1080x1080)
const svg11 = generateSvgSocialCard(samplePayload, "dark_apollo", "1:1");
assert(svg11.includes("width=\"1080\" height=\"1080\""), "Proporção 1:1 gera dimensões 1080x1080");
assert(ASPECT_RATIO_CONFIGS["1:1"].recommendedFor.includes("Feed Instagram"), "1:1 recomendado para Feed Instagram");

// 4:5 Retrato (1080x1350)
const svg45 = generateSvgSocialCard(samplePayload, "dark_apollo", "4:5");
assert(svg45.includes("width=\"1080\" height=\"1350\""), "Proporção 4:5 gera dimensões 1080x1350");
assert(ASPECT_RATIO_CONFIGS["4:5"].recommendedFor.includes("Carrossel Instagram"), "4:5 recomendado para Carrossel");
console.log("  -> 3 Proporções de aspect ratio homologadas com sucesso.\n");

// ============================================================================
// 4. TESTE DE DATA URI (getSvgDataUri)
// ============================================================================
console.log("[4/6] Testando Conversão para Data URI...");

const dataUri = getSvgDataUri(svg);
assert(dataUri.startsWith("data:image/svg+xml;utf8,"), "Data URI possui prefixo MIME de SVG");
assert(dataUri.includes("%3Csvg"), "Conteúdo do SVG corretamente codificado em URI");
console.log("  -> Data URI validada com sucesso.\n");

// ============================================================================
// 5. TESTE DOS 4 MODOS DE ATIVO DE MÍDIA (buildSocialMediaAsset)
// ============================================================================
console.log("[5/6] Testando os 4 Modos de Ativo de Mídia...");

// Modo 1: Capa do Artigo
const coverAsset = buildSocialMediaAsset(samplePayload, "cover_article", "16:9");
assert(coverAsset.url === samplePayload.coverImageUrl, "Modo cover_article preserva imagem original");
assert(!coverAsset.isGeneratedSvg, "Não marcado como SVG gerado");
assert(coverAsset.width === 1200 && coverAsset.height === 675, "Dimensões 16:9 atribuídas corretamente");

// Modo 2: Card Gerado
const generatedAsset = buildSocialMediaAsset(samplePayload, "generated_card", "1:1", "cyber_neon");
assert(generatedAsset.isGeneratedSvg, "Marcado como SVG gerado");
assert(generatedAsset.url.startsWith("data:image/svg+xml"), "URL é uma Data URI de SVG");
assert(generatedAsset.width === 1080 && generatedAsset.height === 1080, "Dimensões 1:1 atribuídas");

// Modo 3: Galeria Curada
const presetAsset = buildSocialMediaAsset(samplePayload, "preset_gallery", "4:5");
assert(presetAsset.url.includes("unsplash.com"), "Modo preset_gallery utiliza imagem de alta resolução");
assert(presetAsset.width === 1080 && presetAsset.height === 1350, "Dimensões 4:5 atribuídas");

// Modo 4: URL Customizada
const customUrl = "https://cdn.meudominio.com/banner-personalizado.jpg";
const customAsset = buildSocialMediaAsset(samplePayload, "custom_url", "16:9", "dark_apollo", customUrl);
assert(customAsset.url === customUrl, "Modo custom_url utiliza URL externa fornecida");
console.log("  -> 4 Modos de ativo de mídia homologados com sucesso.\n");

// ============================================================================
// 6. TESTE DA GALERIA DE PRESETS CURADOS
// ============================================================================
console.log("[6/6] Testando Integridade da Galeria Curada...");

assert(CURATED_SOCIAL_PRESETS.length >= 6, "Galeria contém pelo menos 6 presets curados");
for (const p of CURATED_SOCIAL_PRESETS) {
  assert(p.url.startsWith("https://images.unsplash.com"), `Preset ${p.id} possui URL segura de alta resolução`);
  assert(p.category.length > 0, `Preset ${p.id} possui categoria definida`);
  assert(p.alt.length > 0, `Preset ${p.id} possui texto alternativo de acessibilidade`);
}
console.log("  -> Galeria curada validada com sucesso.\n");

console.log("================================================================================");
console.log(` RESULTADO FINAL: ${passedTests}/${totalTests} TESTES APROVADOS COM SUCESSO!`);
console.log(" ETAPA 059 CONCLUÍDA E HOMOLOGADA COM PRECISÃO CIRÚRGICA.");
console.log("================================================================================");
