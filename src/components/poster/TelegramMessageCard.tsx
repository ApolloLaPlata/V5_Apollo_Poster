/**
 * TelegramMessageCard.tsx - Card de Visualização e Despacho de Mensagens para Telegram
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Simulação fiel da interface do Telegram Desktop / Web com:
 * - Renderização em tempo real de Markdown rico (*negrito*, _itálico_, `código`, [link](url))
 * - Efeito de spoiler visual ||texto|| interativo
 * - Botão inline interativo simulado (InlineKeyboardMarkup do Telegram Bot API)
 * - 3 formatos estratégicos: Broadcast Digest, Alerta VIP e Deep Dive Técnico
 * - Seletor de canal e modo de link (embutido ou com URL direta)
 * - Indicadores duplos de limite: 4.096 caracteres (mensagem de texto) e 1.024 caracteres (legenda de mídia)
 * - Botão de cópia rápida e despacho nativo via t.me/share
 */

import React, { useState, useMemo } from "react";
import { 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  ShieldCheck,
  Sparkles,
  Layers,
  Code2,
  Bookmark,
  Share2,
  Radio,
  Sliders,
  ChevronRight,
  Globe
} from "lucide-react";
import { MultimodalDispatchPayload } from "@/types/poster";
import { 
  generateTelegramMessageVariant, 
  TelegramMessageFormat, 
  TelegramChannelType, 
  TelegramLinkMode,
  TELEGRAM_FORMAT_TEMPLATES, 
  TELEGRAM_CHANNEL_CONFIGS 
} from "@/lib/social/telegramMessageGenerator";
import { toast } from "@/lib/toast/useToast";

export interface TelegramMessageCardProps {
  payload: MultimodalDispatchPayload;
}

/**
 * Renderizador de Markdown interativo do Telegram
 */
function renderTelegramRichText(text: string) {
  const lines = text.split("\n");

  return lines.map((line, lineIdx) => {
    if (!line.trim()) {
      return <div key={lineIdx} className="h-2" />;
    }

    // Processa markdown: links [anchor](url), *bold*, _italic_, `code`, ||spoiler||
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;

    // Regex para capturar elementos de Markdown do Telegram
    const regex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*([^*]+)\*|_([^_]+)_|`([^`]+)`|\|\|([^|]+)\|\||(https?:\/\/[^\s]+))/g;
    let match;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > currentIndex) {
        parts.push(line.substring(currentIndex, match.index));
      }

      if (match[2] && match[3]) {
        // Link Embutido [Texto](URL)
        parts.push(
          <a
            key={`${lineIdx}-${match.index}`}
            href={match[3]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 underline underline-offset-2 font-medium inline-flex items-center gap-0.5"
          >
            <span>{match[2]}</span>
            <ExternalLink className="w-3 h-3 ml-0.5 inline opacity-80" />
          </a>
        );
      } else if (match[4]) {
        // Negrito (*texto*)
        parts.push(
          <strong key={`${lineIdx}-${match.index}`} className="font-bold text-zinc-100">
            {match[4]}
          </strong>
        );
      } else if (match[5]) {
        // Itálico (_texto_)
        parts.push(
          <em key={`${lineIdx}-${match.index}`} className="italic text-zinc-300">
            {match[5]}
          </em>
        );
      } else if (match[6]) {
        // Código Inline (`código`)
        parts.push(
          <code
            key={`${lineIdx}-${match.index}`}
            className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700/60 text-sky-300 font-mono text-[12px]"
          >
            {match[6]}
          </code>
        );
      } else if (match[7]) {
        // Spoiler (||texto||)
        parts.push(
          <span
            key={`${lineIdx}-${match.index}`}
            className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 hover:text-amber-300 border border-zinc-700 select-all cursor-pointer text-[12px] font-mono transition-colors"
            title="Spoiler: clique para ver"
          >
            🔒 {match[7]}
          </span>
        );
      } else if (match[8]) {
        // URL direta
        parts.push(
          <span key={`${lineIdx}-${match.index}`} className="text-sky-400 hover:underline break-all font-mono text-[12.5px]">
            {match[8]}
          </span>
        );
      }

      currentIndex = match.index + match[0].length;
    }

    if (currentIndex < line.length) {
      parts.push(line.substring(currentIndex));
    }

    return (
      <p key={lineIdx} className="leading-relaxed text-[13.5px] text-zinc-200">
        {parts}
      </p>
    );
  });
}

export function TelegramMessageCard({ payload }: TelegramMessageCardProps) {
  const [selectedFormat, setSelectedFormat] = useState<TelegramMessageFormat>("broadcast_digest");
  const [selectedChannel, setSelectedChannel] = useState<TelegramChannelType>("public_channel");
  const [linkMode, setLinkMode] = useState<TelegramLinkMode>("embedded_anchor");
  const [includeBullets, setIncludeBullets] = useState<boolean>(true);
  const [includeHashtags, setIncludeHashtags] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Geração da mensagem
  const messageResult = useMemo(() => {
    return generateTelegramMessageVariant(payload, {
      format: selectedFormat,
      channelType: selectedChannel,
      linkMode,
      includeBullets,
      includeHashtags
    });
  }, [payload, selectedFormat, selectedChannel, linkMode, includeBullets, includeHashtags]);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(messageResult.text);
    setCopied(true);
    toast.success(`Mensagem Markdown do Telegram copiada (${messageResult.charCount} caracteres)!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenTelegram = () => {
    window.open(messageResult.encodedShareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* 1. SELETORES DE FORMATO E CANAL */}
      <div className="space-y-3 border-b border-zinc-800/80 pb-4">
        {/* Formato Estratégico */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
              <Send className="w-4 h-4 text-sky-400" />
              <span>Formato de Mensagem Telegram (Etapa 056):</span>
            </div>
            <span className="text-zinc-500 text-[11px]">Markdown Rico & Links Embutidos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(Object.keys(TELEGRAM_FORMAT_TEMPLATES) as TelegramMessageFormat[]).map((fmtKey) => {
              const tmpl = TELEGRAM_FORMAT_TEMPLATES[fmtKey];
              const isSelected = selectedFormat === fmtKey;
              return (
                <button
                  key={fmtKey}
                  type="button"
                  onClick={() => setSelectedFormat(fmtKey)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left ${
                    isSelected
                      ? "bg-sky-950/60 border-sky-500/70 text-sky-300 shadow-sm shadow-sky-950"
                      : "bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  }`}
                >
                  <span className="text-base">{tmpl.emoji}</span>
                  <div className="flex flex-col">
                    <span className="font-semibold">{tmpl.label}</span>
                    <span className="text-[10px] text-zinc-500">{tmpl.badge}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Destino do Canal & Modo de Link */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-400">Canal Destino:</span>
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
              {(Object.keys(TELEGRAM_CHANNEL_CONFIGS) as TelegramChannelType[]).map((chKey) => {
                const ch = TELEGRAM_CHANNEL_CONFIGS[chKey];
                const isSelected = selectedChannel === chKey;
                return (
                  <button
                    key={chKey}
                    type="button"
                    onClick={() => setSelectedChannel(chKey)}
                    className={`px-2 py-1 rounded text-[11px] transition-colors ${
                      isSelected
                        ? "bg-sky-600 text-white font-medium"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {ch.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-zinc-400">Modo Link:</span>
              <select
                value={linkMode}
                onChange={(e) => setLinkMode(e.target.value as TelegramLinkMode)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-zinc-200 focus:outline-none focus:border-sky-500"
              >
                <option value="embedded_anchor">Hiperlink Embutido [Texto](url)</option>
                <option value="inline_button">Apenas Botão do Bot</option>
                <option value="both">Ambos (Embutido + URL Limpa)</option>
              </select>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-zinc-400 hover:text-zinc-200 select-none">
              <input
                type="checkbox"
                checked={includeBullets}
                onChange={(e) => setIncludeBullets(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-sky-500 focus:ring-sky-500 focus:ring-offset-0"
              />
              <span>Bullets</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-zinc-400 hover:text-zinc-200 select-none">
              <input
                type="checkbox"
                checked={includeHashtags}
                onChange={(e) => setIncludeHashtags(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-sky-500 focus:ring-sky-500 focus:ring-offset-0"
              />
              <span>Hashtags</span>
            </label>
          </div>
        </div>
      </div>

      {/* 2. SIMULADOR VISUAL DO CANAL DO TELEGRAM */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-sky-400" />
            Visualização no Canal (Formatação Rica Markdown):
          </span>
          <span className="text-[11px] text-zinc-500 font-mono">
            {messageResult.channelHandle}
          </span>
        </div>

        {/* Moldura do Telegram */}
        <div className="bg-[#0f141c] border border-[#202c3a] rounded-2xl p-4 shadow-inner relative overflow-hidden">
          {/* Header do Canal Oficial */}
          <div className="flex items-center justify-between border-b border-[#202c3a] pb-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white font-bold text-xs shadow">
                <Send className="w-4 h-4 text-white -rotate-12 translate-x-0.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-zinc-100">
                    V5 Apollo Holding 📡
                  </span>
                  <div className="w-3.5 h-3.5 rounded-full bg-sky-500 flex items-center justify-center text-[9px] text-white font-bold">
                    ✓
                  </div>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {messageResult.channelHandle} • 2.480 inscritos
                </span>
              </div>
            </div>

            <div className="text-[11px] text-zinc-400 font-mono flex items-center gap-1.5 bg-[#17212b] px-2.5 py-1 rounded-full border border-zinc-800">
              <Globe className="w-3 h-3 text-sky-400" />
              <span>Canal Público</span>
            </div>
          </div>

          {/* Balão do Post do Canal (Telegram Dark Post Card) */}
          <div className="bg-[#182533] border border-[#243343] rounded-2xl p-4 shadow-md space-y-3">
            {/* Texto Formatado com Hiperlinks e Efeitos */}
            <div className="space-y-1">
              {renderTelegramRichText(messageResult.text)}
            </div>

            {/* Botão Inline do Telegram Bot API (InlineKeyboardMarkup) */}
            {(linkMode === "inline_button" || linkMode === "both") && (
              <div className="pt-2 border-t border-[#243343]/60">
                <a
                  href={messageResult.utmUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#24A1DE]/15 hover:bg-[#24A1DE]/25 border border-[#24A1DE]/40 text-[#24A1DE] font-semibold text-xs transition-colors shadow-sm"
                >
                  <span>{messageResult.inlineButton.text}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Rodapé de Estatísticas do Canal */}
            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 font-mono border-t border-[#243343]/40">
              <div className="flex items-center gap-1 text-zinc-500">
                <Eye className="w-3.5 h-3.5 text-zinc-400" />
                <span>1.4K visualizações</span>
              </div>
              <span className="text-zinc-500">12:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TELEMETRIA E CONTADORES DE CARACTERES */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-4 py-2.5 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
          <span className="text-zinc-300">
            Contagem: <strong className="text-white font-bold">{messageResult.charCount}</strong> / {messageResult.charLimit}c
          </span>
          {messageResult.isWithinMediaLimit ? (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
              ✓ Compatível com Foto/Vídeo (≤ 1.024c)
            </span>
          ) : (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40">
              ℹ️ Apenas Texto Puro (&gt; 1.024c)
            </span>
          )}
          {messageResult.isSweetSpot && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-950/80 text-sky-300 border border-sky-500/40">
              ⚡ Sweet Spot do Canal (300-1.200c)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
          <span>Hiperlink: <code className="text-sky-400">[Texto](url)</code></span>
          <span>•</span>
          <span>Spoiler: <code className="text-amber-400">||alerta||</code></span>
        </div>
      </div>

      {/* 4. BOTÕES DE AÇÃO: COPIAR E ABRIR NO TELEGRAM */}
      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={handleOpenTelegram}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 text-xs font-medium transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
          <span>Compartilhar via Telegram (t.me)</span>
        </button>

        <button
          type="button"
          onClick={handleCopyMarkdown}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all shadow-lg shadow-sky-950/40 active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Markdown Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar Markdown Formatado</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
