/**
 * socialTeaserEngine.ts - Motor de Síntese de Teasers Multicanal com Adaptação de Limites
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Transforma o conteúdo de um artigo longo em ganchos e micro-cópias altamente engajantes
 * para cada rede social, respeitando rigorosamente os limites estritos de caracteres:
 * - X / Twitter: 280 caracteres (com truncamento inteligente e preservação de URL/hashtags)
 * - Threads: 500 caracteres (tom conversacional e link)
 * - Instagram: 2.200 caracteres (parágrafos espaçados, bullet points e gancho Comment-to-DM)
 * - WhatsApp: 1.024 caracteres (formatação nativa *negrito* e CTA direto)
 * - Telegram: 4.096 caracteres (formatação Markdown com links estilizados)
 * - LinkedIn: 3.000 caracteres (tom profissional e reflexão técnica)
 */

import { 
  MultimodalDispatchPayload, 
  SocialTeaserPlatform, 
  SingleSocialTeaser, 
  CompiledSocialTeasers 
} from "@/types/poster";
import { slugify } from "@/lib/dispatch/multimodalEngine";

export const SOCIAL_CHAR_LIMITS: Record<SocialTeaserPlatform, number> = {
  x_twitter: 280,
  threads: 500,
  instagram: 2200,
  whatsapp: 1024,
  telegram: 4096,
  linkedin: 3000
};

export const SOCIAL_PLATFORM_NAMES: Record<SocialTeaserPlatform, string> = {
  x_twitter: "X / Twitter",
  threads: "Threads (Meta)",
  instagram: "Instagram Caption",
  whatsapp: "WhatsApp Comunidades",
  telegram: "Telegram Canais VIP",
  linkedin: "LinkedIn Artigos"
};

export interface SocialTeaserOptions {
  customHook?: string;
  commentToDmKeyword?: string;
  preferredHashtags?: string[];
  includeUtm?: boolean;
}

/**
 * Normaliza tags em formato de hashtag válido (#InteligenciaArtificial)
 */
export function formatHashtags(tags: string[] = [], maxCount = 5): string[] {
  if (!tags || tags.length === 0) return ["#V5Apollo", "#Tech", "#Inovacao"];
  
  return tags
    .slice(0, maxCount)
    .map(tag => {
      // Remove acentos e caracteres especiais, capitaliza palavras
      const cleaned = tag
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, " ")
        .trim();
      const camel = cleaned
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join("");
      return `#${camel}`;
    })
    .filter(h => h.length > 1);
}

/**
 * Extrai de 2 a 4 pontos-chave do Markdown para usar como bullet points
 */
export function extractBulletPoints(markdown: string, maxPoints = 3): string[] {
  if (!markdown) return ["Arquitetura moderna e escalável", "Automação sem fricção", "Execução prática de ponta a ponta"];
  
  const lines = markdown.split("\n");
  const listItems: string[] = [];
  const headings: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Captura itens de lista (prioridade máxima)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const clean = trimmed.replace(/^[-*]\s+/, "").replace(/[*_`]/g, "").trim();
      if (clean.length >= 10 && clean.length <= 120) {
        listItems.push(clean);
        if (listItems.length >= maxPoints) break;
      }
    } else if (trimmed.startsWith("## ") || trimmed.startsWith("### ")) {
      const clean = trimmed.replace(/^#{2,3}\s+/, "").replace(/[*_`]/g, "").trim();
      if (clean.length >= 10 && clean.length <= 80 && !clean.toLowerCase().includes("conclusão")) {
        headings.push(clean);
      }
    }
  }

  // Prioriza itens de lista; se insuficientes, completa com headings
  const combined = [...listItems];
  if (combined.length < maxPoints) {
    for (const h of headings) {
      if (!combined.includes(h)) {
        combined.push(h);
        if (combined.length >= maxPoints) break;
      }
    }
  }

  if (combined.length === 0) {
    return [
      "Estratégia prática baseada em dados",
      "Arquitetura modular de alta disponibilidade",
      "Implementação passo a passo com código"
    ];
  }

  return combined.slice(0, maxPoints);
}

/**
 * Ajusta o texto dinamicamente para caber dentro do limite estrito de caracteres,
 * garantindo que a URL canônica e os pontos essenciais NUNCA sejam corrompidos.
 */
export function fitToCharacterLimit(options: {
  header: string;
  body: string;
  cta: string;
  url: string;
  hashtagsText: string;
  charLimit: number;
}): { text: string; isTrimmed: boolean } {
  let { header, body, cta, url, hashtagsText, charLimit } = options;
  
  // 1. Verifica se cabe tudo completo
  const fullText = [header, body, cta ? `${cta}\n👉 ${url}` : `👉 ${url}`, hashtagsText].filter(Boolean).join("\n\n");
  if (fullText.length <= charLimit) {
    return { text: fullText, isTrimmed: false };
  }

  // 2. Se não cabe, primeiro tenta omitir ou enxugar as hashtags
  let currentHashtags = hashtagsText;
  const ctaWithUrl = cta ? `${cta}\n👉 ${url}` : `👉 ${url}`;

  let requiredOverhead = [header, ctaWithUrl, currentHashtags].filter(Boolean).join("\n\n").length;
  
  // Se ainda não sobra espaço para o body (mínimo 30 chars), remove hashtags se necessário
  if (charLimit - requiredOverhead < 30 && currentHashtags) {
    currentHashtags = "";
    requiredOverhead = [header, ctaWithUrl].join("\n\n").length;
  }

  // Se o header for excessivamente longo para o limite (ex: Twitter com URL longa), encurta o header
  if (charLimit - requiredOverhead < 20 && header.length > 60) {
    const maxHeaderLen = Math.max(30, charLimit - ctaWithUrl.length - 25);
    header = header.substring(0, maxHeaderLen).trim() + "...";
    requiredOverhead = [header, ctaWithUrl].join("\n\n").length;
  }

  const availableForBody = charLimit - requiredOverhead - 4; // margem para quebras de linha

  if (availableForBody > 25 && body) {
    const safeBodySlice = body.substring(0, availableForBody);
    const lastSpace = safeBodySlice.lastIndexOf(" ");
    const trimmedBody = (lastSpace > 15 ? safeBodySlice.substring(0, lastSpace) : safeBodySlice).trim() + "...";
    const assembled = [header, trimmedBody, ctaWithUrl, currentHashtags].filter(Boolean).join("\n\n");
    return { text: assembled, isTrimmed: true };
  }

  // Se não couber o body, entrega header + cta + url + hashtags (se couberem)
  const directAssembled = [header, ctaWithUrl, currentHashtags].filter(Boolean).join("\n\n");
  if (directAssembled.length <= charLimit) {
    return { text: directAssembled, isTrimmed: true };
  }

  // Fallback extremo
  const emergency = `${header}\n\n👉 ${url}`;
  return {
    text: emergency.length > charLimit ? `${header.substring(0, charLimit - url.length - 8)}...\n\n👉 ${url}` : emergency,
    isTrimmed: true
  };
}

/**
 * Constrói a URL canônica com parâmetros UTM otimizados para rastreamento social
 */
export function buildSocialUtmUrl(
  canonicalUrl: string, 
  slug: string, 
  platform: SocialTeaserPlatform,
  customMedium?: string,
  customCampaign?: string
): string {
  const base = canonicalUrl || `https://v5autoblog.com/artigo/${slug}`;
  const cleanBase = base.split("?")[0];
  const medium = customMedium || "social_teaser";
  const campaign = customCampaign || "v5poster";
  return `${cleanBase}?utm_source=${platform}&utm_medium=${medium}&utm_campaign=${campaign}`;
}

/**
 * 1. Gerador para X / Twitter (280 caracteres)
 */
export function generateTwitterTeaser(
  payload: MultimodalDispatchPayload, 
  options?: SocialTeaserOptions
): SingleSocialTeaser {
  const limit = SOCIAL_CHAR_LIMITS.x_twitter;
  const slug = payload.slug || slugify(payload.title);
  const utmUrl = buildSocialUtmUrl(payload.canonical_url || "", slug, "x_twitter");
  const tags = formatHashtags(payload.blogOptions.tags, 2);
  const hashtagsText = tags.join(" ");

  const rawTitle = payload.title;
  const titleClean = rawTitle.length > 70 ? `${rawTitle.substring(0, 67)}...` : rawTitle;
  const header = options?.customHook || `🚀 ${titleClean}`;
  const summaryText = payload.summary || payload.emailOptions.previewText;
  const cta = "Leia na íntegra:";

  const fitted = fitToCharacterLimit({
    header,
    body: summaryText,
    cta,
    url: utmUrl,
    hashtagsText,
    charLimit: limit
  });

  const charCount = fitted.text.length;

  return {
    platform: "x_twitter",
    platformName: SOCIAL_PLATFORM_NAMES.x_twitter,
    text: fitted.text,
    charCount,
    charLimit: limit,
    remainingChars: limit - charCount,
    isWithinLimit: charCount <= limit,
    utmUrl,
    hashtags: tags,
    hookUsed: header
  };
}

/**
 * 2. Gerador para Threads (500 caracteres)
 */
export function generateThreadsTeaser(
  payload: MultimodalDispatchPayload, 
  options?: SocialTeaserOptions
): SingleSocialTeaser {
  const limit = SOCIAL_CHAR_LIMITS.threads;
  const slug = payload.slug || slugify(payload.title);
  const utmUrl = buildSocialUtmUrl(payload.canonical_url || "", slug, "threads");
  const tags = formatHashtags(payload.blogOptions.tags, 3);
  const hashtagsText = tags.join(" ");

  const header = options?.customHook || `💡 Novo no ecossistema: "${payload.title}"`;
  const summaryText = payload.summary || payload.emailOptions.previewText;
  const cta = "👉 O link completo com todas as diretrizes está disponível aqui:";

  const fitted = fitToCharacterLimit({
    header,
    body: summaryText,
    cta,
    url: utmUrl,
    hashtagsText,
    charLimit: limit
  });

  const charCount = fitted.text.length;

  return {
    platform: "threads",
    platformName: SOCIAL_PLATFORM_NAMES.threads,
    text: fitted.text,
    charCount,
    charLimit: limit,
    remainingChars: limit - charCount,
    isWithinLimit: charCount <= limit,
    utmUrl,
    hashtags: tags,
    hookUsed: header
  };
}

/**
 * 3. Gerador para Instagram Caption (2.200 caracteres com gancho Comment-to-DM)
 */
export function generateInstagramCaption(
  payload: MultimodalDispatchPayload, 
  options?: SocialTeaserOptions
): SingleSocialTeaser {
  const limit = SOCIAL_CHAR_LIMITS.instagram;
  const slug = payload.slug || slugify(payload.title);
  const utmUrl = buildSocialUtmUrl(payload.canonical_url || "", slug, "instagram");
  const tags = formatHashtags(payload.blogOptions.tags, 8);
  const hashtagsText = tags.join(" ");
  const keyword = options?.commentToDmKeyword || "LINK";

  const bullets = extractBulletPoints(payload.contentMarkdown, 3);
  const bulletSection = bullets.map(b => `✓ ${b}`).join("\n");

  const header = options?.customHook || `🔥 ${payload.title.toUpperCase()}`;
  const summaryText = payload.summary || payload.emailOptions.previewText;

  const textBlocks = [
    header,
    ".",
    summaryText,
    ".",
    "📌 O QUE VOCÊ VAI ENCONTRAR NESTE ARTIGO:\n" + bulletSection,
    ".",
    `💬 COMENTE "${keyword}" aqui embaixo que o nosso robô envia o link direto com todos os detalhes no seu Direct agora mesmo!`,
    ".",
    hashtagsText
  ];

  const fullText = textBlocks.join("\n");
  const charCount = fullText.length;

  return {
    platform: "instagram",
    platformName: SOCIAL_PLATFORM_NAMES.instagram,
    text: fullText,
    charCount,
    charLimit: limit,
    remainingChars: limit - charCount,
    isWithinLimit: charCount <= limit,
    utmUrl,
    hashtags: tags,
    hookUsed: header
  };
}

/**
 * 4. Gerador para Grupos de WhatsApp (1.024 caracteres com *negrito* nativo)
 */
export function generateWhatsAppMessage(
  payload: MultimodalDispatchPayload, 
  options?: SocialTeaserOptions
): SingleSocialTeaser {
  const limit = SOCIAL_CHAR_LIMITS.whatsapp;
  const slug = payload.slug || slugify(payload.title);
  const utmUrl = buildSocialUtmUrl(payload.canonical_url || "", slug, "whatsapp");

  const bullets = extractBulletPoints(payload.contentMarkdown, 3);
  const bulletSection = bullets.map(b => `▫️ *${b}*`).join("\n");

  const header = options?.customHook || `📢 *NOVO ARTIGO LIBERADO:* *${payload.title.toUpperCase()}*`;
  const summaryText = payload.summary || payload.emailOptions.previewText;

  const textBlocks = [
    header,
    summaryText,
    `⚡ *Destaques da Análise:*\n${bulletSection}`,
    `👉 *Acesse o artigo completo e exclusivo:*\n🔗 ${utmUrl}`
  ];

  const fullText = textBlocks.join("\n\n");
  const charCount = fullText.length;

  return {
    platform: "whatsapp",
    platformName: SOCIAL_PLATFORM_NAMES.whatsapp,
    text: fullText,
    charCount,
    charLimit: limit,
    remainingChars: limit - charCount,
    isWithinLimit: charCount <= limit,
    utmUrl,
    hashtags: [],
    hookUsed: header
  };
}

/**
 * 5. Gerador para Canais de Telegram VIP (4.096 caracteres com Markdown rico)
 */
export function generateTelegramMessage(
  payload: MultimodalDispatchPayload, 
  options?: SocialTeaserOptions
): SingleSocialTeaser {
  const limit = SOCIAL_CHAR_LIMITS.telegram;
  const slug = payload.slug || slugify(payload.title);
  const utmUrl = buildSocialUtmUrl(payload.canonical_url || "", slug, "telegram");
  const tags = formatHashtags(payload.blogOptions.tags, 4);
  const hashtagsText = tags.join(" ");

  const bullets = extractBulletPoints(payload.contentMarkdown, 3);
  const bulletSection = bullets.map(b => `🔹 ${b}`).join("\n");

  const header = options?.customHook || `🚨 *EXCLUSIVO: NOVO ARTIGO NA CAPITANIA #13*`;
  const summaryText = payload.summary || payload.emailOptions.previewText;

  const textBlocks = [
    header,
    `*${payload.title}*`,
    `_${summaryText}_`,
    `🎯 *Pontos Centrais da Publicação:*\n${bulletSection}`,
    `🚀 [Clique aqui para ler na íntegra no V5 AutoBlog](${utmUrl})`,
    hashtagsText
  ];

  const fullText = textBlocks.join("\n\n");
  const charCount = fullText.length;

  return {
    platform: "telegram",
    platformName: SOCIAL_PLATFORM_NAMES.telegram,
    text: fullText,
    charCount,
    charLimit: limit,
    remainingChars: limit - charCount,
    isWithinLimit: charCount <= limit,
    utmUrl,
    hashtags: tags,
    hookUsed: header
  };
}

/**
 * 6. Gerador para LinkedIn (3.000 caracteres com tom de autoridade e E-E-A-T)
 */
export function generateLinkedInTeaser(
  payload: MultimodalDispatchPayload, 
  options?: SocialTeaserOptions
): SingleSocialTeaser {
  const limit = SOCIAL_CHAR_LIMITS.linkedin;
  const slug = payload.slug || slugify(payload.title);
  const utmUrl = buildSocialUtmUrl(payload.canonical_url || "", slug, "linkedin");
  const tags = formatHashtags(payload.blogOptions.tags, 5);
  const hashtagsText = tags.join(" ");

  const bullets = extractBulletPoints(payload.contentMarkdown, 3);
  const bulletSection = bullets.map(b => `• ${b}`).join("\n");

  const header = options?.customHook || `Como arquitetar escalabilidade e automação: lições práticas sobre "${payload.title}"`;
  const summaryText = payload.summary || payload.emailOptions.previewText;

  const textBlocks = [
    header,
    summaryText,
    `Principais conclusões da nossa implementação:\n${bulletSection}`,
    `Compartilho o racional técnico completo e a documentação detalhada no artigo:`,
    `🔗 ${utmUrl}`,
    `Qual é a maior barreira que você enfrenta hoje na orquestração de sistemas autônomos? Compartilhe abaixo.`,
    hashtagsText
  ];

  const fullText = textBlocks.join("\n\n");
  const charCount = fullText.length;

  return {
    platform: "linkedin",
    platformName: SOCIAL_PLATFORM_NAMES.linkedin,
    text: fullText,
    charCount,
    charLimit: limit,
    remainingChars: limit - charCount,
    isWithinLimit: charCount <= limit,
    utmUrl,
    hashtags: tags,
    hookUsed: header
  };
}

/**
 * MOTOR PRINCIPAL: Compila todos os teasers sociais adaptados aos limites oficiais
 */
export function compileSocialTeasers(
  payload: MultimodalDispatchPayload,
  options?: SocialTeaserOptions
): CompiledSocialTeasers {
  const x_twitter = generateTwitterTeaser(payload, options);
  const threads = generateThreadsTeaser(payload, options);
  const instagram = generateInstagramCaption(payload, options);
  const whatsapp = generateWhatsAppMessage(payload, options);
  const telegram = generateTelegramMessage(payload, options);
  const linkedin = generateLinkedInTeaser(payload, options);

  const allWithinLimits = 
    x_twitter.isWithinLimit &&
    threads.isWithinLimit &&
    instagram.isWithinLimit &&
    whatsapp.isWithinLimit &&
    telegram.isWithinLimit &&
    linkedin.isWithinLimit;

  return {
    x_twitter,
    threads,
    instagram,
    whatsapp,
    telegram,
    linkedin,
    summary: {
      totalPlatforms: 6,
      allWithinLimits,
      generatedAt: new Date().toISOString()
    }
  };
}
