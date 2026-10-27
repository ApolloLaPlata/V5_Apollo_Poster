/**
 * test-etapa082.ts - Teste de Validação da Etapa 082
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Validação do Motor de Verificação de Posts Vencidos (overdueScanner.ts):
 * - Intervalo oficial de 60 segundos (DEFAULT_POLLING_INTERVAL_MS = 60000)
 * - Detecção pura de itens de fila vencidos (detectOverdueQueueItems)
 * - Detecção pura de posts agendados vencidos (detectOverduePosts)
 * - Formatação de contagem regressiva visual (formatTimeUntilNextTick)
 * - Ciclo de vida do motor: start, pause, resume, stop
 * - Execução de ticks de varredura atômica e disparo de listeners
 * - Proteção de concorrência e trava anti-reentrância
 * - Integração completa com Zustand Store (usePosterStore)
 */

import {
  DEFAULT_POLLING_INTERVAL_MS,
  detectOverdueQueueItems,
  detectOverduePosts,
  formatTimeUntilNextTick,
  createOverdueScanner,
  OverdueScanner,
  TickResult
} from "../src/lib/queue/overdueScanner";
import { QueueItem, ScheduledPost } from "../src/types/poster";
import { usePosterStore } from "../src/store/usePosterStore";

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
console.log("TESTE ETAPA 082: MOTOR DE VERIFICAÇÃO DE POSTS VENCIDOS");
console.log("=======================================================\n");

// 1. Constante Oficial de Polling de 60 Segundos
console.log("1. Validando DEFAULT_POLLING_INTERVAL_MS...");
assert(DEFAULT_POLLING_INTERVAL_MS === 60000, "Intervalo padrão fixo em 60.000 ms (60s)");

// 2. Detecção de Itens de Fila Vencidos (detectOverdueQueueItems)
console.log("\n2. Validando detectOverdueQueueItems...");
const now = new Date("2026-10-27T15:00:00.000Z");

const sampleQueue: QueueItem[] = [
  {
    id: "q_past_1",
    entityId: "e1",
    entityType: "post",
    title: "Post Vencido 1",
    platforms: ["autoblog"],
    scheduledFor: "2026-10-27T14:30:00.000Z", // 30 min atrás
    priority: "normal",
    status: "scheduled",
    attempts: 0,
    maxAttempts: 3,
    createdAt: "2026-10-27T10:00:00.000Z",
    updatedAt: "2026-10-27T10:00:00.000Z"
  },
  {
    id: "q_past_2",
    entityId: "e2",
    entityType: "deal",
    title: "Oferta Vencida 2",
    platforms: ["telegram"],
    scheduledFor: "2026-10-27T15:00:00.000Z", // Exatamente agora
    priority: "urgent",
    status: "queued",
    attempts: 0,
    maxAttempts: 3,
    createdAt: "2026-10-27T10:00:00.000Z",
    updatedAt: "2026-10-27T10:00:00.000Z"
  },
  {
    id: "q_future_1",
    entityId: "e3",
    entityType: "post",
    title: "Post Futuro",
    platforms: ["instagram"],
    scheduledFor: "2026-10-27T16:00:00.000Z", // Futuro
    priority: "high",
    status: "scheduled",
    attempts: 0,
    maxAttempts: 3,
    createdAt: "2026-10-27T10:00:00.000Z",
    updatedAt: "2026-10-27T10:00:00.000Z"
  },
  {
    id: "q_past_published",
    entityId: "e4",
    entityType: "post",
    title: "Post Já Publicado",
    platforms: ["newsletter"],
    scheduledFor: "2026-10-27T14:00:00.000Z",
    priority: "normal",
    status: "published", // Já publicado, não deve vencer novamente
    attempts: 1,
    maxAttempts: 3,
    createdAt: "2026-10-27T10:00:00.000Z",
    updatedAt: "2026-10-27T14:00:10.000Z"
  }
];

const overdueQueue = detectOverdueQueueItems(sampleQueue, now);
assert(overdueQueue.length === 2, "Detectou exatamente os 2 itens de fila vencidos");
assert(overdueQueue.some((i) => i.id === "q_past_1"), "Item de 30 minutos atrás incluído");
assert(overdueQueue.some((i) => i.id === "q_past_2"), "Item exatamente no horário atual incluído");
assert(!overdueQueue.some((i) => i.id === "q_future_1"), "Item futuro excluído da lista de vencidos");
assert(!overdueQueue.some((i) => i.id === "q_past_published"), "Item já publicado excluído da lista de vencidos");

// Tolerância de relógio (toleranceMs)
const nearFutureOverdue = detectOverdueQueueItems(sampleQueue, "2026-10-27T15:55:00.000Z", 10 * 60 * 1000); // +10min de tolerância
assert(nearFutureOverdue.some((i) => i.id === "q_future_1"), "Tolerância de tempo incluiu item da margem temporal");

// 3. Detecção de Posts Tradicionais Vencidos (detectOverduePosts)
console.log("\n3. Validando detectOverduePosts...");
const samplePosts: ScheduledPost[] = [
  {
    id: "p_past",
    title: "Post Tradicional Vencido",
    content: "Conteúdo...",
    platforms: ["autoblog"],
    scheduledAt: "2026-10-27T14:00:00",
    status: "scheduled",
    tags: []
  },
  {
    id: "p_future",
    title: "Post Tradicional Futuro",
    content: "Conteúdo...",
    platforms: ["instagram"],
    scheduledAt: "2026-10-27T18:00:00",
    status: "scheduled",
    tags: []
  },
  {
    id: "p_already_published",
    title: "Post Publicado",
    content: "Conteúdo...",
    platforms: ["tiktok"],
    scheduledAt: "2026-10-27T13:00:00",
    status: "published",
    tags: []
  }
];

const overduePosts = detectOverduePosts(samplePosts, now);
assert(overduePosts.length === 1, "Detectou exatamente 1 post tradicional vencido");
assert(overduePosts[0].id === "p_past", "ID correto do post vencido detectado");

// 4. Formatação de Contagem Regressiva (formatTimeUntilNextTick)
console.log("\n4. Validando formatTimeUntilNextTick...");
assert(formatTimeUntilNextTick(45000) === "45s", "Formata 45.000 ms como '45s'");
assert(formatTimeUntilNextTick(60000) === "1m 00s", "Formata 60.000 ms como '1m 00s'");
assert(formatTimeUntilNextTick(85000) === "1m 25s", "Formata 85.000 ms como '1m 25s'");
assert(formatTimeUntilNextTick(0) === "Agora", "Formata 0 ms como 'Agora'");
assert(formatTimeUntilNextTick(-500) === "Agora", "Formata negativo como 'Agora'");

// 5. Ciclo de Vida do Motor (OverdueScanner)
console.log("\n5. Validando Ciclo de Vida do Motor (start, pause, resume, stop)...");
const scanner = createOverdueScanner({
  intervalMs: 60000,
  getQueue: () => sampleQueue,
  getPosts: () => samplePosts
});

const initialState = scanner.getState();
assert(initialState.status === "idle", "Estado inicial é 'idle'");
assert(initialState.totalTicks === 0, "0 ticks iniciais");

scanner.start();
const runningState = scanner.getState();
assert(runningState.status === "running", "Transitou para 'running' após start()");
assert(runningState.isRunning === true, "isRunning é true");
assert(Boolean(runningState.nextTickAt), "nextTickAt preenchido ao iniciar");
assert(scanner.getTimeUntilNextTick() > 0, "Tempo restante para o próximo tick é positivo");

scanner.pause();
const pausedState = scanner.getState();
assert(pausedState.status === "paused", "Transitou para 'paused'");
assert(pausedState.isRunning === false, "isRunning é false em pausa");

scanner.resume();
const resumedState = scanner.getState();
assert(resumedState.status === "running", "Retomou para 'running' com resume()");

scanner.stop();
const stoppedState = scanner.getState();
assert(stoppedState.status === "stopped", "Parou completamente com stop()");
assert(stoppedState.isRunning === false, "isRunning é false após stop()");

// 6. Varredura com tick() e Disparo de Callbacks
console.log("\n6. Validando Execução do tick() e Callbacks...");
const testScanner = createOverdueScanner({
  getQueue: () => sampleQueue,
  getPosts: () => samplePosts
});

const callbackFlags = {
  tickReceived: false,
  overdueReceived: false
};
let capturedTickResult: TickResult | null = null;
let capturedOverdueCount = 0;

testScanner.onTick((result) => {
  callbackFlags.tickReceived = true;
  capturedTickResult = result;
});

testScanner.onOverdueDetected((qItems, pItems, res) => {
  callbackFlags.overdueReceived = true;
  capturedOverdueCount = qItems.length + pItems.length;
});

const result = testScanner.tick(now);
assert(callbackFlags.tickReceived === true, "Listener de onTick invocado com sucesso");
assert(callbackFlags.overdueReceived === true, "Listener de onOverdueDetected invocado com sucesso");
assert(capturedTickResult !== null, "TickResult capturado");
assert(result.tickNumber === 1, "Número do tick é 1");
assert(result.totalOverdue === 3, "Detectou total de 3 itens vencidos (2 fila + 1 post)");
assert(capturedOverdueCount === 3, "Listener de overdue recebeu exatamente 3 itens");
assert(result.durationMs >= 0, "Duração do tick medida em milissegundos");

// 7. Proteção de Concorrência e Trava Anti-reentrância
console.log("\n7. Validando Trava de Reentrância (isProcessingLock)...");
// Simula lock manual
(testScanner as any).isProcessingLock = true;
const lockedResult = testScanner.tick(now);
assert(lockedResult.tickId.startsWith("tick_skipped_"), "Tick concorrente pulado e identificado com 'tick_skipped_'");
assert(lockedResult.totalOverdue === 0, "Tick bloqueado não executa processamento duplicado");
(testScanner as any).isProcessingLock = false;

// 8. Integração com Zustand Store
console.log("\n8. Validando Integração no Zustand Store (usePosterStore)...");
const store = usePosterStore.getState();
const storeScanner = createOverdueScanner({
  getQueue: () => usePosterStore.getState().dispatchQueue,
  getPosts: () => usePosterStore.getState().posts
});

// Executa varredura referenciando uma data futura ampla (ex: 2026-10-30) para capturar seeds
const futureDate = "2026-10-30T00:00:00.000Z";
const storeResult = storeScanner.tick(futureDate);
assert(storeResult.totalOverdue > 0, `Varredura detectou itens agendados no store (${storeResult.totalOverdue} encontrados)`);
assert(storeScanner.getState().totalTicks === 1, "Total de ticks do scanner sincronizado com o store");

console.log("\n=======================================================");
console.log(`TOTAL DE ASSERÇÕES: ${passed + failed}`);
console.log(`PASSOU: ${passed}`);
console.log(`FALHOU: ${failed}`);
console.log("=======================================================\n");

if (failed === 0) {
  console.log("✅ TODOS OS TESTES DA ETAPA 082 FORAM APROVADOS COM SUCESSO!");
  process.exit(0);
} else {
  console.error("❌ FALHA NOS TESTES DA ETAPA 082.");
  process.exit(1);
}
