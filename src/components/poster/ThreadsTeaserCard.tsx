/**
 * ThreadsTeaserCard.tsx - Card de Preview e Seletor de Tons para Threads (Meta)
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Simulação fiel da interface do Threads com:
 * - 4 modelos de tom conversacional (Bastidores, Pergunta Aberta, Hot Take, Mini-História)
 * - 3 modos de CTA (Link na Bio, Link Direto no Post, Link no 1º Comentário)
 * - Indicador oficial de caracteres (limite de 500c)
 * - Botão de cópia rápida e link de abertura direta no Threads Web
 */

import React, { useState, useMemo } from "react";
import { 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  MessageCircle,
  Repeat,
  Heart,
  Send,
  AtSign,
  Link2,
  Bookmark
} from "lucide-react";
import { MultimodalDispatchPayload } from "@/types/poster";
import { 
  generateAllThreadsVariants, 
  generateThreadsVariant,
  ThreadsTeaserVariant, 
  ThreadsToneType,
  ThreadsCtaMode,
  THREADS_TONE_TEMPLATES
} from "@/lib/social/threadsTeaserGenerator";
import { toast } from "@/lib/toast/useToast";

export interface ThreadsTeaserCardProps {
  payload: MultimodalDispatchPayload;
  onSelectVariant?: (variant: ThreadsTeaserVariant) => void;
}

export function ThreadsTeaserCard({ payload, onSelectVariant }: ThreadsTeaserCardProps) {
  const [selectedTone, setSelectedTone] = useState<ThreadsToneType>("build_in_public");
  const [ctaMode, setCtaMode] = useState<ThreadsCtaMode>("direct_link");
  const [copied, setCopied] = useState(false);

  // Gera a variante ativa baseada no tom e modo de CTA
  const activeTemplate = useMemo(() => {
    return THREADS_TONE_TEMPLATES.find(t => t.type === selectedTone) || THREADS_TONE_TEMPLATES[0];
  }, [selectedTone]);

  const activeVariant = useMemo(() => {
    return generateThreadsVariant(payload, activeTemplate, ctaMode);
  }, [payload, activeTemplate, ctaMode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeVariant.text);
    setCopied(true);
    toast.success(`Post do Threads copiado com sucesso (${activeVariant.charCount}/500c)!`);
    setTimeout(() => setCopied(false), 2000);
    if (onSelectVariant) {
      onSelectVariant(activeVariant);
    }
  };

  const threadsIntentUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(activeVariant.text)}`;
  const remaining = 500 - activeVariant.charCount;
  const isSafe = activeVariant.isWithinLimit;

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* 1. SELETOR DE TOM CONVERSACIONAL & MODO DE CTA */}
      <div className="space-y-3 border-b border-zinc-800/80 pb-4">
        {/* Tom Conversacional */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Tom Conversacional para o Threads (Etapa 053):</span>
            </div>
            <span className="text-zinc-500 text-[11px]">Meta Threads Engine</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {THREADS_TONE_TEMPLATES.map(t => (
              <button
                key={t.type}
                type="button"
                onClick={() => setSelectedTone(t.type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition border ${
                  selectedTone === t.type
                    ? "bg-amber-500 text-black font-bold border-amber-400 shadow-sm"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700"
                }`}
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Modo de CTA */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-mono text-zinc-500">Modo de Chamada (CTA):</span>
          <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-xs font-mono">
            <button
              type="button"
              onClick={() => setCtaMode("direct_link")}
              className={`px-2.5 py-1 rounded transition text-[11px] ${
                ctaMode === "direct_link" ? "bg-zinc-800 text-white font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              👉 Link Direto
            </button>
            <button
              type="button"
              onClick={() => setCtaMode("bio")}
              className={`px-2.5 py-1 rounded transition text-[11px] ${
                ctaMode === "bio" ? "bg-zinc-800 text-white font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              🔗 Link na Bio
            </button>
            <button
              type="button"
              onClick={() => setCtaMode("first_comment")}
              className={`px-2.5 py-1 rounded transition text-[11px] ${
                ctaMode === "first_comment" ? "bg-zinc-800 text-white font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              👇 1º Comentário
            </button>
          </div>
        </div>
      </div>

      {/* 2. SIMULAÇÃO DO POST NO THREADS (META) */}
      <div className="bg-black border border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-3 font-sans">
        {/* Topo do Usuário */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-white text-sm shrink-0">
              <AtSign className="w-5 h-5 text-zinc-300" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-sm hover:underline cursor-pointer">
                  {payload.blogOptions.author || "Apollo La Plata"}
                </span>
                <span className="text-zinc-500 text-xs">@v5apollo</span>
                <span className="text-zinc-600 text-xs">·</span>
                <span className="text-zinc-500 text-xs">2m</span>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">
                Holding V5 Apollo • Threads
              </span>
            </div>
          </div>

          <div className="text-zinc-500 hover:text-white cursor-pointer font-bold text-sm px-2">
            ···
          </div>
        </div>

        {/* Texto do Post */}
        <div className="text-zinc-100 text-sm leading-relaxed whitespace-pre-wrap pl-0 sm:pl-13">
          {activeVariant.text}
        </div>

        {/* Card de Link (quando em modo direct_link e houver imagem) */}
        {ctaMode === "direct_link" && payload.coverImageUrl && (
          <div className="pl-0 sm:pl-13 pt-1">
            <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/60 p-3 flex items-center gap-3 hover:bg-zinc-900 transition cursor-pointer">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-950 shrink-0">
                <img
                  src={payload.coverImageUrl}
                  alt={payload.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <span className="text-[10px] text-zinc-500 font-mono uppercase block">
                  v5autoblog.com
                </span>
                <h4 className="text-xs font-bold text-white truncate">
                  {payload.title}
                </h4>
                <p className="text-[11px] text-zinc-400 line-clamp-1">
                  {payload.summary || payload.emailOptions.previewText}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Barra de Ações do Threads */}
        <div className="pl-0 sm:pl-13 pt-2 flex items-center gap-4 text-zinc-400 text-xs">
          <div className="hover:text-rose-500 cursor-pointer transition flex items-center gap-1">
            <Heart className="w-4 h-4" />
          </div>
          <div className="hover:text-zinc-200 cursor-pointer transition flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div className="hover:text-emerald-500 cursor-pointer transition flex items-center gap-1">
            <Repeat className="w-4 h-4" />
          </div>
          <div className="hover:text-zinc-200 cursor-pointer transition flex items-center gap-1">
            <Send className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. BARRA DE CONTROLE & STATUS DE CARACTERES */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-mono">
        {/* Contadores */}
        <div className="flex items-center gap-3">
          <div className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 ${
            isSafe
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
          }`}>
            {isSafe ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            <span>{activeVariant.charCount}/500 caracteres (Threads)</span>
          </div>
          <span className="text-zinc-500 text-[11px]">
            Restam {remaining}c • 1 Tag Oficial
          </span>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-mono flex items-center gap-1.5 transition text-xs border border-zinc-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copiado!" : "Copiar Post"}</span>
          </button>
          <a
            href={threadsIntentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-bold font-mono flex items-center gap-1.5 transition text-xs shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Abrir no Threads</span>
          </a>
        </div>
      </div>
    </div>
  );
}
