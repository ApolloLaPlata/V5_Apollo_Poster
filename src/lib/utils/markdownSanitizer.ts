/**
 * Sanitizador Profundo de Markdown e HTML para Despacho Onicanal Seguro
 * Capitania #13: V5 Apollo Poster
 */

export interface SanitizationResult {
  cleanContent: string;
  sanitizedCount: number;
  removedPatterns: string[];
  hasModifications: boolean;
}

/**
 * Expressões regulares para detecção de caracteres de controle invisíveis,
 * tags ativas maliciosas, manipuladores de evento DOM e protocolos perigosos.
 */
const INVISIBLE_CONTROL_CHARS_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g;

const DANGEROUS_TAGS_REGEX = /<\s*(script|style|iframe|object|embed|applet|meta|link|form|input|button|base)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>|<\s*(script|style|iframe|object|embed|applet|meta|link|form|input|button|base)\b[^>]*\/?>/gi;

const EVENT_HANDLERS_REGEX = /\bon\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi;

const DANGEROUS_PROTOCOLS_REGEX = /(?:href|src)\s*=\s*['"]\s*(?:javascript|vbscript|data:text\/html):[^'"]*['"]/gi;

const DANGEROUS_MD_LINKS_REGEX = /\[([^\]]+)\]\((?:javascript|vbscript|data:text\/html):[^\)]*\)/gi;

/**
 * Executa sanitização profunda e retorna diagnóstico de alterações
 */
export function sanitizeMarkdownAdvanced(rawMarkdown: string): SanitizationResult {
  if (!rawMarkdown) {
    return {
      cleanContent: "",
      sanitizedCount: 0,
      removedPatterns: [],
      hasModifications: false
    };
  }

  let clean = rawMarkdown;
  const removed: string[] = [];
  let totalRemoved = 0;

  // 1. Remoção de caracteres de controle e bytes invisíveis (BOM e Zero-Width)
  const invisibleMatches = clean.match(INVISIBLE_CONTROL_CHARS_REGEX);
  if (invisibleMatches && invisibleMatches.length > 0) {
    totalRemoved += invisibleMatches.length;
    removed.push(`${invisibleMatches.length} caracteres de controle/zero-width`);
    clean = clean.replace(INVISIBLE_CONTROL_CHARS_REGEX, "");
  }

  // 2. Remoção de tags ativas maliciosas (<script>, <iframe>, etc.)
  const dangerousTagMatches = clean.match(DANGEROUS_TAGS_REGEX);
  if (dangerousTagMatches && dangerousTagMatches.length > 0) {
    totalRemoved += dangerousTagMatches.length;
    removed.push(`${dangerousTagMatches.length} tags ativas perigosas`);
    clean = clean.replace(DANGEROUS_TAGS_REGEX, "");
  }

  // 3. Remoção de event handlers DOM (onload, onerror, onclick, etc.)
  const handlerMatches = clean.match(EVENT_HANDLERS_REGEX);
  if (handlerMatches && handlerMatches.length > 0) {
    totalRemoved += handlerMatches.length;
    removed.push(`${handlerMatches.length} atributos de evento DOM`);
    clean = clean.replace(EVENT_HANDLERS_REGEX, "");
  }

  // 4. Remoção de protocolos perigosos em links HTML (javascript:, data:text/html)
  const protocolMatches = clean.match(DANGEROUS_PROTOCOLS_REGEX);
  if (protocolMatches && protocolMatches.length > 0) {
    totalRemoved += protocolMatches.length;
    removed.push(`${protocolMatches.length} protocolos inseguros HTML`);
    clean = clean.replace(DANGEROUS_PROTOCOLS_REGEX, "");
  }

  // 5. Remoção de links maliciosos no formato Markdown [texto](javascript:...)
  const mdLinkMatches = clean.match(DANGEROUS_MD_LINKS_REGEX);
  if (mdLinkMatches && mdLinkMatches.length > 0) {
    totalRemoved += mdLinkMatches.length;
    removed.push(`${mdLinkMatches.length} links markdown com protocolo javascript`);
    clean = clean.replace(DANGEROUS_MD_LINKS_REGEX, "$1");
  }

  // Normalização de quebras de linha Windows para padrão Unix uniforme
  clean = clean.replace(/\r\n/g, "\n");

  return {
    cleanContent: clean,
    sanitizedCount: totalRemoved,
    removedPatterns: removed,
    hasModifications: clean !== rawMarkdown
  };
}

/**
 * Função rápida para compatibilidade com formatters e motores de compilação
 */
export function sanitizeMarkdown(rawMarkdown: string): string {
  return sanitizeMarkdownAdvanced(rawMarkdown).cleanContent;
}
