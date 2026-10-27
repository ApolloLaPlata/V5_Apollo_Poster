/**
 * test-etapa060.ts - Homologação Solene da Fase 6 (Ponta Social Teasers Multicanal)
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Valida a esteira completa e integrada das Etapas 051 a 060:
 * 1. Motor Central de Síntese Multicanal (compileSocialTeasers - Etapa 051)
 * 2. Motor de Micro-Copy para X/Twitter (280c, ganchos virais - Etapa 052)
 * 3. Motor de Engajamento para Threads (500c, tom conversacional, chamada bio - Etapa 053)
 * 4. Motor de Legendas para Instagram (2.200c, anti-collapse, Triad de hashtags, Comment-to-DM - Etapa 054)
 * 5. Motor de Mensagens para WhatsApp (1.024c, *negritos nativos*, wa.me - Etapa 055)
 * 6. Motor de Mensagens para Telegram (4.096c, Markdown rico, links embutidos, spoiler - Etapa 056)
 * 7. Painel de Telemetria e Edição em Tempo Real com Sweet Spots (Etapa 057)
 * 8. Motor de Cópia com 1 Clique e Pacote Onicanal Completo (Etapa 058)
 * 9. Seletor de Mídia e Gerador de Cards Sociais SVG (Etapa 059)
 * 10. Homologação Final de Integridade Onicanal (Etapa 060)
 */

import { 
  compileSocialTeasers, 
  generateTwitterTeaser,
  generateThreadsTeaser,
  generateInstagramCaption,
  generateWhatsAppMessage,
  generateTelegramMessage,
  generateLinkedInTeaser,
  calculateTeaserMetrics,
  SOCIAL_CHAR_LIMITS,
  SOCIAL_PLATFORM_NAMES,
  SOCIAL_SWEET_SPOTS
} from "../src/lib/social/socialTeaserEngine";
import { 
  generateAllTwitterVariants,
  TWITTER_HOOK_TEMPLATES 
} from "../src/lib/social/twitterTeaserGenerator";
import { 
  generateThreadsVariant,
  THREADS_TONE_TEMPLATES 
} from "../src/lib/social/threadsTeaserGenerator";
import { 
  generateInstagramCaptionFormatted,
  buildInstagramHashtagCluster,
  COMMENT_KEYWORDS 
} from "../src/lib/social/instagramCaptionGenerator";
import { 
  generateWhatsAppMessageVariant,
  toWhatsAppFormatting,
  buildWhatsAppShareUrl 
} from "../src/lib/social/whatsappMessageGenerator";
import { 
  generateTelegramMessageVariant,
  toTelegramMarkdown,
  buildTelegramShareUrl 
} from "../src/lib/social/telegramMessageGenerator";
import { 
  formatAllTeasersBundle, 
  getCopyFeedbackMessage,
  copyToClipboard 
} from "../src/lib/social/socialCopyEngine";
import { 
  generateSvgSocialCard, 
  getSvgDataUri, 
  buildSocialMediaAsset,
  ASPECT_RATIO_CONFIGS,
  SOCIAL_CARD_THEMES,
  CURATED_SOCIAL_PRESETS 
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
console.log(" HOMOLOGAÇÃO SOLENE DA FASE 6: PONTA SOCIAL TEASERS (051 - 060)");
console.log(" CAPITANIA #13: V5 APOLLO POSTER (:3011) - HOLDING V5 APOLLO");
console.log("================================================================================\n");

const masterPayload: MultimodalDispatchPayload = {
  id: "homologacao_fase_6_060",
  title: "A Revolução dos Agentes Autônomos em Nuvem: Orquestração Desacoplada e Alta Escala",
  slug: "revolucao-agentes-autonomos-nuvem-orquestracao-alta-escala",
  canonical_url: "https://v5autoblog.com/artigo/revolucao-agentes-autonomos-nuvem-orquestracao-alta-escala",
  summary: "Descubra como construir e operar redes de múltiplos agentes cognitivos em paralelo com resiliência a falhas, checkpoints determinísticos e publicação onicanal nativa.",
  contentMarkdown: `## A Era da Automação Onicanal
Agentes autônomos exigem comunicação padronizada e isolamento de contexto.

### Pilares Fundamentais:
- Conexão oficial via APIs Meta Graph, Telegram Bot e Resend
- Geração de micro-cópias adaptadas matematicamente aos limites de cada rede
- Ganchos de conversão com links rastreados por UTMs dedicadas
- Eliminação total de extensões de navegador frágeis para os usuários finais

A infraestrutura é 100% serverless e escalável sob demanda.`,
  coverImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
  coverImageAlt: "Visualização futurista de redes neurais conectadas em nuvem",
  blogOptions: {
    enabled: true,
    targetPlatform: "v5autoblog",
    targetEndpoint: "https://v5autoblog.com/api/v1/posts",
    category: "Inteligência Artificial",
    tags: ["Agentes Autônomos", "Next.js", "Arquitetura", "Escalabilidade", "Holding V5"],
    author: "Apollo La Plata",
    generateSchema: true
  },
  emailOptions: {
    enabled: true,
    subject: "A Revolução dos Agentes Autônomos em Nuvem",
    previewText: "Descubra como construir redes de múltiplos agentes com publicação onicanal.",
    fromName: "Apollo La Plata",
    provider: "resend",
    audienceList: "Tech VIP",
    utmCampaign: "homologacao_fase6_060"
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
// 1. ETAPA 051: MOTOR CENTRAL DE SÍNTESE MULTICANAL
// ============================================================================
console.log("[1/9] Validando Etapa 051: Motor Central de Síntese Multicanal...");
const compiled = compileSocialTeasers(masterPayload);
assert(compiled.summary.totalPlatforms === 6, "Total de 6 plataformas compiladas simultaneamente");
assert(compiled.summary.allWithinLimits, "Todos os 6 teasers respeitam os limites oficiais das redes");
assert(compiled.x_twitter.isWithinLimit && compiled.x_twitter.charCount <= 280, "X/Twitter <= 280c");
assert(compiled.threads.isWithinLimit && compiled.threads.charCount <= 500, "Threads <= 500c");
assert(compiled.instagram.isWithinLimit && compiled.instagram.charCount <= 2200, "Instagram <= 2.200c");
assert(compiled.whatsapp.isWithinLimit && compiled.whatsapp.charCount <= 1024, "WhatsApp <= 1.024c");
assert(compiled.telegram.isWithinLimit && compiled.telegram.charCount <= 4096, "Telegram <= 4.096c");
assert(compiled.linkedin.isWithinLimit && compiled.linkedin.charCount <= 3000, "LinkedIn <= 3.000c");
console.log("  -> Etapa 051 homologada com 100% de conformidade.\n");

// ============================================================================
// 2. ETAPA 052: GERADOR PARA X / TWITTER COM GANCHOS VIRAIS
// ============================================================================
console.log("[2/9] Validando Etapa 052: Gerador para X/Twitter com Ganchos Virais...");
const twVariants = generateAllTwitterVariants(masterPayload);
const twVariant = twVariants.find(v => v.hookType === "curiosity") || twVariants[0];
assert(twVariant.twitterWeightedCount <= 280, `Twitter teaser respeita 280 caracteres ponderados (${twVariant.twitterWeightedCount}c)`);
assert(twVariant.text.includes("A maioria ainda não percebeu") || twVariant.text.includes("🧵"), "Gancho de curiosidade viral aplicado com sucesso");
assert(twVariant.utmUrl.includes("utm_source=x_twitter"), "UTM source para Twitter configurada");
console.log("  -> Etapa 052 homologada com sucesso.\n");

// ============================================================================
// 3. ETAPA 053: GERADOR PARA THREADS COM TOM CONVERSACIONAL
// ============================================================================
console.log("[3/9] Validando Etapa 053: Gerador para Threads com Tom Conversacional...");
const thTemplate = THREADS_TONE_TEMPLATES.find(t => t.type === "build_in_public") || THREADS_TONE_TEMPLATES[0];
const thVariant = generateThreadsVariant(masterPayload, thTemplate, "bio");
assert(thVariant.charCount <= 500, `Threads teaser respeita 500 caracteres (${thVariant.charCount}c)`);
assert(thVariant.text.includes("🛠️ Nos bastidores da holding hoje"), "Opener de Bastidores & Build in Public aplicado");
assert(thVariant.text.includes("link da bio"), "CTA de direcionamento para a Bio aplicado");
console.log("  -> Etapa 053 homologada com sucesso.\n");

// ============================================================================
// 4. ETAPA 054: GERADOR DE LEGENDAS PARA INSTAGRAM COM COMMENT-TO-DM
// ============================================================================
console.log("[4/9] Validando Etapa 054: Gerador de Legendas para Instagram...");
const igResult = generateInstagramCaptionFormatted(masterPayload, "carousel", "LINK");
assert(igResult.charCount <= 2200, `Instagram caption respeita 2.200 caracteres (${igResult.charCount}c)`);
assert(igResult.captionText.includes('Comente "LINK"') || igResult.captionText.includes('"LINK"'), "Gatilho de Comment-to-DM para robô ativado na legenda");
assert(igResult.captionText.includes("\n.\n"), "Separadores de ponto limpo anti-collapse presentes");
assert(igResult.hashtagCluster.count <= 15, "Fórmula Triad de hashtags respeita teto anti-spam de 15 tags");
console.log("  -> Etapa 054 homologada com sucesso.\n");

// ============================================================================
// 5. ETAPA 055: GERADOR DE MENSAGENS PARA GRUPOS DE WHATSAPP
// ============================================================================
console.log("[5/9] Validando Etapa 055: Gerador de Mensagens para Grupos de WhatsApp...");
const waResult = generateWhatsAppMessageVariant(masterPayload, { format: "playbook", destination: "group" });
assert(waResult.charCount <= 1024, `WhatsApp respeita 1.024 caracteres (${waResult.charCount}c)`);
assert(!waResult.text.includes("**"), "Sem asteriscos duplos de Markdown convencional");
assert(waResult.text.includes("*RESUMO EXECUTIVO:*"), "Formatação nativa de negrito do WhatsApp aplicada");
assert(waResult.encodedWhatsAppUrl.startsWith("https://api.whatsapp.com/send?text="), "Deep-link wa.me gerado");
console.log("  -> Etapa 055 homologada com sucesso.\n");

// ============================================================================
// 6. ETAPA 056: GERADOR DE MENSAGENS COM MARKDOWN PARA TELEGRAM
// ============================================================================
console.log("[6/9] Validando Etapa 056: Gerador de Mensagens para Telegram...");
const tgResult = generateTelegramMessageVariant(masterPayload, { format: "broadcast_digest", channelType: "public_channel" });
assert(tgResult.charCount <= 4096, `Telegram respeita 4.096 caracteres (${tgResult.charCount}c)`);
assert(tgResult.text.includes("[👉 Ler Análise Técnica Completa no AutoBlog]("), "Hiperlink embutido no texto sem expor URLs longas");
assert(tgResult.inlineButton.text.includes("Ler no V5 AutoBlog"), "Botão inline estilo Telegram Bot API presente");
assert(tgResult.encodedShareUrl.startsWith("https://t.me/share/url?"), "Deep-link t.me/share gerado");
console.log("  -> Etapa 056 homologada com sucesso.\n");

// ============================================================================
// 7. ETAPA 057: PAINEL DE TELEMETRIA E CONTADORES EM TEMPO REAL
// ============================================================================
console.log("[7/9] Validando Etapa 057: Painel de Telemetria e Contadores em Tempo Real...");
const metricsTw = calculateTeaserMetrics("x_twitter", compiled.x_twitter.text);
assert(metricsTw.isWithinLimit, "Métricas confirmam Twitter dentro do limite");
assert(metricsTw.remainingChars >= 0, "Cálculo de caracteres restantes positivo");

const metricsIg = calculateTeaserMetrics("instagram", igResult.captionText);
assert(metricsIg.isSweetSpot, `Instagram caption está no Sweet Spot ideal (${metricsIg.charCount}c)`);
console.log("  -> Etapa 057 homologada com sucesso.\n");

// ============================================================================
// 8. ETAPA 058: MOTOR DE CÓPIA COM 1 CLIQUE E KIT ONICANAL COMPLETO
// ============================================================================
console.log("[8/9] Validando Etapa 058: Motor de Cópia com 1 Clique e Kit Onicanal...");
const bundle = formatAllTeasersBundle(masterPayload, compiled);
assert(bundle.includes("# 📦 KIT COMPLETO DE TEASERS SOCIAIS"), "Cabeçalho do Kit Onicanal consolidado presente");
assert(bundle.includes("## 1. 𝕏 / TWITTER") && bundle.includes("## 6. 💼 LINKEDIN"), "Todas as 6 redes estruturadas no pacote");

const copyFeedback = getCopyFeedbackMessage("x_twitter", compiled.x_twitter.charCount);
assert(copyFeedback.includes("X / Twitter copiado"), "Mensagem contextual de feedback gerada corretamente");
console.log("  -> Etapa 058 homologada com sucesso.\n");

// ============================================================================
// 9. ETAPA 059: SELETOR DE MÍDIA E CARDS SOCIAIS SVG
// ============================================================================
console.log("[9/9] Validando Etapa 059: Seletor de Mídia e Cards Sociais SVG...");
const svgCard = generateSvgSocialCard(masterPayload, "dark_apollo", "16:9");
assert(svgCard.includes("<svg xmlns=\"http://www.w3.org/2000/svg\""), "SVG gerado com sintaxe XML válida");
assert(svgCard.includes("V5 APOLLO POSTER :3011"), "Branding oficial da Capitania #13 no card");

const assetCover = buildSocialMediaAsset(masterPayload, "cover_article", "16:9");
assert(assetCover.url === masterPayload.coverImageUrl, "Ativo de mídia de capa construído perfeitamente");

const assetCard = buildSocialMediaAsset(masterPayload, "generated_card", "1:1", "cyber_neon");
assert(assetCard.isGeneratedSvg && assetCard.url.startsWith("data:image/svg+xml"), "Card gerado como Data URI");
assert(CURATED_SOCIAL_PRESETS.length >= 6, "Galeria curada com pelo menos 6 verticais");
console.log("  -> Etapa 059 homologada com sucesso.\n");

console.log("================================================================================");
console.log(` RESULTADO FINAL: ${passedTests}/${totalTests} TESTES APROVADOS COM 100% DE SUCESSO!`);
console.log(" TODA A FASE 6 (ETAPAS 051 A 060) HOMOLOGADA COM SUCESSO ABSOLUTO!");
console.log("================================================================================");
