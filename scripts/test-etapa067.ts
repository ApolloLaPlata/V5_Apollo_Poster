/**
 * scripts/test-etapa067.ts - Suíte de Validação da Etapa 067
 * Mecanismo de Throttling e Fila Anti-Ban (Taxa Máxima 30 DMs/min e Jitter 2s-5s)
 * Capitania #13: V5 Apollo Poster (:3011)
 */

import assert from "node:assert";
import { 
  AntiBanThrottler,
  DEFAULT_THROTTLER_CONFIG
} from "../src/lib/comments/antiBanThrottler";

console.log("🧪 Iniciando Validação da Etapa 067: Mecanismo de Throttling e Fila Anti-Ban...\n");

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
// GRUPO 1: Cálculo de Jitter Randômico Estocástico (calculateJitter)
// -------------------------------------------------------------
test("1.1 Jitter permanece estritamente dentro da faixa configurada (2000ms a 5000ms)", () => {
  const throttler = new AntiBanThrottler();
  const samples: number[] = [];

  for (let i = 0; i < 100; i++) {
    const jitter = throttler.calculateJitter(2000, 5000);
    assert.ok(jitter >= 2000, `Jitter ${jitter} menor que o mínimo de 2000ms`);
    assert.ok(jitter <= 5000, `Jitter ${jitter} maior que o máximo de 5000ms`);
    samples.push(jitter);
  }

  // Verifica que existe variância estocástica (não é valor fixo)
  const uniqueSamples = new Set(samples);
  assert.ok(uniqueSamples.size > 20, "O jitter deve ter distribuição variável");
});

// -------------------------------------------------------------
// GRUPO 2: Janela Deslizante de 60 Segundos e Limite de 30 DMs/min
// -------------------------------------------------------------
test("2.1 Permite disparos imediatos enquanto a janela não atingir 30 DMs/min", () => {
  const throttler = new AntiBanThrottler({ maxDmsPerMinute: 30 });
  const now = Date.now();

  assert.strictEqual(throttler.canDispatchNow(now), true);
  assert.strictEqual(throttler.getWaitTimeUntilAvailableSlotMs(now), 0);

  // Simula 29 disparos na mesma janela
  for (let i = 0; i < 29; i++) {
    throttler.recordSuccessfulDispatch(now);
  }

  // 30º disparo ainda é permitido
  assert.strictEqual(throttler.canDispatchNow(now), true);
  throttler.recordSuccessfulDispatch(now);

  // 31º disparo é bloqueado pela janela de 60s
  assert.strictEqual(throttler.canDispatchNow(now), false);
  const waitMs = throttler.getWaitTimeUntilAvailableSlotMs(now);
  assert.ok(waitMs > 0 && waitMs <= 60000, `Tempo de espera ${waitMs}ms deve ser <= 60000ms`);
});

test("2.2 Libera novos disparos após expiração da janela de 60 segundos", () => {
  const throttler = new AntiBanThrottler({ maxDmsPerMinute: 30 });
  const t0 = 100000;

  // Enche a janela no tempo t0
  for (let i = 0; i < 30; i++) {
    throttler.recordSuccessfulDispatch(t0);
  }
  assert.strictEqual(throttler.canDispatchNow(t0), false);

  // No tempo t0 + 61 segundos (61.000 ms), a janela já expirou e libera slots
  const t1 = t0 + 61000;
  assert.strictEqual(throttler.canDispatchNow(t1), true);
  assert.strictEqual(throttler.getWaitTimeUntilAvailableSlotMs(t1), 0);
});

// -------------------------------------------------------------
// GRUPO 3: Fila de Tarefas com Priorização (enqueue & dequeueNext)
// -------------------------------------------------------------
test("3.1 Enfileira tarefas e respeita prioridade alta sobre normal", () => {
  const throttler = new AntiBanThrottler();

  throttler.enqueue({
    ruleId: "r1",
    commentId: "c1",
    username: "@user1",
    commentText: "link",
    dmMessage: "dm1",
    publicReply: "rep1",
    priority: "normal"
  });

  throttler.enqueue({
    ruleId: "r2",
    commentId: "c2",
    username: "@user2_vip",
    commentText: "quero urgente",
    dmMessage: "dm2",
    publicReply: "rep2",
    priority: "high"
  });

  throttler.enqueue({
    ruleId: "r3",
    commentId: "c3",
    username: "@user3",
    commentText: "promo",
    dmMessage: "dm3",
    publicReply: "rep3",
    priority: "low"
  });

  // A tarefa 'high' deve ser a primeira a ser desenfileirada
  const first = throttler.dequeueNext();
  assert.strictEqual(first?.username, "@user2_vip");
  assert.strictEqual(first?.priority, "high");

  const second = throttler.dequeueNext();
  assert.strictEqual(second?.username, "@user1");

  const third = throttler.dequeueNext();
  assert.strictEqual(third?.username, "@user3");

  assert.strictEqual(throttler.dequeueNext(), null);
});

// -------------------------------------------------------------
// GRUPO 4: Backoff Exponencial sob Erro 429 / Rate Limit Meta
// -------------------------------------------------------------
test("4.1 Dispara backoff exponencial dobrando o intervalo sob erros sucessivos", () => {
  const throttler = new AntiBanThrottler({ backoffBaseMs: 5000, maxBackoffMs: 60000 });
  const t0 = 200000;

  // Primeiro erro: 5.000 ms
  const delay1 = throttler.triggerBackoff(t0);
  assert.strictEqual(delay1, 5000);
  assert.strictEqual(throttler.canDispatchNow(t0 + 2000), false);
  assert.strictEqual(throttler.canDispatchNow(t0 + 5100), true);

  // Segundo erro: 10.000 ms (dobra)
  const delay2 = throttler.triggerBackoff(t0);
  assert.strictEqual(delay2, 10000);

  // Sucesso reseta a penalidade
  throttler.recordSuccessfulDispatch(t0 + 15000);
  const metrics = throttler.getMetrics(t0 + 15000);
  assert.strictEqual(metrics.isPausedForBackoff, false);
});

// -------------------------------------------------------------
// GRUPO 5: Métricas de Telemetria e Status Anti-Ban (getMetrics)
// -------------------------------------------------------------
test("5.1 Métricas refletem o consumo da capacidade em tempo real", () => {
  const throttler = new AntiBanThrottler({ maxDmsPerMinute: 30 });
  const now = Date.now();

  // Estado inicial: optimal
  let m = throttler.getMetrics(now);
  assert.strictEqual(m.safetyStatus, "optimal");
  assert.strictEqual(m.dmsInLastMinute, 0);

  // Simula 20 disparos (66% de uso): moderate
  for (let i = 0; i < 20; i++) {
    throttler.recordSuccessfulDispatch(now);
  }
  m = throttler.getMetrics(now);
  assert.strictEqual(m.safetyStatus, "moderate");
  assert.strictEqual(m.dmsInLastMinute, 20);
  assert.ok(m.capacityUtilizationPercent > 60);

  // Simula mais 8 disparos (28/30 = 93%): near_limit
  for (let i = 0; i < 8; i++) {
    throttler.recordSuccessfulDispatch(now);
  }
  m = throttler.getMetrics(now);
  assert.strictEqual(m.safetyStatus, "near_limit");
});

console.log(`\n🎉 Todos os ${passed} testes da Etapa 067 passaram com 100% de sucesso!`);
