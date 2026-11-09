"use client";

import React, { useState } from "react";
import { 
  X, 
  Calendar, 
  Clock, 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  Video, 
  Image as ImageIcon, 
  MessageSquare, 
  Flame, 
  Cpu, 
  Trash2,
  ExternalLink,
  Layers,
  TestTube
} from "lucide-react";
import { ScheduledPost, SocialPlatform } from "@/types/poster";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { isPrimeTimeSlot } from "@/components/poster/MasterCalendar";
import { toast } from "@/lib/toast/useToast";

interface PostDetailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: ScheduledPost | null;
  onDelete?: (id: string) => void;
  onOpenRepurposer?: (topic: string) => void;
  onOpenStoryboard?: (topic: string) => void;
  onOpenAbTester?: (hookA: string) => void;
}

export function PostDetailPreviewModal({
  isOpen,
  onClose,
  post,
  onDelete,
  onOpenRepurposer,
  onOpenStoryboard,
  onOpenAbTester
}: PostDetailPreviewModalProps) {
  const [activePlatformTab, setActivePlatformTab] = useState<SocialPlatform>("instagram");
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !post) return null;

  const isPrimeTime = isPrimeTimeSlot(post.scheduledAt);
  const formattedDate = new Date(post.scheduledAt).toLocaleString("pt-BR", {
    dateStyle: "full",
    timeStyle: "short"
  });

  const handleCopyContent = () => {
    navigator.clipboard.writeText(`${post.title}\n\n${post.content}`);
    setCopied(true);
    toast.success("Conteúdo copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (confirm("Tem certeza que deseja excluir esta publicação da grade?")) {
      if (onDelete) {
        onDelete(post.id);
        toast.info("Publicação removida da grade.");
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white truncate max-w-md">{post.title}</h3>
                {isPrimeTime && (
                  <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-400" /> Slot Nobre
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                {formattedDate} · ID: {post.id}
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

        {/* Channels Tabs Bar */}
        <div className="px-6 py-2.5 bg-zinc-900/40 border-b border-zinc-800 flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <span className="text-zinc-500 font-bold uppercase text-[10px] mr-1">Canais Vinculados:</span>
          {post.platforms.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setActivePlatformTab(p)}
              className={`transition ${
                activePlatformTab === p ? "ring-2 ring-amber-500 rounded-lg scale-105" : "opacity-75 hover:opacity-100"
              }`}
            >
              <PlatformBadge platform={p} variant="compact" />
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Card de Simulação do Canal Selecionado */}
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <PlatformBadge platform={activePlatformTab} variant="full" />
                <span className="text-[11px] font-mono text-zinc-400">
                  Status: <b className="text-amber-400 uppercase">{post.status}</b>
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                Formato: {post.mediaType?.toUpperCase() || "TEXTO"}
              </span>
            </div>

            {/* Texto Formatado */}
            <div className="p-4 rounded-xl bg-black/60 border border-zinc-800 text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed font-sans">
              {post.content}
            </div>

            {/* Tags e Gatilhos */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-mono border border-zinc-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => {
                if (onOpenRepurposer) {
                  onOpenRepurposer(post.title);
                  onClose();
                }
              }}
              className="p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center justify-center gap-2 transition"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Repurposar 1-para-5</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOpenStoryboard) {
                  onOpenStoryboard(post.title);
                  onClose();
                }
              }}
              className="p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold flex items-center justify-center gap-2 transition"
            >
              <Video className="w-4 h-4 text-purple-400" />
              <span>Storyboard 9:16</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOpenAbTester) {
                  onOpenAbTester(post.title);
                  onClose();
                }
              }}
              className="p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold flex items-center justify-center gap-2 transition"
            >
              <TestTube className="w-4 h-4 text-cyan-400" />
              <span>Teste A/B de Gancho</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyContent}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold flex items-center gap-1.5 transition border border-zinc-700"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copiado!" : "Copiar Texto"}</span>
            </button>

            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition flex items-center gap-1 font-bold"
                title="Excluir post da grade"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </button>
            )}
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
