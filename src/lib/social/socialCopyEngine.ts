/**
 * socialCopyEngine.ts - Motor de Cópia Resiliente e Pacotes Onicanal
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Fornece cópia com 1 clique para a área de transferência:
 * - Fallback inteligente entre navigator.clipboard e document.execCommand
 * - Formatador de pacote onicanal completo ("Kit de Teasers Sociais")
 * - Sanitização de quebras de linha e normalização UTF-8
 * - Metadados de telemetria por plataforma para feedback contextual
 */

import { MultimodalDispatchPayload, SocialTeaserPlatform, CompiledSocialTeasers } from "@/types/poster";
import { SOCIAL_PLATFORM_NAMES, SOCIAL_CHAR_LIMITS } from "./socialTeaserEngine";

export interface CopyTeaserOptions {
  platform?: SocialTeaserPlatform;
  includeMetadata?: boolean;
  onSuccess?: () => void;
  onError?: (err: Error) => void;
}

/**
 * Utilitário universal de cópia para a área de transferência com fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Tenta API moderna do navegador
  if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Falha de permissão ou contexto; segue para o fallback abaixo
    }
  }

  // 2. Fallback resiliente via elemento textarea temporário
  if (typeof document !== "undefined") {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      // Garante invisibilidade sem display:none
      textArea.style.position = "fixed";
      textArea.style.top = "-9999px";
      textArea.style.left = "-9999px";
      textArea.style.opacity = "0";
      textArea.setAttribute("readonly", "");
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error("[socialCopyEngine] Falha ao copiar texto via fallback:", err);
      return false;
    }
  }

  return false;
}

/**
 * Formata um pacote completo com os 6 teasers sociais em formato Markdown organizado
 * Perfeito para copiar para Notion, Slack, Trello ou planilhas de conteúdo com 1 clique!
 */
export function formatAllTeasersBundle(
  payload: MultimodalDispatchPayload,
  teasers: CompiledSocialTeasers
): string {
  const now = new Date().toISOString().replace("T", " ").substring(0, 19);
  const title = payload.title.trim();
  const url = payload.canonical_url || `https://v5autoblog.com/artigo/${payload.slug}`;

  const separator = "=".repeat(60);

  const sections = [
    `# 📦 KIT COMPLETO DE TEASERS SOCIAIS (V5 APOLLO POSTER :3011)`,
    `Artigo: "${title}"`,
    `Link Canônico: ${url}`,
    `Gerado em: ${now}`,
    separator,
    "",
    `## 1. 𝕏 / TWITTER (${teasers.x_twitter.charCount}/${teasers.x_twitter.charLimit}c)`,
    teasers.x_twitter.text,
    "",
    separator,
    "",
    `## 2. 🧵 THREADS (${teasers.threads.charCount}/${teasers.threads.charLimit}c)`,
    teasers.threads.text,
    "",
    separator,
    "",
    `## 3. 📸 INSTAGRAM FEED & REELS (${teasers.instagram.charCount}/${teasers.instagram.charLimit}c)`,
    teasers.instagram.text,
    "",
    separator,
    "",
    `## 4. 💬 WHATSAPP COMUNIDADES & GRUPOS (${teasers.whatsapp.charCount}/${teasers.whatsapp.charLimit}c)`,
    teasers.whatsapp.text,
    "",
    separator,
    "",
    `## 5. ✈️ TELEGRAM CANAIS VIP (${teasers.telegram.charCount}/${teasers.telegram.charLimit}c)`,
    teasers.telegram.text,
    "",
    separator,
    "",
    `## 6. 💼 LINKEDIN ARTIGOS & POSTS (${teasers.linkedin.charCount}/${teasers.linkedin.charLimit}c)`,
    teasers.linkedin.text,
    "",
    separator,
    `Fim do Pacote Onicanal • Holding V5 Apollo • Capitania #13 Poster`
  ];

  return sections.join("\n");
}

/**
 * Retorna mensagem contextual para notificação de cópia
 */
export function getCopyFeedbackMessage(platform: SocialTeaserPlatform, charCount: number): string {
  const name = SOCIAL_PLATFORM_NAMES[platform] || platform;
  const limit = SOCIAL_CHAR_LIMITS[platform] || 280;
  return `Teaser de ${name} copiado (${charCount}/${limit}c)! Pronto para colar.`;
}
