/**
 * affiliateLinkShortener.ts - Construtor de Encurtador de Link de Afiliado com Injeção de UTMs
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Arquitetura de Rastreamento de Afiliados para Grupos VIP (Finders Hub):
 * - Injeção padronizada de UTMs:
 *   • Telegram: utm_source=telegram_vip, utm_medium=broadcast_channel
 *   • WhatsApp: utm_source=whatsapp_vip, utm_medium=community_vip
 *   • Campanha: slug do produto ou da loja
 *   • Conteúdo: loja de afiliados (Shopee, Mercado Livre, Amazon, AliExpress, Magalu)
 *   • Termo: cupom de desconto ou percentual OFF
 * - Geração de links curtos amigáveis (v5p.st ou v5finder.link) para máxima legibilidade
 * - Preservação estrita de tags de afiliado originais (tag=, matt_tool=, af_sub, etc.)
 */

export interface UtmParams {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term?: string;
}

export interface PlatformShortLink {
  platform: "telegram" | "whatsapp" | "generic";
  originalUrl: string;
  trackedLongUrl: string;
  shortUrl: string;
  shortCode: string;
  domain: string;
  utmParams: UtmParams;
}

export interface ShortenDealOptions {
  dealId?: string;
  productName: string;
  store: string;
  rawUrl: string;
  couponCode?: string;
  discountPercentage?: number;
  domain?: string;
  platform?: "telegram" | "whatsapp" | "generic";
}

export interface DualPlatformLinksResult {
  telegram: PlatformShortLink;
  whatsapp: PlatformShortLink;
  generic: PlatformShortLink;
}

export interface ParsedAffiliateLink {
  baseUrl: string;
  utmParams: Partial<UtmParams>;
  hasV5PosterUtm: boolean;
  detectedPlatform?: "telegram" | "whatsapp" | "generic";
  originalAffiliateParams: Record<string, string>;
}

export const DEFAULT_SHORTENER_DOMAIN = "v5p.st";
export const SUPPORTED_SHORTENER_DOMAINS = ["v5p.st", "v5finder.link", "achadinho.vip"] as const;

/**
 * Converte strings para formato seguro de slug para URL e UTM (sem acentos ou caracteres especiais)
 */
export function slugifyUtm(text: string): string {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ª/g, "a")
    .replace(/º/g, "o")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Garante que a URL base possua o protocolo http ou https
 */
export function sanitizeUrl(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * Constrói os parâmetros UTM oficiais do V5 Poster para cada plataforma de destino
 */
export function buildPlatformUtmParams(
  options: ShortenDealOptions,
  platform: "telegram" | "whatsapp" | "generic" = "generic"
): UtmParams {
  const { productName, store, couponCode, discountPercentage } = options;

  let utm_source: string;
  let utm_medium: string;

  switch (platform) {
    case "telegram":
      utm_source = "telegram_vip";
      utm_medium = "broadcast_channel";
      break;
    case "whatsapp":
      utm_source = "whatsapp_vip";
      utm_medium = "community_vip";
      break;
    case "generic":
    default:
      utm_source = "v5_finders_vip";
      utm_medium = "vip_deal";
      break;
  }

  // utm_campaign: slug do produto truncado em 40 caracteres para não poluir analytics
  const cleanProductSlug = slugifyUtm(productName).slice(0, 40) || "achadinho-vip";
  const utm_campaign = cleanProductSlug;

  // utm_content: loja de origem em minúsculas
  const utm_content = slugifyUtm(store) || "store";

  // utm_term: cupom promocional ou % de desconto
  let utm_term: string | undefined;
  if (couponCode && couponCode.trim()) {
    utm_term = `cupom_${slugifyUtm(couponCode.trim())}`;
  } else if (discountPercentage && discountPercentage > 0) {
    utm_term = `desc_${Math.round(discountPercentage)}off`;
  }

  return {
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    ...(utm_term ? { utm_term } : {})
  };
}

/**
 * Injeta parâmetros UTM em uma URL preexistente preservando tags de afiliados e query params
 */
export function injectUtmToUrl(
  rawUrl: string,
  utmParams: UtmParams,
  couponCode?: string
): string {
  const sanitized = sanitizeUrl(rawUrl);

  try {
    const urlObj = new URL(sanitized);

    // Injeta os parâmetros UTM padrão
    urlObj.searchParams.set("utm_source", utmParams.utm_source);
    urlObj.searchParams.set("utm_medium", utmParams.utm_medium);
    urlObj.searchParams.set("utm_campaign", utmParams.utm_campaign);
    urlObj.searchParams.set("utm_content", utmParams.utm_content);

    if (utmParams.utm_term) {
      urlObj.searchParams.set("utm_term", utmParams.utm_term);
    }

    // Se houver cupom, anexa parâmetro coupon para checkout auto-aplicável onde suportado
    if (couponCode && couponCode.trim()) {
      urlObj.searchParams.set("coupon", couponCode.trim().toUpperCase());
    }

    return urlObj.toString();
  } catch {
    // Fallback caso a URL seja inválida
    const separator = sanitized.includes("?") ? "&" : "?";
    const queryParts = [
      `utm_source=${encodeURIComponent(utmParams.utm_source)}`,
      `utm_medium=${encodeURIComponent(utmParams.utm_medium)}`,
      `utm_campaign=${encodeURIComponent(utmParams.utm_campaign)}`,
      `utm_content=${encodeURIComponent(utmParams.utm_content)}`
    ];

    if (utmParams.utm_term) {
      queryParts.push(`utm_term=${encodeURIComponent(utmParams.utm_term)}`);
    }

    if (couponCode && couponCode.trim()) {
      queryParts.push(`coupon=${encodeURIComponent(couponCode.trim().toUpperCase())}`);
    }

    return `${sanitized}${separator}${queryParts.join("&")}`;
  }
}

/**
 * Gera um código curto determinístico alfanumérico baseado no produto, loja e hash
 */
export function generateDeterministicShortCode(
  input: string,
  length: number = 7
): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // Converte para inteiro de 32 bits
  }

  const positiveHash = Math.abs(hash);
  // Converte para Base36 (0-9, a-z)
  const base36 = positiveHash.toString(36);

  if (base36.length >= length) {
    return base36.slice(0, length);
  }

  // Preenche caso o hash seja muito curto
  const padding = "v5poster".slice(0, length - base36.length);
  return `${base36}${padding}`;
}

/**
 * Encurta o link de afiliado com injeção de parâmetros UTM para uma plataforma específica
 */
export function shortenAffiliateLink(options: ShortenDealOptions): PlatformShortLink {
  const platform = options.platform || "generic";
  const domain = options.domain || DEFAULT_SHORTENER_DOMAIN;

  const utmParams = buildPlatformUtmParams(options, platform);
  const trackedLongUrl = injectUtmToUrl(options.rawUrl, utmParams, options.couponCode);

  // Gera código curto determinístico usando a URL final rastreada + plataforma
  const seedString = `${options.dealId || options.rawUrl}_${platform}_${options.productName}`;
  const shortCode = generateDeterministicShortCode(seedString, 7);
  const shortUrl = `https://${domain}/d/${shortCode}`;

  return {
    platform,
    originalUrl: options.rawUrl,
    trackedLongUrl,
    shortUrl,
    shortCode,
    domain,
    utmParams
  };
}

/**
 * Gera os links encurtados com UTMs dedicadas tanto para Telegram quanto para WhatsApp
 */
export function generateDualPlatformLinks(
  options: Omit<ShortenDealOptions, "platform">
): DualPlatformLinksResult {
  const telegram = shortenAffiliateLink({ ...options, platform: "telegram" });
  const whatsapp = shortenAffiliateLink({ ...options, platform: "whatsapp" });
  const generic = shortenAffiliateLink({ ...options, platform: "generic" });

  return {
    telegram,
    whatsapp,
    generic
  };
}

/**
 * Decodifica e analisa os parâmetros UTM de uma URL de afiliado
 */
export function parseTrackedAffiliateUrl(url: string): ParsedAffiliateLink {
  const sanitized = sanitizeUrl(url);

  try {
    const urlObj = new URL(sanitized);
    const utmParams: Partial<UtmParams> = {};
    const originalAffiliateParams: Record<string, string> = {};

    urlObj.searchParams.forEach((value, key) => {
      if (key === "utm_source") utmParams.utm_source = value;
      else if (key === "utm_medium") utmParams.utm_medium = value;
      else if (key === "utm_campaign") utmParams.utm_campaign = value;
      else if (key === "utm_content") utmParams.utm_content = value;
      else if (key === "utm_term") utmParams.utm_term = value;
      else {
        originalAffiliateParams[key] = value;
      }
    });

    let detectedPlatform: "telegram" | "whatsapp" | "generic" | undefined;
    if (utmParams.utm_source === "telegram_vip") detectedPlatform = "telegram";
    else if (utmParams.utm_source === "whatsapp_vip") detectedPlatform = "whatsapp";
    else if (utmParams.utm_source === "v5_finders_vip") detectedPlatform = "generic";

    const hasV5PosterUtm = Boolean(
      utmParams.utm_source &&
      (utmParams.utm_source.includes("telegram") ||
        utmParams.utm_source.includes("whatsapp") ||
        utmParams.utm_source.includes("v5_finders"))
    );

    return {
      baseUrl: `${urlObj.origin}${urlObj.pathname}`,
      utmParams,
      hasV5PosterUtm,
      detectedPlatform,
      originalAffiliateParams
    };
  } catch {
    return {
      baseUrl: sanitized,
      utmParams: {},
      hasV5PosterUtm: false,
      originalAffiliateParams: {}
    };
  }
}
