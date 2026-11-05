"use client";

import React, { useState } from "react";
import { 
  X, 
  Music, 
  Sparkles, 
  Check, 
  Flame, 
  Zap, 
  ShieldCheck, 
  Volume2, 
  SlidersHorizontal,
  Clock,
  Radio
} from "lucide-react";
import { 
  TRENDING_AUDIO_CATALOG, 
  TrendingAudioTrack 
} from "@/lib/social/trendingAudioEngine";
import { toast } from "@/lib/toast/useToast";
import { globalAudioSynthesizer } from "@/lib/social/webAudioSynthesizer";


interface TrendingAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTrackId?: string;
  onSelectTrack: (track: TrendingAudioTrack) => void;
}

export function TrendingAudioModal({
  isOpen,
  onClose,
  selectedTrackId,
  onSelectTrack
}: TrendingAudioModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [previewPlayingId, setPreviewPlayingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredTracks = activeCategory === "all"
    ? TRENDING_AUDIO_CATALOG
    : TRENDING_AUDIO_CATALOG.filter((t) => t.category === activeCategory);

  React.useEffect(() => {
    return () => {
      globalAudioSynthesizer.stopPreview();
    };
  }, []);

  const handleTogglePlaySim = (track: TrendingAudioTrack) => {
    if (previewPlayingId === track.id) {
      globalAudioSynthesizer.stopPreview();
      setPreviewPlayingId(null);
    } else {
      globalAudioSynthesizer.playTrackPreview(track.id, track.bpm, track.category);
      setPreviewPlayingId(track.id);
      toast.info("Tocando Amostra Procedural", `${track.title} (${track.bpm} BPM)`);
    }
  };

  const handleSelect = (track: TrendingAudioTrack) => {
    globalAudioSynthesizer.stopPreview();
    onSelectTrack(track);
    toast.success("Áudio Vinculado com Sucesso!", `${track.title} sincronizado com Reels/TikTok.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Radar de Áudios Virais (Reels & TikTok)</h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-500" /> Em Alta
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Pareie seu vídeo com trilhas de alta tração algorítmica para maximizar a retenção nos primeiros 3 segundos.
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

        {/* Categorias */}
        <div className="px-6 py-3 bg-zinc-900/40 border-b border-zinc-800 flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeCategory === "all"
                ? "bg-rose-500 text-black font-bold shadow-md shadow-rose-500/20"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white"
            }`}
          >
            Todos os Áudios ({TRENDING_AUDIO_CATALOG.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("tech_ai")}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeCategory === "tech_ai"
                ? "bg-rose-500 text-black font-bold shadow-md shadow-rose-500/20"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white"
            }`}
          >
            Tech & IA
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("motivation_drill")}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeCategory === "motivation_drill"
                ? "bg-rose-500 text-black font-bold shadow-md shadow-rose-500/20"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white"
            }`}
          >
            Viral & Phonk
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("cinematic_tension")}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeCategory === "cinematic_tension"
                ? "bg-rose-500 text-black font-bold shadow-md shadow-rose-500/20"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white"
            }`}
          >
            Suspense & VSL
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("apollo_exclusive")}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeCategory === "apollo_exclusive"
                ? "bg-rose-500 text-black font-bold shadow-md shadow-rose-500/20"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white"
            }`}
          >
            V5 Sound :3003
          </button>
        </div>

        {/* Lista de Trilhas */}
        <div className="p-6 overflow-y-auto space-y-3.5">
          {filteredTracks.map((track) => {
            const isSelected = selectedTrackId === track.id;
            const isPlaying = previewPlayingId === track.id;

            return (
              <div
                key={track.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isSelected
                    ? "bg-rose-500/10 border-rose-500/50 shadow-lg shadow-rose-500/5"
                    : "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  {/* Botão de Tocar / Amostra */}
                  <button
                    type="button"
                    onClick={() => handleTogglePlaySim(track)}
                    className={`p-3 rounded-2xl border transition flex items-center justify-center shrink-0 ${
                      isPlaying
                        ? "bg-rose-500 text-black border-rose-400 animate-pulse shadow-md"
                        : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white hover:bg-zinc-700"
                    }`}
                    title={isPlaying ? "Pausar Amostra" : "Ouvir Amostra"}
                  >
                    {isPlaying ? <Volume2 className="w-5 h-5" /> : <Radio className="w-5 h-5" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{track.title}</h4>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {track.bpm} BPM
                      </span>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                        <Flame className="w-2.5 h-2.5" /> Score {track.trendingScore}/100
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400">{track.vibe}</p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-zinc-500">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" /> 100% Seguro (Sem Strike)
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" /> Ideal: {track.recommendedDurationSec}s
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ação de Selecionar */}
                <button
                  type="button"
                  onClick={() => handleSelect(track)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-center ${
                    isSelected
                      ? "bg-rose-500 text-black shadow-md shadow-rose-500/20"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                  }`}
                >
                  {isSelected ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-amber-400" />}
                  <span>{isSelected ? "Selecionado" : "Vincular Trilha"}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between text-xs font-mono text-zinc-500">
          <span>Integração Direta com V5 Sound Studio (:3003) & Suno v4</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
