/**
 * dmTemplateBuilder.ts - Construtor e Compilador de Templates de Direct Message (DM)
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Arquitetura de Interpolação & Validação de Mensagens Privadas (Meta Graph API & TikTok DM):
 * - Interpolação de placeholders padrão: {{nome}}, {{username}}, {{ctaUrl}}, {{cupom}}, {{postTitle}}, {{saudacao}}
 * - Saudação inteligente baseada no horário do disparo (Bom dia, Boa tarde, Boa noite)
 * - Validador de conformidade e limites do Instagram Direct (máximo 1000 caracteres, detecção de CTA ausente)
 * - Biblioteca curada de templates de alta conversão por objetivo (Cupom de Desconto, Artigo Blog, Grupo VIP, Lead Magnet)
 * - Fallbacks graciosos para dados omitidos
 */

export interface DmCompilationContext {
  name?: string;
  username?: string;
  ctaUrl?: string;
  couponCode?: string;
  postTitle?: string;
  date?: Date;
}

export interface DmTemplateValidation {
  isValid: boolean;
  charCount: number;
  maxChars: number;
  remainingChars: number;
  hasCtaUrl: boolean;
  hasCoupon: boolean;
  hasNamePlaceholder: boolean;
  warnings: string[];
  recommendations: string[];
}

export interface DmPresetTemplate {
  id: string;
  name: string;
  objective: "coupon_ecommerce" | "blog_article" | "vip_community" | "lead_magnet";
  description: string;
  template: string;
  defaultCoupon?: string;
}

/**
 * Limite oficial de caracteres para mensagem de texto simples no Instagram Direct / Messenger
 */
export const META_DM_MAX_CHARS = 1000;

/**
 * Lista de Placeholders Oficiais Suportados pelo Motor
 */
export const SUPPORTED_DM_PLACEHOLDERS = [
  { token: "{{nome}}", label: "Nome do Lead", description: "Primeiro nome ou apelido do seguidor" },
  { token: "{{username}}", label: "Handle @", description: "Nome de usuário do Instagram (@user)" },
  { token: "{{ctaUrl}}", label: "Link Rastreado (CTA)", description: "URL de destino com parâmetros UTM automáticos" },
  { token: "{{cupom}}", label: "Cupom de Desconto", description: "Código promocional (ex: APOLLO10)" },
  { token: "{{postTitle}}", label: "Título do Post", description: "Nome da publicação de origem do comentário" },
  { token: "{{saudacao}}", label: "Saudação Dinâmica", description: "Bom dia, Boa tarde ou Boa noite conforme o horário" }
] as const;

/**
 * Biblioteca de Templates de Alta Conversão Pré-Configurados
 */
export const DM_PRESET_TEMPLATES: DmPresetTemplate[] = [
  {
    id: "coupon_ecommerce",
    name: "Achadinho com Cupom de Desconto",
    objective: "coupon_ecommerce",
    description: "Ideal para o V5 Finders Hub: entrega cupom exclusivo e link com menor preço.",
    template: "{{saudacao}}, {{nome}}! 🔥 Aqui está o link oficial que você pediu nos comentários:\n\n🛒 Acesse a oferta: {{ctaUrl}}\n🎟️ Use o cupom exclusivo: {{cupom}}\n\nAproveite antes que o estoque ou a promoção expire!",
    defaultCoupon: "PROMO10"
  },
  {
    id: "blog_article",
    name: "Artigo Completo do Auto Blog",
    objective: "blog_article",
    description: "Ideal para direcionar tráfego qualificado para os artigos da rede V5 Auto Blog.",
    template: "Olá {{nome}}! 📖 Aqui está o artigo completo sobre {{postTitle}} que você pediu:\n\n🔗 Ler na íntegra: {{ctaUrl}}\n\nDepois me conta o que achou da análise técnica!",
    defaultCoupon: "LEITURA_VIP"
  },
  {
    id: "vip_community",
    name: "Convite para Grupo VIP Finders",
    objective: "vip_community",
    description: "Ideal para conversão de seguidores em membros de canais fechados no WhatsApp e Telegram.",
    template: "{{saudacao}}, {{nome}}! 🚀 Seu acesso prioritário ao nosso Grupo VIP de Ofertas foi liberado:\n\n📲 Entre agora mesmo: {{ctaUrl}}\n🎟️ Chave de acesso: {{cupom}}\n\nTe espero lá dentro para economizar todos os dias!",
    defaultCoupon: "VIP2026"
  },
  {
    id: "lead_magnet",
    name: "Download de Material Gratuito / PDF",
    objective: "lead_magnet",
    description: "Ideal para entrega de playbooks, checklists e capturas de e-mail.",
    template: "Olá {{nome}}! 📚 O seu download gratuito está 100% liberado:\n\n📥 Baixar material: {{ctaUrl}}\n\nAproveite o conteúdo e qualquer dúvida é só me chamar por aqui!",
    defaultCoupon: "FREEPASS"
  }
];

/**
 * Retorna uma saudação dinâmica adequada ao horário do dia (timezone local)
 */
export function getGreetingByHour(date: Date = new Date()): string {
  const hours = date.getHours();
  if (hours >= 5 && hours < 12) {
    return "Bom dia";
  }
  if (hours >= 12 && hours < 18) {
    return "Boa tarde";
  }
  return "Boa noite";
}

/**
 * Compila o template de Direct Message substituindo todos os placeholders suportados
 */
export function compileDmMessage(
  template: string,
  context: DmCompilationContext = {}
): string {
  if (!template) return "";

  const date = context.date || new Date();
  const greeting = getGreetingByHour(date);

  // Normalização do handle @
  let cleanUsername = context.username ? context.username.trim() : "";
  let formattedUsername = cleanUsername;
  if (cleanUsername && !cleanUsername.startsWith("@")) {
    formattedUsername = `@${cleanUsername}`;
  }

  // Nome limpo (fallback para o username sem @ ou "amigo")
  let cleanName = context.name ? context.name.trim() : "";
  if (!cleanName && cleanUsername) {
    cleanName = cleanUsername.replace("@", "");
  }
  if (!cleanName) {
    cleanName = "amigo(a)";
  }

  const ctaUrl = context.ctaUrl ? context.ctaUrl.trim() : "";
  const coupon = context.couponCode ? context.couponCode.trim() : "ESPECIAL";
  const postTitle = context.postTitle ? context.postTitle.trim() : "Conteúdo Exclusivo";

  let compiled = template
    .replace(/{{nome}}/gi, cleanName)
    .replace(/{{name}}/gi, cleanName)
    .replace(/{{username}}/gi, formattedUsername)
    .replace(/{{ctaUrl}}/gi, ctaUrl)
    .replace(/{{url}}/gi, ctaUrl)
    .replace(/{{link}}/gi, ctaUrl)
    .replace(/{{cupom}}/gi, coupon)
    .replace(/{{coupon}}/gi, coupon)
    .replace(/{{postTitle}}/gi, postTitle)
    .replace(/{{tituloPost}}/gi, postTitle)
    .replace(/{{saudacao}}/gi, greeting)
    .replace(/{{greeting}}/gi, greeting);

  return compiled.trim();
}

/**
 * Validador de Template de Direct Message contra regras de conformidade da Meta
 */
export function validateDmTemplate(template: string, maxChars: number = META_DM_MAX_CHARS): DmTemplateValidation {
  const cleanTemplate = template ? template.trim() : "";
  const charCount = cleanTemplate.length;
  const remainingChars = maxChars - charCount;
  const warnings: string[] = [];
  const recommendations: string[] = [];

  const hasCtaUrl = /{{ctaUrl}}|{{url}}|{{link}}/i.test(cleanTemplate);
  const hasCoupon = /{{cupom}}|{{coupon}}/i.test(cleanTemplate);
  const hasNamePlaceholder = /{{nome}}|{{name}}/i.test(cleanTemplate);

  // 1. Verificação de Presença do Link (Objetivo principal da DM)
  if (!hasCtaUrl) {
    warnings.push("O template não contém o placeholder {{ctaUrl}}. O seguidor receberá a mensagem sem o link oficial.");
    recommendations.push("Adicione {{ctaUrl}} para garantir a conversão do lead.");
  }

  // 2. Verificação de Limite de Caracteres
  if (charCount > maxChars) {
    warnings.push(`O template excede o limite de ${maxChars} caracteres do Instagram Direct (${charCount} caracteres).`);
  } else if (remainingChars < 50) {
    warnings.push(`O template está muito próximo do limite de caracteres (${remainingChars} restantes).`);
  }

  // 3. Verificação de Personalização
  if (!hasNamePlaceholder) {
    recommendations.push("Adicione {{nome}} no início para tornar a mensagem mais calorosa e personalizada.");
  }

  // 4. Verificação de Excesso de Caixa Alta (Spam Trigger)
  const lettersOnly = cleanTemplate.replace(/[^a-zA-ZáéíóúãõçÁÉÍÓÚÃÕÇ]/g, "");
  if (lettersOnly.length > 20) {
    const uppercaseCount = (lettersOnly.match(/[A-ZÁÉÍÓÚÃÕÇ]/g) || []).length;
    const upperRatio = uppercaseCount / lettersOnly.length;
    if (upperRatio > 0.5) {
      warnings.push("Mais de 50% do texto está em CAIXA ALTA. Isso pode acionar filtros anti-spam da Meta.");
    }
  }

  const isValid = charCount > 0 && charCount <= maxChars;

  return {
    isValid,
    charCount,
    maxChars,
    remainingChars,
    hasCtaUrl,
    hasCoupon,
    hasNamePlaceholder,
    warnings,
    recommendations
  };
}
