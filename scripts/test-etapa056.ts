/**
 * test-etapa056.ts - Validação Automatizada da Etapa 056
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Valida o Gerador Especializado de Mensagens para Canais de Telegram:
 * 1. Conversão e sanitização de Markdown do Telegram (links [anchor](url), *bold*, _italic_, `code`)
 * 2. 3 Formatos Estratégicos (Broadcast Digest, Alerta VIP com Spoiler, Deep Dive Técnico)
 * 3. Modos de Hiperlink (Embutido no texto, Botão Inline do Bot, Ambos)
 * 4. Canais de Destino com UTMs Dedicadas (Público, VIP e Mural de Avisos)
 * 5. Botão simulado InlineKeyboardMarkup para bots do Telegram
 * 6. Deep-link oficial de compartilhamento via t.me/share
 * 7. Indicador duplo de limites: 4.096 caracteres (texto) e 1.024 caracteres (legenda de mídia)
 * 8. Resiliência de truncamento sob payloads ultra-extensos (> 5.000 caracteres)
 */

import { 
  toTelegramMarkdown,
  formatTelegramBullets,
  buildTelegramShareUrl,
  generateTelegramMessageVariant,
  generateAllTelegramVariants,
  TELEGRAM_FORMAT_TEMPLATES,
  TELEGRAM_CHANNEL_CONFIGS,
  TelegramMessageFormat,
  TelegramChannelType,
  TelegramLinkMode
} from "../src/lib/social/telegramMessageGenerator";
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
console.log(" INICIANDO BATERIA DE TESTES - ETAPA 056: GERADOR DE MENSAGENS PARA TELEGRAM");
console.log("================================================================================\n");

const samplePayload: MultimodalDispatchPayload = {
  id: "telegram_test_056",
  title: "Arquitetura Hexagonal para Agentes Autônomos em Sistemas Distribuídos",
  slug: "arquitetura-hexagonal-agentes-autonomos-sistemas-distribuidos",
  canonical_url: "https://v5autoblog.com/artigo/arquitetura-hexagonal-agentes-autonomos-sistemas-distribuidos",
  summary: "Uma análise aprofundada sobre como isolar o núcleo cognitivo dos agentes de adapters externos de mensageria, garantindo desacoplamento e testabilidade em produção.",
  contentMarkdown: `## Princípios da Arquitetura Hexagonal
O padrão Ports and Adapters viabiliza uma testabilidade sem precedentes.

### Destaques da Implementação:
- Portas de entrada acionadas por eventos do Hive Bus
- Adapters de saída isolados para Meta Graph, Telegram e Resend
- Checkpointing de estado em disco com restauração instantânea

Com essa separação, o cérebro cognitivo não conhece os detalhes de transporte.`,
  coverImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
  blogOptions: {
    enabled: true,
    targetPlatform: "v5autoblog",
    targetEndpoint: "https://v5autoblog.com/api/v1/posts",
    category: "Engenharia de Software",
    tags: ["Arquitetura Hexagonal", "Agentes Autônomos", "Clean Architecture", "Sistemas Distribuídos"],
    author: "Apollo La Plata",
    generateSchema: true
  },
  emailOptions: {
    enabled: true,
    subject: "Arquitetura Hexagonal para Agentes",
    previewText: "Descubra como isolar o núcleo cognitivo de adapters de mensageria.",
    fromName: "Apollo La Plata",
    provider: "resend",
    audienceList: "Tech VIP",
    utmCampaign: "telegram_deepdive_056"
  },
  socialTeaserOptions: {
    enabled: true,
    platforms: ["telegram"]
  },
  dispatchStatus: {
    overall: "idle",
    email: { status: "idle" },
    blog: { status: "idle" },
    social: { status: "idle" }
  }
};

// ============================================================================
// 1. TESTE DE SANITIZAÇÃO DE MARKDOWN DO TELEGRAM
// ============================================================================
console.log("[1/8] Testando Conversão e Sanitização de Markdown do Telegram...");

const htmlText = "Texto com <b>negrito</b>, <i>itálico</i>, <code>codigo_fonte</code> e <a href=\"https://v5autoblog.com\">link interno</a>.";
const formattedHtml = toTelegramMarkdown(htmlText);
assert(formattedHtml.includes("*negrito*"), "Converte <b> para *negrito*");
assert(formattedHtml.includes("_itálico_"), "Converte <i> para _itálico_");
assert(formattedHtml.includes("`codigo_fonte`"), "Converte <code> para `inline code`");
assert(formattedHtml.includes("[link interno](https://v5autoblog.com)"), "Converte <a> para hiperlink Markdown [texto](url)");

const mdBold = "Artigo com **duplo asterisco** do Markdown clássico";
assert(toTelegramMarkdown(mdBold).includes("*duplo asterisco*"), "Converte **bold** para *bold* do Telegram");

const unclosedAsterisk = "Texto com *asterisco órfão no Telegram";
const cleanUnclosed = toTelegramMarkdown(unclosedAsterisk);
const countAsterisks = (cleanUnclosed.match(/\*/g) || []).length;
assert(countAsterisks % 2 === 0, "Garante que o total de asteriscos seja par para evitar erro na Telegram Bot API");
console.log("  -> Sanitização de Markdown homologada com sucesso.\n");

// ============================================================================
// 2. TESTE DOS 3 FORMATOS ESTRATÉGICOS (DIGEST, ALERTA VIP, DEEP DIVE)
// ============================================================================
console.log("[2/8] Testando os 3 Formatos Estratégicos para Canais...");

const variants = generateAllTelegramVariants(samplePayload);

// Formato 1: Broadcast Digest
const digest = variants.broadcast_digest;
assert(digest.format === "broadcast_digest", "Formato broadcast_digest identificado");
assert(digest.text.includes("📢 *V5 APOLLO DIGEST* | *ENGENHARIA DE SOFTWARE*"), "Contém cabeçalho oficial de digest com categoria");
assert(digest.text.includes("👉 Ler Análise Técnica Completa no AutoBlog"), "Contém CTA de leitura completa");
assert(digest.text.includes("[👉 Ler Análise Técnica Completa no AutoBlog]("), "CTA está configurado como hiperlink embutido");
assert(digest.isWithinLimit, `Digest respeita o limite oficial do Telegram de 4.096 caracteres (${digest.charCount}c)`);

// Formato 2: Alerta VIP com Spoiler
const vipAlert = variants.vip_alert;
assert(vipAlert.format === "vip_alert", "Formato vip_alert identificado");
assert(vipAlert.text.includes("||NOVO ARTIGO LIBERADO||"), "Contém spoiler syntax ||...|| do Telegram");
assert(vipAlert.text.includes("⚡ *ALERTA EXCLUSIVO CANAL VIP*"), "Contém cabeçalho de alerta VIP");
assert(vipAlert.text.includes("[🚀 Acessar Estudo Técnico Sem Paywall]("), "Contém CTA exclusivo de acesso VIP");
assert(vipAlert.isWithinLimit, `Alerta VIP dentro do limite (${vipAlert.charCount}c)`);

// Formato 3: Deep Dive Técnico
const deepdive = variants.technical_deepdive;
assert(deepdive.format === "technical_deepdive", "Formato technical_deepdive identificado");
assert(deepdive.text.includes("🔬 *DEEP DIVE DE ENGENHARIA*"), "Contém cabeçalho técnico de engenharia");
assert(deepdive.text.includes("📚 Acessar Repositório e Especificação Completa"), "Contém CTA técnico");
assert(deepdive.bulletPoints.length >= 2, "Extraiu bullet points técnicos do conteúdo");
assert(deepdive.isWithinLimit, `Deep Dive técnico dentro do limite (${deepdive.charCount}c)`);
console.log("  -> 3 Formatos estratégicos homologados com sucesso.\n");

// ============================================================================
// 3. TESTE DE MODOS DE LINK (EMBUTIDO, BOTÃO INLINE, AMBOS)
// ============================================================================
console.log("[3/8] Testando Modos de Hiperlink do Telegram...");

const anchorMode = generateTelegramMessageVariant(samplePayload, { linkMode: "embedded_anchor" });
assert(anchorMode.text.includes("[👉 Ler Análise Técnica Completa no AutoBlog]("), "Modo embedded_anchor contém hiperlink no texto");
assert(!anchorMode.text.includes("🌐 Link direto: `"), "Modo embedded_anchor não expõe URL limpa solta no texto");

const buttonMode = generateTelegramMessageVariant(samplePayload, { linkMode: "inline_button" });
assert(!buttonMode.text.includes("[👉 Ler Análise Técnica Completa no AutoBlog]("), "Modo inline_button não insere hiperlink no corpo");
assert(buttonMode.inlineButton.url.includes("https://v5autoblog.com"), "Objeto inlineButton possui URL de destino configurada");
assert(buttonMode.inlineButton.text === "📖 Ler no V5 AutoBlog ↗", "Texto do botão inline configurado corretamente");

const bothMode = generateTelegramMessageVariant(samplePayload, { linkMode: "both" });
assert(bothMode.text.includes("[👉 Ler Análise Técnica Completa no AutoBlog]("), "Modo both contém hiperlink no texto");
assert(bothMode.text.includes("🌐 Link direto: `"), "Modo both contém também o link direto em código inline");
console.log("  -> Modos de hiperlink homologados com sucesso.\n");

// ============================================================================
// 4. TESTE DE CANAIS DE DESTINO E UTMS DEDICADAS
// ============================================================================
console.log("[4/8] Testando Canais de Destino e Rastreamento de UTMs...");

const publicCh = generateTelegramMessageVariant(samplePayload, { channelType: "public_channel" });
assert(publicCh.channelHandle === "@v5apollo_official", "Handle do canal público é @v5apollo_official");
assert(publicCh.utmUrl.includes("utm_source=telegram"), "UTM source é telegram");
assert(publicCh.utmUrl.includes("utm_medium=telegram_public_channel"), "UTM medium para canal público é telegram_public_channel");

const vipCh = generateTelegramMessageVariant(samplePayload, { channelType: "vip_channel" });
assert(vipCh.channelHandle === "@v5apollo_vip", "Handle do canal VIP é @v5apollo_vip");
assert(vipCh.utmUrl.includes("utm_medium=telegram_vip_channel"), "UTM medium para canal VIP é telegram_vip_channel");

const annCh = generateTelegramMessageVariant(samplePayload, { channelType: "announcements" });
assert(annCh.channelHandle === "@v5apollo_updates", "Handle de anúncios é @v5apollo_updates");
assert(annCh.utmUrl.includes("utm_medium=telegram_announcements"), "UTM medium para anúncios é telegram_announcements");
console.log("  -> Canais de destino e UTMs rastreadas homologadas.\n");

// ============================================================================
// 5. TESTE DE TOGGLES DE CUSTOMIZAÇÃO (BULLETS E HASHTAGS)
// ============================================================================
console.log("[5/8] Testando Toggles de Customização (Bullets e Hashtags)...");

const noBullets = generateTelegramMessageVariant(samplePayload, { includeBullets: false });
assert(!noBullets.text.includes("🎯 *Pontos Centrais da Publicação:*"), "Mensagem sem bullets não inclui seção de pontos");

const noHashtags = generateTelegramMessageVariant(samplePayload, { includeHashtags: false });
assert(!noHashtags.text.includes("#ArquiteturaHexagonal"), "Mensagem sem hashtags não inclui tags no rodapé");

const withAll = generateTelegramMessageVariant(samplePayload, { includeBullets: true, includeHashtags: true });
assert(withAll.text.includes("🎯 *Pontos Centrais da Publicação:*"), "Mensagem completa inclui seção de pontos");
assert(withAll.text.includes("#ArquiteturaHexagonal"), "Mensagem completa inclui hashtags");
console.log("  -> Toggles de customização validados com sucesso.\n");

// ============================================================================
// 6. TESTE DE INDICADORES DUPLOS DE LIMITE (TEXTO vs LEGENDA DE MÍDIA)
// ============================================================================
console.log("[6/8] Testando Indicadores Duplos de Limite (4.096c Texto vs 1.024c Mídia)...");

assert(digest.isWithinLimit, "Digest dentro do limite de 4.096 caracteres");
assert(digest.charCount <= 4096, "Tamanho menor ou igual a 4.096");
assert(digest.isWithinMediaLimit, `Digest (${digest.charCount}c) cabe em legenda de imagem/vídeo (≤ 1.024c)`);
assert(digest.mediaCaptionLimit === 1024, "Limite de mídia configurado como 1.024 caracteres");
console.log("  -> Indicadores de limite de texto e mídia homologados.\n");

// ============================================================================
// 7. TESTE DE DEEP-LINK DE COMPARTILHAMENTO (t.me/share)
// ============================================================================
console.log("[7/8] Testando Deep-Link Oficial do Telegram (t.me/share)...");

const shareUrl = buildTelegramShareUrl("https://v5autoblog.com/artigo/teste", "Confira este *artigo*!");
assert(shareUrl.startsWith("https://t.me/share/url?"), "URL inicia com prefixo oficial do Telegram");
assert(shareUrl.includes("url=https%3A%2F%2Fv5autoblog.com%2Fartigo%2Fteste"), "Parâmetro url codificado corretamente");
assert(shareUrl.includes("text=Confira%20este%20*artigo*"), "Parâmetro text codificado com markdown");
console.log("  -> Deep-link t.me/share homologado com sucesso.\n");

// ============================================================================
// 8. TESTE DE RESILIÊNCIA A PAYLOAD MONSTRUOSO (> 5.000 CARACTERES)
// ============================================================================
console.log("[8/8] Testando Resiliência a Resumo e Conteúdo Gigantes (> 5.000 caracteres)...");

const giantPayload: MultimodalDispatchPayload = {
  ...samplePayload,
  title: "Arquitetura Monolítica vs Microsserviços e Sistemas Cognitivos com Checkpoints em Ambientes de Alta Disponibilidade",
  summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(100), // ~5.600 caracteres
  contentMarkdown: "- Ponto Um Super Relevante com Detalhes Extensos\n".repeat(40)
};

const giantDigest = generateTelegramMessageVariant(giantPayload, { format: "broadcast_digest" });
assert(giantDigest.isWithinLimit, `Mensagem gigante truncada com segurança (${giantDigest.charCount} <= 4.096)`);
assert(giantDigest.text.includes("[👉 Ler Análise Técnica Completa no AutoBlog]("), "Hiperlink de destino preservado intacto sob truncamento");
assert(giantDigest.text.includes("📢 *V5 APOLLO DIGEST*"), "Cabeçalho mantido intacto");
assert(giantDigest.text.includes(giantDigest.utmUrl), "URL de rastreamento com UTM mantida intacta");
console.log("  -> Resiliência sob truncamento homologada com sucesso.\n");

console.log("================================================================================");
console.log(` RESULTADO FINAL: ${passedTests}/${totalTests} TESTES APROVADOS COM SUCESSO!`);
console.log(" ETAPA 056 CONCLUÍDA E HOMOLOGADA COM PRECISÃO CIRÚRGICA.");
console.log("================================================================================");
