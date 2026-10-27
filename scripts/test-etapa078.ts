/**
 * test-etapa078.ts - Teste de Validação da Etapa 078
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Validação do Botão de Disparo Instantâneo e Agendamento em Lote VIP:
 * - Conversor e validador de horários (parseTimeSlot / formatTimeSlot)
 * - Algoritmo de distribuição cronológica de slots (calculateBatchScheduleSlots)
 * - Resumo e filtragem de ofertas elegíveis para lote (getBatchSelectionSummary / filterEligibleDealsForDispatch)
 * - Atualização atômica de status e preenchimento de timestamp sentAt no Zustand
 */

import {
  parseTimeSlot,
  formatTimeSlot,
  calculateBatchScheduleSlots,
  getBatchSelectionSummary,
  filterEligibleDealsForDispatch,
  BatchScheduleConfig
} from "../src/lib/finders/batchDispatcher";
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
console.log("TESTE ETAPA 078: DISPARO INSTANTÂNEO & AGENDAMENTO EM LOTE");
console.log("=======================================================\n");

// 1. Validando parseTimeSlot e formatTimeSlot
console.log("1. Validando parseTimeSlot e formatTimeSlot...");
const t1 = parseTimeSlot("14:45");
assert(t1.hours === 14 && t1.minutes === 45, "parseTimeSlot converte '14:45' corretamente");

const t2 = parseTimeSlot("08:05");
assert(t2.hours === 8 && t2.minutes === 5, "parseTimeSlot converte '08:05' com zero à esquerda");

const tFallback = parseTimeSlot("invalido");
assert(tFallback.hours === 12 && tFallback.minutes === 0, "parseTimeSlot aplica fallback para 12:00 em string inválida");

assert(formatTimeSlot(9, 5) === "09:05", "formatTimeSlot preenche zeros à esquerda '09:05'");
assert(formatTimeSlot(23, 59) === "23:59", "formatTimeSlot formata 23:59");
assert(formatTimeSlot(25, 10) === "01:10", "formatTimeSlot lida com overflow de 24h (25h -> 01h)");

// 2. Validando Distribuição de Slots de Agendamento em Lote (calculateBatchScheduleSlots)
console.log("\n2. Validando calculateBatchScheduleSlots...");
const sampleDeals: GroupBroadcastDeal[] = [
  {
    id: "deal-1",
    productName: "Monitor Gamer 27\"",
    store: "Shopee",
    originalPrice: 1200,
    promoPrice: 800,
    discountPercentage: 33,
    affiliateUrl: "https://shope.ee/1",
    targetChannels: ["whatsapp", "telegram"],
    scheduledTime: "12:00",
    status: "pending",
    estimatedReach: 56354
  },
  {
    id: "deal-2",
    productName: "Air Fryer Inox",
    store: "Mercado Livre",
    originalPrice: 400,
    promoPrice: 200,
    discountPercentage: 50,
    affiliateUrl: "https://mercadolivre.com.br/2",
    targetChannels: ["telegram"],
    scheduledTime: "12:00",
    status: "pending",
    estimatedReach: 52500
  },
  {
    id: "deal-3",
    productName: "Echo Dot Alexa",
    store: "Amazon",
    originalPrice: 429,
    promoPrice: 289,
    discountPercentage: 33,
    affiliateUrl: "https://amzn.to/3",
    targetChannels: ["whatsapp"],
    scheduledTime: "12:00",
    status: "sent",
    estimatedReach: 3854
  }
];

const config30m: BatchScheduleConfig = {
  startTime: "14:00",
  intervalMinutes: 30
};

const slots = calculateBatchScheduleSlots(sampleDeals, config30m);
assert(slots.length === 3, "Retorna exatamente 3 slots para 3 ofertas");
assert(slots[0].scheduledTime === "14:00", "Oferta 1 agendada para 14:00");
assert(slots[1].scheduledTime === "14:30", "Oferta 2 agendada para 14:30 (+30 min)");
assert(slots[2].scheduledTime === "15:00", "Oferta 3 agendada para 15:00 (+60 min)");
assert(slots[0].sequenceIndex === 1 && slots[2].sequenceIndex === 3, "Índices de sequência atribuídos corretamente");

// Teste de virada de dia (meia-noite)
const configMidnight: BatchScheduleConfig = {
  startTime: "23:45",
  intervalMinutes: 20
};
const midnightSlots = calculateBatchScheduleSlots(sampleDeals, configMidnight);
assert(midnightSlots[0].scheduledTime === "23:45", "Primeiro slot às 23:45");
assert(midnightSlots[1].scheduledTime === "00:05", "Segundo slot passa da meia-noite para 00:05");
assert(midnightSlots[2].scheduledTime === "00:25", "Terceiro slot às 00:25");

// 3. Validando Resumo Estatístico de Seleção (getBatchSelectionSummary)
console.log("\n3. Validando getBatchSelectionSummary...");
const selectedAll = ["deal-1", "deal-2", "deal-3"];
const summaryAll = getBatchSelectionSummary(sampleDeals, selectedAll);

assert(summaryAll.selectedCount === 3, "Identifica 3 ofertas selecionadas");
assert(summaryAll.pendingCount === 2, "Identifica 2 ofertas pendentes");
assert(summaryAll.alreadySentCount === 1, "Identifica 1 oferta já enviada");
assert(summaryAll.totalReach === 56354 + 52500 + 3854, `Calcula alcance combinado de ${summaryAll.totalReach} membros`);
assert(summaryAll.canDispatch === true, "canDispatch é true pois há ofertas pendentes");

const selectedOnlySent = ["deal-3"];
const summaryOnlySent = getBatchSelectionSummary(sampleDeals, selectedOnlySent);
assert(summaryOnlySent.pendingCount === 0, "0 pendentes quando seleciona apenas oferta já enviada");
assert(summaryOnlySent.canDispatch === false, "canDispatch é false se não houver pendentes");

// 4. Validando filterEligibleDealsForDispatch
console.log("\n4. Validando filterEligibleDealsForDispatch...");
const eligible = filterEligibleDealsForDispatch(sampleDeals, selectedAll);
assert(eligible.length === 2, "Filtra exatamente as 2 ofertas pendentes");
assert(eligible.every((d) => d.status !== "sent"), "Nenhuma oferta elegível possui status 'sent'");
assert(eligible.some((d) => d.id === "deal-1") && eligible.some((d) => d.id === "deal-2"), "Contém deal-1 e deal-2");

// 5. Validando Estado e Ações no Zustand Store
console.log("\n5. Validando Ações de Despacho no Zustand Store...");
const store = usePosterStore.getState();

// Testa dispatchDeal individual
const initialDeal = sampleDeals[0];
store.addDeal({
  productName: "Teclado Teste Store",
  store: "Shopee",
  originalPrice: 199,
  promoPrice: 99,
  discountPercentage: 50,
  affiliateUrl: "https://shope.ee/testestore",
  targetChannels: ["whatsapp"],
  scheduledTime: "10:00",
  status: "pending"
});

const latestDeals = usePosterStore.getState().deals;
const addedDeal = latestDeals[latestDeals.length - 1];
assert(addedDeal.status === "pending", "Novo deal cadastrado com status 'pending'");

// Dispara individual
usePosterStore.getState().dispatchDeal(addedDeal.id);
const updatedDeal = usePosterStore.getState().deals.find((d) => d.id === addedDeal.id);
assert(updatedDeal?.status === "sent", "dispatchDeal atualiza status para 'sent'");
assert(Boolean(updatedDeal?.sentAt), "dispatchDeal preenche timestamp sentAt");

// Testa dispatchBatchDeals em lote
const dealBatch1 = latestDeals[0]?.id;
const dealBatch2 = latestDeals[1]?.id;
if (dealBatch1 && dealBatch2) {
  usePosterStore.getState().dispatchBatchDeals([dealBatch1, dealBatch2]);
  const stateAfterBatch = usePosterStore.getState().deals;
  const d1 = stateAfterBatch.find((d) => d.id === dealBatch1);
  const d2 = stateAfterBatch.find((d) => d.id === dealBatch2);
  assert(d1?.status === "sent", "dispatchBatchDeals atualiza oferta 1 para 'sent'");
  assert(d2?.status === "sent", "dispatchBatchDeals atualiza oferta 2 para 'sent'");
  assert(Boolean(d1?.sentAt && d2?.sentAt), "dispatchBatchDeals preenche sentAt de todas as ofertas do lote");
}

console.log("\n=======================================================");
console.log(`TOTAL DE ASSERÇÕES: ${passed + failed}`);
console.log(`PASSOU: ${passed}`);
console.log(`FALHOU: ${failed}`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("✅ TODOS OS TESTES DA ETAPA 078 FORAM APROVADOS COM SUCESSO!\n");
  process.exit(0);
}
