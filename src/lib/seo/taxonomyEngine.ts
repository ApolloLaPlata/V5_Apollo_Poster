/**
 * taxonomyEngine.ts - Sistema de Categorias e Tags Dinâmicas com Sugestão Automática de Taxonomia
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Analisa semanticamente o conteúdo e título do artigo, identifica afinidade com Topic Clusters
 * da Holding V5 Apollo, sugere automaticamente a categoria editorial ótima com pontuação de confiança
 * e forja tags estratégicas limpas para indexação no V5 AutoBlog e WordPress REST API.
 */

export interface CategoryDefinition {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  wpId: number;
  keywords: string[];
  topicCluster: string;
}

export interface SuggestedTag {
  tag: string;
  relevance: number; // 0 a 100
  source: "keyword_density" | "cluster_expansion" | "entity_detection";
}

export interface TaxonomySuggestion {
  recommendedCategory: string;
  categorySlug: string;
  categoryConfidence: number; // 0 a 100%
  topicCluster: string;
  wpCategoryId: number;
  alternativeCategories: Array<{
    name: string;
    slug: string;
    score: number;
    confidence: number;
  }>;
  suggestedTags: SuggestedTag[];
  primaryEntity: string;
}

export const V5_TAXONOMIES: CategoryDefinition[] = [
  {
    id: "ai_automation",
    name: "Inteligência Artificial",
    slug: "inteligencia-artificial",
    description: "Agentes autônomos, modelos multimodais, automação com LLMs e pipelines cognitivos.",
    color: "#f59e0b",
    badgeBg: "bg-amber-500/10 border-amber-500/20",
    badgeText: "text-amber-400",
    wpId: 101,
    topicCluster: "IA & Ecossistemas Autônomos",
    keywords: [
      "agente", "agentes", "autonomo", "autonomos", "inteligencia", "artificial", "llm", "llms",
      "ia", "rag", "mcp", "gpt", "claude", "gemini", "deepseek", "deepmind", "neural", "prompt",
      "machine", "learning", "fine-tuning", "pipeline", "cognitivo", "chatbot", "api", "tokens",
      "memoria", "embeddings", "langchain", "langgraph", "orquestrador"
    ]
  },
  {
    id: "affiliates_deals",
    name: "Afiliados & Achadinhos",
    slug: "afiliados-achadinhos",
    description: "Curadoria de produtos virais, promoções, cupons e transmissões para grupos VIP.",
    color: "#10b981",
    badgeBg: "bg-emerald-500/10 border-emerald-500/20",
    badgeText: "text-emerald-400",
    wpId: 102,
    topicCluster: "Comércio Social & Achadinhos",
    keywords: [
      "achadinho", "achadinhos", "shopee", "aliexpress", "mercadolivre", "amazon", "magalu",
      "cupom", "cupons", "desconto", "promocao", "oferta", "ofertas", "afiliado", "afiliados",
      "preco", "economia", "comissao", "link", "compra", "frete", "gratis", "produto", "vip",
      "grupo", "telegram", "whatsapp", "cashback", "barato"
    ]
  },
  {
    id: "productivity_automation",
    name: "Produtividade & Automação",
    slug: "produtividade-automacao",
    description: "Otimização de rotinas, esteiras sem código, gestão de tempo e eficiência operacional.",
    color: "#3b82f6",
    badgeBg: "bg-blue-500/10 border-blue-500/20",
    badgeText: "text-blue-400",
    wpId: 103,
    topicCluster: "Workflows & Eficiência Operacional",
    keywords: [
      "produtividade", "automacao", "workflow", "processo", "processos", "rotina", "tempo",
      "eficiencia", "nocode", "no-code", "webhook", "webhooks", "n8n", "make", "zapier",
      "integracao", "integracoes", "tarefa", "tarefas", "organizacao", "foco", "equipe",
      "delegacao", "esteira", "sistema", "gestao"
    ]
  },
  {
    id: "saas_startups",
    name: "SaaS & Startups",
    slug: "saas-startups",
    description: "Criação de software escalável, modelos de receita recorrente e engenharia web moderna.",
    color: "#8b5cf6",
    badgeBg: "bg-purple-500/10 border-purple-500/20",
    badgeText: "text-purple-400",
    wpId: 104,
    topicCluster: "Engenharia de Software & SaaS",
    keywords: [
      "saas", "software", "startup", "startups", "mrr", "arr", "receita", "assinatura",
      "churn", "cloud", "nuvem", "nextjs", "react", "typescript", "fullstack", "backend",
      "frontend", "database", "supabase", "postgres", "deploy", "vercel", "mvp", "escalabilidade",
      "micro-saas", "produto", "plataforma"
    ]
  },
  {
    id: "marketing_growth",
    name: "Marketing & Growth",
    slug: "marketing-growth",
    description: "SEO programático, estratégias de retenção, redação de newsletters e aquisição orgânica.",
    color: "#ec4899",
    badgeBg: "bg-pink-500/10 border-pink-500/20",
    badgeText: "text-pink-400",
    wpId: 105,
    topicCluster: "Growth & SEO Programático",
    keywords: [
      "marketing", "growth", "seo", "posicionamento", "google", "newsletter", "email",
      "audiencia", "leads", "conversao", "copywriting", "copy", "conteudo", "editorial",
      "retencao", "eeat", "trafego", "organico", "cliques", "ctr", "ab-test", "engajamento",
      "redes", "sociais", "autoridade", "branding"
    ]
  },
  {
    id: "digital_finance",
    name: "Finanças Digitais & E-commerce",
    slug: "financas-digitais",
    description: "Monetização digital, gateways de pagamento, e-commerce e modelos de faturamento.",
    color: "#14b8a6",
    badgeBg: "bg-teal-500/10 border-teal-500/20",
    badgeText: "text-teal-400",
    wpId: 106,
    topicCluster: "Monetização & Transações Digitais",
    keywords: [
      "financas", "dinheiro", "monetizacao", "pagamento", "checkout", "stripe", "pix",
      "cartao", "faturamento", "lucro", "vendas", "ecommerce", "e-commerce", "loja",
      "gateway", "investimento", "recebiveis", "transacao", "transacoes", "carrinho",
      "precificacao", "ticket", "roas", "roi"
    ]
  }
];

const STOPWORDS_PT = new Set([
  "a", "o", "as", "os", "de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas",
  "um", "uma", "uns", "umas", "por", "para", "com", "sem", "sobre", "entre", "ate", "como",
  "que", "se", "ou", "e", "mas", "mais", "muito", "cada", "onde", "quando", "quem", "qual",
  "este", "esta", "estes", "estas", "esse", "essa", "esses", "essas", "aquele", "aquela",
  "seu", "sua", "seus", "suas", "meu", "minha", "nosso", "nossa", "nossos", "nossas",
  "voce", "voces", "eles", "elas", "ele", "ela", "nos", "isso", "isto", "aquilo",
  "ser", "estar", "ter", "haver", "fazer", "ir", "dizer", "dar", "ver", "poder",
  "ja", "nao", "sim", "tambem", "ainda", "so", "apenas", "mesmo", "outro", "outra",
  "aqui", "ali", "la", "agora", "depois", "antes", "sempre", "nunca", "todos", "todas"
]);

/**
 * Normaliza uma string para comparação fonética/semântica simples (sem acentos e minúscula)
 */
function normalizeTerm(term: string): string {
  return term
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Normaliza o formato de uma tag para exibição elegante no CMS (capitalização ou kebab-case)
 */
export function normalizeTagName(rawTag: string): string {
  const clean = rawTag
    .replace(/^[#@\s]+/, "")
    .replace(/[\s_]+/g, " ")
    .trim();

  if (!clean) return "";

  // Se tiver menos de 4 caracteres e for sigla comum (IA, SEO, RAG, API, MRR, ROI, CSS, JS)
  const upperSiglas = ["ia", "seo", "rag", "mcp", "api", "mrr", "arr", "roi", "ctr", "llm", "llms", "css", "html", "js", "ts", "vip", "dm", "utm"];
  if (upperSiglas.includes(clean.toLowerCase())) {
    return clean.toUpperCase();
  }

  // Capitaliza a primeira letra de cada palavra relevante
  return clean
    .split(" ")
    .map(word => {
      if (word.length <= 2 && ["de", "da", "do", "em", "no", "na", "e"].includes(word.toLowerCase())) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

/**
 * Analisa semanticamente o conteúdo e sugere a melhor categoria e tags dinâmicas
 */
export function analyzeContentTaxonomy(contentMarkdown: string, title = ""): TaxonomySuggestion {
  const fullText = `${title} ${title} ${contentMarkdown}`; // Título possui peso duplo
  const words = fullText
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOPWORDS_PT.has(w));

  // 1. Contagem de frequência de termos
  const termFrequency: Record<string, number> = {};
  for (const word of words) {
    termFrequency[word] = (termFrequency[word] || 0) + 1;
  }

  // 2. Pontuação por categoria
  const categoryScores: Array<{ category: CategoryDefinition; score: number }> = V5_TAXONOMIES.map(cat => {
    let score = 0;
    for (const kw of cat.keywords) {
      const normalizedKw = normalizeTerm(kw);
      if (termFrequency[normalizedKw]) {
        score += termFrequency[normalizedKw] * 3;
      }
      // Bônus se o termo estiver explicitamente no título
      if (title.toLowerCase().includes(kw)) {
        score += 8;
      }
    }
    return { category: cat, score };
  });

  categoryScores.sort((a, b) => b.score - a.score);

  const bestMatch = categoryScores[0];
  const totalScore = categoryScores.reduce((acc, curr) => acc + curr.score, 0) || 1;
  const rawConfidence = Math.round((bestMatch.score / totalScore) * 100);
  const confidence = Math.min(98, Math.max(52, rawConfidence + 20));

  // 3. Forjamento de Tags Dinâmicas Inteligentes
  const sortedWords = Object.entries(termFrequency)
    .sort((a, b) => b[1] - a[1])
    .filter(([word]) => word.length >= 3);

  const suggestedTags: SuggestedTag[] = [];
  const seenTags = new Set<string>();

  // A) Primeiras tags derivadas dos termos mais frequentes com substância
  for (const [word, freq] of sortedWords.slice(0, 12)) {
    const norm = normalizeTagName(word);
    if (!seenTags.has(norm.toLowerCase()) && norm.length >= 3) {
      seenTags.add(norm.toLowerCase());
      suggestedTags.push({
        tag: norm,
        relevance: Math.min(100, Math.round((freq / (sortedWords[0]?.[1] || 1)) * 100)),
        source: "keyword_density"
      });
    }
    if (suggestedTags.length >= 5) break;
  }

  // B) Tags de Topic Cluster vinculadas à categoria vencedora
  const clusterKeywords = bestMatch.category.keywords.slice(0, 8);
  for (const kw of clusterKeywords) {
    if (suggestedTags.length >= 8) break;
    const norm = normalizeTagName(kw);
    if (!seenTags.has(norm.toLowerCase())) {
      seenTags.add(norm.toLowerCase());
      suggestedTags.push({
        tag: norm,
        relevance: 82,
        source: "cluster_expansion"
      });
    }
  }

  // Alternativas ordenadas
  const alternativeCategories = categoryScores.slice(1, 4).map(c => ({
    name: c.category.name,
    slug: c.category.slug,
    score: c.score,
    confidence: Math.round((c.score / totalScore) * 100)
  }));

  // Entidade primária detectada (primeira tag ou termo de maior destaque)
  const primaryEntity = suggestedTags[0]?.tag || bestMatch.category.name;

  return {
    recommendedCategory: bestMatch.category.name,
    categorySlug: bestMatch.category.slug,
    categoryConfidence: confidence,
    topicCluster: bestMatch.category.topicCluster,
    wpCategoryId: bestMatch.category.wpId,
    alternativeCategories,
    suggestedTags,
    primaryEntity
  };
}

/**
 * Retorna as definições canônicas de taxonomia do V5 AutoBlog
 */
export function getStandardTaxonomies(): CategoryDefinition[] {
  return V5_TAXONOMIES;
}

/**
 * Mapeia o nome de uma categoria para o objeto de metadados do WordPress
 */
export function mapCategoryToWordPress(categoryName: string): { id: number; slug: string; name: string } {
  const found = V5_TAXONOMIES.find(
    c => c.name.toLowerCase() === categoryName.toLowerCase() || c.slug === categoryName.toLowerCase()
  );

  if (found) {
    return { id: found.wpId, slug: found.slug, name: found.name };
  }

  return { id: 101, slug: "inteligencia-artificial", name: "Inteligência Artificial" };
}
