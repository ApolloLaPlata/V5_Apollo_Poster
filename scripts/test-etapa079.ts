/**
 * test-etapa079.ts - Teste de Validação da Etapa 079
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Validação do Histórico de Ofertas Disparadas e Confirmação de Transmissão:
 * - Formatador de data e hora no padrão brasileiro (formatDispatchedDate)
 * - Gerador de recibos oficiais de entrega (createBroadcastReceipt) com IDs de mensagem Telegram e WhatsApp
 * - Construtor de entradas de histórico (buildBroadcastHistoryEntry)
 * - Agregador de telemetria consolidada (calculateHistoryMetrics)
 * - Integração completa com Zustand Store e persistência do histórico
 */

import {
  formatDispatchedDate,
  createBroadcastReceipt,
  buildBroadcastHistoryEntry,
  calculateHistoryMetrics,
  INITIAL_BROADCAST_HISTORY,
  BroadcastHistoryEntry
} from "../src/lib/finders/broadcastHistoryManager";
import { usePosterStore } from "../src/store/usePosterStore";
import { GroupBroadcastDeal } from "../src/types/poster";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${label}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${label}`);
  }
}

console.log("\n=======================================================");
console.log("TESTE ETAPA 079: HISTÓRICO DE OFERTAS & CONFIRMAÇÃO VIP");
console.log("=======================================================\n");

// 1. Validando formatDispatchedDate
console.log("1. Validando formatDispatchedDate...");
const isoTest = "2026-10-27T14:35:10.000Z";
const formatted = formatDispatchedDate(isoTest);
assert(formatted.includes("/"), "Contém barras na data");
assert(formatted.includes("às"), "Contém separador 'às' para o horário");
assert(formatDispatchedDate("") === "Recém-disparado", "Fallback amigável para data vazia");

// 2. Validando createBroadcastReceipt
console.log("\n2. Validando createBroadcastReceipt...");
const mockDualDeal: GroupBroadcastDeal = {
  id: "deal-rcpt-1",
  productName: "Cadeira Gamer Ergonômica",
  store: "Shopee",
  originalPrice: 899.90,
  promoPrice: 599.90,
  discountPercentage: 33,
  savingsAmount: 300.00,
  couponCode: "GAMER10",
  affiliateUrl: "https://shope.ee/cadeira",
  shortUrl: "https://v5p.st/d/cadeira",
  targetChannels: ["whatsapp", "telegram"],
  scheduledTime: "16:00",
  status: "pending",
  estimatedReach: 56354
};

const receiptDual = createBroadcastReceipt(mockDualDeal);
assert(receiptDual.receiptId.startsWith("RCPT-"), "ID do recibo inicia com prefixo 'RCPT-'");
assert(receiptDual.telegramConfirmed === true, "telegramConfirmed é true para canal Telegram");
assert(receiptDual.whatsappConfirmed === true, "whatsappConfirmed é true para canal WhatsApp");
assert(Boolean(receiptDual.telegramMessageId && receiptDual.telegramMessageId.startsWith("tg_msg_")), "Gera ID de mensagem válido para Telegram");
assert(Boolean(receiptDual.whatsappMessageId && receiptDual.whatsappMessageId.startsWith("wamid.")), "Gera WAMID de mensagem válido para WhatsApp");
assert(receiptDual.apiStatusCode === 200, "Código de status da API é 200 OK");
assert(receiptDual.deliveryDurationMs > 0, "Latência de entrega positiva");

// Teste com apenas Telegram
const mockTgOnlyDeal: GroupBroadcastDeal = {
  ...mockDualDeal,
  targetChannels: ["telegram"]
};
const receiptTgOnly = createBroadcastReceipt(mockTgOnlyDeal);
assert(receiptTgOnly.telegramConfirmed === true, "Telegram confirmado");
assert(receiptTgOnly.whatsappConfirmed === false, "WhatsApp não confirmado para disparo exclusivo Telegram");
assert(receiptTgOnly.whatsappMessageId === undefined, "Sem WAMID quando WhatsApp não selecionado");

// 3. Validando buildBroadcastHistoryEntry
console.log("\n3. Validando buildBroadcastHistoryEntry...");
const historyEntry = buildBroadcastHistoryEntry(mockDualDeal);
assert(historyEntry.dealId === mockDualDeal.id, "dealId preservado");
assert(historyEntry.productName === mockDualDeal.productName, "productName preservado");
assert(historyEntry.savingsAmount === 300.00, "savingsAmount calculado corretamente");
assert(historyEntry.status === "delivered", "Status definido como 'delivered'");
assert(Boolean(historyEntry.receipt && historyEntry.receipt.receiptId), "Recibo anexado à entrada de histórico");

// 4. Validando calculateHistoryMetrics
console.log("\n4. Validando calculateHistoryMetrics...");
const sampleHistory: BroadcastHistoryEntry[] = [
  ...INITIAL_BROADCAST_HISTORY,
  historyEntry
];

const metrics = calculateHistoryMetrics(sampleHistory);
assert(metrics.totalDispatchedDeals === 4, "Total de disparos concluídos é 4");
assert(metrics.totalMembersReached > 100000, `Audiência total acumulada de ${metrics.totalMembersReached} membros`);
assert(metrics.totalSavingsGenerated > 1000, `Economia acumulada de R$ ${metrics.totalSavingsGenerated}`);
assert(metrics.successRatePercent === 100, "Taxa de sucesso de 100%");
assert(metrics.byStore.Shopee >= 2, "Shopee possui pelo menos 2 registros no histórico");
assert(metrics.byChannel.telegram >= 3, "Telegram possui pelo menos 3 envios registrados");
assert(metrics.byChannel.whatsapp >= 3, "WhatsApp possui pelo menos 3 envios registrados");

// Teste com histórico vazio
const emptyMetrics = calculateHistoryMetrics([]);
assert(emptyMetrics.totalDispatchedDeals === 0, "0 disparos para histórico vazio");
assert(emptyMetrics.totalMembersReached === 0, "0 membros para histórico vazio");
assert(emptyMetrics.totalSavingsGenerated === 0, "0 economia para histórico vazio");

// 5. Validando Registro Automático de Histórico no Zustand Store
console.log("\n5. Validando Registro Automático no Zustand Store...");
const initialStoreHistory = usePosterStore.getState().broadcastHistory;
assert(initialStoreHistory.length >= 3, "Zustand inicializado com seeds de histórico");

// Adiciona oferta e dispara para testar registro de histórico
usePosterStore.getState().addDeal({
  productName: "Headset 7.1 Surround",
  store: "Amazon",
  originalPrice: 350.00,
  promoPrice: 199.90,
  discountPercentage: 43,
  savingsAmount: 150.10,
  affiliateUrl: "https://amzn.to/headset",
  shortUrl: "https://v5p.st/d/headset",
  targetChannels: ["whatsapp", "telegram"],
  scheduledTime: "17:00",
  status: "pending",
  estimatedReach: 56354
});

const latestDeals = usePosterStore.getState().deals;
const headsetDeal = latestDeals[latestDeals.length - 1];

// Dispara individual e verifica se entrou no histórico
usePosterStore.getState().dispatchDeal(headsetDeal.id);
const updatedHistory = usePosterStore.getState().broadcastHistory;
assert(updatedHistory[0].productName === "Headset 7.1 Surround", "Oferta disparada registrada no topo do broadcastHistory");
assert(updatedHistory[0].receipt.apiStatusCode === 200, "Recibo oficial gravado com código 200");

// Testa disparo em lote e registro múltiplo no histórico
const dealsBeforeBatch = usePosterStore.getState().deals;
const id1 = dealsBeforeBatch[0]?.id;
const id2 = dealsBeforeBatch[1]?.id;
if (id1 && id2) {
  const historyLenBefore = usePosterStore.getState().broadcastHistory.length;
  usePosterStore.getState().dispatchBatchDeals([id1, id2]);
  const historyAfterBatch = usePosterStore.getState().broadcastHistory;
  assert(historyAfterBatch.length >= historyLenBefore + 2, "Disparo em lote grava todas as entradas correspondentes no histórico");
}

console.log("\n=======================================================");
console.log(`TOTAL DE ASSERÇÕES: ${passed + failed}`);
console.log(`PASSOU: ${passed}`);
console.log(`FALHOU: ${failed}`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("✅ TODOS OS TESTES DA ETAPA 079 FORAM APROVADOS COM SUCESSO!\n");
  process.exit(0);
}
