/**
 * test-etapa096.ts - Teste de Homologação da Etapa 096
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Validações:
 * 1. Sanitização e escape de células CSV conforme RFC 4180
 * 2. Nomenclatura determinística de arquivos de auditoria com timestamp
 * 3. Exportação em JSON estruturado com envelope SOC2 / GDPR
 * 4. Exportação em CSV com BOM UTF-8 (\uFEFF) e colunas de telemetria
 * 5. Comportamento defensivo para coleções vazias e ambiente SSR
 */

import {
  escapeCsvCell,
  generateExportFilename,
  exportLogsToJson,
  exportLogsToCsv,
  triggerFileDownload
} from "../src/lib/analytics/auditLogExporter";
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
console.log("🚀 INICIANDO TESTES DA ETAPA 096 - AUDIT LOG EXPORTER");
console.log("=======================================================\n");

// 1. Sanitização e Escape RFC 4180
console.log("--- 1. Escape e Sanitização de Células CSV ---");
assert(escapeCsvCell("Texto Simples") === '"Texto Simples"', "Texto simples é encapsulado entre aspas");
assert(escapeCsvCell('Texto com "Aspas"') === '"Texto com ""Aspas"""', "Aspas internas são duplicadas conforme RFC 4180");
assert(escapeCsvCell("Item, com vírgula") === '"Item, com vírgula"', "Vírgulas preservam integridade da célula");
assert(escapeCsvCell("Linha 1\nLinha 2") === '"Linha 1\nLinha 2"', "Quebras de linha são suportadas");
assert(escapeCsvCell(null) === '""', "Null retorna célula vazia com aspas");
assert(escapeCsvCell(undefined) === '""', "Undefined retorna célula vazia com aspas");
assert(escapeCsvCell(200) === '"200"', "Números são convertidos e encapsulados");

// 2. Nomenclatura de Arquivos
console.log("\n--- 2. Geração Determinística de Nomes de Arquivo ---");
const jsonFilename = generateExportFilename("json");
assert(jsonFilename.startsWith("v5_apollo_dispatch_audit_"), "Nome JSON inicia com prefixo padrão");
assert(jsonFilename.endsWith(".json"), "Nome JSON possui extensão .json");
assert(/\d{8}_\d{6}\.json$/.test(jsonFilename), "Nome JSON possui formato YYYYMMDD_HHmmss.json");

const csvFilename = generateExportFilename("csv", "custom_audit");
assert(csvFilename.startsWith("custom_audit_"), "Nome CSV aceita prefixo customizado");
assert(csvFilename.endsWith(".csv"), "Nome CSV possui extensão .csv");

// Mock de logs para exportação
const sampleLogs: DispatchLogEntry[] = [
  {
    id: "log-export-01",
    channel: "whatsapp",
    action: "group_broadcast",
    status: "success",
    statusCode: 200,
    message: "Oferta Notebook Dell enviada com sucesso!",
    payloadSummary: "R$ 3.499 à vista ou 10x sem juros",
    latencyMs: 75,
    ipAddress: "10.0.1.5",
    retryAttempt: 1,
    remoteMessageId: "wamid.HBgM_TEST_WA_01",
    timestamp: "2026-10-27T14:00:00Z"
  },
  {
    id: "log-export-02",
    channel: "instagram",
    action: "publish",
    status: "failed",
    statusCode: 429,
    message: 'Rate limit excedido: "Too many calls"',
    payloadSummary: "Reel Achadinhos Shopee",
    latencyMs: 140,
    ipAddress: "10.0.1.8",
    retryAttempt: 2,
    remoteMessageId: "ig_media_TEST_IG_02",
    timestamp: "2026-10-27T14:05:00Z"
  },
  {
    id: "log-export-03",
    channel: "newsletter",
    action: "publish",
    status: "success",
    statusCode: 201,
    message: "Campanha disparada para 4.800 assinantes",
    payloadSummary: "Newsletter Edição 99",
    latencyMs: 82,
    timestamp: "2026-10-27T14:10:00Z"
  }
];

// 3. Exportação em JSON
console.log("\n--- 3. Exportação Estruturada em JSON (Envelope SOC2) ---");
const jsonResult = exportLogsToJson(sampleLogs, {
  systemName: "V5 Apollo Poster Test",
  organization: "V5 Holding Corp"
});

assert(typeof jsonResult === "string" && jsonResult.length > 50, "Gera string JSON válida e não vazia");

const parsedJson = JSON.parse(jsonResult);
assert(parsedJson.system === "V5 Apollo Poster Test", "Envelope contém nome do sistema correto");
assert(parsedJson.organization === "V5 Holding Corp", "Envelope contém nome da organização");
assert(parsedJson.complianceStandard === "SOC2 / GDPR Audit Ready", "Envelope atesta conformidade SOC2 / GDPR");
assert(parsedJson.totalRecords === 3, "Total de registros no envelope confere com a entrada");
assert(Array.isArray(parsedJson.records) && parsedJson.records.length === 3, "Array records possui exatamente 3 itens");
assert(parsedJson.records[0].calculatedMessageId === "wamid.HBgM_TEST_WA_01", "Preserva Remote Message ID original");
assert(parsedJson.records[2].calculatedMessageId.startsWith("resend_email_"), "Gera Remote Message ID calculado quando ausente");

// 4. Exportação em CSV
console.log("\n--- 4. Exportação Tabular em CSV (BOM UTF-8 & RFC 4180) ---");
const csvResult = exportLogsToCsv(sampleLogs);

assert(csvResult.startsWith("\uFEFF"), "Inicia com Byte Order Mark UTF-8 (\\uFEFF) para compatibilidade Excel");

const csvLines = csvResult.replace("\uFEFF", "").split("\r\n");
assert(csvLines.length === 4, "Arquivo CSV possui 4 linhas (1 cabeçalho + 3 registros)");

const headerLine = csvLines[0];
assert(headerLine.includes("LogID") && headerLine.includes("RemoteMessageID") && headerLine.includes("StatusCode"), "Cabeçalho contém colunas essenciais de auditoria");

const row1 = csvLines[1];
assert(row1.includes('"log-export-01"'), "Linha 1 contém o LogID correto");
assert(row1.includes('"whatsapp"'), "Linha 1 identifica o canal whatsapp");
assert(row1.includes('"wamid.HBgM_TEST_WA_01"'), "Linha 1 contém o messageId");
assert(row1.includes('"200"'), "Linha 1 contém o código de status HTTP 200");

const row2 = csvLines[2];
assert(row2.includes('""Too many calls""'), "Linha 2 escapa aspas internas da mensagem de erro");
assert(row2.includes('"429"'), "Linha 2 contém status 429");

// 5. Testes Defensivos
console.log("\n--- 5. Testes Defensivos e Ambiente Node/SSR ---");
const emptyJson = exportLogsToJson([]);
const parsedEmpty = JSON.parse(emptyJson);
assert(parsedEmpty.totalRecords === 0 && parsedEmpty.records.length === 0, "Exportação JSON vazia é tratada sem erros");

const emptyCsv = exportLogsToCsv([]);
assert(emptyCsv.startsWith("\uFEFF") && emptyCsv.replace("\uFEFF", "").split("\r\n").length === 1, "Exportação CSV vazia contém apenas linha de cabeçalho");

const ssrDownload = triggerFileDownload("conteudo", "teste.txt", "text/plain");
assert(ssrDownload === false, "triggerFileDownload retorna false graciosamente em ambiente Node sem window");

console.log("\n=======================================================");
console.log(`📊 RESULTADO FINAL: ${passedTests}/${totalTests} TESTES APROVADOS!`);
console.log("=======================================================\n");

if (passedTests !== totalTests) {
  process.exit(1);
}
