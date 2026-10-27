/**
 * scripts/test-etapa066.ts - Suíte de Validação da Etapa 066
 * Simulador Interativo de Comentários com Resposta Pública e DM em Tempo Real
 * Capitania #13: V5 Apollo Poster (:3011)
 */

import assert from "node:assert";
import { 
  simulateCommentInteraction,
  QUICK_TEST_SCENARIOS
} from "../src/lib/comments/commentSimulationEngine";
import { CommentRule } from "../src/types/poster";

console.log("🧪 Iniciando Validação da Etapa 066: Simulador Interativo de Comentários em Tempo Real...\n");

let passed = 0;
async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// Regra base para testes
const mockRule: CommentRule = {
  id: "rule_sim_test_066",
  name: "Campanha Reels Agentes Autônomos",
  platform: "instagram",
  targetPostId: "reel_998877",
  matchMode: "fuzzy",
  keywords: ["LINK", "QUERO", "CUPOM", "DESCONTO"],
  publicReplyVariants: [
    "Acabei de te enviar no Direct! Dá uma olhada lá 🔥",
    "Te mandei o link com todos os detalhes na sua DM! 🚀",
    "Prontinho! Link enviado no seu direct, aproveite a leitura 👀",
    "Confere suas mensagens diretas, acabei de despachar o acesso! ⚡",
    "Enviado! O link direto pro conteúdo está te esperando na DM 📖"
  ],
  dmMessageTemplate: "Olá {{nome}}! Aqui está o seu acesso oficial: {{ctaUrl}} com o cupom {{cupom}} 🏷️",
  ctaUrl: "https://v5autoblog.com/agentes?utm_source=ig_comment_dm",
  couponCode: "APOLLO2026",
  isActive: true,
  totalTriggered: 14
};

async function runSuite() {
  // -------------------------------------------------------------
  // GRUPO 1: Simulação Completa de Lead Quente (simulateCommentInteraction)
  // -------------------------------------------------------------
  await test("1.1 Cenário quente ('EU QUERO O LINK') dispara todo o pipeline com sucesso", async () => {
    const res = await simulateCommentInteraction({
      commentText: "Eu quero o link desse conteúdo agora mesmo! 🔥🚀",
      username: "@carlos_growth",
      rule: mockRule,
      platform: "instagram"
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.isTriggerMatched, true);
    assert.ok(res.matchResult.matchedKeyword === "QUERO" || res.matchResult.matchedKeyword === "LINK");
    assert.ok(res.publicReplyText && res.publicReplyText.length > 5);
    assert.ok(res.dmMessageText && res.dmMessageText.includes("carlos_growth"));
    assert.ok(res.dmMessageText.includes("https://v5autoblog.com/agentes"));
    assert.ok(res.dmMessageText.includes("APOLLO2026"));
    assert.ok(res.metaCommentId?.startsWith("17841400"));
    assert.ok(res.metaMessageId?.startsWith("m_mid."));
    assert.strictEqual(res.bypass24hVerified, true);
    assert.ok(res.latencyMs > 0);
    assert.strictEqual(res.executionSteps.length, 4);
  });

  // -------------------------------------------------------------
  // GRUPO 2: Cenário de Typo Tolerado (Fuzzy Matching)
  // -------------------------------------------------------------
  await test("1.2 Cenário de typo ('linck') é capturado pelo pipeline difuso", async () => {
    const res = await simulateCommentInteraction({
      commentText: "Manda o linck no direct por favorrrr!!",
      username: "@dev_juliana",
      rule: mockRule
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.isTriggerMatched, true);
    assert.ok(res.dmMessageText && res.dmMessageText.includes("dev_juliana"));
    assert.ok(res.executionSteps.some(s => s.step === "Trigger Matcher" && s.status === "success"));
  });

  // -------------------------------------------------------------
  // GRUPO 3: Cenário Anti-Falso Positivo ('blinkar')
  // -------------------------------------------------------------
  await test("1.3 Cenário de falso positivo ('blinkar') não dispara DM nem resposta", async () => {
    const res = await simulateCommentInteraction({
      commentText: "A luz do aparelho começou a piscar e blinkar sem parar",
      username: "@andre_tech",
      rule: { ...mockRule, matchMode: "contains" }
    });

    assert.strictEqual(res.success, false);
    assert.strictEqual(res.isTriggerMatched, false);
    assert.strictEqual(res.publicReplyText, undefined);
    assert.strictEqual(res.dmMessageText, undefined);
    assert.strictEqual(res.bypass24hVerified, false);
    assert.strictEqual(res.executionSteps.length, 1);
    assert.strictEqual(res.executionSteps[0].status, "failed");
  });

  // -------------------------------------------------------------
  // GRUPO 4: Cenário Neutro (Sem Intenção de Compra)
  // -------------------------------------------------------------
  await test("1.4 Elogio casual sem intenção ('Parabéns pelo trabalho') não ativa gatilho", async () => {
    const res = await simulateCommentInteraction({
      commentText: "Parabéns pelo trabalho, adorei a edição do vídeo!",
      username: "@carla_design",
      rule: mockRule
    });

    assert.strictEqual(res.success, false);
    assert.strictEqual(res.isTriggerMatched, false);
    assert.strictEqual(res.publicReplyText, undefined);
  });

  // -------------------------------------------------------------
  // GRUPO 5: Validação da Biblioteca de Cenários Rápidos (QUICK_TEST_SCENARIOS)
  // -------------------------------------------------------------
  await test("2.1 Biblioteca possui 5 cenários essenciais estruturados", () => {
    assert.strictEqual(QUICK_TEST_SCENARIOS.length, 5);
    const categories = QUICK_TEST_SCENARIOS.map(s => s.category);
    assert.ok(categories.includes("hot_lead"));
    assert.ok(categories.includes("typo_fuzzy"));
    assert.ok(categories.includes("coupon_request"));
    assert.ok(categories.includes("false_positive"));
    assert.ok(categories.includes("neutral"));
  });

  await test("2.2 Execução em lote de todos os 5 cenários confirma correspondência dos resultados esperados", async () => {
    for (const scenario of QUICK_TEST_SCENARIOS) {
      const res = await simulateCommentInteraction({
        commentText: scenario.commentText,
        username: scenario.username,
        rule: { ...mockRule, matchMode: scenario.category === "false_positive" ? "contains" : "fuzzy" }
      });

      if (scenario.expectedResult === "match") {
        assert.strictEqual(res.isTriggerMatched, true, `Cenário ${scenario.id} deveria dar match`);
        assert.strictEqual(res.success, true, `Cenário ${scenario.id} deveria ter sucesso`);
      } else {
        assert.strictEqual(res.isTriggerMatched, false, `Cenário ${scenario.id} NÃO deveria dar match`);
      }
    }
  });

  // -------------------------------------------------------------
  // GRUPO 6: Alternância de Respostas Públicas em Disparos Sucessivos
  // -------------------------------------------------------------
  await test("3.1 Disparos sucessivos alternam as respostas públicas sem repetição imediata", async () => {
    let lastIndex = -1;
    for (let i = 0; i < 15; i++) {
      const res = await simulateCommentInteraction({
        commentText: "Eu quero o link!!",
        username: `@user_${i}`,
        rule: mockRule
      });

      assert.strictEqual(res.isTriggerMatched, true);
      assert.notStrictEqual(res.publicReplyIndex, lastIndex, `Índice de resposta repetido na chamada ${i}`);
      lastIndex = res.publicReplyIndex!;
    }
  });

  console.log(`\n🎉 Todos os ${passed} testes da Etapa 066 passaram com 100% de sucesso!`);
}

runSuite();
