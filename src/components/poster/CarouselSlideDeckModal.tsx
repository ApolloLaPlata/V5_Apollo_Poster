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
  Share2
} from "lucide-react";
import { 
  generateCarouselSlideDeck, 
  CarouselDeck, 
  CarouselSlide 
} from "@/lib/social/carouselDeckGenerator";
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

  const deck = useMemo(() => {
    return generateCarouselSlideDeck(topicTitle, keyword);
  }, [topicTitle, keyword]);

  const currentSlide = deck.slides[currentSlideIndex] || deck.slides[0];

  const handleCopyFullDeck = () => {
    const fullText = deck.slides.map(s => (
      `=== ${s.badge} ===\n${s.headline}\n\n${s.body.join("\n")}${s.callout ? `\n\n${s.callout}` : ""}`
    )).join("\n\n-------------------------\n\n");

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success("Roteiro Completo de 5 Slides Copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (onApplyToStudio) {
      const summaryCopy = `🎠 CARROSSEL EDUCATIVO: ${deck.topic}\n\n` +
        `Arrasta para o lado para conferir os 5 passos:\n\n` +
        deck.slides.map(s => `📍 Slide ${s.slideNumber}: ${s.headline}`).join("\n") +
        `\n\n💬 Comente "${keyword}" para receber o playbook detalhado no seu Direct!\n\n` +
        deck.hashtags.join(" ");

      onApplyToStudio(summaryCopy, deck.slides[0].headline);
      toast.success("Roteiro do Carrossel aplicado no Estúdio!");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
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
                  Pilar 2 · 5 Lâminas
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Estrutura de alta retenção visual: gancho magnético, problema, framework, tutorial e CTA.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
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
                onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 border border-zinc-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>{currentSlideIndex + 1} / {deck.totalSlides}</span>
              <button
                type="button"
                disabled={currentSlideIndex === deck.totalSlides - 1}
                onClick={() => setCurrentSlideIndex(prev => Math.min(deck.totalSlides - 1, prev + 1))}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 border border-zinc-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cartão de Visualização do Slide (Simulador 4:5 Instagram) */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-black border border-zinc-800 min-h-[340px] flex flex-col justify-between shadow-inner relative overflow-hidden">
            {/* Top Badge */}
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-zinc-800/80 pb-3">
              <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                {currentSlide.badge}
              </span>
              <span>@v5apollo</span>
            </div>

            {/* Slide Body */}
            <div className="py-6 space-y-4">
              <h2 className="text-xl font-extrabold text-white leading-tight">
                {currentSlide.headline}
              </h2>

              <div className="space-y-2 text-sm text-zinc-300 leading-relaxed font-sans">
                {currentSlide.body.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              {currentSlide.callout && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-300">
                  {currentSlide.callout}
                </div>
              )}
            </div>

            {/* Bottom Footer */}
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-3 border-t border-zinc-800/80">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-zinc-400">
                  <Bookmark className="w-3.5 h-3.5" /> Salvar Post
                </span>
                <span className="flex items-center gap-1 text-zinc-400">
                  <Share2 className="w-3.5 h-3.5" /> Compartilhar
                </span>
              </div>
              <span>Lâmina {currentSlide.slideNumber} de {deck.totalSlides}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <button
            type="button"
            onClick={handleCopyFullDeck}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold flex items-center gap-1.5 transition border border-zinc-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Roteiro Copiado!" : "Copiar 5 Slides"}</span>
          </button>

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
