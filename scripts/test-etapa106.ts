/**
 * test-etapa106.ts - Homologação das Novas Funcionalidades da Etapa 106
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * 1. Motor de Repurposing Onicanal 1-para-Muitos (omnichannelRepurposer.ts)
 * 2. Motor de Teste A/B de Ganchos e Preditor de Retenção de 3s (abTestingEngine.ts)
 */

import { repurposeOmnichannelContent, RepurposingTone } from "../src/lib/social/omnichannelRepurposer";
import { evaluateHookVariant, compareHooks } from "../src/lib/social/abTestingEngine";

console.log("================================================================================");
console.log("   TESTE DE HOMOLOGAÇÃO ETAPA 106 - CAPITANIA #13: V5 APOLLO POSTER (:3011)     ");
console.log("================================================================================\n");

let passed = 0;
let failed = 0;

function assert(desc: string, condition: boolean) {
  if (condition) {
    console.log(`✅ [PASS] ${desc}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${desc}`);
    failed++;
  }
}

// --------------------------------------------------------------------------------
// BLOCO 1: Motor de Repurposing Onicanal (1-para-5)
// --------------------------------------------------------------------------------
console.log("--- BLOCO 1: Repurposador Onicanal (Instagram, TikTok, LinkedIn, Twitter, WhatsApp) ---");

const testTopic = "5 Ferramentas de IA para Escalar seu Negócio Sem Equipe";
const testBody = `
• Automação de postagens onicanal com agendamento inteligente
• Clonagem de voz ultra-realista para narração de vídeos
• Geração de carrosséis e artes em alta definição
• SEO programático para multiplicação de tráfego orgânico
`;

const deck = repurposeOmnichannelContent(testTopic, testBody, "educational_step", "LINK", "https://v5apollo.com/hub");

assert("Geração do baralho completo de 5 canais", Object.keys(deck.channels).length === 5);
assert("Canal Instagram gerado com metadados", !!deck.channels.instagram);
assert("Canal TikTok gerado com metadados", !!deck.channels.tiktok);
assert("Canal LinkedIn gerado com metadados", !!deck.channels.linkedin);
assert("Canal Twitter gerado com metadados", !!deck.channels.twitter);
assert("Canal WhatsApp gerado com metadados", !!deck.channels.whatsapp);

// Validação Instagram
const ig = deck.channels.instagram;
assert("Instagram contém gatilho de DM com a palavra-chave 'LINK'", ig.formattedText.includes('"LINK"'));
assert("Instagram possui hashtags cirúrgicas recomendadas", ig.hashtags.length >= 4);

// Validação TikTok / Reels
const tt = deck.channels.tiktok;
assert("TikTok possui roteiro dividido em 3 Cenas (Ato 1, 2 e 3)", tt.extraMeta?.videoScenes?.length === 3);
assert("TikTok Ato 1 (Gancho) tem duração de 3 segundos", tt.extraMeta?.videoScenes?.[0]?.duration === "3s");

// Validação Twitter / X
const tw = deck.channels.twitter;
assert("Twitter gerou thread em 4 tweets", tw.extraMeta?.tweets?.length === 4);
const allTweetsUnderLimit = (tw.extraMeta?.tweets || []).every((t) => t.length <= 280);
assert("Todos os 4 tweets respeitam estritamente o limite de 280 caracteres", allTweetsUnderLimit);

// Validação WhatsApp VIP
const wa = deck.channels.whatsapp;
assert("WhatsApp usa negrito oficial no padrão mensageria (*palavra*)", wa.formattedText.includes("*"));
assert("WhatsApp contém link direto com parâmetros UTM rastreados", wa.formattedText.includes("utm_source=whatsapp_vip"));
assert("WhatsApp respeita limite seguro de mensageria (< 1024 caracteres)", wa.characterCount <= 1024);

// Teste de Todos os 4 Tons
const tones: RepurposingTone[] = ["viral_aggressive", "educational_step", "storytelling_pain", "offer_urgency"];
tones.forEach((tone) => {
  const d = repurposeOmnichannelContent(testTopic, testBody, tone);
  assert(`Repurposing no tom '${tone}' gera baralho válido`, Object.keys(d.channels).length === 5);
});

// --------------------------------------------------------------------------------
// BLOCO 2: Motor de Teste A/B de Ganchos & Preditor de Retenção
// --------------------------------------------------------------------------------
console.log("\n--- BLOCO 2: Motor de Teste A/B de Ganchos e Preditor de Retenção (3s) ---");

const strongHook = "Pare de Fazer Isso Manualmente: O Método de IA que Corta 10 Horas em 2026";
const weakHook = "Hoje eu vou falar sobre algumas ferramentas legais de tecnologia para o seu trabalho";

const evalStrong = evaluateHookVariant(strongHook);
const evalWeak = evaluateHookVariant(weakHook);

assert("Gancho forte possui score geral > 70", evalStrong.overallScore >= 70);
assert("Gancho fraco possui score geral < 60", evalWeak.overallScore < 60);
assert("Retenção estimada do gancho forte está acima de 65%", evalStrong.predictedRetention3s >= 65);
assert("Retenção estimada do gancho fraco está abaixo de 65%", evalWeak.predictedRetention3s < 65);
assert("Gancho forte possui quebra de padrão reconhecida", evalStrong.patternInterruptScore >= 70);
assert("Gancho forte possui densidade de caracteres ideal (40 a 90 chars)", evalStrong.brevityScore >= 80);

// Comparação A/B
const comparison = compareHooks(strongHook, weakHook);
assert("Comparador declara corretamente o gancho A como vencedor", comparison.winner === "A");
assert("Comparador calcula delta positivo de retenção estimada", comparison.predictedRetentionDelta > 0);
assert("Comparador gera justificativa analítica com explicação", comparison.summaryReason.length > 20);

// Comparação inversa
const comparisonInv = compareHooks(weakHook, strongHook);
assert("Comparador declara corretamente o gancho B na ordem inversa", comparisonInv.winner === "B");

// --------------------------------------------------------------------------------
// RESUMO FINAL
// --------------------------------------------------------------------------------
console.log("\n================================================================================");
console.log(`TOTAL DE TESTES EXECUTADOS: ${passed + failed}`);
console.log(`APROVADOS: ${passed}`);
console.log(`FALHAS: ${failed}`);
console.log("================================================================================");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 TODOS OS TESTES DA ETAPA 106 PASSARAM COM SUCESSO!\n");
  process.exit(0);
}
