/**
 * triggerMatcher.ts - Mapeador e Normalizador de Gatilhos Cognitivos (ChatbotX)
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Absorvido do pacote automated-response do ChatbotX:
 * - Pipeline avançado de normalização de texto (remoção de acentos, pontuação e letras repetidas)
 * - Mapeamento com fronteiras de palavra (\b) contra falsos positivos (ex: "blink" não ativa "link")
 * - 4 Modos de Match: Contains (Fronteira), Exato, Difuso (Fuzzy Levenshtein) e Regex
 * - Dicionário de Sinônimos de Gatilhos (grupos LINK, QUERO, DESCONTO, ONDE_COMPRAR, etc.)
 * - Retorno de resultado estruturado com confiança (confidence) e snippet capturado
 */

export type TriggerMatchMode = "contains" | "exact" | "fuzzy" | "regex";

export interface TriggerMatchOptions {
  mode?: TriggerMatchMode;
  fuzzyMaxDistance?: number;
  useSynonyms?: boolean;
  caseSensitive?: boolean;
}

export interface TriggerMatchResult {
  isMatch: boolean;
  matchedKeyword?: string;
  matchedSnippet?: string;
  confidence: number;
  matchModeUsed: TriggerMatchMode;
  normalizedComment: string;
}

/**
 * Grupos de Sinônimos Oficiais do ChatbotX para E-commerce, Info-produtos e Conteúdo
 */
export const TRIGGER_SYNONYM_GROUPS: Record<string, string[]> = {
  LINK: [
    "LINK", "LINCK", "URL", "SITE", "PAGINA", "MANDA", "MANDA O LINK", 
    "LINK POR FAVOR", "LINK PFV", "MANDA LINK", "LINK DIRECT"
  ],
  QUERO: [
    "QUERO", "EU QUERO", "QRO", "QUERIA", "INTERESSE", "TENHO INTERESSE", 
    "QUERO O LINK", "QUERO MUITO", "EU QUERO O LINK"
  ],
  DESCONTO: [
    "DESCONTO", "CUPOM", "PROMO", "PROMOCAO", "BARATO", "MENOR PRECO", 
    "CUPOM DE DESCONTO", "VALOR", "PRECO", "PREÇO", "QUANTO CUSTA"
  ],
  ONDE_COMPRA: [
    "ONDE COMPRA", "ONDE COMPRO", "ONDE ACHA", "QUAL LOJA", "QUAL SITE", 
    "AONDE COMPRA", "COMO COMPRA", "COMO COMPRAR"
  ],
  GUIA_PDF: [
    "GUIA", "PLAYBOOK", "PDF", "TUTORIAL", "APOSTILA", "CODIGO", "MATERIAL", 
    "ACESSO", "DOWNLOAD", "PLANILHA"
  ]
};

/**
 * Normaliza o texto do comentário removendo acentos, excesso de caracteres repetidos e pontuação
 * Exemplo: "Euuu queroooo o linkkk!! 🚀" -> "eu quero o link"
 */
export function normalizeCommentText(text: string): string {
  if (!text) return "";

  return text
    // 1. Remove acentuações e diacríticos (ex: "preço" -> "preco", "coração" -> "coracao")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // 2. Normaliza para minúsculas
    .toLowerCase()
    // 3. Remove repetições exageradas de caracteres (ex: "querrroooo" -> "quero", "linkkk" -> "link")
    // Mantém no máximo 1 repetição (2 caracteres consecutivos) para não alterar palavras como "passo" ou "acesso"
    .replace(/(.)\1{2,}/g, "$1")
    // 4. Substitui emojis e símbolos especiais por espaço
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]/g, " ")
    // 5. Remove pontuações desnecessárias mantendo letras e números
    .replace(/[^a-z0-9\s]/g, " ")
    // 6. Colapsa espaços múltiplos
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Calcula a distância de Levenshtein entre duas strings para busca difusa (Fuzzy)
 */
export function calculateLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substituição
          matrix[i][j - 1] + 1,     // inserção
          matrix[i - 1][j] + 1      // deleção
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Expande uma lista de palavras-chave com seus sinônimos conhecidos do ChatbotX
 */
export function expandKeywordsWithSynonyms(keywords: string[]): string[] {
  const result = new Set<string>();

  for (const kw of keywords) {
    const cleanKw = kw.trim().toUpperCase();
    result.add(cleanKw);

    // Varre os grupos de sinônimos
    for (const group of Object.values(TRIGGER_SYNONYM_GROUPS)) {
      if (group.some(syn => syn === cleanKw)) {
        group.forEach(s => result.add(s));
      }
    }
  }

  return Array.from(result);
}

/**
 * Compila a expressão regular oficial para cada modo de correspondência
 */
export function compileTriggerRegex(keyword: string, mode: TriggerMatchMode = "contains"): RegExp {
  const normalizedKw = normalizeCommentText(keyword);
  // Escapa caracteres especiais de regex
  const escaped = normalizedKw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  if (mode === "exact") {
    return new RegExp(`^${escaped}$`, "i");
  }

  if (mode === "regex") {
    try {
      return new RegExp(keyword, "i");
    } catch {
      // Fallback para contains se regex for inválida
      return new RegExp(`\\b${escaped}\\b`, "i");
    }
  }

  // Modo "contains": usa fronteiras de palavra (\b) para evitar falso-positivo em "blink", "slink", etc.
  return new RegExp(`\\b${escaped}\\b`, "i");
}

/**
 * Função Principal: Avalia um comentário contra uma lista de palavras-chave
 */
export function matchCommentTrigger(
  rawComment: string,
  keywords: string[],
  options: TriggerMatchOptions = {}
): TriggerMatchResult {
  const mode = options.mode || "contains";
  const useSynonyms = options.useSynonyms ?? false;
  const fuzzyMaxDistance = options.fuzzyMaxDistance ?? 1;

  const normalized = normalizeCommentText(rawComment);

  if (!normalized || !keywords || keywords.length === 0) {
    return {
      isMatch: false,
      confidence: 0,
      matchModeUsed: mode,
      normalizedComment: normalized
    };
  }

  // 1. Expande com sinônimos se solicitado
  const effectiveKeywords = useSynonyms 
    ? expandKeywordsWithSynonyms(keywords) 
    : keywords;

  // 2. MODO EXATO: O comentário inteiro precisa ser a palavra-chave
  if (mode === "exact") {
    for (const kw of effectiveKeywords) {
      const normKw = normalizeCommentText(kw);
      if (normalized === normKw) {
        return {
          isMatch: true,
          matchedKeyword: kw,
          matchedSnippet: normalized,
          confidence: 1.0,
          matchModeUsed: "exact",
          normalizedComment: normalized
        };
      }
    }
    return { isMatch: false, confidence: 0, matchModeUsed: "exact", normalizedComment: normalized };
  }

  // 3. MODO REGEX: Avalia regex livre
  if (mode === "regex") {
    for (const kw of effectiveKeywords) {
      try {
        const rx = new RegExp(kw, "i");
        const match = rx.exec(rawComment);
        if (match) {
          return {
            isMatch: true,
            matchedKeyword: kw,
            matchedSnippet: match[0],
            confidence: 0.95,
            matchModeUsed: "regex",
            normalizedComment: normalized
          };
        }
      } catch {
        // Ignora regex inválida
      }
    }
    return { isMatch: false, confidence: 0, matchModeUsed: "regex", normalizedComment: normalized };
  }

  // 4. MODO CONTAINS (COM FRONTEIRAS DE PALAVRA): Evita "blink" dar match em "link"
  if (mode === "contains") {
    for (const kw of effectiveKeywords) {
      const rx = compileTriggerRegex(kw, "contains");
      const match = rx.exec(normalized);
      if (match) {
        return {
          isMatch: true,
          matchedKeyword: kw,
          matchedSnippet: match[0],
          confidence: 0.98,
          matchModeUsed: "contains",
          normalizedComment: normalized
        };
      }
    }
  }

  // 5. MODO DIFUSO (FUZZY): Detecta typos e pequenas variações ("qro", "linck", "linkk")
  if (mode === "fuzzy" || options.mode === "fuzzy") {
    const commentTokens = normalized.split(" ");
    
    for (const kw of effectiveKeywords) {
      const normKw = normalizeCommentText(kw);
      
      // Se a palavra-chave for multi-palavra (ex: "eu quero")
      if (normKw.includes(" ")) {
        if (normalized.includes(normKw)) {
          return {
            isMatch: true,
            matchedKeyword: kw,
            matchedSnippet: normKw,
            confidence: 0.95,
            matchModeUsed: "fuzzy",
            normalizedComment: normalized
          };
        }
      }

      // Avalia cada palavra do comentário individualmente
      for (const token of commentTokens) {
        if (token.length >= 3 && Math.abs(token.length - normKw.length) <= fuzzyMaxDistance) {
          const distance = calculateLevenshteinDistance(token, normKw);
          if (distance <= fuzzyMaxDistance) {
            const confidence = 1 - (distance / Math.max(token.length, normKw.length));
            return {
              isMatch: true,
              matchedKeyword: kw,
              matchedSnippet: token,
              confidence: Number(confidence.toFixed(2)),
              matchModeUsed: "fuzzy",
              normalizedComment: normalized
            };
          }
        }
      }
    }
  }

  return {
    isMatch: false,
    confidence: 0,
    matchModeUsed: mode,
    normalizedComment: normalized
  };
}
