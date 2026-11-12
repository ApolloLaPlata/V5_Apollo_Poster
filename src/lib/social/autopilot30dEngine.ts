/**
 * autopilot30dEngine.ts - Motor Editorial Autopilot 30 Dias Onicanal
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Implementa o Calendário Mestre de 30 Dias (Pilar 1 do AGENTS.md):
 * - Distribui 30 publicações estratégicas ao longo de 4 semanas completas
 * - Cobertura equilibrada entre os 4 Pilares de Retenção e Monetização:
 *    1. Autoridade & Carrosséis (LinkedIn B2B + Instagram Feed 4:5)
 *    2. Vídeos Virais Curtos 3 Atos (TikTok + Reels + Shorts 9:16)
 *    3. Conversão & Cashflow (Grupos VIP WhatsApp + Telegram com Radar Finders)
 *    4. Retenção & Deep-Dive (Newsletter Beehiiv + AutoBlog SEO E-E-A-T)
 *    5. Threads de Rápida Viralização (X / Twitter + Threads < 280c)
 * - Calibração de Horários Nobres (11h30, 18h00, 20h30, 21h00)
 */

import { ScheduledPost, SocialPlatform, MediaType } from "@/types/poster";

export interface AutopilotPostBlueprint {
  dayIndex: number; // 1 a 30
  time: { hour: number; minute: number };
  title: string;
  content: string;
  platforms: SocialPlatform[];
  mediaType: MediaType;
  pillar: "Autoridade" | "Viral 9:16" | "Ofertas VIP" | "Newsletter/SEO" | "Thread X";
  tags: string[];
}

/**
 * Matriz Editorial Mestre com 30 Conteúdos Estruturados
 */
export const AUTOPILOT_30D_BLUEPRINT: AutopilotPostBlueprint[] = [
  // SEMANA 1 (Dias 1 - 7)
  {
    dayIndex: 1,
    time: { hour: 11, minute: 30 },
    title: "🎠 Carrossel: 5 Erros Fatais ao Construir Automações em 2026",
    content: "Arrasta para o lado e descubra os erros que 95% das operações cometem ao tentar escalar sem agentes autônomos.\n\n💬 Comente LINK para receber o guia completo na sua DM!",
    platforms: ["instagram", "autoblog"],
    mediaType: "carousel",
    pillar: "Autoridade",
    tags: ["Autopilot30D", "Carrossel", "Pico-Almoço", "Dia01"]
  },
  {
    dayIndex: 2,
    time: { hour: 18, minute: 0 },
    title: "⚡ Roteiro 3 Atos: 3 Ferramentas Secretas de IA que Parecem Ilegais",
    content: "Ato 1 (0-3s): Pare de pagar assinatura de IA cara!\nAto 2 (3-12s): Nós colocamos 3 modelos de código aberto rodando numa GPU T4 de graça.\nAto 3 (12-15s): Comente IA que eu te mando os links no Direct!",
    platforms: ["tiktok", "instagram", "youtube"],
    mediaType: "video",
    pillar: "Viral 9:16",
    tags: ["Autopilot30D", "Reels", "Pico-Retorno", "Dia02"]
  },
  {
    dayIndex: 3,
    time: { hour: 12, minute: 30 },
    title: "🔥 ACHADINHO VIP: Teclado Mecânico Wireless RGB Hot-Swap (52% OFF)",
    content: "Oportunidade relâmpago encontrada no radar V5 Finders!\n\n❌ De R$ 389,00\n💥 Por apenas R$ 186,72\n\nCupom exclusivo: VIPAPOLLO",
    platforms: ["whatsapp", "telegram"],
    mediaType: "image",
    pillar: "Ofertas VIP",
    tags: ["Autopilot30D", "Finders", "Oferta-Relâmpago", "Dia03"]
  },
  {
    dayIndex: 4,
    time: { hour: 20, minute: 30 },
    title: "🛠️ BASTIDORES: Como Rodamos 7 Redes Simultâneas Sem Equipe Humana",
    content: "Um estudo de caso aprofundado sobre a arquitetura da Holding V5 Apollo e o barramento do V5 Poster.\n\nArtigo completo disponível com código aberto.",
    platforms: ["autoblog", "newsletter"],
    mediaType: "image",
    pillar: "Newsletter/SEO",
    tags: ["Autopilot30D", "Bastidores", "Pico-Noturno", "Dia04"]
  },
  {
    dayIndex: 5,
    time: { hour: 17, minute: 30 },
    title: "🧵 Thread Viral: 7 Prompts Secretos para Transformar Qualquer IA em Sênior",
    content: "1/4 Pare de pedir 'escreva um texto'. Aqui estão os 7 comandos que a nossa equipe usa para extrair saídas de nível sênior em segundos.\n\n2/4 Prompt #1: Contexto Restritivo com Persona + Anti-alucinação. Defina exatamente o que a IA NÃO pode inventar.\n\n3/4 Prompt #2: Chain of Thought com auto-crítica em 2 estágios.\n\n4/4 Salve esse fio e comente 'PROMPT' para receber o vault com 50+ templates testados!",
    platforms: ["x_twitter", "threads"],
    mediaType: "text",
    pillar: "Thread X",
    tags: ["Autopilot30D", "TwitterThread", "Viral", "Dia05"]
  },
  {
    dayIndex: 6,
    time: { hour: 14, minute: 0 },
    title: "🚨 BUG DE PREÇO: Cadeira Gamer Ergonômica com 60% OFF no PIX",
    content: "Preço histórico detectado pelo bot de monitoramento! Estoque limitado aos primeiros 20 cupons.\n\nLink direto na mensagem!",
    platforms: ["whatsapp", "telegram"],
    mediaType: "image",
    pillar: "Ofertas VIP",
    tags: ["Autopilot30D", "VIP-Weekend", "Bug-Preço", "Dia06"]
  },
  {
    dayIndex: 7,
    time: { hour: 19, minute: 0 },
    title: "📬 EDIÇÃO #42: O Guia Definitivo dos Agentes Autônomos na Prática",
    content: "A síntese da semana para fundadores de tecnologia, automações e operadores de holding.\n\nConfira o resumo executivo com todos os links úteis.",
    platforms: ["newsletter", "autoblog"],
    mediaType: "image",
    pillar: "Newsletter/SEO",
    tags: ["Autopilot30D", "Beehiiv", "Newsletter-Domingo", "Dia07"]
  },

  // SEMANA 2 (Dias 8 - 14)
  {
    dayIndex: 8,
    time: { hour: 11, minute: 0 },
    title: "💼 Artigo B2B: Como Escalar de 0 a 100k Requisições Sem Pagar Cloud",
    content: "A maioria das startups quebra pagando faturas astronômicas de servidores.\n\n3 Lições Práticas:\n1. Desacoplamento de Tarefas Pesadas para nós T4 gratuitos\n2. Camuflagem de Rede e Proxies Dedicados\n3. Handoff Preventivo em 4h15m sem interrupção de sessões\n\nQual é o seu maior gargalo de infraestrutura hoje? Deixe nos comentários.",
    platforms: ["linkedin", "autoblog"],
    mediaType: "carousel",
    pillar: "Autoridade",
    tags: ["Autopilot30D", "LinkedIn", "B2B-Leadership", "Dia08"]
  },
  {
    dayIndex: 9,
    time: { hour: 18, minute: 30 },
    title: "🎰 Vídeo Curto: Trocaram o seu Social Media por 9 Robôs Gratuitos",
    content: "Ato 1: Essa inteligência artificial posta em 5 redes enquanto você dorme.\nAto 2: Veja a timeline sincronizando Instagram, TikTok, LinkedIn e WhatsApp.\nAto 3: Comente 'ROBO' para receber o código aberto na DM!",
    platforms: ["instagram", "tiktok"],
    mediaType: "video",
    pillar: "Viral 9:16",
    tags: ["Autopilot30D", "Reels", "Comment-to-DM", "Dia09"]
  },
  {
    dayIndex: 10,
    time: { hour: 12, minute: 0 },
    title: "🔥 OFERTA RELÂMPAGO: Monitor Gamer 165Hz IPS 1ms com 45% OFF",
    content: "Menor valor registrado nos últimos 90 dias no radar V5!\n\nDe R$ 1.199,00 por apenas R$ 659,45 no PIX.\n\nCupom: TOPGAMER",
    platforms: ["whatsapp", "telegram"],
    mediaType: "image",
    pillar: "Ofertas VIP",
    tags: ["Autopilot30D", "Finders", "TechDeal", "Dia10"]
  },
  {
    dayIndex: 11,
    time: { hour: 11, minute: 30 },
    title: "🎠 Carrossel: As 4 Fases da Automação Cognitiva (Nível 1 ao 5)",
    content: "Do simples script em Python à Colmeia de Agentes Autônomos com memória central.\n\nEm qual nível a sua empresa está operando hoje? Arrasta pro lado!",
    platforms: ["instagram", "linkedin"],
    mediaType: "carousel",
    pillar: "Autoridade",
    tags: ["Autopilot30D", "Carrossel", "ArquiteturaIA", "Dia11"]
  },
  {
    dayIndex: 12,
    time: { hour: 18, minute: 0 },
    title: "⚡ Roteiro: Como Ganhar Dinheiro com Achadinhos sem Gastar com Anúncios",
    content: "Ato 1: Como essa automação gera R$ 3.000 por semana em comissões no piloto automático.\nAto 2: O bot busca bugs de preço e despacha no WhatsApp em segundos.\nAto 3: Comente 'AFILIADO' para liberar o acesso!",
    platforms: ["tiktok", "youtube"],
    mediaType: "video",
    pillar: "Viral 9:16",
    tags: ["Autopilot30D", "Shorts", "TikTokViral", "Dia12"]
  },
  {
    dayIndex: 13,
    time: { hour: 15, minute: 0 },
    title: "🚨 PECHINCHA: Fone Bluetooth TWS com Cancelamento de Ruído Ativo (58% OFF)",
    content: "Radar V5 Finders disparou alerta!\n\n❌ R$ 229,00\n💥 R$ 96,18\n\nApenas 35 unidades no estoque promocional.",
    platforms: ["whatsapp", "telegram"],
    mediaType: "image",
    pillar: "Ofertas VIP",
    tags: ["Autopilot30D", "SuperPechincha", "Dia13"]
  },
  {
    dayIndex: 14,
    time: { hour: 19, minute: 30 },
    title: "📬 EDIÇÃO #43: Os Segredos da Retenção de Vídeos nos Primeiros 3 Segundos",
    content: "Analisamos mais de 1.000 vídeos virais com nossa IA. Aqui está a fórmula matemática do scroll-stopping hook.",
    platforms: ["newsletter", "autoblog"],
    mediaType: "image",
    pillar: "Newsletter/SEO",
    tags: ["Autopilot30D", "Beehiiv", "EngenhariaReels", "Dia14"]
  },

  // SEMANA 3 (Dias 15 - 21)
  {
    dayIndex: 15,
    time: { hour: 11, minute: 30 },
    title: "💼 B2B: O Framework Anti-Cancelamento em Comentários de Redes Sociais",
    content: "Como estruturar uma esteira de Comment-to-DM com 5 variações anti-spam, jitter de 2s a 5s e isolamento de fronteiras de palavras.",
    platforms: ["linkedin", "autoblog"],
    mediaType: "carousel",
    pillar: "Autoridade",
    tags: ["Autopilot30D", "LinkedIn", "ChatbotX", "Dia15"]
  },
  {
    dayIndex: 16,
    time: { hour: 18, minute: 0 },
    title: "🎬 MiniMax H3: Como Criamos Vídeos Cinematográficos na GPU em 10 Segundos",
    content: "Ato 1: O render de vídeo por IA costumava demorar 10 minutos.\nAto 2: Veja essa cena gerada na Tesla T4 em apenas 10.09s com áudio nativo 32kHz!\nAto 3: Comente 'VIDEO' para receber a receita completa na DM.",
    platforms: ["instagram", "tiktok"],
    mediaType: "video",
    pillar: "Viral 9:16",
    tags: ["Autopilot30D", "MiniMaxH3", "ColabT4", "Dia16"]
  },
  {
    dayIndex: 17,
    time: { hour: 12, minute: 30 },
    title: "🔥 ACHADO DO DIA: Air Fryer Digital Inox 5L com 48% OFF no PIX",
    content: "Queridinha da cozinha com preço mínimo histórico!\n\n❌ De R$ 499,00\n💥 Por R$ 259,48 com frete grátis Prime.",
    platforms: ["whatsapp", "telegram"],
    mediaType: "image",
    pillar: "Ofertas VIP",
    tags: ["Autopilot30D", "Finders", "CasaTech", "Dia17"]
  },
  {
    dayIndex: 18,
    time: { hour: 20, minute: 0 },
    title: "🧵 Thread: 5 Erros que Destroem a Entrega do seu Conteúdo no Algoritmo",
    content: "1/4 Você passa horas editando um post e ele entrega para 30 pessoas. O que deu errado?\n\n2/4 Erro 1: Introdução lenta. Se o gancho não fisgar em 2.5s, o algoritmo enterra seu vídeo.\n\n3/4 Erro 2: Link no corpo do post em vez de Comment-to-DM.\n\n4/4 Comente 'ALGO' para o checklist de checagem pré-post!",
    platforms: ["x_twitter", "threads"],
    mediaType: "text",
    pillar: "Thread X",
    tags: ["Autopilot30D", "Twitter", "Growth", "Dia18"]
  },
  {
    dayIndex: 19,
    time: { hour: 11, minute: 0 },
    title: "🎠 Carrossel: Anatomia de um Carrossel que Gera R$ 10k em Leads",
    content: "Lâmina 1: O Gancho Doloroso\nLâmina 2: O Diagnóstico Clínico\nLâmina 3: O Framework Resolutivo\nLâmina 4: A Prova Prática\nLâmina 5: CTA Comment-to-DM.",
    platforms: ["instagram", "linkedin"],
    mediaType: "carousel",
    pillar: "Autoridade",
    tags: ["Autopilot30D", "Carrossel5L", "Dia19"]
  },
  {
    dayIndex: 20,
    time: { hour: 14, minute: 30 },
    title: "🚨 SUPER OFERTA: SSD NVMe M.2 1TB 5000MB/s (55% OFF)",
    content: "Upgrade supremo para seu setup com preço de 500GB!\n\n❌ De R$ 580,00\n💥 Por R$ 261,00 no PIX.",
    platforms: ["whatsapp", "telegram"],
    mediaType: "image",
    pillar: "Ofertas VIP",
    tags: ["Autopilot30D", "SetupGamer", "Dia20"]
  },
  {
    dayIndex: 21,
    time: { hour: 19, minute: 0 },
    title: "📬 EDIÇÃO #44: Como Criar Sistemas que Trabalham Enquanto Você Dorme",
    content: "Um manifesto sobre soberania digital, infraestrutura própria e independência de plataformas fechadas.",
    platforms: ["newsletter", "autoblog"],
    mediaType: "image",
    pillar: "Newsletter/SEO",
    tags: ["Autopilot30D", "Beehiiv", "Soberania", "Dia21"]
  },

  // SEMANA 4 (Dias 22 - 30)
  {
    dayIndex: 22,
    time: { hour: 11, minute: 30 },
    title: "💼 Artigo: Como a V5 Apollo Holding Roda com Custo Zero de Servidor",
    content: "Nós aproveitamos a capacidade de computação em nuvem gratuita dividida em 21 nós de GPUs dedicadas para processar dados 24/7.",
    platforms: ["linkedin", "autoblog"],
    mediaType: "carousel",
    pillar: "Autoridade",
    tags: ["Autopilot30D", "ColabT4", "Arquitetura", "Dia22"]
  },
  {
    dayIndex: 23,
    time: { hour: 18, minute: 0 },
    title: "⚡ Vídeo: 3 Truques de WhatsApp que Lojas Escondem de Você",
    content: "Ato 1: Você compra mais caro porque não sabe dessa regra de cupons.\nAto 2: As marcas jogam os melhores preços em canais secretos VIP.\nAto 3: Comente 'VIP' para entrar no canal gratuito!",
    platforms: ["tiktok", "youtube"],
    mediaType: "video",
    pillar: "Viral 9:16",
    tags: ["Autopilot30D", "Shorts", "Viral", "Dia23"]
  },
  {
    dayIndex: 24,
    time: { hour: 12, minute: 0 },
    title: "🔥 ACHADINHO: Robô Aspirador Inteligente com Mop Passa Pano (50% OFF)",
    content: "Limpeza 100% autônoma para sua casa com cupom secreto!\n\nDe R$ 699,00 por R$ 349,50.\n\nCupom: CASAINTELIGENTE",
    platforms: ["whatsapp", "telegram"],
    mediaType: "image",
    pillar: "Ofertas VIP",
    tags: ["Autopilot30D", "Finders", "Dia24"]
  },
  {
    dayIndex: 25,
    time: { hour: 17, minute: 30 },
    title: "🧵 Thread: As 5 Linguagens que os Agentes de IA Usam para Conversar Entre Si",
    content: "1/4 Model Context Protocol (MCP), Webhooks assíncronos e barramentos de memória compartilhada.\n\n2/4 Como conectar seus robôs para que um passe o bastão para o outro.\n\n3/4 O protocolo da Colmeia em ação.\n\n4/4 Curta e comente 'HIVE' para receber a documentação!",
    platforms: ["x_twitter", "threads"],
    mediaType: "text",
    pillar: "Thread X",
    tags: ["Autopilot30D", "MCP", "AI-Agents", "Dia25"]
  },
  {
    dayIndex: 26,
    time: { hour: 11, minute: 30 },
    title: "🎠 Carrossel: Guia Prático de SEO Programático para 2026",
    content: "Como indexar 1.000 páginas otimizadas com autoridade E-E-A-T sem penalização de spam no Google.",
    platforms: ["instagram", "autoblog"],
    mediaType: "carousel",
    pillar: "Autoridade",
    tags: ["Autopilot30D", "SEOMachine", "Dia26"]
  },
  {
    dayIndex: 27,
    time: { hour: 18, minute: 30 },
    title: "🎬 Vídeo: O Fim do Editor Humano? Testamos o Remotion Procedural",
    content: "Ato 1: Esse vídeo foi gerado em código sem abrir o Premiere ou CapCut.\nAto 2: As legendas Hormozi e cortes são sincronizados na velocidade da luz.\nAto 3: Comente 'EDIT' para ver o código fonte!",
    platforms: ["instagram", "tiktok"],
    mediaType: "video",
    pillar: "Viral 9:16",
    tags: ["Autopilot30D", "Remotion", "VideoIA", "Dia27"]
  },
  {
    dayIndex: 28,
    time: { hour: 14, minute: 0 },
    title: "🚨 BUG DE FIM DE MÊS: Smartwatch AMOLED Pro Resistente à Água (62% OFF)",
    content: "Preço de fábrica com estoque de queima relâmpago!\n\n❌ De R$ 320,00\n💥 Por R$ 121,60 no PIX.",
    platforms: ["whatsapp", "telegram"],
    mediaType: "image",
    pillar: "Ofertas VIP",
    tags: ["Autopilot30D", "QueimaEstoque", "Dia28"]
  },
  {
    dayIndex: 29,
    time: { hour: 20, minute: 0 },
    title: "🛠️ BASTIDORES: Relatório Mensal de Automação & Performance",
    content: "Fechamento do mês: 30 publicações automáticas, 0 falhas e mais de 15.000 interações geradas no piloto automático.",
    platforms: ["autoblog", "linkedin"],
    mediaType: "image",
    pillar: "Autoridade",
    tags: ["Autopilot30D", "Transparência", "Dia29"]
  },
  {
    dayIndex: 30,
    time: { hour: 19, minute: 0 },
    title: "📬 EDIÇÃO #45: A Retrospectiva do Mês e as Tendências de IA para o Próximo",
    content: "Nossa análise executiva consolidada: novos modelos, atualizações de algoritmos e oportunidades de escala.",
    platforms: ["newsletter", "autoblog"],
    mediaType: "image",
    pillar: "Newsletter/SEO",
    tags: ["Autopilot30D", "Beehiiv", "FinalDoMes", "Dia30"]
  }
];

/**
 * Constrói a lista completa de ScheduledPost distribuída sobre a data base especificada
 */
export function build30DayAutopilotPosts(startDate = new Date(2026, 9, 27)): ScheduledPost[] {
  return AUTOPILOT_30D_BLUEPRINT.map((bp) => {
    const targetDate = new Date(startDate);
    targetDate.setDate(startDate.getDate() + (bp.dayIndex - 1));
    targetDate.setHours(bp.time.hour, bp.time.minute, 0, 0);

    return {
      id: `post-autopilot30d-d${String(bp.dayIndex).padStart(2, "0")}-${Date.now()}`,
      title: bp.title,
      content: bp.content,
      platforms: bp.platforms,
      scheduledAt: targetDate.toISOString(),
      status: "scheduled",
      mediaType: bp.mediaType,
      tags: bp.tags
    };
  });
}
