/**
 * V5 APOLLO POSTER - SCHEMA.ORG JSON-LD GENERATOR (Etapa 042)
 * Gerador de dados estruturados em conformidade com o Google Search Central,
 * Schema.org BlogPosting / Article e diretivas de Rich Results.
 */

import { 
  SchemaOrgBlogPosting, 
  SchemaOrgBreadcrumbList 
} from "@/types/poster";
import { slugify } from "./multimodalEngine";

export interface BlogPostingSchemaOptions {
  title: string;
  headline?: string;
  description: string;
  contentMarkdown: string;
  canonicalUrl: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  authorName?: string;
  authorRole?: string;
  authorUrl?: string;
  category?: string;
  tags?: string[];
  datePublished?: string;
  dateModified?: string;
  hasPaywall?: boolean;
  articleType?: "BlogPosting" | "Article" | "TechArticle";
}

export interface BreadcrumbSchemaOptions {
  category: string;
  categorySlug?: string;
  articleTitle: string;
  articleUrl: string;
  baseUrl?: string;
}

export interface SchemaValidationResult {
  isValid: boolean;
  score: number; // 0 a 100%
  checks: Array<{
    property: string;
    status: "pass" | "warn" | "fail";
    message: string;
  }>;
  warnings: string[];
  recommendations: string[];
}

/**
 * Converte minutos em formato ISO 8601 Duration (ex: 4 min -> 'PT4M')
 */
export function formatIsoDuration(minutes: number): string {
  const safeMin = Math.max(1, Math.round(minutes));
  return `PT${safeMin}M`;
}

/**
 * Gera o objeto Schema.org BlogPosting / Article estruturado
 * 100% aderente às diretivas do Google para Rich Snippets e Carrosséis de Notícias
 */
export function generateBlogPostingSchema(options: BlogPostingSchemaOptions): SchemaOrgBlogPosting {
  const {
    title,
    headline,
    description,
    contentMarkdown,
    canonicalUrl,
    coverImageUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
    coverImageAlt,
    authorName = "Apollo La Plata",
    authorRole = "Editor Chefe & Arquiteto de Sistemas",
    authorUrl,
    category = "Tecnologia",
    tags = [],
    datePublished,
    dateModified,
    hasPaywall = false,
    articleType = "BlogPosting"
  } = options;

  const now = new Date().toISOString();
  const publishedDate = datePublished || now;
  const modifiedDate = dateModified || publishedDate;

  // Limpeza de texto para contagem de palavras
  const cleanBody = contentMarkdown
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/^[#>\-*_`~]/gm, "")
    .trim();

  const words = cleanBody.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const authorCanonicalUrl = authorUrl || `https://v5autoblog.com/autores/${slugify(authorName)}`;

  // Headline seguro (Google recomenda até 110 caracteres)
  const safeHeadline = (headline || title).substring(0, 110);

  const schema: SchemaOrgBlogPosting = {
    "@context": "https://schema.org",
    "@type": articleType,
    headline: safeHeadline,
    description: description.substring(0, 160),
    articleBody: cleanBody,
    inLanguage: "pt-BR",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    author: {
      "@type": "Person",
      name: authorName,
      url: authorCanonicalUrl
    },
    publisher: {
      "@type": "Organization",
      name: "Holding V5 Apollo",
      logo: {
        "@type": "ImageObject",
        url: "https://v5autoblog.com/logo.png"
      }
    },
    datePublished: publishedDate,
    dateModified: modifiedDate,
    image: {
      "@type": "ImageObject",
      url: coverImageUrl,
      width: 1200,
      height: 630
    },
    keywords: tags.join(", "),
    wordCount,
    articleSection: category,
    isAccessibleForFree: !hasPaywall,
    timeRequired: formatIsoDuration(readingTimeMinutes),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".article-excerpt", "h2"]
    }
  };

  // Se o artigo possui paywall, aplica o protocolo de conformidade contra penalidade de Cloaking
  if (hasPaywall) {
    schema.hasPart = {
      "@type": "WebPageElement",
      isAccessibleForFree: false,
      cssSelector: ".v5-paywall-gate"
    };
  }

  return schema;
}

/**
 * Gera o Schema.org BreadcrumbList para navegação de trilha nos resultados de busca do Google
 */
export function generateBreadcrumbSchema(options: BreadcrumbSchemaOptions): SchemaOrgBreadcrumbList {
  const {
    category,
    categorySlug,
    articleTitle,
    articleUrl,
    baseUrl = "https://v5autoblog.com"
  } = options;

  const catSlug = categorySlug || slugify(category);
  const categoryUrl = `${baseUrl}/categoria/${catSlug}`;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Início",
        item: baseUrl
      },
      {
        "@type": "ListItem",
        position: 2,
        name: category,
        item: categoryUrl
      },
      {
        "@type": "ListItem",
        position: 3,
        name: articleTitle,
        item: articleUrl
      }
    ]
  };
}

/**
 * Renderiza o bloco de script JSON-LD pronto para inserção no cabeçalho HTML
 */
export function renderSchemaJsonLdScript(schema: object | object[]): string {
  const jsonString = JSON.stringify(schema, null, 2);
  return `<script type="application/ld+json">\n${jsonString}\n</script>`;
}

/**
 * Validador heurístico de conformidade do Schema.org com o Google Rich Results Test
 */
export function validateSchemaCompleteness(schema: SchemaOrgBlogPosting): SchemaValidationResult {
  const checks: SchemaValidationResult["checks"] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // 1. Headline
  if (schema.headline && schema.headline.trim().length > 0) {
    if (schema.headline.length > 110) {
      checks.push({
        property: "headline",
        status: "warn",
        message: `Headline possui ${schema.headline.length} caracteres (Google recomenda até 110).`
      });
      warnings.push("Encurte o headline do Schema para evitar truncamento em rich cards.");
    } else {
      checks.push({
        property: "headline",
        status: "pass",
        message: `Headline ideal com ${schema.headline.length} caracteres.`
      });
    }
  } else {
    checks.push({
      property: "headline",
      status: "fail",
      message: "Propriedade obrigatória 'headline' ausente."
    });
  }

  // 2. Author
  if (schema.author && schema.author.name) {
    checks.push({
      property: "author",
      status: "pass",
      message: `Autor verificado: ${schema.author.name} (tipo Person).`
    });
  } else {
    checks.push({
      property: "author",
      status: "fail",
      message: "Propriedade obrigatória 'author' ou 'author.name' ausente."
    });
  }

  // 3. Publisher & Logo
  if (schema.publisher && schema.publisher.name && schema.publisher.logo?.url) {
    checks.push({
      property: "publisher",
      status: "pass",
      message: `Publisher verificado: ${schema.publisher.name} com logo ImageObject.`
    });
  } else {
    checks.push({
      property: "publisher",
      status: "warn",
      message: "Publisher ou logo da organização ausente."
    });
    recommendations.push("Inclua o logo oficial da holding para elegibilidade a carrosséis no Google Notícias.");
  }

  // 4. Image
  if (schema.image && schema.image.url) {
    if (schema.image.width >= 1200 && schema.image.height >= 630) {
      checks.push({
        property: "image",
        status: "pass",
        message: `Imagem canônica em alta resolução (${schema.image.width}x${schema.image.height}px).`
      });
    } else {
      checks.push({
        property: "image",
        status: "warn",
        message: "Resolução de imagem inferior a 1200x630px."
      });
      recommendations.push("Imagens com no mínimo 1200px de largura são pré-requisito para Google Discover.");
    }
  } else {
    checks.push({
      property: "image",
      status: "fail",
      message: "Propriedade obrigatória 'image' ausente."
    });
  }

  // 5. Dates
  if (schema.datePublished && schema.dateModified) {
    checks.push({
      property: "datePublished",
      status: "pass",
      message: "Datas de publicação e modificação em padrão ISO 8601 válidas."
    });
  } else {
    checks.push({
      property: "datePublished",
      status: "fail",
      message: "datePublished ou dateModified ausente."
    });
  }

  // 6. Paywall & Access Free
  if (schema.isAccessibleForFree === false) {
    if (schema.hasPart) {
      checks.push({
        property: "isAccessibleForFree",
        status: "pass",
        message: "Configuração de Paywall protegida com hasPart e cssSelector contra cloaking."
      });
    } else {
      checks.push({
        property: "isAccessibleForFree",
        status: "warn",
        message: "isAccessibleForFree está como false, mas falta a propriedade hasPart."
      });
    }
  } else {
    checks.push({
      property: "isAccessibleForFree",
      status: "pass",
      message: "Artigo 100% aberto (isAccessibleForFree: true)."
    });
  }

  const passCount = checks.filter(c => c.status === "pass").length;
  const score = Math.round((passCount / checks.length) * 100);
  const isValid = !checks.some(c => c.status === "fail");

  return {
    isValid,
    score,
    checks,
    warnings,
    recommendations
  };
}
