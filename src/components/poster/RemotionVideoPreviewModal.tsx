"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Film, 
  Sparkles, 
  Cpu, 
  Check, 
  Copy, 
  Volume2, 
  VolumeX, 
  Maximize2,
  Calendar,
  Flame,
  Zap,
  Activity
} from "lucide-react";
import { VideoStoryboard } from "@/lib/social/videoStoryboardEngine";
import { 
  buildRemotionTimeline, 
  getPlaybackState, 
  MINIMAX_H3_OFFICIAL_MP4_URL 
} from "@/lib/video/remotionPreviewEngine";
import { dispatchGpuRenderJob } from "@/lib/api/v5GpuClusterClient";
import { toast } from "@/lib/toast/useToast";

interface RemotionVideoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyboard: VideoStoryboard;
  onSchedulePost?: (title: string, content: string, platform: "tiktok" | "instagram") => void;
}

export function RemotionVideoPreviewModal({
  isOpen,
  onClose,
  storyboard,
  onSchedulePost
}: RemotionVideoPreviewModalProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentSec, setCurrentSec] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [mode, setMode] = useState<"remotion" | "minimax_cloud">("remotion");
  const [isExportingGpu, setIsExportingGpu] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const timeline = useMemo(() => {
    return buildRemotionTimeline(storyboard, 24);
  }, [storyboard]);

  const playbackState = useMemo(() => {
    return getPlaybackState(timeline, currentSec);
  }, [timeline, currentSec]);

  // Animation Loop para o simulador Remotion procedural
  useEffect(() => {
    if (!isOpen || mode === "minimax_cloud") return;

    const animate = (time: number) => {
      if (lastTimeRef.current !== null && isPlaying) {
        const delta = (time - lastTimeRef.current) / 1000;
        setCurrentSec((prev) => {
          const next = prev + delta;
          if (next >= timeline.durationSec) {
            return 0; // Loop contínuo
          }
          return next;
        });
      }
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      lastTimeRef.current = null;
    };
  }, [isOpen, isPlaying, mode, timeline.durationSec]);

  // Sincronizar vídeo nativo se no modo MiniMax Cloud
  useEffect(() => {
    if (mode === "minimax_cloud" && videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, mode]);

  if (!isOpen) return null;

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentSec(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
    setIsPlaying(true);
  };

  const handleExportGpu = async () => {
    setIsExportingGpu(true);
    try {
      const res = await dispatchGpuRenderJob({
        jobType: "video_storyboard",
        priority: "high",
        payload: {
          storyboard,
          topic: storyboard.topic,
          durationSec: storyboard.durationSec,
          renderEngine: mode === "minimax_cloud" ? "MiniMax_H3_Ref2VA" : "Remotion_NVENC",
          audioTrackId: storyboard.audioTrack?.id || "tech-cyber-808",
          targetPlatform: "instagram_reels"
        },
        metadata: {
          capitania: "V5 Apollo Poster (:3011)",
          port: 3011,
          requestedSlot: "Slot 04 (descarganews - T4 16GB)"
        }
      });

      toast.success(
        "Job de Vídeo Despachado para Frota Colab T4!",
        `Alocado no ${res.assignedSlot}. Vídeo MP4 compilado via NVENC a 60fps (Custo: R$ 0,00).`
      );
    } catch {
      toast.error("Falha no cluster", "Erro ao conectar com a api.v5apollo.com.");
    } finally {
      setIsExportingGpu(false);
    }
  };

  const handleCopyCaption = () => {
    const caption = 
      `🚨 ${storyboard.topic.toUpperCase()}!\n\n` +
      `Descubra como colocar essa automação para rodar 100% no piloto automático sem custos de equipe.\n\n` +
      `💬 Comente "${storyboard.triggerKeyword}" aqui embaixo que o meu assistente vai te mandar o acesso na DM!\n\n` +
      `#InteligenciaArtificial #ReelsViral #Shorts #Tech2026 #Automacao #ColabT4`;
    navigator.clipboard.writeText(caption);
    setCopied(true);
    toast.success("Legenda & Gatilho Comment-to-DM copiados!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSchedule = () => {
    if (onSchedulePost) {
      const caption = 
        `🚨 ${storyboard.topic.toUpperCase()}!\n\n` +
        `Assista ao vídeo e veja o passo a passo completo.\n\n` +
        `💬 Comente "${storyboard.triggerKeyword}" para receber o link direto na sua DM!`;
      onSchedulePost(storyboard.topic, caption, "instagram");
      toast.success("Vídeo enviado para a Grade de Agendamento!");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/90 backdrop-blur-lg animate-in fade-in">
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Player Remotion & MiniMax H3</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold">
                  9:16 Vertical · 24 FPS
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                  Frota Colab T4 Ready
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Pré-visualização cinemática com legendas de alta retenção e transição em 3 Atos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Seletor de Modo: Remotion Procedural vs MiniMax H3 Cloud */}
            <div className="flex items-center bg-zinc-900 p-0.5 rounded-xl border border-zinc-800 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setMode("remotion")}
                className={`px-2.5 py-1 rounded-lg transition ${
                  mode === "remotion"
                    ? "bg-amber-500 text-black font-bold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Remotion Procedural
              </button>
              <button
                type="button"
                onClick={() => setMode("minimax_cloud")}
                className={`px-2.5 py-1 rounded-lg transition ${
                  mode === "minimax_cloud"
                    ? "bg-purple-600 text-white font-bold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Vídeo real renderizado na GPU Tesla T4 via MiniMax H3 (Pulso #237)"
              >
                MiniMax H3 Cloud (T4)
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Smartphone Mockup + Telemetria Lateral */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-gradient-to-b from-zinc-950 to-zinc-900/50">
          
          {/* Smartphone 9:16 Mockup Frame */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative w-[280px] h-[520px] bg-black rounded-[40px] p-2.5 border-4 border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
              
              {/* Notch / Speaker */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-zinc-900 rounded-full z-30 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-zinc-800 mr-2" />
                <div className="w-8 h-1 rounded-full bg-zinc-800" />
              </div>

              {/* Video Screen Container */}
              <div className="relative flex-1 rounded-[32px] overflow-hidden bg-black flex flex-col justify-between">
                
                {mode === "minimax_cloud" ? (
                  /* Modo Vídeo MiniMax H3 Real MP4 */
                  <div className="relative w-full h-full flex items-center justify-center bg-zinc-950">
                    <video
                      ref={videoRef}
                      src={MINIMAX_H3_OFFICIAL_MP4_URL}
                      loop
                      playsInline
                      muted={isMuted}
                      className="w-full h-full object-cover"
                      onTimeUpdate={(e) => {
                        const target = e.currentTarget;
                        setCurrentSec(target.currentTime);
                      }}
                    />
                    {/* Badge do Motor MiniMax H3 */}
                    <div className="absolute top-10 left-3 z-20 px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/50 text-[9px] font-mono font-bold text-purple-300 flex items-center gap-1 backdrop-blur-sm">
                      <Cpu className="w-3 h-3 text-purple-400" />
                      <span>MiniMax H3 · Colab T4</span>
                    </div>
                  </div>
                ) : (
                  /* Modo Simulador Remotion Procedural (Hormozi Kinetic Titles) */
                  <div
                    className={`relative w-full h-full bg-gradient-to-b ${playbackState.activeScene.bgGradient} p-4 flex flex-col justify-between transition-colors duration-500`}
                  >
                    {/* Top Status & Hook Badge */}
                    <div className="pt-8 flex items-center justify-between z-20">
                      <div
                        className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold flex items-center gap-1 border backdrop-blur-md transition-all ${
                          playbackState.isHookZone
                            ? "bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse"
                            : "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        }`}
                      >
                        <Flame className="w-3 h-3" />
                        <span>{playbackState.isHookZone ? "ZONA 3s DE GANCHO" : "RETENÇÃO ATIVA"}</span>
                      </div>

                      <span className="text-[10px] font-mono text-zinc-400">
                        {currentSec.toFixed(1)}s / {timeline.durationSec}s
                      </span>
                    </div>

                    {/* Central Kinetic Typography (Hormozi Style) */}
                    <div className="my-auto text-center px-2 py-4 z-20 flex flex-col items-center">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2 px-2 py-0.5 rounded bg-black/40 border border-zinc-800">
                        {playbackState.activeScene.actLabel}
                      </span>

                      <div className="relative font-black tracking-tight uppercase leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                        <p className="text-xl sm:text-2xl text-white font-black scale-100 transition-transform">
                          {playbackState.activeScene.headline}
                        </p>
                      </div>

                      {/* Legenda Dinâmica da Palavra Atual */}
                      <div className="mt-4 p-2 rounded-xl bg-black/60 border border-amber-500/40 backdrop-blur-md">
                        <p className="text-xs font-mono font-bold text-amber-400">
                          {playbackState.currentWord ? (
                            <span>"{playbackState.currentWord.word.toUpperCase()}"</span>
                          ) : (
                            <span className="text-zinc-400">...</span>
                          )}
                        </p>
                      </div>

                      {/* Botão de Fechamento se na zona de CTA */}
                      {playbackState.isCtaZone && (
                        <div className="mt-4 animate-bounce px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-xs shadow-lg flex items-center gap-1.5">
                          <span>Comente "{storyboard.triggerKeyword}"</span>
                        </div>
                      )}
                    </div>

                    {/* Rodapé do Simulador */}
                    <div className="pb-4 z-20 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                        <span className="truncate max-w-[140px]">🎵 {storyboard.audioTrack?.title || "Tech Drill"}</span>
                        <span className="text-cyan-400 font-bold">1080x1920</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Barra de Progresso Inferior */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-900 z-30">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-75"
                    style={{ width: `${playbackState.progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Painel Lateral: Telemetria & Controle de Timeline */}
          <div className="md:col-span-7 space-y-4">
            {/* Card de Controle de Playback */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-400" />
                  Timeline de Renderização (3 Atos)
                </span>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  {currentSec.toFixed(1)}s / {timeline.durationSec}s ({playbackState.progressPct}%)
                </span>
              </div>

              {/* Scrubber Interativo */}
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max={timeline.durationSec}
                  step="0.1"
                  value={currentSec}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setCurrentSec(val);
                    if (videoRef.current) {
                      videoRef.current.currentTime = val;
                    }
                  }}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                {/* Marcadores dos 3 Atos */}
                <div className="flex justify-between text-[9px] font-mono text-zinc-500 mt-1">
                  <span>0s: Gancho (3s)</span>
                  <span>3s: Quebra</span>
                  <span>7s: Demonstração</span>
                  <span>12s: CTA DM</span>
                  <span>15s: Fim</span>
                </div>
              </div>

              {/* Botões de Controle */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition shadow-sm"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-black" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                    title="Reiniciar Vídeo"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                    title={isMuted ? "Ativar Áudio" : "Mutar Áudio"}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono text-zinc-400 block">
                    Cena Atual: <b className="text-white">{playbackState.activeScene.actLabel}</b>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Efeito: {playbackState.activeScene.visualEffect}
                  </span>
                </div>
              </div>
            </div>

            {/* Informações da Cena Selecionada */}
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400 font-bold uppercase">Texto da Fala (Locução):</span>
                <span className="text-purple-400 font-bold">140 BPM · Tech Drill</span>
              </div>
              <p className="text-zinc-200 italic leading-relaxed">
                "{playbackState.activeScene.voiceover}"
              </p>
              <div className="pt-2 flex items-center justify-between text-[11px]">
                <span className="text-zinc-500">Som: {playbackState.activeScene.soundCue}</span>
                <span className="text-amber-400 font-bold">Gatilho: "{storyboard.triggerKeyword}"</span>
              </div>
            </div>

            {/* Telemetria de Renderização da Frota Colab T4 */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-purple-500/10 border border-amber-500/20 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-amber-300 font-bold flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  Cluster de GPUs Tesla T4 (api.v5apollo.com)
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  21 Nós Online
                </span>
              </div>
              <p className="text-zinc-400 text-[11px]">
                Renderização direta por hardware NVENC (60 FPS) e pesos quantizados MiniMax H3 INT8 em 10.09s. Custo de nuvem: R$ 0,00.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCaption}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold flex items-center gap-1.5 transition border border-zinc-700"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Legenda Copiada!" : "Copiar Legenda + Gatilho"}</span>
            </button>

            <button
              type="button"
              disabled={isExportingGpu}
              onClick={handleExportGpu}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold flex items-center gap-1.5 transition shadow-sm"
            >
              <Cpu className="w-4 h-4" />
              <span>{isExportingGpu ? "Compilando na T4..." : "Exportar MP4 na Frota T4"}</span>
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
            {onSchedulePost && (
              <button
                type="button"
                onClick={handleSchedule}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar no Calendário (:3011)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
