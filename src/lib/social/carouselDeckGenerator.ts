/**
 * carouselDeckGenerator.ts - Roteirizador Especializado de Carrosséis Slide a Slide
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Implementa o Pilar 2 de Conteúdo (Inspirado no Método Marcondes):
 * - Estruturação slide a slide de alta retenção (5 a 7 lâminas)
 * - Slide 1: Capa Magnética com Gancho de Quebra de Padrão
 * - Slide 2: O Problema Oculto / A Dor do Leitor
 * - Slide 3: A Virada de Chave / O Framework
 * - Slide 4: Passo a Passo Prático / Demonstração
 * - Slide 5: Call to Action (Comment-to-DM "LINK", Salvar & Compartilhar)
 */

export interface CarouselSlide {
  slideNumber: number;
  type: "cover" | "problem" | "framework" | "tutorial" | "cta";
  badge: string;
  headline: string;
  body: string[];
  callout?: string;
}

export interface CarouselDeck {
  title: string;
  topic: string;
  slides: CarouselSlide[];
  totalSlides: number;
  commentKeyword: string;
  hashtags: string[];
}

/**
 * Gera um roteiro de carrossel de 5 lâminas pronto para design ou publicação
 */
export function generateCarouselSlideDeck(
  topicTitle: string,
  commentKeyword = "LINK"
): CarouselDeck {
  const cleanTopic = topicTitle || "Automação de Conteúdo com IA";

  const slides: CarouselSlide[] = [
    {
      slideNumber: 1,
      type: "cover",
      badge: "SLIDE 1 · CAPA MAGNÉTICA",
      headline: `Trocaram o seu processo tradicional de ${cleanTopic} por robôs de graça.`,
      body: [
        "Eles não querem que você saiba disso.",
        "Arrasta para o lado para entender a esteira exata 👉"
      ],
      callout: "⚠️ Salve este post antes que saia do ar"
    },
    {
      slideNumber: 2,
      type: "problem",
      badge: "SLIDE 2 · A DOR INVISÍVEL",
      headline: "Se você ainda perde 3 horas por dia fazendo isso manualmente...",
      body: [
        "• Você está competindo com operações que produzem 10x mais rápido.",
        "• Criar na mão gera cansaço mental, inconsistência e bloqueio criativo.",
        "• Enquanto você sofre para postar 1 vez, a IA já publicou em 5 redes simultâneas."
      ],
      callout: "💡 O problema não é sua criatividade, é sua falta de ferramentas certas."
    },
    {
      slideNumber: 3,
      type: "framework",
      badge: "SLIDE 3 · O FRAMEWORK",
      headline: "A Estrutura dos 3 Pilares que Virou o Jogo:",
      body: [
        "1. Radar de Nicho: Ler o que viralizou antes de escrever uma única linha.",
        "2. Redação Sem Cara de IA: Eliminar clichês e falar a língua do seu público.",
        "3. Comment-to-DM: O comentário do seguidor vira uma mensagem direta instantânea com seu link."
      ],
      callout: "🚀 Quem domina este tripé nunca mais fica sem tráfego."
    },
    {
      slideNumber: 4,
      type: "tutorial",
      badge: "SLIDE 4 · NA PRÁTICA",
      headline: "O Passo a Passo de 3 Cliques:",
      body: [
        "Passo 1: Defina o tema no nosso Estúdio Onicanal.",
        "Passo 2: Escolha uma das 10 fórmulas de gancho e clique em 'Humanizar'.",
        "Passo 3: Agende para o Horário Nobre (18h ou 20h30) com aprovação humana garantida."
      ],
      callout: "⏱️ Tempo total de execução: menos de 4 minutos."
    },
    {
      slideNumber: 5,
      type: "cta",
      badge: "SLIDE 5 · CHAMADA PARA AÇÃO",
      headline: "Quer o Playbook e os Prompts Prontos?",
      body: [
        `Comente "${commentKeyword}" aqui embaixo 👇`,
        "O nosso assistente vai enviar o link exclusivo diretamente na sua DM.",
        "Acesso 100% gratuito e liberado na hora!"
      ],
      callout: "💾 Toque em SALVAR para não esquecer de aplicar amanhã."
    }
  ];

  return {
    title: `Carrossel: ${cleanTopic}`,
    topic: cleanTopic,
    slides,
    totalSlides: slides.length,
    commentKeyword,
    hashtags: ["#V5Apollo", "#CarrosselIA", "#Produtividade", "#Tech2026", "#Automacao"]
  };
}
