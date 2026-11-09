/**
 * remotionPreviewEngine.ts - Motor de Pré-Visualização Remotion & MiniMax H3 (9:16)
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Integração baseada nas diretrizes do Pulso #245 (Remotion / HyperFrames) e Pulso #237 (MiniMax H3 Colab T4).
 * Permite reproduzir previews animados em tempo real no navegador com:
 * - Legendas cinéticas estilo Hormozi (palavras sincronizadas em amarelo)
 * - Transições dinâmicas de 3 Atos (Gancho 0-3s, Quebras 3-12s, Fechamento Comment-to-DM 12-15s)
 * - Alternância entre simulador procedural Remotion e render real MiniMax H3 da Frota T4
 */

import { VideoStoryboard, StoryboardScene } from "@/lib/social/videoStoryboardEngine";

export type VisualEffectType = "zoom_in" | "screen_shake" | "broll_fastcut" | "cta_bounce";

export interface KineticWord {
  word: string;
  startSec: number;
  endSec: number;
  isKeyword?: boolean;
}

export interface RemotionTimelineScene {
  sceneIndex: number;
  actType: "hook" | "break_fast" | "proof" | "cta_dm";
  actLabel: string;
  timeRange: string;
  startSec: number;
  endSec: number;
  headline: string;
  voiceover: string;
  visualEffect: VisualEffectType;
  bgGradient: string;
  kineticWords: KineticWord[];
  soundCue: string;
}

export interface RemotionVideoTimeline {
  id: string;
  topic: string;
  durationSec: number;
  fps: number;
  aspectRatio: "9:16";
  width: number;
  height: number;
  scenes: RemotionTimelineScene[];
  audioTrackId: string;
  triggerKeyword: string;
  cloudSampleMp4Url: string;
}

/**
 * URL oficial homologada no Pulso #237 gerada na Tesla T4 do Google Colab em 10.09s
 */
export const MINIMAX_H3_OFFICIAL_MP4_URL =
  "https://uguylqkkzcrcvjvijhfy.supabase.co/storage/v1/object/public/apollo_media/videos/minimax_h3_9a582f20dd.mp4";

/**
 * Decompõe uma frase de fala em palavras cinéticas com tempos relativos
 */
export function buildKineticWords(text: string, startSec: number, endSec: number, triggerKeyword = "LINK"): KineticWord[] {
  const words = text.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const totalDuration = Math.max(endSec - startSec, 0.5);
  const timePerWord = totalDuration / words.length;

  return words.map((w, idx) => ({
    word: w,
    startSec: Number((startSec + idx * timePerWord).toFixed(2)),
    endSec: Number((startSec + (idx + 1) * timePerWord).toFixed(2)),
    isKeyword: w.toUpperCase() === triggerKeyword.toUpperCase()
  }));
}

/**
 * Converte um Storyboard em 3 Atos para a timeline estruturada Remotion 9:16
 */
export function buildRemotionTimeline(
  storyboard: VideoStoryboard,
  fps = 24
): RemotionVideoTimeline {
  const scenes: RemotionTimelineScene[] = storyboard.scenes.map((scene, idx) => {
    let startSec = 0;
    let endSec = 3;
    let actType: RemotionTimelineScene["actType"] = "hook";
    let visualEffect: VisualEffectType = "zoom_in";
    let bgGradient = "from-rose-950 via-zinc-950 to-black";

    if (idx === 0) {
      startSec = 0;
      endSec = 3;
      actType = "hook";
      visualEffect = "screen_shake";
      bgGradient = "from-red-950/80 via-zinc-950 to-black";
    } else if (idx === 1) {
      startSec = 3;
      endSec = 7;
      actType = "break_fast";
      visualEffect = "broll_fastcut";
      bgGradient = "from-cyan-950/70 via-zinc-950 to-black";
    } else if (idx === 2) {
      startSec = 7;
      endSec = 12;
      actType = "proof";
      visualEffect = "zoom_in";
      bgGradient = "from-purple-950/70 via-zinc-950 to-black";
    } else {
      startSec = 12;
      endSec = storyboard.durationSec;
      actType = "cta_dm";
      visualEffect = "cta_bounce";
      bgGradient = "from-amber-950/80 via-zinc-950 to-black";
    }

    const kineticWords = buildKineticWords(
      scene.onScreenText + " " + scene.voiceoverScript,
      startSec,
      endSec,
      storyboard.triggerKeyword
    );

    return {
      sceneIndex: idx + 1,
      actType,
      actLabel: scene.actName,
      timeRange: scene.timeRange,
      startSec,
      endSec,
      headline: scene.onScreenText,
      voiceover: scene.voiceoverScript,
      visualEffect,
      bgGradient,
      kineticWords,
      soundCue: scene.soundCue
    };
  });

  return {
    id: `remotion_${storyboard.id}`,
    topic: storyboard.topic,
    durationSec: storyboard.durationSec,
    fps,
    aspectRatio: "9:16",
    width: 1080,
    height: 1920,
    scenes,
    audioTrackId: storyboard.audioTrack?.id || "tech-cyber-808",
    triggerKeyword: storyboard.triggerKeyword,
    cloudSampleMp4Url: MINIMAX_H3_OFFICIAL_MP4_URL
  };
}

/**
 * Calcula o estado exato de renderização em um dado segundo (0.0s a durationSec)
 */
export function getPlaybackState(timeline: RemotionVideoTimeline, currentSec: number) {
  const boundedSec = Math.max(0, Math.min(currentSec, timeline.durationSec));
  const activeScene =
    timeline.scenes.find((s) => boundedSec >= s.startSec && boundedSec < s.endSec) ||
    timeline.scenes[timeline.scenes.length - 1];

  const currentWord = activeScene.kineticWords.find(
    (w) => boundedSec >= w.startSec && boundedSec <= w.endSec
  );

  const progressPct = Number(((boundedSec / timeline.durationSec) * 100).toFixed(1));
  const isHookZone = boundedSec < 3.0; // Primeiros 3 segundos críticos
  const isCtaZone = boundedSec >= 12.0;

  return {
    currentSec: Number(boundedSec.toFixed(2)),
    activeScene,
    currentWord,
    progressPct,
    isHookZone,
    isCtaZone,
    retentionBenchmark: isHookZone ? "🚨 ZONA DE RETENÇÃO 3s (Gancho Visceral)" : "✅ USUÁRIO RETIDO (Aprofundamento)"
  };
}
