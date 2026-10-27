/**
 * test-etapa086.ts - Teste de Validação da Etapa 086
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Validação do Painel Visual de Fila de Background no Dashboard:
 * - Exportação e integridade do componente BackgroundQueueDashboard
 * - Suporte à nova aba "queue" em PosterTab no Zustand Store
 * - Separação visual de seções: processing, scheduled (FIFO), aguardando retry, concluídos
 * - Métricas do Dashboard: Total em Fila, Em Processamento, Aguardando Retry, Tempo Médio
 * - Verificação de integração em src/app/page.tsx
 */

import React from "react";
import fs from "fs";
import path from "path";
import { BackgroundQueueDashboard } from "../src/components/poster/BackgroundQueueDashboard";
import { usePosterStore, PosterTab } from "../src/store/usePosterStore";
import { getQueueStats } from "../src/lib/queue/dispatchQueue";
import { QueueItem } from "../src/types/poster";

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
console.log("TESTE ETAPA 086: PAINEL VISUAL DE FILA DE BACKGROUND");
console.log("=======================================================\n");

// 1. Integridade do Componente React
console.log("1. Validando Componente BackgroundQueueDashboard...");
assert(typeof BackgroundQueueDashboard === "function", "BackgroundQueueDashboard é um componente funcional React válido");

// 2. Suporte à Aba 'queue' no Zustand Store
console.log("\n2. Validando Navegação e Estado da Aba 'queue'...");
const store = usePosterStore.getState();
const initialTab = store.activeTab;

store.setActiveTab("queue");
assert(usePosterStore.getState().activeTab === "queue", "Zustand Store aceita 'queue' como PosterTab ativo");

// Retorna para aba anterior
store.setActiveTab(initialTab);

// 3. Separação de Seções e Dados Visuais da Fila
console.log("\n3. Validando Lógica de Separação de Seções da Fila...");
const mockVisualQueue: QueueItem[] = [
  {
    id: "q_proc_1",
    entityId: "e1",
    entityType: "post",
    title: "Post em Processamento",
    platforms: ["autoblog"],
    scheduledFor: "2026-10-27T10:00:00Z",
    priority: "urgent",
    status: "processing",
    attempts: 1,
    maxAttempts: 3,
    createdAt: "2026-10-27T09:00:00Z",
    updatedAt: "2026-10-27T10:00:00Z"
  },
  {
    id: "q_sched_1",
    entityId: "e2",
    entityType: "deal",
    title: "Oferta Agendada FIFO 1",
    platforms: ["telegram"],
    scheduledFor: "2026-10-27T10:15:00Z",
    priority: "high",
    status: "scheduled",
    attempts: 0,
    maxAttempts: 3,
    createdAt: "2026-10-27T09:00:00Z",
    updatedAt: "2026-10-27T09:00:00Z"
  },
  {
    id: "q_retry_1",
    entityId: "e3",
    entityType: "post",
    title: "Post Aguardando Backoff",
    platforms: ["instagram"],
    scheduledFor: "2026-10-27T10:05:00Z",
    nextAttemptAt: "2026-10-27T10:05:00Z",
    priority: "normal",
    status: "queued",
    attempts: 1,
    maxAttempts: 3,
    createdAt: "2026-10-27T09:00:00Z",
    updatedAt: "2026-10-27T10:00:00Z"
  },
  {
    id: "q_pub_1",
    entityId: "e4",
    entityType: "post",
    title: "Post Publicado com Sucesso",
    platforms: ["newsletter"],
    scheduledFor: "2026-10-27T08:00:00Z",
    priority: "normal",
    status: "published",
    attempts: 1,
    maxAttempts: 3,
    createdAt: "2026-10-27T07:00:00Z",
    updatedAt: "2026-10-27T08:00:10Z",
    completedAt: "2026-10-27T08:00:10Z"
  }
];

const processingSection = mockVisualQueue.filter((i) => i.status === "processing");
const scheduledOrQueued = mockVisualQueue.filter((i) => i.status === "scheduled" || i.status === "queued");
const awaitingRetry = mockVisualQueue.filter((i) => i.status === "queued" && Boolean(i.nextAttemptAt));
const finishedSection = mockVisualQueue.filter((i) => i.status === "published" || i.status === "failed");

assert(processingSection.length === 1, "Detectou exatamente 1 item na seção de processamento ativo");
assert(processingSection[0].id === "q_proc_1", "Item em processamento identificado");
assert(scheduledOrQueued.length === 2, "Detectou 2 itens na seção de fila FIFO");
assert(awaitingRetry.length === 1, "Detectou 1 item aguardando retry com backoff");
assert(finishedSection.length === 1, "Detectou 1 item na seção de concluídos");

// 4. Métricas e Telemetria do Dashboard
console.log("\n4. Validando Métricas do Painel da Fila (getQueueStats)...");
const stats = getQueueStats(mockVisualQueue);
assert(stats.totalItems === 4, "Total de 4 itens monitorados");
assert(stats.processingCount === 1, "1 item em processamento");
assert(stats.scheduledCount === 1, "1 item agendado");
assert(stats.queuedCount === 1, "1 item em espera");
assert(stats.publishedCount === 1, "1 item publicado");
assert(stats.activeCount === 3, "3 itens ativos na fila total");
assert(stats.averageWaitTimeSeconds === 45, "Tempo médio estimado de espera de 45s (3 ativos * 15s)");

// 5. Integração no Layout Principal (src/app/page.tsx)
console.log("\n5. Validando Integração no Layout (src/app/page.tsx)...");
const pagePath = path.resolve(process.cwd(), "src/app/page.tsx");
const pageContent = fs.readFileSync(pagePath, "utf-8");

assert(pageContent.includes("BackgroundQueueDashboard"), "page.tsx importa o BackgroundQueueDashboard");
assert(pageContent.includes('activeTab === "queue"'), "page.tsx possui renderização condicional da aba 'queue'");
assert(pageContent.includes("Fila Background"), "page.tsx possui botão de navegação com rótulo 'Fila Background'");
assert(pageContent.includes("activeQueueCount"), "page.tsx calcula badge de itens ativos da fila");

console.log("\n=======================================================");
console.log(`TOTAL DE ASSERÇÕES: ${passed + failed}`);
console.log(`PASSOU: ${passed}`);
console.log(`FALHOU: ${failed}`);
console.log("=======================================================\n");

if (failed === 0) {
  console.log("✅ TODOS OS TESTES DA ETAPA 086 FORAM APROVADOS COM SUCESSO!");
  process.exit(0);
} else {
  console.error("❌ FALHA NOS TESTES DA ETAPA 086.");
  process.exit(1);
}
