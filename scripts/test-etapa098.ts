/**
 * test-etapa098.ts - Teste de Homologação da Etapa 098
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Validações:
 * 1. Validação de palavra-chave de segurança contra expurgo acidental
 * 2. Estratégia de Purge Total (Excluir Todos os Logs)
 * 3. Estratégia Seletiva de Sucessos (Preservar Falhas 4xx/5xx/429)
 * 4. Estratégias Temporais de Poda (Mais antigos que 24h e 7 dias)
 * 5. Integridade de contagens (initialCount, removedCount, remainingLogs)
 */

import {
  validateSecurityConfirmation,
  pruneLogsByStrategy,
  backupLogsBeforePruning
} from "../src/lib/analytics/logPruner";
import { DispatchLogEntry } from "../src/types/poster";

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

console.log("\n=======================================================");
console.log("🚀 INICIANDO TESTES DA ETAPA 098 - LOG PRUNER & SECURITY");
console.log("=======================================================\n");

// 1. Validação de Palavra de Segurança
console.log("--- 1. Validação de Barreira de Confirmação Textual ---");
assert(validateSecurityConfirmation("CONFIRMAR") === true, "Palavra exata 'CONFIRMAR' é aceita");
assert(validateSecurityConfirmation("confirmar") === true, "Minúsculas 'confirmar' são aceitas de forma insensível");
assert(validateSecurityConfirmation("  CONFIRMAR  ") === true, "Espaços antes e depois são sanitizados via trim");
assert(validateSecurityConfirmation("CONFIRMA") === false, "Palavra incompleta é rejeitada");
assert(validateSecurityConfirmation("CANCELAR") === false, "Palavra incorreta é rejeitada");
assert(validateSecurityConfirmation("") === false, "Entrada vazia é rejeitada");

// 2. Amostra de Logs para Testes
const now = new Date("2026-10-27T14:00:00.000Z");
const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString();
const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString();
const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString();

const sampleLogs: DispatchLogEntry[] = [
  {
    id: "l1-recent-success",
    channel: "whatsapp",
    action: "group_broadcast",
    status: "success",
    statusCode: 200,
    message: "Sucesso 1h atrás",
    payloadSummary: "",
    timestamp: oneHourAgo
  },
  {
    id: "l2-recent-fail-429",
    channel: "instagram",
    action: "publish",
    status: "failed",
    statusCode: 429,
    message: "Rate limit 1h atrás",
    payloadSummary: "",
    timestamp: oneHourAgo
  },
  {
    id: "l3-old-25h-success",
    channel: "newsletter",
    action: "publish",
    status: "success",
    statusCode: 201,
    message: "Sucesso 25h atrás",
    payloadSummary: "",
    timestamp: twentyFiveHoursAgo
  },
  {
    id: "l4-old-25h-fail-500",
    channel: "autoblog",
    action: "publish",
    status: "failed",
    statusCode: 500,
    message: "Erro 500 25h atrás",
    payloadSummary: "",
    timestamp: twentyFiveHoursAgo
  },
  {
    id: "l5-ancient-8d-success",
    channel: "telegram",
    action: "group_broadcast",
    status: "success",
    statusCode: 200,
    message: "Sucesso 8 dias atrás",
    payloadSummary: "",
    timestamp: eightDaysAgo
  }
];

// 3. Estratégia: Purge Total ("all")
console.log("\n--- 2. Estratégia de Purge Total ('all') ---");
const purgeAll = pruneLogsByStrategy(sampleLogs, "all", now);
assert(purgeAll.initialCount === 5, "Contagem inicial de 5 itens");
assert(purgeAll.removedCount === 5, "Remove todos os 5 itens");
assert(purgeAll.remainingLogs.length === 0, "Lista remanescente é vazia");

// 4. Estratégia: Apenas Sucessos ("success_only")
console.log("\n--- 3. Estratégia de Apenas Sucessos ('success_only') ---");
const pruneSuccess = pruneLogsByStrategy(sampleLogs, "success_only", now);
assert(pruneSuccess.removedCount === 3, "Remove os 3 registros de sucesso 2xx");
assert(pruneSuccess.remainingLogs.length === 2, "Preserva os 2 registros de falha");
assert(
  pruneSuccess.remainingLogs.every((l) => l.statusCode === 429 || l.statusCode === 500),
  "Todos os logs preservados são exclusivamente falhas (429 e 500)"
);

// 5. Estratégia: Mais Antigos que 24 Horas ("older_than_24h")
console.log("\n--- 4. Estratégia Temporal (> 24 Horas) ---");
const prune24h = pruneLogsByStrategy(sampleLogs, "older_than_24h", now);
// Logs com 25h e 8d devem ser removidos (l3, l4, l5 = 3 logs)
// Logs com 1h devem ser preservados (l1, l2 = 2 logs)
assert(prune24h.removedCount === 3, "Remove 3 logs anteriores a 24 horas");
assert(prune24h.remainingLogs.length === 2, "Preserva 2 logs das últimas 24 horas");
assert(
  prune24h.remainingLogs.every((l) => l.id.includes("recent")),
  "Preserva estritamente logs recentes"
);

// 6. Estratégia: Mais Antigos que 7 Dias ("older_than_7d")
console.log("\n--- 5. Estratégia Temporal (> 7 Dias) ---");
const prune7d = pruneLogsByStrategy(sampleLogs, "older_than_7d", now);
// Apenas o log de 8 dias atrás deve ser removido (l5 = 1 log)
assert(prune7d.removedCount === 1, "Remove exatamente 1 log anterior a 7 dias");
assert(prune7d.remainingLogs.length === 4, "Preserva 4 logs da última semana");
assert(prune7d.removedLogs[0].id === "l5-ancient-8d-success", "Log removido é l5-ancient-8d-success");

// 7. Testes Defensivos e Backup
console.log("\n--- 6. Testes Defensivos e Snapshot de Backup ---");
const emptyPrune = pruneLogsByStrategy([], "all", now);
assert(emptyPrune.initialCount === 0 && emptyPrune.removedCount === 0, "Coleção vazia tratada sem erros");

const emptyBackup = backupLogsBeforePruning([]);
assert(emptyBackup === true, "Backup de coleção vazia retorna sucesso imediato");

const ssrBackup = backupLogsBeforePruning(sampleLogs);
assert(ssrBackup === false, "Ambiente Node/SSR sem window trata download defensivamente retornando false");

console.log("\n=======================================================");
console.log(`📊 RESULTADO FINAL: ${passedTests}/${totalTests} TESTES APROVADOS!`);
console.log("=======================================================\n");

if (passedTests !== totalTests) {
  process.exit(1);
}
