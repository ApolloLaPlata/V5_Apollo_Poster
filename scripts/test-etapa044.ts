/**
 * test-etapa044.ts - Suíte de Validação da Etapa 044
 * Conector do Endpoint REST do V5 AutoBlog com autenticação por chave de capitania
 */

import { 
  buildAutoBlogHeaders, 
  validateAutoBlogPayload, 
  testAutoBlogHandshake, 
  publishToAutoBlog, 
  DEFAULT_CAPITANIA_KEY, 
  CAPITANIA_SOURCE, 
  CAPITANIA_PORT, 
  CAPITANIA_SIGNER 
} from "../src/lib/dispatch/autoblogConnector";
import { compileBlogPayload } from "../src/lib/dispatch/multimodalEngine";
import { MultimodalDispatchPayload, V5AutoBlogPayload } from "../src/types/poster";

async function runTests() {
  console.log("=== INICIANDO TESTES DA ETAPA 044: CONECTOR REST V5 AUTOBLOG ===");
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

  // 1. Testes de Cabeçalhos HTTP de Capitania
  console.log("\n1. Validando Headers Oficiais de Capitania (#13)");
  const headers = buildAutoBlogHeaders("custom_cap_token_999");
  assert(headers["Authorization"] === "Bearer custom_cap_token_999", "Authorization Bearer token customizado");
  assert(headers["X-Capitania-Source"] === CAPITANIA_SOURCE, `X-Capitania-Source é "${CAPITANIA_SOURCE}"`);
  assert(headers["X-Capitania-Port"] === String(CAPITANIA_PORT), `X-Capitania-Port é "${CAPITANIA_PORT}"`);
  assert(headers["X-Capitania-Signer"] === CAPITANIA_SIGNER, `X-Capitania-Signer contém "Apollo La Plata"`);
  assert(headers["Content-Type"] === "application/json", "Content-Type é application/json");
  assert(Boolean(headers["X-Capitania-Timestamp"]), "X-Capitania-Timestamp está presente");

  // Headers default
  const defaultHeaders = buildAutoBlogHeaders();
  assert(defaultHeaders["Authorization"] === `Bearer ${DEFAULT_CAPITANIA_KEY}`, "Chave padrão utilizada quando omitida");

  // 2. Validação de Payload
  console.log("\n2. Validando Validador de Payload (validateAutoBlogPayload)");
  const dummyPayload: MultimodalDispatchPayload = {
    id: "test-044",
    title: "Artigo de Teste da Capitania 13 AutoBlog",
    slug: "artigo-teste-capitania-13-autoblog",
    summary: "Resumo explicativo para teste de integração REST.",
    contentMarkdown: "Este é o corpo do artigo de teste com mais de vinte caracteres para validação.",
    emailOptions: {
      enabled: true,
      subject: "Assunto",
      previewText: "Preview",
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
      tags: ["Teste", "Capitania13"],
      author: "Redação Apollo",
      generateSchema: true,
      capitaniaKey: "cap_test_123"
    },
    socialTeaserOptions: {
      enabled: false,
      platforms: []
    },
    dispatchStatus: {
      overall: "idle",
      email: { status: "idle" },
      blog: { status: "idle" },
      social: { status: "idle" }
    }
  };

  const validCompiled = compileBlogPayload(dummyPayload);
  const validCheck = validateAutoBlogPayload(validCompiled);
  assert(validCheck.isValid === true, "Payload compilado válido passa com isValid === true");
  assert(validCheck.errors.length === 0, "Nenhum erro retornado no payload válido");

  // Payload inválido (sem título e sem html)
  const invalidPayload: V5AutoBlogPayload = {
    ...validCompiled,
    title: "Oi",
    content_html: ""
  };
  const invalidCheck = validateAutoBlogPayload(invalidPayload);
  assert(invalidCheck.isValid === false, "Payload inválido falha com isValid === false");
  assert(invalidCheck.errors.length >= 2, "Erros identificados para título curto e HTML vazio");

  // 3. Teste de Handshake Ping
  console.log("\n3. Validando Handshake Resiliente (testAutoBlogHandshake)");
  const handshake = await testAutoBlogHandshake({
    endpoint: "https://v5autoblog.com/api/v1/posts",
    capitaniaKey: "cap_test_handshake",
    allowMockFallback: true
  });
  assert(handshake.success === true, "Handshake retorna success === true em modo resiliente");
  assert(handshake.statusCode === 200, "Handshake retorna statusCode 200");
  assert(handshake.latencyMs >= 0, "Latência medida em milissegundos");
  assert(handshake.isMock === true, "isMock === true em ambiente local de teste");
  assert(handshake.serverCapitania?.includes("autoblog") === true, "serverCapitania identificado");

  // 4. Teste de Publicação REST (publishToAutoBlog)
  console.log("\n4. Validando Publicação no AutoBlog (publishToAutoBlog)");
  const dispatchResult = await publishToAutoBlog(validCompiled, {
    endpoint: "https://v5autoblog.com/api/v1/posts",
    capitaniaKey: "cap_test_publish",
    allowMockFallback: true
  });
  assert(dispatchResult.success === true, "Despacho do artigo retorna success === true");
  assert(dispatchResult.statusCode === 201, "Despacho retorna status 201 Created");
  assert(dispatchResult.postSlug === validCompiled.slug, "postSlug coincide com o slug canônico");
  assert(dispatchResult.publishedUrl.includes(validCompiled.slug), "publishedUrl aponta para a URL canônica correta");
  assert(dispatchResult.postId.length > 5, "postId gerado com identificador único");
  assert(dispatchResult.payloadSummary.wordCount > 0, "payloadSummary reporta wordCount correto");
  assert(dispatchResult.payloadSummary.category === "Inteligência Artificial", "payloadSummary reporta categoria correta");
  assert(dispatchResult.payloadSummary.hasSchema === true, "payloadSummary reporta presença de Schema.org");

  // 5. Teste de Rejeição de Payload Inválido no Despacho
  console.log("\n5. Validando Rejeição de Payload Inválido no Despacho");
  const failedDispatch = await publishToAutoBlog(invalidPayload);
  assert(failedDispatch.success === false, "Despacho de payload inválido é bloqueado com success === false");
  assert(failedDispatch.statusCode === 422, "Status HTTP 422 Unprocessable Entity retornado");
  assert(Boolean(failedDispatch.error), "Mensagem de erro detalhada retornada");

  console.log(`\n=== RESULTADO FINAL: ${passed}/${total} ASSERÇÕES APROVADAS ===`);
  if (passed === total) {
    console.log("🚀 ETAPA 044 100% HOMOLOGADA COM SUCESSO!\n");
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
