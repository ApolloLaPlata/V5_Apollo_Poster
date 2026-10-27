/**
 * TwitterTeaserCard.tsx - Card de Preview e Seletor de Variantes para X/Twitter
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Simulação fiel da interface do X/Twitter com:
 * - 5 modelos de ganchos virais pré-calibrados
 * - Indicador de caracteres oficial do X com consideração de t.co (23 chars para links)
 * - Card de pré-visualização de imagem summary_large_image
 * - Botão de cópia rápida e link direto de envio (Web Intent)
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
  Repeat2,
  Heart,
  Bookmark,
  Share,
  Flame,
  Zap
} from "lucide-react";
import { MultimodalDispatchPayload } from "@/types/poster";
import { 
  generateAllTwitterVariants, 
  TwitterTeaserVariant, 
  TwitterHookType 
} from "@/lib/social/twitterTeaserGenerator";
import { toast } from "@/lib/toast/useToast";

export interface TwitterTeaserCardProps {
  payload: MultimodalDispatchPayload;
  onSelectVariant?: (variant: TwitterTeaserVariant) => void;
}

export function TwitterTeaserCard({ payload, onSelectVariant }: TwitterTeaserCardProps) {
  const [selectedHook, setSelectedHook] = useState<TwitterHookType>("direct_announcement");
  const [copied, setCopied] = useState(false);

  // Gera as 5 variantes
  const variants = useMemo(() => {
    return generateAllTwitterVariants(payload);
  }, [payload]);

  // Variante ativa selecionada
  const activeVariant = useMemo(() => {
    return variants.find(v => v.hookType === selectedHook) || variants[0];
  }, [variants, selectedHook]);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeVariant.text);
    setCopied(true);
    toast.success(`Tweet copiado com sucesso (${activeVariant.twitterWeightedCount}/280c)!`);
    setTimeout(() => setCopied(false), 2000);
    if (onSelectVariant) {
      onSelectVariant(activeVariant);
    }
  };

  const tweetIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(activeVariant.text)}`;

  const remaining = 280 - activeVariant.twitterWeightedCount;
  const isSafe = activeVariant.isWithinLimit;

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* 1. SELETOR DE GANCHOS (HOOKS) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Modelos de Ganchos Virais para o X (Etapa 052):</span>
          </div>
          <span className="text-zinc-500 text-[11px]">5 Variações Geradas</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {variants.map(v => (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelectedHook(v.hookType)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition border ${
                selectedHook === v.hookType
                  ? "bg-amber-500 text-black font-bold border-amber-400 shadow-sm"
                  : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700"
              }`}
            >
              <span>{v.emoji}</span>
              <span>{v.hookLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. SIMULAÇÃO DO POST NO X / TWITTER */}
      <div className="bg-black border border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-3 font-sans">
        {/* Cabeçalho do Usuário */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-300 text-sm shrink-0">
              AP
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-sm hover:underline cursor-pointer">
                  {payload.blogOptions.author || "Apollo La Plata"}
                </span>
                <span className="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
                <span className="text-zinc-500 text-xs">@v5apollo</span>
                <span className="text-zinc-600 text-xs">·</span>
                <span className="text-zinc-500 text-xs">Agora</span>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">
                Capitania #13 • Central Onicanal
              </span>
            </div>
          </div>

          {/* Logo do X */}
          <div className="text-zinc-500 hover:text-white cursor-pointer font-bold text-base px-2">
            𝕏
          </div>
        </div>

        {/* Texto do Tweet */}
        <div className="text-zinc-100 text-sm leading-relaxed whitespace-pre-wrap pl-0 sm:pl-13">
          {activeVariant.text}
        </div>

        {/* Card de Mídia do Link (summary_large_image) */}
        {payload.coverImageUrl && (
          <div className="pl-0 sm:pl-13 pt-1">
            <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 transition cursor-pointer group">
              <div className="h-44 sm:h-52 w-full overflow-hidden bg-zinc-950">
                <img
                  src={payload.coverImageUrl}
                  alt={payload.coverImageAlt || payload.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                />
              </div>
              <div className="p-3 border-t border-zinc-800/80 space-y-1">
                <span className="text-[11px] text-zinc-500 font-mono uppercase block">
                  v5autoblog.com
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-sky-400 transition leading-snug line-clamp-1">
                  {payload.title}
                </h4>
                <p className="text-xs text-zinc-400 line-clamp-1">
                  {payload.summary || payload.emailOptions.previewText}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Barra de Engajamento Fictícia */}
        <div className="pl-0 sm:pl-13 pt-2 flex items-center justify-between text-zinc-500 text-xs border-t border-zinc-900">
          <div className="flex items-center gap-1.5 hover:text-sky-400 cursor-pointer transition">
            <MessageCircle className="w-4 h-4" />
            <span>24</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-emerald-400 cursor-pointer transition">
            <Repeat2 className="w-4 h-4" />
            <span>18</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-rose-400 cursor-pointer transition">
            <Heart className="w-4 h-4" />
            <span>142</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-amber-400 cursor-pointer transition">
            <Bookmark className="w-4 h-4" />
            <span>56</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-zinc-300 cursor-pointer transition">
            <Share className="w-4 h-4" />
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
            <span>{activeVariant.twitterWeightedCount}/280 caracteres (X Weight)</span>
          </div>
          <span className="text-zinc-500 text-[11px]">
            Restam {remaining}c • URL t.co (23c)
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
            <span>{copied ? "Copiado!" : "Copiar Tweet"}</span>
          </button>
          <a
            href={tweetIntentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-bold font-mono flex items-center gap-1.5 transition text-xs shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Abrir no 𝕏</span>
          </a>
        </div>
      </div>
    </div>
  );
}
