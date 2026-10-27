"use client";

import React, { useState } from "react";
import { 
  X, 
  Share2, 
  Video, 
  Image as ImageIcon, 
  FileText, 
  Sparkles, 
  Clock, 
  Flame, 
  Check, 
  Link as LinkIcon,
  Tag
} from "lucide-react";
import { usePosterStore } from "@/store/usePosterStore";
import { SocialPlatform, MediaType } from "@/types/poster";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { dispatchEventBus } from "@/lib/events/dispatchEvents";

interface NewPostScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
}

const AVAILABLE_PLATFORMS: Array<{ id: SocialPlatform; name: string }> = [
  { id: "instagram", name: "Instagram" },
  { id: "tiktok", name: "TikTok" },
  { id: "youtube", name: "YouTube Shorts" },
  { id: "kwai", name: "Kwai" },
  { id: "autoblog", name: "V5 AutoBlog" },
  { id: "wordpress", name: "WordPress" },
  { id: "newsletter", name: "Newsletter E-mail" },
  { id: "whatsapp", name: "WhatsApp VIP" },
  { id: "telegram", name: "Telegram VIP" }
];

export function NewPostScheduleModal({
  isOpen,
  onClose,
  defaultDate = "2026-10-30T18:00"
}: NewPostScheduleModalProps) {
  const { addPost } = usePosterStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(["instagram", "tiktok"]);
  const [scheduledAt, setScheduledAt] = useState(defaultDate);
  const [mediaType, setMediaType] = useState<MediaType>("video");
  const [mediaUrl, setMediaUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("IA, Produtividade, Automação");

  if (!isOpen) return null;

  const togglePlatform = (id: SocialPlatform) => {
    if (selectedPlatforms.includes(id)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((p) => p !== id));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  const selectVideoPreset = () => {
    setSelectedPlatforms(["instagram", "tiktok", "youtube", "kwai"]);
    setMediaType("video");
  };

  const selectBlogPreset = () => {
    setSelectedPlatforms(["autoblog", "wordpress", "newsletter"]);
    setMediaType("image");
  };

  const selectVipPreset = () => {
    setSelectedPlatforms(["whatsapp", "telegram"]);
    setMediaType("image");
  };

  const handlePrimeTimeClick = (hours: number, minutes: number, daysAhead = 0) => {
    const d = new Date(2026, 9, 27); // 27 de Outubro
    d.setDate(d.getDate() + daysAhead);
    d.setHours(hours, minutes, 0, 0);

    const pad = (n: number) => n.toString().padStart(2, "0");
    const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(hours)}:${pad(minutes)}`;
    setScheduledAt(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedPlatforms.length === 0) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    addPost({
      title,
      content,
      platforms: selectedPlatforms,
      scheduledAt,
      status: "scheduled",
      mediaType,
      mediaUrl: mediaUrl || undefined,
      tags
    });

    dispatchEventBus.emit("POST_SCHEDULED", {
      postId: `post-${Date.now()}`,
      title,
      platforms: selectedPlatforms,
      scheduledAt
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/10">
              <Share2 className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Agendar Publicação Onicanal</h3>
              <p className="text-xs text-zinc-400">Configure o conteúdo e os canais de disparo automático</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-xl hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Presets Rápidos de Plataforma */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-zinc-200">1. Seleção de Canais de Destino ({selectedPlatforms.length})</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={selectVideoPreset}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[10px]"
                >
                  Preset Vídeo Curto
                </button>
                <button
                  type="button"
                  onClick={selectBlogPreset}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[10px]"
                >
                  Preset Artigo/Email
                </button>
                <button
                  type="button"
                  onClick={selectVipPreset}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[10px]"
                >
                  Preset Grupos VIP
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AVAILABLE_PLATFORMS.map((plat) => {
                const isSelected = selectedPlatforms.includes(plat.id);
                return (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => togglePlatform(plat.id)}
                    className={`flex items-center justify-between p-2 rounded-xl border transition ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500/50 text-white font-semibold"
                        : "bg-zinc-950/40 border-zinc-800/80 text-zinc-400 hover:bg-zinc-800/40"
                    }`}
                  >
                    <PlatformBadge platform={plat.id} variant="compact" />
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-zinc-700 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Título & Conteúdo */}
          <div className="space-y-3 pt-2 border-t border-zinc-800">
            <div>
              <label className="font-semibold text-zinc-300 block mb-1">Título da Publicação / Assunto Principal</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Como Montar uma Central de Publicação com IA sem Extensão"
                className="w-full bg-zinc-800/80 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-medium placeholder:text-zinc-500"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-zinc-300">Legenda / Roteiro / Texto da Publicação</label>
                <span className="text-[11px] font-mono text-zinc-500">{content.length} caracteres</span>
              </div>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva a legenda completa com hashtags ou resumo do disparo..."
                className="w-full bg-zinc-800/80 border border-zinc-700/80 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 leading-relaxed resize-none placeholder:text-zinc-500"
                required
              />
            </div>
          </div>

          {/* Mídia e Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
            <div>
              <label className="font-semibold text-zinc-300 block mb-1">Formato de Mídia</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "video", label: "Vídeo 9:16", icon: Video },
                  { id: "image", label: "Imagem 1:1", icon: ImageIcon },
                  { id: "text", label: "Texto Puro", icon: FileText }
                ].map((m) => {
                  const Icon = m.icon;
                  const isSel = mediaType === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMediaType(m.id as MediaType)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition ${
                        isSel
                          ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                          : "bg-zinc-800/40 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-[10px]">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="font-semibold text-zinc-300 block mb-1">URL da Mídia (Opcional)</label>
              <div className="flex items-center gap-1.5 bg-zinc-800/80 border border-zinc-700/80 rounded-xl px-3 py-2">
                <LinkIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://cdn.v5apollo.com/video.mp4"
                  className="bg-transparent text-xs text-zinc-200 focus:outline-none w-full"
                />
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">Hospedagem nativa em nuvem ou Supabase Storage</p>
            </div>
          </div>

          {/* Data, Hora e Horários Nobres */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-zinc-300">Data e Hora de Disparo</label>
              <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Horários de Pico Sugeridos:</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="bg-zinc-800/80 border border-zinc-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                required
              />

              {/* Botões Rápidos de Horário Nobre */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handlePrimeTimeClick(11, 30, 0)}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 border border-zinc-700 text-[10px] font-mono transition"
                >
                  Hoje 11:30
                </button>
                <button
                  type="button"
                  onClick={() => handlePrimeTimeClick(18, 0, 0)}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-orange-500/20 text-zinc-300 hover:text-orange-300 border border-zinc-700 text-[10px] font-mono transition"
                >
                  Hoje 18:00
                </button>
                <button
                  type="button"
                  onClick={() => handlePrimeTimeClick(21, 0, 0)}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-purple-500/20 text-zinc-300 hover:text-purple-300 border border-zinc-700 text-[10px] font-mono transition"
                >
                  Hoje 21:00
                </button>
                <button
                  type="button"
                  onClick={() => handlePrimeTimeClick(11, 30, 1)}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-cyan-500/20 text-zinc-300 hover:text-cyan-300 border border-zinc-700 text-[10px] font-mono transition"
                >
                  Amanhã 11:30
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-700 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-lg flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              <span>Agendar Disparo Onicanal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
