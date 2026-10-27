/**
 * test-etapa046.ts - Suíte de Validação da Etapa 046
 * Extrator de Excerpt Automático otimizado para meta description do Google (150-160 caracteres)
 */

import { 
  cleanMarkdownForExcerpt, 
  evaluateExcerptQuality, 
  truncateToWordBoundary, 
  rebalanceExcerptToSerpLimit, 
  generateGoogleMetaExcerpt 
} from "../src/lib/seo/excerptExtractor";
import { extractOptimizedExcerpt, compileBlogPayload } from "../src/lib/dispatch/multimodalEngine";
import { MultimodalDispatchPayload } from "../src/types/poster";

async function runTests() {
  console.log("=== INICIANDO TESTES DA ETAPA 046: EXTRATOR DE EXCERPT GOOGLE SERP (150-160c) ===");
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, desc: string) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${desc}`);
    }
  }

  // 1. Limpeza de Markdown
  console.log("\n1. Validando Limpeza Profunda de Markdown (cleanMarkdownForExcerpt)");
  const rawMarkdown = `
# Título Principal do Artigo

Olá! Se você acompanha tecnologia, provavelmente já percebeu a evolução.
Aqui está um link para o [Portal V5 AutoBlog](https://v5autoblog.com) com informações vitais.

![Imagem de capa](https://images.unsplash.com/photo-123)

| Coluna A | Coluna B |
| :--- | :--- |
| Dado 1 | Dado 2 |

\`\`\`typescript
const code = "deve ser ignorado";
\`\`\`

> "Uma citação importante que traz autoridade."

A inteligência artificial agora opera em **ecossistemas autônomos** com coordenação em tempo real sem atrito.
`;

  const cleaned = cleanMarkdownForExcerpt(rawMarkdown);
  assert(!cleaned.includes("#"), "Títulos Markdown removidos");
  assert(!cleaned.includes("```"), "Blocos de código removidos");
  assert(!cleaned.includes("![Imagem"), "Imagens Markdown removidas");
  assert(!cleaned.includes("https://v5autoblog.com"), "URLs de links removidas");
  assert(cleaned.includes("Portal V5 AutoBlog"), "Texto âncora preservado");
  assert(!cleaned.includes("| Coluna A |"), "Tabelas Markdown removidas");
  assert(!cleaned.includes("const code"), "Código interno removido");
  assert(!cleaned.includes("Olá!"), "Saudação genérica inicial removida");
  assert(cleaned.includes("ecossistemas autônomos"), "Texto substantivo e formatação inline limpos");

  // 2. Truncamento sem Quebra de Palavras
  console.log("\n2. Validando Truncamento Seguro por Limite de Palavra (truncateToWordBoundary)");
  const sampleLongText = "Este é um texto intencionalmente longo para testar a capacidade cirúrgica do algoritmo de truncar no limite exato de caracteres sem cortar nenhuma palavra no meio da frase.";
  const truncated = truncateToWordBoundary(sampleLongText, 100, true);
  assert(truncated.length <= 100, `Truncamento respeita o limite máximo de 100 caracteres (${truncated.length}c)`);
  assert(truncated.endsWith("..."), "Termina com reticências");
  assert(!truncated.endsWith(" ..."), "Sem espaço antes das reticências");
  // Garante que a última palavra antes do '...' é uma palavra completa do texto original
  const wordBeforeEllipsis = truncated.replace("...", "").split(" ").pop();
  assert(sampleLongText.includes(wordBeforeEllipsis || ""), `A última palavra '${wordBeforeEllipsis}' é completa`);

  // 3. Rebalanceamento de Comprimento para 150-160 Caracteres
  console.log("\n3. Validando Rebalanceamento de Comprimento (rebalanceExcerptToSerpLimit)");
  
  // Caso A: Texto já ideal (155 caracteres)
  const idealText = "Descubra como os ecossistemas de agentes autônomos operam pipelines de produção sem fricção com memória contínua e transmissão direta multicanal para web.";
  const rebalancedA = rebalanceExcerptToSerpLimit(idealText, 150, 160);
  assert(rebalancedA.length >= 150 && rebalancedA.length <= 160, `Texto ideal preservado na faixa 150-160c (${rebalancedA.length}c)`);

  // Caso B: Texto curto que precisa de gancho acionável
  const shortText = "Os agentes de inteligência artificial agora colaboram em pipelines sem atrito";
  const rebalancedB = rebalanceExcerptToSerpLimit(shortText, 150, 160, "Confira a análise completa e as diretrizes práticas.");
  assert(rebalancedB.length >= 140 && rebalancedB.length <= 160, `Texto curto rebalanceado para o Sweet Spot (${rebalancedB.length}c)`);

  // Caso C: Texto excessivamente longo (> 200 caracteres)
  const overlyLong = "A evolução dos sistemas computacionais na era moderna nos trouxe para uma arquitetura descentralizada onde microrrobôs e agentes especializados trabalham cooperativamente sem que operadores humanos precisem executar tarefas repetitivas do cotidiano profissional.";
  const rebalancedC = rebalanceExcerptToSerpLimit(overlyLong, 150, 160);
  assert(rebalancedC.length <= 160, `Texto longo truncado abaixo de 160c (${rebalancedC.length}c)`);
  assert(rebalancedC.length >= 145, `Texto longo aproveita ao máximo o espaço (${rebalancedC.length}c)`);

  // 4. Avaliação de Qualidade SERP (evaluateExcerptQuality)
  console.log("\n4. Validando Avaliação de Qualidade SERP (evaluateExcerptQuality)");
  const optimalExcerpt = "Descubra como os ecossistemas autônomos operam pipelines de produção sem fricção com memória contínua e transmissão direta para blogs e newsletters.";
  const qualityOpt = evaluateExcerptQuality(optimalExcerpt, ["ecossistemas", "autônomos"]);
  assert(qualityOpt.status === "optimal", "Status identificado como 'optimal'");
  assert(qualityOpt.score >= 95, `Pontuação de qualidade alta: ${qualityOpt.score}/100`);
  assert(qualityOpt.containsActionHook === true, "Verbo de ação ('Descubra') detectado");
  assert(qualityOpt.detectedKeywords.length === 2, "Palavras-chave detectadas corretamente");
  assert(qualityOpt.pixelWidthEstimated < 960, `Largura em pixels dentro do limite (${qualityOpt.pixelWidthEstimated}px < 960px)`);

  const tooShortQuality = evaluateExcerptQuality("Texto curto");
  assert(tooShortQuality.status === "too_short", "Identifica texto excessivamente curto");
  assert(tooShortQuality.score < 60, "Pontuação reduzida para texto curto");

  const tooLongQuality = evaluateExcerptQuality("A".repeat(170));
  assert(tooLongQuality.status === "too_long", "Identifica texto excessivamente longo (> 160c)");

  // 5. Função Mestre: generateGoogleMetaExcerpt
  console.log("\n5. Validando Função Mestre (generateGoogleMetaExcerpt)");
  const fullArticleMarkdown = `
# A Revolução Silenciosa dos Agentes Autônomos em 2026

Olá! Se você acompanha tecnologia, provavelmente já percebeu que o jogo mudou.
Não estamos mais falando apenas de chats de conversação. Estamos falando de ecossistemas inteiros de agentes cooperando em segundo plano.

### Os 3 Pilares do Novo Fluxo de Trabalho:
1. **Memória Contínua (RAG Local):** Nunca mais recomeçar do zero.
2. **Despacho Multimodal Nativo:** Escrever uma vez e transmitir simultaneamente para Blog, Email e Redes.
3. **Micro-serviços Desacoplados:** Cada robô com seu propósito único e bem definido.

Quando você une um motor de escrita inteligente a uma esteira de despacho automatizada, você ganha velocidade de mídia de grandes portais com uma equipe enxuta.
`;

  const generated = generateGoogleMetaExcerpt(fullArticleMarkdown, {
    focusKeywords: ["agentes autônomos", "despacho"],
    minChars: 150,
    maxChars: 160
  });

  assert(generated.characterCount >= 145 && generated.characterCount <= 160, `Comprimento final gerado no Sweet Spot (${generated.characterCount}c)`);
  assert(generated.quality.score >= 80, `Score de qualidade alto (${generated.quality.score}/100)`);
  assert(!generated.excerpt.includes("#"), "Sem títulos markdown no excerpt final");
  assert(!generated.excerpt.includes("Olá!"), "Sem saudações no excerpt final");

  // 6. Integração com multimodalEngine.ts
  console.log("\n6. Validando Integração no Motor Multimodal (extractOptimizedExcerpt & compileBlogPayload)");
  const excerptFromEngine = extractOptimizedExcerpt(fullArticleMarkdown, undefined, 158);
  assert(excerptFromEngine.length >= 145 && excerptFromEngine.length <= 160, `extractOptimizedExcerpt produz resultado no Sweet Spot (${excerptFromEngine.length}c)`);

  const dummyPayload: MultimodalDispatchPayload = {
    id: "test-046",
    title: "A Revolução dos Agentes Autônomos",
    slug: "revolucao-agentes-autonomos",
    summary: "", // Força a extração automática
    contentMarkdown: fullArticleMarkdown,
    emailOptions: {
      enabled: true,
      subject: "Assunto",
      previewText: "",
      fromName: "Apollo",
      provider: "resend",
      audienceList: "Geral",
      utmCampaign: "test"
    },
    blogOptions: {
      enabled: true,
      targetPlatform: "v5autoblog",
      targetEndpoint: "https://v5autoblog.com/api/v1/posts",
      category: "Inteligência Artificial",
      tags: ["Agentes IA", "Automação"],
      author: "Apollo La Plata",
      generateSchema: true
    },
    socialTeaserOptions: { enabled: false, platforms: [] },
    dispatchStatus: {
      overall: "idle",
      email: { status: "idle" },
      blog: { status: "idle" },
      social: { status: "idle" }
    }
  };

  const compiled = compileBlogPayload(dummyPayload);
  assert(compiled.excerpt.length >= 145 && compiled.excerpt.length <= 160, `compileBlogPayload gera excerpt na faixa 150-160c (${compiled.excerpt.length}c)`);
  assert(compiled.seo.meta_description === compiled.excerpt, "meta_description coincide exatamente com o excerpt otimizado");
  assert(compiled.seo.schema_org.description === compiled.excerpt, "Schema.org description usa o excerpt otimizado");
  assert(compiled.seo.open_graph.og_description === compiled.excerpt, "Open Graph og:description usa o excerpt otimizado");

  console.log(`\n=== RESULTADO FINAL: ${passed}/${total} ASSERÇÕES APROVADAS ===`);
  if (passed === total) {
    console.log("🚀 ETAPA 046 100% HOMOLOGADA COM SUCESSO!\n");
    process.exit(0);
  } else {
    console.error("❌ ALGUNS TESTES FALHARAM.\n");
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Erro fatal nos testes:", err);
  process.exit(1);
});
