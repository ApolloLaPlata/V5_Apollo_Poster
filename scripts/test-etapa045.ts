/**
 * test-etapa045.ts - Suíte de Validação da Etapa 045
 * Conector do Endpoint REST do WordPress (/wp-json/wp/v2/posts) com Basic Auth / Application Passwords
 */

import { 
  encodeBase64, 
  sanitizeApplicationPassword, 
  buildWordPressBasicAuth, 
  buildWordPressHeaders, 
  compileWordPressPostPayload, 
  validateWordPressPayload, 
  testWordPressHandshake, 
  publishToWordPress, 
  DEFAULT_WP_SITE_URL, 
  DEFAULT_WP_CONFIG, 
  CAPITANIA_SOURCE, 
  CAPITANIA_PORT, 
  CAPITANIA_SIGNER,
  WordPressPostPayload
} from "../src/lib/dispatch/wordpressConnector";
import { compileBlogPayload } from "../src/lib/dispatch/multimodalEngine";
import { MultimodalDispatchPayload } from "../src/types/poster";

async function runTests() {
  console.log("=== INICIANDO TESTES DA ETAPA 045: CONECTOR REST WORDPRESS ===");
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

  // 1. Utilitários de Base64 e Senhas de Aplicativo
  console.log("\n1. Validando Codificação e Application Passwords");
  const encoded = encodeBase64("apollo:secret123");
  assert(Boolean(encoded) && encoded.length > 5, "encodeBase64 gera string codificada válida");

  const sanitizedPwd = sanitizeApplicationPassword("abcd efgh ijkl mnop");
  assert(sanitizedPwd === "abcdefghijklmnop", "sanitizeApplicationPassword remove espaços em branco da senha");

  const basicAuthHeader = buildWordPressBasicAuth("apollo_admin", "v5ap 3011 post live pass");
  assert(basicAuthHeader.startsWith("Basic "), "buildWordPressBasicAuth gera prefixo 'Basic '");

  const decodedCredentials = Buffer.from(basicAuthHeader.replace("Basic ", ""), "base64").toString("utf-8");
  assert(decodedCredentials === "apollo_admin:v5ap3011postlivepass", "Credenciais decodificadas correspondem a username:password sem espaços");

  // 2. Headers HTTP Oficiais do WordPress REST
  console.log("\n2. Validando Cabeçalhos HTTP Oficiais WordPress REST");
  const headers = buildWordPressHeaders("apollo_admin", "v5ap 3011 post live pass");
  assert(headers["Authorization"] === basicAuthHeader, "Header Authorization com Basic Auth");
  assert(headers["Content-Type"] === "application/json", "Header Content-Type é application/json");
  assert(headers["Accept"] === "application/json", "Header Accept é application/json");
  assert(headers["X-Capitania-Source"] === CAPITANIA_SOURCE, `Header X-Capitania-Source é "${CAPITANIA_SOURCE}"`);
  assert(headers["X-Capitania-Port"] === String(CAPITANIA_PORT), `Header X-Capitania-Port é "${CAPITANIA_PORT}"`);
  assert(headers["X-Capitania-Signer"] === CAPITANIA_SIGNER, `Header X-Capitania-Signer contém "Apollo La Plata"`);
  assert(headers["User-Agent"].includes("WordPress-Connector"), "Header User-Agent identifica WordPress-Connector");

  // 3. Compilação de Payloads para o WordPress
  console.log("\n3. Validando Compilador de Payload WordPress (compileWordPressPostPayload)");
  const dummyPayload: MultimodalDispatchPayload = {
    id: "test-wp-045",
    title: "Revolução dos Agentes Autônomos no WordPress",
    slug: "revolucao-agentes-autonomos-wordpress",
    summary: "Guia completo sobre a publicação headless automatizada via REST API.",
    contentMarkdown: "# Título Artigo\n\nEste é o corpo do texto do artigo para publicação no WordPress REST API com parágrafos bem definidos.\n\n> Citação importante sobre automação.",
    emailOptions: {
      enabled: true,
      subject: "Assunto WP",
      previewText: "Preview WP",
      fromName: "Apollo",
      provider: "resend",
      audienceList: "Geral",
      utmCampaign: "test_wp"
    },
    blogOptions: {
      enabled: true,
      targetPlatform: "wordpress",
      targetEndpoint: "https://v5autoblog.com/api/v1/posts",
      category: "Inteligência Artificial",
      tags: ["WordPress", "Agentes", "REST API"],
      author: "Redação Apollo",
      generateSchema: true,
      wordpressConfig: {
        siteUrl: DEFAULT_WP_SITE_URL,
        username: "apollo_admin",
        applicationPassword: "v5ap 3011 post live pass",
        status: "publish"
      }
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

  const wpCompiled = compileWordPressPostPayload(dummyPayload);
  assert(wpCompiled.title === dummyPayload.title, "Título compilado para o WordPress");
  assert(wpCompiled.slug === dummyPayload.slug, "Slug preservado para URL amigável");
  assert(wpCompiled.content.includes("<h1>") && wpCompiled.content.includes("<p>"), "Conteúdo convertido para HTML semântico");
  assert(wpCompiled.status === "publish", "Status padrão 'publish'");
  assert(wpCompiled.comment_status === "open", "comment_status padrão 'open'");
  assert(wpCompiled.meta?.["_v5_capitania_source"] === "13-poster", "Meta tag '_v5_capitania_source' presente");
  assert(Boolean(wpCompiled.meta?.["_yoast_wpseo_title"]), "Meta tag Yoast SEO title presente");
  assert(Boolean(wpCompiled.meta?.["rank_math_title"]), "Meta tag RankMath SEO title presente");

  // Compilação a partir de V5AutoBlogPayload
  const autoBlogPayload = compileBlogPayload(dummyPayload);
  const wpFromAutoBlog = compileWordPressPostPayload(autoBlogPayload);
  assert(wpFromAutoBlog.title === autoBlogPayload.title, "Compilação a partir de V5AutoBlogPayload funciona perfeitamente");
  assert(wpFromAutoBlog.meta?.["_v5_reading_time_minutes"] === autoBlogPayload.reading_time_minutes, "Preserva reading_time nos metadados");

  // 4. Validador de Payload do WordPress
  console.log("\n4. Validando Validação de Payload (validateWordPressPayload)");
  const validCheck = validateWordPressPayload(wpCompiled);
  assert(validCheck.isValid === true, "Payload WordPress válido passa na validação");
  assert(validCheck.errors.length === 0, "Sem erros no payload válido");

  const invalidWp: WordPressPostPayload = {
    title: "",
    content: "",
    status: "publish"
  };
  const invalidCheck = validateWordPressPayload(invalidWp);
  assert(invalidCheck.isValid === false, "Payload WordPress vazio falha na validação");
  assert(invalidCheck.errors.length >= 2, "Erros retornados para título e conteúdo vazios");

  // 5. Teste de Handshake WordPress REST
  console.log("\n5. Validando Handshake Resiliente (testWordPressHandshake)");
  const handshake = await testWordPressHandshake({
    siteUrl: DEFAULT_WP_SITE_URL,
    username: "apollo_admin",
    applicationPassword: "v5ap 3011 post live pass",
    allowMockFallback: true
  });
  assert(handshake.success === true, "Handshake WordPress retorna success === true");
  assert(handshake.statusCode === 200, "Handshake retorna status 200 OK");
  assert(handshake.latencyMs >= 0, "Latência medida em milissegundos");
  assert(handshake.isMock === true, "isMock === true em ambiente local");
  assert(Boolean(handshake.authenticatedUser?.name), "authenticatedUser identificado no handshake");

  // 6. Teste de Publicação WordPress REST
  console.log("\n6. Validando Publicação no WordPress REST API (publishToWordPress)");
  const dispatchResult = await publishToWordPress(wpCompiled, {
    siteUrl: DEFAULT_WP_SITE_URL,
    username: "apollo_admin",
    applicationPassword: "v5ap 3011 post live pass",
    allowMockFallback: true
  });
  assert(dispatchResult.success === true, "Publicação no WordPress retorna success === true");
  assert(dispatchResult.statusCode === 201, "Status HTTP 201 Created retornado");
  assert(Boolean(dispatchResult.postId), "Post ID numérico retornado pelo WordPress");
  assert(dispatchResult.publishedUrl.includes(wpCompiled.slug || ""), "publishedUrl contém o slug do post");
  assert(dispatchResult.payloadSummary.wordCount > 0, "payloadSummary reporta contagem de palavras");
  assert(dispatchResult.payloadSummary.hasExcerpt === true, "payloadSummary reporta presença de excerpt");
  assert(dispatchResult.payloadSummary.metaCount >= 3, "payloadSummary reporta meta tags gravadas");

  // 7. Teste de Rejeição de Payload Inválido
  console.log("\n7. Validando Rejeição de Payload Inválido");
  const failedWpDispatch = await publishToWordPress(invalidWp);
  assert(failedWpDispatch.success === false, "Publicação de post inválido rejeitada com success === false");
  assert(failedWpDispatch.statusCode === 422, "Status HTTP 422 Unprocessable Entity retornado");

  console.log(`\n=== RESULTADO FINAL: ${passed}/${total} ASSERÇÕES APROVADAS ===`);
  if (passed === total) {
    console.log("🚀 ETAPA 045 100% HOMOLOGADA COM SUCESSO!\n");
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
