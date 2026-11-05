/**
 * omnichannelRepurposer.ts - Motor de Repurposing 1-para-Muitos da Holding V5
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Transforma uma ideia bruta, artigo de blog ou tema central em 5 variações nativas:
 * 1. Instagram (Carrossel / Legenda com Gatilho Comment-to-DM)
 * 2. TikTok / Reels (Roteiro em 3 Cenas com Áudio e B-Roll)
 * 3. LinkedIn (Artigo de Liderança de Pensamento / Framework)
 * 4. Twitter / X (Thread encadeada em 4 tweets com trava de 280 caracteres)
 * 5. WhatsApp / Telegram VIP (Mensagem escaneável com negrito e link UTM)
 */

export type RepurposingTone = "viral_aggressive" | "educational_step" | "storytelling_pain" | "offer_urgency";

export interface ChannelRepurposedContent {
  channel: "instagram" | "tiktok" | "linkedin" | "twitter" | "whatsapp";
  channelLabel: string;
  badge: string;
  title: string;
  formattedText: string;
  characterCount: number;
  maxRecommendedChars: number;
  hashtags: string[];
  ctaType: string;
  notes: string;
  extraMeta?: {
    tweets?: string[];
    videoScenes?: Array<{ scene: string; duration: string; visual: string; speech: string }>;
  };
}

export interface OmnichannelRepurposedDeck {
  originalTopic: string;
  tone: RepurposingTone;
  generatedAt: string;
  channels: Record<string, ChannelRepurposedContent>;
}

export const TONE_LABELS: Record<RepurposingTone, { label: string; desc: string }> = {
  viral_aggressive: {
    label: "Agressivo & Quebra de Padrão",
    desc: "Foco em choque de realidade, antipatterns e retenção extrema nos primeiros 3 segundos."
  },
  educational_step: {
    label: "Educativo & Passo a Passo",
    desc: "Framework estruturado, listas práticas e alto valor percebido para salvamentos."
  },
  storytelling_pain: {
    label: "Storytelling & Dor Oculta",
    desc: "Jornada do herói, erros que custaram caro e a virada de chave para identificação imediata."
  },
  offer_urgency: {
    label: "Oferta & Urgência de Compra",
    desc: "Chamadas diretas com cupons, benefício imediato e gatilho de escassez."
  }
};

/**
 * Função utilitária para higienização e extração de tópicos essenciais
 */
function extractCoreInsights(rawText: string): string[] {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));

  const bullets = lines.filter((l) => /^[-•*]|\d+\./.test(l));
  if (bullets.length >= 3) {
    return bullets.map((b) => b.replace(/^[-•*]|\d+\.\s*/, "").trim());
  }

  // Fallback: se não tiver bullet points, quebra em frases
  return lines.slice(0, 4);
}

/**
 * Gera o baralho completo de 5 formatos onicanais a partir de um tópico mestre
 */
export function repurposeOmnichannelContent(
  topicTitle: string,
  rawBody: string,
  tone: RepurposingTone = "educational_step",
  targetKeyword: string = "LINK",
  customUrl: string = "https://v5apollo.com/hub"
): OmnichannelRepurposedDeck {
  const cleanTitle = topicTitle.trim() || "5 Ferramentas de IA para Escalar seu Negócio";
  const insights = extractCoreInsights(rawBody);
  const sampleInsights = insights.length >= 3 ? insights : [
    "Automatização de processos repetitivos sem código",
    "Geração de criativos e copys com alta conversão",
    "Distribuição onicanal simultânea para 7 redes sociais"
  ];

  // 1. INSTAGRAM (Carrossel / Legenda com Gatilho DM)
  const igHook = tone === "viral_aggressive"
    ? `🚨 PARE DE PERDER TEMPO COM: ${cleanTitle}`
    : `🎠 O Passo a Passo Definitivo: ${cleanTitle}`;

  const igBullets = sampleInsights.map((pt, i) => `📍 Passo ${i + 1}: ${pt}`).join("\n");
  const igText =
    `${igHook}\n\n` +
    `A maioria das pessoas faz do jeito difícil. Se você quer o caminho mais rápido, salve este post e siga estes passos:\n\n` +
    `${igBullets}\n\n` +
    `💬 Comente "${targetKeyword}" aqui embaixo e eu te mando o playbook completo no Direct!\n\n` +
    `#V5Apollo #InteligenciaArtificial #Produtividade #Tech2026 #MarketingDigital`;

  const instagram: ChannelRepurposedContent = {
    channel: "instagram",
    channelLabel: "Instagram (Feed / Carrossel)",
    badge: "📸 FEED & CARROSSEL",
    title: igHook,
    formattedText: igText,
    characterCount: igText.length,
    maxRecommendedChars: 2200,
    hashtags: ["#V5Apollo", "#InteligenciaArtificial", "#Produtividade", "#Tech2026", "#MarketingDigital"],
    ctaType: `Comment-to-DM ("${targetKeyword}")`,
    notes: "Otimizado para salvar post e gerar avalanche de comentários no Direct."
  };

  // 2. TIKTOK / REELS (Roteiro em 3 Cenas)
  const ttHook = tone === "viral_aggressive"
    ? `Se você ainda faz isso manualmente em 2026, você tá jogando dinheiro no lixo.`
    : `Eu testei dezenas de métodos e só esse funcionou para ${cleanTitle.toLowerCase()}.`;

  const scenes = [
    {
      scene: "Ato 1 (0-3s) - O Gancho",
      duration: "3s",
      visual: "Olhar fixo para a câmera, corte rápido em zoom digital, texto gigante na tela.",
      speech: `${ttHook}`
    },
    {
      scene: "Ato 2 (3-12s) - A Quebra",
      duration: "9s",
      visual: "B-Roll da tela mostrando a automação rodando em alta velocidade, cortes a cada 2s.",
      speech: `O segredo tá em três pilares: primeiro, ${sampleInsights[0] || "automação de ponta"}. Segundo, ${sampleInsights[1] || "eliminação de ruído"}. E terceiro, consistência.`
    },
    {
      scene: "Ato 3 (12-15s) - O CTA",
      duration: "3s",
      visual: "Aponta para baixo, seta vermelha pulsando apontando para os comentários.",
      speech: `Comenta "${targetKeyword}" aqui que eu te mando o link direto no seu direct agora!`
    }
  ];

  const ttScript =
    `🎬 ROTEIRO TIKTOK & REELS (15s):\n\n` +
    scenes
      .map(
        (s) =>
          `[${s.scene} | ${s.duration}]\n` +
          `👁️ VISUAL: ${s.visual}\n` +
          `🗣️ FALA: "${s.speech}"`
      )
      .join("\n\n") +
    `\n\n📌 Áudio Recomendado: Trending Phonk / Minimal Tech (128 BPM)\n` +
    `#ShortsViral #TechTok #Produtividade #V5Apollo`;

  const tiktok: ChannelRepurposedContent = {
    channel: "tiktok",
    channelLabel: "TikTok / Reels (Vídeo Curto)",
    badge: "🎬 VÍDEO VERTICAL (9:16)",
    title: ttHook,
    formattedText: ttScript,
    characterCount: ttScript.length,
    maxRecommendedChars: 1500,
    hashtags: ["#ShortsViral", "#TechTok", "#Produtividade", "#V5Apollo"],
    ctaType: `Fala + Seta ("${targetKeyword}")`,
    notes: "Roteiro calibrado para máxima retenção de 100% até o segundo 12.",
    extraMeta: { videoScenes: scenes }
  };

  // 3. LINKEDIN (Artigo / Document Post)
  const liHook = `Existe um erro invisível que a maioria dos profissionais ainda comete ao lidar com ${cleanTitle.toLowerCase()}.`;
  const liText =
    `${liHook}\n\n` +
    `Nas últimas semanas, estudei como as operações mais eficientes do mercado estão estruturando seus processos. Aqui estão os 3 aprendizados fundamentais:\n\n` +
    `1. ${sampleInsights[0] || "Eficiência Operacional"}\n` +
    `Automatizar antes de validar é um erro, mas validar e não automatizar é negligência competitiva.\n\n` +
    `2. ${sampleInsights[1] || "Foco em Distribuição Onicanal"}\n` +
    `Ter um produto excelente sem um motor de distribuição coordenado não gera tração sustentável.\n\n` +
    `3. ${sampleInsights[2] || "Soberania de Dados e IA"}\n` +
    `Ferramentas sem arquitetura própria criam dependências frágeis. Infraestrutura própria cria ativos duradouros.\n\n` +
    `---\n\n` +
    `💡 Como a sua equipe tem encarado essa transição?\n` +
    `Deixe sua perspectiva nos comentários abaixo. Vamos debater.\n\n` +
    `🔗 Conheça o ecossistema V5: ${customUrl}?utm_source=linkedin&utm_medium=thought_leadership`;

  const linkedin: ChannelRepurposedContent = {
    channel: "linkedin",
    channelLabel: "LinkedIn (Post de Autoridade)",
    badge: "💼 THOUGHT LEADERSHIP",
    title: liHook,
    formattedText: liText,
    characterCount: liText.length,
    maxRecommendedChars: 3000,
    hashtags: ["#Inovacao", "#Lideranca", "#InteligenciaArtificial", "#Produtividade"],
    ctaType: "Pergunta Aberta para Debate",
    notes: "Tom profissional, parágrafos curtos para leitura limpa no feed e formato ideal para PDF Carousel."
  };

  // 4. TWITTER / X (Thread em 4 Tweets com limite de 280 caracteres)
  const t1 = `1/4 🧵 ${cleanTitle}\n\nA maioria continua fazendo isso do jeito mais lento. Se você quer economizar horas por semana, preste atenção neste fio curto 👇`.slice(0, 275);
  const t2 = `2/4 📌 O maior gargalo:\n\n${sampleInsights[0] || "Tarefas manuais e repetitivas"}.\n\nQuando você elimina a fricção, a velocidade da operação multiplica por 10x sem aumentar o time.`.slice(0, 275);
  const t3 = `3/4 ⚡ A solução prática:\n\n• ${sampleInsights[1] || "Automação via nuvem"}\n• ${sampleInsights[2] || "Distribuição contínua"}\n\nMenos reuniões, mais esteira automática rodando em background.`.slice(0, 275);
  const t4 = `4/4 🚀 Se este fio foi útil:\n\n1. Curta e dê RT no primeiro tweet para ajudar outros criadores.\n2. Acesse o guia completo aqui: ${customUrl}?utm_source=twitter&utm_medium=thread`.slice(0, 275);

  const tweets = [t1, t2, t3, t4];
  const twitterText = tweets.join("\n\n-------------------------\n\n");

  const twitter: ChannelRepurposedContent = {
    channel: "twitter",
    channelLabel: "Twitter / X (Fio / Thread)",
    badge: "🐦 THREAD (4 TWEETS)",
    title: `Thread: ${cleanTitle}`,
    formattedText: twitterText,
    characterCount: twitterText.length,
    maxRecommendedChars: 1200,
    hashtags: ["#IA", "#BuildInPublic", "#Produtividade"],
    ctaType: "RT + Link Curto com UTM",
    notes: "Cada tweet calibrado rigorosamente abaixo de 280 caracteres.",
    extraMeta: { tweets }
  };

  // 5. WHATSAPP / TELEGRAM VIP (Finders Hub)
  const waText =
    `🔥 *ALERTA VIP DA COMUNIDADE V5*\n\n` +
    `⚡ *${cleanTitle.toUpperCase()}*\n\n` +
    `Fala pessoal! Preparamos um resumo executivo com os principais pontos práticos:\n\n` +
    sampleInsights.map((pt) => `✅ ${pt}`).join("\n") +
    `\n\n` +
    `📲 *Acesse o material na íntegra:*\n` +
    `👉 ${customUrl}?utm_source=whatsapp_vip&utm_medium=community_broadcast\n\n` +
    `_Compartilhe esse aviso com quem precisa dessa dica hoje!_`;

  const whatsapp: ChannelRepurposedContent = {
    channel: "whatsapp",
    channelLabel: "WhatsApp & Telegram VIP",
    badge: "💬 MENSAGEM ESCANEÁVEL",
    title: `Alerta VIP: ${cleanTitle}`,
    formattedText: waText,
    characterCount: waText.length,
    maxRecommendedChars: 1024,
    hashtags: [],
    ctaType: "Link Direto com UTM Encurtado",
    notes: "Formatado com negrito oficial de mensageria (*palavra*) e itálico (_frase_)."
  };

  return {
    originalTopic: cleanTitle,
    tone,
    generatedAt: new Date().toISOString(),
    channels: {
      instagram,
      tiktok,
      linkedin,
      twitter,
      whatsapp
    }
  };
}
