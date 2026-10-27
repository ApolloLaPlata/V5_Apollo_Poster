/**
 * socialCardGenerator.ts - Motor de Ativos de Mídia e Cards Sociais Gerados
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Gera cards sociais em SVG e gerencia ativos de mídia para redes sociais:
 * - 3 Proporções Oficiais: 16:9 (Twitter/LinkedIn), 1:1 (Feed/WhatsApp), 4:5 (Carrossel)
 * - 4 Temas Visuais: Dark Apollo, Cyber Neon, Minimal Editorial e Emerald Matrix
 * - Galeria de Imagens de Alta Resolução curadas por verticais da holding
 * - Geração de data-URI SVG renderizável diretamente no browser sem servidor externo
 */

import { MultimodalDispatchPayload } from "@/types/poster";

export type SocialMediaAspectRatio = "16:9" | "1:1" | "4:5";
export type SocialCardTheme = "dark_apollo" | "cyber_neon" | "minimal_editorial" | "emerald_matrix";
export type SocialMediaSourceType = "cover_article" | "generated_card" | "preset_gallery" | "custom_url";

export interface AspectRatioConfig {
  ratio: SocialMediaAspectRatio;
  width: number;
  height: number;
  label: string;
  recommendedFor: string[];
}

export interface SocialCardThemeConfig {
  id: SocialCardTheme;
  name: string;
  emoji: string;
  bgGradient: { from: string; to: string; accent: string };
  textColor: string;
  subtextColor: string;
  badgeBg: string;
  badgeText: string;
}

export interface CuratedPresetImage {
  id: string;
  category: string;
  label: string;
  url: string;
  alt: string;
}

export interface SocialMediaAsset {
  url: string;
  altText: string;
  aspectRatio: SocialMediaAspectRatio;
  sourceType: SocialMediaSourceType;
  theme?: SocialCardTheme;
  width: number;
  height: number;
  isGeneratedSvg: boolean;
}

export const ASPECT_RATIO_CONFIGS: Record<SocialMediaAspectRatio, AspectRatioConfig> = {
  "16:9": {
    ratio: "16:9",
    width: 1200,
    height: 675,
    label: "16:9 Paisagem",
    recommendedFor: ["X / Twitter", "LinkedIn", "Facebook", "Web Open Graph"]
  },
  "1:1": {
    ratio: "1:1",
    width: 1080,
    height: 1080,
    label: "1:1 Quadrado",
    recommendedFor: ["Feed Instagram", "WhatsApp Grupos", "Telegram Canais"]
  },
  "4:5": {
    ratio: "4:5",
    width: 1080,
    height: 1350,
    label: "4:5 Retrato Vertical",
    recommendedFor: ["Carrossel Instagram", "Threads", "TikTok Foto"]
  }
};

export const SOCIAL_CARD_THEMES: Record<SocialCardTheme, SocialCardThemeConfig> = {
  dark_apollo: {
    id: "dark_apollo",
    name: "Dark Apollo",
    emoji: "🏛️",
    bgGradient: { from: "#09090b", to: "#18181b", accent: "#d97706" },
    textColor: "#fafafa",
    subtextColor: "#a1a1aa",
    badgeBg: "rgba(217, 119, 6, 0.2)",
    badgeText: "#fbbf24"
  },
  cyber_neon: {
    id: "cyber_neon",
    name: "Cyber Neon",
    emoji: "⚡",
    bgGradient: { from: "#050b14", to: "#0a192f", accent: "#00f0ff" },
    textColor: "#f0fdf4",
    subtextColor: "#64748b",
    badgeBg: "rgba(0, 240, 255, 0.2)",
    badgeText: "#38bdf8"
  },
  minimal_editorial: {
    id: "minimal_editorial",
    name: "Minimal Editorial",
    emoji: "📰",
    bgGradient: { from: "#121212", to: "#1e1e1e", accent: "#ffffff" },
    textColor: "#ffffff",
    subtextColor: "#9ca3af",
    badgeBg: "rgba(255, 255, 255, 0.15)",
    badgeText: "#f3f4f6"
  },
  emerald_matrix: {
    id: "emerald_matrix",
    name: "Emerald Matrix",
    emoji: "💎",
    bgGradient: { from: "#022c22", to: "#064e3b", accent: "#10b981" },
    textColor: "#ecfdf5",
    subtextColor: "#6ee7b7",
    badgeBg: "rgba(16, 185, 129, 0.25)",
    badgeText: "#34d399"
  }
};

export const CURATED_SOCIAL_PRESETS: CuratedPresetImage[] = [
  {
    id: "ai_abstract",
    category: "Inteligência Artificial",
    label: "Redes Neurais & IA Cognitiva",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
    alt: "Fluxo de inteligência artificial abstrato com nós neurais luminosos"
  },
  {
    id: "cloud_infra",
    category: "Cloud & Datacenter",
    label: "Datacenter & Computação em Nuvem",
    url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200",
    alt: "Racks de servidores em datacenter de alta tecnologia com luzes azuis"
  },
  {
    id: "saas_metrics",
    category: "SaaS & Analytics",
    label: "Dashboards & Escala de Negócios",
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200",
    alt: "Gráficos de crescimento de receita e analytics empresarial"
  },
  {
    id: "finance_wealth",
    category: "Finanças Digitais",
    label: "Fintech & Mercado Financeiro",
    url: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200",
    alt: "Performance financeira digital e ativos de alta rentabilidade"
  },
  {
    id: "content_creator",
    category: "Mídia & Redes",
    label: "Produção de Conteúdo & Broadcasting",
    url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200",
    alt: "Microfone e mesa de áudio para distribuição de conteúdo onicanal"
  },
  {
    id: "code_architecture",
    category: "Engenharia de Software",
    label: "Código Fonte & Arquitetura Limpa",
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200",
    alt: "Editor de código com sintaxe colorida em tela escura de engenharia"
  }
];

/**
 * Escapa strings para inclusão segura dentro de atributos XML/SVG
 */
function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Gera um Card Social em SVG com tipografia, selos da Holding V5 Apollo e gradiente moderno
 */
export function generateSvgSocialCard(
  payload: MultimodalDispatchPayload,
  theme: SocialCardTheme = "dark_apollo",
  aspectRatio: SocialMediaAspectRatio = "16:9"
): string {
  const config = ASPECT_RATIO_CONFIGS[aspectRatio] || ASPECT_RATIO_CONFIGS["16:9"];
  const themeConfig = SOCIAL_CARD_THEMES[theme] || SOCIAL_CARD_THEMES.dark_apollo;

  const width = config.width;
  const height = config.height;

  const title = escapeXml(payload.title || "Artigo Oficial V5 Apollo");
  const category = escapeXml((payload.blogOptions?.category || "Engenharia & Negócios").toUpperCase());
  const author = escapeXml(payload.blogOptions?.author || "Apollo La Plata");
  const summary = escapeXml(
    (payload.summary || payload.emailOptions?.previewText || "Conteúdo exclusivo da Holding V5 Apollo.")
      .substring(0, 160) + "..."
  );

  // Divide o título em até 3 linhas para garantir leitura perfeita no SVG
  const words = title.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + " " + word).trim().length <= 34) {
      currentLine = (currentLine + " " + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
      if (lines.length >= 2) break;
    }
  }
  if (currentLine && lines.length < 3) {
    lines.push(currentLine);
  }

  const titleSvgSpans = lines
    .map((l, i) => `<tspan x="80" dy="${i === 0 ? 0 : 54}">${l}</tspan>`)
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${themeConfig.bgGradient.from}" />
      <stop offset="100%" stop-color="${themeConfig.bgGradient.to}" />
    </linearGradient>
    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${themeConfig.bgGradient.accent}" />
      <stop offset="100%" stop-color="${themeConfig.textColor}" />
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="rgba(0,0,0,0.5)" />
    </filter>
  </defs>

  <!-- Fundo com Gradiente -->
  <rect width="${width}" height="${height}" fill="url(#bgGradient)" />

  <!-- Borda Sutil Estilizada -->
  <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="24" fill="none" stroke="${themeConfig.subtextColor}" stroke-width="1.5" stroke-opacity="0.2" />

  <!-- Decoração Geométrica Abstrata -->
  <circle cx="${width - 120}" cy="120" r="220" fill="${themeConfig.bgGradient.accent}" fill-opacity="0.06" filter="blur(60px)" />
  <circle cx="100" cy="${height - 100}" r="180" fill="${themeConfig.bgGradient.accent}" fill-opacity="0.04" filter="blur(50px)" />

  <!-- Cabeçalho: Badge de Categoria e Marca -->
  <g transform="translate(80, 80)">
    <!-- Badge Categoria -->
    <rect x="0" y="0" width="${category.length * 11 + 32}" height="36" rx="18" fill="${themeConfig.badgeBg}" stroke="${themeConfig.badgeText}" stroke-opacity="0.3" stroke-width="1" />
    <text x="16" y="23" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" letter-spacing="1.5" fill="${themeConfig.badgeText}">${category}</text>

    <!-- Branding Capitania #13 Poster -->
    <text x="${width - 240}" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" letter-spacing="0.5" fill="${themeConfig.subtextColor}">
      V5 APOLLO POSTER :3011
    </text>
  </g>

  <!-- Título Principal -->
  <text x="80" y="${height * 0.42}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="800" fill="${themeConfig.textColor}" letter-spacing="-0.5" filter="url(#shadow)">
    ${titleSvgSpans}
  </text>

  <!-- Resumo Conciso -->
  <text x="80" y="${height * 0.68}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="400" fill="${themeConfig.subtextColor}" width="${width - 160}">
    ${summary}
  </text>

  <!-- Barra Decorativa de Destaque -->
  <rect x="80" y="${height * 0.77}" width="120" height="4" rx="2" fill="url(#accentGradient)" />

  <!-- Rodapé do Card: Autor e Domínio Oficial -->
  <g transform="translate(80, ${height - 90})">
    <!-- Avatar / Ícone Oficial -->
    <circle cx="20" cy="20" r="20" fill="${themeConfig.bgGradient.accent}" fill-opacity="0.25" />
    <text x="20" y="26" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="15" fill="${themeConfig.textColor}">🏛️</text>

    <!-- Nome do Autor -->
    <text x="52" y="18" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="15" font-weight="600" fill="${themeConfig.textColor}">
      ${author}
    </text>
    <text x="52" y="34" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="${themeConfig.subtextColor}">
      Capitania #13 • Central Onicanal
    </text>

    <!-- Domínio Oficial -->
    <text x="${width - 240}" y="26" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600" fill="${themeConfig.badgeText}">
      v5autoblog.com
    </text>
  </g>
</svg>`;

  return svg;
}

/**
 * Converte o SVG em uma Data URI utilizável em tags <img>
 */
export function getSvgDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Constrói o objeto de ativo de mídia social completo pronto para o poster
 */
export function buildSocialMediaAsset(
  payload: MultimodalDispatchPayload,
  sourceType: SocialMediaSourceType = "cover_article",
  aspectRatio: SocialMediaAspectRatio = "16:9",
  theme: SocialCardTheme = "dark_apollo",
  customUrl?: string
): SocialMediaAsset {
  const config = ASPECT_RATIO_CONFIGS[aspectRatio] || ASPECT_RATIO_CONFIGS["16:9"];
  let finalUrl = payload.coverImageUrl || CURATED_SOCIAL_PRESETS[0].url;
  let isGeneratedSvg = false;

  if (sourceType === "generated_card") {
    const svg = generateSvgSocialCard(payload, theme, aspectRatio);
    finalUrl = getSvgDataUri(svg);
    isGeneratedSvg = true;
  } else if (sourceType === "custom_url" && customUrl) {
    finalUrl = customUrl;
  }

  return {
    url: finalUrl,
    altText: payload.coverImageAlt || payload.title,
    aspectRatio,
    sourceType,
    theme,
    width: config.width,
    height: config.height,
    isGeneratedSvg
  };
}
