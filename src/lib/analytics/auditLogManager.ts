/**
 * auditLogManager.ts - Gerenciador da Tabela de Logs de Auditoria de Despacho
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Módulo de Auditoria Corporativa de Despacho:
 * - Formatação rica de códigos de status HTTP (200, 201, 400, 401, 403, 422, 429, 500, 503)
 * - Identificação e geração determinística de IDs de mensagem remotos (MessageId)
 * - Filtragem multi-critério (canal, status, busca textual em payloads e IDs)
 * - Paginação e ordenação temporal de eventos
 */

import { DispatchLogEntry, SocialPlatform } from "@/types/poster";
import { generateRemoteMessageId } from "@/lib/queue/batchNetworkSimulator";

export interface HttpStatusBadgeInfo {
  code: number;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  isSuccess: boolean;
}

/**
 * Retorna as propriedades visuais do código HTTP retornado pela API
 */
export function getHttpStatusBadgeInfo(statusCode: number = 200): HttpStatusBadgeInfo {
  if (statusCode >= 200 && statusCode < 300) {
    const label = statusCode === 201 ? "201 CREATED" : statusCode === 202 ? "202 ACCEPTED" : "200 OK";
    return {
      code: statusCode,
      label,
      badgeBg: "bg-emerald-500/10",
      badgeText: "text-emerald-400",
      badgeBorder: "border-emerald-500/30",
      isSuccess: true
    };
  }

  if (statusCode === 429) {
    return {
      code: statusCode,
      label: "429 RATE LIMIT",
      badgeBg: "bg-purple-500/10",
      badgeText: "text-purple-400",
      badgeBorder: "border-purple-500/30",
      isSuccess: false
    };
  }

  if (statusCode >= 400 && statusCode < 500) {
    const label =
      statusCode === 401
        ? "401 UNAUTHORIZED"
        : statusCode === 403
        ? "403 FORBIDDEN"
        : statusCode === 404
        ? "404 NOT FOUND"
        : statusCode === 422
        ? "422 INVALID"
        : `${statusCode} CLIENT ERR`;
    return {
      code: statusCode,
      label,
      badgeBg: "bg-red-500/10",
      badgeText: "text-red-400",
      badgeBorder: "border-red-500/30",
      isSuccess: false
    };
  }

  if (statusCode >= 500 && statusCode < 600) {
    const label =
      statusCode === 503
        ? "503 UNAVAILABLE"
        : statusCode === 502
        ? "502 BAD GATEWAY"
        : statusCode === 504
        ? "504 TIMEOUT"
        : "500 SERVER ERR";
    return {
      code: statusCode,
      label,
      badgeBg: "bg-amber-500/10",
      badgeText: "text-amber-400",
      badgeBorder: "border-amber-500/30",
      isSuccess: false
    };
  }

  return {
    code: statusCode,
    label: `${statusCode} UNKNOWN`,
    badgeBg: "bg-zinc-800",
    badgeText: "text-zinc-400",
    badgeBorder: "border-zinc-700",
    isSuccess: false
  };
}

/**
 * Garante que todo log possua um identificador de mensagem remoto fidedigno
 */
export function getLogRemoteMessageId(log: DispatchLogEntry): string {
  if (log.remoteMessageId) return log.remoteMessageId;
  const hash = Math.abs(
    log.id.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
  ).toString(36);
  
  switch (log.channel) {
    case "whatsapp":
      return `wamid.HBgM${hash}.V5==`;
    case "telegram":
      return `tg_msg_${hash}_101`;
    case "instagram":
      return `ig_media_${hash}`;
    case "tiktok":
      return `tk_v_publish_${hash}`;
    case "youtube":
      return `yt_data_v3_${hash}`;
    case "newsletter":
      return `resend_email_${hash}`;
    case "autoblog":
      return `autoblog_post_${hash}`;
    case "wordpress":
      return `wp_post_${hash}`;
    default:
      return `msg_${hash}`;
  }
}

export interface FilterLogsOptions {
  searchQuery?: string;
  channelFilter?: string; // 'all' | SocialPlatform
  statusFilter?: "all" | "success" | "failed";
  sortOrder?: "desc" | "asc";
}

/**
 * Filtra e ordena a coleção de logs com suporte a pesquisa textual em múltiplos campos
 */
export function filterAndSortLogs(
  logs: DispatchLogEntry[],
  options: FilterLogsOptions = {}
): DispatchLogEntry[] {
  const {
    searchQuery = "",
    channelFilter = "all",
    statusFilter = "all",
    sortOrder = "desc"
  } = options;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  return logs
    .filter((log) => {
      // Filtro por canal
      if (channelFilter !== "all" && log.channel !== channelFilter) {
        return false;
      }

      // Filtro por status
      if (statusFilter !== "all" && log.status !== statusFilter) {
        return false;
      }

      // Filtro de busca textual
      if (normalizedQuery) {
        const messageId = getLogRemoteMessageId(log).toLowerCase();
        const msg = (log.message || "").toLowerCase();
        const summary = (log.payloadSummary || "").toLowerCase();
        const channel = (log.channel || "").toLowerCase();
        const code = String(log.statusCode);

        const match =
          messageId.includes(normalizedQuery) ||
          msg.includes(normalizedQuery) ||
          summary.includes(normalizedQuery) ||
          channel.includes(normalizedQuery) ||
          code.includes(normalizedQuery);

        if (!match) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });
}

export interface PaginatedResult<T> {
  items: T[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  startIndex: number;
  endIndex: number;
}

/**
 * Pagina uma coleção genérica de itens
 */
export function paginateLogs(
  logs: DispatchLogEntry[],
  page: number = 1,
  pageSize: number = 10
): PaginatedResult<DispatchLogEntry> {
  const safePage = Math.max(1, page);
  const safeSize = Math.max(1, pageSize);
  const totalCount = logs.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / safeSize));
  const currentPage = Math.min(safePage, totalPages);

  const startIndex = (currentPage - 1) * safeSize;
  const endIndex = Math.min(startIndex + safeSize, totalCount);
  const items = logs.slice(startIndex, endIndex);

  return {
    items,
    currentPage,
    pageSize: safeSize,
    totalPages,
    totalCount,
    startIndex,
    endIndex
  };
}

/**
 * Formata data/hora em padrão brasileiro com segundos: DD/MM/AAAA às HH:mm:ss
 */
export function formatAuditDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  } catch {
    return isoString;
  }
}
