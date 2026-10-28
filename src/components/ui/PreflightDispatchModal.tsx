"use client";

import React, { useState, useEffect } from "react";
import { 
  Send, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Globe, 
  Mail, 
  MessageSquare,
  Users
} from "lucide-react";
import { SocialPlatform } from "@/types/poster";

interface PreflightDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  channels: SocialPlatform[];
  estimatedReach?: number;
  isDispatching?: boolean;
}

export function PreflightDispatchModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  channels = [],
  estimatedReach = 2400,
  isDispatching = false
}: PreflightDispatchModalProps) {
  const [checklist, setChecklist] = useState({
    utms: true,
    canonical: true,
    compliance: true,
    mediaRatio: true
  });

  // Fechamento com tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isDispatching) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDispatching, onClose]);

  if (!isOpen) return null;

  const allChecked = Object.values(checklist).every(Boolean);
  const safeChannels = Array.isArray(channels) ? channels : [];
  const safeReach = Number.isFinite(estimatedReach) ? Math.max(0, estimatedReach) : 0;

  const getChannelBadge = (ch: SocialPlatform) => {
    switch (ch) {
      case "instagram":
        return <span key={ch} className="px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20 font-mono text-[10px]">Instagram</span>;
      case "tiktok":
        return <span key={ch} className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono text-[10px]">TikTok</span>;
      case "youtube":
        return <span key={ch} className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-mono text-[10px]">YouTube</span>;
      case "autoblog":
        return <span key={ch} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-[10px]">AutoBlog REST</span>;
      case "newsletter":
        return <span key={ch} className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono text-[10px]">Newsletter E-mail</span>;
      case "telegram":
        return <span key={ch} className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[10px]">Telegram VIP</span>;
      case "whatsapp":
        return <span key={ch} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px]">WhatsApp</span>;
      default:
        return <span key={ch} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">{ch}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop com clique para fechar */}
      <div 
        className="absolute inset-0" 
        onClick={!isDispatching ? onClose : undefined} 
      />

      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5 z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Checklist Pré-Voo de Despacho</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Confirme as diretrizes antes da transmissão onicanal</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isDispatching}
            className="text-zinc-500 hover:text-zinc-300 transition p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Resumo do Conteúdo */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 space-y-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-mono text-zinc-500 block mb-1">Título do Post / Edição</span>
            <p className="font-semibold text-white text-sm line-clamp-2">{title || "Sem título informado"}</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/60">
            <div>
              <span className="text-[10px] uppercase font-mono text-zinc-500 block mb-1">Canais Destino</span>
              <div className="flex flex-wrap gap-1.5">
                {safeChannels.length > 0 ? safeChannels.map(getChannelBadge) : (
                  <span className="text-zinc-500 italic text-[11px]">Nenhum canal selecionado</span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-zinc-500 block mb-1">Alcance Estimado</span>
              <span className="font-mono text-emerald-400 font-bold flex items-center gap-1 justify-end">
                <Users className="w-3.5 h-3.5" />
                ~{safeReach.toLocaleString("pt-BR")} pessoas
              </span>
            </div>
          </div>
        </div>

        {/* Checklist Interativo */}
        <div className="space-y-2 text-xs">
          <span className="font-semibold text-zinc-300 block mb-1">Verificação de Segurança Pré-Disparo:</span>

          <label className="flex items-center gap-2.5 bg-zinc-800/40 p-2.5 rounded-lg border border-zinc-800 cursor-pointer hover:bg-zinc-800/70 transition">
            <input
              type="checkbox"
              checked={checklist.utms}
              onChange={(e) => setChecklist({ ...checklist, utms: e.target.checked })}
              className="rounded text-amber-500 focus:ring-0 accent-amber-500"
            />
            <span className="text-zinc-300">Rastreamento UTM injetado em todos os links e CTAs</span>
          </label>

          <label className="flex items-center gap-2.5 bg-zinc-800/40 p-2.5 rounded-lg border border-zinc-800 cursor-pointer hover:bg-zinc-800/70 transition">
            <input
              type="checkbox"
              checked={checklist.canonical}
              onChange={(e) => setChecklist({ ...checklist, canonical: e.target.checked })}
              className="rounded text-amber-500 focus:ring-0 accent-amber-500"
            />
            <span className="text-zinc-300">URL canônica e Schema.org validados contra conteúdo duplicado</span>
          </label>

          <label className="flex items-center gap-2.5 bg-zinc-800/40 p-2.5 rounded-lg border border-zinc-800 cursor-pointer hover:bg-zinc-800/70 transition">
            <input
              type="checkbox"
              checked={checklist.compliance}
              onChange={(e) => setChecklist({ ...checklist, compliance: e.target.checked })}
              className="rounded text-amber-500 focus:ring-0 accent-amber-500"
            />
            <span className="text-zinc-300">Conformidade antispam das APIs oficiais da Meta e Resend</span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <button
            onClick={onClose}
            disabled={isDispatching}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            disabled={!allChecked || isDispatching}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isDispatching ? (
              <span>Despachando pacotes em nuvem...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Confirmar e Despachar Agora</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
