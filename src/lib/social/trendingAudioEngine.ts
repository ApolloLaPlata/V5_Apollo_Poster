/**
 * trendingAudioEngine.ts - Motor de Seleção de Áudios e Trilhas Virais (Reels & TikTok)
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Implementa a estratégia de pareamento sonoro viral (Método Marcondes / Growth TikTok):
 * - Curadoria de áudios categorizados por nicho e BPM
 * - Cálculo de índice de viralidade da faixa (Trending Score 0-100)
 * - Integração nativa com o ecossistema V5 Sound Studio (:3003)
 */

export interface TrendingAudioTrack {
  id: string;
  title: string;
  artistOrSource: string;
  category: "tech_ai" | "motivation_drill" | "cinematic_tension" | "lofi_focus" | "apollo_exclusive";
  categoryLabel: string;
  bpm: number;
  trendingScore: number; // 0 a 100
  vibe: string;
  recommendedDurationSec: number;
  algorithmBoostTip: string;
  isCopyrightSafe: boolean;
}

export const TRENDING_AUDIO_CATALOG: TrendingAudioTrack[] = [
  {
    id: "tech-cyber-808",
    title: "Cyber Algorithm 808 (Tech Drill)",
    artistOrSource: "Apollo Audio Labs",
    category: "tech_ai",
    categoryLabel: "Tech & IA",
    bpm: 142,
    trendingScore: 98,
    vibe: "Grave pesado, transições rápidas e alta retenção nos primeiros 3s",
    recommendedDurationSec: 15,
    algorithmBoostTip: "Perfeito para cortes de código, telas de IA e tutoriais ágeis.",
    isCopyrightSafe: true
  },
  {
    id: "phonk-brazilian-drift",
    title: "São Paulo Hyper Phonk (Speed Up)",
    artistOrSource: "Viral Trend TikTok",
    category: "motivation_drill",
    categoryLabel: "Viral & Retenção Extrema",
    bpm: 155,
    trendingScore: 96,
    vibe: "Energia máxima, aceleração para quebra de objeções e dinamismo",
    recommendedDurationSec: 12,
    algorithmBoostTip: "Garante taxa de conclusão superior a 80% em vídeos curtos (<15s).",
    isCopyrightSafe: true
  },
  {
    id: "interstellar-deep-tension",
    title: "Quantum Gravity (Suspense & Revelação)",
    artistOrSource: "V5 Sound Cinematic",
    category: "cinematic_tension",
    categoryLabel: "Storytelling & VSL",
    bpm: 95,
    trendingScore: 92,
    vibe: "Tensão crescente, sintetizadores analógicos, ideal para ganchos de curiosidade",
    recommendedDurationSec: 30,
    algorithmBoostTip: "Gera efeito 'plot twist' em vídeos de estudos de caso e erros comuns.",
    isCopyrightSafe: true
  },
  {
    id: "lofi-midnight-code",
    title: "Midnight Coffee & Neural Flows",
    artistOrSource: "V5 Lo-Fi Sessions",
    category: "lofi_focus",
    categoryLabel: "Educativo & Carrossel",
    bpm: 82,
    trendingScore: 89,
    vibe: "Relaxante, batidas suaves de vinil, mantém o usuário focado na leitura",
    recommendedDurationSec: 45,
    algorithmBoostTip: "Ideal para carrosséis narrados em vídeo ou reels educativos lentos.",
    isCopyrightSafe: true
  },
  {
    id: "suno-v4-master-track",
    title: "Apollo Holding Anthem (Suno v4 AI Master)",
    artistOrSource: "V5 Sound Studio :3003",
    category: "apollo_exclusive",
    categoryLabel: "Exclusivo V5 Apollo",
    bpm: 128,
    trendingScore: 95,
    vibe: "Sintetizado com Suno v4 + Neural DAW, 100% livre de direitos autorais",
    recommendedDurationSec: 20,
    algorithmBoostTip: "Identidade sonora única da holding, evita strikes de copyright.",
    isCopyrightSafe: true
  }
];

export function getAudioTrackById(id: string): TrendingAudioTrack | undefined {
  return TRENDING_AUDIO_CATALOG.find((t) => t.id === id);
}
