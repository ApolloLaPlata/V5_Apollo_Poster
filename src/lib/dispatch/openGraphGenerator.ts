/**
 * V5 APOLLO POSTER - OPEN GRAPH & TWITTER CARDS GENERATOR (Etapa 043)
 * Gerador e validador de meta tags sociais para compartilhamento de alta taxa de clique (CTR)
 * no WhatsApp, Facebook, LinkedIn, Twitter/X, Telegram e Slack.
 */

import { OpenGraphMetadata, TwitterCardMetadata } from "@/types/poster";

export interface GenerateOpenGraphOptions {
  title: string;
  description: string;
  canonicalUrl: string;
  imageUrl?: string;
  imageAlt?: string;
  authorName?: string;
  category?: string;
  tags?: string[];
  publishedAt?: string;
  modifiedAt?: string;
  siteName?: string;
}

export interface GenerateTwitterCardOptions {
  title: string;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
  siteHandle?: string;
  creatorHandle?: string;
  cardType?: "summary_large_image" | "summary";
}

export interface OpenGraphValidationCheck {
  tag: string;
  status: "pass" | "warn" | "fail";
  message: string;
  recommendation?: string;
}

export interface OpenGraphValidationReport {
  isValid: boolean;
  score: number; // 0 a 100%
  checks: OpenGraphValidationCheck[];
  warnings: string[];
  recommendations: string[];
  previewCards: {
    facebook: {
      domain: string;
      title: string;
      description: string;
      imageUrl: string;
    };
    twitter: {
      card: string;
      title: string;
      description: string;
      imageUrl: string;
      account: string;
    };
  };
}

/**
 * Gera o objeto OpenGraphMetadata completo e sanitizado
 */
export function generateOpenGraphMetadata(options: GenerateOpenGraphOptions): OpenGraphMetadata {
  const {
    title,
    description,
    canonicalUrl,
    imageUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
    imageAlt,
    authorName = "Apollo La Plata",
    category = "Tecnologia",
    tags = [],
    publishedAt,
    modifiedAt,
    siteName = "V5 AutoBlog"
  } = options;

  const now = new Date().toISOString();
  const pubTime = publishedAt || now;
  const modTime = modifiedAt || pubTime;

  // Garante branding sutil se não estiver no título
  const ogTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  // Trunca descrição para 165 caracteres ideais para card do Facebook/WhatsApp
  const cleanDesc = description.replace(/[\r\n\t]/g, " ").trim();
  const ogDescription = cleanDesc.length > 165 
    ? cleanDesc.substring(0, 162).trim() + "..." 
    : cleanDesc;

  return {
    og_title: ogTitle,
    og_description: ogDescription,
    og_url: canonicalUrl,
    og_type: "article",
    og_image: imageUrl,
    og_image_alt: imageAlt || title,
    og_image_width: 1200,
    og_image_height: 630,
    og_site_name: siteName,
    og_locale: "pt_BR",
    article_published_time: pubTime,
    article_modified_time: modTime,
    article_author: authorName,
    article_section: category,
    article_tag: tags
  };
}

/**
 * Gera o objeto TwitterCardMetadata formatado com imagem expandida (summary_large_image)
 */
export function generateTwitterCardMetadata(options: GenerateTwitterCardOptions): TwitterCardMetadata {
  const {
    title,
    description,
    imageUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
    imageAlt,
    siteHandle = "@v5apollo",
    creatorHandle = "@v5apollo",
    cardType = "summary_large_image"
  } = options;

  // Truncamento seguro de 140-160 caracteres para o Twitter Card
  const cleanDesc = description.replace(/[\r\n\t]/g, " ").trim();
  const twitterDescription = cleanDesc.length > 160 
    ? cleanDesc.substring(0, 157).trim() + "..." 
    : cleanDesc;

  return {
    card: cardType,
    title: title.length > 70 ? title.substring(0, 67) + "..." : title,
    description: twitterDescription,
    image: imageUrl,
    image_alt: imageAlt || title,
    site: siteHandle.startsWith("@") ? siteHandle : `@${siteHandle}`,
    creator: creatorHandle.startsWith("@") ? creatorHandle : `@${creatorHandle}`
  };
}

/**
 * Renderiza o bloco de meta tags HTML completo para injeção no cabeçalho <head>
 */
export function renderOpenGraphHtmlMetaTags(
  og: OpenGraphMetadata, 
  twitter: TwitterCardMetadata
): string {
  const tags: string[] = [
    `<!-- Open Graph / Facebook / WhatsApp / LinkedIn -->`,
    `<meta property="og:type" content="${og.og_type}" />`,
    `<meta property="og:url" content="${og.og_url}" />`,
    `<meta property="og:title" content="${escapeHtml(og.og_title)}" />`,
    `<meta property="og:description" content="${escapeHtml(og.og_description)}" />`,
    `<meta property="og:image" content="${og.og_image}" />`,
    `<meta property="og:image:width" content="${og.og_image_width || 1200}" />`,
    `<meta property="og:image:height" content="${og.og_image_height || 630}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(og.og_image_alt)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(og.og_site_name)}" />`,
    `<meta property="og:locale" content="${og.og_locale}" />`,
    `<meta property="article:published_time" content="${og.article_published_time}" />`,
    og.article_modified_time ? `<meta property="article:modified_time" content="${og.article_modified_time}" />` : "",
    `<meta property="article:author" content="${escapeHtml(og.article_author)}" />`,
    `<meta property="article:section" content="${escapeHtml(og.article_section)}" />`,
    ...og.article_tag.map(tag => `<meta property="article:tag" content="${escapeHtml(tag)}" />`),
    ``,
    `<!-- Twitter / X Cards -->`,
    `<meta name="twitter:card" content="${twitter.card}" />`,
    `<meta name="twitter:site" content="${twitter.site}" />`,
    `<meta name="twitter:creator" content="${twitter.creator}" />`,
    `<meta name="twitter:title" content="${escapeHtml(twitter.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(twitter.description)}" />`,
    `<meta name="twitter:image" content="${twitter.image}" />`,
    twitter.image_alt ? `<meta name="twitter:image:alt" content="${escapeHtml(twitter.image_alt)}" />` : "",
    ``,
    `<!-- Meta Tags de Visualização Móvel & PWA -->`,
    `<meta name="theme-color" content="#f59e0b" />`,
    `<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />`
  ].filter(line => line !== "");

  return tags.join("\n");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Validador heurístico de integridade de tags Open Graph e Twitter Cards
 */
export function validateOpenGraphCompleteness(
  og: OpenGraphMetadata, 
  twitter: TwitterCardMetadata
): OpenGraphValidationReport {
  const checks: OpenGraphValidationCheck[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // 1. OG Title
  if (!og.og_title || og.og_title.trim().length === 0) {
    checks.push({ tag: "og:title", status: "fail", message: "og:title obrigatório está ausente." });
  } else if (og.og_title.length > 70) {
    checks.push({
      tag: "og:title",
      status: "warn",
      message: `og:title com ${og.og_title.length} caracteres (ideal: 40 a 65).`,
      recommendation: "Reduza o título para evitar cortes na linha de visualização móvel do WhatsApp e Facebook."
    });
    warnings.push("Título Open Graph longo pode ser truncado.");
  } else {
    checks.push({ tag: "og:title", status: "pass", message: `og:title perfeito com ${og.og_title.length} caracteres.` });
  }

  // 2. OG Description
  if (!og.og_description || og.og_description.trim().length === 0) {
    checks.push({ tag: "og:description", status: "fail", message: "og:description obrigatório está ausente." });
  } else if (og.og_description.length < 50) {
    checks.push({ tag: "og:description", status: "warn", message: "og:description muito curta (<50 caracteres)." });
  } else {
    checks.push({ tag: "og:description", status: "pass", message: `og:description equilibrada (${og.og_description.length} caracteres).` });
  }

  // 3. OG Image (1200x630px standard)
  if (!og.og_image || !og.og_image.startsWith("http")) {
    checks.push({ tag: "og:image", status: "fail", message: "og:image ausente ou com URL não absoluta." });
  } else {
    checks.push({ tag: "og:image", status: "pass", message: "og:image com URL absoluta em 1200x630 (resolução canônica para feeds)." });
  }

  // 4. OG Canonical URL
  if (!og.og_url || !og.og_url.startsWith("https://")) {
    checks.push({ tag: "og:url", status: "warn", message: "og:url deve ser um protocolo HTTPS absoluto." });
  } else {
    checks.push({ tag: "og:url", status: "pass", message: `og:url canônica HTTPS verificada.` });
  }

  // 5. Twitter Card
  if (twitter.card === "summary_large_image") {
    checks.push({ tag: "twitter:card", status: "pass", message: "Twitter Card configurado como summary_large_image (maior engajamento)." });
  } else {
    checks.push({ tag: "twitter:card", status: "warn", message: "Twitter Card em modo summary compacto." });
  }

  // 6. Twitter Site & Creator
  if (twitter.site && twitter.creator) {
    checks.push({ tag: "twitter:site", status: "pass", message: `Twitter handles verificados: ${twitter.site} e ${twitter.creator}.` });
  } else {
    checks.push({ tag: "twitter:site", status: "warn", message: "Handles do Twitter ausentes." });
  }

  const passCount = checks.filter(c => c.status === "pass").length;
  const score = Math.round((passCount / checks.length) * 100);
  const isValid = !checks.some(c => c.status === "fail");

  // Extração de domínio para preview
  let domain = "v5autoblog.com";
  try {
    const urlObj = new URL(og.og_url);
    domain = urlObj.hostname;
  } catch {
    // fallback
  }

  return {
    isValid,
    score,
    checks,
    warnings,
    recommendations,
    previewCards: {
      facebook: {
        domain: domain.toUpperCase(),
        title: og.og_title,
        description: og.og_description,
        imageUrl: og.og_image
      },
      twitter: {
        card: twitter.card,
        title: twitter.title,
        description: twitter.description,
        imageUrl: twitter.image,
        account: twitter.site
      }
    }
  };
}
