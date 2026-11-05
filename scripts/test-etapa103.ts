/**
 * test-etapa103.ts - Teste E2E de Fluxo Comment-to-DM (ChatbotX Inspired)
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Validações de Ponta a Ponta:
 * 1. Mapeamento cognitivo de gatilhos (contains, exact, fuzzy, regex e fronteira \b)
 * 2. Evasão anti-spam: rotação estocástica de respostas públicas
 * 3. Compilação do template de DM com interpolação de variáveis e cupom
 * 4. Validação de ancoragem no comment_id (Bypass da janela de 24h Meta Graph API)
 * 5. Gerador de URL rastreada com parâmetros UTM dedicados
 * 6. Execução completa dos cenários curados de teste (hot lead, typo, pedido de cupom, falso positivo)
 */

import {
  matchCommentTrigger
} from "../src/lib/comments/triggerMatcher";
import {
  getNextPublicReply,
  formatPublicReply
} from "../src/lib/comments/publicReplyRotator";
import {
  compileDmMessage
} from "../src/lib/comments/dmTemplateBuilder";
import {
  simulateCommentInteraction,
  QUICK_TEST_SCENARIOS
} from "../src/lib/comments/commentSimulationEngine";
import {
  generateTrackedDmUrl
} from "../src/lib/comments/trackedLinkGenerator";
import { CommentRule } from "../src/types/poster";

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

async function runTestEtapa103() {
  console.log("\n=======================================================");
  console.log("🚀 INICIANDO TESTE E2E DA ETAPA 103 - FLUXO COMMENT-TO-DM");
  console.log("=======================================================\n");

  // Regra base para testes com a interface oficial CommentRule
  const mockRule: CommentRule = {
    id: "rule-103",
    name: "Automação E2E Link & Cupom",
    platform: "instagram",
    targetPostId: "post-sample-001",
    keywords: ["LINK", "QUERO", "CUPOM"],
    matchMode: "contains",
    publicReplyVariants: [
      "Perfeito, {{username}}! Já enviei os detalhes no seu Direct. Dá uma olhada! 🚀",
      "Boa escolha, {{username}}! Acabei de disparar o link exclusivo na sua DM. ✨",
      "Tudo pronto, {{username}}! O acesso direto e o cupom já estão nas suas mensagens privadas. 🔥"
    ],
    dmMessageTemplate: "Olá {{nome}}! Aqui está o link que você pediu: {{ctaUrl}} com o cupom {{cupom}}.",
    ctaUrl: "https://v5apollo.com/oferta-vip",
    couponCode: "VIPAPOLLO20",
    isActive: true,
    totalTriggered: 0
  };

  // 1. Reconhecimento Cognitivo de Gatilhos
  console.log("--- 1. Reconhecimento de Gatilhos Cognitivos ---");
  const match1 = matchCommentTrigger("Eu quero muito o link por favor!", mockRule.keywords, {
    mode: "contains",
    useSynonyms: true
  });
  assert(match1.isMatch === true, "Identificou gatilho 'QUERO' e 'LINK' em texto corrido.");
  assert(match1.matchedKeyword === "QUERO" || match1.matchedKeyword === "LINK", "Keyword extraída com precisão.");

  const matchFuzzy = matchCommentTrigger("Manda o linck no direct!", ["LINK"], {
    mode: "fuzzy",
    fuzzyMaxDistance: 1
  });
  assert(matchFuzzy.isMatch === true, "Tolerância a erro de digitação ('linck') aprovada por Levenshtein.");

  const matchFalsePositive = matchCommentTrigger("A tela começou a blinkar", ["LINK"], {
    mode: "contains"
  });
  assert(matchFalsePositive.isMatch === false, "Falso positivo prevenido com sucesso: 'blinkar' não dispara 'LINK'.");

  // 2. Rotação Anti-Spam de Respostas Públicas
  console.log("\n--- 2. Rotação Anti-Spam de Respostas Públicas ---");
  const reply1 = getNextPublicReply(mockRule.publicReplyVariants, "rule-103", "random_no_repeat");
  const reply2 = getNextPublicReply(mockRule.publicReplyVariants, "rule-103", "random_no_repeat");
  assert(reply1.selectedIndex !== reply2.selectedIndex, "Respostas consecutivas utilizam índices diferentes para evitar bloqueio da Meta.");

  const formattedReply = formatPublicReply(reply1.reply, { username: "@carlos_silva" });
  assert(formattedReply.includes("@carlos_silva"), "Placeholder {{username}} substituído com sucesso pelo handle do usuário.");

  // 3. Compilação de DM e Interpolação de Variáveis
  console.log("\n--- 3. Compilação de Template de DM ---");
  const trackedUrlResult = generateTrackedDmUrl({
    baseUrl: mockRule.ctaUrl,
    campaign: mockRule.name,
    matchedKeyword: "LINK",
    couponCode: mockRule.couponCode
  });
  assert(trackedUrlResult.finalUrl.includes("utm_source=ig_comment_dm"), "URL da DM injeta UTM oficial da Holding V5.");

  const dmCompiled = compileDmMessage(mockRule.dmMessageTemplate, {
    name: "Carlos",
    username: "@carlos_silva",
    ctaUrl: trackedUrlResult.finalUrl,
    couponCode: mockRule.couponCode
  });
  assert(dmCompiled.includes("Carlos"), "Nome do usuário interpolado na DM privada.");
  assert(dmCompiled.includes("VIPAPOLLO20"), "Cupom promocional interpolado na DM privada.");
  assert(dmCompiled.includes("utm_campaign"), "Link rastreado presente no corpo da mensagem.");

  // 4. Execução dos Cenários Oficiais da Simulação
  console.log("\n--- 4. Execução de Cenários Rápidos (commentSimulationEngine) ---");
  for (const scenario of QUICK_TEST_SCENARIOS) {
    const simResult = await simulateCommentInteraction({
      commentText: scenario.commentText,
      username: scenario.username,
      rule: mockRule,
      simulatedLatencyMs: 10
    });

    if (scenario.expectedResult === "match") {
      assert(simResult.isTriggerMatched === true, `Cenário '${scenario.title}' disparou gatilho corretamente.`);
      assert(simResult.bypass24hVerified === true, `Bypass de 24h verificado via ancoragem no comment_id.`);
      assert(simResult.success === true, `Fluxo de simulação concluído com sucesso para '${scenario.username}'.`);
    } else {
      assert(simResult.isTriggerMatched === false, `Cenário neutro/falso positivo '${scenario.title}' foi ignorado corretamente.`);
    }
  }

  console.log("\n=======================================================");
  console.log(`🎯 RESULTADO ETAPA 103: ${passedTests}/${totalTests} TESTES APROVADOS!`);
  console.log("=======================================================\n");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTestEtapa103().catch((err) => {
  console.error("Erro fatal no teste:", err);
  process.exit(1);
});
