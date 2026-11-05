/**
 * viralRadarApify.ts - Radar de Viralização do Nicho & Normalizador de Engajamento
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Implementa o princípio de mineração viral inspirado no método de leitura do nicho (via Apify):
 * - Normaliza o engajamento através da fórmula: (Curtidas + (Comentários * 2)) ÷ Seguidores
 * - Evita a ilusão de vaidade: Um perfil de 5K seguidores com 1.500 curtidas (30% engajamento)
 *   é muito mais viral do que um perfil de 1M seguidores com 5.000 curtidas (0.5% engajamento).
 * - Identifica padrões de ganchos virais reais prontos para modelagem.
 */

export interface CompetitorPostMetric {
  id: string;
  handle: string;
  followers: number;
  postUrl: string;
  captionSnippet: string;
  postType: "reels" | "carousel" | "image";
  likes: number;
  comments: number;
  shares?: number;
  postedAt: string;
}

export interface AnalyzedViralPost extends CompetitorPostMetric {
  rawEngagement: number; // likes + comments
  likeToFollowerRatio: number; // (likes / followers) * 100
  weightedViralScore: number; // ((likes + comments * 2) / followers) * 100
  viralityTier: "explosive" | "high" | "standard" | "low";
  viralityBadge: string;
  takeawayInsight: string;
}

/**
 * Calcula a métrica de engajamento normalizado por seguidor
 */
export function calculateViralScore(post: CompetitorPostMetric): AnalyzedViralPost {
  const followersSafe = Math.max(1, post.followers);
  const rawEngagement = post.likes + post.comments;
  const likeToFollowerRatio = Number(((post.likes / followersSafe) * 100).toFixed(2));
  const weightedViralScore = Number((((post.likes + (post.comments * 2)) / followersSafe) * 100).toFixed(2));

  let viralityTier: "explosive" | "high" | "standard" | "low" = "standard";
  let viralityBadge = "Normal (1-3%)";
  let takeawayInsight = "Performance alinhada com a média orgânica.";

  if (weightedViralScore >= 12.0) {
    viralityTier = "explosive";
    viralityBadge = "🔥 Explosivo (>12%)";
    takeawayInsight = "Post furou a bolha com engajamento absurdo em relação ao tamanho da conta! Prioridade para modelar gancho.";
  } else if (weightedViralScore >= 5.0) {
    viralityTier = "high";
    viralityBadge = "⚡ Alto Desempenho (5-12%)";
    takeawayInsight = "Excelente retenção. Formato e chamada de ação geraram resposta acima da média.";
  } else if (weightedViralScore < 1.0) {
    viralityTier = "low";
    viralityBadge = "💤 Baixa Tração (<1%)";
    takeawayInsight = "Engajamento diluído ou base com seguidores inativos.";
  }

  return {
    ...post,
    rawEngagement,
    likeToFollowerRatio,
    weightedViralScore,
    viralityTier,
    viralityBadge,
    takeawayInsight
  };
}

/**
 * Processa uma lista de postagens e retorna ordenada pelo Engajamento Real (Score Ponderado)
 */
export function rankPostsByViralEfficiency(posts: CompetitorPostMetric[]): AnalyzedViralPost[] {
  return posts
    .map(calculateViralScore)
    .sort((a, b) => b.weightedViralScore - a.weightedViralScore);
}

/**
 * Dados de amostra para demonstração instantânea do Radar de Concorrentes
 */
export const SAMPLE_COMPETITOR_RADAR_DATA: CompetitorPostMetric[] = [
  {
    id: "radar-001",
    handle: "@tech_micro_creator",
    followers: 8400,
    postUrl: "https://instagram.com/p/sample1",
    captionSnippet: "Trocaram o seu social media por 9 robôs gratuitos. Comenta INSTA que eu te mando...",
    postType: "reels",
    likes: 2450,
    comments: 1120,
    postedAt: "Há 2 dias"
  },
  {
    id: "radar-002",
    handle: "@mega_influencer_tech",
    followers: 450000,
    postUrl: "https://instagram.com/p/sample2",
    captionSnippet: "Mais um dia testando ferramentas de IA no meu setup novo incrível!",
    postType: "carousel",
    likes: 4200,
    comments: 180,
    postedAt: "Há 3 dias"
  },
  {
    id: "radar-003",
    handle: "@dev_automations",
    followers: 12500,
    postUrl: "https://instagram.com/p/sample3",
    captionSnippet: "Se você ainda perde tempo criando legendas manualmente, veja este prompt...",
    postType: "carousel",
    likes: 1890,
    comments: 430,
    postedAt: "Há 4 dias"
  },
  {
    id: "radar-004",
    handle: "@ai_curious",
    followers: 2800,
    postUrl: "https://instagram.com/p/sample4",
    captionSnippet: "5 ferramentas secretas de IA que parecem ilegais de tão boas:",
    postType: "reels",
    likes: 980,
    comments: 310,
    postedAt: "Ontem"
  }
];
