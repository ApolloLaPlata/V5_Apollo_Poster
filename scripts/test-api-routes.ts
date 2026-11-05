// test-api-routes.ts - Teste E2E das Novas Rotas de API da Capitania #13

async function runApiTests() {
  console.log("🚀 Iniciando Teste E2E das Novas Rotas de API (:3011)...\n");

  const baseUrl = "http://localhost:3011";
  const masterKey = "v5_live_v5_master_key_all_access_holding_apollo_2026_unlimited";

  // Teste 1: /api/cockpit/stats
  console.log("--- TESTE 1: GET /api/cockpit/stats ---");
  const statsRes = await fetch(`${baseUrl}/api/cockpit/stats`);
  const statsJson = (await statsRes.json()) as any;
  console.log(`Status HTTP: ${statsRes.status}`);
  console.log(`Capitania: ${statsJson.name} (Porta ${statsJson.port})`);
  console.log(`Total Canais: ${statsJson.channels.totalActive}`);
  console.log(`Governança Human-in-the-Loop: ${statsJson.governance.humanInTheLoop}`);
  if (statsRes.status === 200 && statsJson.status === "operational") {
    console.log("✅ TESTE 1 PASSOU!\n");
  } else {
    throw new Error("Falha no Teste 1");
  }

  // Teste 2: POST /api/dispatch/webhook (Com chave mestra)
  console.log("--- TESTE 2: POST /api/dispatch/webhook ---");
  const dispatchRes = await fetch(`${baseUrl}/api/dispatch/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${masterKey}`
    },
    body: JSON.stringify({
      title: "5 Agentes de IA que Escalavam sua Operação",
      content: "Descubra como os robôs trabalham 24/7 sem descanso.",
      platforms: ["instagram", "tiktok"],
      priority: "high",
      source: "v5_autoblog"
    })
  });
  const dispatchJson = (await dispatchRes.json()) as any;
  console.log(`Status HTTP: ${dispatchRes.status}`);
  console.log(`JobId Gerado: ${dispatchJson.jobId}`);
  console.log(`Mensagem: ${dispatchJson.message}`);
  if (dispatchRes.status === 202 && dispatchJson.status === "accepted") {
    console.log("✅ TESTE 2 PASSOU!\n");
  } else {
    throw new Error("Falha no Teste 2");
  }

  // Teste 3: POST /api/comments/webhook (Meta Graph API Comment Event)
  console.log("--- TESTE 3: POST /api/comments/webhook ---");
  const commentRes = await fetch(`${baseUrl}/api/comments/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "@marina_growth",
      commentText: "Eu quero esse link agora por favor!",
      platform: "instagram"
    })
  });
  const commentJson = (await commentRes.json()) as any;
  console.log(`Status HTTP: ${commentRes.status}`);
  console.log(`Ação Disparada: ${commentJson.action}`);
  console.log(`Palavra-Chave Detectada: "${commentJson.matchedKeyword}"`);
  console.log(`Resposta Pública Postada: "${commentJson.publicReply?.text}"`);
  console.log(`DM Privada Enviada: "${commentJson.privateDm?.text}"`);
  console.log(`Link com UTM: "${commentJson.privateDm?.trackedUrl}"`);
  if (commentRes.status === 200 && commentJson.status === "success") {
    console.log("✅ TESTE 3 PASSOU!\n");
  } else {
    throw new Error("Falha no Teste 3");
  }

  // Teste 4: GET /api/comments/webhook (Meta Verification Handshake)
  console.log("--- TESTE 4: GET /api/comments/webhook (Handshake Hub) ---");
  const handshakeRes = await fetch(
    `${baseUrl}/api/comments/webhook?hub.mode=subscribe&hub.verify_token=v5_meta_webhook_verify_token_apollo_2026&hub.challenge=CHALLENGE_ACCEPTED_APOLLO_2026`
  );
  const handshakeText = await handshakeRes.text();
  console.log(`Status HTTP: ${handshakeRes.status}`);
  console.log(`Challenge Retornado: "${handshakeText}"`);
  if (handshakeRes.status === 200 && handshakeText === "CHALLENGE_ACCEPTED_APOLLO_2026") {
    console.log("✅ TESTE 4 PASSOU!\n");
  } else {
    throw new Error("Falha no Teste 4");
  }

  console.log("🎉 TODOS OS 4 TESTES DE API DA CAPITANIA #13 PASSARAM COM SUCESSO ABSOLUTO!");
}

runApiTests().catch((err) => {
  console.error("❌ ERRO:", err);
  process.exit(1);
});
