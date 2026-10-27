/**
 * test-etapa051.ts - Validação Automatizada da Etapa 051
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Valida o Motor de Síntese de Teasers Multicanal (compileSocialTeasers):
 * 1. Respeito estrito aos limites oficiais de caracteres por plataforma
 * 2. Adaptação dinâmica e truncamento inteligente (preserva URLs e hashtags)
 * 3. Injeção de links rastreados com UTMs exclusivas por canal
 * 4. Extração de bullet points a partir do corpo Markdown
 * 5. Normalização de hashtags em CamelCase sem acentos
 * 6. Gancho Comment-to-DM no Instagram ("Comente LINK")
 * 7. Formatação nativa de negrito no WhatsApp (*texto*) e Markdown no Telegram
 * 8. Compatibilidade retroativa da API legada e structured output
 */

import { 
  compileSocialTeasers as compileSocialTeasersEngine,
  generateTwitterTeaser,
  generateThreadsTeaser,
  generateInstagramCaption,
  generateWhatsAppMessage,
  generateTelegramMessage,
  generateLinkedInTeaser,
  formatHashtags,
  extractBulletPoints,
  fitToCharacterLimit,
  SOCIAL_CHAR_LIMITS
} from "../src/lib/social/socialTeaserEngine";
import { compileSocialTeasers as compileFromMultimodal } from "../src/lib/dispatch/multimodalEngine";
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
console.log(" INICIANDO BATERIA DE TESTES - ETAPA 051: MOTOR DE TEASERS MULTICANAL");
console.log("================================================================================\n");

// Payload com texto intencionalmente longo para testar o algoritmo de truncamento dinâmico
const samplePayload: MultimodalDispatchPayload = {
  id: "test_social_051",
  title: "Como Escalar Agentes Autônomos em Produção com Alta Disponibilidade e Memória Contínua",
  slug: "como-escalar-agentes-autonomos-producao-alta-disponibilidade",
  canonical_url: "https://v5autoblog.com/artigo/como-escalar-agentes-autonomos-producao-alta-disponibilidade",
  summary: "Aprenda a arquitetar pipelines de microsserviços cognitivos com múltiplos agentes autônomos sem perda de contexto ou gargalos de latência. Um guia passo a passo com exemplos práticos, benchmarks de performance e estratégias avançadas de resiliência corporativa.",
  contentMarkdown: `
# Arquitetura de Agentes em Produção

A implementação de sistemas cognitivos em escala exige uma mudança fundamental de paradigma.

## 1. Desafios de Concorrência
- Isolamento estrito de sessões para garantir idempotência operacional.
- Barramento de eventos assíncrono para comunicação sem bloqueios.
- Checkpoints determinísticos que permitem recuperação após falhas inesperadas.

## 2. Padrões de Memória Contínua
- Memória de curto prazo indexada em Redis vetorial.
- Memória episódica com sumarização periódica em background.
- Grafo de conhecimento com conexões semânticas persistidas.
  `,
  coverImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
  blogOptions: {
    enabled: true,
    targetPlatform: "v5autoblog",
    targetEndpoint: "https://v5autoblog.com/api/v1/posts",
    category: "Inteligência Artificial",
    tags: ["Agentes Autônomos", "Inteligência Artificial", "TypeScript", "Next.js 14", "Arquitetura"],
    author: "Apollo La Plata",
    generateSchema: true
  },
  emailOptions: {
    enabled: true,
    subject: "Como Escalar Agentes Autônomos",
    previewText: "Aprenda a arquitetar pipelines de microsserviços cognitivos com múltiplos agentes.",
    fromName: "Apollo La Plata",
    provider: "resend",
    audienceList: "Tech VIP",
    utmCampaign: "social_teasers"
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

// 1. Teste de Normalização de Hashtags
console.log("[1/8] Testando Normalização e Formatação de Hashtags...");
const rawTags = ["Inteligência Artificial", "TypeScript & Next.js", "agentes autônomos", "alta-disponibilidade!"];
const formattedTags = formatHashtags(rawTags, 4);
assert(formattedTags.length === 4, "4 hashtags geradas");
assert(formattedTags[0] === "#InteligenciaArtificial", "Acentos removidos e CamelCase aplicado: #InteligenciaArtificial");
assert(formattedTags[1] === "#TypescriptNextJs", "Caracteres especiais removidos e CamelCase aplicado: #TypescriptNextJs");
assert(formattedTags[2] === "#AgentesAutonomos", "Espaços convertidos em CamelCase: #AgentesAutonomos");
console.log("  -> Normalização de hashtags validada com sucesso.\n");

// 2. Teste de Extração de Bullet Points
console.log("[2/8] Testando Extração de Pontos-Chave a partir do Markdown...");
const bullets = extractBulletPoints(samplePayload.contentMarkdown, 3);
assert(bullets.length === 3, "Extraiu exatamente 3 pontos principais da lista");
assert(bullets[0].includes("Isolamento estrito"), "Primeiro item de lista capturado com precisão");
assert(bullets[1].includes("Barramento de eventos"), "Segundo item de lista capturado");
console.log("  -> Extração de bullet points validada com sucesso.\n");

// 3. Teste do Algoritmo de Truncamento Seguro (fitToCharacterLimit)
console.log("[3/8] Testando Algoritmo fitToCharacterLimit...");
const testFitted = fitToCharacterLimit({
  header: "🚀 Título Principal",
  body: "Este é um texto deliberadamente longo com várias frases descritivas que precisará ser reduzido de forma inteligente sem partir nenhuma palavra no meio para caber com segurança no limite.",
  cta: "Leia agora:",
  url: "https://v5autoblog.com/artigo/teste?utm_source=twitter",
  hashtagsText: "#IA #Tech",
  charLimit: 160
});
assert(testFitted.text.length <= 160, `Texto ajustado possui ${testFitted.text.length} caracteres (<= 160)`);
assert(testFitted.text.includes("https://v5autoblog.com/artigo/teste?utm_source=twitter"), "URL preservada integralmente");
assert(testFitted.text.includes("#IA #Tech"), "Hashtags preservadas integralmente");
assert(testFitted.isTrimmed === true, "Flag isTrimmed ativada");
console.log("  -> Algoritmo fitToCharacterLimit validado com sucesso.\n");

// 4. Teste de Teaser para X / Twitter (280 caracteres)
console.log("[4/8] Testando Teaser para X / Twitter (Limite de 280 caracteres)...");
const twitterTeaser = generateTwitterTeaser(samplePayload);
assert(twitterTeaser.platform === "x_twitter", "Plataforma x_twitter identificada");
assert(twitterTeaser.charCount <= 280, `Twitter teaser respeita limite: ${twitterTeaser.charCount}/280 caracteres`);
assert(twitterTeaser.isWithinLimit === true, "isWithinLimit deve ser true");
assert(twitterTeaser.utmUrl.includes("utm_source=x_twitter"), "UTM para x_twitter presente na URL");
assert(twitterTeaser.text.includes("Leia na íntegra:"), "Call to action presente");
console.log("  -> Teaser do X / Twitter aprovado dentro dos 280 caracteres.\n");

// 5. Teste de Teaser para Threads (500 caracteres)
console.log("[5/8] Testando Teaser para Threads (Limite de 500 caracteres)...");
const threadsTeaser = generateThreadsTeaser(samplePayload);
assert(threadsTeaser.platform === "threads", "Plataforma threads identificada");
assert(threadsTeaser.charCount <= 500, `Threads teaser respeita limite: ${threadsTeaser.charCount}/500 caracteres`);
assert(threadsTeaser.isWithinLimit === true, "Threads isWithinLimit deve ser true");
assert(threadsTeaser.utmUrl.includes("utm_source=threads"), "UTM para threads presente");
console.log("  -> Teaser do Threads aprovado dentro dos 500 caracteres.\n");

// 6. Teste de Legenda do Instagram com Gancho Comment-to-DM
console.log("[6/8] Testando Legenda do Instagram (Comment-to-DM)...");
const instagramTeaser = generateInstagramCaption(samplePayload, { commentToDmKeyword: "LINK" });
assert(instagramTeaser.platform === "instagram", "Plataforma instagram identificada");
assert(instagramTeaser.charCount <= 2200, `Instagram respeita limite: ${instagramTeaser.charCount}/2200 caracteres`);
assert(instagramTeaser.text.includes('COMENTE "LINK"'), "Gancho Comment-to-DM com palavra-chave LINK presente");
assert(instagramTeaser.text.includes("."), "Quebras de parágrafo limpas com pontos presentes");
assert(instagramTeaser.text.includes("✓ Isolamento estrito"), "Bullet points de conteúdo formatados");
console.log("  -> Legenda do Instagram com Comment-to-DM validada com sucesso.\n");

// 7. Teste de Mensagens para WhatsApp e Telegram
console.log("[7/8] Testando Formatação Específica para WhatsApp e Telegram...");
const whatsappTeaser = generateWhatsAppMessage(samplePayload);
assert(whatsappTeaser.platform === "whatsapp", "Plataforma whatsapp identificada");
assert(whatsappTeaser.text.includes("*NOVO ARTIGO LIBERADO:*"), "Negrito nativo do WhatsApp (*texto*) presente");
assert(whatsappTeaser.charCount <= 1024, `WhatsApp respeita limite: ${whatsappTeaser.charCount}/1024 caracteres`);

const telegramTeaser = generateTelegramMessage(samplePayload);
assert(telegramTeaser.platform === "telegram", "Plataforma telegram identificada");
assert(telegramTeaser.text.includes("[Clique aqui para ler na íntegra no V5 AutoBlog]"), "Link em Markdown para Telegram presente");
assert(telegramTeaser.charCount <= 4096, `Telegram respeita limite: ${telegramTeaser.charCount}/4096 caracteres`);
console.log("  -> Formatações de WhatsApp e Telegram validadas com sucesso.\n");

// 8. Teste de Compilação Geral Multicanal e Retrocompatibilidade
console.log("[8/8] Testando Motor Central e Retrocompatibilidade de API...");
const compiled = compileSocialTeasersEngine(samplePayload);
assert(compiled.summary.totalPlatforms === 6, "Todas as 6 plataformas sintetizadas");
assert(compiled.summary.allWithinLimits === true, "Todos os teasers estão estritamente dentro dos limites oficiais");

// Teste da chamada via multimodalEngine
const legacyCompiled = compileFromMultimodal(samplePayload);
assert(typeof legacyCompiled.x_twitter === "string" && legacyCompiled.x_twitter.length <= 280, "Compatibilidade string x_twitter mantida");
assert(typeof legacyCompiled.threads === "string" && legacyCompiled.threads.length <= 500, "Compatibilidade string threads mantida");
assert(typeof legacyCompiled.instagram_caption === "string", "Compatibilidade string instagram_caption mantida");
assert(typeof legacyCompiled.telegram_vip === "string", "Compatibilidade string telegram_vip mantida");
assert(typeof legacyCompiled.whatsapp_community === "string", "Compatibilidade string whatsapp_community mantida");
assert(legacyCompiled.structured !== undefined, "Acesso à estrutura completa disponível via .structured");
console.log("  -> Motor central e retrocompatibilidade validados com sucesso.\n");

console.log("================================================================================");
console.log(` RESULTADO FINAL: ${passedTests}/${totalTests} TESTES APROVADOS COM SUCESSO!`);
console.log(" ETAPA 051 CONCLUÍDA COM PRECISÃO CIRÚRGICA.");
console.log("================================================================================");
