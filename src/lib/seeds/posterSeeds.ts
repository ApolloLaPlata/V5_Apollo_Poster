import { 
  ScheduledPost, 
  NewsletterIssue, 
  CommentRule, 
  GroupBroadcastDeal, 
  DispatchLogEntry 
} from "@/types/poster";

export const SEED_POSTS: ScheduledPost[] = [
  {
    id: "post-seed-1",
    title: "5 Segredos de IA que a Grande Mídia Não Te Conta",
    content: "Neste vídeo revelamos as ferramentas gratuitas que estão substituindo tarefas manuais de 10 horas em 2026. Link na bio e comentário LINK!",
    platforms: ["instagram", "tiktok", "youtube"],
    scheduledAt: "2026-10-28T14:00:00",
    status: "scheduled",
    mediaType: "video",
    mediaUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
    tags: ["IA", "Produtividade", "Shorts"],
    createdAt: "2026-10-26T10:00:00",
    updatedAt: "2026-10-26T10:00:00"
  },
  {
    id: "post-seed-2",
    title: "Relatório de Mercado: O Futuro dos Blogs Programáticos",
    content: "Como indexar 1.000 artigos com E-E-A-T em 30 dias sem sofrer penalização de spam com o motor do V5 AutoBlog.",
    platforms: ["autoblog", "wordpress", "newsletter"],
    scheduledAt: "2026-10-29T10:00:00",
    status: "scheduled",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    tags: ["SEO", "AutoBlog", "Newsletter"],
    createdAt: "2026-10-26T11:00:00",
    updatedAt: "2026-10-26T11:00:00"
  },
  {
    id: "post-seed-3",
    title: "Drop Exclusivo: Teclado Mecânico Magnético 60%",
    content: "Cupom relâmpago de 45% OFF liberado só para os membros do grupo VIP! Link na bio com desconto aplicado.",
    platforms: ["whatsapp", "telegram", "instagram"],
    scheduledAt: "2026-10-27T18:30:00",
    status: "published",
    publishedAt: "2026-10-27T18:30:00",
    mediaType: "image",
    tags: ["Achadinhos", "Cupom", "VIP"],
    createdAt: "2026-10-26T12:00:00",
    updatedAt: "2026-10-27T18:30:00"
  },
  {
    id: "post-seed-4",
    title: "Guia Definitivo: Automação Onicanal sem Extensões",
    content: "Por que APIs nativas em nuvem derrotaram as extensões frágeis de navegador no ecossistema de marketing moderno.",
    platforms: ["autoblog", "newsletter", "threads"],
    scheduledAt: "2026-11-01T09:00:00",
    status: "scheduled",
    mediaType: "text",
    tags: ["Infraestrutura", "APIs", "Holding"],
    createdAt: "2026-10-27T08:00:00",
    updatedAt: "2026-10-27T08:00:00"
  },
  {
    id: "post-seed-5",
    title: "Review Viral: Mouse Ultraleve Sem Fio 49g",
    content: "Testamos o mouse com sensor PixArt 3395 que virou febre no TikTok e Shopee. Confira o teste de clique!",
    platforms: ["tiktok", "kwai", "instagram"],
    scheduledAt: "2026-11-03T17:00:00",
    status: "draft",
    mediaType: "video",
    tags: ["Tech", "Gamer", "Achadinho"],
    createdAt: "2026-10-27T09:00:00",
    updatedAt: "2026-10-27T09:00:00"
  }
];

export const SEED_NEWSLETTERS: NewsletterIssue[] = [
  {
    id: "issue-seed-1",
    subject: "A Revolução Silenciosa dos Agentes Autônomos em 2026",
    previewText: "Descubra como os novos modelos estão operando tarefas de 48h sem intervenção humana...",
    contentMarkdown: `# A Revolução Silenciosa dos Agentes Autônomos em 2026

Olá! Se você acompanha tecnologia, provavelmente já percebeu que o jogo mudou.
Não estamos mais falando apenas de prompts de chat. Estamos falando de ecossistemas inteiros de agentes cooperando em tempo real.

### Os 3 Pilares do Novo Fluxo:
1. **Memória Contínua (RAG Local):** Nunca recomeçar do zero.
2. **Despacho Onicanal Nativo:** Escrever uma vez e publicar em múltiplos destinos.
3. **Micro-serviços Desacoplados:** Cada robô com seu propósito único.

> *"A produtividade não é fazer mais coisas, é eliminar o atrito entre a ideia e a distribuição."*

Nos vemos na próxima edição!`,
    targetAudience: "all",
    sendAt: "2026-10-30T09:00:00",
    status: "draft",
    openRateEstimated: 44.5,
    clickRateEstimated: 12.8,
    createdAt: "2026-10-27T00:00:00"
  }
];

export const SEED_RULES: CommentRule[] = [
  {
    id: "rule-seed-1",
    name: "Automação Reel Achadinhos Tech",
    platform: "instagram",
    targetPostId: "reel_748291038",
    keywords: ["EU QUERO", "QUERO", "LINK", "ONDE COMPRA"],
    publicReplyVariants: [
      "Acabei de te enviar no direct com o melhor preço! 🔥",
      "Confere seu direct, mandei o link com desconto exclusivo! 🚀",
      "Te mandei na mensagem direta! Dá uma olhada lá 👀"
    ],
    dmMessageTemplate: "Olá! Vi que você comentou no nosso Reel sobre o Teclado Mecânico. Aqui está o link com 45% OFF: {{ctaUrl}}",
    ctaUrl: "https://v5finders.com/deal/teclado-mecanico-pro?utm_source=ig_comment_dm",
    isActive: true,
    totalTriggered: 142
  },
  {
    id: "rule-seed-2",
    name: "Captação Lead TikTok Tools",
    platform: "tiktok",
    targetPostId: "video_99281726",
    keywords: ["PLANILHA", "TOOL", "GRATIS"],
    publicReplyVariants: [
      "Mandei no privado o acesso liberado! ⚡",
      "Link enviado na sua DM! Aproveita!"
    ],
    dmMessageTemplate: "Aqui está o acesso gratuito à ferramenta de IA mencionada no vídeo: {{ctaUrl}}",
    ctaUrl: "https://v5tools.com/hub?utm_source=tiktok_dm",
    isActive: true,
    totalTriggered: 89
  }
];

export const SEED_DEALS: GroupBroadcastDeal[] = [
  {
    id: "deal-seed-1",
    productName: "Monitor Gamer Curvo 27\" 165Hz 1ms IPS",
    store: "Shopee",
    originalPrice: 1299.90,
    promoPrice: 749.00,
    discountPercentage: 42,
    savingsAmount: 550.90,
    couponCode: "APOLLO40",
    affiliateUrl: "https://shope.ee/v5_curvo_27?utm_source=v5poster_vip",
    targetChannels: ["whatsapp", "telegram"],
    scheduledTime: "12:30",
    status: "pending",
    totalClicks: 214
  },
  {
    id: "deal-seed-2",
    productName: "Air Fryer Digital 5.5L Aço Inox Touch",
    store: "Mercado Livre",
    originalPrice: 489.00,
    promoPrice: 289.90,
    discountPercentage: 40,
    savingsAmount: 199.10,
    couponCode: "CUPOM20",
    affiliateUrl: "https://mercadolivre.com.br/sec/airfryer?utm_source=v5poster_vip",
    targetChannels: ["telegram"],
    scheduledTime: "16:00",
    status: "pending",
    totalClicks: 168
  },
  {
    id: "deal-seed-3",
    productName: "Robô Aspirador Inteligente com Mop & Laser",
    store: "AliExpress",
    originalPrice: 1890.00,
    promoPrice: 890.00,
    discountPercentage: 53,
    savingsAmount: 1000.00,
    couponCode: "BRAZIL100",
    affiliateUrl: "https://aliexpress.com/item/robo_v5?utm_source=v5poster_vip",
    targetChannels: ["whatsapp", "telegram"],
    scheduledTime: "20:00",
    status: "sent",
    totalClicks: 382
  }
];
