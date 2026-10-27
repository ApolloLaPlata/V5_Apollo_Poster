/**
 * dispatchDiagnostics.ts - Tratamento de Erros e Mensagens Amigáveis de Diagnóstico
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Transforma códigos HTTP crípticos (401, 403, 408, 422, 429, 500, 503) e exceções de rede
 * em diagnósticos acionáveis e compreensíveis para o operador da central V5 Apollo:
 * - Falhas de autenticação e tokens expirados (Meta Graph, TikTok, Google Data v3)
 * - Timeouts e instabilidades de trânsito de rede
 * - Rejeição de payload (dimensões de mídia, legenda longa, formato não suportado)
 * - Rate limits das plataformas parceiras com cálculo de espera
 * - Quedas temporárias de servidores terceiros (5xx)
 * - Permissões insuficientes de conta (ex: necessidade de conta Business / Creator)
 */

import { SocialPlatform, ErrorDiagnosticCategory, DispatchDiagnostic, QueueItem } from "@/types/poster";

export interface DiagnosticDefinition {
  category: ErrorDiagnosticCategory;
  userFriendlyTitle: string;
  userFriendlyDescription: string;
  suggestedAction: string;
  isRecoverable: boolean;
  iconType: DispatchDiagnostic["iconType"];
}

/**
 * Catálogo canônico de definições amigáveis por categoria de falha
 */
export const DIAGNOSTIC_CATALOG: Record<ErrorDiagnosticCategory, DiagnosticDefinition> = {
  AUTH_TOKEN_EXPIRED: {
    category: "AUTH_TOKEN_EXPIRED",
    userFriendlyTitle: "Token de Autenticação Expirado ou Revogado",
    userFriendlyDescription:
      "A credencial de acesso OAuth perdeu a validade ou foi revogada nas configurações de segurança da plataforma. A API rejeitou a requisição.",
    suggestedAction: "Acesse as Configurações de API do Poster e reconecte a conta para gerar um novo token oficial.",
    isRecoverable: false,
    iconType: "key"
  },
  RATE_LIMIT_EXCEEDED: {
    category: "RATE_LIMIT_EXCEEDED",
    userFriendlyTitle: "Limite de Requisições Atingido (Rate Limit)",
    userFriendlyDescription:
      "A plataforma parceira bloqueou novos envios temporariamente porque o teto de requisições por minuto ou hora desta conta foi atingido.",
    suggestedAction: "Aguarde a reabertura da janela de despacho. O motor do Poster aplicará backoff com jitter automático.",
    isRecoverable: true,
    iconType: "clock"
  },
  TIMEOUT_NETWORK: {
    category: "TIMEOUT_NETWORK",
    userFriendlyTitle: "Tempo Limite de Conexão Esgotado (Timeout)",
    userFriendlyDescription:
      "O servidor remoto da rede social demorou mais do que o limite tolerado para responder ou ocorreu perda de pacotes na rota.",
    suggestedAction: "O Poster realizará nova tentativa automaticamente via fila de retentativas. Se persistir, valide o link de internet.",
    isRecoverable: true,
    iconType: "clock"
  },
  PAYLOAD_INVALID: {
    category: "PAYLOAD_INVALID",
    userFriendlyTitle: "Conteúdo Rejeitado por Incompatibilidade de Formato",
    userFriendlyDescription:
      "A publicação violou as regras técnicas da API parceira (ex: proporção de vídeo incompatível, legenda ultrapassando limite ou campo ausente).",
    suggestedAction: "Abra o post no editor para ajustar a legenda, mídia ou parâmetros antes de solicitar novo despacho.",
    isRecoverable: false,
    iconType: "file-text"
  },
  SERVER_OUTAGE_5XX: {
    category: "SERVER_OUTAGE_5XX",
    userFriendlyTitle: "Instabilidade Momentânea nos Servidores Parceiros",
    userFriendlyDescription:
      "A infraestrutura externa da plataforma está enfrentando sobrecarga ou manutenção não programada (erro interno 5xx).",
    suggestedAction: "Aguarde a estabilização do serviço remoto. O sistema agendou reenvio automático em instantes.",
    isRecoverable: true,
    iconType: "server"
  },
  PERMISSION_DENIED: {
    category: "PERMISSION_DENIED",
    userFriendlyTitle: "Permissões de Conta Insuficientes",
    userFriendlyDescription:
      "A conta conectada não possui autorização ou escopo necessário para esta operação (ex: postar carrossel ou reel requer conta Business/Creator).",
    suggestedAction: "Confirme se sua conta é Profissional/Comercial no app oficial e conceda os escopos necessários na tela de autorização.",
    isRecoverable: false,
    iconType: "shield"
  },
  MEDIA_NOT_ACCESSIBLE: {
    category: "MEDIA_NOT_ACCESSIBLE",
    userFriendlyTitle: "Mídia Anexada Inacessível para Download",
    userFriendlyDescription:
      "O servidor da rede social tentou transferir a imagem ou vídeo da URL informada, mas a rota retornou erro 404 ou exigiu autenticação local.",
    suggestedAction: "Verifique se a imagem está hospedada em um domínio público acessível sem VPN ou restrições de IP.",
    isRecoverable: false,
    iconType: "image"
  },
  UNKNOWN_ERROR: {
    category: "UNKNOWN_ERROR",
    userFriendlyTitle: "Falha Não Catalogada no Despacho",
    userFriendlyDescription:
      "Ocorreu uma resposta inesperada da API remota que não corresponde aos padrões catalogados.",
    suggestedAction: "Consulte o log detalhado de auditoria e verifique o código de retorno da requisição.",
    isRecoverable: false,
    iconType: "alert"
  }
};

/**
 * Extrai uma representação em texto limpa a partir de qualquer tipo de erro
 */
export function extractErrorMessage(rawError: unknown): string {
  if (!rawError) return "Erro desconhecido";
  if (typeof rawError === "string") return rawError;
  if (rawError instanceof Error) return rawError.message;
  if (typeof rawError === "object" && "message" in rawError && typeof (rawError as any).message === "string") {
    return (rawError as any).message;
  }
  try {
    return JSON.stringify(rawError);
  } catch {
    return String(rawError);
  }
}

/**
 * Categoriza o erro com base no StatusCode HTTP e em padrões textuais da mensagem
 */
export function categorizeErrorCode(statusCode: number = 0, rawMessage: string = ""): ErrorDiagnosticCategory {
  const lowerMsg = rawMessage.toLowerCase();

  // 1. Falha de Token / Autenticação (Prioridade alta)
  if (
    statusCode === 401 ||
    lowerMsg.includes("oauthexception") ||
    lowerMsg.includes("invalid oauth access token") ||
    lowerMsg.includes("token expired") ||
    lowerMsg.includes("error validating access token") ||
    lowerMsg.includes("session has expired") ||
    lowerMsg.includes("subcode 463") ||
    lowerMsg.includes("invalid_client") ||
    lowerMsg.includes("token revogado") ||
    lowerMsg.includes("token has been revoked") ||
    lowerMsg.includes("unauthorized")
  ) {
    return "AUTH_TOKEN_EXPIRED";
  }

  // 2. Permissão Negada (403 sem expiração explícita)
  if (
    statusCode === 403 ||
    lowerMsg.includes("permission denied") ||
    lowerMsg.includes("insufficient permissions") ||
    lowerMsg.includes("requires business account") ||
    lowerMsg.includes("instagram_content_publish") ||
    lowerMsg.includes("pages_manage_posts") ||
    lowerMsg.includes("not authorized to perform")
  ) {
    return "PERMISSION_DENIED";
  }

  // 3. Rate Limit Excedido (429)
  if (
    statusCode === 429 ||
    lowerMsg.includes("rate limit") ||
    lowerMsg.includes("too many requests") ||
    lowerMsg.includes("quota exceeded") ||
    lowerMsg.includes("user request limit reached") ||
    lowerMsg.includes("limite de requisições")
  ) {
    return "RATE_LIMIT_EXCEEDED";
  }

  // 4. Timeout de Rede / Queda de Conexão
  if (
    statusCode === 408 ||
    statusCode === 504 ||
    statusCode === 524 ||
    lowerMsg.includes("etimedout") ||
    lowerMsg.includes("econnreset") ||
    lowerMsg.includes("econnrefused") ||
    lowerMsg.includes("fetch failed") ||
    lowerMsg.includes("networktimeout") ||
    lowerMsg.includes("timed out") ||
    lowerMsg.includes("timeout") ||
    lowerMsg.includes("socket hang up")
  ) {
    return "TIMEOUT_NETWORK";
  }

  // 5. Mídia Inacessível
  if (
    lowerMsg.includes("media not accessible") ||
    lowerMsg.includes("cannot download media") ||
    lowerMsg.includes("media url unreachable") ||
    lowerMsg.includes("image url not public") ||
    lowerMsg.includes("video url not found")
  ) {
    return "MEDIA_NOT_ACCESSIBLE";
  }

  // 6. Payload Inválido / Rejeição de Formato
  if (
    statusCode === 400 ||
    statusCode === 422 ||
    lowerMsg.includes("invalid payload") ||
    lowerMsg.includes("validation error") ||
    lowerMsg.includes("aspect ratio") ||
    lowerMsg.includes("caption too long") ||
    lowerMsg.includes("legenda muito longa") ||
    lowerMsg.includes("media format not supported") ||
    lowerMsg.includes("missing required parameter") ||
    lowerMsg.includes("dimensões inválidas")
  ) {
    return "PAYLOAD_INVALID";
  }

  // 7. Instabilidade de Servidor (500, 502, 503)
  if (
    statusCode >= 500 && statusCode < 600
  ) {
    return "SERVER_OUTAGE_5XX";
  }

  return "UNKNOWN_ERROR";
}

/**
 * Diagnostica um erro de despacho e gera um relatório legível e acionável
 */
export function diagnoseDispatchError(
  platform: SocialPlatform,
  statusCode: number = 0,
  rawError?: unknown
): DispatchDiagnostic {
  const rawErrorMessage = extractErrorMessage(rawError);
  const category = categorizeErrorCode(statusCode, rawErrorMessage);
  const def = DIAGNOSTIC_CATALOG[category];

  // Sugestão de atraso caso seja rate limit ou timeout
  let suggestedRetryDelaySeconds: number | undefined;
  if (category === "RATE_LIMIT_EXCEEDED") {
    suggestedRetryDelaySeconds = 60; // 1 minuto padrão
  } else if (category === "TIMEOUT_NETWORK" || category === "SERVER_OUTAGE_5XX") {
    suggestedRetryDelaySeconds = 10;
  }

  return {
    category,
    platform,
    statusCode: statusCode || (category === "RATE_LIMIT_EXCEEDED" ? 429 : category === "AUTH_TOKEN_EXPIRED" ? 401 : 500),
    rawErrorMessage,
    userFriendlyTitle: def.userFriendlyTitle,
    userFriendlyDescription: def.userFriendlyDescription,
    suggestedAction: def.suggestedAction,
    isRecoverable: def.isRecoverable,
    suggestedRetryDelaySeconds,
    iconType: def.iconType,
    timestamp: new Date().toISOString()
  };
}

/**
 * Formata um resumo de uma linha para ser salvo no campo errorMessage da tarefa
 */
export function formatDiagnosticSummary(diag: DispatchDiagnostic): string {
  return `[${diag.category}] ${diag.userFriendlyTitle}: ${diag.suggestedAction}`;
}

/**
 * Enriquece um QueueItem com o diagnóstico estruturado e mensagem amigável
 */
export function enrichQueueItemWithDiagnostic(
  item: QueueItem,
  platform: SocialPlatform,
  statusCode: number = 0,
  rawError?: unknown
): QueueItem {
  const diag = diagnoseDispatchError(platform, statusCode, rawError);
  return {
    ...item,
    errorMessage: formatDiagnosticSummary(diag),
    diagnostic: diag,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Cores de estilos Tailwind por categoria de diagnóstico para componentes visuais
 */
export function getCategoryBadgeStyle(category: ErrorDiagnosticCategory): {
  badgeBg: string;
  badgeText: string;
  border: string;
  pillBg: string;
} {
  switch (category) {
    case "AUTH_TOKEN_EXPIRED":
      return {
        badgeBg: "bg-red-500/10",
        badgeText: "text-red-400",
        border: "border-red-500/30",
        pillBg: "bg-red-500/20"
      };
    case "PERMISSION_DENIED":
      return {
        badgeBg: "bg-amber-500/10",
        badgeText: "text-amber-400",
        border: "border-amber-500/30",
        pillBg: "bg-amber-500/20"
      };
    case "RATE_LIMIT_EXCEEDED":
      return {
        badgeBg: "bg-purple-500/10",
        badgeText: "text-purple-400",
        border: "border-purple-500/30",
        pillBg: "bg-purple-500/20"
      };
    case "TIMEOUT_NETWORK":
      return {
        badgeBg: "bg-blue-500/10",
        badgeText: "text-blue-400",
        border: "border-blue-500/30",
        pillBg: "bg-blue-500/20"
      };
    case "PAYLOAD_INVALID":
      return {
        badgeBg: "bg-orange-500/10",
        badgeText: "text-orange-400",
        border: "border-orange-500/30",
        pillBg: "bg-orange-500/20"
      };
    case "MEDIA_NOT_ACCESSIBLE":
      return {
        badgeBg: "bg-pink-500/10",
        badgeText: "text-pink-400",
        border: "border-pink-500/30",
        pillBg: "bg-pink-500/20"
      };
    case "SERVER_OUTAGE_5XX":
      return {
        badgeBg: "bg-yellow-500/10",
        badgeText: "text-yellow-400",
        border: "border-yellow-500/30",
        pillBg: "bg-yellow-500/20"
      };
    default:
      return {
        badgeBg: "bg-zinc-800",
        badgeText: "text-zinc-400",
        border: "border-zinc-700",
        pillBg: "bg-zinc-800"
      };
  }
}
