/**
 * InstagramCaptionCard.tsx - Card de Preview e Seletor de Legendas para Instagram
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Simulação fiel do feed do Instagram com:
 * - 3 formatos editoriais (Carrossel Educativo, Reels Viral, Estudo de Caso)
 * - Seletor dinâmico de palavra-chave para o Comment-to-DM (LINK, QUERO, GUIA, etc.)
 * - Cluster de hashtags dividido por Nicho, Indústria e Marca
 * - Parágrafos espaçados com separador anti-colapso
 * - Botões de cópia rápida da legenda ou apenas das hashtags
 */

import React, { useState, useMemo } from "react";
import { 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Hash,
  Layers,
  Flame,
  Zap,
  Tag
} from "lucide-react";
import { MultimodalDispatchPayload } from "@/types/poster";
import { 
  generateInstagramCaptionFormatted, 
  InstagramPostFormat, 
  COMMENT_KEYWORDS, 
  INSTAGRAM_FORMAT_TEMPLATES 
} from "@/lib/social/instagramCaptionGenerator";
import { toast } from "@/lib/toast/useToast";

export interface InstagramCaptionCardProps {
  payload: MultimodalDispatchPayload;
}

export function InstagramCaptionCard({ payload }: InstagramCaptionCardProps) {
  const [selectedFormat, setSelectedFormat] = useState<InstagramPostFormat>("carousel");
  const [keyword, setKeyword] = useState<string>("LINK");
  const [copiedType, setCopiedType] = useState<"caption" | "tags" | null>(null);
  const [hashtagMode, setHashtagMode] = useState<"cluster15" | "surgical5">("surgical5");
  const [humanizeAntiAi, setHumanizeAntiAi] = useState<boolean>(true);

  const captionResult = useMemo(() => {
    return generateInstagramCaptionFormatted(payload, selectedFormat, keyword, {
      hashtagMode,
      humanizeAntiAi
    });
  }, [payload, selectedFormat, keyword, hashtagMode, humanizeAntiAi]);

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(captionResult.captionText);
    setCopiedType("caption");
    toast.success(`Legenda do Instagram copiada (${captionResult.charCount}/2.200c)!`);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyHashtagsOnly = () => {
    navigator.clipboard.writeText(captionResult.hashtagCluster.formattedString);
    setCopiedType("tags");
    toast.success(`Cluster de ${captionResult.hashtagCluster.count} hashtags copiado!`);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const isSweetSpot = captionResult.charCount >= 500 && captionResult.charCount <= 1400;

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* 1. SELETORES: FORMATO EDITORIAL & PALAVRA-CHAVE COMMENT-TO-DM */}
      <div className="space-y-3 border-b border-zinc-800/80 pb-4">
        {/* Formato Editorial */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Formato Editorial Instagram (Etapa 054):</span>
            </div>
            <span className="text-zinc-500 text-[11px]">Feed & Reels Engine</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {INSTAGRAM_FORMAT_TEMPLATES.map(t => (
              <button
                key={t.format}
                type="button"
                onClick={() => setSelectedFormat(t.format)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition border ${
                  selectedFormat === t.format
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

        {/* Palavra-Chave Comment-to-DM (ChatbotX Inspired) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-mono text-zinc-400">Gatilho Comment-to-DM:</span>
          <div className="flex flex-wrap items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs font-mono">
            {COMMENT_KEYWORDS.map(k => (
              <button
                key={k}
                type="button"
                onClick={() => setKeyword(k)}
                className={`px-2 py-0.5 rounded transition text-[11px] font-bold ${
                  keyword === k 
                    ? "bg-pink-500 text-white shadow-sm" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                "{k}"
              </button>
            ))}
          </div>
        </div>

        {/* Modos de Otimização Anti-IA e Hashtags Cirúrgicas */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-900 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-zinc-400">Hashtags:</span>
            <button
              type="button"
              onClick={() => setHashtagMode("surgical5")}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition border ${
                hashtagMode === "surgical5"
                  ? "bg-amber-500 text-black border-amber-400"
                  : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
              }`}
            >
              #️⃣ 5 Cirúrgicas (Top Retenção)
            </button>
            <button
              type="button"
              onClick={() => setHashtagMode("cluster15")}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition border ${
                hashtagMode === "cluster15"
                  ? "bg-amber-500 text-black border-amber-400"
                  : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
              }`}
            >
              #️⃣ 15 Amplo
            </button>
          </div>

          <button
            type="button"
            onClick={() => setHumanizeAntiAi(!humanizeAntiAi)}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition border flex items-center gap-1 ${
              humanizeAntiAi
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : "bg-zinc-900 text-zinc-500 border-zinc-800"
            }`}
          >
            <span>🧹 Filtro Anti-IA:</span>
            <span>{humanizeAntiAi ? "Ativo" : "Desligado"}</span>
          </button>
        </div>
      </div>

      {/* 2. SIMULAÇÃO DO POST NO FEED DO INSTAGRAM */}
      <div className="bg-black border border-zinc-800/80 rounded-2xl overflow-hidden font-sans">
        {/* Header do Perfil com Gradiente de Stories */}
        <div className="p-3.5 flex items-center justify-between border-b border-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center font-bold text-xs text-white border-2 border-black">
                V5
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-bold text-white text-xs hover:underline cursor-pointer">
                  v5apollo
                </span>
                <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-bold">
                  ✓
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">
                Capitania #13 • V5 Apollo Poster
              </span>
            </div>
          </div>

          <div className="text-zinc-500 text-sm font-bold px-2 cursor-pointer">
            ···
          </div>
        </div>

        {/* Imagem de Capa do Post */}
        {payload.coverImageUrl && (
          <div className="w-full max-h-80 bg-zinc-950 overflow-hidden relative">
            <img
              src={payload.coverImageUrl}
              alt={payload.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-mono text-white">
              1/5
            </div>
          </div>
        )}

        {/* Barra de Interações do Instagram */}
        <div className="p-3 border-t border-zinc-900 flex items-center justify-between text-zinc-300">
          <div className="flex items-center gap-4">
            <Heart className="w-5 h-5 hover:text-rose-500 cursor-pointer transition" />
            <MessageCircle className="w-5 h-5 hover:text-zinc-100 cursor-pointer transition" />
            <Send className="w-5 h-5 hover:text-zinc-100 cursor-pointer transition" />
          </div>
          <Bookmark className="w-5 h-5 hover:text-zinc-100 cursor-pointer transition" />
        </div>

        {/* Texto da Legenda com Quebras de Linha e Ponto Separador */}
        <div className="px-3.5 pb-4 space-y-2 text-xs text-zinc-200">
          <div className="font-bold text-white text-xs">
            v5apollo • <span className="font-normal text-zinc-400">Publicado</span>
          </div>
          <div className="whitespace-pre-wrap leading-relaxed text-zinc-300 font-sans text-xs bg-zinc-950/40 p-3 rounded-xl border border-zinc-900">
            {captionResult.captionText}
          </div>
        </div>
      </div>

      {/* 3. BARRA DE CONTROLE & STATUS */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 ${
            isSweetSpot
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{captionResult.charCount}/2.200c ({isSweetSpot ? "Sweet Spot" : "Válido"})</span>
          </div>
          <span className="text-zinc-500 text-[11px]">
            {captionResult.hashtagCluster.count}/30 hashtags
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyHashtagsOnly}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono flex items-center gap-1.5 transition text-xs border border-zinc-700"
            title="Copiar apenas a lista de hashtags"
          >
            {copiedType === "tags" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Hash className="w-3.5 h-3.5" />}
            <span>{copiedType === "tags" ? "Copiadas!" : "Copiar Hashtags"}</span>
          </button>
          <button
            type="button"
            onClick={handleCopyCaption}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-black font-bold font-mono flex items-center gap-1.5 transition text-xs shadow-sm"
          >
            {copiedType === "caption" ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5 text-black" />}
            <span>{copiedType === "caption" ? "Legenda Copiada!" : "Copiar Legenda"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
