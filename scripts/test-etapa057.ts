/**
 * test-etapa057.ts - Validação Automatizada da Etapa 057
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Valida o Painel de Edição de Teasers Individuais e Contadores de Caracteres em Tempo Real:
 * 1. Cálculo de métricas dinâmicas para as 6 redes (Twitter, Threads, Instagram, WhatsApp, Telegram, LinkedIn)
 * 2. Detecção de status de preenchimento (comfortable, approaching_limit, exceeded_limit)
 * 3. Alerta de excesso e cálculo de caracteres negativos
 * 4. Validação de Sweet Spots de engajamento por rede
 * 5. Inserção dinâmica de atributos (+ Link UTM, + Hashtags, + Bullets, + Gatilho DM)
 * 6. Integridade da compilação e sincronização do painel
 */

import { 
  calculateTeaserMetrics,
  SOCIAL_CHAR_LIMITS,
  SOCIAL_PLATFORM_NAMES,
  SOCIAL_SWEET_SPOTS,
  TeaserMetrics,
  compileSocialTeasers,
  formatHashtags,
  extractBulletPoints,
  buildSocialUtmUrl
} from "../src/lib/social/socialTeaserEngine";
import { MultimodalDispatchPayload, SocialTeaserPlatform } from "../src/types/poster";

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
console.log(" INICIANDO BATERIA DE TESTES - ETAPA 057: PAINEL DE EDIÇÃO DE TEASERS INDIVIDUAIS");
console.log("================================================================================\n");

const samplePayload: MultimodalDispatchPayload = {
  id: "editor_panel_test_057",
  title: "Engenharia de Prompt e Otimização Cognitiva para Sistemas de IA em Larga Escala",
  slug: "engenharia-de-prompt-otimizacao-cognitiva-sistemas-ia",
  canonical_url: "https://v5autoblog.com/artigo/engenharia-de-prompt-otimizacao-cognitiva-sistemas-ia",
  summary: "Guia definitivo sobre como estruturar prompts determinísticos com chain of density, caching semântico e guardrails de segurança para modelos de fronteira.",
  contentMarkdown: `## Boas Práticas de Engenharia de Prompt
O uso de técnicas modernas reduz latência e custos computacionais.

### Pontos Cruciais:
- Caching de contexto com prefixos imutáveis
- Chain of Density para condensação máxima de informação
- Validação estruturada via JSON Schema rígido

A consistência depende da parametrização correta da temperatura.`,
  coverImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
  blogOptions: {
    enabled: true,
    targetPlatform: "v5autoblog",
    targetEndpoint: "https://v5autoblog.com/api/v1/posts",
    category: "Inteligência Artificial",
    tags: ["Engenharia de Prompt", "Inteligência Artificial", "LLMs", "Arquitetura"],
    author: "Apollo La Plata",
    generateSchema: true
  },
  emailOptions: {
    enabled: true,
    subject: "Engenharia de Prompt em Larga Escala",
    previewText: "Guia definitivo sobre como estruturar prompts determinísticos com guardrails.",
    fromName: "Apollo La Plata",
    provider: "resend",
    audienceList: "Tech VIP",
    utmCampaign: "editor_panel_057"
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
// 1. TESTE DE COBERTURA DAS 6 PLATAFORMAS E LIMITES OFICIAIS
// ============================================================================
console.log("[1/6] Testando Configuração das 6 Plataformas Suportadas...");

const platforms: SocialTeaserPlatform[] = ["x_twitter", "threads", "instagram", "whatsapp", "telegram", "linkedin"];

assert(platforms.length === 6, "Exatamente 6 plataformas integradas");
assert(SOCIAL_CHAR_LIMITS.x_twitter === 280, "Twitter: limite oficial de 280 caracteres");
assert(SOCIAL_CHAR_LIMITS.threads === 500, "Threads: limite oficial de 500 caracteres");
assert(SOCIAL_CHAR_LIMITS.instagram === 2200, "Instagram: limite oficial de 2.200 caracteres");
assert(SOCIAL_CHAR_LIMITS.whatsapp === 1024, "WhatsApp: limite oficial de 1.024 caracteres");
assert(SOCIAL_CHAR_LIMITS.telegram === 4096, "Telegram: limite oficial de 4.096 caracteres");
assert(SOCIAL_CHAR_LIMITS.linkedin === 3000, "LinkedIn: limite oficial de 3.000 caracteres");
console.log("  -> Limites oficiais das 6 plataformas validados com sucesso.\n");

// ============================================================================
// 2. TESTE DE CÁLCULO DE MÉTRICAS EM TEMPO REAL (calculateTeaserMetrics)
// ============================================================================
console.log("[2/6] Testando Cálculo de Métricas em Tempo Real...");

const shortText = "🚀 Novo artigo incrível na holding!";
const shortMetrics = calculateTeaserMetrics("x_twitter", shortText);
assert(shortMetrics.charCount === shortText.length, "Contagem correta de caracteres");
assert(shortMetrics.charLimit === 280, "Limite correto do Twitter");
assert(shortMetrics.remainingChars === 280 - shortText.length, "Cálculo exato de caracteres restantes");
assert(shortMetrics.isWithinLimit, "Texto curto está dentro do limite");
assert(shortMetrics.status === "comfortable", "Status 'comfortable' para texto curto com folga");
assert(shortMetrics.percentUsed < 85, "Percentual utilizado menor que 85%");

// Teste de status approaching_limit (entre 85% e 100%)
const nearLimitText = "A".repeat(250); // 250 / 280 = ~89%
const nearMetrics = calculateTeaserMetrics("x_twitter", nearLimitText);
assert(nearMetrics.isWithinLimit, "Texto de 250 caracteres está dentro de 280");
assert(nearMetrics.status === "approaching_limit", "Status 'approaching_limit' quando >= 85% do limite");
assert(nearMetrics.remainingChars === 30, "Restam 30 caracteres");

// Teste de status exceeded_limit (> 100%)
const overflowText = "B".repeat(310); // 310 > 280
const overflowMetrics = calculateTeaserMetrics("x_twitter", overflowText);
assert(!overflowMetrics.isWithinLimit, "Texto de 310 caracteres excede limite do Twitter");
assert(overflowMetrics.status === "exceeded_limit", "Status 'exceeded_limit' quando ultrapassa limite");
assert(overflowMetrics.remainingChars === -30, "remainingChars é negativo (-30) refletindo o excesso");
assert(overflowMetrics.percentUsed === 100, "percentUsed limitado a 100% no indicador");
console.log("  -> Métricas em tempo real e detecção de status homologadas.\n");

// ============================================================================
// 3. TESTE DE SWEET SPOTS DE ENGAJAMENTO POR PLATAFORMA
// ============================================================================
console.log("[3/6] Testando Sweet Spots de Engajamento por Plataforma...");

// Twitter Sweet Spot (200 a 260c)
const twitterSweetText = "C".repeat(230);
const twSweetMetrics = calculateTeaserMetrics("x_twitter", twitterSweetText);
assert(twSweetMetrics.isSweetSpot, "Texto de 230c ativa Sweet Spot no Twitter (200-260c)");

const twitterBelowSweet = "C".repeat(150);
const twBelowMetrics = calculateTeaserMetrics("x_twitter", twitterBelowSweet);
assert(!twBelowMetrics.isSweetSpot, "Texto de 150c está abaixo do Sweet Spot do Twitter");

// Threads Sweet Spot (300 a 450c)
const threadsSweet = calculateTeaserMetrics("threads", "D".repeat(380));
assert(threadsSweet.isSweetSpot, "Texto de 380c ativa Sweet Spot no Threads (300-450c)");

// WhatsApp Sweet Spot (200 a 800c)
const whatsappSweet = calculateTeaserMetrics("whatsapp", "E".repeat(500));
assert(whatsappSweet.isSweetSpot, "Texto de 500c ativa Sweet Spot no WhatsApp (200-800c)");

// Telegram Sweet Spot (300 a 1.200c)
const telegramSweet = calculateTeaserMetrics("telegram", "F".repeat(850));
assert(telegramSweet.isSweetSpot, "Texto de 850c ativa Sweet Spot no Telegram (300-1.200c)");

// Instagram Sweet Spot (500 a 1.400c)
const instagramSweet = calculateTeaserMetrics("instagram", "G".repeat(950));
assert(instagramSweet.isSweetSpot, "Texto de 950c ativa Sweet Spot no Instagram (500-1.400c)");

// LinkedIn Sweet Spot (800 a 1.800c)
const linkedinSweet = calculateTeaserMetrics("linkedin", "H".repeat(1200));
assert(linkedinSweet.isSweetSpot, "Texto de 1.200c ativa Sweet Spot no LinkedIn (800-1.800c)");
console.log("  -> Sweet Spots de engajamento de todas as 6 redes validados.\n");

// ============================================================================
// 4. TESTE DE INJEÇÃO DINÂMICA DE ATRIBUTOS
// ============================================================================
console.log("[4/6] Testando Funções de Injeção Rápida de Atributos...");

// Injeção de Link UTM
const twitterUtm = buildSocialUtmUrl(samplePayload.canonical_url || "", samplePayload.slug, "x_twitter");
assert(twitterUtm.includes("utm_source=x_twitter"), "Gera URL com UTM dedicada para Twitter");
assert(twitterUtm.includes("utm_medium=social_teaser"), "UTM medium configurado");

// Injeção de Hashtags formatadas
const formattedTags = formatHashtags(samplePayload.blogOptions.tags, 3);
assert(formattedTags.length === 3, "Retorna exatamente 3 hashtags solicitadas");
assert(formattedTags.includes("#EngenhariaDePrompt"), "Formatação correta CamelCase de tag com espaço");
assert(formattedTags.every(t => t.startsWith("#")), "Todas as tags possuem prefixo #");

// Injeção de Bullet Points extraídos do Markdown
const extractedBullets = extractBulletPoints(samplePayload.contentMarkdown, 3);
assert(extractedBullets.length === 3, "Extraiu 3 bullets do conteúdo do artigo");
assert(extractedBullets.some(b => b.includes("Caching de contexto")), "Capturou bullet de caching");
assert(extractedBullets.some(b => b.includes("Chain of Density")), "Capturou bullet de chain of density");
console.log("  -> Injeção rápida de atributos homologada com sucesso.\n");

// ============================================================================
// 5. TESTE DE COMPILAÇÃO E INTEGRIDADE DO PAINEL
// ============================================================================
console.log("[5/6] Testando Compilação Global de Teasers para o Painel...");

const compiled = compileSocialTeasers(samplePayload);
assert(compiled.summary.totalPlatforms === 6, "Total de 6 plataformas compiladas no resumo");
assert(compiled.summary.allWithinLimits, "Todos os teasers gerados estão dentro dos limites oficiais");
assert(compiled.x_twitter.charCount <= 280, "Twitter compilado respeita limite de 280");
assert(compiled.threads.charCount <= 500, "Threads compilado respeita limite de 500");
assert(compiled.instagram.charCount <= 2200, "Instagram compilado respeita limite de 2.200");
assert(compiled.whatsapp.charCount <= 1024, "WhatsApp compilado respeita limite de 1.024");
assert(compiled.telegram.charCount <= 4096, "Telegram compilado respeita limite de 4.096");
assert(compiled.linkedin.charCount <= 3000, "LinkedIn compilado respeita limite de 3.000");
console.log("  -> Compilação global validada com 100% de conformidade.\n");

// ============================================================================
// 6. TESTE DE RESILIÊNCIA E CARACTERES NULOS OU VAZIOS
// ============================================================================
console.log("[6/6] Testando Resiliência a Textos Vazios ou Nulos...");

const emptyMetrics = calculateTeaserMetrics("x_twitter", "");
assert(emptyMetrics.charCount === 0, "Texto vazio resulta em 0 caracteres");
assert(emptyMetrics.remainingChars === 280, "Restam 280 caracteres para texto vazio");
assert(emptyMetrics.isWithinLimit, "Texto vazio é considerado dentro do limite");
assert(!emptyMetrics.isSweetSpot, "Texto vazio não está no Sweet Spot");
assert(emptyMetrics.percentUsed === 0, "0% utilizado");
console.log("  -> Resiliência a entradas vazias homologada com sucesso.\n");

console.log("================================================================================");
console.log(` RESULTADO FINAL: ${passedTests}/${totalTests} TESTES APROVADOS COM SUCESSO!`);
console.log(" ETAPA 057 CONCLUÍDA E HOMOLOGADA COM PRECISÃO CIRÚRGICA.");
console.log("================================================================================");
