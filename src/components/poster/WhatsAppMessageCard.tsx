/**
 * WhatsAppMessageCard.tsx - Card de Visualização e Despacho de Mensagens para WhatsApp
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Simulação fiel da interface do WhatsApp Web / Mobile com:
 * - Renderização em tempo real de negritos nativos (*texto* -> <strong>)
 * - 3 formatos estratégicos: Alerta Rápido, Resumo Executivo e Comunidade VIP
 * - Seletor de destino de canal (Grupo, Comunidade VIP, Canal Oficial)
 * - Toggles para incluir/remover destaques (bullets) e rodapé
 * - Contador de caracteres com indicador de Sweet Spot (250 a 650 caracteres)
 * - Botão de cópia rápida e link de abertura direta no WhatsApp Web (wa.me)
 */

import React, { useState, useMemo } from "react";
import { 
  MessageSquare, 
  Copy, 
  Check, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Users,
  ShieldCheck,
  Zap,
  Radio,
  Share2,
  Sparkles,
  Layers,
  ChevronRight
} from "lucide-react";
import { MultimodalDispatchPayload } from "@/types/poster";
import { 
  generateWhatsAppMessageVariant, 
  WhatsAppMessageFormat, 
  WhatsAppDestinationType, 
  WHATSAPP_FORMAT_TEMPLATES, 
  WHATSAPP_DESTINATION_CONFIGS 
} from "@/lib/social/whatsappMessageGenerator";
import { toast } from "@/lib/toast/useToast";

export interface WhatsAppMessageCardProps {
  payload: MultimodalDispatchPayload;
}

/**
 * Renderiza o texto do WhatsApp convertendo *negrito* e _itálico_ em HTML formatado
 */
function renderWhatsAppFormattedText(text: string) {
  // Quebra por linhas para manter a estrutura exata do WhatsApp
  const lines = text.split("\n");

  return lines.map((line, lineIdx) => {
    if (!line.trim()) {
      return <div key={lineIdx} className="h-2" />;
    }

    // Processa negrito *palavra* e itálico _palavra_
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    
    // Regex para capturar *negrito*, _itálico_ ou links
    const regex = /(\*([^*]+)\*|_([^_]+)_|(https?:\/\/[^\s]+))/g;
    let match;

    while ((match = regex.exec(line)) !== null) {
      // Adiciona o texto antes do match
      if (match.index > currentIndex) {
        parts.push(line.substring(currentIndex, match.index));
      }

      if (match[2]) {
        // Negrito (*texto*)
        parts.push(
          <strong key={`${lineIdx}-${match.index}`} className="font-bold text-emerald-100">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        // Itálico (_texto_)
        parts.push(
          <em key={`${lineIdx}-${match.index}`} className="italic text-zinc-300">
            {match[3]}
          </em>
        );
      } else if (match[4]) {
        // Link URL
        parts.push(
          <span key={`${lineIdx}-${match.index}`} className="text-emerald-400 hover:underline break-all font-mono text-[13px]">
            {match[4]}
          </span>
        );
      }

      currentIndex = match.index + match[0].length;
    }

    if (currentIndex < line.length) {
      parts.push(line.substring(currentIndex));
    }

    return (
      <p key={lineIdx} className="leading-relaxed text-[13.5px] text-zinc-100">
        {parts}
      </p>
    );
  });
}

export function WhatsAppMessageCard({ payload }: WhatsAppMessageCardProps) {
  const [selectedFormat, setSelectedFormat] = useState<WhatsAppMessageFormat>("playbook");
  const [selectedDestination, setSelectedDestination] = useState<WhatsAppDestinationType>("group");
  const [includeBullets, setIncludeBullets] = useState<boolean>(true);
  const [includeFooter, setIncludeFooter] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Geração reativa da mensagem estruturada para WhatsApp
  const messageResult = useMemo(() => {
    return generateWhatsAppMessageVariant(payload, {
      format: selectedFormat,
      destination: selectedDestination,
      includeBullets,
      includeFooter
    });
  }, [payload, selectedFormat, selectedDestination, includeBullets, includeFooter]);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageResult.text);
    setCopied(true);
    toast.success(`Mensagem formatada para WhatsApp copiada (${messageResult.charCount} caracteres)!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    window.open(messageResult.encodedWhatsAppUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* 1. SELETORES DE FORMATO E DESTINO */}
      <div className="space-y-3 border-b border-zinc-800/80 pb-4">
        {/* Formatos Estratégicos */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Formato de Mensagem WhatsApp (Etapa 055):</span>
            </div>
            <span className="text-zinc-500 text-[11px]">Grupos & Comunidades VIP</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(Object.keys(WHATSAPP_FORMAT_TEMPLATES) as WhatsAppMessageFormat[]).map((fmtKey) => {
              const tmpl = WHATSAPP_FORMAT_TEMPLATES[fmtKey];
              const isSelected = selectedFormat === fmtKey;
              return (
                <button
                  key={fmtKey}
                  type="button"
                  onClick={() => setSelectedFormat(fmtKey)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left ${
                    isSelected
                      ? "bg-emerald-950/60 border-emerald-500/70 text-emerald-300 shadow-sm shadow-emerald-950"
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

        {/* Destino do Canal & Opções Rápidas */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-400">Canal Destino:</span>
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
              {(Object.keys(WHATSAPP_DESTINATION_CONFIGS) as WhatsAppDestinationType[]).map((destKey) => {
                const dest = WHATSAPP_DESTINATION_CONFIGS[destKey];
                const isSelected = selectedDestination === destKey;
                return (
                  <button
                    key={destKey}
                    type="button"
                    onClick={() => setSelectedDestination(destKey)}
                    className={`px-2 py-1 rounded text-[11px] transition-colors ${
                      isSelected
                        ? "bg-emerald-600 text-white font-medium"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {dest.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer text-zinc-400 hover:text-zinc-200 select-none">
              <input
                type="checkbox"
                checked={includeBullets}
                onChange={(e) => setIncludeBullets(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
              />
              <span>Destaques (Bullets)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-zinc-400 hover:text-zinc-200 select-none">
              <input
                type="checkbox"
                checked={includeFooter}
                onChange={(e) => setIncludeFooter(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
              />
              <span>Rodapé</span>
            </label>
          </div>
        </div>
      </div>

      {/* 2. SIMULADOR VISUAL DE MENSAGEM DO WHATSAPP */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            Pré-visualização no Chat (Formatação Nativa *texto*):
          </span>
          <span className="text-[11px] text-zinc-500">
            {messageResult.destinationLabel}
          </span>
        </div>

        {/* Moldura do Chat WhatsApp */}
        <div className="bg-[#0b141a] border border-[#202c33] rounded-2xl p-4 shadow-inner relative overflow-hidden">
          {/* Header do Chat */}
          <div className="flex items-center justify-between border-b border-[#202c33] pb-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-xs shadow">
                <Users className="w-4 h-4 text-emerald-100" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-zinc-200">
                    V5 Apollo Holding 🏛️ • {messageResult.destinationLabel}
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Transmissão oficial via Capitania #13 Poster
                </span>
              </div>
            </div>
            <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Online</span>
            </div>
          </div>

          {/* Balão de Mensagem Estilo WhatsApp */}
          <div className="flex justify-end">
            <div className="max-w-[92%] sm:max-w-[85%] bg-[#005c4b] text-white rounded-2xl rounded-tr-sm p-3.5 shadow-md space-y-1 relative">
              {/* Texto com Formatação Nativa em Tempo Real */}
              <div className="space-y-1">
                {renderWhatsAppFormattedText(messageResult.text)}
              </div>

              {/* Timestamp e Duplo Check Azul do WhatsApp */}
              <div className="flex items-center justify-end gap-1 pt-1 select-none">
                <span className="text-[10px] text-emerald-200/80 font-mono">12:00</span>
                <div className="flex items-center text-sky-400 text-[11px] font-bold">
                  <span>✓✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TELEMETRIA E CONTADOR DE CARACTERES */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-4 py-2.5 text-xs font-mono">
        <div className="flex items-center gap-2">
          {messageResult.isWithinLimit ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span className="text-zinc-300">
            Contagem: <strong className="text-white font-bold">{messageResult.charCount}</strong> / {messageResult.charLimit}c
          </span>
          {messageResult.isSweetSpot && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
              ⚡ Sweet Spot (Escaneável no Celular: 200-800c)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
          <span>Negrito: <code className="text-emerald-400 font-bold">*texto*</code></span>
          <span>•</span>
          <span>Itálico: <code className="text-zinc-300">_texto_</code></span>
        </div>
      </div>

      {/* 4. BOTÕES DE AÇÃO: COPIAR E ABRIR NO WHATSAPP */}
      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={handleOpenWhatsApp}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 text-xs font-medium transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
          <span>Abrir no WhatsApp Web</span>
        </button>

        <button
          type="button"
          onClick={handleCopyMessage}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-950/40 active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Mensagem Copiada!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar para Área de Transferência</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
