/**
 * richResultsValidator.ts - Validador e Diagnóstico de Rich Results do Google Search Central
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Realiza a auditoria estrita de conformidade com Schema.org e Google Rich Results:
 * - Google Discover Eligibility (largura >= 1200px, proporções, headline)
 * - Google Top Stories & News Carousel (Article/NewsArticle, Publisher Logo)
 * - BreadcrumbList Rich Snippets
 * - Anti-Cloaking Paywall Specification (hasPart + cssSelector)
 * - AEO / AI Search Citation Readiness (Perplexity, ChatGPT Search, Gemini AI Overviews)
 */

export interface RichResultCheck {
  id: string;
  category: "syntax" | "required" | "recommended" | "discover" | "paywall" | "eeat";
  label: string;
  status: "pass" | "warn" | "fail";
  message: string;
  docsUrl?: string;
}

export interface FeatureEligibility {
  feature: "google_rich_snippets" | "google_discover" | "top_stories" | "breadcrumbs" | "ai_overviews";
  name: string;
  eligible: boolean;
  score: number; // 0 a 100%
  description: string;
  blockers: string[];
  recommendations: string[];
}

export interface RichResultsValidationReport {
  isValid: boolean;
  overallScore: number; // 0 a 100%
  summary: {
    passed: number;
    warnings: number;
    errors: number;
    total: number;
  };
  checks: RichResultCheck[];
  features: FeatureEligibility[];
  googleTestUrl: string;
  schemaOrgValidatorUrl: string;
  detectedType: string;
  formattedJson: string;
  htmlScriptTag: string;
}

/**
 * Validador principal de Rich Results do Google para Schema.org JSON-LD
 */
export function validateGoogleRichResults(
  input: string | Record<string, any>,
  canonicalUrl?: string
): RichResultsValidationReport {
  const checks: RichResultCheck[] = [];
  let parsed: any = null;
  let parseError = false;

  // 1. Sintaxe e Parse JSON
  if (typeof input === "string") {
    try {
      // Limpa tags <script> caso o usuário passe o bloco HTML
      const cleaned = input
        .replace(/<script[^>]*>/gi, "")
        .replace(/<\/script>/gi, "")
        .trim();
      parsed = JSON.parse(cleaned);
      checks.push({
        id: "json_syntax",
        category: "syntax",
        label: "Sintaxe JSON Válida",
        status: "pass",
        message: "O payload JSON-LD possui sintaxe formal válida e sem erros de formatação."
      });
    } catch (err: any) {
      parseError = true;
      checks.push({
        id: "json_syntax",
        category: "syntax",
        label: "Sintaxe JSON Válida",
        status: "fail",
        message: `Erro fatal de sintaxe JSON: ${err?.message || "JSON inválido"}`
      });
    }
  } else if (typeof input === "object" && input !== null) {
    parsed = input;
    checks.push({
      id: "json_syntax",
      category: "syntax",
      label: "Objeto Estruturado Válido",
      status: "pass",
      message: "Objeto Javascript/JSON estruturado fornecido com sucesso."
    });
  } else {
    parseError = true;
    checks.push({
      id: "json_syntax",
      category: "syntax",
      label: "Formato de Entrada",
      status: "fail",
      message: "Entrada nula ou inválida fornecida ao validador."
    });
  }

  // Se falhou no parse básico, retorna relatório com erro imediato
  if (parseError || !parsed) {
    return buildErrorReport(checks, input);
  }

  // Normalização de arrays (se for array ou grafo @graph)
  let rootObject = parsed;
  if (Array.isArray(parsed)) {
    rootObject = parsed.find(item => item["@type"]?.includes("Article") || item["@type"]?.includes("Posting")) || parsed[0];
  } else if (parsed["@graph"] && Array.isArray(parsed["@graph"])) {
    rootObject = parsed["@graph"].find((item: any) => item["@type"]?.includes("Article") || item["@type"]?.includes("Posting")) || parsed["@graph"][0];
  }

  const detectedType = rootObject["@type"] || "Desconhecido";

  // 2. Validação de @context
  const context = rootObject["@context"] || parsed["@context"];
  if (context === "https://schema.org" || context === "http://schema.org") {
    checks.push({
      id: "context_valid",
      category: "required",
      label: "Schema.org @context",
      status: "pass",
      message: `Vocabulário oficial Schema.org identificado: ${context}`
    });
  } else {
    checks.push({
      id: "context_valid",
      category: "required",
      label: "Schema.org @context",
      status: "fail",
      message: "A propriedade '@context' deve ser 'https://schema.org'."
    });
  }

  // 3. Validação do @type
  const validArticleTypes = ["Article", "BlogPosting", "NewsArticle", "TechArticle", "SocialMediaPosting"];
  if (validArticleTypes.includes(detectedType)) {
    checks.push({
      id: "type_valid",
      category: "required",
      label: "Tipo de Artigo Suportado",
      status: "pass",
      message: `Tipo Schema.org suportado para Rich Results: ${detectedType}`
    });
  } else {
    checks.push({
      id: "type_valid",
      category: "required",
      label: "Tipo de Artigo Suportado",
      status: "fail",
      message: `O tipo '@type: ${detectedType}' não é elegível para rich snippets de artigo do Google. Use BlogPosting ou Article.`
    });
  }

  // 4. Headline / Title
  const headline = rootObject.headline || rootObject.name || rootObject.title;
  if (!headline) {
    checks.push({
      id: "headline_required",
      category: "required",
      label: "Título / Headline",
      status: "fail",
      message: "A propriedade obrigatória 'headline' está ausente no artigo."
    });
  } else if (headline.length > 110) {
    checks.push({
      id: "headline_length",
      category: "recommended",
      label: "Extensão do Headline",
      status: "warn",
      message: `Headline possui ${headline.length} caracteres. O Google Search Central recomenda até 110 caracteres para evitar corte em carrosséis móveis.`
    });
  } else {
    checks.push({
      id: "headline_length",
      category: "required",
      label: "Headline Otimizado",
      status: "pass",
      message: `Headline válido e no tamanho ideal (${headline.length}/110 caracteres): "${headline.substring(0, 50)}..."`
    });
  }

  // 5. Image & Requisitos do Google Discover
  const image = rootObject.image;
  let hasValidImage = false;
  let imageWidth = 0;
  let imageHeight = 0;
  let imageUrl = "";

  if (image) {
    if (typeof image === "string") {
      imageUrl = image;
      hasValidImage = true;
    } else if (typeof image === "object") {
      imageUrl = image.url || "";
      imageWidth = Number(image.width) || 0;
      imageHeight = Number(image.height) || 0;
      if (imageUrl) hasValidImage = true;
    } else if (Array.isArray(image) && image.length > 0) {
      imageUrl = typeof image[0] === "string" ? image[0] : image[0]?.url || "";
      if (imageUrl) hasValidImage = true;
    }
  }

  if (!hasValidImage) {
    checks.push({
      id: "image_required",
      category: "required",
      label: "Imagem Canônica de Destaque",
      status: "fail",
      message: "A propriedade obrigatória 'image' está ausente. O Google exige imagem para qualquer Rich Snippet de artigo."
    });
  } else {
    // Validação de formato da imagem
    const isSvg = imageUrl.toLowerCase().endsWith(".svg");
    if (isSvg) {
      checks.push({
        id: "image_format",
        category: "recommended",
        label: "Formato de Imagem Bitmap",
        status: "warn",
        message: "A imagem é SVG. O Google requer imagens raster (.jpg, .png ou .webp) para Rich Results e Discover."
      });
    }

    // Validação de resolução para Google Discover (>= 1200px)
    if (imageWidth >= 1200) {
      checks.push({
        id: "image_discover",
        category: "discover",
        label: "Google Discover: Imagem de Alta Resolução",
        status: "pass",
        message: `Largura de ${imageWidth}px atende aos requisitos oficiais do Google Discover (mínimo de 1200px de largura).`
      });
    } else if (imageWidth > 0 && imageWidth < 1200) {
      checks.push({
        id: "image_discover",
        category: "discover",
        label: "Google Discover: Imagem de Alta Resolução",
        status: "warn",
        message: `Largura de ${imageWidth}px é inferior ao recomendado de 1200px para cartões grandes no Google Discover.`
      });
    } else {
      checks.push({
        id: "image_dimensions",
        category: "recommended",
        label: "Dimensões Explícitas da Imagem",
        status: "pass",
        message: "Imagem informada. Recomenda-se fornecer objeto ImageObject com width e height explicitados."
      });
    }
  }

  // 6. Autor e Diretrizes E-E-A-T
  const author = rootObject.author;
  if (!author) {
    checks.push({
      id: "author_required",
      category: "required",
      label: "Autor da Publicação",
      status: "fail",
      message: "Propriedade obrigatória 'author' ausente. Artigos sem autor são desqualificados de Rich Results."
    });
  } else {
    const authorObj = Array.isArray(author) ? author[0] : author;
    const authorName = typeof authorObj === "string" ? authorObj : authorObj?.name;
    const authorType = authorObj?.["@type"] || "Person";

    if (!authorName) {
      checks.push({
        id: "author_name",
        category: "required",
        label: "Nome do Autor",
        status: "fail",
        message: "O autor não possui a propriedade 'name' preenchida."
      });
    } else {
      checks.push({
        id: "author_valid",
        category: "eeat",
        label: "E-E-A-T: Autor Verificado",
        status: "pass",
        message: `Autor válido (${authorType}): ${authorName}. Em conformidade com diretrizes E-E-A-T do Google.`
      });

      if (typeof authorObj === "object" && authorObj.jobTitle) {
        checks.push({
          id: "author_job_title",
          category: "eeat",
          label: "E-E-A-T: Cargo e Especialidade",
          status: "pass",
          message: `Especialidade do autor documentada: "${authorObj.jobTitle}".`
        });
      }
    }
  }

  // 7. Publisher e Logotipo da Organização
  const publisher = rootObject.publisher;
  if (!publisher) {
    checks.push({
      id: "publisher_required",
      category: "recommended",
      label: "Organização Publicadora (Publisher)",
      status: "warn",
      message: "Propriedade 'publisher' ausente. Recomendada para carrosséis de notícias do Google Top Stories."
    });
  } else {
    const pubName = publisher.name;
    const logoUrl = publisher.logo?.url || publisher.logo;

    if (pubName && logoUrl) {
      checks.push({
        id: "publisher_valid",
        category: "recommended",
        label: "Publisher com Logotipo Oficial",
        status: "pass",
        message: `Publisher corporativo verificado: ${pubName} com logo ImageObject.`
      });
    } else {
      checks.push({
        id: "publisher_logo",
        category: "recommended",
        label: "Logotipo do Publisher",
        status: "warn",
        message: "O publisher deve conter tanto 'name' quanto 'logo.url' para elegibilidade a Top Stories."
      });
    }
  }

  // 8. Datas de Publicação e Modificação
  const datePublished = rootObject.datePublished;
  const dateModified = rootObject.dateModified;

  if (!datePublished) {
    checks.push({
      id: "date_published_required",
      category: "required",
      label: "Data de Publicação (datePublished)",
      status: "fail",
      message: "Propriedade obrigatória 'datePublished' ausente. Rich Results exigem carimbo de datação temporal."
    });
  } else {
    const isValidIso = !isNaN(Date.parse(datePublished));
    if (isValidIso) {
      checks.push({
        id: "date_published_iso",
        category: "required",
        label: "Data ISO 8601 Válida",
        status: "pass",
        message: `datePublished em formato ISO 8601 válido: ${datePublished}`
      });
    } else {
      checks.push({
        id: "date_published_iso",
        category: "required",
        label: "Data ISO 8601 Válida",
        status: "fail",
        message: `datePublished '${datePublished}' não está em padrão ISO 8601 válido.`
      });
    }
  }

  if (dateModified) {
    checks.push({
      id: "date_modified_valid",
      category: "recommended",
      label: "Data de Atualização (dateModified)",
      status: "pass",
      message: `dateModified fornecido: ${dateModified}. Auxilia em frescor de conteúdo para AI Overviews.`
    });
  } else {
    checks.push({
      id: "date_modified_valid",
      category: "recommended",
      label: "Data de Atualização (dateModified)",
      status: "warn",
      message: "dateModified ausente. Recomendado manter sincronizado para sinalizar freshness ao Googlebot."
    });
  }

  // 9. URL Canônica e mainEntityOfPage
  const mainEntity = rootObject.mainEntityOfPage;
  const targetCanonical = canonicalUrl || (typeof mainEntity === "string" ? mainEntity : mainEntity?.["@id"]);

  if (!targetCanonical) {
    checks.push({
      id: "main_entity_required",
      category: "required",
      label: "URL Canônica / mainEntityOfPage",
      status: "fail",
      message: "Propriedade 'mainEntityOfPage' ausente. Rich Results exigem a URL canônica exata do artigo."
    });
  } else if (!targetCanonical.startsWith("http://") && !targetCanonical.startsWith("https://")) {
    checks.push({
      id: "canonical_absolute",
      category: "required",
      label: "URL Absoluta Canônica",
      status: "fail",
      message: `A URL canônica '${targetCanonical}' deve ser absoluta com protocolo HTTPS.`
    });
  } else {
    checks.push({
      id: "main_entity_valid",
      category: "required",
      label: "URL Canônica Absoluta",
      status: "pass",
      message: `mainEntityOfPage apontando para URL canônica válida: ${targetCanonical}`
    });
  }

  // 10. Proteção Anti-Cloaking para Artigos com Paywall
  const isAccessibleForFree = rootObject.isAccessibleForFree;
  if (isAccessibleForFree === false) {
    const hasPart = rootObject.hasPart;
    if (hasPart && hasPart.cssSelector && hasPart.isAccessibleForFree === false) {
      checks.push({
        id: "paywall_anticloaking",
        category: "paywall",
        label: "Diretiva Anti-Cloaking Paywall",
        status: "pass",
        message: `Configuração de paywall aprovada: hasPart (${hasPart.cssSelector}) demarcado como isAccessibleForFree: false.`
      });
    } else {
      checks.push({
        id: "paywall_anticloaking",
        category: "paywall",
        label: "Diretiva Anti-Cloaking Paywall",
        status: "warn",
        message: "Artigo possui 'isAccessibleForFree: false', mas falta 'hasPart' com 'cssSelector'. Risco de penalidade de cloaking pelo Googlebot."
      });
    }
  } else {
    checks.push({
      id: "open_access",
      category: "paywall",
      label: "Acesso Livre ao Conteúdo",
      status: "pass",
      message: "Conteúdo 100% aberto e indexável sem barreiras de paywall (isAccessibleForFree: true)."
    });
  }

  // 11. Breadcrumbs Schema (se estiver no payload ou no mesmo documento)
  const hasBreadcrumbs = parsed.someBreadcrumb || rootObject.breadcrumb || (parsed["@graph"] && parsed["@graph"].some((g: any) => g["@type"] === "BreadcrumbList"));
  if (hasBreadcrumbs) {
    checks.push({
      id: "breadcrumbs_check",
      category: "recommended",
      label: "BreadcrumbList Integrado",
      status: "pass",
      message: "Trilha de navegação BreadcrumbList detectada e associada ao documento."
    });
  }

  // Contabilização Geral
  const passed = checks.filter(c => c.status === "pass").length;
  const warnings = checks.filter(c => c.status === "warn").length;
  const errors = checks.filter(c => c.status === "fail").length;
  const total = checks.length;

  const isValid = errors === 0;
  // Score com penalidade pesada para erros (x20) e leve para warnings (x5)
  const penalty = (errors * 25) + (warnings * 6);
  const overallScore = Math.max(0, Math.min(100, Math.round(100 - penalty)));

  // 12. Elegibilidade de Recursos Específicos do Google
  const features: FeatureEligibility[] = [
    {
      feature: "google_rich_snippets",
      name: "Google Rich Snippets (Artigo)",
      eligible: isValid,
      score: isValid ? (warnings === 0 ? 100 : 85) : 0,
      description: "Exibição com título ampliado, dados de autor e miniatura nos resultados de busca do Google.",
      blockers: checks.filter(c => c.category === "required" && c.status === "fail").map(c => c.message),
      recommendations: checks.filter(c => c.category === "recommended" && c.status === "warn").map(c => c.message)
    },
    {
      feature: "google_discover",
      name: "Google Discover Feed",
      eligible: isValid && imageWidth >= 1200,
      score: (isValid && imageWidth >= 1200) ? 95 : (isValid ? 50 : 0),
      description: "Cartões visuais recomendados proativamente na página inicial do aplicativo Google para Android/iOS.",
      blockers: [
        ...(isValid ? [] : ["Corrija os erros obrigatórios de Schema.org"]),
        ...(imageWidth < 1200 ? ["Requer imagem de destaque com no mínimo 1200px de largura"] : [])
      ],
      recommendations: [
        "Mantenha headlines diretos sem sensacionalismo exagerado",
        "Use formato WebP para carregamento ultrarrápido em dispositivos móveis"
      ]
    },
    {
      feature: "top_stories",
      name: "Top Stories / Notícias Principais",
      eligible: isValid && Boolean(rootObject.publisher?.name),
      score: (isValid && Boolean(rootObject.publisher?.name)) ? 90 : (isValid ? 60 : 0),
      description: "Carrossel de notícias em destaque para termos em alta e eventos recentes.",
      blockers: [
        ...(isValid ? [] : ["Erros estruturais de Schema.org detectados"]),
        ...(!rootObject.publisher?.name ? ["Requer publisher corporativo explícito com logotipo"] : [])
      ],
      recommendations: ["Mantenha data de publicação com fuso horário e dateModified sempre atualizado"]
    },
    {
      feature: "breadcrumbs",
      name: "Trilha Breadcrumbs na SERP",
      eligible: Boolean(hasBreadcrumbs),
      score: hasBreadcrumbs ? 100 : 40,
      description: "Exibe a hierarquia da categoria (ex: Início › Inteligência Artificial) acima do link.",
      blockers: hasBreadcrumbs ? [] : ["Adicione o SchemaOrgBreadcrumbList associado"],
      recommendations: ["Mapeie até 3 níveis de profundidade taxonômica"]
    },
    {
      feature: "ai_overviews",
      name: "AEO & Citações de IA (Perplexity, ChatGPT, Gemini)",
      eligible: isValid && Boolean(rootObject.author) && Boolean(datePublished),
      score: (isValid && Boolean(rootObject.author) && Boolean(datePublished)) ? 92 : 30,
      description: "Citação direta como fonte de autoridade em respostas geradas por motores de busca generativos.",
      blockers: isValid ? [] : ["Motores de IA descartam fontes com metadados estruturais corrompidos"],
      recommendations: [
        "Mantenha o box E-E-A-T do autor com biografia e credenciais verificadas",
        "Evite paywall sem a diretiva hasPart explícita para o indexador"
      ]
    }
  ];

  const formattedJson = JSON.stringify(parsed, null, 2);
  const htmlScriptTag = `<script type="application/ld+json">\n${formattedJson}\n</script>`;
  
  // Link para ferramentas oficiais
  const googleTestUrl = `https://search.google.com/test/rich-results`;
  const schemaOrgValidatorUrl = `https://validator.schema.org/`;

  return {
    isValid,
    overallScore,
    summary: { passed, warnings, errors, total },
    checks,
    features,
    googleTestUrl,
    schemaOrgValidatorUrl,
    detectedType,
    formattedJson,
    htmlScriptTag
  };
}

/**
 * Constrói relatório imediato para payloads com erro de parse
 */
function buildErrorReport(checks: RichResultCheck[], rawInput: any): RichResultsValidationReport {
  return {
    isValid: false,
    overallScore: 0,
    summary: { passed: 0, warnings: 0, errors: 1, total: checks.length },
    checks,
    features: [],
    googleTestUrl: "https://search.google.com/test/rich-results",
    schemaOrgValidatorUrl: "https://validator.schema.org/",
    detectedType: "Erro de Sintaxe",
    formattedJson: typeof rawInput === "string" ? rawInput : JSON.stringify(rawInput, null, 2),
    htmlScriptTag: "<!-- Erro ao compilar JSON-LD: verifique a sintaxe -->"
  };
}
