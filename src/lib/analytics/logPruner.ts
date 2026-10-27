/**
 * logPruner.ts - Motor de Poda Inteligente e Limpeza Segura de Logs de Auditoria
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Módulo de Higienização de Histórico:
 * - Estratégias seletivas de expurgo (Todos, Apenas Sucessos, Mais antigos que 24h/7d)
 * - Verificação de palavra de segurança contra deleção acidental
 * - Exportação automática de snapshot/backup antes da deleção destrutiva
 */

import { DispatchLogEntry } from "@/types/poster";
import { exportLogsToJson, triggerFileDownload, generateExportFilename } from "./auditLogExporter";

export type PruneStrategy = "all" | "success_only" | "older_than_24h" | "older_than_7d";

export interface PruneResult {
  remainingLogs: DispatchLogEntry[];
  removedLogs: DispatchLogEntry[];
  removedCount: number;
  initialCount: number;
}

export interface PruneStrategyOption {
  id: PruneStrategy;
  title: string;
  description: string;
  requiresConfirmationWord: boolean;
  severity: "danger" | "warning" | "info";
}

export const PRUNE_STRATEGIES: PruneStrategyOption[] = [
  {
    id: "older_than_24h",
    title: "Logs Mais Antigos que 24 Horas",
    description: "Remove eventos de despacho anteriores às últimas 24 horas, preservando a telemetria recente.",
    requiresConfirmationWord: false,
    severity: "info"
  },
  {
    id: "older_than_7d",
    title: "Logs Mais Antigos que 7 Dias",
    description: "Remove eventos históricos preservando a última semana de auditoria onicanal.",
    requiresConfirmationWord: false,
    severity: "info"
  },
  {
    id: "success_only",
    title: "Apenas Logs de Sucesso (2xx OK)",
    description: "Remove disparos bem-sucedidos e mantém todos os erros (4xx, 5xx e 429) para diagnóstico.",
    requiresConfirmationWord: false,
    severity: "warning"
  },
  {
    id: "all",
    title: "Excluir Todos os Logs (Purge Total)",
    description: "Apaga permanentemente todo o histórico de auditoria e telemetria armazenado.",
    requiresConfirmationWord: true,
    severity: "danger"
  }
];

/**
 * Valida se a palavra de confirmação digitada confere com a esperada
 */
export function validateSecurityConfirmation(
  input: string,
  requiredWord: string = "CONFIRMAR"
): boolean {
  if (!input) return false;
  return input.trim().toUpperCase() === requiredWord.trim().toUpperCase();
}

/**
 * Executa a poda de logs com base na estratégia selecionada
 */
export function pruneLogsByStrategy(
  logs: DispatchLogEntry[],
  strategy: PruneStrategy,
  referenceDate: Date = new Date()
): PruneResult {
  const initialCount = logs.length;
  const nowMs = referenceDate.getTime();

  let remainingLogs: DispatchLogEntry[] = [];
  let removedLogs: DispatchLogEntry[] = [];

  switch (strategy) {
    case "all":
      remainingLogs = [];
      removedLogs = [...logs];
      break;

    case "success_only":
      for (const log of logs) {
        const isSuccess =
          (typeof log.statusCode === "number" && log.statusCode >= 200 && log.statusCode < 300) ||
          log.status === "success";

        if (isSuccess) {
          removedLogs.push(log);
        } else {
          remainingLogs.push(log);
        }
      }
      break;

    case "older_than_24h": {
      const cutoff24h = nowMs - 24 * 60 * 60 * 1000;
      for (const log of logs) {
        const logTime = new Date(log.timestamp).getTime();
        // Se a data for válida e anterior ao corte de 24h, remove
        if (!isNaN(logTime) && logTime < cutoff24h) {
          removedLogs.push(log);
        } else {
          remainingLogs.push(log);
        }
      }
      break;
    }

    case "older_than_7d": {
      const cutoff7d = nowMs - 7 * 24 * 60 * 60 * 1000;
      for (const log of logs) {
        const logTime = new Date(log.timestamp).getTime();
        if (!isNaN(logTime) && logTime < cutoff7d) {
          removedLogs.push(log);
        } else {
          remainingLogs.push(log);
        }
      }
      break;
    }

    default:
      remainingLogs = [...logs];
      removedLogs = [];
  }

  return {
    remainingLogs,
    removedLogs,
    removedCount: removedLogs.length,
    initialCount
  };
}

/**
 * Cria e dispara download de backup dos logs em JSON antes de realizar exclusão destrutiva
 */
export function backupLogsBeforePruning(logs: DispatchLogEntry[]): boolean {
  if (logs.length === 0) return true;
  try {
    const json = exportLogsToJson(logs, {
      systemName: "V5 Apollo Poster - Pre-Prune Auto Backup",
      organization: "V5 Apollo Holding"
    });
    const filename = generateExportFilename("json", "v5_apollo_backup_pre_purge");
    return triggerFileDownload(json, filename, "application/json;charset=utf-8;");
  } catch (err) {
    console.error("Falha ao gerar backup pré-poda:", err);
    return false;
  }
}
