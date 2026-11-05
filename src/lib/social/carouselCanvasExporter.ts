/**
 * carouselCanvasExporter.ts - Renderizador de Imagens para Carrossel Instagram & Stories
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Renderiza lâminas de alta resolução diretamente no navegador usando HTML5 Canvas nativo:
 * - 4:5 Feed (1080x1350)
 * - 9:16 Story/Reels/TikTok (1080x1920)
 */

import { CarouselSlide, CarouselDeck } from "./carouselDeckGenerator";

export type CarouselThemeId = "obsidian" | "cyber" | "emerald" | "sunset" | "editorial";
export type CarouselAspectRatio = "4:5" | "9:16";

export interface CarouselThemeConfig {
  id: CarouselThemeId;
  name: string;
  bgGradient: [string, string];
  cardBg: string;
  cardBorder: string;
  accentColor: string;
  accentSecondary: string;
  textColor: string;
  mutedTextColor: string;
  handleColor: string;
}

export const CAROUSEL_THEMES: Record<CarouselThemeId, CarouselThemeConfig> = {
  obsidian: {
    id: "obsidian",
    name: "Obsidian Gold (Padrão Apollo)",
    bgGradient: ["#09090b", "#000000"],
    cardBg: "#18181b",
    cardBorder: "#27272a",
    accentColor: "#f59e0b",
    accentSecondary: "#fbbf24",
    textColor: "#ffffff",
    mutedTextColor: "#a1a1aa",
    handleColor: "#f59e0b"
  },
  cyber: {
    id: "cyber",
    name: "Cyber Neon (Tech & IA)",
    bgGradient: ["#0f172a", "#020617"],
    cardBg: "#1e293b",
    cardBorder: "#334155",
    accentColor: "#06b6d4",
    accentSecondary: "#8b5cf6",
    textColor: "#ffffff",
    mutedTextColor: "#94a3b8",
    handleColor: "#06b6d4"
  },
  emerald: {
    id: "emerald",
    name: "Emerald Growth (Negócios & ROI)",
    bgGradient: ["#022c22", "#061a14"],
    cardBg: "#064e3b",
    cardBorder: "#047857",
    accentColor: "#10b981",
    accentSecondary: "#34d399",
    textColor: "#ffffff",
    mutedTextColor: "#a7f3d0",
    handleColor: "#34d399"
  },
  sunset: {
    id: "sunset",
    name: "Sunset Crimson (Alerta & Impacto)",
    bgGradient: ["#1c1917", "#0c0a09"],
    cardBg: "#292524",
    cardBorder: "#44403c",
    accentColor: "#f43f5e",
    accentSecondary: "#fb7185",
    textColor: "#ffffff",
    mutedTextColor: "#d6d3d1",
    handleColor: "#f43f5e"
  },
  editorial: {
    id: "editorial",
    name: "Clean Minimal (Editorial Light)",
    bgGradient: ["#f8fafc", "#f1f5f9"],
    cardBg: "#ffffff",
    cardBorder: "#e2e8f0",
    accentColor: "#0f172a",
    accentSecondary: "#334155",
    textColor: "#0f172a",
    mutedTextColor: "#64748b",
    handleColor: "#0f172a"
  }
};

/**
 * Função utilitária para quebra de texto em múltiplas linhas com suporte a largura máxima
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = words[0] || "";

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(`${currentLine} ${word}`).width;
    if (width < maxWidth) {
      currentLine += ` ${word}`;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Renderiza um slide de carrossel em um elemento HTMLCanvasElement (4:5 ou 9:16)
 */
export function renderSlideToCanvas(
  slide: CarouselSlide,
  deck: CarouselDeck,
  themeId: CarouselThemeId = "obsidian",
  customHandle = "@v5apollo",
  aspectRatio: CarouselAspectRatio = "4:5"
): HTMLCanvasElement {
  const width = 1080;
  const isStory = aspectRatio === "9:16";
  const height = isStory ? 1920 : 1350;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const theme = CAROUSEL_THEMES[themeId] || CAROUSEL_THEMES.obsidian;

  // 1. Fundo com Gradiente Linear
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, theme.bgGradient[0]);
  bgGrad.addColorStop(1, theme.bgGradient[1]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Efeito de Iluminação Sutil no Topo (Glow)
  const glowGrad = ctx.createRadialGradient(width / 2, 0, 50, width / 2, 0, isStory ? 900 : 700);
  glowGrad.addColorStop(0, `${theme.accentColor}25`);
  glowGrad.addColorStop(1, "transparent");
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, width, height);

  // 3. Moldura e Margens
  const paddingX = 90;
  const contentWidth = width - paddingX * 2;

  // 4. Cabeçalho: Badge da Lâmina + Handle da Marca (Safe zone para Stories se 9:16)
  const headerY = isStory ? 180 : 110;

  // Badge Pill
  ctx.font = "bold 26px sans-serif";
  const badgeText = slide.badge.toUpperCase();
  const badgeWidth = ctx.measureText(badgeText).width + 40;
  const badgeHeight = 52;

  ctx.fillStyle = `${theme.accentColor}25`;
  ctx.strokeStyle = `${theme.accentColor}80`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(paddingX, headerY - 36, badgeWidth, badgeHeight, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = theme.accentSecondary;
  ctx.fillText(badgeText, paddingX + 20, headerY);

  // Handle da Conta
  ctx.font = "bold 28px sans-serif";
  ctx.fillStyle = theme.handleColor;
  const handleWidth = ctx.measureText(customHandle).width;
  ctx.fillText(customHandle, width - paddingX - handleWidth, headerY);

  // Linha Divisória Superior
  ctx.strokeStyle = `${theme.mutedTextColor}25`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(paddingX, headerY + 45);
  ctx.lineTo(width - paddingX, headerY + 45);
  ctx.stroke();

  // 5. Título / Headline Principal
  let currentY = isStory ? 380 : 280;
  ctx.font = "bold 58px sans-serif";
  ctx.fillStyle = theme.textColor;

  const headlineLines = wrapText(ctx, slide.headline, contentWidth);
  const headlineLineHeight = 74;

  for (const line of headlineLines) {
    ctx.fillText(line, paddingX, currentY);
    currentY += headlineLineHeight;
  }

  currentY += isStory ? 60 : 40;

  // 6. Corpo de Texto / Parágrafos
  ctx.font = "normal 34px sans-serif";
  ctx.fillStyle = theme.mutedTextColor;
  const bodyLineHeight = isStory ? 58 : 52;

  for (const paragraph of slide.body) {
    const isBullet = paragraph.startsWith("•") || /^[0-9]\./.test(paragraph);
    if (isBullet) {
      ctx.fillStyle = theme.textColor;
      ctx.font = "500 34px sans-serif";
    } else {
      ctx.fillStyle = theme.mutedTextColor;
      ctx.font = "normal 34px sans-serif";
    }

    const paraLines = wrapText(ctx, paragraph, contentWidth);
    for (const pLine of paraLines) {
      ctx.fillText(pLine, paddingX, currentY);
      currentY += bodyLineHeight;
    }
    currentY += isStory ? 30 : 20; // Espaçamento entre parágrafos
  }

  // 7. Callout Box de Destaque (se presente)
  if (slide.callout) {
    currentY += isStory ? 40 : 25;
    ctx.font = "600 32px sans-serif";
    const calloutLines = wrapText(ctx, slide.callout, contentWidth - 60);
    const boxHeight = calloutLines.length * 48 + 44;

    ctx.fillStyle = `${theme.accentColor}18`;
    ctx.strokeStyle = `${theme.accentColor}50`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(paddingX, currentY, contentWidth, boxHeight, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = theme.accentSecondary;
    let textY = currentY + 44;
    for (const cLine of calloutLines) {
      ctx.fillText(cLine, paddingX + 30, textY);
      textY += 48;
    }
  }

  // 8. Rodapé (Footer)
  const footerY = isStory ? height - 160 : height - 100;

  // Linha Divisória Inferior
  ctx.strokeStyle = `${theme.mutedTextColor}25`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(paddingX, footerY - 45);
  ctx.lineTo(width - paddingX, footerY - 45);
  ctx.stroke();

  // Ações de Engajamento
  ctx.font = "bold 26px sans-serif";
  ctx.fillStyle = theme.mutedTextColor;
  const actionText = isStory ? "👆 Arraste / Responda ao Story" : "💾 Salvar Post   •   ✈️ Compartilhar";
  ctx.fillText(actionText, paddingX, footerY);

  // Paginação da Lâmina
  const pageText = `Lâmina ${slide.slideNumber} de ${deck.totalSlides}`;
  const pageWidth = ctx.measureText(pageText).width;
  ctx.fillStyle = theme.accentSecondary;
  ctx.fillText(pageText, width - paddingX - pageWidth, footerY);

  return canvas;
}

/**
 * Dispara o download de um slide específico como arquivo PNG
 */
export function downloadSlideAsPng(
  slide: CarouselSlide,
  deck: CarouselDeck,
  themeId: CarouselThemeId = "obsidian",
  customHandle = "@v5apollo",
  aspectRatio: CarouselAspectRatio = "4:5"
): void {
  const canvas = renderSlideToCanvas(slide, deck, themeId, customHandle, aspectRatio);
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  const sanitizedTopic = deck.topic.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30);
  const formatTag = aspectRatio === "9:16" ? "story" : "feed";
  link.download = `carrossel-${sanitizedTopic}-${formatTag}-slide-${slide.slideNumber}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Dispara o download em sequência de todas as 5 lâminas do carrossel
 */
export async function downloadAllSlidesBatch(
  deck: CarouselDeck,
  themeId: CarouselThemeId = "obsidian",
  customHandle = "@v5apollo",
  aspectRatio: CarouselAspectRatio = "4:5",
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const total = deck.slides.length;
  for (let i = 0; i < total; i++) {
    const slide = deck.slides[i];
    downloadSlideAsPng(slide, deck, themeId, customHandle, aspectRatio);
    if (onProgress) {
      onProgress(i + 1, total);
    }
    // Pequena pausa de 350ms para evitar gargalo no navegador ao disparar múltiplos downloads
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
}
