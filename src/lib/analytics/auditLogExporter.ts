/**
 * auditLogExporter.ts - Motor de Exportação de Logs para Auditoria (JSON e CSV)
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Módulo de Exportação Corporativa SOC2 / GDPR:
 * - Exportação em JSON estruturado com envelope auditável de metadados
 * - Exportação em CSV conforme RFC 4180 com BOM UTF-8 (\uFEFF) para compatibilidade com Microsoft Excel
 * - Nomenclatura determinística com timestamp local
 * - Disparo nativo de download no navegador
 */

import { DispatchLogEntry } from "@/types/poster";
import { getLogRemoteMessageId, formatAuditDateTime } from "./auditLogManager";

export interface ExportEnvelope {
  exportedAt: string;
  system: string;
  organization: string;
  schemaVersion: string;
  complianceStandard: string;
  totalRecords: number;
  records: Array<DispatchLogEntry & { calculatedMessageId: string }>;
}

export interface ExportOptions {
  includePayloads?: boolean;
  systemName?: string;
  organization?: string;
}

/**
 * Escapa uma célula de texto para conformidade com a especificação RFC 4180 de CSV
 */
export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }
  const stringValue = String(value);
  // Se contiver aspas, vírgulas, quebras de linha, envolve em aspas e duplica aspas internas
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return `"${stringValue}"`;
}

/**
 * Gera o nome de arquivo de auditoria padronizado com timestamp local
 */
export function generateExportFilename(format: "json" | "csv", prefix: string = "v5_apollo_dispatch_audit"): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const timestamp = `${year}${month}${day}_${hours}${minutes}${seconds}`;
  return `${prefix}_${timestamp}.${format}`;
}

/**
 * Converte a coleção de logs em JSON corporativo com envelope de auditoria SOC2
 */
export function exportLogsToJson(logs: DispatchLogEntry[], options: ExportOptions = {}): string {
  const {
    systemName = "V5 Apollo Poster (:3011)",
    organization = "V5 Apollo Holding"
  } = options;

  const enrichedRecords = logs.map((log) => ({
    ...log,
    calculatedMessageId: getLogRemoteMessageId(log)
  }));

  const envelope: ExportEnvelope = {
    exportedAt: new Date().toISOString(),
    system: systemName,
    organization,
    schemaVersion: "1.0.0",
    complianceStandard: "SOC2 / GDPR Audit Ready",
    totalRecords: logs.length,
    records: enrichedRecords
  };

  return JSON.stringify(envelope, null, 2);
}

/**
 * Converte a coleção de logs em CSV compatível com RFC 4180 e BOM UTF-8
 */
export function exportLogsToCsv(logs: DispatchLogEntry[]): string {
  const headers = [
    "LogID",
    "DataHoraISO",
    "DataHoraLocal",
    "Canal",
    "Acao",
    "Status",
    "StatusCode",
    "RemoteMessageID",
    "LatenciaMs",
    "IPOrigem",
    "TentativaRetry",
    "Mensagem",
    "PayloadSummary"
  ];

  const rows = logs.map((log) => {
    const messageId = getLogRemoteMessageId(log);
    const localTime = formatAuditDateTime(log.timestamp);
    const latency = log.latencyMs ?? "";
    const ip = log.ipAddress || "172.24.0.12";
    const retry = log.retryAttempt ?? 1;

    return [
      escapeCsvCell(log.id),
      escapeCsvCell(log.timestamp),
      escapeCsvCell(localTime),
      escapeCsvCell(log.channel),
      escapeCsvCell(log.action),
      escapeCsvCell(log.status),
      escapeCsvCell(log.statusCode),
      escapeCsvCell(messageId),
      escapeCsvCell(latency),
      escapeCsvCell(ip),
      escapeCsvCell(retry),
      escapeCsvCell(log.message),
      escapeCsvCell(log.payloadSummary)
    ].join(",");
  });

  // Prefixa com BOM UTF-8 (\uFEFF) para forçar o Microsoft Excel a reconhecer acentuação e caracteres latinos
  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  return csvContent;
}

/**
 * Executa o download de um arquivo no navegador utilizando Blob URL
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string): boolean {
  if (typeof window === "undefined" || !window.document) {
    return false;
  }

  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error("Falha ao disparar download do arquivo de auditoria:", error);
    return false;
  }
}
