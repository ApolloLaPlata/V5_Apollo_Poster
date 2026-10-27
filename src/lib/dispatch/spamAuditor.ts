/**
 * V5 APOLLO POSTER - SPAM AUDITOR & DELIVERABILITY ENGINE (Etapa 039)
 * Analisador estático heurístico de entregabilidade pré-envio para newsletters e e-mails.
 * Simula regras do SpamAssassin, Barracuda, Google Postmaster e Microsoft SmartScreen.
 */

export interface SpamTriggerMatch {
  word: string;
  severity: "low" | "medium" | "high";
  location: "subject" | "body" | "preheader";
  suggestion: string;
}

export interface SpamPenalty {
  category: "trigger_words" | "caps_lock" | "punctuation" | "link_density" | "preheader" | "media" | "unsubscribe";
  title: string;
  description: string;
  points: number;
}

export interface SpamAuditResult {
  score: number; // 0.0 (Perfeito/Limpo) a 10.0 (Spam Crítico)
  rating: "safe" | "moderate" | "risky";
  ratingLabel: string;
  deliverabilityEstimate: number; // 0% a 100%
  totalWords: number;
  linkCount: number;
  textToLinkRatio: number; // palavras por link
  detectedTriggers: SpamTriggerMatch[];
  penalties: SpamPenalty[];
  recommendations: string[];
  checklist: {
    hasPreheader: boolean;
    hasAltTagsOnImages: boolean;
    hasCleanSubject: boolean;
    hasBalancedLinks: boolean;
    hasUnsubscribeMention: boolean;
  };
  auditedAt: string;
}

export interface SpamAuditInput {
  subject: string;
  contentMarkdown: string;
  previewText?: string;
  fromName?: string;
  includeFooterNotice?: boolean;
}

// Dicionário de Palavras Gatilho de Spam categorizadas por severidade
interface TriggerDef {
  pattern: RegExp;
  cleanTerm: string;
  severity: "low" | "medium" | "high";
  suggestion: string;
}

const SPAM_TRIGGERS: TriggerDef[] = [
  // Severidade ALTA (+1.4 a +1.8 pts)
  { pattern: /\b(100%\s*gr[aá]tis)\b/gi, cleanTerm: "100% grátis", severity: "high", suggestion: "Substitua por 'cortesia', 'incluso' ou 'sem custo adicional'" },
  { pattern: /\b(renda\s*extra)\b/gi, cleanTerm: "renda extra", severity: "high", suggestion: "Evite promessas financeiras; foque em 'novas oportunidades de monetização'" },
  { pattern: /\b(ganhe\s*dinheiro)\b/gi, cleanTerm: "ganhe dinheiro", severity: "high", suggestion: "Substitua por 'estratégias de remuneração' ou 'geração de receita'" },
  { pattern: /\b(fique\s*rico)\b/gi, cleanTerm: "fique rico", severity: "high", suggestion: "Remova promessas de enriquecimento - gatilho agressivo de filtro" },
  { pattern: /\b(dinheiro\s*f[aá]cil|dinheiro\s*r[aá]pido)\b/gi, cleanTerm: "dinheiro fácil/rápido", severity: "high", suggestion: "Remova termos que remetam a esquemas financeiros duvidosos" },
  { pattern: /\b(sem\s*risco|risk\s*free)\b/gi, cleanTerm: "sem risco / risk free", severity: "high", suggestion: "Substitua por 'garantia de satisfação' ou 'período de teste'" },
  { pattern: /\b(100%\s*garantido|lucro\s*garantido)\b/gi, cleanTerm: "100% garantido", severity: "high", suggestion: "Filtros punem certezas absolutas; use 'alta probabilidade' ou 'método comprovado'" },
  { pattern: /\b(cart[aã]o\s*aprovado|cr[eé]dito\s*pr[eé]-?aprovado)\b/gi, cleanTerm: "cartão/crédito pré-aprovado", severity: "high", suggestion: "Termo de spam bancário; remova caso não seja instituição financeira regulamentada" },
  { pattern: /\b(emagre[çc]a\s*dormindo|f[oó]rmula\s*m[aá]gica|segredo\s*revelado)\b/gi, cleanTerm: "fórmula mágica / segredo revelado", severity: "high", suggestion: "Substitua sensacionalismo por estudos de caso ou dados práticos" },
  { pattern: /\b(make\s*money\s*fast|claim\s*your\s*prize|double\s*your\s*money)\b/gi, cleanTerm: "make money / claim prize", severity: "high", suggestion: "Gatilhos universais de blacklist em provedores globais" },
  { pattern: /\b(trabalhe\s*em\s*casa|work\s*from\s*home)\b/gi, cleanTerm: "trabalhe em casa", severity: "high", suggestion: "Termo amplamente associado a spam de recrutamento falso" },

  // Severidade MÉDIA (+0.8 a +1.1 pts)
  { pattern: /\b(urgente|urgent)\b/gi, cleanTerm: "urgente", severity: "medium", suggestion: "Evite criar falsa emergência no assunto ou corpo" },
  { pattern: /\b(imperd[ií]vel)\b/gi, cleanTerm: "imperdível", severity: "medium", suggestion: "Substitua por 'relevante', 'destaque especial' ou 'selecionado'" },
  { pattern: /\b([uú]ltima\s*chance|last\s*chance)\b/gi, cleanTerm: "última chance", severity: "medium", suggestion: "Use 'encerramento de inscrições' ou 'prazo final hoje'" },
  { pattern: /\b(clique\s*aqui|clique\s*agora|click\s*here)\b/gi, cleanTerm: "clique aqui", severity: "medium", suggestion: "Use CTAs contextuais como 'Acesse o relatório completo' ou 'Leia o artigo'" },
  { pattern: /\b(desconto\s*exclusivo|exclusive\s*discount)\b/gi, cleanTerm: "desconto exclusivo", severity: "medium", suggestion: "Prefira 'condição especial para assinantes VIP'" },
  { pattern: /\b(tempo\s*limitado|limited\s*time)\b/gi, cleanTerm: "tempo limitado", severity: "medium", suggestion: "Informe datas ou horários específicos em vez do clichê" },
  { pattern: /\b(oferta\s*rel[aâ]mpago)\b/gi, cleanTerm: "oferta relâmpago", severity: "medium", suggestion: "Substitua por 'edição extraordinária' ou 'atualização de mercado'" },
  { pattern: /\b(compre\s*j[aá]|compre\s*agora|buy\s*now)\b/gi, cleanTerm: "compre já/agora", severity: "medium", suggestion: "Em newsletters editoriais, prefira 'Conheça o produto' ou 'Veja detalhes'" },
  { pattern: /\b(parab[eé]ns\s*voc[eê]\s*ganhou)\b/gi, cleanTerm: "parabéns você ganhou", severity: "medium", suggestion: "Gatilho de sorteios falsos; evite no corpo e assunto" },
  { pattern: /\b(n[aã]o\s*perca|don['’]?t\s*miss)\b/gi, cleanTerm: "não perca", severity: "medium", suggestion: "Substitua por 'vale conferir' ou 'confira a análise'" },

  // Severidade BAIXA (+0.3 a +0.5 pts)
  { pattern: /\b(gr[aá]tis|free)\b/gi, cleanTerm: "grátis / free", severity: "low", suggestion: "Utilize com moderação; limite a no máximo 1 menção no corpo" },
  { pattern: /\b(desconto|discount)\b/gi, cleanTerm: "desconto", severity: "low", suggestion: "Use com moderação e acompanhado de contexto de produto" },
  { pattern: /\b(b[oó]nus|bonus)\b/gi, cleanTerm: "bônus", severity: "low", suggestion: "Aceitável com moderação, mas evite em caixa alta" },
  { pattern: /\b(promo[çc][aã]o|promo)\b/gi, cleanTerm: "promoção", severity: "low", suggestion: "Mantenha no corpo e evite no assunto para não cair na aba Promoções" },
];

// Domínios de encurtadores genéricos frequentemente bloqueados por segurança
const SUSPICIOUS_SHORTENERS = [
  "bit.ly",
  "tinyurl.com",
  "is.gd",
  "cutt.ly",
  "t.co",
  "ow.ly",
  "rb.gy"
];

/**
 * Executa a auditoria completa de Spam Score e entregabilidade pré-envio
 */
export function auditEmailSpamScore(input: SpamAuditInput): SpamAuditResult {
  const {
    subject = "",
    contentMarkdown = "",
    previewText = "",
    fromName = "",
    includeFooterNotice = true
  } = input;

  const penalties: SpamPenalty[] = [];
  const detectedTriggers: SpamTriggerMatch[] = [];
  const recommendations: string[] = [];

  // 1. Extração de Estatísticas Básicas de Texto e Links
  const cleanBodyText = contentMarkdown
    .replace(/!\[.*?\]\(.*?\)/g, "") // remove imagens
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // mantém texto do link
    .replace(/[#*`_~>\-+=|{}]/g, " ") // remove sintaxe markdown
    .trim();

  const words = cleanBodyText.split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;

  // Extração de Links
  const linkMatches = contentMarkdown.match(/\[.*?\]\((https?:\/\/.*?)\)/gi) || [];
  const rawUrlMatches = contentMarkdown.match(/(https?:\/\/[^\s\)]+)/gi) || [];
  const allExtractedUrls = Array.from(new Set([...linkMatches, ...rawUrlMatches]));
  const linkCount = allExtractedUrls.length;

  const textToLinkRatio = linkCount > 0 ? Math.round(totalWords / linkCount) : totalWords;

  // 2. Análise do Assunto (Subject Line)
  let subjectTriggerPoints = 0;
  let hasCleanSubject = true;

  if (!subject.trim()) {
    penalties.push({
      category: "trigger_words",
      title: "Linha de Assunto Vazia",
      description: "O e-mail não possui assunto configurado. Disparos sem assunto são rejeitados imediatamente.",
      points: 4.0
    });
    hasCleanSubject = false;
  } else {
    // Verificação de Comprimento
    if (subject.length < 10) {
      penalties.push({
        category: "trigger_words",
        title: "Assunto Muito Curto (<10 caracteres)",
        description: "Assuntos muito curtos têm menor taxa de abertura e parecem incompletos.",
        points: 0.6
      });
      recommendations.push("Aumente a linha de assunto para ter entre 35 e 60 caracteres com benefício claro.");
      hasCleanSubject = false;
    } else if (subject.length > 70) {
      penalties.push({
        category: "trigger_words",
        title: "Assunto Excessivamente Longo (>70 caracteres)",
        description: "O assunto será truncado em 80% dos smartphones e clientes de e-mail mobile.",
        points: 0.5
      });
      recommendations.push("Encurte o assunto para até 65 caracteres para exibição perfeita no mobile.");
    }

    // Verificação de CAIXA ALTA no Assunto
    const alphaChars = subject.replace(/[^a-zA-ZáéíóúÁÉÍÓÚãõÃÕâêîôûÂÊÎÔÛçÇ]/g, "");
    if (alphaChars.length > 6) {
      const upperChars = alphaChars.split("").filter(c => c === c.toUpperCase() && c !== c.toLowerCase()).length;
      const upperPercentage = (upperChars / alphaChars.length) * 100;
      if (upperPercentage > 35) {
        penalties.push({
          category: "caps_lock",
          title: "Uso Excessivo de CAIXA ALTA no Assunto",
          description: `${Math.round(upperPercentage)}% das letras estão em maiúsculas. Isso ativa filtros imediatos do Gmail.`,
          points: 1.8
        });
        recommendations.push("Evite usar palavras inteiras em maiúsculas no assunto; use Title Case ou Sentence case.");
        hasCleanSubject = false;
      }
    }

    // Verificação de Pontuação Repetida no Assunto (ex: !!!, ???, $$$)
    if (/([!?$]{2,})/g.test(subject)) {
      penalties.push({
        category: "punctuation",
        title: "Pontuação Sensacionalista no Assunto (!!, ??, $$)",
        description: "Múltiplos pontos de exclamação ou interrogação no assunto são marcadores clássicos de spam.",
        points: 1.4
      });
      recommendations.push("Remova pontuação repetida no assunto. Use no máximo um ponto de interrogação ou exclamação sutil.");
      hasCleanSubject = false;
    }

    // Simulação de Falsa Resposta / Falso Encaminhamento (Re:, Fwd:)
    if (/^(re:|fwd:|res:)\s+/i.test(subject.trim())) {
      penalties.push({
        category: "trigger_words",
        title: "Falsa Resposta / Encaminhamento (Re: / Fwd:)",
        description: "Tentar simular conversa anterior quando é um broadcast em massa viola políticas de provedores.",
        points: 2.2
      });
      recommendations.push("Remova prefixos falsos como 'Re:' ou 'Fwd:' para não ter a reputação de envio rebaixada.");
      hasCleanSubject = false;
    }
  }

  // 3. Busca de Palavras Gatilho no Assunto, Preheader e Corpo
  const checkTextForTriggers = (text: string, location: "subject" | "body" | "preheader") => {
    for (const trigger of SPAM_TRIGGERS) {
      const matches = text.match(trigger.pattern);
      if (matches && matches.length > 0) {
        detectedTriggers.push({
          word: matches[0],
          severity: trigger.severity,
          location,
          suggestion: trigger.suggestion
        });

        const pointsPerMatch = trigger.severity === "high" ? 1.4 : trigger.severity === "medium" ? 0.8 : 0.35;
        const totalPoints = pointsPerMatch * Math.min(matches.length, 3); // cap por trigger
        subjectTriggerPoints += totalPoints;
      }
    }
  };

  checkTextForTriggers(subject, "subject");
  if (previewText) {
    checkTextForTriggers(previewText, "preheader");
  }
  checkTextForTriggers(contentMarkdown, "body");

  if (detectedTriggers.length > 0) {
    const highTriggers = detectedTriggers.filter(t => t.severity === "high");
    const mediumTriggers = detectedTriggers.filter(t => t.severity === "medium");

    penalties.push({
      category: "trigger_words",
      title: `${detectedTriggers.length} Palavra(s)-Gatilho de Spam Detectada(s)`,
      description: `${highTriggers.length} de alta severidade e ${mediumTriggers.length} de média gravidade encontradas.`,
      points: Math.min(Number(subjectTriggerPoints.toFixed(1)), 4.0)
    });
  }

  // 4. Verificação de Text-to-Link Ratio (Densidade de Links)
  let hasBalancedLinks = true;
  if (linkCount > 0) {
    if (totalWords < 60 && linkCount >= 2) {
      penalties.push({
        category: "link_density",
        title: "Conteúdo Muito Curto com Links Múltiplos",
        description: `Apenas ${totalWords} palavras de texto com ${linkCount} links. Alta chance de classificação como phishing/spam.`,
        points: 2.2
      });
      recommendations.push("Adicione ao menos 150 a 300 palavras de texto autoral antes de incluir links de afiliados ou conversão.");
      hasBalancedLinks = false;
    } else if (textToLinkRatio < 25) {
      penalties.push({
        category: "link_density",
        title: `Baixa Densidade de Texto por Link (${textToLinkRatio} pal/link)`,
        description: "Recomenda-se um mínimo de 35 a 50 palavras de texto corrido para cada hiperlink incluído.",
        points: 1.2
      });
      recommendations.push("Aumente a profundidade do artigo ou reduza a quantidade de links redundantes para o mesmo destino.");
      hasBalancedLinks = false;
    }
  }

  // 5. Verificação de Encurtadores Genéricos Suspeitos
  const foundSuspiciousShorteners: string[] = [];
  for (const shortener of SUSPICIOUS_SHORTENERS) {
    if (contentMarkdown.toLowerCase().includes(shortener)) {
      foundSuspiciousShorteners.push(shortener);
    }
  }
  if (foundSuspiciousShorteners.length > 0) {
    penalties.push({
      category: "link_density",
      title: "Uso de Encurtador Genérico Detectado",
      description: `Identificado: ${foundSuspiciousShorteners.join(", ")}. Provedores bloqueiam encurtadores por risco de malware.`,
      points: 1.5
    });
    recommendations.push("Utilize links de domínio próprio com parâmetros UTM em vez de encurtadores de terceiros como bit.ly.");
  }

  // 6. Verificação do Preheader (Preview Text)
  let hasPreheader = true;
  if (!previewText || previewText.trim().length === 0) {
    penalties.push({
      category: "preheader",
      title: "Preheader Ausente",
      description: "Sem preheader, as caixas de entrada exibirão trechos de URLs ou código HTML na linha de resumo.",
      points: 0.6
    });
    recommendations.push("Preencha o campo Preheader com uma frase cativante de 40 a 90 caracteres para reforçar o assunto.");
    hasPreheader = false;
  } else if (previewText.length < 15) {
    penalties.push({
      category: "preheader",
      title: "Preheader Excessivamente Curto (<15 caracteres)",
      description: "Preheader muito curto deixará espaço para vazamento do texto do corpo do e-mail.",
      points: 0.3
    });
  }

  // 7. Verificação de Imagens e Tags ALT
  let hasAltTagsOnImages = true;
  const imageTagMatches = contentMarkdown.match(/!\[(.*?)\]\((.*?)\)/g) || [];
  if (imageTagMatches.length > 0) {
    let imagesWithoutAlt = 0;
    for (const imgTag of imageTagMatches) {
      const match = imgTag.match(/!\[(.*?)\]\((.*?)\)/);
      if (match && (!match[1] || match[1].trim() === "")) {
        imagesWithoutAlt++;
      }
    }

    if (imagesWithoutAlt > 0) {
      penalties.push({
        category: "media",
        title: `${imagesWithoutAlt} Imagem(ns) sem Tag ALT`,
        description: "Filtros antispam penalizam imagens sem descrição textual alternativa (critério de acessibilidade).",
        points: 0.8
      });
      recommendations.push("Preencha sempre a descrição textual [ALT] de todas as imagens inseridas.");
      hasAltTagsOnImages = false;
    }

    if (imageTagMatches.length >= 3 && totalWords < 100) {
      penalties.push({
        category: "media",
        title: "Alta Proporção Imagens vs. Texto",
        description: "Muitas imagens com pouco texto escrito simulam campanhas de spam baseadas em imagens (image-only spam).",
        points: 1.6
      });
      recommendations.push("Adicione ao menos 2 a 3 parágrafos contextuais detalhando o tema da newsletter.");
    }
  }

  // 8. Verificação de Requisitos Obrigatórios de Rodapé (Unsubscribe & Identificação)
  const lowerContent = contentMarkdown.toLowerCase();
  const hasUnsubscribeWord = lowerContent.includes("unsubscribe") || 
                             lowerContent.includes("cancelar inscrição") || 
                             lowerContent.includes("descadastrar") || 
                             lowerContent.includes("opt-out") ||
                             includeFooterNotice; // Se o rodapé automático estiver ativado, atende ao requisito

  let hasUnsubscribeMention = true;
  if (!hasUnsubscribeWord && !includeFooterNotice) {
    penalties.push({
      category: "unsubscribe",
      title: "Ausência de Mecanismo de Descadastramento (Unsubscribe)",
      description: "E-mails sem opção de cancelamento de inscrição violam a LGPD, CAN-SPAM e são bloqueados pelo Gmail/Yahoo.",
      points: 2.5
    });
    recommendations.push("Mantenha o Rodapé Institucional Ativo com link de 1-Click Unsubscribe conforme RFC-8058.");
    hasUnsubscribeMention = false;
  }

  // 9. Cálculo Final do Spam Score Heurístico (Escala 0.0 a 10.0)
  const rawScore = penalties.reduce((acc, curr) => acc + curr.points, 0);
  const score = Math.min(10.0, Math.max(0.0, Number(rawScore.toFixed(1))));

  // Classificação
  let rating: "safe" | "moderate" | "risky" = "safe";
  let ratingLabel = "Excelente • Entrega Direta na Caixa de Entrada";
  let deliverabilityEstimate = Math.max(15, Math.min(99, Math.round(99 - (score * 8.5))));

  if (score > 4.5) {
    rating = "risky";
    ratingLabel = "Crítico • Alto Risco de Bloqueio ou Caixa de Spam";
  } else if (score > 2.0) {
    rating = "moderate";
    ratingLabel = "Atenção • Possível Envio para a Aba Promoções";
  }

  if (recommendations.length === 0) {
    recommendations.push("Excelente redação! O conteúdo apresenta equilíbrio ideal entre texto, links e ausência de gatilhos.");
    recommendations.push("A taxa de entrega estimada para caixas primárias (Gmail/Outlook/Yahoo) é superior a 95%.");
  }

  return {
    score,
    rating,
    ratingLabel,
    deliverabilityEstimate,
    totalWords,
    linkCount,
    textToLinkRatio,
    detectedTriggers,
    penalties,
    recommendations,
    checklist: {
      hasPreheader,
      hasAltTagsOnImages,
      hasCleanSubject,
      hasBalancedLinks,
      hasUnsubscribeMention
    },
    auditedAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  };
}
