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
import { matchCommentTrigger, compileTriggerRegex } from "../src/lib/comments/triggerMatcher";
import { validateAntiSpamDiversity, getNextPublicReply } from "../src/lib/comments/publicReplyRotator";
import { validateDmTemplate, compileDmMessage } from "../src/lib/comments/dmTemplateBuilder";
import { calculateHistoryMetrics, createBroadcastReceipt } from "../src/lib/finders/broadcastHistoryManager";
import { compileEmailHtml } from "../src/lib/dispatch/multimodalEngine";
import { sortQueueFifo } from "../src/lib/queue/dispatchQueue";
import { useToastStore, toast } from "../src/lib/toast/useToast";

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

// 7. Hardening de Gatilhos Cognitivos Comment-to-DM (Anti-Falsos Positivos)
console.log("\n--- 7. Hardening de Gatilhos Cognitivos (ChatbotX) ---");
const emptyKwMatch = matchCommentTrigger("Qualquer comentário aqui", ["", "   ", "!!!"]);
assert(emptyKwMatch.isMatch === false, "Keywords vazias ou só de símbolos não ativam gatilho falso");

const emptyRegexCompile = compileTriggerRegex("!!!");
assert(!emptyRegexCompile.test("comentário qualquer"), "Regex compilada para keyword inválida nunca casa");

const borderMatchBlink = matchCommentTrigger("Eu vi o blink do led", ["link"]);
assert(borderMatchBlink.isMatch === false, "Proteção de fronteira \\b: 'blink' não ativa 'link'");

const validMatchLink = matchCommentTrigger("Manda o link pfv!", ["link"]);
assert(validMatchLink.isMatch === true, "Comentário com 'link' ativa gatilho com sucesso");

const invalidRegexFallback = matchCommentTrigger("teste regex", ["[unclosed-bracket"], { mode: "regex" });
assert(invalidRegexFallback.isMatch === false, "Regex com sintaxe inválida não causa crash e retorna isMatch false");

// 8. Robustez do Rotacionador de Respostas Públicas e Construtor de DM
console.log("\n--- 8. Robustez de Respostas Públicas e Templates de DM ---");
const nullVariantsHealth = validateAntiSpamDiversity(null as any);
assert(nullVariantsHealth.status === "critical", "validateAntiSpamDiversity aceita null sem crash e reporta critical");
assert(nullVariantsHealth.variantCount === 0, "Contador de variantes zero para null");

const nullVariantsReply = getNextPublicReply(null as any);
assert(typeof nullVariantsReply.reply === "string" && nullVariantsReply.reply.length > 0, "getNextPublicReply retorna fallback seguro para array nulo");

const emptyDmValidation = validateDmTemplate("");
assert(emptyDmValidation.isValid === false, "Template de DM vazio marcado como inválido");
assert(emptyDmValidation.warnings.some(w => w.includes("vazio")), "Reporta aviso explícito de template vazio");

const compiledDm = compileDmMessage("Olá {{nome}}! Veja o link {{ctaUrl}}", { name: "Apollo", ctaUrl: "https://v5apollo.com" });
assert(compiledDm.includes("Apollo") && compiledDm.includes("https://v5apollo.com"), "Compilação de DM substitui placeholders corretamente");

// 9. Resiliência do Histórico de Transmissão e Compilador HTML de E-mail
console.log("\n--- 9. Resiliência de Histórico VIP e Compilador E-mail ---");
const emptyMetrics = calculateHistoryMetrics([]);
assert(emptyMetrics.totalDispatchedDeals === 0, "calculateHistoryMetrics retorna 0 para array vazio");
assert(emptyMetrics.successRatePercent === 100, "Taxa de sucesso segura 100% para histórico vazio");

const mockEntryWithoutChannels = {
  id: "hist-1",
  dealId: "deal-1",
  productName: "Item Teste",
  store: "Shopee" as const,
  originalPrice: 100,
  promoPrice: 50,
  savingsAmount: 50,
  discountPercentage: 50,
  affiliateUrl: "https://shopee.com.br",
  shortUrl: "https://v5p.st/1",
  targetChannels: undefined as any,
  estimatedReach: 1000,
  dispatchedAt: "2026-10-27T10:00:00Z",
  status: "delivered" as const,
  receipt: {} as any
};
const metricsWithUndefChannels = calculateHistoryMetrics([mockEntryWithoutChannels]);
assert(metricsWithUndefChannels.totalDispatchedDeals === 1, "Processa entrada com targetChannels undefined sem crash");
assert(metricsWithUndefChannels.byChannel.telegram === 0, "Contagem segura para canais omitidos");

const mockDealWithoutChannels = {
  id: "deal-mock-1",
  productName: "Oferta Teste",
  store: "Amazon" as const,
  originalPrice: 200,
  promoPrice: 100,
  discountPercentage: 50,
  affiliateUrl: "https://amazon.com.br",
  targetChannels: undefined as any,
  scheduledTime: "2026-10-27T12:00:00",
  status: "pending" as const
};
const receiptUndef = createBroadcastReceipt(mockDealWithoutChannels);
assert(receiptUndef.receiptId.startsWith("RCPT-"), "Gera comprovante mesmo com targetChannels undefined");
assert(receiptUndef.channelsSentCount === 0, "Contagem de canais segura 0");

const payloadWithoutEmailOptions = {
  id: "art-1",
  title: "Artigo Sem Email Options",
  slug: "artigo-sem-email-options",
  summary: "Resumo do artigo",
  contentMarkdown: "# Titulo\n\nConteudo do post."
} as any;
const htmlResult = compileEmailHtml(payloadWithoutEmailOptions);
assert(typeof htmlResult === "string" && htmlResult.includes("<!DOCTYPE html>"), "compileEmailHtml tolera payload sem emailOptions sem crash");

// 10. Robustez de Fila FIFO com Timestamps Incompletos e Toast Store
console.log("\n--- 10. Robustez de Fila FIFO e Toast Timers ---");
const queueWithMissingTimes = [
  { id: "q1", priority: "normal", status: "published", updatedAt: undefined as any },
  { id: "q2", priority: "urgent", status: "scheduled", scheduledFor: undefined as any },
  { id: "q3", priority: "high", status: "queued", scheduledFor: "2026-10-27T10:00:00" }
] as any;
const sortedIncomplete = sortQueueFifo(queueWithMissingTimes);
assert(sortedIncomplete.length === 3, "sortQueueFifo não quebra com timestamps undefined");
assert(sortedIncomplete[0].id === "q2" || sortedIncomplete[0].id === "q3", "Itens ativos permanecem no topo mesmo com campos incompletos");

toast.info("Toast de Teste", "Mensagem de teste");
const initialToasts = useToastStore.getState().toasts;
assert(initialToasts.length >= 1, "Adiciona toast com id gerado");
const addedId = initialToasts[initialToasts.length - 1].id;
useToastStore.getState().removeToast(addedId);
const afterRemoveToasts = useToastStore.getState().toasts;
assert(!afterRemoveToasts.some(t => t.id === addedId), "Remove toast e limpa timer ativo sem vazamento");

console.log("\n=======================================================");
console.log(`📊 RESULTADO FINAL: ${passed}/${total} TESTES APROVADOS!`);
console.log("=======================================================\n");

if (passed !== total) {
  process.exit(1);
}
