"use client";

import React, { useState, useMemo } from "react";
import { 
  X, 
  Sparkles, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  ArrowRight,
  Bookmark,
  Share2,
  Download,
  Palette,
  AtSign,
  Edit3
} from "lucide-react";
import { 
  generateCarouselSlideDeck, 
  CarouselDeck, 
  CarouselSlide 
} from "@/lib/social/carouselDeckGenerator";
import { 
  CAROUSEL_THEMES, 
  CarouselThemeId, 
  downloadSlideAsPng, 
  downloadAllSlidesBatch 
} from "@/lib/social/carouselCanvasExporter";
import { toast } from "@/lib/toast/useToast";

interface CarouselSlideDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicTitle: string;
  onApplyToStudio?: (fullText: string, title: string) => void;
}

export function CarouselSlideDeckModal({
  isOpen,
  onClose,
  topicTitle,
  onApplyToStudio
}: CarouselSlideDeckModalProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [keyword, setKeyword] = useState<string>("LINK");
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedTheme, setSelectedTheme] = useState<CarouselThemeId>("obsidian");
  const [customHandle, setCustomHandle] = useState<string>("@v5apollo");
  const [isDownloadingBatch, setIsDownloadingBatch] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number } | null>(null);

  // Geração da base do deck
  const baseDeck = useMemo(() => {
    return generateCarouselSlideDeck(topicTitle, keyword);
  }, [topicTitle, keyword]);

  // Estado editável dos slides para que o usuário possa fazer ajustes finos antes de baixar
  const [editableSlides, setEditableSlides] = useState<CarouselSlide[]>([]);

  React.useEffect(() => {
    if (baseDeck.slides.length > 0) {
      setEditableSlides(JSON.parse(JSON.stringify(baseDeck.slides)));
    }
  }, [baseDeck]);

  const deck: CarouselDeck = useMemo(() => {
    return {
      ...baseDeck,
      slides: editableSlides.length > 0 ? editableSlides : baseDeck.slides
    };
  }, [baseDeck, editableSlides]);

  const currentSlide = deck.slides[currentSlideIndex] || deck.slides[0];

  const handleUpdateCurrentSlideHeadline = (val: string) => {
    setEditableSlides((prev) => {
      const copy = [...prev];
      if (copy[currentSlideIndex]) {
        copy[currentSlideIndex].headline = val;
      }
      return copy;
    });
  };

  const handleCopyFullDeck = () => {
    const fullText = deck.slides
      .map(
        (s) =>
          `=== ${s.badge} ===\n${s.headline}\n\n${s.body.join("\n")}${
            s.callout ? `\n\n${s.callout}` : ""
          }`
      )
      .join("\n\n-------------------------\n\n");

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success("Roteiro Completo de 5 Slides Copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCurrentSlide = () => {
    if (!currentSlide) return;
    downloadSlideAsPng(currentSlide, deck, selectedTheme, customHandle);
    toast.success(`Slide ${currentSlide.slideNumber} Baixado!`, "Imagem PNG 1080x1350 gerada com sucesso.");
  };

  const handleDownloadAllSlides = async () => {
    setIsDownloadingBatch(true);
    setDownloadProgress({ current: 0, total: deck.slides.length });
    try {
      await downloadAllSlidesBatch(
        deck,
        selectedTheme,
        customHandle,
        (current, total) => {
          setDownloadProgress({ current, total });
        }
      );
      toast.success("Todos os 5 Slides Baixados!", "Lote completo pronto para o Instagram.");
    } catch {
      toast.error("Erro ao baixar lote", "Ocorreu uma falha no processamento do canvas.");
    } finally {
      setIsDownloadingBatch(false);
      setDownloadProgress(null);
    }
  };

  const handleApply = () => {
    if (onApplyToStudio) {
      const summaryCopy =
        `🎠 CARROSSEL EDUCATIVO: ${deck.topic}\n\n` +
        `Arrasta para o lado para conferir os 5 passos:\n\n` +
        deck.slides.map((s) => `📍 Slide ${s.slideNumber}: ${s.headline}`).join("\n") +
        `\n\n💬 Comente "${keyword}" para receber o playbook detalhado no seu Direct!\n\n` +
        deck.hashtags.join(" ");

      onApplyToStudio(summaryCopy, deck.slides[0]?.headline || topicTitle);
      toast.success("Roteiro do Carrossel aplicado no Estúdio!");
      onClose();
    }
  };

  if (!isOpen) return null;

  const currentThemeConfig = CAROUSEL_THEMES[selectedTheme] || CAROUSEL_THEMES.obsidian;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Roteirizador de Carrossel Slide a Slide</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold">
                  Pilar 2 · 5 Lâminas (4:5)
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Estrutura de alta retenção visual com gerador nativo de PNG 1080x1350 direto no seu navegador.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Superior: Tema, Handle e Gatilho */}
        <div className="px-6 py-3 bg-zinc-900/40 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {/* Seletor de Tema */}
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-400" />
            <span className="text-zinc-400 font-bold">Tema:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(Object.keys(CAROUSEL_THEMES) as CarouselThemeId[]).map((themeKey) => {
                const t = CAROUSEL_THEMES[themeKey];
                const isSelected = selectedTheme === themeKey;
                return (
                  <button
                    key={themeKey}
                    type="button"
                    onClick={() => setSelectedTheme(themeKey)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition flex items-center gap-1 border ${
                      isSelected
                        ? "bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold shadow-sm"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: t.accentColor }}
                    />
                    <span>{t.name.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Handle + Keyword */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
              <AtSign className="w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                value={customHandle}
                onChange={(e) => setCustomHandle(e.target.value)}
                placeholder="@seuperfil"
                className="bg-transparent text-zinc-200 text-xs focus:outline-none w-24"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
              <span className="text-zinc-400 text-[11px]">Palavra-Chave:</span>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value.toUpperCase())}
                placeholder="LINK"
                className="bg-transparent text-amber-400 font-bold text-xs focus:outline-none w-16 uppercase"
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Seletor de Lâminas / Indicador */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {deck.slides.map((s, idx) => (
                <button
                  key={s.slideNumber}
                  type="button"
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 border ${
                    currentSlideIndex === idx
                      ? "bg-amber-500 text-black border-amber-400 shadow-md"
                      : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                  }`}
                >
                  <span>Slide {s.slideNumber}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <button
                type="button"
                disabled={currentSlideIndex === 0}
                onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 border border-zinc-800 transition"
                title="Lâmina Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>
                {currentSlideIndex + 1} / {deck.totalSlides}
              </span>
              <button
                type="button"
                disabled={currentSlideIndex === deck.totalSlides - 1}
                onClick={() => setCurrentSlideIndex((prev) => Math.min(deck.totalSlides - 1, prev + 1))}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 border border-zinc-800 transition"
                title="Próxima Lâmina"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cartão de Visualização do Slide (Simulador 4:5 Instagram com cores dinâmicas) */}
          <div
            className="p-8 rounded-3xl border min-h-[360px] flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300"
            style={{
              background: `linear-gradient(180deg, ${currentThemeConfig.bgGradient[0]} 0%, ${currentThemeConfig.bgGradient[1]} 100%)`,
              borderColor: currentThemeConfig.cardBorder
            }}
          >
            {/* Top Badge */}
            <div
              className="flex items-center justify-between text-xs font-mono pb-3 border-b"
              style={{ borderColor: `${currentThemeConfig.mutedTextColor}30` }}
            >
              <span
                className="px-2.5 py-1 rounded-md font-bold uppercase tracking-wider text-[11px]"
                style={{
                  backgroundColor: `${currentThemeConfig.accentColor}25`,
                  color: currentThemeConfig.accentSecondary,
                  border: `1px solid ${currentThemeConfig.accentColor}40`
                }}
              >
                {currentSlide.badge}
              </span>
              <span className="font-bold" style={{ color: currentThemeConfig.handleColor }}>
                {customHandle}
              </span>
            </div>

            {/* Slide Body com Edição Inline rápida */}
            <div className="py-6 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Edit3 className="w-3 h-3" /> Título da Lâmina (Clique para editar):
                  </span>
                </div>
                <input
                  type="text"
                  value={currentSlide.headline}
                  onChange={(e) => handleUpdateCurrentSlideHeadline(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-lg sm:text-xl font-extrabold leading-tight focus:outline-none focus:border-amber-400"
                  style={{ color: currentThemeConfig.textColor }}
                />
              </div>

              <div className="space-y-2 text-sm leading-relaxed font-sans">
                {currentSlide.body.map((paragraph, i) => (
                  <p
                    key={i}
                    style={{
                      color: paragraph.startsWith("•") || /^[0-9]\./.test(paragraph)
                        ? currentThemeConfig.textColor
                        : currentThemeConfig.mutedTextColor
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {currentSlide.callout && (
                <div
                  className="p-3.5 rounded-xl text-xs font-mono border"
                  style={{
                    backgroundColor: `${currentThemeConfig.accentColor}15`,
                    borderColor: `${currentThemeConfig.accentColor}40`,
                    color: currentThemeConfig.accentSecondary
                  }}
                >
                  {currentSlide.callout}
                </div>
              )}
            </div>

            {/* Bottom Footer */}
            <div
              className="flex items-center justify-between text-[11px] font-mono pt-3 border-t"
              style={{ borderColor: `${currentThemeConfig.mutedTextColor}30` }}
            >
              <div className="flex items-center gap-3" style={{ color: currentThemeConfig.mutedTextColor }}>
                <span className="flex items-center gap-1">
                  <Bookmark className="w-3.5 h-3.5" /> Salvar Post
                </span>
                <span className="flex items-center gap-1">
                  <Share2 className="w-3.5 h-3.5" /> Compartilhar
                </span>
              </div>
              <span style={{ color: currentThemeConfig.accentSecondary }}>
                Lâmina {currentSlide.slideNumber} de {deck.totalSlides}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyFullDeck}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold flex items-center gap-1.5 transition border border-zinc-700"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Roteiro Copiado!" : "Copiar Texto"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCurrentSlide}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold flex items-center gap-1.5 transition border border-zinc-700"
              title="Baixar a lâmina atual como PNG 1080x1350"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Baixar Slide (PNG)</span>
            </button>

            <button
              type="button"
              disabled={isDownloadingBatch}
              onClick={handleDownloadAllSlides}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1.5 transition disabled:opacity-50"
              title="Baixar todas as 5 lâminas sequencialmente em PNG 1080x1350"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>
                {downloadProgress
                  ? `Baixando ${downloadProgress.current}/${downloadProgress.total}...`
                  : "Baixar Todos (5 PNGs)"}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold transition"
            >
              Fechar
            </button>
            {onApplyToStudio && (
              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <span>Usar no Estúdio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
