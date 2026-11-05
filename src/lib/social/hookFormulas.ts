/**
 * hookFormulas.ts - Motor de Ganchos Virais, Humanizador Anti-IA e Hashtags Cirúrgicas
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Implementa os pilares de viralização e retenção:
 * 1. 10 Fórmulas de Ganchos Virais de Alta Retenção (Reels & Carrossel)
 * 2. Filtro Anti-Robótico / Humanizador de Texto ("Sem Cara de IA")
 * 3. Hashtags Cirúrgicas (Top 5 Estratégicas vs Spam de 30)
 */

export interface HookFormula {
  id: string;
  name: string;
  category: "quebra_padrao" | "dor_urgencia" | "autoridade" | "curiosidade";
  emoji: string;
  description: string;
  buildHook: (topic: string) => string;
}

export const VIRAL_HOOK_FORMULAS: HookFormula[] = [
  {
    id: "the_replacement",
    name: "A Substituição Secreta",
    category: "quebra_padrao",
    emoji: "🤖",
    description: "Revela que um trabalho custoso foi automatizado de graça.",
    buildHook: (topic) => `Trocaram o seu ${topic} por robôs de graça. E ninguém te avisou.`
  },
  {
    id: "pattern_interrupt",
    name: "Quebra de Padrão",
    category: "quebra_padrao",
    emoji: "🛑",
    description: "Para o scroll imediatamente com uma verdade inconveniente.",
    buildHook: (topic) => `Pare de fazer ${topic} do jeito tradicional se você não quiser perder relevância.`
  },
  {
    id: "latent_pain",
    name: "A Dor Oculta / Tempo Perdido",
    category: "dor_urgencia",
    emoji: "⏳",
    description: "Ataca o tempo e energia desperdiçados em tarefas manuais.",
    buildHook: (topic) => `Se você ainda gasta mais de 2 horas por dia com ${topic}, você está fazendo tudo errado.`
  },
  {
    id: "shocking_numbers",
    name: "Lista de Impacto",
    category: "curiosidade",
    emoji: "⚡",
    description: "Apresenta uma quantidade específica de recursos de alto valor.",
    buildHook: (topic) => `5 ferramentas gratuitas de ${topic} que fazem o trabalho de uma equipe inteira:`
  },
  {
    id: "open_playbook",
    name: "O Playbook / Roteiro Aberto",
    category: "autoridade",
    emoji: "📖",
    description: "Oferece o passo a passo exato e validado nos bastidores.",
    buildHook: (topic) => `O playbook exato de ${topic} que usamos nos bastidores da nossa operação:`
  },
  {
    id: "silent_mistake",
    name: "O Erro Silencioso",
    category: "dor_urgencia",
    emoji: "⚠️",
    description: "Aponta a falha invisível cometida por 95% do mercado.",
    buildHook: (topic) => `O erro invisível que 95% das pessoas cometem ao tentar dominar ${topic}:`
  },
  {
    id: "provocative_question",
    name: "Pergunta Provocativa",
    category: "curiosidade",
    emoji: "🤔",
    description: "Instiga reflexão sobre a mudança das maiores referências.",
    buildHook: (topic) => `Por que as maiores referências em ${topic} abandonaram as fórmulas antigas?`
  },
  {
    id: "before_after",
    name: "Transformação / Antes vs Depois",
    category: "autoridade",
    emoji: "📈",
    description: "Mostra um salto comprovado de resultados em tempo recorde.",
    buildHook: (topic) => `Como saímos do absoluto zero em ${topic} para resultados em escala em 7 dias:`
  },
  {
    id: "level_challenge",
    name: "Desafio / Teste de Nível",
    category: "curiosidade",
    emoji: "🎯",
    description: "Desafia o leitor a testar se ele realmente entende do tema.",
    buildHook: (topic) => `Faça o teste: se você errar 2 destas 3 regras de ${topic}, seus resultados estão travados.`
  },
  {
    id: "surgical_tutorial",
    name: "Tutorial Cirúrgico em 3 Passos",
    category: "autoridade",
    emoji: "🛠️",
    description: "Promessa de implementação rápida e prática sem enrolação.",
    buildHook: (topic) => `O método de 3 passos simples para destravar ${topic} sem gastar 1 real:`
  }
];

/**
 * Lista de clichês e jargões robóticos comuns gerados por LLMs
 */
export const AI_CLICHE_DICTIONARY: Array<{ pattern: RegExp; replacement: string; label: string }> = [
  { pattern: /no mundo acelerado de hoje[,.]?/gi, replacement: "Hoje em dia", label: "No mundo acelerado de hoje" },
  { pattern: /mergulhe (nesta|nessa) jornada/gi, replacement: "veja na prática", label: "Mergulhe nessa jornada" },
  { pattern: /em suma[,.]?/gi, replacement: "Em resumo,", label: "Em suma" },
  { pattern: /em conclusão[,.]?/gi, replacement: "Para fechar:", label: "Em conclusão" },
  { pattern: /sem mais delongas[,.]?/gi, replacement: "Direto ao ponto:", label: "Sem mais delongas" },
  { pattern: /um divisor de águas/gi, replacement: "uma virada de chave prática", label: "Divisor de águas" },
  { pattern: /desvende os segredos/gi, replacement: "descubra o passo a passo", label: "Desvende os segredos" },
  { pattern: /prepare-se para transformar/gi, replacement: "veja como aplicar", label: "Prepare-se para transformar" },
  { pattern: /é importante notar que/gi, replacement: "preste atenção:", label: "É importante notar que" },
  { pattern: /navegar pelas complexidades/gi, replacement: "resolver na prática", label: "Navegar pelas complexidades" },
  { pattern: /revolucion(ário|ária|ar)/gi, replacement: "inovador", label: "Revolucionário" },
  { pattern: /paisagem em constante evolução/gi, replacement: "mercado atual", label: "Paisagem em constante evolução" },
  { pattern: /uma miríade de/gi, replacement: "várias", label: "Uma miríade de" },
  { pattern: /vale ressaltar que/gi, replacement: "vale lembrar:", label: "Vale ressaltar que" }
];

export interface HumanizeResult {
  originalText: string;
  cleanedText: string;
  replacedCount: number;
  replacedItems: string[];
}

/**
 * Remove clichês robóticos típicos de IA para deixar o texto mais natural e direto
 */
export function humanizeCopyAntiAi(text: string): HumanizeResult {
  if (!text) {
    return { originalText: "", cleanedText: "", replacedCount: 0, replacedItems: [] };
  }

  let cleaned = text;
  const replacedItems: string[] = [];

  AI_CLICHE_DICTIONARY.forEach(({ pattern, replacement, label }) => {
    if (pattern.test(cleaned)) {
      replacedItems.push(label);
      cleaned = cleaned.replace(pattern, replacement);
    }
  });

  return {
    originalText: text,
    cleanedText: cleaned,
    replacedCount: replacedItems.length,
    replacedItems
  };
}

/**
 * Gera as Top 5 Hashtags Cirúrgicas (Princípio Marcondes: 5, não 30)
 * 1 Tag de Marca + 2 Tags de Nicho Direto + 2 Tags de Categoria Ampla
 */
export function buildSurgicalHashtags(
  topicTags: string[] = [],
  category = "Tecnologia",
  brandTag = "#V5Apollo"
): { tags: string[]; formattedString: string } {
  const sanitize = (tag: string) => {
    const clean = tag.replace(/^#/, "").replace(/\s+/g, "");
    return `#${clean}`;
  };

  const selectedTags: string[] = [brandTag];

  // Adiciona até 2 tags do nicho específico
  topicTags.slice(0, 2).forEach(t => {
    const formatted = sanitize(t);
    if (!selectedTags.includes(formatted)) {
      selectedTags.push(formatted);
    }
  });

  // Complementa com categoria e automação até 5 tags
  const fallbackCategoryTags = [category, "Automacao", "InteligenciaArtificial", "Produtividade"];
  for (const cat of fallbackCategoryTags) {
    if (selectedTags.length >= 5) break;
    const formatted = sanitize(cat);
    if (!selectedTags.includes(formatted)) {
      selectedTags.push(formatted);
    }
  }

  return {
    tags: selectedTags,
    formattedString: selectedTags.join(" ")
  };
}
