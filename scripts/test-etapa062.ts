/**
 * scripts/test-etapa062.ts - Suíte de Validação da Etapa 062
 * Mapeador e Normalizador de Gatilhos Cognitivos (ChatbotX)
 * Capitania #13: V5 Apollo Poster (:3011)
 */

import assert from "node:assert";
import { 
  normalizeCommentText, 
  calculateLevenshteinDistance, 
  expandKeywordsWithSynonyms,
  compileTriggerRegex,
  matchCommentTrigger,
  TRIGGER_SYNONYM_GROUPS
} from "../src/lib/comments/triggerMatcher";

console.log("🧪 Iniciando Validação da Etapa 062: Mapeador de Gatilhos Cognitivos ChatbotX...\n");

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
// GRUPO 1: Pipeline de Normalização de Texto (normalizeCommentText)
// -------------------------------------------------------------
test("1.1 Remove diacríticos e acentuações (NFD) preservando legibilidade", () => {
  const result = normalizeCommentText("Preço, promoção e cupom de coração!");
  assert.strictEqual(result, "preco promocao e cupom de coracao");
});

test("1.2 Colapsa repetições exageradas de caracteres (3+ letras consecutivas)", () => {
  const result = normalizeCommentText("Euuuu queroooo o linkkkk por favorrrr!!");
  assert.strictEqual(result, "eu quero o link por favor");
});

test("1.3 Preserva repetições legítimas da língua portuguesa (ex: ss, rr)", () => {
  const result = normalizeCommentText("Passo a passo do acesso correto");
  assert.strictEqual(result, "passo a passo do acesso correto");
});

test("1.4 Remove emojis e caracteres especiais substituindo por espaçamento limpo", () => {
  const result = normalizeCommentText("Quero o link agora! 🔥🚀😍✨");
  assert.strictEqual(result, "quero o link agora");
});

test("1.5 Trata strings vazias ou nulas com segurança", () => {
  assert.strictEqual(normalizeCommentText(""), "");
  assert.strictEqual(normalizeCommentText("   "), "");
});

// -------------------------------------------------------------
// GRUPO 2: Distância de Levenshtein (calculateLevenshteinDistance)
// -------------------------------------------------------------
test("2.1 Strings idênticas retornam distância zero", () => {
  assert.strictEqual(calculateLevenshteinDistance("link", "link"), 0);
  assert.strictEqual(calculateLevenshteinDistance("quero", "quero"), 0);
});

test("2.2 Typo de 1 caractere (ex: linck -> link) retorna distância 1", () => {
  assert.strictEqual(calculateLevenshteinDistance("linck", "link"), 1);
  assert.strictEqual(calculateLevenshteinDistance("lik", "link"), 1);
});

test("2.3 Substituição de 1 caractere (ex: lynk -> link) retorna distância 1", () => {
  assert.strictEqual(calculateLevenshteinDistance("lynk", "link"), 1);
});

test("2.4 Distâncias maiores são calculadas corretamente", () => {
  assert.strictEqual(calculateLevenshteinDistance("qro", "quero"), 2);
});

// -------------------------------------------------------------
// GRUPO 3: Dicionário e Expansão de Sinônimos (expandKeywordsWithSynonyms)
// -------------------------------------------------------------
test("3.1 Grupos oficiais de sinônimos estão carregados", () => {
  assert.ok(TRIGGER_SYNONYM_GROUPS.LINK.includes("MANDA O LINK"));
  assert.ok(TRIGGER_SYNONYM_GROUPS.QUERO.includes("EU QUERO"));
  assert.ok(TRIGGER_SYNONYM_GROUPS.DESCONTO.includes("CUPOM"));
});

test("3.2 Expansão de 'LINK' inclui variações conhecidas do ChatbotX", () => {
  const expanded = expandKeywordsWithSynonyms(["LINK"]);
  assert.ok(expanded.includes("LINK"));
  assert.ok(expanded.includes("LINCK"));
  assert.ok(expanded.includes("URL"));
  assert.ok(expanded.includes("MANDA O LINK"));
});

test("3.3 Expansão de palavras sem grupo mantém a palavra original", () => {
  const expanded = expandKeywordsWithSynonyms(["SUPERPRODUTO"]);
  assert.deepStrictEqual(expanded, ["SUPERPRODUTO"]);
});

// -------------------------------------------------------------
// GRUPO 4: Fronteiras de Palavra contra Falsos Positivos
// -------------------------------------------------------------
test("4.1 Regex com fronteira \\b não ativa falso positivo em 'blink' ou 'slinky'", () => {
  const rx = compileTriggerRegex("LINK", "contains");
  assert.strictEqual(rx.test("a lampada começou a blinkar"), false);
  assert.strictEqual(rx.test("o brinquedo slinky e divertido"), false);
});

test("4.2 Regex com fronteira \\b ativa perfeitamente em tokens isolados ou pontuados", () => {
  const rx = compileTriggerRegex("LINK", "contains");
  assert.strictEqual(rx.test("eu quero o link por favor"), true);
  assert.strictEqual(rx.test("link"), true);
  assert.strictEqual(rx.test("manda o link"), true);
});

// -------------------------------------------------------------
// GRUPO 5: Avaliação Completa de Comentários (matchCommentTrigger)
// -------------------------------------------------------------
test("5.1 Modo 'contains': detecta 'QUERO' em frase casual", () => {
  const result = matchCommentTrigger(
    "Gostei muito do reels, eu quero começar hoje!",
    ["QUERO", "LINK"],
    { mode: "contains" }
  );
  assert.strictEqual(result.isMatch, true);
  assert.strictEqual(result.matchedKeyword, "QUERO");
  assert.ok(result.confidence >= 0.95);
  assert.strictEqual(result.matchModeUsed, "contains");
});

test("5.2 Modo 'exact': rejeita frase completa mas aceita palavra isolada", () => {
  const failResult = matchCommentTrigger(
    "Eu quero agora",
    ["QUERO"],
    { mode: "exact" }
  );
  assert.strictEqual(failResult.isMatch, false);

  const passResult = matchCommentTrigger(
    "QUERO!",
    ["QUERO"],
    { mode: "exact" }
  );
  assert.strictEqual(passResult.isMatch, true);
  assert.strictEqual(passResult.matchedKeyword, "QUERO");
  assert.strictEqual(passResult.confidence, 1.0);
});

test("5.3 Modo 'fuzzy': tolera typos de 1 caractere no comentário", () => {
  const result = matchCommentTrigger(
    "Manda o linck no direct!",
    ["LINK"],
    { mode: "fuzzy", fuzzyMaxDistance: 1 }
  );
  assert.strictEqual(result.isMatch, true);
  assert.strictEqual(result.matchedKeyword, "LINK");
  assert.strictEqual(result.matchedSnippet, "linck");
  assert.strictEqual(result.matchModeUsed, "fuzzy");
  assert.ok(result.confidence > 0.7);
});

test("5.4 Pipeline com repetições exageradas e emojis ativa gatilho com perfeição", () => {
  const result = matchCommentTrigger(
    "Euuuuu querooooo o linkkkk!! 🚀🔥",
    ["QUERO", "LINK"],
    { mode: "contains" }
  );
  assert.strictEqual(result.isMatch, true);
  assert.ok(result.matchedKeyword === "QUERO" || result.matchedKeyword === "LINK");
  assert.strictEqual(result.normalizedComment, "eu quero o link");
});

test("5.5 Expansão de sinônimos ativa 'DESCONTO' a partir de 'tem cupom?'", () => {
  const result = matchCommentTrigger(
    "Tem algum cupom disponivel?",
    ["DESCONTO"],
    { mode: "contains", useSynonyms: true }
  );
  assert.strictEqual(result.isMatch, true);
  assert.strictEqual(result.matchedKeyword, "CUPOM");
});

test("5.6 Comentário negativo/irrelevante não ativa nenhum gatilho", () => {
  const result = matchCommentTrigger(
    "Adorei a receita do bolo de cenoura!",
    ["LINK", "QUERO", "DESCONTO"],
    { mode: "contains" }
  );
  assert.strictEqual(result.isMatch, false);
  assert.strictEqual(result.confidence, 0);
  assert.strictEqual(result.matchedKeyword, undefined);
});

test("5.7 Modo 'regex' permite regras customizadas complexas", () => {
  const result = matchCommentTrigger(
    "Código de rastreio: BR-12345",
    ["BR-\\d+"],
    { mode: "regex" }
  );
  assert.strictEqual(result.isMatch, true);
  assert.strictEqual(result.matchModeUsed, "regex");
  assert.strictEqual(result.matchedSnippet, "BR-12345");
});

console.log(`\n🎉 Todos os ${passed} testes da Etapa 062 passaram com 100% de sucesso!`);
