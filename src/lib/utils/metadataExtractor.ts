/**
 * Extrator Automático de Metadados e Densidade Semântica
 * Capitania #13: V5 Apollo Poster
 */

export interface KeywordDensity {
  word: string;
  count: number;
  density: number; // Porcentagem, ex: 2.8%
}

export interface ContentMetadata {
  wordCount: number;
  charCount: number;
  charCountNoSpaces: number;
  readingTimeMinutes: number;
  readingTimeSeconds: number;
  paragraphCount: number;
  headingCount: {
    h1: number;
    h2: number;
    h3: number;
    total: number;
  };
  linkCount: number;
  imageCount: number;
  hasPaywallBreak: boolean;
  readabilityScore: number; // 0 a 100
  readabilityLevel: "Muito Fácil" | "Fácil" | "Médio" | "Difícil" | "Técnico";
  topKeywords: KeywordDensity[];
}

const PT_STOPWORDS = new Set([
  "a", "ao", "aos", "aquela", "aquelas", "aquele", "aqueles", "aquilo", "as", "até",
  "com", "como", "da", "das", "de", "dela", "delas", "dele", "deles", "depois",
  "do", "dos", "e", "é", "ela", "elas", "ele", "eles", "em", "entre", "era", "eram",
  "éramos", "essa", "essas", "esse", "esses", "esta", "está", "estamos", "estão",
  "estas", "estava", "estavam", "estávamos", "este", "estes", "estou", "eu", "foi",
  "fomos", "for", "foram", "fosse", "fossem", "fui", "há", "haja", "hajam", "houve",
  "isso", "isto", "já", "lhe", "lhes", "mais", "mas", "me", "mesmo", "meu", "meus",
  "minha", "minhas", "muito", "na", "não", "nas", "nem", "no", "nos", "nós", "nossa",
  "nossas", "nosso", "nossos", "num", "numa", "o", "os", "ou", "para", "pela", "pelas",
  "pelo", "pelos", "por", "qual", "quando", "que", "quem", "são", "se", "seja", "sejam",
  "sem", "ser", "será", "serão", "seu", "seus", "só", "sua", "suas", "também", "te",
  "tem", "temos", "tenham", "tenho", "ter", "teu", "teus", "teve", "tinha", "tinham",
  "tive", "tivemos", "tiver", "tiveram", "tu", "tua", "tuas", "um", "uma", "você", "vocês",
  "apenas", "sobre", "cada", "onde", "qualquer", "todos", "todas", "outro", "outra", "outros",
  "falando", "estao", "estaria", "quando", "ainda"
]);

export function extractContentMetadata(markdown: string): ContentMetadata {
  if (!markdown || !markdown.trim()) {
    return {
      wordCount: 0,
      charCount: 0,
      charCountNoSpaces: 0,
      readingTimeMinutes: 0,
      readingTimeSeconds: 0,
      paragraphCount: 0,
      headingCount: { h1: 0, h2: 0, h3: 0, total: 0 },
      linkCount: 0,
      imageCount: 0,
      hasPaywallBreak: false,
      readabilityScore: 100,
      readabilityLevel: "Muito Fácil",
      topKeywords: []
    };
  }

  const rawChars = markdown.length;
  const charsNoSpaces = markdown.replace(/\s+/g, "").length;

  // Limpeza de blocos de código e markdown para contagem pura de palavras
  const cleanText = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`.*?`/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/>\s+/g, "")
    .replace(/[-*+]\s+/g, "")
    .replace(/^\d+\.\s+/gm, "");

  const words = cleanText
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2);

  const totalWords = words.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(totalWords / 200));
  const readingTimeSeconds = Math.round((totalWords / 200) * 60);

  // Parágrafos
  const paragraphs = markdown.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const paragraphCount = paragraphs.length;

  // Títulos
  const h1 = (markdown.match(/^#\s+[^\n]+/gm) || []).length;
  const h2 = (markdown.match(/^##\s+[^\n]+/gm) || []).length;
  const h3 = (markdown.match(/^###\s+[^\n]+/gm) || []).length;

  // Links & Imagens
  const linkCount = (markdown.match(/(?<!!)\[.*?\]\(.*?\)/g) || []).length;
  const imageCount = (markdown.match(/!\[.*?\]\(.*?\)/g) || []).length;

  // Detecção de Paywall Break
  const hasPaywallBreak = markdown.includes("[PAYWALL_BREAK") || 
                          markdown.includes("<!-- paywall") || 
                          markdown.includes("<!-- PAYWALL");

  // Densidade Semântica e Palavras-chave
  const frequencyMap = new Map<string, number>();
  for (const word of words) {
    if (!PT_STOPWORDS.has(word) && isNaN(Number(word))) {
      frequencyMap.set(word, (frequencyMap.get(word) || 0) + 1);
    }
  }

  const sortedKeywords = Array.from(frequencyMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word, count]) => ({
      word,
      count,
      density: Number(((count / (totalWords || 1)) * 100).toFixed(1))
    }));

  // Índice de Legibilidade adaptado para PT-BR
  const sentences = Math.max(1, (cleanText.match(/[.!?]+(?:\s+|$)/g) || []).length);
  const avgWordsPerSentence = totalWords / sentences;
  const avgWordLength = charsNoSpaces / (totalWords || 1);

  let readabilityScore = Math.round(200 - (avgWordsPerSentence * 2.5) - (avgWordLength * 15));
  readabilityScore = Math.min(100, Math.max(15, readabilityScore));

  let readabilityLevel: ContentMetadata["readabilityLevel"] = "Médio";
  if (readabilityScore >= 75) readabilityLevel = "Muito Fácil";
  else if (readabilityScore >= 60) readabilityLevel = "Fácil";
  else if (readabilityScore >= 45) readabilityLevel = "Médio";
  else if (readabilityScore >= 30) readabilityLevel = "Difícil";
  else readabilityLevel = "Técnico";

  return {
    wordCount: totalWords,
    charCount: rawChars,
    charCountNoSpaces: charsNoSpaces,
    readingTimeMinutes,
    readingTimeSeconds,
    paragraphCount,
    headingCount: {
      h1,
      h2,
      h3,
      total: h1 + h2 + h3
    },
    linkCount,
    imageCount,
    hasPaywallBreak,
    readabilityScore,
    readabilityLevel,
    topKeywords: sortedKeywords
  };
}
