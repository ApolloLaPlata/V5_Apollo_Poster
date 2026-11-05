"use client";

import React, { useState, useMemo } from "react";
import { 
  X, 
  Clapperboard, 
  Sparkles, 
  Copy, 
  Check, 
  Clock, 
  ArrowRight, 
  Video, 
  Volume2, 
  FileText, 
  Send,
  Zap,
  Play
} from "lucide-react";
import { 
  generateVideoStoryboard, 
  VideoStoryboard, 
  VideoDurationPreset 
} from "@/lib/social/videoStoryboardEngine";
import { toast } from "@/lib/toast/useToast";
import { executeCrossCapitaniaBroadcast } from "@/lib/dispatch/crossCapitaniaEngine";

interface VideoStoryboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicTitle: string;
  audioTrackId?: string;
  onApplyToStudio?: (scriptText: string, hookTitle: string) => void;
}

export function VideoStoryboardModal({
  isOpen,
  onClose,
  topicTitle,
  audioTrackId,
  onApplyToStudio
}: VideoStoryboardModalProps) {
  const [keyword, setKeyword] = useState<string>("LINK");
  const [duration, setDuration] = useState<VideoDurationPreset>(15);
  const [copied, setCopied] = useState<boolean>(false);
  const [isTransmittingToStudio, setIsTransmittingToStudio] = useState<boolean>(false);

  const storyboard: VideoStoryboard = useMemo(() => {
    return generateVideoStoryboard(topicTitle, keyword, duration, audioTrackId);
  }, [topicTitle, keyword, duration, audioTrackId]);

  if (!isOpen) return null;

  const handleCopyScript = () => {
    const fullText =
      `🎬 ROTEIRO DE VÍDEO VIRAL (3 ATOS) - ${storyboard.topic}\n` +
      `⏱️ Duração: ${storyboard.durationSec}s | Gatilho: "${storyboard.triggerKeyword}"\n\n` +
      storyboard.scenes
        .map(
          (s) =>
            `=== [${s.timeRange}] ${s.actName} ===\n` +
            `💬 Na Tela: ${s.onScreenText}\n` +
            `🎙️ Fala: "${s.voiceoverScript}"\n` +
            `🎥 Visual: ${s.visualDirection}\n` +
            `🎵 Som: ${s.soundCue}`
        )
        .join("\n\n-------------------------\n\n") +
      `\n\n${storyboard.aiGenerationInstructions}`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success("Roteiro Completo em 3 Atos Copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTransmitToApolloStudio = async () => {
    setIsTransmittingToStudio(true);
    toast.info("Transmitindo para V5 Apollo Studio (:3004)...");
    try {
      const res = await executeCrossCapitaniaBroadcast(
        {
          title: `[Vídeo ${duration}s] ${storyboard.topic}`,
          content: storyboard.fullVoiceover,
          mediaType: "video",
          audioTrackId: audioTrackId || "tech-cyber-808"
        },
        ["studio"]
      );
      toast.success(
        "Roteiro Injetado no Apollo Studio!",
        `Timeline de vídeo provisionada na porta :3004 (${res.overallLatencyMs}ms).`
      );
    } catch {
      toast.error("Falha na transmissão", "Não foi possível conectar ao Studio.");
    } finally {
      setIsTransmittingToStudio(false);
    }
  };

  const handleApplyToStudio = () => {
    if (onApplyToStudio) {
      const formattedCaption =
        `🎬 ${storyboard.topic}\n\n` +
        `Assista até o final para entender como aplicar isso na prática.\n\n` +
        `💬 Comente "${storyboard.triggerKeyword}" aqui embaixo para receber o acesso exclusivo no seu Direct!\n\n` +
        `#ReelsViral #Shorts #Tech2026 #InteligenciaArtificial #Automacao`;

      onApplyToStudio(formattedCaption, storyboard.scenes[0].onScreenText);
      toast.success("Roteiro aplicado como legenda no Estúdio!");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Roteirizador de Reels & TikTok (3 Atos)</h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] font-mono font-bold">
                  Método Marcondes · 9:16
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Gancho visceral nos primeiros 3s, cortes rápidos de retenção e fechamento com Comment-to-DM.
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

        {/* Toolbar de Duração e Gatilho */}
        <div className="px-6 py-3 bg-zinc-900/40 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-zinc-400 font-bold">Duração:</span>
            <div className="flex items-center bg-zinc-900 p-0.5 rounded-xl border border-zinc-800">
              {([15, 30, 60] as VideoDurationPreset[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    duration === d
                      ? "bg-purple-500 text-white font-bold shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {d}s {d === 15 ? "(Ultra Rápido)" : d === 30 ? "(Padrão)" : "(Completo)"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Palavra-Gatilho na DM:</span>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value.toUpperCase())}
              placeholder="LINK"
              className="bg-zinc-900 px-3 py-1 rounded-xl border border-zinc-800 text-amber-400 font-bold text-xs focus:outline-none w-20 uppercase"
            />
          </div>
        </div>

        {/* Cenas do Storyboard (Timeline de 3 Atos) */}
        <div className="p-6 overflow-y-auto space-y-4">
          {storyboard.scenes.map((scene) => (
            <div
              key={scene.sceneNumber}
              className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 transition space-y-3"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-[11px] font-bold border border-purple-500/30">
                    Cena {scene.sceneNumber} · {scene.timeRange}
                  </span>
                  <span className="text-xs font-bold text-white">{scene.actName}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">Corte 9:16 Vertical</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Texto na Tela e Fala */}
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800 space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                      💬 Legenda na Tela (Padrão Hormozi):
                    </span>
                    <p className="font-extrabold text-white text-sm">{scene.onScreenText}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Volume2 className="w-3 h-3" /> Fala do Locutor / Avatar:
                    </span>
                    <p className="text-zinc-300 italic">"{scene.voiceoverScript}"</p>
                  </div>
                </div>

                {/* Direção Visual e Áudio */}
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
                    <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Video className="w-3 h-3" /> Direção de Câmera & B-Roll:
                    </span>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">{scene.visualDirection}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
                    <span className="text-[10px] font-mono text-pink-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Efeito Sonoro (SFX):
                    </span>
                    <p className="text-zinc-400 text-[11px]">{scene.soundCue}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyScript}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold flex items-center gap-1.5 transition border border-zinc-700"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Roteiro Copiado!" : "Copiar Roteiro"}</span>
            </button>

            <button
              type="button"
              disabled={isTransmittingToStudio}
              onClick={handleTransmitToApolloStudio}
              className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold flex items-center gap-1.5 transition border border-purple-500/40"
              title="Transmite o roteiro diretamente para a timeline de vídeo do Apollo Studio (:3004)"
            >
              <Send className="w-3.5 h-3.5 text-purple-400" />
              <span>{isTransmittingToStudio ? "Enviando..." : "Enviar ao Apollo Studio (:3004)"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold transition"
            >
              Fechar
            </button>
            {onApplyToStudio && (
              <button
                type="button"
                onClick={handleApplyToStudio}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <span>Usar no Estúdio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
