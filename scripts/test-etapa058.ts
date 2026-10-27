/**
 * test-etapa058.ts - Validação Automatizada da Etapa 058
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Valida o Motor de Cópia com 1 Clique e Feedback Visual Reativo:
 * 1. Formatação do pacote onicanal completo (formatAllTeasersBundle)
 * 2. Mensagens contextuais de feedback por plataforma (getCopyFeedbackMessage)
 * 3. Resiliência do método copyToClipboard para entradas vazias e ambientes headless
 * 4. Integridade das 6 seções no pacote consolidado (Twitter, Threads, Instagram, WhatsApp, Telegram, LinkedIn)
 * 5. Preservação de metadados, links canônicos e quebras de linha limpas
 */

import { 
  formatAllTeasersBundle, 
  getCopyFeedbackMessage, 
  copyToClipboard 
} from "../src/lib/social/socialCopyEngine";
import { compileSocialTeasers } from "../src/lib/social/socialTeaserEngine";
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
console.log(" INICIANDO BATERIA DE TESTES - ETAPA 058: BOTÃO DE CÓPIA COM 1 CLIQUE");
console.log("================================================================================\n");

const samplePayload: MultimodalDispatchPayload = {
  id: "copy_test_058",
  title: "Orquestração Onicanal: Como Escalar Conteúdo com Automação em Nuvem",
  slug: "orquestracao-onicanal-como-escalar-conteudo-automacao-nuvem",
  canonical_url: "https://v5autoblog.com/artigo/orquestracao-onicanal-como-escalar-conteudo-automacao-nuvem",
  summary: "Aprenda como unificar blogs, newsletters, redes sociais e comunidades VIP em uma única esteira automatizada sem depender de extensões frágeis.",
  contentMarkdown: `## Central de Despacho Onicanal
O V5 Apollo Poster conecta todos os pontos de contato da holding.

### Pilares de Despacho:
- APIs oficiais em nuvem (Meta Graph, Telegram, Resend)
- Formatação nativa sob medida para cada algoritmo
- Rastreamento cirúrgico de conversão via UTMs exclusivas

Zero fricção para o usuário final.`,
  coverImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
  blogOptions: {
    enabled: true,
    targetPlatform: "v5autoblog",
    targetEndpoint: "https://v5autoblog.com/api/v1/posts",
    category: "Engenharia de Software",
    tags: ["Onicanal", "Automação", "APIs", "Escalabilidade"],
    author: "Apollo La Plata",
    generateSchema: true
  },
  emailOptions: {
    enabled: true,
    subject: "Orquestração Onicanal em Nuvem",
    previewText: "Aprenda como unificar blogs, newsletters e redes sociais em uma esteira única.",
    fromName: "Apollo La Plata",
    provider: "resend",
    audienceList: "Tech VIP",
    utmCampaign: "onicanal_copy_058"
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
// 1. TESTE DE COMPILAÇÃO E PACOTE ONICANAL COMPLETO
// ============================================================================
console.log("[1/4] Testando Formatação do Pacote Onicanal (formatAllTeasersBundle)...");

const compiled = compileSocialTeasers(samplePayload);
const bundle = formatAllTeasersBundle(samplePayload, compiled);

assert(bundle.includes("# 📦 KIT COMPLETO DE TEASERS SOCIAIS (V5 APOLLO POSTER :3011)"), "Cabeçalho oficial do pacote onicanal presente");
assert(bundle.includes(samplePayload.title), "Título do artigo incluído no cabeçalho");
assert(bundle.includes(samplePayload.canonical_url || ""), "Link canônico incluído no cabeçalho");

// Verifica presença das 6 redes no pacote
assert(bundle.includes("## 1. 𝕏 / TWITTER"), "Seção do Twitter presente no pacote");
assert(bundle.includes("## 2. 🧵 THREADS"), "Seção do Threads presente no pacote");
assert(bundle.includes("## 3. 📸 INSTAGRAM FEED & REELS"), "Seção do Instagram presente no pacote");
assert(bundle.includes("## 4. 💬 WHATSAPP COMUNIDADES & GRUPOS"), "Seção do WhatsApp presente no pacote");
assert(bundle.includes("## 5. ✈️ TELEGRAM CANAIS VIP"), "Seção do Telegram presente no pacote");
assert(bundle.includes("## 6. 💼 LINKEDIN ARTIGOS & POSTS"), "Seção do LinkedIn presente no pacote");

// Verifica que os textos individuais foram incluídos
assert(bundle.includes(compiled.x_twitter.text), "Texto real do Twitter incluído no bundle");
assert(bundle.includes(compiled.threads.text), "Texto real do Threads incluído no bundle");
assert(bundle.includes(compiled.instagram.text), "Texto real do Instagram incluído no bundle");
assert(bundle.includes(compiled.whatsapp.text), "Texto real do WhatsApp incluído no bundle");
assert(bundle.includes(compiled.telegram.text), "Texto real do Telegram incluído no bundle");
assert(bundle.includes(compiled.linkedin.text), "Texto real do LinkedIn incluído no bundle");

assert(bundle.includes("Capitania #13 Poster"), "Assinatura da Capitania #13 presente no rodapé do pacote");
console.log("  -> Pacote onicanal consolidado validado com sucesso.\n");

// ============================================================================
// 2. TESTE DE MENSAGENS DE FEEDBACK CONTEXTUAL (getCopyFeedbackMessage)
// ============================================================================
console.log("[2/4] Testando Mensagens de Feedback Contextual por Plataforma...");

const platforms: SocialTeaserPlatform[] = ["x_twitter", "threads", "instagram", "whatsapp", "telegram", "linkedin"];

for (const p of platforms) {
  const msg = getCopyFeedbackMessage(p, 150);
  assert(msg.includes("copiado (150/"), `Mensagem de ${p} contém contagem atual 150`);
  assert(msg.includes("Pronto para colar"), `Mensagem de ${p} possui CTA de colagem rápida`);
}
console.log("  -> Mensagens contextuais homologadas com sucesso.\n");

// ============================================================================
// 3. TESTE DE RESILIÊNCIA DA FUNÇÃO copyToClipboard
// ============================================================================
console.log("[3/4] Testando Resiliência do Método copyToClipboard...");

async function testClipboardSafety() {
  // Teste 1: Texto vazio
  const emptyResult = await copyToClipboard("");
  assert(!emptyResult, "Retorna false com segurança para texto vazio sem lançar erro");

  // Teste 2: Em ambiente Node (sem document/navigator), retorna false sem quebrar
  const nodeResult = await copyToClipboard("Teste de cópia");
  assert(typeof nodeResult === "boolean", "Retorna boolean em ambiente Node.js sem exceção não tratada");
}

testClipboardSafety().then(() => {
  console.log("  -> Resiliência de cópia homologada com sucesso.\n");

  // ============================================================================
  // 4. TESTE DE INTEGRIDADE DE LIMITES NO PACOTE
  // ============================================================================
  console.log("[4/4] Testando Metadados de Contagem no Pacote...");

  assert(bundle.includes(`/${compiled.x_twitter.charLimit}c)`), "Metadado de limite do Twitter presente no título da seção");
  assert(bundle.includes(`/${compiled.threads.charLimit}c)`), "Metadado de limite do Threads presente no título da seção");
  assert(bundle.includes(`/${compiled.instagram.charLimit}c)`), "Metadado de limite do Instagram presente no título da seção");
  assert(bundle.includes(`/${compiled.whatsapp.charLimit}c)`), "Metadado de limite do WhatsApp presente no título da seção");
  assert(bundle.includes(`/${compiled.telegram.charLimit}c)`), "Metadado de limite do Telegram presente no título da seção");
  assert(bundle.includes(`/${compiled.linkedin.charLimit}c)`), "Metadado de limite do LinkedIn presente no título da seção");

  console.log("  -> Metadados de contagem e limites validados com sucesso.\n");

  console.log("================================================================================");
  console.log(` RESULTADO FINAL: ${passedTests}/${totalTests} TESTES APROVADOS COM SUCESSO!`);
  console.log(" ETAPA 058 CONCLUÍDA E HOMOLOGADA COM PRECISÃO CIRÚRGICA.");
  console.log("================================================================================");
});
