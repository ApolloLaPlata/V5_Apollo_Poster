/**
 * test-etapa054.ts - Validação Automatizada da Etapa 054
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Valida o Gerador de Legenda para Instagram (Parágrafos espaçados, hashtags e Comment-to-DM):
 * 1. 3 Formatos Editoriais (Carrossel Educativo, Reels Viral, Estudo de Caso)
 * 2. Fórmula Triad de Hashtags (Nicho + Indústria + Marca) com limite anti-spam (<= 15 tags)
 * 3. Integração com gatilho Comment-to-DM (palavras-chave "LINK", "QUERO", "GUIA")
 * 4. Espaçamento limpo de parágrafos com separador anti-collapse (.)
 * 5. Respeito ao limite oficial de 2.200 caracteres e detecção de Sweet Spot
 * 6. Resiliência de truncamento preservando CTA e hashtags intactos
 */

import { 
  generateInstagramCaptionFormatted, 
  buildInstagramHashtagCluster,
  INSTAGRAM_FORMAT_TEMPLATES,
  COMMENT_KEYWORDS,
  InstagramPostFormat
} from "../src/lib/social/instagramCaptionGenerator";
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
console.log(" INICIANDO BATERIA DE TESTES - ETAPA 054: GERADOR DE LEGENDAS PARA INSTAGRAM");
console.log("================================================================================\n");

const samplePayload: MultimodalDispatchPayload = {
  id: "ig_test_054",
  title: "Como Construir Agentes Autônomos de Alta Performance com Next.js 14",
  slug: "como-construir-agentes-autonomos-alta-performance",
  canonical_url: "https://v5autoblog.com/artigo/como-construir-agentes-autonomos-alta-performance",
  summary: "Descubra o passo a passo completo para implementar pipelines cognitivos com microsserviços orientados a eventos, checkpoints determinísticos e execução sem servidor.",
  contentMarkdown: `
# Arquitetura de Agentes no Instagram

Construir agentes autônomos requer padrões sólidos.

## 1. Pilares Arquiteturais
- Idempotência estrita em todas as chamadas de ferramentas.
- Checkpoints de persistência com recuperação automática.
- Isolamento de contexto por sessão de chat.
- Roteamento inteligente de intenções via LLMs.
  `,
  coverImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
  blogOptions: {
    enabled: true,
    targetPlatform: "v5autoblog",
    targetEndpoint: "https://v5autoblog.com/api/v1/posts",
    category: "Inteligência Artificial",
    tags: ["Agentes Autônomos", "Inteligência Artificial", "TypeScript", "Next.js", "Engenharia de Prompt"],
    author: "Apollo La Plata",
    generateSchema: true
  },
  emailOptions: {
    enabled: true,
    subject: "Agentes Autônomos em Produção",
    previewText: "Descubra o passo a passo completo para implementar pipelines cognitivos.",
    fromName: "Apollo La Plata",
    provider: "resend",
    audienceList: "Tech VIP",
    utmCampaign: "instagram_launch"
  },
  socialTeaserOptions: {
    enabled: true,
    platforms: ["instagram"]
  },
  dispatchStatus: {
    overall: "idle",
    email: { status: "idle" },
    blog: { status: "idle" },
    social: { status: "idle" }
  }
};

// 1. Teste da Fórmula Triad de Hashtags (Nicho + Indústria + Marca)
console.log("[1/6] Testando Cluster Estratégico de Hashtags (Fórmula Triad)...");
const cluster = buildInstagramHashtagCluster(samplePayload.blogOptions.tags, samplePayload.blogOptions.category);
assert(cluster.brandTags.includes("#V5Apollo"), "Tags de marca contêm #V5Apollo");
assert(cluster.brandTags.includes("#Capitania13"), "Tags de marca contêm #Capitania13");
assert(cluster.industryTags.includes("#InteligenciaArtificial"), "Tags de indústria contêm categoria em CamelCase");
assert(cluster.nicheTags.some(t => t.includes("AgentesAutonomos")), "Tags de nicho contêm #AgentesAutonomos");
assert(cluster.count <= 15, `Contagem total de hashtags é segura para o algoritmo: ${cluster.count}/15`);
assert(!cluster.formattedString.includes("&"), "Sem caracteres especiais ou símbolos no cluster");
console.log("  -> Cluster de hashtags estratégico validado com sucesso.\n");

// 2. Teste dos 3 Formatos Editoriais do Instagram
console.log("[2/6] Testando os 3 Formatos Editoriais (Carrossel, Reels, Estudo de Caso)...");
assert(INSTAGRAM_FORMAT_TEMPLATES.length === 3, "Exatamente 3 formatos editoriais configurados");

const formats: InstagramPostFormat[] = ["carousel", "reels", "case_study"];
for (const fmt of formats) {
  const res = generateInstagramCaptionFormatted(samplePayload, fmt, "LINK");
  assert(res.format === fmt, `Formato ${fmt} identificado`);
  assert(res.charCount <= 2200, `Formato ${fmt}: ${res.charCount}/2.200 caracteres (<= 2200)`);
  assert(res.isWithinLimit === true, `isWithinLimit é true para ${fmt}`);
  assert(res.firstLineHook.length > 10, `Primeira linha de impacto gerada para ${fmt}`);
}
console.log("  -> Formatos editoriais validados dentro do limite de 2.200 caracteres.\n");

// 3. Teste de Gatilhos do Comment-to-DM (ChatbotX Inspired)
console.log("[3/6] Testando Integração com Gatilhos Comment-to-DM...");
for (const kw of ["LINK", "QUERO", "GUIA", "POSTER"]) {
  const resKw = generateInstagramCaptionFormatted(samplePayload, "carousel", kw);
  assert(resKw.commentKeyword === kw, `Palavra-chave '${kw}' registrada`);
  assert(resKw.captionText.includes(`Comente "${kw}"`), `Texto inclui chamada explícita para comentar "${kw}"`);
}
console.log("  -> Gatilhos Comment-to-DM validados com sucesso.\n");

// 4. Teste de Espaçamento Anti-Collapse com Pontos Separadores
console.log("[4/6] Testando Espaçamento Anti-Collapse de Parágrafos...");
const carouselRes = generateInstagramCaptionFormatted(samplePayload, "carousel", "LINK");
const lines = carouselRes.captionText.split("\n");
const dotSeparators = lines.filter(l => l.trim() === ".");
assert(dotSeparators.length >= 3, `Possui ${dotSeparators.length} separadores de ponto limpo para evitar colapso no feed`);
assert(carouselRes.captionText.includes("📌 O QUE VOCÊ VAI DESCOBRIR"), "Seção de pontos de valor estruturada");
assert(carouselRes.captionText.includes("✓ Idempotência estrita"), "Bullet points de lista capturados e formatados com ✓");
console.log("  -> Espaçamento anti-collapse validado com sucesso.\n");

// 5. Teste de Resiliência e Truncamento com Texto Gigante
console.log("[5/6] Testando Resiliência a Resumo e Conteúdo Gigantes (> 2.500 caracteres)...");
const hugeMarkdown = `
# Título Gigante
${"Parágrafo extenso com muitas explicações técnicas de microserviços. ".repeat(60)}
- Item 1 de lista importante
- Item 2 de lista importante
- Item 3 de lista importante
`;

const giantPayload: MultimodalDispatchPayload = {
  ...samplePayload,
  summary: "Resumo gigante para testar limites de caracteres. ".repeat(40),
  contentMarkdown: hugeMarkdown
};

const giantRes = generateInstagramCaptionFormatted(giantPayload, "carousel", "LINK");
assert(giantRes.charCount <= 2200, `Legenda gigante ajustada com sucesso: ${giantRes.charCount}/2.200 caracteres`);
assert(giantRes.isWithinLimit === true, "isWithinLimit permanece true em condições de stress");
assert(giantRes.captionText.includes('Comente "LINK"'), "Gatilho Comment-to-DM mantido intacto mesmo com truncamento");
assert(giantRes.captionText.includes("#V5Apollo"), "Hashtags preservadas intactas mesmo com truncamento");
console.log("  -> Resiliência e salvaguarda de truncamento homologadas com sucesso.\n");

// 6. Teste de Sweet Spot de Engajamento
console.log("[6/6] Validando Sweet Spot de Caracteres da Legenda...");
assert(carouselRes.charCount >= 500 && carouselRes.charCount <= 1400, `Tamanho da legenda no Sweet Spot: ${carouselRes.charCount} caracteres (500 a 1400c)`);
assert(COMMENT_KEYWORDS.length >= 5, "Mínimo de 5 palavras-chave rotativas de comentário disponíveis");
console.log("  -> Sweet Spot de engajamento validado com sucesso.\n");

console.log("================================================================================");
console.log(` RESULTADO FINAL: ${passedTests}/${totalTests} TESTES APROVADOS COM SUCESSO!`);
console.log(" ETAPA 054 CONCLUÍDA E HOMOLOGADA COM PRECISÃO CIRÚRGICA.");
console.log("================================================================================");
