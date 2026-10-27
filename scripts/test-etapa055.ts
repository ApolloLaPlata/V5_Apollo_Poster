/**
 * test-etapa055.ts - Validação Automatizada da Etapa 055
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Valida o Gerador Especializado de Mensagens para Grupos de WhatsApp:
 * 1. Conversão e sanitização de negritos nativos (*texto* vs **markdown**)
 * 2. 3 Formatos Estratégicos (Alerta Rápido, Resumo Executivo e Comunidade VIP)
 * 3. Seleção de Destino de Canais (Grupo, Comunidade VIP, Canal de Transmissão) com UTMs dedicadas
 * 4. Toggles de Customização (Bullets e Rodapé dinâmicos)
 * 5. Deep-link de compartilhamento wa.me / api.whatsapp.com
 * 6. Resiliência de truncamento sob payloads ultra-extensos (> 2.500 caracteres)
 * 7. Detecção de Sweet Spot de leitura no celular (250 a 650 caracteres)
 */

import { 
  toWhatsAppFormatting,
  formatWhatsAppBullets,
  buildWhatsAppShareUrl,
  generateWhatsAppMessageVariant,
  generateAllWhatsAppVariants,
  WHATSAPP_FORMAT_TEMPLATES,
  WHATSAPP_DESTINATION_CONFIGS,
  WhatsAppMessageFormat,
  WhatsAppDestinationType
} from "../src/lib/social/whatsappMessageGenerator";
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
console.log(" INICIANDO BATERIA DE TESTES - ETAPA 055: GERADOR DE MENSAGENS PARA WHATSAPP");
console.log("================================================================================\n");

const samplePayload: MultimodalDispatchPayload = {
  id: "whatsapp_test_055",
  title: "Como Escalar Agentes Autônomos em Produção com Alta Disponibilidade",
  slug: "como-escalar-agentes-autonomos-producao-alta-disponibilidade",
  canonical_url: "https://v5autoblog.com/artigo/como-escalar-agentes-autonomos-producao-alta-disponibilidade",
  summary: "Guia completo demonstrando a arquitetura de múltiplos agentes trabalhando em paralelo com checkpointing determinístico e recuperação de falhas sem gargalos de concorrência.",
  contentMarkdown: `## Introdução aos Agentes
Agentes autônomos exigem orquestração precisa e isolamento de contexto.

### Pilares Fundamentais:
- Arquitetura descentralizada com Hive Bus
- Checkpointing resiliente a cada transação
- Recuperação autônoma de falhas sem intervenção manual

A escalabilidade depende da separação entre leitura e escrita.`,
  coverImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
  blogOptions: {
    enabled: true,
    targetPlatform: "v5autoblog",
    targetEndpoint: "https://v5autoblog.com/api/v1/posts",
    category: "Inteligência Artificial",
    tags: ["Agentes Autônomos", "Next.js", "Arquitetura", "Escalabilidade"],
    author: "Apollo La Plata",
    generateSchema: true
  },
  emailOptions: {
    enabled: true,
    subject: "Como Escalar Agentes Autônomos",
    previewText: "Aprenda a arquitetura definitiva para escalar agentes autônomos sem gargalos.",
    fromName: "Apollo La Plata",
    provider: "resend",
    audienceList: "Tech VIP",
    utmCampaign: "agentes_autonomos_escalabilidade_055"
  },
  socialTeaserOptions: {
    enabled: true,
    platforms: ["whatsapp"]
  },
  dispatchStatus: {
    overall: "idle",
    email: { status: "idle" },
    blog: { status: "idle" },
    social: { status: "idle" }
  }
};

// ============================================================================
// 1. TESTE DE FORMATAÇÃO E SANITIZAÇÃO DE NEGRITO NATIVO (*texto*)
// ============================================================================
console.log("[1/7] Testando Conversão para Formatação Nativa do WhatsApp (*texto*)...");

const markdownBold = "Este é um texto com **negrito markdown duplo** e **outro negrito**.";
const formattedBold = toWhatsAppFormatting(markdownBold);
assert(!formattedBold.includes("**"), "Remove completamente asteriscos duplos (**) do Markdown");
assert(formattedBold.includes("*negrito markdown duplo*"), "Converte para asterisco simples *negrito*");
assert(formattedBold.includes("*outro negrito*"), "Converte múltiplos blocos de negrito");

const htmlBold = "Texto com <b>tag b</b> e <strong>tag strong</strong> e <em>itálico</em>.";
const formattedHtml = toWhatsAppFormatting(htmlBold);
assert(!formattedHtml.includes("<b>") && !formattedHtml.includes("<strong>"), "Remove tags HTML de negrito");
assert(formattedHtml.includes("*tag b*"), "Converte <b> para *texto*");
assert(formattedHtml.includes("*tag strong*"), "Converte <strong> para *texto*");
assert(formattedHtml.includes("_itálico_"), "Converte <em> para _itálico_");

const headerMd = "### Arquitetura de Múltiplos Agentes";
const formattedHeader = toWhatsAppFormatting(headerMd);
assert(formattedHeader.startsWith("*") && formattedHeader.endsWith("*"), "Converte header Markdown (###) para *Título*");

const unclosedAsterisk = "Texto com *asterisco órfão sem fechamento";
const formattedUnclosed = toWhatsAppFormatting(unclosedAsterisk);
const countAsterisks = (formattedUnclosed.match(/\*/g) || []).length;
assert(countAsterisks % 2 === 0, "Garante que o número total de asteriscos seja sempre par (sem asterisco órfão)");
console.log("  -> Formatação nativa e sanitização validadas com sucesso.\n");

// ============================================================================
// 2. TESTE DOS 3 FORMATOS ESTRATÉGICOS DE MENSAGEM
// ============================================================================
console.log("[2/7] Testando os 3 Formatos Estratégicos (Alerta, Resumo, Comunidade VIP)...");

const allVariants = generateAllWhatsAppVariants(samplePayload);

// Formato 1: Alerta Rápido
const alertMsg = allVariants.alert;
assert(alertMsg.format === "alert", "Formato alert identificado corretamente");
assert(alertMsg.text.includes("🚨 *ALERTA V5 APOLLO:*"), "Contém cabeçalho oficial de alerta");
assert(alertMsg.text.includes("👉 *Acesse agora antes de sair do ar:*"), "Contém CTA de urgência");
assert(alertMsg.isWithinLimit, `Alerta dentro do limite de 1.024 caracteres (${alertMsg.charCount}c)`);
assert(alertMsg.encodedWhatsAppUrl.startsWith("https://api.whatsapp.com/send?text="), "Gera link de envio wa.me para o alerta");

// Formato 2: Resumo Executivo (Playbook)
const playbookMsg = allVariants.playbook;
assert(playbookMsg.format === "playbook", "Formato playbook identificado corretamente");
assert(playbookMsg.text.includes("📋 *RESUMO EXECUTIVO:*"), "Contém cabeçalho oficial de resumo executivo");
assert(playbookMsg.text.includes("⚡ *Destaques da Análise:*"), "Contém seção de destaques com bullets");
assert(playbookMsg.bulletPoints.length >= 2, "Extraiu pelo menos 2 bullet points técnicos do conteúdo");
assert(playbookMsg.isWithinLimit, `Playbook dentro do limite de 1.024 caracteres (${playbookMsg.charCount}c)`);

// Formato 3: Comunidade VIP
const vipMsg = allVariants.community_vip;
assert(vipMsg.format === "community_vip", "Formato community_vip identificado corretamente");
assert(vipMsg.text.includes("💎 *MEMBROS VIP & NETWORKING:*"), "Contém cabeçalho de comunidade VIP");
assert(vipMsg.text.includes("👉 *Link direto exclusivo para a comunidade:*"), "Contém CTA exclusivo de comunidade");
assert(vipMsg.text.includes("💬 _O que acharam dessa estratégia?"), "Contém chamada para discussão no grupo");
assert(vipMsg.isWithinLimit, `Comunidade VIP dentro do limite (${vipMsg.charCount}c)`);
console.log("  -> 3 Formatos estratégicos validados com sucesso.\n");

// ============================================================================
// 3. TESTE DE DESTINOS DE CANAL E UTMS DEDICADAS
// ============================================================================
console.log("[3/7] Testando Destinos de Canal e Rastreamento de UTMs...");

const groupDest = generateWhatsAppMessageVariant(samplePayload, { destination: "group" });
assert(groupDest.utmUrl.includes("utm_source=whatsapp"), "UTM source é whatsapp");
assert(groupDest.utmUrl.includes("utm_medium=whatsapp_group"), "UTM medium para grupo comum é whatsapp_group");

const vipDest = generateWhatsAppMessageVariant(samplePayload, { destination: "vip_community" });
assert(vipDest.utmUrl.includes("utm_medium=whatsapp_vip_community"), "UTM medium para comunidade VIP é whatsapp_vip_community");

const channelDest = generateWhatsAppMessageVariant(samplePayload, { destination: "broadcast_channel" });
assert(channelDest.utmUrl.includes("utm_medium=whatsapp_channel"), "UTM medium para canal oficial é whatsapp_channel");
console.log("  -> Destinos de canal e UTMs rastreadas homologadas.\n");

// ============================================================================
// 4. TESTE DE TOGGLES DE CUSTOMIZAÇÃO (BULLETS E RODAPÉ)
// ============================================================================
console.log("[4/7] Testando Toggles de Customização (Bullets e Rodapé)...");

const noBullets = generateWhatsAppMessageVariant(samplePayload, { includeBullets: false });
assert(!noBullets.text.includes("⚡ *Destaques da Análise:*"), "Mensagem sem bullets não inclui seção de destaques");

const noFooter = generateWhatsAppMessageVariant(samplePayload, { includeFooter: false });
assert(!noFooter.text.includes("📢 _Compartilhe este insight"), "Mensagem sem rodapé não inclui mensagem de encerramento");

const withAll = generateWhatsAppMessageVariant(samplePayload, { includeBullets: true, includeFooter: true });
assert(withAll.text.includes("⚡ *Destaques da Análise:*") && withAll.text.includes("📢 _Compartilhe"), "Mensagem completa inclui todos os blocos");
console.log("  -> Toggles de customização validados com sucesso.\n");

// ============================================================================
// 5. TESTE DE DEEP-LINK DE ENVIO RÁPIDO (WA.ME)
// ============================================================================
console.log("[5/7] Testando Deep-Link wa.me / api.whatsapp.com...");

const shareUrl = buildWhatsAppShareUrl("Olá *Comunidade*!\n🔗 https://v5autoblog.com");
assert(shareUrl.startsWith("https://api.whatsapp.com/send?text="), "URL de envio começa com prefixo oficial da API");
assert(shareUrl.includes("*Comunidade*") || shareUrl.includes("%2AComunidade%2A"), "Asteriscos de negrito são preservados/codificados para a API do WhatsApp");
assert(shareUrl.includes("https%3A%2F%2Fv5autoblog.com"), "Link interno codificado perfeitamente");
console.log("  -> Deep-link de compartilhamento wa.me validado com sucesso.\n");

// ============================================================================
// 6. TESTE DE RESILIÊNCIA A PAYLOAD GIGANTESCO (> 2.500 CARACTERES)
// ============================================================================
console.log("[6/7] Testando Resiliência com Conteúdo e Resumo Monstruosos...");

const giantPayload: MultimodalDispatchPayload = {
  ...samplePayload,
  title: "Arquitetura Avançada de Agentes com Orquestração em Escala Continental e Recuperação Automática de Falhas em Nós Distribuídos de Alta Complexidade",
  summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(60), // ~3.360 caracteres
  contentMarkdown: "- Ponto Um Super Relevante\n- Ponto Dois Muito Relevante\n".repeat(30)
};

const giantResult = generateWhatsAppMessageVariant(giantPayload, { format: "playbook" });
assert(giantResult.isWithinLimit, `Mensagem gigante permaneceu estritamente dentro do limite (${giantResult.charCount} <= 1.024)`);
assert(giantResult.text.includes("🔗 https://v5autoblog.com"), "O link e a URL com UTM permanecem intactos mesmo sob truncamento drástico");
assert(giantResult.text.includes("📋 *RESUMO EXECUTIVO:*"), "O cabeçalho permanece preservado");
console.log("  -> Resiliência sob truncamento homologada com sucesso.\n");

// ============================================================================
// 7. TESTE DE SWEET SPOT DE LEITURA NO CELULAR (250 A 650 CARACTERES)
// ============================================================================
console.log("[7/7] Testando Sweet Spot de Leitura no Celular...");

assert(playbookMsg.isSweetSpot, `Mensagem padrão está no Sweet Spot ideal de leitura no celular (${playbookMsg.charCount} caracteres)`);
assert(alertMsg.isSweetSpot, `Mensagem de alerta está no Sweet Spot (${alertMsg.charCount} caracteres)`);
console.log("  -> Sweet Spot de leitura no celular validado com sucesso.\n");

console.log("================================================================================");
console.log(` RESULTADO FINAL: ${passedTests}/${totalTests} TESTES APROVADOS COM SUCESSO!`);
console.log(" ETAPA 055 CONCLUÍDA E HOMOLOGADA COM PRECISÃO CIRÚRGICA.");
console.log("================================================================================");
