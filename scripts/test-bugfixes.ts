/**
 * test-bugfixes.ts - Suíte de Validação das Correções de Erros e Bugs
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Verificações:
 * 1. Fuso horário local sem conversão UTC espúria (formatLocalDateTimeInput)
 * 2. Prevenção de crashes em evaluateExcerptQuality com inputs nulos/indefinidos
 * 3. Robustez defensiva contra TypeError em .toFixed() no despachador de ofertas
 * 4. Tratamento de limites em cálculo de economia e urgência de deals
 * 5. Paginação resiliente para listas e tabelas de auditoria vazias
 */

import { formatLocalDateTimeInput, formatRelativeDate } from "../src/lib/utils/formatters";
import { evaluateExcerptQuality, cleanMarkdownForExcerpt } from "../src/lib/seo/excerptExtractor";
import { calculateSavings, detectStoreFromUrl, validateDealData } from "../src/lib/finders/storeConnector";
import { calculateFullSavings, getDealUrgency } from "../src/lib/finders/discountCalculator";
import { paginateLogs } from "../src/lib/analytics/auditLogManager";
import { serializeQueue, deserializeQueue } from "../src/lib/queue/crossTabQueueSync";

let passed = 0;
let total = 0;

function assert(condition: boolean, msg: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    process.exitCode = 1;
  }
}

console.log("\n=======================================================");
console.log("🛠️ SUÍTE DE TESTES: CORREÇÃO DE ERROS E HARDENING DE BUGS");
console.log("=======================================================\n");

// 1. Fuso Horário e Datetime Local
console.log("--- 1. Fuso Horário e Datetime Local ---");
const testDate = new Date(2026, 9, 28, 14, 30); // 28 Out 2026 às 14:30 local
const localStr = formatLocalDateTimeInput(testDate);
assert(localStr === "2026-10-28T14:30", `Formata data local sem distorção UTC: ${localStr}`);

const tomorrowDate = new Date(testDate);
tomorrowDate.setDate(tomorrowDate.getDate() + 1);
const tomorrowStr = formatLocalDateTimeInput(tomorrowDate);
assert(tomorrowStr === "2026-10-29T14:30", `Preserva a hora exata (14:30) ao avançar 1 dia: ${tomorrowStr}`);

// 2. Resiliência do Avaliador de Excerpt (Prevenção de crashes com null/undefined)
console.log("\n--- 2. Resiliência do Avaliador de Excerpt SEO ---");
const nullQuality = evaluateExcerptQuality(null as any, []);
assert(nullQuality.status === "too_short", "Lida com input null sem estourar TypeError");
assert(nullQuality.characterCount === 0, "Contagem de caracteres zero para null");

const undefinedQuality = evaluateExcerptQuality(undefined as any, ["IA", "Automação"]);
assert(undefinedQuality.status === "too_short", "Lida com input undefined sem estourar TypeError");

const cleanText = cleanMarkdownForExcerpt("### Heading Teste\n\nTexto com [link](https://exemplo.com) e **negrito**.");
assert(!cleanText.includes("###") && !cleanText.includes("**"), "Sanitiza sintaxe markdown de headings e negritos");

// 3. Cálculos Financeiros e Robustez Defensiva de Preços
console.log("\n--- 3. Cálculos Financeiros e Robustez de Ofertas ---");
const invalidDealSavings = calculateSavings(0, 0);
assert(invalidDealSavings.isValid === false, "Detecta deal com preço zero como inválido sem divisão por zero");
assert(invalidDealSavings.discountPercentage === 0, "Percentual de desconto seguro é 0%");

const reversedDealSavings = calculateSavings(50, 100);
assert(reversedDealSavings.isValid === false, "Detecta preço promocional maior que original como inválido");

const validDealSavings = calculateSavings(199.90, 99.90);
assert(validDealSavings.isValid === true, "Calcula desconto válido com precisão");
assert(validDealSavings.discountPercentage === 50, "Calcula 50% de desconto corretamente");
assert(validDealSavings.savingsAmount === 100, "Calcula R$ 100.00 de economia");

// 4. Urgência Psicológica de Descontos
console.log("\n--- 4. Níveis de Urgência Psicológica ---");
const bugUrgency = getDealUrgency(65);
assert(bugUrgency.level === "price_bug", "Desconto >= 60% classificado como Bug de Preço");

const superUrgency = getDealUrgency(45);
assert(superUrgency.level === "super_deal", "Desconto entre 40% e 59% classificado como Super Pechincha");

const greatUrgency = getDealUrgency(25);
assert(greatUrgency.level === "great_deal", "Desconto entre 20% e 39% classificado como Ótima Oportunidade");

const moderateUrgency = getDealUrgency(15);
assert(moderateUrgency.level === "moderate_deal", "Desconto < 20% classificado como Desconto Moderado");

// 5. Paginação de Tabela de Auditoria com Lista Vazia
console.log("\n--- 5. Paginação de Logs e Listas Vazias ---");
const emptyPageResult = paginateLogs([], 1, 10);
assert(emptyPageResult.totalCount === 0, "Total count é 0 em lista vazia");
assert(emptyPageResult.items.length === 0, "Items vazio");
assert(emptyPageResult.currentPage === 1, "Página segura permanece 1");
assert(emptyPageResult.totalPages === 1, "Total de páginas seguro é 1");

// 6. Serialização e Desserialização da Fila Cross-Tab
console.log("\n--- 6. Serialização e Desserialização da Fila ---");
const emptyQueueDeserialized = deserializeQueue(null);
assert(Array.isArray(emptyQueueDeserialized) && emptyQueueDeserialized.length === 0, "Desserializa null com segurança para array vazio");

const corruptQueueDeserialized = deserializeQueue("{corrupted_json");
assert(Array.isArray(corruptQueueDeserialized) && corruptQueueDeserialized.length === 0, "Desserializa JSON corrompido sem crash");

const validQueueSerialized = serializeQueue([
  {
    id: "task-test-1",
    entityId: "post-mock-1",
    entityType: "post",
    title: "Post de Teste",
    platforms: ["instagram"],
    scheduledFor: "2026-10-28T14:00:00",
    priority: "normal",
    status: "scheduled",
    attempts: 0,
    maxAttempts: 3,
    createdAt: "2026-10-27T10:00:00",
    updatedAt: "2026-10-27T10:00:00"
  }
]);
assert(typeof validQueueSerialized === "string" && validQueueSerialized.includes("task-test-1"), "Serializa item de fila corretamente");
const restoredQueue = deserializeQueue(validQueueSerialized);
assert(restoredQueue.length === 1 && restoredQueue[0].id === "task-test-1", "Restaura item da fila com integridade");

console.log("\n=======================================================");
console.log(`📊 RESULTADO FINAL: ${passed}/${total} TESTES APROVADOS!`);
console.log("=======================================================\n");

if (passed !== total) {
  process.exit(1);
}
