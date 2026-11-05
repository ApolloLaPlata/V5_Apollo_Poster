"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Sparkles,
  Zap,
  Check,
  Copy,
  Layers,
  ArrowRight,
  Send,
  SlidersHorizontal,
  Share2,
  Clock,
  Instagram,
  Video,
  FileText,
  Twitter,
  MessageCircle,
  Eye,
  CheckCircle2,
  Repeat
} from "lucide-react";
import {
  repurposeOmnichannelContent,
  RepurposingTone,
  TONE_LABELS,
  ChannelRepurposedContent
} from "@/lib/social/omnichannelRepurposer";
import { toast } from "@/lib/toast/useToast";
import { usePosterStore } from "@/store/usePosterStore";
import { SocialPlatform } from "@/types/poster";

interface OmnichannelRepurposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic: string;
  initialBody: string;
  onApplyToStudio?: (title: string, content: string, platform: SocialPlatform) => void;
}

export function OmnichannelRepurposerModal({
  isOpen,
  onClose,
  initialTopic,
  initialBody,
  onApplyToStudio
}: OmnichannelRepurposerModalProps) {
  const { addPost } = usePosterStore();

  const [topic, setTopic] = useState(initialTopic || "5 Ferramentas de IA para Escalar seu Negócio");
  const [body, setBody] = useState(initialBody || "");
  const [tone, setTone] = useState<RepurposingTone>("educational_step");
  const [keyword, setKeyword] = useState<string>("LINK");
  const [activeChannelKey, setActiveChannelKey] = useState<string>("instagram");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Gera o baralho completo
  const deck = useMemo(() => {
    return repurposeOmnichannelContent(topic, body, tone, keyword);
  }, [topic, body, tone, keyword]);

  if (!isOpen) return null;

  const currentChannelContent: ChannelRepurposedContent =
    deck.channels[activeChannelKey] || deck.channels.instagram;

  const handleCopyChannel = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Conteúdo Copiado!", `Formato ${key.toUpperCase()} copiado para a área de transferência.`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleApplySingleToStudio = (content: ChannelRepurposedContent) => {
    if (onApplyToStudio) {
      const platformMap: Record<string, SocialPlatform> = {
        instagram: "instagram",
        tiktok: "tiktok",
        linkedin: "autoblog", // mapeado para canal web/artigo
        twitter: "tiktok",
        whatsapp: "whatsapp"
      };
      onApplyToStudio(content.title, content.formattedText, platformMap[content.channel] || "instagram");
      toast.success("Aplicado ao Estúdio!", `Texto otimizado para ${content.channelLabel}.`);
      onClose();
    }
  };

  // Agenda todos os 5 posts no Zustand com intervalos escalonados de 3 horas
  const handleScheduleAllBatch = () => {
    const channelKeys = Object.keys(deck.channels);
    const now = new Date();

    channelKeys.forEach((key, index) => {
      const ch = deck.channels[key];
      const scheduledDate = new Date(now.getTime() + (index + 1) * 3 * 3600 * 1000);
      const scheduledIso = scheduledDate.toISOString();

      const platformMap: Record<string, SocialPlatform[]> = {
        instagram: ["instagram"],
        tiktok: ["tiktok", "youtube"],
        linkedin: ["autoblog"],
        twitter: ["tiktok"],
        whatsapp: ["whatsapp", "telegram"]
      };

      addPost({
        title: ch.title,
        content: ch.formattedText,
        platforms: platformMap[ch.channel] || ["instagram"],
        scheduledAt: scheduledIso,
        status: "scheduled",
        mediaType: ch.channel === "tiktok" ? "video" : "image",
        tags: ["OmnichannelRepurposer", ch.channel, tone]
      });
    });

    toast.success(
      "🚀 5 Publicações Agendadas com Sucesso!",
      "Distribuídas escalonadamente a cada 3 horas no seu Calendário Mestre."
    );
    onClose();
  };

  const getChannelIcon = (key: string) => {
    switch (key) {
      case "instagram":
        return <Instagram className="w-4 h-4 text-pink-400" />;
      case "tiktok":
        return <Video className="w-4 h-4 text-cyan-400" />;
      case "linkedin":
        return <FileText className="w-4 h-4 text-blue-400" />;
      case "twitter":
        return <Twitter className="w-4 h-4 text-sky-400" />;
      case "whatsapp":
        return <MessageCircle className="w-4 h-4 text-emerald-400" />;
      default:
        return <Layers className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Repurposador Onicanal 1-para-5</h3>
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                  Omnichannel Engine
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Transforme um único tema em 5 formatos otimizados para Instagram, TikTok, LinkedIn, X e WhatsApp.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar de Configuração Superior */}
        <div className="p-4 bg-zinc-900/40 border-b border-zinc-800/80 grid grid-cols-1 md:grid-cols-12 gap-3 text-xs font-mono">
          <div className="md:col-span-5 space-y-1">
            <label className="text-zinc-400 font-bold block">Tópico Central / Título:</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-black/40 border border-zinc-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-amber-400 text-xs"
              placeholder="Digite o tema do conteúdo..."
            />
          </div>

          <div className="md:col-span-4 space-y-1">
            <label className="text-zinc-400 font-bold block">Tom da Narrativa:</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as RepurposingTone)}
              className="w-full bg-black/40 border border-zinc-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-amber-400 text-xs"
            >
              {Object.entries(TONE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="text-zinc-400 font-bold block">Gatilho Comment-to-DM:</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value.toUpperCase())}
              className="w-full bg-black/40 border border-zinc-800 rounded-xl px-3 py-1.5 text-amber-400 font-bold focus:outline-none focus:border-amber-400 text-xs"
              placeholder="Ex: LINK, QUERO"
            />
          </div>
        </div>

        {/* Seletor de Canais (Tabs) */}
        <div className="px-6 py-2.5 bg-zinc-950 border-b border-zinc-800/80 flex items-center gap-2 overflow-x-auto text-xs font-mono">
          {Object.entries(deck.channels).map(([k, c]) => {
            const isActive = activeChannelKey === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setActiveChannelKey(k)}
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition shrink-0 ${
                  isActive
                    ? "bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold shadow-md shadow-amber-950/20"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {getChannelIcon(k)}
                <span>{c.channelLabel}</span>
                <span className="text-[10px] text-zinc-500">({c.characterCount}c)</span>
              </button>
            );
          })}
        </div>

        {/* Corpo: Visualização e Edição do Formato Selecionado */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono text-[11px] font-bold">
                {currentChannelContent.badge}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {currentChannelContent.notes}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-zinc-500">CTA:</span>
              <span className="text-amber-400 font-bold">{currentChannelContent.ctaType}</span>
            </div>
          </div>

          {/* Área de Visualização do Texto */}
          <div className="relative">
            <textarea
              readOnly
              value={currentChannelContent.formattedText}
              rows={12}
              className="w-full bg-black/50 border border-zinc-800 rounded-2xl p-4 text-xs font-mono text-zinc-200 leading-relaxed focus:outline-none resize-none shadow-inner"
            />
            <button
              type="button"
              onClick={() => handleCopyChannel(currentChannelContent.channel, currentChannelContent.formattedText)}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-mono font-bold flex items-center gap-1.5 transition shadow"
            >
              {copiedKey === currentChannelContent.channel ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          {/* Hashtags e Metadados do Canal */}
          {currentChannelContent.hashtags.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-zinc-500">Hashtags:</span>
              <div className="flex flex-wrap gap-1.5">
                {currentChannelContent.hashtags.map((h, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 text-[10px]"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer com Ações */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleApplySingleToStudio(currentChannelContent)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Usar no Estúdio ({currentChannelContent.channelLabel})</span>
            </button>

            <button
              type="button"
              onClick={handleScheduleAllBatch}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold flex items-center gap-1.5 transition shadow-md shadow-emerald-950/30"
              title="Cria automaticamente 5 agendamentos escalonados a cada 3 horas"
            >
              <Clock className="w-4 h-4" />
              <span>⚡ Agendar os 5 Formatos em Lote</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
