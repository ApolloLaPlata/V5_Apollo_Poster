/**
 * trackedLinkGenerator.ts - Gerador e Validador de Links Rastreados com Parâmetros UTM para Direct Message
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Padrão Oficial de Rastreamento Onicanal (GA4, Mixpanel, Amplitude, PostHog e V5 Auto Blog):
 * - utm_source: ig_comment_dm (Instagram) | tiktok_comment_dm (TikTok)
 * - utm_medium: direct_message | comment_private_reply
 * - utm_campaign: slug normalizado da regra ou post (ex: agentes-autonomos-reels)
 * - utm_content: gatilho acionado (ex: trigger_link, trigger_quero, trigger_cupom)
 * - utm_term: palavra-chave comentada pelo seguidor (ex: link, quero, desconto)
 * - coupon: código promocional anexado para auto-aplicação no checkout/carrinho
 * - Preservação estrita de query params preexistentes e fragmentos (#hashes)
 */

export interface TrackedDmLinkOptions {
  baseUrl: string;
  platform?: "instagram" | "tiktok";
  campaign?: string;
  matchedKeyword?: string;
  couponCode?: string;
  triggerEventId?: string;
  customMedium?: string;
}

export interface TrackedLinkResult {
  finalUrl: string;
  originalUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent?: string;
  utmTerm?: string;
  couponParam?: string;
  isValidUrl: boolean;
}

export interface ParsedTrackedUrl {
  baseUrl: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  coupon?: string;
  otherParams: Record<string, string>;
  hasValidDmUtm: boolean;
}

/**
 * Normaliza strings para formato de slug seguro para UTM (sem acentos, minúsculas, hífens)
 */
export function slugifyUtmParam(text: string): string {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Garante que a URL base tenha protocolo http ou https válido
 */
export function sanitizeBaseUrl(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * Gera URL de destino rastreada completa com os parâmetros UTM dedicados para Direct Message
 */
export function generateTrackedDmUrl(options: TrackedDmLinkOptions): TrackedLinkResult {
  const {
    baseUrl,
    platform = "instagram",
    campaign = "comment_to_dm_lead",
    matchedKeyword,
    couponCode,
    triggerEventId,
    customMedium
  } = options;

  const sanitized = sanitizeBaseUrl(baseUrl);

  // Defaults oficiais da Capitania #13 Poster
  const utmSource = platform === "tiktok" ? "tiktok_comment_dm" : "ig_comment_dm";
  const utmMedium = customMedium || "direct_message";
  const utmCampaign = slugifyUtmParam(campaign) || "comment_to_dm_lead";
  const utmContent = matchedKeyword ? `trigger_${slugifyUtmParam(matchedKeyword)}` : "comment_trigger";
  const utmTerm = matchedKeyword ? slugifyUtmParam(matchedKeyword) : undefined;
  const cleanCoupon = couponCode ? couponCode.trim().toUpperCase() : undefined;

  let isValidUrl = false;
  let finalUrl = sanitized;

  try {
    const urlObj = new URL(sanitized);
    isValidUrl = true;

    // Injeta os parâmetros UTM oficiais sem sobrescrever parâmetros não-UTM preexistentes
    urlObj.searchParams.set("utm_source", utmSource);
    urlObj.searchParams.set("utm_medium", utmMedium);
    urlObj.searchParams.set("utm_campaign", utmCampaign);
    urlObj.searchParams.set("utm_content", utmContent);

    if (utmTerm) {
      urlObj.searchParams.set("utm_term", utmTerm);
    }

    if (cleanCoupon) {
      urlObj.searchParams.set("coupon", cleanCoupon);
    }

    if (triggerEventId) {
      urlObj.searchParams.set("dm_event_id", triggerEventId);
    }

    finalUrl = urlObj.toString();
  } catch {
    isValidUrl = false;
    // Fallback gracioso para URLs relativas ou com sintaxe atípica
    const separator = sanitized.includes("?") ? "&" : "?";
    const params = new URLSearchParams();
    params.set("utm_source", utmSource);
    params.set("utm_medium", utmMedium);
    params.set("utm_campaign", utmCampaign);
    params.set("utm_content", utmContent);
    if (utmTerm) params.set("utm_term", utmTerm);
    if (cleanCoupon) params.set("coupon", cleanCoupon);

    finalUrl = `${sanitized}${separator}${params.toString()}`;
  }

  return {
    finalUrl,
    originalUrl: baseUrl,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
    couponParam: cleanCoupon,
    isValidUrl
  };
}

/**
 * Analisa e decodifica uma URL rastreada para telemetria e validação
 */
export function parseTrackedDmUrl(url: string): ParsedTrackedUrl {
  try {
    const urlObj = new URL(sanitizeBaseUrl(url));
    const searchParams = urlObj.searchParams;

    const utmSource = searchParams.get("utm_source") || undefined;
    const utmMedium = searchParams.get("utm_medium") || undefined;
    const utmCampaign = searchParams.get("utm_campaign") || undefined;
    const utmContent = searchParams.get("utm_content") || undefined;
    const utmTerm = searchParams.get("utm_term") || undefined;
    const coupon = searchParams.get("coupon") || searchParams.get("cupom") || undefined;

    const otherParams: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      if (!key.startsWith("utm_") && key !== "coupon" && key !== "cupom") {
        otherParams[key] = val;
      }
    });

    const hasValidDmUtm = Boolean(
      (utmSource === "ig_comment_dm" || utmSource === "tiktok_comment_dm") &&
      (utmMedium === "direct_message" || utmMedium === "comment_private_reply")
    );

    const baseUrl = `${urlObj.origin}${urlObj.pathname}`;

    return {
      baseUrl,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      coupon,
      otherParams,
      hasValidDmUtm
    };
  } catch {
    return {
      baseUrl: url,
      otherParams: {},
      hasValidDmUtm: false
    };
  }
}

/**
 * Validador de Conformidade de URL Rastreada para Direct Message
 */
export function validateTrackedDmUrl(url: string): {
  isValid: boolean;
  hasHttps: boolean;
  hasSource: boolean;
  hasMedium: boolean;
  hasCampaign: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  if (!url || !url.trim()) {
    return {
      isValid: false,
      hasHttps: false,
      hasSource: false,
      hasMedium: false,
      hasCampaign: false,
      warnings: ["URL de destino vazia."]
    };
  }

  const hasHttps = /^https:\/\//i.test(url.trim());
  if (!hasHttps) {
    warnings.push("A URL não utiliza HTTPS seguro. Navegadores modernos podem alertar o usuário.");
  }

  const parsed = parseTrackedDmUrl(url);

  const hasSource = Boolean(parsed.utmSource);
  const hasMedium = Boolean(parsed.utmMedium);
  const hasCampaign = Boolean(parsed.utmCampaign);

  if (!hasSource) {
    warnings.push("Parâmetro 'utm_source=ig_comment_dm' ausente na URL.");
  }
  if (!hasMedium) {
    warnings.push("Parâmetro 'utm_medium=direct_message' ausente na URL.");
  }
  if (!hasCampaign) {
    warnings.push("Parâmetro 'utm_campaign' ausente na URL.");
  }

  const isValid = hasHttps && hasSource && hasMedium;

  return {
    isValid,
    hasHttps,
    hasSource,
    hasMedium,
    hasCampaign,
    warnings
  };
}
