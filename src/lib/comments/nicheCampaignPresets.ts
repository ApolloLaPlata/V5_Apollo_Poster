/**
 * nicheCampaignPresets.ts - Pacotes de Campanhas de 1-Clique para Comment-to-DM
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Modelos de campanhas testados em campo, calibrados com anti-spam nativo,
 * gatilhos de alta conversão e mensagens diretas personalizadas.
 */

import { CommentRule } from "@/types/poster";

export interface NicheCampaignBlueprint {
  id: string;
  name: string;
  niche: string;
  badge: string;
  description: string;
  expectedConversion: string;
  recommendedPlatform: "instagram" | "tiktok";
  matchMode: "contains" | "exact" | "fuzzy" | "regex";
  keywords: string[];
  publicReplyVariants: string[];
  dmMessageTemplate: string;
  ctaUrl: string;
  couponCode?: string;
  sampleComment: string;
  sampleUsername: string;
}

export const NICHE_CAMPAIGN_BLUEPRINTS: NicheCampaignBlueprint[] = [
  {
    id: "finders_shopee_viral",
    name: "Achadinhos & Shopee Viral (Finders Hub)",
    niche: "E-commerce & Afiliados",
    badge: "🛒 ALTA CONVERSÃO",
    description: "Captura compradores no momento de maior intenção. Entrega cupom exclusivo e link com menor preço rastreado via UTM.",
    expectedConversion: "28% a 35% de cliques no direct",
    recommendedPlatform: "instagram",
    matchMode: "contains",
    keywords: ["QUERO", "LINK", "CUPOM", "ONDE COMPRA", "PRECO", "PREÇO", "VALOR"],
    publicReplyVariants: [
      "Acabei de te enviar o link com menor preço no Direct! Corre lá 🔥",
      "Prontinho! O cupom exclusivo e o link da loja já estão na sua DM 🛒",
      "Te mandei o acesso nas mensagens diretas! Aproveite antes de esgotar ⚡",
      "Enviado! Confere seu direct que o desconto tá liberado 👀",
      "Pronto! Dá uma olhada na sua DM pra garantir o menor valor 💸"
    ],
    dmMessageTemplate:
      "{{saudacao}}, {{nome}}! 🔥 Vi que você pediu o link nos comentários.\n\n" +
      "🛒 Link oficial com menor preço: {{ctaUrl}}\n" +
      "🎟️ Cupom de desconto exclusivo: {{cupom}}\n\n" +
      "⚠️ Dica: Esse lote costuma esgotar rápido, garanta o seu antes que o estoque acabe!",
    ctaUrl: "https://shopee.com.br/achadinhos-v5",
    couponCode: "APOLLO10",
    sampleComment: "Quero o link desse produto! Tem cupom?",
    sampleUsername: "@compradora_vip"
  },
  {
    id: "infoproduct_vsl_master",
    name: "Infoproduto & VSL Secreta (Lead Hunter)",
    niche: "Cursos & Infoprodutos",
    badge: "🚀 CAPTURA DE LEADS",
    description: "Transforma curiosidade em leads qualificados. Entrega acesso à aula secreta ou VSL e material complementar em PDF.",
    expectedConversion: "42% de taxa de abertura de aula",
    recommendedPlatform: "instagram",
    matchMode: "contains",
    keywords: ["AULA", "METODO", "MÉTODO", "CURSO", "SEGREDO", "EU QUERO", "ACESSO"],
    publicReplyVariants: [
      "Acabei de liberar seu acesso na sua DM! Assista enquanto está no ar 🚀",
      "Te mandei o link da aula secreta no direct! Aproveite o conteúdo 🧠",
      "Prontinho! Link e material de apoio enviados nas suas mensagens diretas ✨",
      "Acesso liberado! Confere sua DM pra começar agora mesmo 🔥",
      "Te enviei o link completo no direct! Depois me conta o que achou 💡"
    ],
    dmMessageTemplate:
      "Fala {{nome}}! 🚀 Vi seu comentário e acabei de liberar seu acesso exclusivo.\n\n" +
      "🎥 Assista à aula secreta completa aqui: {{ctaUrl}}\n" +
      "🔑 Código de liberação VIP: {{cupom}}\n\n" +
      "💡 Recomendo assistir ainda hoje, pois essa apresentação sairá do ar ao final da semana!",
    ctaUrl: "https://v5apollo.com/aula-secreta",
    couponCode: "AULAGRATIS",
    sampleComment: "Eu quero o método completo!",
    sampleUsername: "@aluno_dedicado"
  },
  {
    id: "saas_poster_growth",
    name: "SaaS Onboarding & Teste VIP (V5 Poster)",
    niche: "SaaS & Ferramentas B2B",
    badge: "💻 TRIAL CONVERSÃO",
    description: "Atrai criadores, agências e gestores de tráfego oferecendo trial premium sem fricção e tour guiado.",
    expectedConversion: "31% de ativação de conta",
    recommendedPlatform: "instagram",
    matchMode: "contains",
    keywords: ["TESTE", "DEMO", "FERRAMENTA", "SAAS", "POSTER", "SOFTWARE", "PLATAFORMA"],
    publicReplyVariants: [
      "Acabei de despachar seu passe VIP de 7 dias na sua DM! Dá uma olhada 💻",
      "Prontinho! Link de degustação e tour da ferramenta enviados no seu direct ⚡",
      "Te mandei o acesso prioritário nas mensagens diretas! Bora escalar 🚀",
      "Enviado! Confere a DM pra ativar seu plano sem precisar de cartão 🔥",
      "Acesso liberado no direct! Qualquer dúvida estou à disposição por lá 🤝"
    ],
    dmMessageTemplate:
      "Olá {{nome}}! ⚡ Obrigado pelo interesse no {{postTitle}}.\n\n" +
      "🚀 Link para ativação do seu Trial VIP de 7 dias: {{ctaUrl}}\n" +
      "🎁 Cupom de ativação sem cartão: {{cupom}}\n\n" +
      "Se precisar de ajuda com a configuração inicial dos seus canais, me responda por aqui!",
    ctaUrl: "https://poster.v5apollo.com/trial",
    couponCode: "V5TRIAL7D",
    sampleComment: "Quero testar essa ferramenta!",
    sampleUsername: "@growth_agency"
  },
  {
    id: "beehiiv_newsletter_vip",
    name: "Beehiiv Newsletter & Relatório Executivo",
    niche: "Mídia & Editorial",
    badge: "📰 SUBSCRIBER GROWTH",
    description: "Nutre audiência e constrói lista própria de e-mails entregando o artigo integral e edição especial da newsletter.",
    expectedConversion: "45% de conversão em assinantes",
    recommendedPlatform: "instagram",
    matchMode: "contains",
    keywords: ["NEWS", "COLMEIA", "ARTIGO", "EDICAO", "EDIÇÃO", "EMAIL", "E-MAIL", "INSCRICAO"],
    publicReplyVariants: [
      "Te mandei a edição na íntegra no seu Direct! Boa leitura 📖",
      "Acabei de despachar o artigo completo na sua DM! Confere lá 👀",
      "Prontinho! Link de leitura e download enviados nas mensagens diretas ✨",
      "Enviado! O briefing exclusivo da semana já está te esperando na DM 📰",
      "Te mandei o acesso ao artigo no direct! Aproveite os insights 💡"
    ],
    dmMessageTemplate:
      "Olá {{nome}}! 📰 Aqui está a edição exclusiva da Colmeia que você pediu:\n\n" +
      "📖 Ler edição completa online: {{ctaUrl}}\n" +
      "🏆 Passe VIP de leitor: {{cupom}}\n\n" +
      "Toda semana publicamos relatórios inéditos sem ruído. Bom proveito!",
    ctaUrl: "https://newsletter.v5apollo.com/join",
    couponCode: "COLMEIA_VIP",
    sampleComment: "Manda a news dessa semana no direct!",
    sampleUsername: "@leitor_estrategico"
  }
];
