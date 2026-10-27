/**
 * Utilitários Oficiais de Formatação e Saneamento - Capitania #13: V5 Apollo Poster
 */

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function calculateReadingTimeMinutes(text: string): number {
  const words = countWords(text);
  const wordsPerMinute = 200;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes > 0 ? minutes : 1;
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || "";
  const sub = text.substring(0, maxLength);
  const lastSpace = sub.lastIndexOf(" ");
  return (lastSpace > 0 ? sub.substring(0, lastSpace) : sub) + "...";
}

export { sanitizeMarkdown, sanitizeMarkdownAdvanced } from "./markdownSanitizer";

export function formatLocalDateTimeInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

export function formatRelativeDate(isoDateString: string): string {
  if (!isoDateString) return "";
  try {
    const targetDate = new Date(isoDateString);
    const now = new Date();
    const isToday =
      targetDate.getDate() === now.getDate() &&
      targetDate.getMonth() === now.getMonth() &&
      targetDate.getFullYear() === now.getFullYear();

    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow =
      targetDate.getDate() === tomorrow.getDate() &&
      targetDate.getMonth() === tomorrow.getMonth() &&
      targetDate.getFullYear() === tomorrow.getFullYear();

    const timeStr = targetDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    if (isToday) return `Hoje às ${timeStr}`;
    if (isTomorrow) return `Amanhã às ${timeStr}`;

    return targetDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return isoDateString;
  }
}

export function generateUtmUrl(
  baseUrl: string,
  utm: { source: string; medium: string; campaign: string; content?: string }
): string {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set("utm_source", utm.source);
    url.searchParams.set("utm_medium", utm.medium);
    url.searchParams.set("utm_campaign", utm.campaign);
    if (utm.content) {
      url.searchParams.set("utm_content", utm.content);
    }
    return url.toString();
  } catch {
    const separator = baseUrl.includes("?") ? "&" : "?";
    const params = new URLSearchParams({
      utm_source: utm.source,
      utm_medium: utm.medium,
      utm_campaign: utm.campaign,
      ...(utm.content ? { utm_content: utm.content } : {})
    });
    return `${baseUrl}${separator}${params.toString()}`;
  }
}
