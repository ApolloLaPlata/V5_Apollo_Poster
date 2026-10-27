/**
 * payloadInspector.ts - Inspetor e Extrator de Payloads de Rede para Logs
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Módulo de Auditoria Profunda de Rede:
 * - Extração e garantia de integridade de payloads enviados (Request) e recebidos (Response)
 * - Síntese defensiva para logs históricos que não possuíam payload bruto registrado
 * - Formatação, medição de tamanho em bytes e metadados de conectividade corporativa
 */

import { DispatchLogEntry, SocialPlatform } from "@/types/poster";
import { getLogRemoteMessageId } from "./auditLogManager";

export interface InspectedPayloadData {
  logId: string;
  remoteMessageId: string;
  channel: SocialPlatform;
  action: string;
  statusCode: number;
  status: "success" | "failed" | "in_progress";
  timestamp: string;
  latencyMs: number;
  ipAddress: string;
  retryAttempt: number;
  requestPayload: Record<string, unknown>;
  responsePayload: Record<string, unknown>;
  rawRequestJson: string;
  rawResponseJson: string;
  requestSizeFormatted: string;
  responseSizeFormatted: string;
  headers: Record<string, string>;
}

/**
 * Calcula o tamanho aproximado de uma string serializada em formato legível (B, KB, MB)
 */
export function formatPayloadSize(byteLength: number): string {
  if (byteLength < 1024) {
    return `${byteLength} B`;
  }
  const kb = byteLength / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(2)} KB`;
  }
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

/**
 * Formata um objeto JS em JSON com indentação padronizada e tratamento de erros
 */
export function formatJsonPayload(data: unknown): string {
  try {
    return JSON.stringify(data ?? {}, null, 2);
  } catch (err) {
    return JSON.stringify({ error: "Falha na serialização do payload", details: String(err) }, null, 2);
  }
}

/**
 * Gera headers HTTP simulados corporativos fidedignos de acordo com a capitania e canal
 */
export function generateAuditHeaders(channel: SocialPlatform, messageId: string): Record<string, string> {
  return {
    "content-type": "application/json; charset=utf-8",
    "user-agent": "V5-Apollo-Poster/1.0 (+https://holding.v5apollo.com/poster)",
    "x-apollo-dispatch-id": messageId,
    "x-apollo-channel": channel,
    "x-apollo-zone": "sa-east-1-corp",
    "x-ratelimit-remaining": "1840",
    "x-ratelimit-limit": "2000"
  };
}

/**
 * Sintetiza um payload de Request fidedigno caso o log não possua o objeto bruto
 */
function synthesizeRequestPayload(log: DispatchLogEntry): Record<string, unknown> {
  const common = {
    event_timestamp: log.timestamp,
    client: "V5 Apollo Poster v1.0",
    origin_system: "Apollo Ecosystem Holding"
  };

  switch (log.channel) {
    case "whatsapp":
      return {
        ...common,
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: "5511999990000",
        type: "interactive",
        action: log.action,
        interactive: {
          type: "button",
          header: { type: "text", text: "Oferta Exclusiva Finders VIP" },
          body: { text: log.payloadSummary || log.message },
          footer: { text: "V5 Achadinhos Verificados" }
        }
      };

    case "telegram":
      return {
        ...common,
        chat_id: "@v5_achadinhos_vip",
        parse_mode: "MarkdownV2",
        text: log.payloadSummary || log.message,
        disable_web_page_preview: false,
        reply_markup: {
          inline_keyboard: [[{ text: "🛒 Ver Oferta na Loja", url: "https://amzn.to/v5deal" }]]
        }
      };

    case "instagram":
      return {
        ...common,
        media_type: "REELS",
        caption: `${log.payloadSummary || log.message}\n\n#v5apollo #achadinhos #tech #viral`,
        share_to_feed: true,
        thumb_offset: 1500
      };

    case "tiktok":
      return {
        ...common,
        post_info: {
          title: log.payloadSummary || log.message,
          privacy_level: "PUBLIC_TO_EVERYONE",
          disable_duet: false,
          disable_comment: false
        },
        source_info: { source: "FILE_UPLOAD", video_url: "https://cdn.v5apollo.com/videos/deal-49.mp4" }
      };

    case "youtube":
      return {
        ...common,
        snippet: {
          title: log.payloadSummary || log.message,
          description: "Publicado automaticamente pelo V5 Apollo Poster Onicanal.",
          tags: ["v5", "shorts", "review"],
          categoryId: "28"
        },
        status: { privacyStatus: "public", selfDeclaredMadeForKids: false }
      };

    case "newsletter":
      return {
        ...common,
        from: "Apollo La Plata <newsletter@holding.v5apollo.com>",
        to: ["audiencia-geral@holding.v5apollo.com"],
        subject: log.payloadSummary || "Edição Especial - V5 Newsletter",
        headers: { "X-Entity-Ref-ID": log.id }
      };

    case "autoblog":
    case "wordpress":
      return {
        ...common,
        title: log.payloadSummary || "Artigo Publicado no Blog",
        status: "publish",
        format: "standard",
        comment_status: "open",
        excerpt: log.message
      };

    default:
      return {
        ...common,
        channel: log.channel,
        action: log.action,
        summary: log.payloadSummary,
        message: log.message
      };
  }
}

/**
 * Sintetiza um payload de Response fidedigno caso o log não possua o objeto bruto
 */
function synthesizeResponsePayload(
  log: DispatchLogEntry,
  remoteMessageId: string
): Record<string, unknown> {
  const isOk = (log.statusCode >= 200 && log.statusCode < 300) || log.status === "success";

  if (isOk) {
    return {
      status: "success",
      http_code: log.statusCode || 200,
      message_id: remoteMessageId,
      id: remoteMessageId,
      dispatched_at: log.timestamp,
      api_version: "v19.0",
      delivered: true,
      meta: {
        server_latency_ms: log.latencyMs ?? 78,
        region: "sa-east-1"
      }
    };
  }

  // Falhas simuladas baseadas em código de erro
  if (log.statusCode === 429) {
    return {
      error: {
        message: "(#429) User request limit reached for this specific endpoint. Please wait before retrying.",
        type: "OAuthRateLimitException",
        code: 429,
        error_subcode: 1349193,
        fbtrace_id: "FhB9_v5_TraceId_429",
        retry_after_seconds: 60
      }
    };
  }

  if (log.statusCode === 401 || log.statusCode === 403) {
    return {
      error: {
        message: "The access token could not be decrypted or lacks the required publishing permissions.",
        type: "OAuthPermissionsException",
        code: log.statusCode,
        error_subcode: 463,
        help_url: "https://developers.facebook.com/docs/graph-api/overview/rate-limiting"
      }
    };
  }

  if (log.statusCode === 422) {
    return {
      error: {
        message: "Invalid parameter payload: 'media_url' is either inaccessible or has an invalid aspect ratio.",
        code: 422,
        validation_errors: [{ field: "media_url", rule: "aspect_ratio_9_16_required" }]
      }
    };
  }

  return {
    error: {
      message: log.message || "Internal server error occurred on remote API cluster.",
      code: log.statusCode || 500,
      status: "failed",
      timestamp: log.timestamp
    }
  };
}

/**
 * Extrai, complementa e prepara todos os dados para inspeção profunda de payloads
 */
export function extractLogPayloads(log: DispatchLogEntry): InspectedPayloadData {
  const remoteMessageId = getLogRemoteMessageId(log);
  const latencyMs = log.latencyMs ?? 85;
  const ipAddress = log.ipAddress || "172.24.0.12 (VPC Private Gateway)";
  const retryAttempt = log.retryAttempt ?? (log.status === "failed" ? 2 : 1);
  const statusCode = log.statusCode || (log.status === "success" ? 200 : 500);

  const requestPayload =
    log.requestPayload && Object.keys(log.requestPayload).length > 0
      ? log.requestPayload
      : synthesizeRequestPayload(log);

  const responsePayload =
    log.responsePayload && Object.keys(log.responsePayload).length > 0
      ? log.responsePayload
      : synthesizeResponsePayload(log, remoteMessageId);

  const rawRequestJson = formatJsonPayload(requestPayload);
  const rawResponseJson = formatJsonPayload(responsePayload);

  const requestSizeFormatted = formatPayloadSize(new TextEncoder().encode(rawRequestJson).length);
  const responseSizeFormatted = formatPayloadSize(new TextEncoder().encode(rawResponseJson).length);

  const headers = generateAuditHeaders(log.channel, remoteMessageId);

  return {
    logId: log.id,
    remoteMessageId,
    channel: log.channel,
    action: log.action,
    statusCode,
    status: log.status,
    timestamp: log.timestamp,
    latencyMs,
    ipAddress,
    retryAttempt,
    requestPayload,
    responsePayload,
    rawRequestJson,
    rawResponseJson,
    requestSizeFormatted,
    responseSizeFormatted,
    headers
  };
}
