/**
 * videoStoryboardEngine.ts - Gerador de Roteiro e Storyboard em 3 Atos (Reels & TikTok)
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Implementa a metodologia de alta retenção de vídeos curtos (Método Marcondes / Growth TikTok):
 * - Ato 1: Gancho Visceral (0s - 3s) -> Impede o scroll nos primeiros 3 segundos
 * - Ato 2: Entrega Rápida & Demonstração (3s - 12s) -> Cortes a cada 2.5s para reter a atenção
 * - Ato 3: Conversão Comment-to-DM (12s - 15s) -> Força comentário para disparo automático
 */

import { TrendingAudioTrack, getAudioTrackById } from "./trendingAudioEngine";

export type VideoDurationPreset = 15 | 30 | 60;

export interface StoryboardScene {
  sceneNumber: number;
  timeRange: string;
  actName: "Ato 1: O Gancho" | "Ato 2: A Quebra" | "Ato 3: O Fechamento";
  onScreenText: string;
  voiceoverScript: string;
  visualDirection: string;
  soundCue: string;
  aiPromptSnippet: string;
}

export interface VideoStoryboard {
  id: string;
  topic: string;
  durationSec: VideoDurationPreset;
  targetPlatform: "instagram_reels" | "tiktok" | "youtube_shorts";
  triggerKeyword: string;
  audioTrack?: TrendingAudioTrack;
  scenes: StoryboardScene[];
  fullVoiceover: string;
  totalScenes: number;
  aiGenerationInstructions: string;
}

/**
 * Gera um Storyboard em 3 Atos otimizado para o algoritmo do Instagram Reels e TikTok
 */
export function generateVideoStoryboard(
  topicTitle: string,
  triggerKeyword = "LINK",
  durationSec: VideoDurationPreset = 15,
  audioTrackId = "tech-cyber-808"
): VideoStoryboard {
  const cleanTopic = topicTitle || "Inteligência Artificial e Automação";
  const audioTrack = getAudioTrackById(audioTrackId);

  const scenes: StoryboardScene[] = [
    {
      sceneNumber: 1,
      timeRange: "0s - 3s",
      actName: "Ato 1: O Gancho",
      onScreenText: `PARE DE PERDER TEMPO COM ${cleanTopic.toUpperCase()}! 🚨`,
      voiceoverScript: `Se você ainda perde horas fazendo ${cleanTopic} manualmente, você tá jogando dinheiro fora.`,
      visualDirection: "Corte seco em close-up rápido com efeito de tremor suave (screen shake). O apresentador ou tela com alerta visual em vermelho e amarelo.",
      soundCue: `${audioTrack?.title || "Tech Drill"} — Entrada súbita da batida no segundo 0.5s sem introdução lenta.`,
      aiPromptSnippet: `Fast-paced dynamic close-up of a high-tech studio workspace, cinematic red-orange rim lighting, subtle motion blur, 8k resolution, photorealistic.`
    },
    {
      sceneNumber: 2,
      timeRange: "3s - 7s",
      actName: "Ato 2: A Quebra",
      onScreenText: "O SEGREDO QUE NINGUÉM TE MOSTRA 👇",
      voiceoverScript: "A gente substituiu esse processo inteiro por um agente autônomo que roda 24 horas por dia de graça.",
      visualDirection: "Corte B-roll para gravação de tela acelerada (2x) mostrando automação disparando fluxos com sucesso sem intervenção humana.",
      soundCue: "Batida constante e limpa, efeito sonoro de 'whoosh' na transição rápida.",
      aiPromptSnippet: `Futuristic dashboard HUD with glowing cyber graphs, data streams, sleek dark obsidian UI, hyperdetailed, octane render.`
    },
    {
      sceneNumber: 3,
      timeRange: "7s - 12s",
      actName: "Ato 2: A Quebra",
      onScreenText: "3 CLICKS PARA ATIVAR HOJE ⚡",
      voiceoverScript: "O resultado? Produção 10 vezes mais rápida e custo praticamente zero na nossa operação.",
      visualDirection: "Demonstração do resultado final: gráficos subindo, notificações de vendas ou postagens ativas no feed simultâneo.",
      soundCue: "Aceleração do ritmo sonoro antes da queda de fechamento.",
      aiPromptSnippet: `Macro shot of glowing smartphone screen receiving incoming successful automated transactions and live analytics, neon lighting.`
    },
    {
      sceneNumber: 4,
      timeRange: "12s - 15s",
      actName: "Ato 3: O Fechamento",
      onScreenText: `COMENTE "${triggerKeyword.toUpperCase()}" NO FEED! 💬`,
      voiceoverScript: `Comenta a palavra "${triggerKeyword}" aqui embaixo que o meu assistente vai te mandar o passo a passo completo no seu Direct agora mesmo!`,
      visualDirection: "Apresentador ou animação com seta animada piscando em direção aos comentários. Efeito de pop-up mostrando a DM abrindo.",
      soundCue: "Efeito sonoro de 'notification ding' no momento exato em que a palavra-chave é dita.",
      aiPromptSnippet: `Sleek animated 3D arrow pointing downwards to comment icon, glowing neon cyan and amber, clean minimalist background.`
    }
  ];

  const fullVoiceover = scenes.map((s) => s.voiceoverScript).join(" ");

  const aiGenerationInstructions =
    `DIRETRIZ DE GERAÇÃO PARA V5 APOLLO STUDIO (:3004):\n` +
    `- Duração: ${durationSec} segundos (Formato Vertical 9:16 - 1080x1920)\n` +
    `- Trilha Sonora: ${audioTrack?.title || "Original"} (${audioTrack?.bpm || 140} BPM)\n` +
    `- Legendas: Padrão Hormozi com 2 palavras por frame e destaque em amarelo\n` +
    `- Chamada de Ação: Comment-to-DM com gatilho "${triggerKeyword.toUpperCase()}"`;

  return {
    id: `sb_${Date.now()}`,
    topic: cleanTopic,
    durationSec,
    targetPlatform: "instagram_reels",
    triggerKeyword: triggerKeyword.toUpperCase(),
    audioTrack,
    scenes,
    fullVoiceover,
    totalScenes: scenes.length,
    aiGenerationInstructions
  };
}
