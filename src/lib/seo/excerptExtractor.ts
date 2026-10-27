/**
 * excerptExtractor.ts - Extrator de Excerpt Otimizado para Meta Description do Google (150-160 caracteres)
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Transforma artigos e newsletters em meta descriptions cirúrgicas no "Sweet Spot" do Google SERP:
 * - Janela ótima de indexação: 150 a 160 caracteres (Desktop & Mobile)
 * - Corte seguro por limite de palavra (sem truncamento de termos ao meio)
 * - Remoção profunda de sintaxe Markdown, preheaders invisíveis, tabelas e saudações genéricas
 * - Injeção de gatilhos acionáveis de alta conversão (CTR Boosters)
 * - Avaliação de qualidade de SERP (0 a 100) com estimativa de largura em pixels (~960px)
 */

export interface ExcerptQualityScore {
  characterCount: number;
  pixelWidthEstimated: number; // Largura estimada em pixels no Google SERP (max ~960px)
  status: "optimal" | "acceptable" | "too_short" | "too_long";
  score: number; // 0 a 100
  containsActionHook: boolean;
  detectedKeywords: string[];
  feedbackMessage: string;
}

export interface ExcerptExtractionOptions {
  minChars?: number; // Padrão: 150
  maxChars?: number; // Padrão: 160
  strategy?: "smart_summary" | "first_paragraph" | "action_driven";
  focusKeywords?: string[];
  fallbackSummary?: string;
  actionCall?: string; // Ex: "Confira na íntegra.", "Descubra como aplicar."
}

export interface ExcerptExtractionResult {
  excerpt: string;
  cleanSourceText: string;
  quality: ExcerptQualityScore;
  isTruncated: boolean;
  characterCount: number;
}

const ACTION_VERBS = [
  "descubra", "confira", "veja", "entenda", "aprenda", "saiba", 
  "leia", "acesse", "conheça", "explore", "aproveite", "otimize",
  "veja como", "saiba como", "descubra como", "passo a passo"
];

const GREETINGS_PATTERNS = [
  /^olá,?\s*[^.!?]*[.!?]/i,
  /^oi,?\s*[^.!?]*[.!?]/i,
  /^bom dia,?\s*[^.!?]*[.!?]/i,
  /^boa tarde,?\s*[^.!?]*[.!?]/i,
  /^bem-vindo[s]?,?\s*[^.!?]*[.!?]/i,
  /^neste artigo,?\s*(vamos falar sobre|você vai ver|abordamos)[^.!?]*[.!?]/i,
  /^se você acompanha (tecnologia|o mercado|o ecossistema)[^.!?]*[.!?]/i
];

/**
 * Limpa profundamente conteúdo em Markdown, removendo títulos, imagens, links (mantendo âncora),
 * tabelas, blocos de código e preheaders invisíveis.
 */
export function cleanMarkdownForExcerpt(markdown: string): string {
  if (!markdown || !markdown.trim()) return "";

  let text = markdown
    // Remove blocos de código com cercas triplas
    .replace(/```[\s\S]*?```/g, " ")
    // Remove tags de código inline
    .replace(/`.*?`/g, " ")
    // Remove imagens markdown: ![alt](url)
    .replace(/!\[.*?\]\(.*?\)/g, " ")
    // Transforma links mantendo apenas o texto âncora: [âncora](url) -> âncora
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    // Remove preheaders invisíveis e caracteres zero-width
    .replace(/&zwnj;|&nbsp;|\u200C|\u200B/g, " ")
    // Remove tabelas Markdown completas (| col | col |)
    .replace(/\|[^\n]+\|/g, " ")
    .replace(/\|:?---*:?\|/g, " ")
    // Remove cabeçalhos Markdown (#, ##, ###)
    .replace(/^#{1,6}\s+.*$/gm, " ")
    // Remove citações (>)
    .replace(/^\s*>\s*/gm, " ")
    // Remove delimitadores de paywall break <!-- PAYWALL_BREAK -->
    .replace(/<!--[\s\S]*?-->/g, " ")
    // Remove tags HTML
    .replace(/<[^>]+>/g, " ")
    // Remove marcadores de listas
    .replace(/^\s*[-*+]\s+/gm, " ")
    .replace(/^\s*\d+\.\s+/gm, " ")
    // Remove negrito, itálico e tachado
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    // Remove divisores horizontais (---, ***, ___)
    .replace(/^[-*_]{3,}\s*$/gm, " ")
    // Normaliza múltiplos espaços e quebras de linha em espaço simples
    .replace(/\s+/g, " ")
    .trim();

  // Remove saudações introdutórias desnecessárias para meta description
  for (const pattern of GREETINGS_PATTERNS) {
    text = text.replace(pattern, "").trim();
  }

  return text;
}

/**
 * Avalia a qualidade do excerpt gerado segundo os critérios rigorosos da SERP do Google
 */
export function evaluateExcerptQuality(excerpt: string, focusKeywords: string[] = []): ExcerptQualityScore {
  const len = excerpt.trim().length;
  // Estimativa de pixels médios por caractere (fonte Arial 13px do Google SERP ~5.8px por caractere)
  const pixelWidthEstimated = Math.round(len * 5.85);

  let status: "optimal" | "acceptable" | "too_short" | "too_long" = "acceptable";
  let score = 70;
  let feedbackMessage = "";

  if (len >= 148 && len <= 160) {
    status = "optimal";
    score = 100;
    feedbackMessage = "Comprimento perfeito para a SERP do Google (150-160 caracteres). Sem risco de truncamento.";
  } else if (len >= 135 && len < 148) {
    status = "acceptable";
    score = 88;
    feedbackMessage = "Bom comprimento, ligeiramente abaixo do limite máximo (aproveita bem o snippet).";
  } else if (len > 160) {
    status = "too_long";
    score = Math.max(40, 100 - (len - 160) * 3);
    feedbackMessage = `Excede o limite recomendado em ${len - 160} caracteres. O Google irá truncar com reticências no resultado de busca.`;
  } else {
    status = "too_short";
    score = Math.max(30, Math.round((len / 150) * 80));
    feedbackMessage = `Muito curto (${len} caracteres). O Google prefere descrições entre 150 e 160 caracteres para preencher o snippet.`;
  }

  // Verifica se contém verbo ou gancho de ação
  const lowerExcerpt = excerpt.toLowerCase();
  const containsActionHook = ACTION_VERBS.some(verb => lowerExcerpt.includes(verb));
  if (containsActionHook && score < 100) {
    score = Math.min(100, score + 8);
  }

  // Detecta palavras-chave do artigo presentes no excerpt
  const detectedKeywords: string[] = [];
  for (const kw of focusKeywords) {
    if (kw.trim() && lowerExcerpt.includes(kw.toLowerCase().trim())) {
      detectedKeywords.push(kw.trim());
    }
  }

  return {
    characterCount: len,
    pixelWidthEstimated,
    status,
    score,
    containsActionHook,
    detectedKeywords,
    feedbackMessage
  };
}

/**
 * Trunca cirurgicamente uma frase respeitando os limites de palavra e faixa entre minChars e maxChars
 */
export function truncateToWordBoundary(text: string, targetMax = 158, appendEllipsis = true): string {
  const clean = text.trim();
  if (clean.length <= targetMax) {
    return clean;
  }

  // Pega o corte preliminar
  const cutPoint = appendEllipsis ? targetMax - 3 : targetMax;
  const candidate = clean.substring(0, cutPoint);

  // Busca o último espaço para não quebrar a palavra ao meio
  const lastSpace = candidate.lastIndexOf(" ");
  if (lastSpace > 40) {
    const trimmed = candidate.substring(0, lastSpace).replace(/[ ,;:-]+$/, "");
    return appendEllipsis ? `${trimmed}...` : trimmed;
  }

  const trimmed = candidate.replace(/[ ,;:-]+$/, "");
  return appendEllipsis ? `${trimmed}...` : trimmed;
}

/**
 * Ajusta o comprimento de um texto existente para atingir cirurgicamente a faixa ideal de 150 a 160 caracteres
 */
export function rebalanceExcerptToSerpLimit(
  text: string,
  minChars = 150,
  maxChars = 160,
  actionCall = "Confira a análise completa."
): string {
  let clean = text.trim().replace(/\s+/g, " ");

  // Se já está na faixa dourada, retorna sem modificações
  if (clean.length >= minChars && clean.length <= maxChars) {
    return clean;
  }

  // Se for maior que o limite, trunca na palavra anterior mantendo o máximo de contexto
  if (clean.length > maxChars) {
    return truncateToWordBoundary(clean, maxChars, true);
  }

  // Se for menor que minChars, tenta anexar um gancho acionável para atingir o Sweet Spot (150-160c)
  const needed = minChars - clean.length;
  if (needed > 0) {
    const ensureDot = /[.!?]$/.test(clean) ? "" : ".";
    const combined = `${clean}${ensureDot} ${actionCall}`.trim();

    if (combined.length >= minChars && combined.length <= maxChars) {
      return combined;
    }

    // Se ainda estiver abaixo do mínimo de 150 caracteres, complementa para atingir o Sweet Spot
    if (combined.length < minChars) {
      const extensions = [
        "Confira o guia completo com todas as diretrizes práticas, dados e insights exclusivos.",
        "Descubra as principais estratégias e melhores práticas para potencializar seus resultados.",
        "Veja o passo a passo detalhado, comparativos reais e orientações essenciais no artigo completo.",
        "Acesse todas as dicas detalhadas e exemplos práticos para acelerar sua produtividade hoje."
      ];

      for (const ext of extensions) {
        const candidate = `${clean}${ensureDot} ${ext}`.trim();
        if (candidate.length >= minChars && candidate.length <= maxChars) {
          return candidate;
        }
        if (candidate.length > maxChars) {
          const truncatedCandidate = truncateToWordBoundary(candidate, maxChars, true);
          if (truncatedCandidate.length >= minChars) {
            return truncatedCandidate;
          }
        }
      }

      // Se combined for razoável, retorna combined
      return combined;
    }

    // Se o gancho padrão ultrapassar maxChars, tenta variações menores
    const shortCalls = [
      "Confira na íntegra.",
      "Veja os detalhes.",
      "Saiba mais aqui.",
      "Leia o guia.",
      "Veja mais."
    ];

    for (const call of shortCalls) {
      const candidate = `${clean}${ensureDot} ${call}`.trim();
      if (candidate.length >= minChars && candidate.length <= maxChars) {
        return candidate;
      }
    }

    // Se ainda assim ultrapassar, trunca elegantemente a combinação
    if (combined.length > maxChars) {
      return truncateToWordBoundary(combined, maxChars, true);
    }
  }

  return clean;
}

/**
 * Função mestre: extrai e formata um excerpt altamente otimizado para o Google SERP (150 a 160 caracteres)
 */
export function generateGoogleMetaExcerpt(
  contentMarkdown: string,
  options?: ExcerptExtractionOptions
): ExcerptExtractionResult {
  const minChars = options?.minChars ?? 150;
  const maxChars = options?.maxChars ?? 160;
  const focusKeywords = options?.focusKeywords ?? [];
  const actionCall = options?.actionCall ?? "Confira na íntegra.";

  // 1. Limpeza preliminar do conteúdo
  const cleanSourceText = cleanMarkdownForExcerpt(contentMarkdown);

  // 2. Se houver um resumo pré-existente fornecido como fallback
  if (options?.fallbackSummary && options.fallbackSummary.trim().length >= 40) {
    const candidateSummary = cleanMarkdownForExcerpt(options.fallbackSummary);
    const rebalanced = rebalanceExcerptToSerpLimit(candidateSummary, minChars, maxChars, actionCall);
    const quality = evaluateExcerptQuality(rebalanced, focusKeywords);

    return {
      excerpt: rebalanced,
      cleanSourceText,
      quality,
      isTruncated: candidateSummary.length > maxChars,
      characterCount: rebalanced.length
    };
  }

  // 3. Estratégia de extração do corpo do artigo
  if (!cleanSourceText) {
    const defaultSnippet = rebalanceExcerptToSerpLimit(
      "Guia completo e aprofundado com diretrizes essenciais, dados estruturados e estratégias práticas de implementação.",
      minChars,
      maxChars,
      actionCall
    );
    return {
      excerpt: defaultSnippet,
      cleanSourceText: "",
      quality: evaluateExcerptQuality(defaultSnippet, focusKeywords),
      isTruncated: false,
      characterCount: defaultSnippet.length
    };
  }

  // 4. Seleção da primeira sentença ou parágrafo denso
  // Divide por sentenças terminadas em ponto final, exclamação ou interrogação
  const sentences = cleanSourceText
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 25);

  let accumulated = "";
  for (const sentence of sentences) {
    if ((accumulated + " " + sentence).trim().length <= maxChars) {
      accumulated = (accumulated + " " + sentence).trim();
    } else {
      break;
    }
  }

  // Se o acumulado estiver vazio (ex: sentença única muito longa), pega o início da primeira sentença
  if (!accumulated && sentences.length > 0) {
    accumulated = sentences[0];
  } else if (!accumulated) {
    accumulated = cleanSourceText;
  }

  // 5. Rebalanceia para atingir 150-160 caracteres com corte inteligente
  const finalExcerpt = rebalanceExcerptToSerpLimit(accumulated, minChars, maxChars, actionCall);
  const quality = evaluateExcerptQuality(finalExcerpt, focusKeywords);

  return {
    excerpt: finalExcerpt,
    cleanSourceText,
    quality,
    isTruncated: accumulated.length > maxChars || cleanSourceText.length > maxChars,
    characterCount: finalExcerpt.length
  };
}
