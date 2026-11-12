/**
 * test-etapa109.ts - Homologação da Etapa 109: Autopilot 30D, Bancada de Webhooks & Segregação Total
 * Capitania #13: V5 Apollo Poster (:3011)
 */

import { build30DayAutopilotPosts, AUTOPILOT_30D_BLUEPRINT } from "../src/lib/social/autopilot30dEngine";
import { isPrimeTimeSlot } from "../src/components/poster/MasterCalendar";
import { detectStoreFromUrl, SUPPORTED_STORES } from "../src/lib/finders/storeConnector";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`❌ [FAIL] ${message}`);
  }
}

async function runTestSuite() {
  console.log("================================================================================");
  console.log("   TESTE DE HOMOLOGAÇÃO ETAPA 109 - CAPITANIA #13: V5 APOLLO POSTER (:3011)     ");
  console.log("================================================================================\n");

  // BLOCO 1: Motor Autopilot 30 Dias (autopilot30dEngine.ts)
  console.log("--- BLOCO 1: Motor Editorial Autopilot 30 Dias ---");

  assert(AUTOPILOT_30D_BLUEPRINT.length === 30, "Blueprint possui exatamente 30 dias cadastrados");

  const startDate = new Date(2026, 9, 27); // 27 de Outubro de 2026
  const posts = build30DayAutopilotPosts(startDate);
  assert(posts.length === 30, "Geração de 30 publicações executada com sucesso");

  // Validação de distribuição temporal sequencial
  let hasSequentialDays = true;
  for (let i = 0; i < posts.length; i++) {
    const postDate = new Date(posts[i].scheduledAt);
    const expectedDay = new Date(startDate);
    expectedDay.setDate(startDate.getDate() + i);
    if (postDate.getDate() !== expectedDay.getDate()) {
      hasSequentialDays = false;
      break;
    }
  }
  assert(hasSequentialDays, "Sequência diária de 30 dias contínuos validada");

  // Validação de Diversidade de Pilares
  const pillarsCount = {
    "Autoridade": 0,
    "Viral 9:16": 0,
    "Ofertas VIP": 0,
    "Newsletter/SEO": 0,
    "Thread X": 0
  };
  AUTOPILOT_30D_BLUEPRINT.forEach((bp) => {
    if (pillarsCount[bp.pillar] !== undefined) {
      pillarsCount[bp.pillar]++;
    }
  });

  assert(pillarsCount["Autoridade"] >= 6, "Pilar 'Autoridade' (Carrosséis & LinkedIn) possui >= 6 posts");
  assert(pillarsCount["Viral 9:16"] >= 6, "Pilar 'Viral 9:16' (TikTok & Reels 3 Atos) possui >= 6 posts");
  assert(pillarsCount["Ofertas VIP"] >= 6, "Pilar 'Ofertas VIP' (WhatsApp & Telegram) possui >= 6 posts");
  assert(pillarsCount["Newsletter/SEO"] >= 4, "Pilar 'Newsletter/SEO' (Beehiiv & AutoBlog) possui >= 4 posts");
  assert(pillarsCount["Thread X"] >= 3, "Pilar 'Thread X' (Twitter/X & Threads) possui >= 3 posts");

  // Validação de Horários Nobres (Prime-Time Heuristic)
  let primeTimeSlotsCount = 0;
  posts.forEach((p) => {
    if (isPrimeTimeSlot(p.scheduledAt)) {
      primeTimeSlotsCount++;
    }
  });
  assert(primeTimeSlotsCount >= 20, "Maioria dos posts (>= 20) alocada em horários nobres de audiência");

  // BLOCO 2: Segregação Absoluta e Conectores de Lojas
  console.log("\n--- BLOCO 2: Segregação Absoluta e Conector V5 Deals Hub ---");

  assert("V5 Deals Hub" in SUPPORTED_STORES, "Loja 'V5 Deals Hub' cadastrada em SUPPORTED_STORES");
  assert(!("PixDrop Store" in SUPPORTED_STORES), "Zero referências a 'PixDrop Store' no conector de lojas");

  const detectedShopee = detectStoreFromUrl("https://shopee.com.br/product/123/456");
  assert(detectedShopee === "Shopee", "URL da Shopee detectada corretamente");

  const detectedDealsHub = detectStoreFromUrl("https://deals.v5apollo.com/produto/teclado-rgb");
  assert(detectedDealsHub === "V5 Deals Hub", "URL do Deals Hub detectada corretamente");

  // BLOCO 3: Endpoints de API em Nuvem (:3011)
  console.log("\n--- BLOCO 3: Endpoints de API em Nuvem (:3011) ---");

  // 1. GET /api/health
  try {
    const healthRes = await fetch("http://localhost:3011/api/health");
    assert(healthRes.status === 200, "Endpoint /api/health retornou HTTP 200 OK");
    const healthData = await healthRes.json();
    assert(healthData.status === "ok", "Payload de /api/health possui status 'ok'");
    assert(healthData.colab_fleet_connected === true, "Frota Colab T4 conectada confirmada em /api/health");
  } catch (err: any) {
    assert(false, `Falha ao testar /api/health: ${err.message}`);
  }

  // 2. GET /api/comments/webhook (Handshake Meta)
  try {
    const challengeToken = `TEST_HUB_CHALLENGE_${Date.now()}`;
    const handshakeUrl = `http://localhost:3011/api/comments/webhook?hub.mode=subscribe&hub.verify_token=v5_meta_webhook_verify_token_apollo_2026&hub.challenge=${challengeToken}`;
    const handshakeRes = await fetch(handshakeUrl);
    assert(handshakeRes.status === 200, "GET /api/comments/webhook retornou HTTP 200 OK");
    const receivedChallenge = await handshakeRes.text();
    assert(receivedChallenge === challengeToken, "Challenge retornado confere com o enviado");
  } catch (err: any) {
    assert(false, `Falha no handshake: ${err.message}`);
  }

  // 3. POST /api/comments/webhook (Comentário com Gatilho)
  try {
    const postRes = await fetch("http://localhost:3011/api/comments/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commentText: "EU QUERO O LINK com o desconto de 50%",
        username: "@teste_growth_2026",
        platform: "instagram"
      })
    });
    assert(postRes.status === 200, "POST /api/comments/webhook retornou HTTP 200 OK");
    const postData = await postRes.json();
    assert(postData.status === "success" && postData.action === "DISPATCHED_DM_AND_PUBLIC_REPLY", "Status e ação do despacho confirmados (DISPATCHED_DM_AND_PUBLIC_REPLY)");
    assert(postData.matchedKeyword === "LINK" || postData.matchedKeyword === "QUERO", "Palavra-chave detectada com precisão");
    assert(postData.privateDm?.trackedUrl.includes("utm_source=ig_comment_dm"), "Link rastreado com UTM oficial gerado");
  } catch (err: any) {
    assert(false, `Falha no POST de comentário: ${err.message}`);
  }

  // Sumário
  console.log("\n================================================================================");
  console.log(`TOTAL DE TESTES EXECUTADOS: ${totalTests}`);
  console.log(`APROVADOS: ${passedTests}`);
  console.log(`FALHAS: ${failedTests}`);
  console.log("================================================================================");

  if (failedTests > 0) {
    console.error("❌ ALGUNS TESTES FALHARAM!");
    process.exit(1);
  } else {
    console.log("🎉 TODOS OS TESTES DA ETAPA 109 PASSARAM COM SUCESSO!\n");
  }
}

runTestSuite().catch((err) => {
  console.error("Erro fatal no test suite:", err);
  process.exit(1);
});
