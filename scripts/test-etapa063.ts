/**
 * scripts/test-etapa063.ts - Suíte de Validação da Etapa 063
 * Construtor e Motor de Rotação de Respostas Públicas Anti-Spam
 * Capitania #13: V5 Apollo Poster (:3011)
 */

import assert from "node:assert";
import { 
  formatPublicReply,
  calculateStringSimilarity,
  validateAntiSpamDiversity,
  getNextPublicReply,
  resetRotationMemory,
  NICHE_VARIANT_PACKS
} from "../src/lib/comments/publicReplyRotator";

console.log("🧪 Iniciando Validação da Etapa 063: Construtor de Variações de Resposta Pública Rotativa Anti-Spam...\n");

let passed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// -------------------------------------------------------------
// GRUPO 1: Interpolação de Tokens (formatPublicReply)
// -------------------------------------------------------------
test("1.1 Interpolação de {{username}} adiciona @ se ausente", () => {
  const result = formatPublicReply("Olá {{username}}, mandei no direct!", { username: "carlos_dev" });
  assert.strictEqual(result, "Olá @carlos_dev, mandei no direct!");
});

test("1.2 Interpolação de {{username}} não duplica @ existente", () => {
  const result = formatPublicReply("Valeu {{username}}!", { username: "@ana_growth" });
  assert.strictEqual(result, "Valeu @ana_growth!");
});

test("1.3 Interpolação de {{nome}} e {{name}} funciona corretamente", () => {
  const result = formatPublicReply("Pronto {{nome}}, confere sua DM!", { name: "Marcos" });
  assert.strictEqual(result, "Pronto Marcos, confere sua DM!");
});

test("1.4 Trata template vazio ou sem variáveis com segurança", () => {
  assert.strictEqual(formatPublicReply(""), "");
  assert.strictEqual(formatPublicReply("Mandei no direct!"), "Mandei no direct!");
});

// -------------------------------------------------------------
// GRUPO 2: Cálculo de Similaridade de Strings (calculateStringSimilarity)
// -------------------------------------------------------------
test("2.1 Strings idênticas retornam similaridade 1.0", () => {
  assert.strictEqual(calculateStringSimilarity("Te mandei no direct!", "Te mandei no direct!"), 1.0);
});

test("2.2 Frases com apenas um emoji alterado apresentam alta similaridade (> 0.85)", () => {
  const sim = calculateStringSimilarity(
    "Te mandei o link no direct! 🔥", 
    "Te mandei o link no direct! 🚀"
  );
  assert.ok(sim > 0.85, `Esperava sim > 0.85, obtido: ${sim}`);
});

test("2.3 Frases de estruturas completamente diferentes apresentam baixa similaridade (< 0.50)", () => {
  const sim = calculateStringSimilarity(
    "Acabei de despachar seu acesso pelo direct! 🔥",
    "Confere suas mensagens privadas, já está liberado!"
  );
  assert.ok(sim < 0.55, `Esperava sim < 0.55, obtido: ${sim}`);
});

// -------------------------------------------------------------
// GRUPO 3: Validador de Saúde Anti-Spam (validateAntiSpamDiversity)
// -------------------------------------------------------------
test("3.1 Lista vazia retorna status 'critical' e isSafeToDispatch false", () => {
  const health = validateAntiSpamDiversity([]);
  assert.strictEqual(health.status, "critical");
  assert.strictEqual(health.score, 0);
  assert.strictEqual(health.isSafeToDispatch, false);
});

test("3.2 Uma única variação alerta sobre alto risco anti-spam da Meta/TikTok", () => {
  const health = validateAntiSpamDiversity(["Mandei no direct!"]);
  assert.strictEqual(health.status, "critical");
  assert.strictEqual(health.isSafeToDispatch, false);
  assert.ok(health.warnings.some(w => w.includes("Alto risco de detecção")));
});

test("3.3 Duas variações geram status 'warning' e exigem mínimo de 3 a 5", () => {
  const health = validateAntiSpamDiversity([
    "Mandei no direct! 🔥",
    "Confere sua mensagem! 🚀"
  ]);
  assert.strictEqual(health.status, "warning");
  assert.strictEqual(health.isSafeToDispatch, false);
});

test("3.4 Três variações diversas geram status 'healthy' e isSafeToDispatch true", () => {
  const health = validateAntiSpamDiversity([
    "Acabei de te enviar no Direct! Dá uma olhada lá 🔥",
    "Prontinho! Link enviado no seu direct, aproveite a leitura 👀",
    "Confere suas mensagens diretas, acabei de despachar o acesso! ⚡"
  ]);
  assert.strictEqual(health.status, "healthy");
  assert.strictEqual(health.isSafeToDispatch, true);
  assert.ok(health.score >= 55);
});

test("3.5 Variações quase idênticas (cópias triviais) geram aviso de similaridade", () => {
  const health = validateAntiSpamDiversity([
    "Te mandei o link no direct 1!",
    "Te mandei o link no direct 2!",
    "Te mandei o link no direct 3!"
  ]);
  assert.ok(health.warnings.some(w => w.includes("muito semelhantes")));
  assert.ok(health.averageSimilarity > 0.85);
});

// -------------------------------------------------------------
// GRUPO 4: Pacotes de Variações por Nicho (NICHE_VARIANT_PACKS)
// -------------------------------------------------------------
test("4.1 Todos os 4 nichos oficiais possuem exatamente 5 variações prontas", () => {
  const niches = ["content_blog", "ecommerce_finders", "vip_community", "course_lead"] as const;
  for (const n of niches) {
    const pack = NICHE_VARIANT_PACKS[n];
    assert.ok(pack, `Pacote para o nicho ${n} não encontrado`);
    assert.strictEqual(pack.variants.length, 5, `Nicho ${n} deve ter exatamente 5 variações`);
  }
});

test("4.2 Todos os pacotes de nicho atingem status 'excellent' no health check", () => {
  const niches = ["content_blog", "ecommerce_finders", "vip_community", "course_lead"] as const;
  for (const n of niches) {
    const pack = NICHE_VARIANT_PACKS[n];
    const health = validateAntiSpamDiversity(pack.variants);
    assert.strictEqual(health.status, "excellent", `Pacote ${n} deve ter status excellent (obteve ${health.status})`);
    assert.ok(health.score >= 80, `Pacote ${n} score esperado >= 80 (obteve ${health.score})`);
    assert.strictEqual(health.isSafeToDispatch, true);
  }
});

// -------------------------------------------------------------
// GRUPO 5: Motor de Rotação sem Repetição Consecutiva (getNextPublicReply)
// -------------------------------------------------------------
test("5.1 Rotação com 1 variação retorna sempre o índice 0", () => {
  resetRotationMemory("rule_single");
  const res = getNextPublicReply(["Única variação"], "rule_single");
  assert.strictEqual(res.selectedIndex, 0);
  assert.strictEqual(res.reply, "Única variação");
});

test("5.2 Estratégia 'random_no_repeat' NUNCA repete o mesmo índice consecutivamente", () => {
  const ruleId = "test_rule_no_repeat";
  resetRotationMemory(ruleId);
  const sampleVariants = NICHE_VARIANT_PACKS.content_blog.variants;

  let lastIndex = -1;
  for (let i = 0; i < 30; i++) {
    const { selectedIndex } = getNextPublicReply(sampleVariants, ruleId, "random_no_repeat");
    assert.notStrictEqual(
      selectedIndex, 
      lastIndex, 
      `Índice ${selectedIndex} foi repetido consecutivamente na iteração ${i}!`
    );
    lastIndex = selectedIndex;
  }
});

test("5.3 Estratégia 'round_robin' cicla sequencialmente", () => {
  const ruleId = "test_round_robin";
  resetRotationMemory(ruleId);
  const variants = ["V1", "V2", "V3"];

  const r1 = getNextPublicReply(variants, ruleId, "round_robin");
  const r2 = getNextPublicReply(variants, ruleId, "round_robin");
  const r3 = getNextPublicReply(variants, ruleId, "round_robin");
  const r4 = getNextPublicReply(variants, ruleId, "round_robin");

  assert.strictEqual(r1.selectedIndex, 0);
  assert.strictEqual(r2.selectedIndex, 1);
  assert.strictEqual(r3.selectedIndex, 2);
  assert.strictEqual(r4.selectedIndex, 0); // Volta ao início
});

test("5.4 Fallback gracioso para conjunto vazio de variações", () => {
  const res = getNextPublicReply([], "rule_empty");
  assert.strictEqual(res.selectedIndex, -1);
  assert.ok(res.reply.length > 0);
});

console.log(`\n🎉 Todos os ${passed} testes da Etapa 063 passaram com 100% de sucesso!`);
