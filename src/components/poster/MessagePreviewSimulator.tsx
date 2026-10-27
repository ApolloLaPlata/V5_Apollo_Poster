/**
 * MessagePreviewSimulator.tsx - Simulador Fidedigno de Mensagens VIP (WhatsApp & Telegram)
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Simulação de Alta Fidelidade:
 * - Balão Verde WhatsApp Web/Mobile Dark Mode (bg-[#0b141a], bubble-[#005c4b], rabo de balão, ticks azuis ✓✓)
 * - Balão Azul Telegram Desktop/Mobile Dark Mode (bg-[#0e1621], bubble-[#182533], view count 👁️, inline button)
 * - Renderização nativa de sintaxe:
 *   • WhatsApp: *negrito*, ~tachado~, _itálico_, ```cupom mono```, links e Rich Link Card
 *   • Telegram: <b>negrito</b>, <s>tachado</s>, <code>cupom</code>, links <a> e botões inline
 * - Cópia interativa de cupom em 1 toque diretamente no balão
 * - Contagem e validação de limites de caracteres (1024 legenda / 4096 mensagem)
 */

import React, { useState, useMemo } from "react";
import { 
  MessageCircle, 
  Send, 
  Copy, 
  Check, 
  CheckCheck, 
  Eye, 
  Share2, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Bell, 
  Flame, 
  Sparkles,
  ExternalLink,
  Tag,
  ShieldCheck,
  ShoppingBag
} from "lucide-react";
import { GroupBroadcastDeal } from "@/types/poster";
import { 
  compileWhatsAppMessage, 
  validateWhatsAppMessageLength, 
  WHATSAPP_MAX_CAPTION_CHARS, 
  WHATSAPP_MAX_MESSAGE_CHARS 
} from "@/lib/finders/whatsappFormatter";
import { 
  compileTelegramHtmlMessage, 
  compileTelegramMarkdownMessage, 
  validateTelegramMessageLength, 
  TELEGRAM_MAX_CAPTION_CHARS, 
  TELEGRAM_MAX_MESSAGE_CHARS 
} from "@/lib/finders/telegramFormatter";
import { toast } from "@/lib/toast/useToast";

export interface MessagePreviewSimulatorProps {
  deal: GroupBroadcastDeal;
  initialPlatform?: "whatsapp" | "telegram";
  onClose?: () => void;
}

/**
 * Tokenizador e Renderizador de Texto com Sintaxe Nativa do WhatsApp
 */
export function renderWhatsAppBubbleContent(text: string, onCopyCoupon?: (coupon: string) => void) {
  const lines = text.split("\n");

  return lines.map((line, lineIdx) => {
    if (!line.trim()) {
      return <div key={lineIdx} className="h-2" />;
    }

    // Regex para: ```código```, *negrito*, ~tachado~, _itálico_, link URL
    const regex = /(```([^`]+)```|\*([^*]+)\*|~([^~]+)~|_([^_]+)_|(https?:\/\/[^\s]+))/g;
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > currentIndex) {
        parts.push(line.substring(currentIndex, match.index));
      }

      if (match[2]) {
        // Cupom / Código Monospaçado (```cupom```)
        const couponVal = match[2].trim();
        parts.push(
          <span
            key={`${lineIdx}-${match.index}`}
            onClick={() => onCopyCoupon?.(couponVal)}
            className="inline-flex items-center gap-1 font-mono font-bold bg-[#004639] hover:bg-[#00382d] text-amber-300 px-2 py-0.5 rounded border border-emerald-400/40 cursor-pointer transition select-all shadow-sm"
            title="Clique para copiar o cupom"
          >
            <Tag className="w-3 h-3 text-amber-400" />
            <span>{couponVal}</span>
          </span>
        );
      } else if (match[3]) {
        // Negrito (*texto*)
        parts.push(
          <strong key={`${lineIdx}-${match.index}`} className="font-bold text-white">
            {match[3]}
          </strong>
        );
      } else if (match[4]) {
        // Tachado (~texto~)
        parts.push(
          <del key={`${lineIdx}-${match.index}`} className="line-through text-zinc-300 opacity-80">
            {match[4]}
          </del>
        );
      } else if (match[5]) {
        // Itálico (_texto_)
        parts.push(
          <em key={`${lineIdx}-${match.index}`} className="italic text-emerald-100">
            {match[5]}
          </em>
        );
      } else if (match[6]) {
        // Link URL
        parts.push(
          <a
            key={`${lineIdx}-${match.index}`}
            href={match[6]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#53bdeb] hover:underline break-all font-mono inline-flex items-center gap-0.5"
          >
            <span>{match[6]}</span>
            <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-75 inline" />
          </a>
        );
      }

      currentIndex = match.index + match[0].length;
    }

    if (currentIndex < line.length) {
      parts.push(line.substring(currentIndex));
    }

    return (
      <p key={lineIdx} className="leading-relaxed text-[13px] text-zinc-100 break-words">
        {parts}
      </p>
    );
  });
}

/**
 * Tokenizador e Renderizador de Texto com Tags HTML do Telegram
 */
export function renderTelegramBubbleContent(htmlText: string, onCopyCoupon?: (coupon: string) => void) {
  const lines = htmlText.split("\n");

  return lines.map((line, lineIdx) => {
    if (!line.trim()) {
      return <div key={lineIdx} className="h-2" />;
    }

    // Regex para: <b>bold</b>, <s>strike</s>, <i>italic</i>, <code>code</code>, <a href="...">link</a>
    const regex = /(<b>(.*?)<\/b>|<s>(.*?)<\/s>|<i>(.*?)<\/i>|<code>(.*?)<\/code>|<a href="(.*?)">(.*?)<\/a>)/g;
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > currentIndex) {
        parts.push(line.substring(currentIndex, match.index));
      }

      if (match[2] !== undefined) {
        // <b>bold</b>
        parts.push(
          <strong key={`${lineIdx}-${match.index}`} className="font-bold text-white">
            {match[2]}
          </strong>
        );
      } else if (match[3] !== undefined) {
        // <s>strike</s>
        parts.push(
          <del key={`${lineIdx}-${match.index}`} className="line-through text-zinc-400">
            {match[3]}
          </del>
        );
      } else if (match[4] !== undefined) {
        // <i>italic</i>
        parts.push(
          <em key={`${lineIdx}-${match.index}`} className="italic text-zinc-300">
            {match[4]}
          </em>
        );
      } else if (match[5] !== undefined) {
        // <code>cupom</code>
        const couponVal = match[5].trim();
        parts.push(
          <code
            key={`${lineIdx}-${match.index}`}
            onClick={() => onCopyCoupon?.(couponVal)}
            className="bg-[#243447] hover:bg-[#2c3e53] text-[#64b5f6] font-mono px-2 py-0.5 rounded border border-blue-400/30 cursor-pointer transition select-all text-xs inline-flex items-center gap-1"
            title="Toque no cupom para copiar"
          >
            <Tag className="w-2.5 h-2.5" />
            <span>{couponVal}</span>
          </code>
        );
      } else if (match[6] !== undefined && match[7] !== undefined) {
        // <a href="...">text</a>
        const linkHref = match[6];
        const linkLabel = match[7].replace(/<\/?b>/g, ""); // limpa b interno
        parts.push(
          <a
            key={`${lineIdx}-${match.index}`}
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#64b5f6] hover:underline font-bold inline-flex items-center gap-0.5"
          >
            <span>{linkLabel}</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-80 inline" />
          </a>
        );
      }

      currentIndex = match.index + match[0].length;
    }

    if (currentIndex < line.length) {
      parts.push(line.substring(currentIndex));
    }

    return (
      <p key={lineIdx} className="leading-relaxed text-[13px] text-zinc-200 break-words">
        {parts}
      </p>
    );
  });
}

export function MessagePreviewSimulator({
  deal,
  initialPlatform = "whatsapp",
  onClose
}: MessagePreviewSimulatorProps) {
  const [platform, setPlatform] = useState<"whatsapp" | "telegram">(initialPlatform);
  const [telegramMode, setTelegramMode] = useState<"html" | "markdown">("html");
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Mensagens compiladas com injeção automática dos links rastreados
  const compiledWhatsApp = useMemo(() => {
    return compileWhatsAppMessage(deal);
  }, [deal]);

  const compiledTelegram = useMemo(() => {
    return telegramMode === "html"
      ? compileTelegramHtmlMessage(deal)
      : compileTelegramMarkdownMessage(deal);
  }, [deal, telegramMode]);

  const activeCompiledText = platform === "whatsapp" ? compiledWhatsApp : compiledTelegram;

  // Validação de comprimento de caracteres
  const charStats = useMemo(() => {
    if (platform === "whatsapp") {
      const stats = validateWhatsAppMessageLength(compiledWhatsApp);
      return {
        count: stats.charCount,
        maxCaption: WHATSAPP_MAX_CAPTION_CHARS,
        isValidCaption: stats.isValidForCaption
      };
    } else {
      const stats = validateTelegramMessageLength(compiledTelegram);
      return {
        count: stats.charCount,
        maxCaption: TELEGRAM_MAX_CAPTION_CHARS,
        isValidCaption: stats.isValidForCaption
      };
    }
  }, [platform, compiledWhatsApp, compiledTelegram]);

  // Handler para cópia de cupom ao clicar no balão
  const handleCopyCoupon = (coupon: string) => {
    navigator.clipboard?.writeText(coupon);
    toast.success(`Cupom ${coupon} copiado com sucesso!`);
  };

  // Handler para cópia da mensagem inteira
  const handleCopyFullMessage = () => {
    navigator.clipboard?.writeText(activeCompiledText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
    toast.success(`Mensagem formatada para ${platform.toUpperCase()} copiada!`);
  };

  const targetLink = platform === "whatsapp" 
    ? (deal.trackedWhatsAppUrl || deal.shortUrl || deal.affiliateUrl)
    : (deal.trackedTelegramUrl || deal.shortUrl || deal.affiliateUrl);

  return (
    <div className="space-y-4">
      {/* 1. SELETOR DE PLATAFORMA & CONTROLES */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/90 p-2.5 rounded-2xl border border-zinc-800">
        {/* Toggle WhatsApp vs Telegram */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-950 rounded-xl border border-zinc-800/80">
          <button
            type="button"
            onClick={() => setPlatform("whatsapp")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
              platform === "whatsapp"
                ? "bg-[#005c4b] text-white shadow-md shadow-emerald-950/60"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp (Balão Verde)</span>
          </button>

          <button
            type="button"
            onClick={() => setPlatform("telegram")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
              platform === "telegram"
                ? "bg-[#243447] text-sky-300 border border-sky-500/40 shadow-md shadow-blue-950/60"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Send className="w-4 h-4 text-sky-400" />
            <span>Telegram (Balão Azul)</span>
          </button>
        </div>

        {/* Sub-controles e Telemetria de Caracteres */}
        <div className="flex items-center gap-2">
          {platform === "telegram" && (
            <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => setTelegramMode("html")}
                className={`px-2 py-0.5 rounded ${telegramMode === "html" ? "bg-zinc-800 text-white font-bold" : "text-zinc-400"}`}
              >
                HTML
              </button>
              <button
                type="button"
                onClick={() => setTelegramMode("markdown")}
                className={`px-2 py-0.5 rounded ${telegramMode === "markdown" ? "bg-zinc-800 text-white font-bold" : "text-zinc-400"}`}
              >
                MarkdownV2
              </button>
            </div>
          )}

          <span className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border ${
            charStats.isValidCaption 
              ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30" 
              : "bg-rose-950/40 text-rose-400 border-rose-500/30"
          }`}>
            {charStats.count} / {charStats.maxCaption}c
          </span>

          <button
            type="button"
            onClick={handleCopyFullMessage}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              copiedText 
                ? "bg-emerald-600 text-white" 
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
            }`}
          >
            {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedText ? "Copiado!" : "Copiar Texto"}</span>
          </button>
        </div>
      </div>

      {/* 2. CHAT SIMULATOR VIEWPORT */}
      <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
        {/* ============================================================== */}
        {/* VIEWPORT WHATSAPP DARK MODE (BALÃO VERDE NATIVO)                */}
        {/* ============================================================== */}
        {platform === "whatsapp" && (
          <div className="bg-[#0b141a] min-h-[440px] flex flex-col justify-between relative font-sans">
            {/* Header WhatsApp */}
            <div className="bg-[#202c33] px-4 py-2.5 flex items-center justify-between border-b border-[#222d34] text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow">
                  🛍️
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                    <span>V5 Achadinhos VIP #01</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </h4>
                  <p className="text-[11px] text-zinc-400">Comunidade • 1.024 membros</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-zinc-400">
                <Video className="w-4 h-4 cursor-pointer hover:text-white" />
                <Phone className="w-4 h-4 cursor-pointer hover:text-white" />
                <Search className="w-4 h-4 cursor-pointer hover:text-white" />
                <MoreVertical className="w-4 h-4 cursor-pointer hover:text-white" />
              </div>
            </div>

            {/* Fundo do Chat com o Balão Verde */}
            <div className="p-4 sm:p-6 flex-1 flex flex-col justify-end bg-[#0b141a] bg-opacity-95">
              <div className="max-w-[85%] sm:max-w-[75%] ml-auto relative group">
                {/* O Balão Verde Oficial */}
                <div className="bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-none shadow-md border border-emerald-600/30 space-y-3 relative">
                  {/* Conteúdo com sintaxe nativa renderizada */}
                  <div className="space-y-1">
                    {renderWhatsAppBubbleContent(compiledWhatsApp, handleCopyCoupon)}
                  </div>

                  {/* Preview de Rich Card Open Graph (Link Preview) */}
                  <div className="bg-[#025142] p-2.5 rounded-xl border border-emerald-400/20 flex gap-3 items-center mt-2">
                    <div className="w-16 h-16 rounded-lg bg-emerald-950 flex items-center justify-center text-xl shrink-0 border border-emerald-400/20">
                      🔥
                    </div>
                    <div className="truncate text-xs">
                      <p className="text-[10px] uppercase font-bold text-emerald-300">
                        {deal.store} Oficial • V5 Finders
                      </p>
                      <h5 className="font-bold text-white truncate text-xs">
                        {deal.productName}
                      </h5>
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                        <span>{targetLink}</span>
                      </span>
                    </div>
                  </div>

                  {/* Metadados do Balão: Horário e Tiques Azuis */}
                  <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-200/80 pt-1 font-mono">
                    <span>{deal.scheduledTime || "12:30"}</span>
                    <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Input Bar Falso do WhatsApp */}
            <div className="bg-[#202c33] px-3 py-2 flex items-center gap-3 text-zinc-400 text-xs border-t border-[#222d34]">
              <span className="p-1 rounded-full hover:bg-zinc-700/50 cursor-pointer">😊</span>
              <span className="p-1 rounded-full hover:bg-zinc-700/50 cursor-pointer">📎</span>
              <div className="flex-1 bg-[#2a3942] px-3 py-1.5 rounded-lg text-zinc-400">
                Apenas administradores podem enviar mensagens
              </div>
              <span className="p-1 rounded-full hover:bg-zinc-700/50 cursor-pointer">🎤</span>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEWPORT TELEGRAM DARK MODE (BALÃO AZUL NATIVO)                 */}
        {/* ============================================================== */}
        {platform === "telegram" && (
          <div className="bg-[#0e1621] min-h-[440px] flex flex-col justify-between relative font-sans">
            {/* Header Telegram */}
            <div className="bg-[#17212b] px-4 py-2.5 flex items-center justify-between border-b border-[#242f3d] text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#2b5278] flex items-center justify-center text-white font-bold text-sm shadow">
                  ⚡
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                    <span>Radar Tech & Achadinhos VIP</span>
                    <Flame className="w-3.5 h-3.5 text-sky-400" />
                  </h4>
                  <p className="text-[11px] text-zinc-400 font-mono">@v5finders_tech • 52.500 inscritos</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-zinc-400">
                <Search className="w-4 h-4 cursor-pointer hover:text-white" />
                <Bell className="w-4 h-4 cursor-pointer hover:text-white" />
                <MoreVertical className="w-4 h-4 cursor-pointer hover:text-white" />
              </div>
            </div>

            {/* Fundo do Canal Telegram com Post */}
            <div className="p-4 sm:p-6 flex-1 flex flex-col justify-end bg-[#0e1621]">
              <div className="max-w-[92%] sm:max-w-[85%] mx-auto w-full relative">
                {/* O Balão Azul do Telegram */}
                <div className="bg-[#182533] text-white p-4 rounded-2xl shadow-lg border border-[#243447] space-y-3">
                  {/* Conteúdo com tags HTML ou Markdown */}
                  <div className="space-y-1">
                    {renderTelegramBubbleContent(compiledTelegram, handleCopyCoupon)}
                  </div>

                  {/* Botão Inline Keyboard do Telegram Bot */}
                  <div className="pt-2 border-t border-[#243447]/60">
                    <a
                      href={targetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-[#2b5278]/80 hover:bg-[#2b5278] text-white font-bold text-xs flex items-center justify-center gap-2 transition border border-sky-400/20 shadow-md"
                    >
                      <ShoppingBag className="w-4 h-4 text-sky-300" />
                      <span>Comprar com Desconto Exclusivo</span>
                      <ExternalLink className="w-3 h-3 text-sky-300 ml-1 opacity-80" />
                    </a>
                  </div>

                  {/* Metadados do Telegram: Visualizações, Hora e Share */}
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 font-mono">
                    <span className="flex items-center gap-1 text-zinc-500">
                      <Eye className="w-3.5 h-3.5" />
                      <span>2.4k visualizações</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <span>{deal.scheduledTime || "14:30"}</span>
                      <Share2 className="w-3.5 h-3.5 cursor-pointer hover:text-sky-300 transition" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Barra Inferior Silenciada do Telegram Channel */}
            <div className="bg-[#17212b] px-4 py-2.5 text-center text-zinc-400 text-xs border-t border-[#242f3d] font-mono">
              📢 CANAL OFICIAL BROADCAST • TRANSMISSÃO V5 FINDERS HUB
            </div>
          </div>
        )}
      </div>

      {/* 3. RODAPÉ COM DETALHES DO LINK E AÇÃO RÁPIDA */}
      <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-zinc-400 truncate max-w-full">
          <span className="text-emerald-400 font-bold shrink-0">Link Disparado:</span>
          <span className="text-zinc-200 truncate">{targetLink}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyFullMessage}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow"
          >
            Copiar Mensagem
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
