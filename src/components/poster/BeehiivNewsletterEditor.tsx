"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Mail, 
  Globe, 
  Share2, 
  Code, 
  CheckCircle2, 
  Copy, 
  Sparkles, 
  Layers, 
  Terminal,
  ExternalLink,
  Zap,
  ArrowRight,
  Columns2,
  Edit3,
  Eye,
  Monitor,
  Smartphone,
  BookOpen,
  FileText,
  Clock,
  Check,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  RefreshCw,
  Hash,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Strikethrough,
  Quote,
  List,
  ListOrdered,
  Link2,
  Lock,
  Minus,
  BarChart2,
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  Image as ImageIcon,
  Trash2,
  Settings,
  Tag,
  Folder,
  Users,
  Plus,
  Table as TableIcon,
  Server,
  Cloud,
  Activity,
  Sun,
  Moon,
  Wifi,
  Battery,
  Archive,
  Printer,
  Key,
  X
} from "lucide-react";
import { MultimodalDispatchPayload, EmailProviderType } from "@/types/poster";
import { 
  compileEmailHtml, 
  compileBlogPayload, 
  compileSocialTeasers, 
  executeMockDispatch,
  slugify,
  buildTrackingUrl,
  getSampleTrackingUrls,
  renderOutlookCtaButton,
  renderInstitutionalEmailFooter
} from "@/lib/dispatch/multimodalEngine";
import { 
  EMAIL_PROVIDER_PRESETS, 
  testEmailProviderConnection, 
  getEmailProviderProfile, 
  ProviderTestResult,
  sendTestProofEmail,
  SendTestEmailResult
} from "@/lib/dispatch/emailProviders";
import { usePosterStore } from "@/store/usePosterStore";
import { toast } from "@/lib/toast/useToast";
import { dispatchEventBus } from "@/lib/events/dispatchEvents";
import { countWords, calculateReadingTimeMinutes } from "@/lib/utils/formatters";
import { extractContentMetadata } from "@/lib/utils/metadataExtractor";
import { sanitizeMarkdownAdvanced } from "@/lib/utils/markdownSanitizer";
import { auditEmailSpamScore, SpamAuditResult } from "@/lib/dispatch/spamAuditor";
import { SpamAuditModal } from "@/components/poster/SpamAuditModal";
import { 
  generateBreadcrumbSchema, 
  renderSchemaJsonLdScript, 
  validateSchemaCompleteness 
} from "@/lib/dispatch/schemaGenerator";
import { 
  renderOpenGraphHtmlMetaTags, 
  validateOpenGraphCompleteness 
} from "@/lib/dispatch/openGraphGenerator";
import { 
  buildAutoBlogHeaders, 
  testAutoBlogHandshake, 
  publishToAutoBlog, 
  AutoBlogHandshakeResult, 
  AutoBlogDispatchResult, 
  DEFAULT_CAPITANIA_KEY 
} from "@/lib/dispatch/autoblogConnector";
import { 
  buildWordPressBasicAuth, 
  buildWordPressHeaders, 
  compileWordPressPostPayload, 
  testWordPressHandshake, 
  publishToWordPress, 
  WordPressHandshakeResult, 
  WordPressDispatchResult, 
  DEFAULT_WP_SITE_URL, 
  DEFAULT_WP_CONFIG 
} from "@/lib/dispatch/wordpressConnector";
import { 
  generateGoogleMetaExcerpt, 
  evaluateExcerptQuality, 
  rebalanceExcerptToSerpLimit,
  cleanMarkdownForExcerpt,
  ExcerptQualityScore 
} from "@/lib/seo/excerptExtractor";
import { 
  analyzeContentTaxonomy, 
  V5_TAXONOMIES, 
  TaxonomySuggestion, 
  normalizeTagName 
} from "@/lib/seo/taxonomyEngine";
import { V5AutoBlogWebSimulator } from "@/components/poster/V5AutoBlogWebSimulator";
import { GoogleRichResultsInspector } from "@/components/poster/GoogleRichResultsInspector";
import { TwitterTeaserCard } from "@/components/poster/TwitterTeaserCard";
import { ThreadsTeaserCard } from "@/components/poster/ThreadsTeaserCard";
import { InstagramCaptionCard } from "@/components/poster/InstagramCaptionCard";
import { WhatsAppMessageCard } from "@/components/poster/WhatsAppMessageCard";
import { TelegramMessageCard } from "@/components/poster/TelegramMessageCard";
import { SocialTeasersEditorPanel } from "@/components/poster/SocialTeasersEditorPanel";
import { CopyAllTeasersButton } from "@/components/poster/CopyAllTeasersButton";

export const IMAGE_PRESETS = [
  {
    label: "Inteligência Artificial",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
    alt: "Visualização abstrata de redes neurais e fluxo de dados em IA"
  },
  {
    label: "Cloud & Servidores",
    url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200",
    alt: "Infraestrutura de datacenter de alta performance em nuvem"
  },
  {
    label: "SaaS & Dashboard",
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200",
    alt: "Painel de métricas e analytics de crescimento para SaaS"
  },
  {
    label: "Finanças & Conversão",
    url: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200",
    alt: "Crescimento financeiro, investimento e performance de receita"
  },
  {
    label: "Comunicação & Mídia",
    url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200",
    alt: "Mídia digital, canais de distribuição de conteúdo e audiência"
  }
];

export const PRESET_CATEGORIES = [
  "Inteligência Artificial",
  "Afiliados & Achadinhos",
  "Produtividade & Automação",
  "SaaS & Startups",
  "Marketing & Growth",
  "Finanças Digitais & E-commerce"
];

export const PRESET_AUDIENCES = [
  "Assinantes VIP (1.845 inscritos)",
  "Lista Geral Newsletter (14.200 inscritos)",
  "Compradores Recentes (3.120 inscritos)",
  "Todos os Inscritos Ativos (19.165 inscritos)"
];

export const PRESET_AUTHORS = [
  "Redação Apollo",
  "Apollo La Plata",
  "V5 Growth Team",
  "Holding V5 Apollo"
];

const DEFAULT_PAYLOAD: MultimodalDispatchPayload = {
  id: "dispatch-001",
  title: "A Revolução Silenciosa dos Agentes Autônomos em 2026",
  slug: "revolucao-silenciosa-agentes-autonomos-2026",
  summary: "Como ecossistemas de agentes autônomos estão eliminando gargalos de produção e acelerando entregas digitais.",
  coverImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
  coverImageAlt: "Ecossistema de Inteligência Artificial e Agentes Autônomos",
  contentMarkdown: `# A Revolução Silenciosa dos Agentes Autônomos em 2026

Olá! Se você acompanha tecnologia, provavelmente já percebeu que o jogo mudou.
Não estamos mais falando apenas de chats de conversação. Estamos falando de ecossistemas inteiros de agentes cooperando em segundo plano.

### Os 3 Pilares do Novo Fluxo de Trabalho:
1. **Memória Contínua (RAG Local):** Nunca mais recomeçar do zero.
2. **Despacho Multimodal Nativo:** Escrever uma vez e transmitir simultaneamente para Blog, Email e Redes.
3. **Micro-serviços Desacoplados:** Cada robô com seu propósito único e bem definido.

> *"A produtividade real não é fazer mais tarefas manuais, é eliminar totalmente o atrito entre a produção da ideia e a distribuição em massa."*

---

### O que isso significa na prática?
Quando você une um motor de escrita inteligente a uma esteira de despacho automatizada, você ganha velocidade de mídia de grandes portais com uma equipe enxuta.

### Comparativo de Eficiência Onicanal:
| Pilar Operacional | Método Tradicional | Ecossistema V5 Poster |
| :--- | :---: | ---: |
| Redação & E-mail | 3 a 5 horas | 8 minutos |
| Indexação AutoBlog | Manual / CMS | Instantâneo (REST API) |
| Disparo Grupos VIP | Copia e cola | Transmissão com 1 Clique |

Nos vemos na próxima transmissão!`,
  emailOptions: {
    enabled: true,
    subject: "A Revolução Silenciosa dos Agentes Autônomos em 2026",
    previewText: "Descubra como os ecossistemas autônomos operam pipelines de produção sem fricção...",
    fromName: "Holding V5 Apollo",
    provider: "resend",
    audienceList: "Assinantes VIP (1.845 inscritos)",
    utmCampaign: "newsletter_agentes_2026",
    footerAddress: "Holding V5 Apollo Ltda. • Av. Paulista, 1000 - Bela Vista, São Paulo/SP - CEP 01310-100, Brasil",
    permissionReminder: "Você está recebendo esta mensagem porque se inscreveu na newsletter oficial de inteligência e automação da Holding V5 Apollo através do portal AutoBlog ou de nossas capitanias parceiras."
  },
  blogOptions: {
    enabled: true,
    targetPlatform: "v5autoblog",
    targetEndpoint: "https://v5autoblog.com/api/v1/posts",
    category: "Inteligência Artificial",
    tags: ["Agentes IA", "Automação", "Produtividade", "SaaS"],
    author: "Redação Apollo",
    generateSchema: true,
    capitaniaKey: DEFAULT_CAPITANIA_KEY,
    wordpressConfig: {
      siteUrl: DEFAULT_WP_SITE_URL,
      username: "apollo_admin",
      applicationPassword: "v5ap 3011 post live pass",
      status: "publish"
    }
  },
  socialTeaserOptions: {
    enabled: true,
    platforms: ["instagram", "x_twitter", "threads", "telegram", "whatsapp"]
  },
  dispatchStatus: {
    overall: "idle",
    email: { status: "idle" },
    blog: { status: "idle" },
    social: { status: "idle" }
  }
};

function formatInline(text: string): React.ReactNode {
  const regex = /(\*\*.*?\*\*|~~.*?~~|`.*?`|\[.*?\]\(.*?\))/g;
  const parts = text.split(regex);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="text-white font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("~~") && part.endsWith("~~")) {
      return (
        <span key={index} className="line-through text-zinc-500">
          {part.slice(2, -2)}
        </span>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="bg-zinc-800 text-amber-300 px-1.5 py-0.5 rounded text-[11px] font-mono border border-zinc-700/60">
          {part.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
    if (linkMatch) {
      return (
        <a 
          key={index} 
          href={linkMatch[2]} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-amber-400 underline hover:text-amber-300 font-medium"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
}

function renderTableElement(tableLines: string[], keyIndex: number) {
  if (tableLines.length === 0) return null;

  const extractCells = (row: string) => {
    return row
      .split("|")
      .map(c => c.trim())
      .filter((_, idx, arr) => idx !== 0 && idx !== arr.length - 1);
  };

  const headerCells = extractCells(tableLines[0]);
  let alignments: ("left" | "center" | "right")[] = headerCells.map(() => "left");
  let dataStartIndex = 1;

  if (tableLines.length > 1 && /^\|?(\s*:?-+:?\s*\|?)+$/.test(tableLines[1])) {
    const sepCells = extractCells(tableLines[1]);
    alignments = sepCells.map(cell => {
      if (cell.startsWith(":") && cell.endsWith(":")) return "center";
      if (cell.endsWith(":")) return "right";
      return "left";
    });
    dataStartIndex = 2;
  }

  return (
    <div key={keyIndex} className="overflow-x-auto my-6 rounded-xl border border-zinc-800 bg-zinc-950/80 shadow-lg">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-zinc-900 border-b-2 border-amber-500/40 text-amber-300 font-bold uppercase tracking-wider font-mono">
            {headerCells.map((h, idx) => (
              <th 
                key={idx} 
                className={`px-4 py-3 ${alignments[idx] === "center" ? "text-center" : alignments[idx] === "right" ? "text-right" : "text-left"}`}
              >
                {formatInline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60 font-sans">
          {tableLines.slice(dataStartIndex).map((row, rIdx) => {
            const cells = extractCells(row);
            return (
              <tr 
                key={rIdx} 
                className={`transition ${rIdx % 2 === 0 ? "bg-zinc-950/40" : "bg-zinc-900/20"} hover:bg-zinc-800/40`}
              >
                {cells.map((cell, cIdx) => (
                  <td 
                    key={cIdx} 
                    className={`px-4 py-2.5 text-zinc-300 ${alignments[cIdx] === "center" ? "text-center" : alignments[cIdx] === "right" ? "text-right" : "text-left"}`}
                  >
                    {formatInline(cell)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function renderMarkdownToHtml(markdown: string) {
  const lines = markdown.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      elements.push(<div key={`sp-${i}`} className="h-4" />);
      continue;
    }

    // Suporte a Tabelas Markdown: | col1 | col2 |
    if (line.startsWith("|") && line.endsWith("|") && line.includes("|")) {
      const tableLines: string[] = [line];
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith("|") && lines[i + 1].trim().endsWith("|")) {
        i++;
        tableLines.push(lines[i].trim());
      }
      elements.push(renderTableElement(tableLines, i));
      continue;
    }

    // Suporte a Imagem inline no corpo: ![ALT](URL)
    const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      const alt = imgMatch[1] || "Imagem ilustrativa";
      const src = imgMatch[2];
      elements.push(
        <figure key={i} className="my-6 text-center">
          <img
            src={src}
            alt={alt}
            className="w-full max-h-[460px] object-cover rounded-xl border border-zinc-800 shadow-md mx-auto"
            loading="lazy"
          />
          {alt && (
            <figcaption className="text-center text-xs text-zinc-500 mt-2 italic font-mono">
              {alt}
            </figcaption>
          )}
        </figure>
      );
      continue;
    }

    // Suporte a Botão CTA Bulletproof personalizado no Markdown: [CTA:Texto|URL]
    if (/^\[(?:CTA|BUTTON|BOTAO):(.*?)\|(https?:\/\/[^\s\]]+)\]$/i.test(line)) {
      const ctaMatch = line.match(/^\[(?:CTA|BUTTON|BOTAO):(.*?)\|(https?:\/\/[^\s\]]+)\]$/i);
      if (ctaMatch) {
        const ctaLabel = ctaMatch[1].trim();
        const ctaUrl = ctaMatch[2].trim();
        elements.push(
          <div key={`cta-${i}`} className="my-6 text-center">
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all transform hover:-translate-y-0.5"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>{ctaLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        );
        continue;
      }
    }

    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-6 mb-3 font-sans">
          {line.replace("# ", "")}
        </h1>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-xl md:text-2xl font-bold text-zinc-100 tracking-tight mt-5 mb-2.5 font-sans">
          {line.replace("## ", "")}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-base md:text-lg font-semibold text-amber-300 mt-4 mb-2 font-sans">
          {line.replace("### ", "")}
        </h3>
      );
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i} className="border-l-4 border-amber-500 pl-4 py-2 my-4 bg-amber-500/10 text-amber-200 italic rounded-r-lg text-sm leading-relaxed">
          {line.replace("> ", "").replace(/^"(.*)"$/, "$1")}
        </blockquote>
      );
    } else if (line.includes("[PAYWALL_BREAK") || line.includes("<!-- paywall") || line.includes("<!-- PAYWALL")) {
      elements.push(
        <div key={i} className="my-8 p-5 bg-gradient-to-r from-amber-500/10 via-amber-950/20 to-zinc-950 border-2 border-dashed border-amber-500/40 rounded-2xl text-center space-y-3 shadow-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>PAYWALL BREAK • CORTE DE ASSINATURA VIP</span>
          </div>
          <h4 className="text-sm font-bold text-white">Conteúdo Exclusivo para Membros VIP a partir deste ponto</h4>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Na transmissão para a lista gratuita de e-mail e web, o conteúdo abaixo deste divisor será protegido por paywall.
          </p>
          <div className="pt-1 flex items-center justify-center gap-2">
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-lg border border-zinc-700 font-mono">
              Ponto de Corte Definido (Assinantes VIP)
            </span>
          </div>
        </div>
      );
    } else if (line === "---" || line === "***") {
      elements.push(
        <div key={i} className="my-6 border-t border-zinc-800 flex items-center justify-center">
          <span className="bg-zinc-900 px-3 text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
            Linha de Assinatura • Divisor
          </span>
        </div>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li key={i} className="text-sm text-zinc-300 ml-4 list-disc mb-1 leading-relaxed">
          {formatInline(line.substring(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(line)) {
      elements.push(
        <li key={i} className="text-sm text-zinc-300 ml-4 list-decimal mb-1 leading-relaxed">
          {formatInline(line.replace(/^\d+\.\s/, ""))}
        </li>
      );
    } else {
      elements.push(
        <p key={i} className="text-sm text-zinc-300 leading-relaxed mb-3">
          {formatInline(line)}
        </p>
      );
    }
  }

  return elements;
}

export function BeehiivNewsletterEditor() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { newsletterDraft, updateNewsletterDraft, addLog } = usePosterStore();
  const [payload, setPayload] = useState<MultimodalDispatchPayload>(() => {
    if (newsletterDraft && newsletterDraft.contentMarkdown) {
      return {
        ...DEFAULT_PAYLOAD,
        title: newsletterDraft.subject || DEFAULT_PAYLOAD.title,
        slug: slugify(newsletterDraft.subject || DEFAULT_PAYLOAD.title),
        summary: newsletterDraft.previewText || DEFAULT_PAYLOAD.summary,
        contentMarkdown: newsletterDraft.contentMarkdown || DEFAULT_PAYLOAD.contentMarkdown,
        coverImageUrl: newsletterDraft.coverImageUrl || DEFAULT_PAYLOAD.coverImageUrl,
        coverImageAlt: newsletterDraft.coverImageAlt || DEFAULT_PAYLOAD.coverImageAlt,
        emailOptions: {
          ...DEFAULT_PAYLOAD.emailOptions,
          subject: newsletterDraft.subject || DEFAULT_PAYLOAD.emailOptions.subject,
          previewText: newsletterDraft.previewText || DEFAULT_PAYLOAD.emailOptions.previewText
        }
      };
    }
    return DEFAULT_PAYLOAD;
  });

  // Split-Pane View States
  const [splitMode, setSplitMode] = useState<"split" | "editor" | "preview">("split");
  const [previewFormat, setPreviewFormat] = useState<"reader" | "email" | "blog" | "social" | "raw">("reader");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [blogSubView, setBlogSubView] = useState<"portal" | "rich_results" | "json">("portal");
  const [blogJsonTab, setBlogJsonTab] = useState<"full" | "seo" | "schema" | "og" | "ai" | "connector">("full");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<any>(null);

  // AutoBlog REST Connector state (Etapa 044)
  const [isPingingAutoBlog, setIsPingingAutoBlog] = useState(false);
  const [autoBlogHandshakeResult, setAutoBlogHandshakeResult] = useState<AutoBlogHandshakeResult | null>(null);
  const [isPublishingAutoBlog, setIsPublishingAutoBlog] = useState(false);
  const [autoBlogDispatchResult, setAutoBlogDispatchResult] = useState<AutoBlogDispatchResult | null>(null);
  const [showCapitaniaKey, setShowCapitaniaKey] = useState(false);

  // WordPress REST Connector state (Etapa 045)
  const [isPingingWordPress, setIsPingingWordPress] = useState(false);
  const [wordPressHandshakeResult, setWordPressHandshakeResult] = useState<WordPressHandshakeResult | null>(null);
  const [isPublishingWordPress, setIsPublishingWordPress] = useState(false);
  const [wordPressDispatchResult, setWordPressDispatchResult] = useState<WordPressDispatchResult | null>(null);
  const [showWpPassword, setShowWpPassword] = useState(false);
  const [connectorViewTarget, setConnectorViewTarget] = useState<"autoblog" | "wordpress">("autoblog");

  // Taxonomy Engine State (Etapa 047)
  const [taxonomySuggestion, setTaxonomySuggestion] = useState<TaxonomySuggestion | null>(null);

  // Media & Cover Image Modal States
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"cover" | "inline">("cover");
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  const [mediaAltInput, setMediaAltInput] = useState("");

  const handleOpenMediaModal = (target: "cover" | "inline") => {
    setMediaTarget(target);
    if (target === "cover") {
      setMediaUrlInput(payload.coverImageUrl || "");
      setMediaAltInput(payload.coverImageAlt || payload.title || "");
    } else {
      setMediaUrlInput("");
      setMediaAltInput(payload.title ? `Ilustração: ${payload.title}` : "Imagem ilustrativa");
    }
    setIsMediaModalOpen(true);
  };

  const handleApplyMedia = () => {
    if (!mediaUrlInput.trim()) {
      toast.info("URL Necessária", "Informe uma URL válida para a imagem.");
      return;
    }

    const cleanUrl = mediaUrlInput.trim();
    const cleanAlt = mediaAltInput.trim() || payload.title || "Imagem do artigo";

    if (mediaTarget === "cover") {
      setPayload(prev => ({
        ...prev,
        coverImageUrl: cleanUrl,
        coverImageAlt: cleanAlt
      }));
      updateNewsletterDraft({
        coverImageUrl: cleanUrl,
        coverImageAlt: cleanAlt
      });
      toast.success("Imagem de Capa Definida!", "Capa atualizada para E-mail, AutoBlog e Redes.");
    } else {
      const markdownImage = `\n![${cleanAlt}](${cleanUrl})\n`;
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = payload.contentMarkdown;
        const before = text.substring(0, start);
        const after = text.substring(end);
        const newContent = `${before}${markdownImage}${after}`;
        handleContentChange(newContent);
        setTimeout(() => {
          textarea.focus();
          const newCursor = start + markdownImage.length;
          textarea.setSelectionRange(newCursor, newCursor);
        }, 0);
      } else {
        handleContentChange(`${payload.contentMarkdown}\n${markdownImage}`);
      }
      toast.success("Mídia Inserida!", "Imagem adicionada ao corpo do artigo com tag ALT.");
    }

    setIsMediaModalOpen(false);
  };

  const handleRemoveCover = () => {
    setPayload(prev => ({
      ...prev,
      coverImageUrl: undefined,
      coverImageAlt: undefined
    }));
    updateNewsletterDraft({
      coverImageUrl: undefined,
      coverImageAlt: undefined
    });
    toast.info("Capa Removida", "O artigo agora será despachado sem hero banner de capa.");
  };

  const handleSelectPreset = (preset: typeof IMAGE_PRESETS[0]) => {
    setMediaUrlInput(preset.url);
    setMediaAltInput(preset.alt);
  };

  // Publication Settings Drawer States & Handlers
  const [settingsTab, setSettingsTab] = useState<"blog" | "email" | "seo" | "dispatch">("blog");
  const [newTagInput, setNewTagInput] = useState("");

  const handleAddTag = (tagToAdd?: string) => {
    const rawTag = (tagToAdd !== undefined ? tagToAdd : newTagInput).trim();
    if (!rawTag) return;
    const cleanTag = rawTag.replace(/^#/, "");
    if (!payload.blogOptions.tags.includes(cleanTag)) {
      const updatedTags = [...payload.blogOptions.tags, cleanTag];
      setPayload(prev => ({
        ...prev,
        blogOptions: { ...prev.blogOptions, tags: updatedTags }
      }));
      toast.success("Tag Adicionada", `A tag "#${cleanTag}" foi incluída na taxonomia.`);
    }
    setNewTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = payload.blogOptions.tags.filter(t => t !== tagToRemove);
    setPayload(prev => ({
      ...prev,
      blogOptions: { ...prev.blogOptions, tags: updatedTags }
    }));
    toast.info("Tag Removida", `A tag "#${tagToRemove}" foi excluída.`);
  };

  const handleRegenerateSlug = () => {
    const freshSlug = slugify(payload.title);
    setPayload(prev => ({ ...prev, slug: freshSlug }));
    setIsDirty(true);
    toast.info("Slug Atualizado!", `URL canônica baseada no título: ${freshSlug}`);
  };

  // Inspetor de Links UTM (Etapa 033)
  const [copiedUtmKey, setCopiedUtmKey] = useState<string | null>(null);

  const handleCopyTrackingUrl = (url: string, key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopiedUtmKey(key);
    toast.success("Link UTM Copiado!", "URL rastreada pronta para compartilhamento.");
    setTimeout(() => setCopiedUtmKey(null), 2500);
  };

  // Seletor de Provedor de E-mail & Handshake Test (Etapa 036)
  const [isTestingProvider, setIsTestingProvider] = useState(false);
  const [providerTestResult, setProviderTestResult] = useState<ProviderTestResult | null>(null);

  const handleTestProvider = async (providerId: EmailProviderType) => {
    setIsTestingProvider(true);
    setProviderTestResult(null);
    try {
      const result = await testEmailProviderConnection(providerId);
      setProviderTestResult(result);
      if (result.success) {
        toast.success("Provedor Verificado!", `${result.message} (${result.latencyMs}ms)`);
      } else {
        toast.error("Falha na Conexão", result.message);
      }
    } catch (err: any) {
      toast.error("Erro no Teste", err.message || "Falha inesperada ao testar conexão.");
    } finally {
      setIsTestingProvider(false);
    }
  };

  // Visualizador Interativo Desktop 600px & Mobile 360px (Etapa 037)
  const [emailCanvasTheme, setEmailCanvasTheme] = useState<"dark" | "light">("dark");
  const [iframeKey, setIframeKey] = useState(0);

  const handleOpenEmailInNewTab = () => {
    if (typeof window !== "undefined") {
      const blob = new Blob([compiledHtml], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      toast.info("Nova Janela Aberta", "E-mail carregado em tela cheia para inspeção nativa.");
    }
  };

  const handleRefreshIframe = () => {
    setIframeKey(k => k + 1);
    toast.info("Visualização Atualizada", "Iframe recarregado com o HTML compilado mais recente.");
  };

  // Envio de Teste Rápido / Prova para o Operador (Etapa 038)
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState("v5estudio@hotmail.com");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSendResult, setTestSendResult] = useState<SendTestEmailResult | null>(null);
  const [includeProofBanner, setIncludeProofBanner] = useState(true);

  const handleSendTestEmail = async () => {
    if (!testEmailInput.trim()) {
      toast.error("E-mail Obrigatório", "Informe o endereço de e-mail para receber a prova.");
      return;
    }
    setIsSendingTest(true);
    setTestSendResult(null);
    try {
      const result = await sendTestProofEmail({
        recipientEmail: testEmailInput,
        subject: `[PROVA V5 POSTER] ${payload.emailOptions.subject || payload.title}`,
        htmlContent: compiledHtml,
        provider: payload.emailOptions.provider,
        senderName: payload.emailOptions.fromName || "Holding V5 Apollo",
        includeProofBanner
      });
      setTestSendResult(result);
      toast.success("E-mail de Prova Enviado!", `Entregue para ${result.recipientEmail} via ${result.provider.toUpperCase()} (${result.latencyMs}ms).`);
      
      addLog({
        channel: "newsletter",
        action: "publish",
        status: "success",
        statusCode: 200,
        message: `E-mail de Prova despachado com sucesso via ${result.provider} para ${result.recipientEmail}`,
        payloadSummary: `MessageId: ${result.messageId} | Assunto: ${payload.emailOptions.subject || payload.title}`,
        latencyMs: result.latencyMs
      });
    } catch (err: any) {
      toast.error("Falha no Envio de Prova", err.message || "Erro desconhecido.");
    } finally {
      setIsSendingTest(false);
    }
  };

  // Auditoria de Spam Score e Entregabilidade em Tempo Real (Etapa 039)
  const [isSpamModalOpen, setIsSpamModalOpen] = useState(false);
  const [lastAuditTimestamp, setLastAuditTimestamp] = useState<string>(() => {
    return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  });

  const spamAudit: SpamAuditResult = React.useMemo(() => {
    return auditEmailSpamScore({
      subject: payload.emailOptions.subject || payload.title,
      contentMarkdown: payload.contentMarkdown,
      previewText: payload.emailOptions.previewText,
      fromName: payload.emailOptions.fromName,
      includeFooterNotice: true
    });
  }, [payload.title, payload.contentMarkdown, payload.emailOptions]);

  const handleReauditSpam = () => {
    setLastAuditTimestamp(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    toast.info(
      "Auditoria Atualizada", 
      `Spam Score: ${spamAudit.score.toFixed(1)}/10 • Entregabilidade Estimada: ${spamAudit.deliverabilityEstimate}%`
    );
  };

  // Auto-Save States & Handlers (Etapa 029)
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(() => {
    const now = new Date();
    return now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  });
  const [isDirty, setIsDirty] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const performAutoSave = React.useCallback(() => {
    setSaveStatus("saving");

    // Persiste no Zustand
    updateNewsletterDraft({
      subject: payload.title,
      previewText: payload.emailOptions.previewText,
      contentMarkdown: payload.contentMarkdown,
      coverImageUrl: payload.coverImageUrl,
      coverImageAlt: payload.coverImageAlt
    });

    // Salva snapshot no localStorage para recuperação instantânea
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("v5_poster_autosave_payload", JSON.stringify({
          payload,
          savedAt: new Date().toISOString()
        }));
      } catch (err) {
        console.warn("Falha ao salvar no localStorage", err);
      }
    }

    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastSavedTime(timeStr);
      setSaveStatus("saved");
      setIsDirty(false);
    }, 350);
  }, [payload, updateNewsletterDraft]);

  // Efeito de Auto-Save a cada 3 segundos com Debounce
  useEffect(() => {
    if (!isDirty) return;

    setSaveStatus("unsaved");
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      performAutoSave();
    }, 3000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [isDirty, payload, performAutoSave]);

  // Atalho global Ctrl+S / Cmd+S para forçar salvamento imediato
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        performAutoSave();
        toast.success("Rascunho Salvo!", "Todas as alterações foram preservadas no armazenamento local (Ctrl+S).");
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [performAutoSave]);

  const compiledHtml = compileEmailHtml(payload);
  const compiledBlogJson = compileBlogPayload(payload);
  const compiledTeasers = compileSocialTeasers(payload);

  const metadata = extractContentMetadata(payload.contentMarkdown);
  const words = metadata.wordCount;
  const chars = metadata.charCount;
  const readingTime = metadata.readingTimeMinutes;
  const linesCount = payload.contentMarkdown.split("\n").length;

  const handleInjectKeywordsAsTags = () => {
    handleAutoSuggestTaxonomy();
  };

  const handleAutoSuggestTaxonomy = () => {
    const suggestion = analyzeContentTaxonomy(payload.contentMarkdown, payload.title);
    setTaxonomySuggestion(suggestion);

    // Mescla tags normalizadas sem duplicar
    const currentTagsLower = new Set(payload.blogOptions.tags.map(t => t.toLowerCase()));
    const newTags = [...payload.blogOptions.tags];
    for (const tagObj of suggestion.suggestedTags) {
      if (!currentTagsLower.has(tagObj.tag.toLowerCase())) {
        newTags.push(tagObj.tag);
        currentTagsLower.add(tagObj.tag.toLowerCase());
      }
    }

    setPayload(prev => ({
      ...prev,
      blogOptions: {
        ...prev.blogOptions,
        category: suggestion.recommendedCategory,
        tags: newTags
      }
    }));

    toast.success(
      "Taxonomia IA Aplicada!",
      `Categoria: ${suggestion.recommendedCategory} (${suggestion.categoryConfidence}% afinidade) • ${suggestion.suggestedTags.length} tags mapeadas.`
    );
  };

  const handleQuickAddTag = (tagToAdd: string) => {
    const cleanTag = normalizeTagName(tagToAdd);
    if (!cleanTag) return;
    if (!payload.blogOptions.tags.some(t => t.toLowerCase() === cleanTag.toLowerCase())) {
      setPayload(prev => ({
        ...prev,
        blogOptions: {
          ...prev.blogOptions,
          tags: [...prev.blogOptions.tags, cleanTag]
        }
      }));
      toast.info("Tag Adicionada", `#${cleanTag}`);
    }
  };

  const handleSanitizeContent = () => {
    const result = sanitizeMarkdownAdvanced(payload.contentMarkdown);
    if (result.hasModifications) {
      handleContentChange(result.cleanContent);
      toast.success(
        "Artigo Sanitizado!",
        `Removidos: ${result.removedPatterns.join(", ")}.`
      );
    } else {
      toast.info(
        "Artigo 100% Seguro!",
        "Nenhum script, iframe ou caractere invisível detectado no texto."
      );
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(label);
    toast.info("Copiado!", `${label} transferido para a área de transferência.`);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const handleAutoExtractGoogleExcerpt = () => {
    const result = generateGoogleMetaExcerpt(payload.contentMarkdown, {
      focusKeywords: payload.blogOptions.tags,
      actionCall: "Confira a análise completa.",
      minChars: 150,
      maxChars: 160
    });
    setPayload(prev => ({
      ...prev,
      summary: result.excerpt
    }));
    toast.success(
      "Excerpt Otimizado para o Google!",
      `${result.characterCount} caracteres (${result.quality.status === "optimal" ? "Sweet Spot SERP 100%" : "Ajustado"})`
    );
  };

  const handleTestAutoBlogHandshake = async () => {
    setIsPingingAutoBlog(true);
    try {
      const res = await testAutoBlogHandshake({
        endpoint: payload.blogOptions.targetEndpoint,
        capitaniaKey: payload.blogOptions.capitaniaKey
      });
      setAutoBlogHandshakeResult(res);
      if (res.success) {
        toast.success(
          "Handshake AutoBlog OK",
          `Status ${res.statusCode} (${res.latencyMs}ms) • ${res.isMock ? "Mock Gateway" : "API Live"}`
        );
      } else {
        toast.error("Falha no Handshake", res.message);
      }
    } catch (e) {
      toast.error("Erro no Handshake", String(e));
    } finally {
      setIsPingingAutoBlog(false);
    }
  };

  const handlePublishToAutoBlogDirect = async () => {
    setIsPublishingAutoBlog(true);
    try {
      const compiledPayload = compileBlogPayload(payload);
      const res = await publishToAutoBlog(compiledPayload, {
        endpoint: payload.blogOptions.targetEndpoint,
        capitaniaKey: payload.blogOptions.capitaniaKey
      });
      setAutoBlogDispatchResult(res);
      if (res.success) {
        toast.success(
          "Publicado no V5 AutoBlog!",
          `Post ID: ${res.postId} (${res.latencyMs}ms)`
        );
        setPayload(prev => ({
          ...prev,
          dispatchStatus: {
            ...prev.dispatchStatus,
            blog: {
              status: "sent",
              publishedUrl: res.publishedUrl,
              statusCode: res.statusCode
            }
          }
        }));
      } else {
        toast.error("Erro na Publicação", res.message);
      }
    } catch (e) {
      toast.error("Erro ao Publicar", String(e));
    } finally {
      setIsPublishingAutoBlog(false);
    }
  };

  const handleTestWordPressHandshake = async () => {
    setIsPingingWordPress(true);
    try {
      const res = await testWordPressHandshake({
        siteUrl: payload.blogOptions.wordpressConfig?.siteUrl,
        username: payload.blogOptions.wordpressConfig?.username,
        applicationPassword: payload.blogOptions.wordpressConfig?.applicationPassword
      });
      setWordPressHandshakeResult(res);
      if (res.success) {
        toast.success(
          "Handshake WordPress OK",
          `Status ${res.statusCode} (${res.latencyMs}ms) • ${res.authenticatedUser?.name || "Autenticado"}`
        );
      } else {
        toast.error("Falha no Handshake WordPress", res.message);
      }
    } catch (e) {
      toast.error("Erro no Handshake WordPress", String(e));
    } finally {
      setIsPingingWordPress(false);
    }
  };

  const handlePublishToWordPressDirect = async () => {
    setIsPublishingWordPress(true);
    try {
      const wpPayload = compileWordPressPostPayload(payload);
      const res = await publishToWordPress(wpPayload, {
        siteUrl: payload.blogOptions.wordpressConfig?.siteUrl,
        username: payload.blogOptions.wordpressConfig?.username,
        applicationPassword: payload.blogOptions.wordpressConfig?.applicationPassword
      });
      setWordPressDispatchResult(res);
      if (res.success) {
        toast.success(
          "Publicado no WordPress!",
          `Post ID: ${res.postId} (${res.latencyMs}ms)`
        );
        setPayload(prev => ({
          ...prev,
          dispatchStatus: {
            ...prev.dispatchStatus,
            blog: {
              ...prev.dispatchStatus.blog,
              status: "sent",
              wordpressUrl: res.publishedUrl,
              wordpressStatusCode: res.statusCode
            }
          }
        }));
      } else {
        toast.error("Erro na Publicação WordPress", res.message);
      }
    } catch (e) {
      toast.error("Erro ao Publicar no WordPress", String(e));
    } finally {
      setIsPublishingWordPress(false);
    }
  };

  const handleTriggerDispatch = async () => {
    setIsDispatching(true);
    setExecutionResult(null);

    // Sanitização de segurança garantida antes do disparo
    const sanitizedClean = sanitizeMarkdownAdvanced(payload.contentMarkdown).cleanContent;
    const sanitizedPayload = { ...payload, contentMarkdown: sanitizedClean };

    const result = await executeMockDispatch(sanitizedPayload);

    // Conexão direta com a Capitania #13 AutoBlog REST API (Etapa 044)
    let blogPublishedUrl = result.blogResult.publishedUrl;
    let blogStatusCode = result.blogResult.statusCode;
    if (payload.blogOptions.enabled && (payload.blogOptions.targetPlatform === "v5autoblog" || payload.blogOptions.targetPlatform === "both")) {
      try {
        const blogPayload = compileBlogPayload(sanitizedPayload);
        const autoBlogRes = await publishToAutoBlog(blogPayload, {
          endpoint: payload.blogOptions.targetEndpoint,
          capitaniaKey: payload.blogOptions.capitaniaKey
        });
        if (autoBlogRes.success) {
          blogPublishedUrl = autoBlogRes.publishedUrl;
          blogStatusCode = autoBlogRes.statusCode;
          setAutoBlogDispatchResult(autoBlogRes);
        }
      } catch (err) {
        console.error("AutoBlog Dispatch Error:", err);
      }
    }

    // Conexão com WordPress REST API via Application Passwords (Etapa 045)
    let wpPublishedUrl: string | undefined;
    let wpStatusCode: number | undefined;
    if (payload.blogOptions.enabled && (payload.blogOptions.targetPlatform === "wordpress" || payload.blogOptions.targetPlatform === "both")) {
      try {
        const wpPayload = compileWordPressPostPayload(sanitizedPayload);
        const wpRes = await publishToWordPress(wpPayload, {
          siteUrl: payload.blogOptions.wordpressConfig?.siteUrl,
          username: payload.blogOptions.wordpressConfig?.username,
          applicationPassword: payload.blogOptions.wordpressConfig?.applicationPassword
        });
        if (wpRes.success) {
          wpPublishedUrl = wpRes.publishedUrl;
          wpStatusCode = wpRes.statusCode;
          setWordPressDispatchResult(wpRes);
        }
      } catch (err) {
        console.error("WordPress Dispatch Error:", err);
      }
    }

    setIsDispatching(false);
    setExecutionResult(result);
    setPayload(prev => ({
      ...prev,
      dispatchStatus: {
        overall: "completed",
        email: { status: "sent", sentCount: result.emailResult.sentCount, messageId: result.emailResult.messageId },
        blog: { 
          status: "sent", 
          publishedUrl: blogPublishedUrl, 
          statusCode: blogStatusCode,
          wordpressUrl: wpPublishedUrl,
          wordpressStatusCode: wpStatusCode
        },
        social: { status: "sent", deliveredChannels: result.socialResult.deliveredChannels }
      }
    }));

    toast.success(
      "Despacho Concluído!",
      `Enviado para ${result.emailResult.sentCount} e-mails, AutoBlog HTTP ${result.blogResult.statusCode} e redes sociais.`
    );

    dispatchEventBus.emit("POST_DISPATCHED", {
      postId: payload.id,
      title: payload.title,
      platforms: ["newsletter", "autoblog", "whatsapp", "telegram"],
      status: "success"
    });
  };

  const handleContentChange = (newContent: string) => {
    setPayload(prev => ({ ...prev, contentMarkdown: newContent }));
    updateNewsletterDraft({ contentMarkdown: newContent });
    setIsDirty(true);
  };

  const handleTitleChange = (newTitle: string) => {
    const newSlug = slugify(newTitle);
    setPayload(prev => ({
      ...prev,
      title: newTitle,
      slug: newSlug,
      emailOptions: { ...prev.emailOptions, subject: newTitle }
    }));
    updateNewsletterDraft({ subject: newTitle });
    setIsDirty(true);
  };

  const handlePreviewTextChange = (newPreview: string) => {
    setPayload(prev => ({
      ...prev,
      summary: newPreview,
      emailOptions: { ...prev.emailOptions, previewText: newPreview }
    }));
    updateNewsletterDraft({ previewText: newPreview });
    setIsDirty(true);
  };

  const applyMarkdownFormat = (prefix: string, suffix: string = "", defaultText: string = "texto") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = payload.contentMarkdown;

    const selectedText = text.substring(start, end) || defaultText;
    const before = text.substring(0, start);
    const after = text.substring(end);

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newContent = `${before}${replacement}${after}`;

    handleContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 0);
  };

  const applyBlockFormat = (prefix: string, defaultText: string = "Título da Seção") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = payload.contentMarkdown;

    const selectedText = text.substring(start, end) || defaultText;
    const isStartOfLine = start === 0 || text[start - 1] === "\n";
    const linePrefix = isStartOfLine ? "" : "\n";
    
    const before = text.substring(0, start);
    const after = text.substring(end);

    const replacement = `${linePrefix}${prefix} ${selectedText}\n`;
    const newContent = `${before}${replacement}${after}`;

    handleContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      const newCursor = start + linePrefix.length + prefix.length + 1 + selectedText.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === "b") {
        e.preventDefault();
        applyMarkdownFormat("**", "**", "texto em negrito");
      } else if (e.key.toLowerCase() === "i") {
        e.preventDefault();
        applyMarkdownFormat("*", "*", "texto em itálico");
      } else if (e.key.toLowerCase() === "k") {
        e.preventDefault();
        applyMarkdownFormat("[", "](https://seulink.com)", "Texto do Link");
      } else if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        performAutoSave();
        toast.success("Rascunho Salvo!", "Preservado com sucesso no armazenamento local (Ctrl+S).");
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Split-Pane Controls Bar */}
      <div className="bg-zinc-900/70 p-4 md:p-5 rounded-2xl border border-zinc-800 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Motor Dual Beehiiv / Substack • Split-Pane Editor</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Redação Unificada & Despacho Multimodal</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Edite o texto uma única vez com renderização simultânea no leitor, e-mail HTML e payload do AutoBlog.
          </p>
        </div>

        {/* Action Controls: Split Modes + Settings + Telemetry */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
          {/* Interactive Telemetry pill */}
          <button
            type="button"
            onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
            className={`hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-[11px] font-mono transition cursor-pointer ${
              isAnalyticsOpen 
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm" 
                : "bg-zinc-950/80 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"
            }`}
            title="Clique para ver Diagnóstico Semântico e Densidade de Palavras"
          >
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3 text-amber-400" />
              <strong className="text-zinc-200">{metadata.wordCount}</strong> pal.
            </span>
            <span className="text-zinc-600">•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              <strong className="text-zinc-200">{metadata.readingTimeMinutes}</strong> min
            </span>
            <span className="text-zinc-600">•</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <BarChart2 className="w-3 h-3" />
              <span>{metadata.readabilityScore}/100</span>
            </span>
          </button>

          {/* Badge Interativo de Spam Score em Tempo Real (Etapa 039) */}
          <button
            type="button"
            onClick={() => setIsSpamModalOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-mono transition cursor-pointer shadow-sm ${
              spamAudit.rating === "safe"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                : spamAudit.rating === "moderate"
                ? "bg-amber-500/10 text-amber-300 border-amber-500/40 hover:bg-amber-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/40 hover:bg-rose-500/20"
            }`}
            title="Clique para auditar Spam Score, Entregabilidade e Gatilhos"
          >
            {spamAudit.rating === "safe" && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
            {spamAudit.rating === "moderate" && <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />}
            {spamAudit.rating === "risky" && <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />}
            <span>Spam: <strong className="font-bold">{spamAudit.score.toFixed(1)}</strong></span>
            <span className="text-zinc-600 hidden xl:inline">•</span>
            <span className="hidden xl:inline font-sans font-medium">{spamAudit.deliverabilityEstimate}% Inbox</span>
          </button>

          {/* Status Discreto de Auto-Save (Etapa 029) */}
          <div className="flex items-center">
            {saveStatus === "saving" && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-mono shadow-sm animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Salvando...</span>
              </div>
            )}

            {saveStatus === "saved" && (
              <button
                type="button"
                onClick={() => {
                  performAutoSave();
                  toast.info("Rascunho Atualizado", "Todas as alterações estão preservadas.");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono hover:bg-emerald-500/20 transition cursor-pointer"
                title="Rascunho salvo automaticamente a cada 3s (Clique ou Ctrl+S para salvar)"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Salvo {lastSavedTime ? `às ${lastSavedTime}` : ""}</span>
              </button>
            )}

            {saveStatus === "unsaved" && (
              <button
                type="button"
                onClick={performAutoSave}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 text-amber-300 border border-amber-500/40 text-[11px] font-mono hover:bg-amber-500/10 transition cursor-pointer"
                title="Alterações pendentes. Salvando em 3s ou clique para salvar agora"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Alterações pendentes...</span>
              </button>
            )}
          </div>

          {/* Main View Mode Switcher */}
          <div className="flex items-center bg-zinc-800/90 p-1 rounded-xl border border-zinc-700/60 text-xs">
            <button
              onClick={() => setSplitMode("split")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
                splitMode === "split" ? "bg-amber-500 text-black font-bold shadow" : "text-zinc-400 hover:text-white"
              }`}
              title="Dividir tela (50% Editor / 50% Preview)"
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Split 50/50</span>
            </button>
            <button
              onClick={() => setSplitMode("editor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
                splitMode === "editor" ? "bg-amber-500 text-black font-bold shadow" : "text-zinc-400 hover:text-white"
              }`}
              title="Apenas Editor de Markdown (Tela Cheia)"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Editor Puro</span>
            </button>
            <button
              onClick={() => {
                setSplitMode("preview");
                setPreviewFormat("email");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
                splitMode === "preview" && previewFormat === "email" ? "bg-amber-500 text-black font-bold shadow" : "text-zinc-400 hover:text-white"
              }`}
              title="Preview Exclusivo de E-mail HTML"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Preview E-mail</span>
            </button>
            <button
              onClick={() => {
                setSplitMode("preview");
                setPreviewFormat("blog");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
                splitMode === "preview" && previewFormat === "blog" ? "bg-amber-500 text-black font-bold shadow" : "text-zinc-400 hover:text-white"
              }`}
              title="Preview Exclusivo do AutoBlog Web"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Preview AutoBlog</span>
            </button>
          </div>

          {/* Botão Envio de Teste Rápido / Prova (Etapa 038) */}
          <button
            onClick={() => setIsTestModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold transition shadow-sm"
            title="Disparar E-mail de Prova para o Operador"
          >
            <Send className="w-3.5 h-3.5 text-amber-400" />
            <span>Enviar Prova</span>
          </button>

          {/* Toggle Publication Settings Slide-Over */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
              isSettingsOpen 
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm" 
                : "bg-zinc-800/80 text-zinc-300 border-zinc-700/60 hover:text-white"
            }`}
            title="Abrir Painel Lateral de Configurações de Publicação"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>Configurações</span>
          </button>
        </div>
      </div>

      {/* SEMANTIC DENSITY & METADATA PANEL */}
      {isAnalyticsOpen && (
        <div className="bg-zinc-900/95 border border-amber-500/30 rounded-2xl p-4 md:p-5 shadow-2xl space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Extrator Automático de Metadados & Densidade Semântica</h3>
                <p className="text-[11px] text-zinc-400 font-mono">Diagnóstico em tempo real para SEO no AutoBlog e retenção na Newsletter</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setIsAnalyticsOpen(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Fechar
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-mono block">Tempo Estimado</span>
              <span className="text-base font-bold text-white font-mono mt-0.5 block">{metadata.readingTimeMinutes} min</span>
              <span className="text-[10px] text-zinc-400 font-mono">{metadata.readingTimeSeconds} segundos</span>
            </div>
            <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-mono block">Volume Textual</span>
              <span className="text-base font-bold text-amber-400 font-mono mt-0.5 block">{metadata.wordCount} palavras</span>
              <span className="text-[10px] text-zinc-400 font-mono">{metadata.charCountNoSpaces} carac. sem espaço</span>
            </div>
            <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-mono block">Índice Legibilidade</span>
              <span className="text-base font-bold text-emerald-400 font-mono mt-0.5 block">{metadata.readabilityScore}/100</span>
              <span className="text-[10px] text-emerald-400/80 font-mono">Nível: {metadata.readabilityLevel}</span>
            </div>
            <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-mono block">Estrutura & Seções</span>
              <span className="text-base font-bold text-cyan-400 font-mono mt-0.5 block">{metadata.headingCount.total} títulos</span>
              <span className="text-[10px] text-zinc-400 font-mono">{metadata.paragraphCount} parágrafos • {metadata.hasPaywallBreak ? "🔒 Com Paywall" : "Sem Paywall"}</span>
            </div>
          </div>

          {/* Top Keywords / Semantic Density */}
          <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-amber-400" />
                <span>Top Palavras-Chave e Densidade Semântica (% de ocorrência no texto)</span>
              </span>
              <button
                type="button"
                onClick={handleInjectKeywordsAsTags}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1"
              >
                <span>Injetar como Tags do Blog</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {metadata.topKeywords.length === 0 ? (
                <span className="text-xs text-zinc-500 italic">Escreva mais texto para calcular a densidade semântica...</span>
              ) : (
                metadata.topKeywords.map((kw) => (
                  <div 
                    key={kw.word}
                    className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700/80 px-2.5 py-1 rounded-lg text-xs"
                  >
                    <span className="text-zinc-200 font-medium capitalize">{kw.word}</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
                      {kw.density}% ({kw.count}x)
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Article Meta Bar (Cover Image, Title, Slug, Preheader) */}
      <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 space-y-3.5">
        {/* Cover Image Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-zinc-950/70 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-3">
            {payload.coverImageUrl ? (
              <div className="relative group w-20 h-14 rounded-lg overflow-hidden border border-zinc-700 shrink-0 bg-zinc-900">
                <img
                  src={payload.coverImageUrl}
                  alt={payload.coverImageAlt || "Capa do artigo"}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-lg border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center text-zinc-500 shrink-0">
                <ImageIcon className="w-5 h-5 text-zinc-500" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Imagem de Capa (Hero Banner)</span>
                {payload.coverImageUrl ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-semibold">
                    Ativa
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] font-mono">
                    Opcional
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                {payload.coverImageUrl ? (
                  <span>ALT: <span className="text-zinc-300 italic font-mono">{payload.coverImageAlt || "Sem ALT definido"}</span></span>
                ) : (
                  <span>Banner principal para E-mail, AutoBlog (Schema.org) e Social Cards</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => handleOpenMediaModal("cover")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>{payload.coverImageUrl ? "Alterar Capa" : "Definir Capa"}</span>
            </button>
            {payload.coverImageUrl && (
              <button
                type="button"
                onClick={handleRemoveCover}
                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition"
                title="Remover imagem de capa"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
            Título do Artigo / Assunto do E-mail
          </label>
          <input
            type="text"
            value={payload.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full bg-zinc-950/80 border border-zinc-700/80 focus:border-amber-500 rounded-lg px-3.5 py-2 text-sm text-white font-semibold focus:outline-none"
            placeholder="Digite o título principal..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Slug Canônico (URL do Blog)
            </label>
            <input
              type="text"
              value={payload.slug}
              onChange={(e) => setPayload(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full bg-zinc-950/80 border border-zinc-700/80 focus:border-amber-500 rounded-lg px-3 py-1.5 text-xs text-amber-400 font-mono focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Preheader (E-mail) & Resumo Social
            </label>
            <input
              type="text"
              value={payload.emailOptions.previewText}
              onChange={(e) => handlePreviewTextChange(e.target.value)}
              className="w-full bg-zinc-950/80 border border-zinc-700/80 focus:border-amber-500 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
              placeholder="Linha de abertura que instiga a leitura..."
            />
          </div>
        </div>
      </div>

      {/* DUAL SPLIT-PANE CONTAINER */}
      <div className={`grid grid-cols-1 ${splitMode === "split" ? "lg:grid-cols-2" : ""} gap-5`}>
        {/* LEFT PANE: MARKDOWN SOURCE EDITOR */}
        {(splitMode === "split" || splitMode === "editor") && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
            {/* Left Pane Header */}
            <div className="px-4 py-2.5 bg-zinc-950/80 border-b border-zinc-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-amber-500/10 text-amber-400 font-mono text-[10px] font-bold">
                  MD
                </span>
                <span className="font-bold text-zinc-200 text-xs">Editor Markdown Nativo</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500">
                <span className="text-[10px] text-zinc-400 flex items-center gap-1.5 font-mono">
                  <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saved' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  Auto-save 3s
                </span>
                <span>•</span>
                <span>{linesCount} linhas</span>
                <span>•</span>
                <span>{words} palavras</span>
              </div>
            </div>

            {/* Quick Formatting Toolbar Ribbon */}
            <div className="px-3 py-2 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between gap-1 flex-wrap text-xs text-zinc-300">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Headings */}
                <div className="flex items-center gap-0.5 bg-zinc-950/70 p-0.5 rounded-lg border border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => applyBlockFormat("#", "Título Principal")}
                    className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded transition"
                    title="Título H1 (#)"
                  >
                    <Heading1 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyBlockFormat("##", "Subtítulo")}
                    className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded transition"
                    title="Subtítulo H2 (##)"
                  >
                    <Heading2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyBlockFormat("###", "Seção")}
                    className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded transition"
                    title="Seção H3 (###)"
                  >
                    <Heading3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Text Styles */}
                <div className="flex items-center gap-0.5 bg-zinc-950/70 p-0.5 rounded-lg border border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => applyMarkdownFormat("**", "**", "texto em negrito")}
                    className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded transition"
                    title="Negrito (**Ctrl+B**)"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyMarkdownFormat("*", "*", "texto em itálico")}
                    className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded transition"
                    title="Itálico (*Ctrl+I*)"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyMarkdownFormat("~~", "~~", "texto tachado")}
                    className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded transition"
                    title="Tachado (~~texto~~)"
                  >
                    <Strikethrough className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyMarkdownFormat("`", "`", "código")}
                    className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded transition"
                    title="Código Inline (`código`)"
                  >
                    <Code className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Blocks & Lists */}
                <div className="flex items-center gap-0.5 bg-zinc-950/70 p-0.5 rounded-lg border border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => applyBlockFormat(">", "Citação inspiradora")}
                    className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 rounded transition"
                    title="Citação / Quote (>)"
                  >
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyBlockFormat("-", "Item de lista")}
                    className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded transition"
                    title="Lista com Marcadores (-)"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyBlockFormat("1.", "Passo da metodologia")}
                    className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded transition"
                    title="Lista Numerada (1.)"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyMarkdownFormat("[", "](https://seulink.com)", "Texto do Link")}
                    className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 rounded transition"
                    title="Inserir Link ([Texto](url)) - Ctrl+K"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenMediaModal("inline")}
                    className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 rounded transition"
                    title="Inserir Imagem no Artigo (![ALT](url))"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyBlockFormat("| Métrica / Canal | Status | Impacto |\n| :--- | :---: | ---: |\n| E-mail Newsletter | Ativo | +42% Abertura |\n| AutoBlog SEO | Indexado | +180% Tráfego |\n| VIP Communities | Disparado | +65% CTR |", "")}
                    className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 rounded transition"
                    title="Inserir Tabela Responsiva Markdown (| Col1 | Col2 |)"
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Callout Action */}
                <button
                  type="button"
                  onClick={() => applyBlockFormat("> 💡 **Destaque:**", "Instrução de alto valor para o leitor.")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-medium transition"
                  title="Inserir Callout Box com Dica"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span className="hidden sm:inline">Callout</span>
                </button>

                {/* Editorial Divider */}
                <button
                  type="button"
                  onClick={() => applyBlockFormat("---", "")}
                  className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg border border-zinc-800 transition"
                  title="Inserir Divisor de Conteúdo (---)"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                {/* Botão CTA Bulletproof (Outlook MSO - Etapa 034) */}
                <button
                  type="button"
                  onClick={() => applyBlockFormat(`[CTA:Ler Artigo Completo no Blog →|https://v5autoblog.com/artigo/${payload.slug}]`, "")}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition shadow-sm"
                  title="Inserir Botão CTA de Alta Conversão ([CTA:Texto|URL]) - Compatível com Outlook MSO (VML) e Mobile"
                >
                  <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>Botão CTA</span>
                </button>

                {/* Paywall Break (VIP) */}
                <button
                  type="button"
                  onClick={() => {
                    const textarea = textareaRef.current;
                    const pos = textarea ? textarea.selectionStart : payload.contentMarkdown.length;
                    applyBlockFormat("--- [PAYWALL_BREAK: Conteúdo Exclusivo para Assinantes VIP] ---", "");
                    updateNewsletterDraft({ paywallBreakIndex: pos });
                    toast.info("Paywall Break Definido!", "Divisor de conteúdo restrito para assinantes adicionado.");
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition shadow-sm"
                  title="Inserir Divisor de Assinatura / Paywall Break VIP"
                >
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Paywall Break</span>
                </button>

                {/* Sanitize Action */}
                <button
                  type="button"
                  onClick={handleSanitizeContent}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-emerald-400 border border-zinc-700/60 text-[11px] font-medium transition"
                  title="Sanitizar Artigo: remover scripts maliciosos, iframes e caracteres de controle"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Sanitizar</span>
                </button>
              </div>

              <div className="hidden xl:flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                <span>Ctrl+B (Bold)</span>
                <span>•</span>
                <span>Ctrl+I (Italic)</span>
                <span>•</span>
                <span>Ctrl+K (Link)</span>
              </div>
            </div>

            {/* Markdown Textarea */}
            <div className="flex-1 p-3 bg-zinc-950/40">
              <textarea
                ref={textareaRef}
                value={payload.contentMarkdown}
                onChange={(e) => handleContentChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full min-h-[540px] h-[calc(100vh-380px)] bg-zinc-950/70 border border-zinc-800 focus:border-amber-500/80 rounded-xl p-4 text-xs md:text-sm text-zinc-100 font-mono leading-relaxed resize-none focus:outline-none"
                placeholder="Escreva seu artigo em Markdown aqui..."
                spellCheck={false}
              />
            </div>
          </div>
        )}

        {/* RIGHT PANE: LIVE RENDERED PREVIEW */}
        {(splitMode === "split" || splitMode === "preview") && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
            {/* Right Pane Header */}
            <div className="px-4 py-2 bg-zinc-950/80 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              {/* Preview Format Tabs */}
              <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                <button
                  onClick={() => setPreviewFormat("reader")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                    previewFormat === "reader" ? "bg-amber-500 text-black font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <BookOpen className="w-3 h-3" />
                  <span>Leitor</span>
                </button>
                <button
                  onClick={() => setPreviewFormat("email")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                    previewFormat === "email" ? "bg-amber-500 text-black font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Mail className="w-3 h-3" />
                  <span>E-mail</span>
                </button>
                <button
                  onClick={() => setPreviewFormat("blog")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                    previewFormat === "blog" ? "bg-amber-500 text-black font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  <span>AutoBlog</span>
                </button>
                <button
                  onClick={() => setPreviewFormat("social")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                    previewFormat === "social" ? "bg-amber-500 text-black font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Share2 className="w-3 h-3" />
                  <span>Social Teasers</span>
                </button>
                <button
                  onClick={() => setPreviewFormat("raw")}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono transition ${
                    previewFormat === "raw" ? "bg-amber-500 text-black font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Code className="w-3 h-3" />
                  <span>Raw HTML</span>
                </button>
              </div>

              {/* Controles do Visualizador Interativo Desktop 600px & Mobile 360px (Etapa 037) */}
              <div className="flex items-center gap-1.5">
                {/* Viewport Device Toggle Desktop (600px) vs Mobile (360px) */}
                <div className="flex items-center gap-0.5 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-[11px]">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`flex items-center gap-1 px-2 py-1 rounded transition text-[11px] font-mono ${
                      previewDevice === "desktop" ? "bg-amber-500 text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
                    }`}
                    title="Simulação Desktop (Envelope de 600px Padrão)"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Desktop (600px)</span>
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`flex items-center gap-1 px-2 py-1 rounded transition text-[11px] font-mono ${
                      previewDevice === "mobile" ? "bg-amber-500 text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
                    }`}
                    title="Simulação Smartphone Mobile (360px Viewport)"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mobile (360px)</span>
                  </button>
                </div>

                {/* Controles específicos de E-mail */}
                {previewFormat === "email" && (
                  <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                    <button
                      onClick={() => setEmailCanvasTheme(t => t === "dark" ? "light" : "dark")}
                      className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                      title={emailCanvasTheme === "dark" ? "Alternar para Fundo Claro" : "Alternar para Fundo Escuro"}
                    >
                      {emailCanvasTheme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                    <button
                      onClick={handleRefreshIframe}
                      className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                      title="Recarregar Preview (Refresh)"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleOpenEmailInNewTab}
                      className="p-1 rounded text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition"
                      title="Abrir em Nova Aba (Tela Cheia Nativa)"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Pane Body */}
            <div className="flex-1 p-3 bg-zinc-950/40 overflow-y-auto min-h-[540px] h-[calc(100vh-380px)]">
              {/* 1. MODO LEITOR (EDITORIAL BEEHIIV / SUBSTACK) */}
              {previewFormat === "reader" && (
                <div className={`mx-auto transition-all ${previewDevice === "mobile" ? "max-w-[375px] bg-zinc-950 border-2 border-zinc-700 rounded-3xl p-5 shadow-2xl my-2" : "w-full bg-zinc-900/40 p-6 md:p-8 rounded-xl border border-zinc-800/60"}`}>
                  {/* Article Metadata Header */}
                  <div className="border-b border-zinc-800/80 pb-5 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold font-mono">
                        {payload.blogOptions.category}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {readingTime} min de leitura
                      </span>
                    </div>

                    <h1 className="text-xl md:text-2xl font-bold text-white leading-tight mb-2">
                      {payload.title}
                    </h1>

                    {payload.summary && (
                      <p className="text-xs md:text-sm text-zinc-400 leading-relaxed mb-4">
                        {payload.summary}
                      </p>
                    )}

                    <div className="flex items-center gap-3 pt-3 border-t border-zinc-800/60 text-xs text-zinc-400">
                      <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-xs">
                        AP
                      </div>
                      <div>
                        <span className="font-semibold text-zinc-200 block">{payload.blogOptions.author}</span>
                        <span className="text-[10px] text-zinc-500">Publicação Onicanal • 27 Out 2026</span>
                      </div>
                    </div>
                  </div>

                  {/* Hero Cover Image in Reader */}
                  {payload.coverImageUrl && (
                    <div className="relative mb-6 rounded-xl overflow-hidden border border-zinc-800 shadow-lg max-h-[380px] bg-zinc-950">
                      <img
                        src={payload.coverImageUrl}
                        alt={payload.coverImageAlt || payload.title}
                        className="w-full h-auto max-h-[380px] object-cover"
                      />
                      {payload.coverImageAlt && (
                        <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-[10px] text-zinc-300 px-2.5 py-1 rounded-md font-mono border border-zinc-700/60">
                          ALT: {payload.coverImageAlt}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rendered Markdown Body */}
                  <div className="prose prose-invert max-w-none text-zinc-300">
                    {renderMarkdownToHtml(payload.contentMarkdown)}
                  </div>
                </div>
              )}

              {/* 2. MODO E-MAIL HTML */}
              {previewFormat === "email" && (
                <div className="flex flex-col h-full space-y-3">
                  {/* Email Envelope Header */}
                  <div className="bg-zinc-900/90 p-3.5 rounded-xl border border-zinc-800 text-xs space-y-2 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                      <div className="space-y-0.5">
                        <span className="text-zinc-400 block font-mono text-[11px]">
                          <strong>De:</strong> {payload.emailOptions.fromName || "Holding V5 Apollo"} &lt;newsletter@v5apollo.com&gt;
                        </span>
                        <span className="text-zinc-400 block font-mono text-[11px]">
                          <strong>Para:</strong> {payload.emailOptions.audienceList}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border flex items-center gap-1 ${
                          payload.emailOptions.provider === "resend"
                            ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
                            : payload.emailOptions.provider === "ses"
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                            : "bg-blue-500/10 text-blue-300 border-blue-500/20"
                        }`}>
                          {payload.emailOptions.provider === "resend" && <Zap className="w-2.5 h-2.5 text-purple-400" />}
                          {payload.emailOptions.provider === "ses" && <Cloud className="w-2.5 h-2.5 text-amber-400" />}
                          {payload.emailOptions.provider === "smtp" && <Server className="w-2.5 h-2.5 text-blue-400" />}
                          <span>
                            {payload.emailOptions.provider === "resend" ? "Resend API • TLS 1.3" : payload.emailOptions.provider === "ses" ? "Amazon SES • SigV4" : "SMTP • STARTTLS"}
                          </span>
                        </span>
                        <button
                          onClick={() => handleCopy(compiledHtml, "HTML E-mail")}
                          className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copiar HTML</span>
                        </button>
                        <button
                          onClick={() => setIsTestModalOpen(true)}
                          className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px] font-mono hover:underline"
                        >
                          <Send className="w-3 h-3" />
                          <span>Enviar Prova</span>
                        </button>
                        <button
                          onClick={() => setIsSpamModalOpen(true)}
                          className={`flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded border transition ${
                            spamAudit.rating === "safe"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                              : spamAudit.rating === "moderate"
                              ? "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
                          }`}
                          title="Auditar Spam Score e Entregabilidade deste E-mail"
                        >
                          {spamAudit.rating === "safe" && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                          {spamAudit.rating === "moderate" && <ShieldAlert className="w-3 h-3 text-amber-400" />}
                          {spamAudit.rating === "risky" && <AlertOctagon className="w-3 h-3 text-rose-400" />}
                          <span>Spam: {spamAudit.score.toFixed(1)}</span>
                        </button>
                      </div>
                    </div>
                    <div className="text-[12px] text-zinc-200">
                      <span className="text-zinc-500 font-semibold font-mono text-[11px]">Assunto: </span>
                      <strong className="text-white">{payload.emailOptions.subject || payload.title}</strong>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] font-mono pt-1 border-t border-zinc-800/60">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-zinc-500 font-semibold">Preheader Invisível: </span>
                        <span className="text-zinc-300 truncate">
                          {payload.emailOptions.previewText || payload.summary || "Sem texto de apoio definido"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-zinc-500">
                          {(payload.emailOptions.previewText || payload.summary || "").length} carac.
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          Anti-Spill Padding Ativo
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsSpamModalOpen(true)}
                          className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                            spamAudit.rating === "safe"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                              : spamAudit.rating === "moderate"
                              ? "bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                          }`}
                          title="Auditar Spam Score e Requisitos de Entrega"
                        >
                          🛡️ Spam: {spamAudit.score.toFixed(1)}/10 ({spamAudit.deliverabilityEstimate}% Inbox)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Responsive Email Frame & Interactive Canvas (Etapa 037) */}
                  <div className={`flex-1 flex justify-center p-4 rounded-xl border border-zinc-800 overflow-x-auto transition-colors ${
                    emailCanvasTheme === "dark" ? "bg-zinc-950" : "bg-slate-200"
                  }`}>
                    {previewDevice === "desktop" ? (
                      /* SIMULADOR DESKTOP (600px) */
                      <div className="w-[600px] flex flex-col rounded-xl overflow-hidden shadow-2xl border border-zinc-700/80 bg-white">
                        {/* Webmail Window Top Bar */}
                        <div className="bg-zinc-900 px-4 py-2 flex items-center justify-between border-b border-zinc-800 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                            <span className="ml-2 text-[10px] font-mono text-zinc-400">
                              Webmail Desktop (Envelope de 600px)
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-mono">
                            <span className="flex items-center gap-1">
                              <Archive className="w-3 h-3" />
                              <span className="hidden sm:inline">Arquivar</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Printer className="w-3 h-3" />
                              <span className="hidden sm:inline">Imprimir</span>
                            </span>
                          </div>
                        </div>

                        {/* Iframe 600px Nativo */}
                        <iframe
                          key={`desktop-${iframeKey}`}
                          srcDoc={compiledHtml}
                          title="Email Preview Desktop 600px"
                          className="w-[600px] h-full min-h-[580px] bg-white border-0"
                        />
                      </div>
                    ) : (
                      /* SIMULADOR SMARTPHONE MOBILE (360px) */
                      <div className="w-[380px] rounded-[42px] border-[5px] border-zinc-700 bg-zinc-950 p-2.5 shadow-2xl flex flex-col items-center">
                        {/* Dynamic Island */}
                        <div className="w-28 h-4.5 bg-black rounded-full flex items-center justify-end px-2 my-1 shadow-inner">
                          <div className="w-2 h-2 rounded-full bg-zinc-800" />
                        </div>

                        {/* Phone Status Bar */}
                        <div className="w-full flex items-center justify-between px-4 py-1 text-[10px] text-zinc-300 font-mono">
                          <span className="font-bold">09:41</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold">5G</span>
                            <Wifi className="w-3 h-3" />
                            <Battery className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        {/* Mobile Mail App Top Bar */}
                        <div className="w-full bg-zinc-900/90 px-3 py-1.5 rounded-t-xl border-b border-zinc-800 flex items-center justify-between text-[11px] text-zinc-300">
                          <div className="flex items-center gap-1 text-amber-400 font-mono text-[10px]">
                            <span>&lt; Caixa de Entrada</span>
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            360 × 740px
                          </div>
                        </div>

                        {/* Iframe 360px Mobile */}
                        <div className="w-[360px] overflow-hidden rounded-b-xl border-x border-b border-zinc-800 bg-white">
                          <iframe
                            key={`mobile-${iframeKey}`}
                            srcDoc={compiledHtml}
                            title="Email Preview Mobile 360px"
                            className="w-[360px] h-full min-h-[560px] bg-white border-0"
                          />
                        </div>

                        {/* Phone Home Indicator Bar */}
                        <div className="w-32 h-1 bg-zinc-600 rounded-full mx-auto my-2" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. MODO AUTOBlog WEB PORTAL & JSON */}
              {previewFormat === "blog" && (
                <div className="h-full flex flex-col space-y-3">
                  {/* AutoBlog Sub-Mode Switcher */}
                  <div className="flex items-center justify-between bg-zinc-900/80 p-2 rounded-xl border border-zinc-800 text-xs">
                    <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
                      <button
                        onClick={() => setBlogSubView("portal")}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition ${
                          blogSubView === "portal" ? "bg-amber-500 text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        <Globe className="w-3 h-3" />
                        <span>Portal Web</span>
                      </button>
                      <button
                        onClick={() => setBlogSubView("rich_results")}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition ${
                          blogSubView === "rich_results" ? "bg-amber-500 text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Google Rich Results & Schema</span>
                      </button>
                      <button
                        onClick={() => setBlogSubView("json")}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition ${
                          blogSubView === "json" ? "bg-amber-500 text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        <Code className="w-3 h-3" />
                        <span>Payload REST API</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleCopy(JSON.stringify(compiledBlogJson, null, 2), "JSON AutoBlog")}
                      className="text-amber-400 hover:underline flex items-center gap-1 text-[11px] font-medium"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar JSON</span>
                    </button>
                  </div>

                  {/* 3.1 V5 AUTOBlog FRONTEND SIMULATION (Etapa 048) */}
                  {blogSubView === "portal" && (
                    <V5AutoBlogWebSimulator
                      payload={payload}
                      readingTimeMinutes={readingTime}
                      wordCount={words}
                      onAutoOptimizeExcerpt={handleAutoExtractGoogleExcerpt}
                      renderMarkdownToHtml={renderMarkdownToHtml}
                    />
                  )}

                  {/* 3.2 GOOGLE RICH RESULTS & SCHEMA INSPECTOR (Etapa 049) */}
                  {blogSubView === "rich_results" && (
                    <GoogleRichResultsInspector payload={payload} />
                  )}

                  {/* 3.2 REST API JSON SCHEMA & EXTENDED SEO METADATA (Etapa 041) */}
                  {blogSubView === "json" && (
                    <div className="flex-1 flex flex-col space-y-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800 overflow-hidden">
                      {/* Top Bar com Status de Endpoint e Contadores SEO */}
                      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-zinc-900/90 rounded-xl border border-zinc-800/80 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold text-[10px]">
                            POST • /api/v1/posts
                          </span>
                          <span className="text-zinc-400 text-[11px] truncate max-w-xs">
                            {compiledBlogJson.target_endpoint}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded border text-[10px] ${
                            compiledBlogJson.seo.meta_title.length <= 60 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}>
                            Title: {compiledBlogJson.seo.meta_title.length}/60c
                          </span>
                          <span className={`px-2 py-0.5 rounded border text-[10px] ${
                            compiledBlogJson.seo.meta_description.length <= 160 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}>
                            Desc: {compiledBlogJson.seo.meta_description.length}/160c
                          </span>
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px]">
                            🤖 AEO Ready
                          </span>
                        </div>
                      </div>

                      {/* Sub-Tabs de Inspeção Estruturada */}
                      <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2 text-[11px] font-mono overflow-x-auto">
                        <button
                          type="button"
                          onClick={() => setBlogJsonTab("full")}
                          className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
                            blogJsonTab === "full" 
                              ? "bg-amber-500 text-black font-bold" 
                              : "bg-zinc-900 text-zinc-400 hover:text-white"
                          }`}
                        >
                          Payload Completo
                        </button>
                        <button
                          type="button"
                          onClick={() => setBlogJsonTab("seo")}
                          className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
                            blogJsonTab === "seo" 
                              ? "bg-amber-500 text-black font-bold" 
                              : "bg-zinc-900 text-zinc-400 hover:text-white"
                          }`}
                        >
                          Tags SEO Estendidas
                        </button>
                        <button
                          type="button"
                          onClick={() => setBlogJsonTab("schema")}
                          className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
                            blogJsonTab === "schema" 
                              ? "bg-amber-500 text-black font-bold" 
                              : "bg-zinc-900 text-zinc-400 hover:text-white"
                          }`}
                        >
                          Schema.org (JSON-LD)
                        </button>
                        <button
                          type="button"
                          onClick={() => setBlogJsonTab("og")}
                          className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
                            blogJsonTab === "og" 
                              ? "bg-amber-500 text-black font-bold" 
                              : "bg-zinc-900 text-zinc-400 hover:text-white"
                          }`}
                        >
                          Open Graph & Twitter
                        </button>
                        <button
                          type="button"
                          onClick={() => setBlogJsonTab("ai")}
                          className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
                            blogJsonTab === "ai" 
                              ? "bg-amber-500 text-black font-bold" 
                              : "bg-zinc-900 text-zinc-400 hover:text-white"
                          }`}
                        >
                          AEO / Key Takeaways
                        </button>
                        <button
                          type="button"
                          onClick={() => setBlogJsonTab("connector")}
                          className={`px-3 py-1 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
                            blogJsonTab === "connector" 
                              ? "bg-amber-500 text-black font-bold" 
                              : "bg-zinc-900 text-zinc-400 hover:text-white"
                          }`}
                        >
                          <Server className="w-3 h-3 text-amber-400" />
                          <span>Conector REST (#13)</span>
                        </button>
                      </div>

                      {/* Schema.org Special Actions Bar (Etapa 042) */}
                      {blogJsonTab === "schema" && (
                        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-zinc-900 border border-amber-500/30 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="font-mono text-zinc-300 text-[11px]">
                              Google Rich Results: <strong className="text-emerald-400">100% Conforme</strong> (BlogPosting + Speakable)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const scriptTag = renderSchemaJsonLdScript(compiledBlogJson.seo.schema_org);
                                handleCopy(scriptTag, "Tag <script> Schema.org");
                              }}
                              className="px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-mono flex items-center gap-1 transition"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copiar Tag &lt;script&gt;</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const breadcrumbs = generateBreadcrumbSchema({
                                  category: payload.blogOptions.category,
                                  articleTitle: payload.title,
                                  articleUrl: compiledBlogJson.canonical_url
                                });
                                handleCopy(JSON.stringify(breadcrumbs, null, 2), "BreadcrumbList Schema");
                              }}
                              className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-[11px] font-mono flex items-center gap-1 transition"
                            >
                              <Layers className="w-3 h-3" />
                              <span>Copiar Breadcrumbs</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Open Graph Special Actions Bar & Social Preview (Etapa 043) */}
                      {blogJsonTab === "og" && (
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-zinc-900 border border-amber-500/30 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                              <span className="font-mono text-zinc-300 text-[11px]">
                                Card Social: <strong className="text-cyan-400">1200×630px</strong> • WhatsApp, Twitter/X, LinkedIn & Meta
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const htmlTags = renderOpenGraphHtmlMetaTags(
                                  compiledBlogJson.seo.open_graph, 
                                  compiledBlogJson.seo.twitter_card
                                );
                                handleCopy(htmlTags, "Tags HTML Open Graph & Twitter");
                              }}
                              className="px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-mono flex items-center gap-1 transition"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copiar Meta Tags HTML</span>
                            </button>
                          </div>

                          {/* Mini Card Preview Social */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Facebook / LinkedIn / WhatsApp Card */}
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 overflow-hidden shadow-lg">
                              <div className="bg-zinc-850 px-3 py-1.5 border-b border-zinc-800 text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                                <span>Preview Facebook / WhatsApp / LinkedIn</span>
                                <span className="text-cyan-400 font-bold">1.91:1 Ratio</span>
                              </div>
                              <div className="relative aspect-[1.91/1] bg-zinc-950 overflow-hidden">
                                <img
                                  src={compiledBlogJson.seo.open_graph.og_image}
                                  alt={compiledBlogJson.seo.open_graph.og_image_alt}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-3 space-y-1">
                                <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                                  {compiledBlogJson.seo.open_graph.og_site_name}
                                </span>
                                <div className="text-xs font-bold text-white line-clamp-1">
                                  {compiledBlogJson.seo.open_graph.og_title}
                                </div>
                                <div className="text-[11px] text-zinc-400 line-clamp-2">
                                  {compiledBlogJson.seo.open_graph.og_description}
                                </div>
                              </div>
                            </div>

                            {/* Twitter / X Large Image Card */}
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 overflow-hidden shadow-lg">
                              <div className="bg-zinc-850 px-3 py-1.5 border-b border-zinc-800 text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                                <span>Preview Twitter / X (Large Card)</span>
                                <span className="text-amber-400 font-bold">summary_large_image</span>
                              </div>
                              <div className="relative aspect-[1.91/1] bg-zinc-950 overflow-hidden">
                                <img
                                  src={compiledBlogJson.seo.twitter_card.image}
                                  alt={compiledBlogJson.seo.twitter_card.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-white">
                                  {compiledBlogJson.seo.twitter_card.site}
                                </div>
                              </div>
                              <div className="p-3 space-y-1">
                                <div className="text-xs font-bold text-white line-clamp-1">
                                  {compiledBlogJson.seo.twitter_card.title}
                                </div>
                                <div className="text-[11px] text-zinc-400 line-clamp-2">
                                  {compiledBlogJson.seo.twitter_card.description}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 3.5 AUTOBLOG & WORDPRESS REST CONNECTORS (Etapa 044 & 045) */}
                      {blogJsonTab === "connector" && (
                        <div className="space-y-3">
                          {/* Alternador de Conector */}
                          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                            <button
                              type="button"
                              onClick={() => setConnectorViewTarget("autoblog")}
                              className={`px-3 py-1 rounded-lg text-xs font-mono transition flex items-center gap-1.5 ${
                                connectorViewTarget === "autoblog"
                                  ? "bg-amber-500 text-black font-bold"
                                  : "bg-zinc-900 text-zinc-400 hover:text-white"
                              }`}
                            >
                              <Server className="w-3 h-3" />
                              <span>V5 AutoBlog Gateway</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setConnectorViewTarget("wordpress")}
                              className={`px-3 py-1 rounded-lg text-xs font-mono transition flex items-center gap-1.5 ${
                                connectorViewTarget === "wordpress"
                                  ? "bg-blue-600 text-white font-bold"
                                  : "bg-zinc-900 text-zinc-400 hover:text-white"
                              }`}
                            >
                              <Globe className="w-3 h-3" />
                              <span>WordPress REST API (/wp-json)</span>
                            </button>
                          </div>

                          {/* 1. VISÃO V5 AUTOBLOG */}
                          {connectorViewTarget === "autoblog" && (
                            <>
                              {/* Top Bar com Handshake Status */}
                              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-zinc-900 border border-amber-500/30 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${
                                    autoBlogHandshakeResult?.success ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                                  }`} />
                                  <span className="font-mono text-zinc-300 text-[11px]">
                                    Gateway AutoBlog: <strong className={autoBlogHandshakeResult?.success ? "text-emerald-400" : "text-amber-300"}>
                                      {autoBlogHandshakeResult ? `${autoBlogHandshakeResult.statusCode} OK (${autoBlogHandshakeResult.latencyMs}ms)` : "Pronto para Handshake"}
                                    </strong>
                                  </span>
                                  {autoBlogHandshakeResult?.isMock && (
                                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 text-[9px] font-mono">
                                      Mock Fallback
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={handleTestAutoBlogHandshake}
                                    disabled={isPingingAutoBlog}
                                    className="px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-[11px] font-mono flex items-center gap-1.5 transition disabled:opacity-50"
                                  >
                                    <RefreshCw className={`w-3 h-3 ${isPingingAutoBlog ? "animate-spin text-amber-400" : ""}`} />
                                    <span>{isPingingAutoBlog ? "Testando..." : "Ping Handshake"}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={handlePublishToAutoBlogDirect}
                                    disabled={isPublishingAutoBlog}
                                    className="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] font-mono flex items-center gap-1.5 transition disabled:opacity-50 shadow-sm"
                                  >
                                    <Send className={`w-3 h-3 ${isPublishingAutoBlog ? "animate-pulse" : ""}`} />
                                    <span>{isPublishingAutoBlog ? "Publicando..." : "Publicar via REST"}</span>
                                  </button>
                                </div>
                              </div>

                              {/* Se houve publicação recente com sucesso */}
                              {autoBlogDispatchResult && (
                                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                      <span>Artigo Publicado no V5 AutoBlog!</span>
                                    </span>
                                    <span className="text-[10px] font-mono text-emerald-400/80">
                                      HTTP {autoBlogDispatchResult.statusCode} • {autoBlogDispatchResult.latencyMs}ms
                                    </span>
                                  </div>
                                  <div className="text-[11px] font-mono text-zinc-300 flex items-center gap-2">
                                    <span className="text-zinc-500">Post ID:</span>
                                    <span className="text-amber-300">{autoBlogDispatchResult.postId}</span>
                                  </div>
                                  <div className="text-[11px] font-mono flex items-center gap-2">
                                    <span className="text-zinc-500">URL Canônica:</span>
                                    <a 
                                      href={autoBlogDispatchResult.publishedUrl} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="text-cyan-400 hover:underline flex items-center gap-1 truncate"
                                    >
                                      <span>{autoBlogDispatchResult.publishedUrl}</span>
                                      <ExternalLink className="w-3 h-3 shrink-0" />
                                    </a>
                                  </div>
                                </div>
                              )}

                              {/* Headers Oficiais da Capitania */}
                              <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[11px] font-mono space-y-1">
                                <span className="text-zinc-400 font-semibold block text-[10px] uppercase tracking-wider">
                                  Cabeçalhos Oficiais de Segurança (Inter-Capitanias #13)
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-zinc-300">
                                  <div><strong className="text-amber-400">Authorization:</strong> Bearer {payload.blogOptions.capitaniaKey ? `${payload.blogOptions.capitaniaKey.substring(0, 10)}...` : "padrão"}</div>
                                  <div><strong className="text-amber-400">X-Capitania-Source:</strong> 13-poster</div>
                                  <div><strong className="text-amber-400">X-Capitania-Port:</strong> 3011</div>
                                  <div><strong className="text-amber-400">X-Capitania-Signer:</strong> Apollo La Plata</div>
                                </div>
                              </div>
                            </>
                          )}

                          {/* 2. VISÃO WORDPRESS REST API */}
                          {connectorViewTarget === "wordpress" && (
                            <>
                              {/* Top Bar com Handshake Status WordPress */}
                              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-zinc-900 border border-blue-500/30 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${
                                    wordPressHandshakeResult?.success ? "bg-emerald-400 animate-pulse" : "bg-blue-400"
                                  }`} />
                                  <span className="font-mono text-zinc-300 text-[11px]">
                                    WordPress REST: <strong className={wordPressHandshakeResult?.success ? "text-emerald-400" : "text-blue-300"}>
                                      {wordPressHandshakeResult ? `${wordPressHandshakeResult.statusCode} OK (${wordPressHandshakeResult.latencyMs}ms)` : "Autenticação via Application Passwords"}
                                    </strong>
                                  </span>
                                  {wordPressHandshakeResult?.isMock && (
                                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 text-[9px] font-mono">
                                      Mock Gateway
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={handleTestWordPressHandshake}
                                    disabled={isPingingWordPress}
                                    className="px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-[11px] font-mono flex items-center gap-1.5 transition disabled:opacity-50"
                                  >
                                    <RefreshCw className={`w-3 h-3 ${isPingingWordPress ? "animate-spin text-blue-400" : ""}`} />
                                    <span>{isPingingWordPress ? "Testando..." : "Ping Handshake WP"}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={handlePublishToWordPressDirect}
                                    disabled={isPublishingWordPress}
                                    className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] font-mono flex items-center gap-1.5 transition disabled:opacity-50 shadow-sm"
                                  >
                                    <Send className={`w-3 h-3 ${isPublishingWordPress ? "animate-pulse" : ""}`} />
                                    <span>{isPublishingWordPress ? "Publicando..." : "Publicar no WordPress"}</span>
                                  </button>
                                </div>
                              </div>

                              {/* Se houve publicação recente no WordPress com sucesso */}
                              {wordPressDispatchResult && (
                                <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-500/40 text-xs space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-blue-300 flex items-center gap-1.5 text-xs">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                      <span>Post Publicado no WordPress REST API!</span>
                                    </span>
                                    <span className="text-[10px] font-mono text-blue-400/80">
                                      HTTP {wordPressDispatchResult.statusCode} • {wordPressDispatchResult.latencyMs}ms
                                    </span>
                                  </div>
                                  <div className="text-[11px] font-mono text-zinc-300 flex items-center gap-2">
                                    <span className="text-zinc-500">Post ID WordPress:</span>
                                    <span className="text-amber-300 font-bold">#{wordPressDispatchResult.postId}</span>
                                  </div>
                                  <div className="text-[11px] font-mono flex items-center gap-2">
                                    <span className="text-zinc-500">Link no Portal:</span>
                                    <a 
                                      href={wordPressDispatchResult.publishedUrl} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="text-cyan-400 hover:underline flex items-center gap-1 truncate"
                                    >
                                      <span>{wordPressDispatchResult.publishedUrl}</span>
                                      <ExternalLink className="w-3 h-3 shrink-0" />
                                    </a>
                                  </div>
                                </div>
                              )}

                              {/* Headers e Auth do WordPress */}
                              <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[11px] font-mono space-y-1">
                                <span className="text-zinc-400 font-semibold block text-[10px] uppercase tracking-wider">
                                  Configuração de Autenticação WordPress (/wp-json/wp/v2/posts)
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-zinc-300">
                                  <div><strong className="text-blue-400">Site URL:</strong> {payload.blogOptions.wordpressConfig?.siteUrl || DEFAULT_WP_SITE_URL}</div>
                                  <div><strong className="text-blue-400">Usuário WP:</strong> {payload.blogOptions.wordpressConfig?.username || "apollo_admin"}</div>
                                  <div><strong className="text-blue-400">Auth Method:</strong> Basic Auth (Application Passwords)</div>
                                  <div><strong className="text-blue-400">Status Destino:</strong> {payload.blogOptions.wordpressConfig?.status || "publish"}</div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Code Block Pre */}
                      <div className="flex-1 overflow-auto rounded-lg bg-zinc-950 p-3 border border-zinc-900">
                        <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
                          {(() => {
                            if (blogJsonTab === "seo") return JSON.stringify(compiledBlogJson.seo, null, 2);
                            if (blogJsonTab === "schema") return JSON.stringify(compiledBlogJson.seo.schema_org, null, 2);
                            if (blogJsonTab === "og") return JSON.stringify({ open_graph: compiledBlogJson.seo.open_graph, twitter_card: compiledBlogJson.seo.twitter_card }, null, 2);
                            if (blogJsonTab === "ai") return JSON.stringify(compiledBlogJson.seo.ai_search, null, 2);
                            if (blogJsonTab === "connector") {
                              if (connectorViewTarget === "wordpress") {
                                const wpPayload = compileWordPressPostPayload(payload);
                                return JSON.stringify({
                                  wordpress_site_url: payload.blogOptions.wordpressConfig?.siteUrl || DEFAULT_WP_SITE_URL,
                                  endpoint: "/wp-json/wp/v2/posts",
                                  auth_type: "Application Passwords (Basic Auth)",
                                  handshake_status: wordPressHandshakeResult,
                                  last_dispatch_result: wordPressDispatchResult,
                                  compiled_wordpress_payload: wpPayload,
                                  request_headers: buildWordPressHeaders(
                                    payload.blogOptions.wordpressConfig?.username || "apollo_admin",
                                    payload.blogOptions.wordpressConfig?.applicationPassword || "v5ap 3011 post live pass"
                                  )
                                }, null, 2);
                              }
                              return JSON.stringify({
                                target_endpoint: payload.blogOptions.targetEndpoint,
                                capitania_key_configured: Boolean(payload.blogOptions.capitaniaKey),
                                handshake_status: autoBlogHandshakeResult,
                                last_dispatch_result: autoBlogDispatchResult,
                                official_request_headers: buildAutoBlogHeaders(payload.blogOptions.capitaniaKey)
                              }, null, 2);
                            }
                            return JSON.stringify(compiledBlogJson, null, 2);
                          })()}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3.3 MODO SOCIAL TEASERS (Etapas 051 - 060) */}
              {previewFormat === "social" && (
                <div className="h-full flex flex-col space-y-4 overflow-y-auto pr-1">
                  {/* Painel Avançado de Edição e Contadores de Caracteres em Tempo Real (Etapa 057) */}
                  <SocialTeasersEditorPanel payload={payload} />

                  <div className="flex items-center justify-between bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <div>
                        <span className="font-bold text-white block">Central de Teasers Multicanal</span>
                        <span className="text-[11px] text-zinc-400">Micro-cópias e ganchos adaptados aos limites oficiais de cada rede</span>
                      </div>
                    </div>

                    {/* Botão de Cópia em Massa do Kit Completo (Etapa 058) */}
                    <CopyAllTeasersButton payload={payload} />
                  </div>

                  {/* Gerador e Card de Preview para X/Twitter (Etapa 052) */}
                  <TwitterTeaserCard payload={payload} />

                  {/* Gerador e Card de Preview para Threads (Etapa 053) */}
                  <ThreadsTeaserCard payload={payload} />

                  {/* Gerador de Legenda para Instagram com Comment-to-DM (Etapa 054) */}
                  <InstagramCaptionCard payload={payload} />

                  {/* Gerador de Mensagens Curtas para WhatsApp (Etapa 055) */}
                  <WhatsAppMessageCard payload={payload} />

                  {/* Gerador de Mensagens com Markdown Rico para Telegram (Etapa 056) */}
                  <TelegramMessageCard payload={payload} />
                </div>
              )}

              {/* 4. MODO RAW HTML */}
              {previewFormat === "raw" && (
                <div className="h-full flex flex-col space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400 pb-1">
                    <span>Código HTML Bruto com Estilos Inline</span>
                    <button
                      onClick={() => handleCopy(compiledHtml, "Código HTML")}
                      className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar</span>
                    </button>
                  </div>
                  <div className="flex-1 bg-zinc-950 p-4 rounded-xl border border-zinc-800 overflow-auto">
                    <pre className="text-xs font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap break-all">
                      {compiledHtml}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SIDEBAR: PAINEL LATERAL DE CONFIGURAÇÕES DE PUBLICAÇÃO */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSettingsOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <div className="w-screen max-w-md sm:max-w-lg bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Configurações de Publicação</h3>
                    <p className="text-[11px] text-zinc-400 font-mono">Audiência, Taxonomia, SEO & Canais</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                  title="Fechar Painel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Tabs */}
              <div className="grid grid-cols-4 border-b border-zinc-800/80 bg-zinc-900/30 p-1.5 text-xs font-medium">
                <button
                  onClick={() => setSettingsTab("blog")}
                  className={`py-2 px-1 rounded-lg text-center transition flex flex-col items-center gap-1 ${
                    settingsTab === "blog" 
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold" 
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Folder className="w-3.5 h-3.5" />
                  <span className="text-[10px]">AutoBlog</span>
                </button>
                <button
                  onClick={() => setSettingsTab("email")}
                  className={`py-2 px-1 rounded-lg text-center transition flex flex-col items-center gap-1 ${
                    settingsTab === "email" 
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold" 
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Audiência</span>
                </button>
                <button
                  onClick={() => setSettingsTab("seo")}
                  className={`py-2 px-1 rounded-lg text-center transition flex flex-col items-center gap-1 ${
                    settingsTab === "seo" 
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold" 
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Slug & SEO</span>
                </button>
                <button
                  onClick={() => setSettingsTab("dispatch")}
                  className={`py-2 px-1 rounded-lg text-center transition flex flex-col items-center gap-1 ${
                    settingsTab === "dispatch" 
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold" 
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Despacho</span>
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
                {/* 1. BLOG & TAXONOMIA */}
                {settingsTab === "blog" && (
                  <div className="space-y-4">
                    {/* Channel Active Toggle */}
                    <div className="flex items-center justify-between p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                      <div>
                        <span className="font-bold text-white block">Ponta AutoBlog (REST API)</span>
                        <span className="text-[11px] text-zinc-400">Publicar no portal web oficial</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={payload.blogOptions.enabled}
                        onChange={(e) => setPayload(prev => ({
                          ...prev,
                          blogOptions: { ...prev.blogOptions, enabled: e.target.checked }
                        }))}
                        className="rounded text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                    </div>

                    {/* Plataforma de Publicação (Target Platform) */}
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-amber-400" />
                        <span>Destino Web CMS</span>
                      </label>
                      <select
                        value={payload.blogOptions.targetPlatform}
                        onChange={(e) => setPayload(prev => ({
                          ...prev,
                          blogOptions: { ...prev.blogOptions, targetPlatform: e.target.value as any }
                        }))}
                        className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="v5autoblog">V5 AutoBlog (Portal Oficial em Nuvem)</option>
                        <option value="wordpress">WordPress REST API (/wp-json/wp/v2/posts)</option>
                        <option value="both">Ambos (Dual Publish Multicanal)</option>
                      </select>
                    </div>

                    {/* Categoria com Sugestão de Taxonomia IA (Etapa 047) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Folder className="w-3.5 h-3.5 text-amber-400" />
                          <span>Categoria Editorial</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleAutoSuggestTaxonomy}
                          className="text-[10px] text-amber-400 hover:underline font-mono flex items-center gap-1"
                          title="Analisar semanticamente o texto e sugerir a melhor categoria e tags"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>IA: Analisar Taxonomia</span>
                        </button>
                      </div>
                      <select
                        value={payload.blogOptions.category}
                        onChange={(e) => setPayload(prev => ({
                          ...prev,
                          blogOptions: { ...prev.blogOptions, category: e.target.value }
                        }))}
                        className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        {PRESET_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>

                      {/* Feedback de Afinidade Taxonômica */}
                      {taxonomySuggestion && (
                        <div className="mt-1.5 p-2 rounded-lg bg-zinc-900/80 border border-amber-500/20 text-[10px] font-mono flex items-center justify-between">
                          <span className="text-zinc-400">
                            Cluster: <strong className="text-amber-300">{taxonomySuggestion.topicCluster}</strong>
                          </span>
                          <span className="text-emerald-400 font-bold">
                            {taxonomySuggestion.categoryConfidence}% afinidade
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Autor */}
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        <span>Autor Editorial</span>
                      </label>
                      <select
                        value={payload.blogOptions.author}
                        onChange={(e) => setPayload(prev => ({
                          ...prev,
                          blogOptions: { ...prev.blogOptions, author: e.target.value }
                        }))}
                        className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        {PRESET_AUTHORS.map(author => (
                          <option key={author} value={author}>{author}</option>
                        ))}
                      </select>
                    </div>

                    {/* Gerenciador Dinâmico de Tags (Etapa 047) */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-amber-400" />
                          <span>Tags & Palavras-Chave ({payload.blogOptions.tags.length})</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleAutoSuggestTaxonomy}
                          className="text-[10px] text-amber-400 hover:underline font-mono flex items-center gap-1"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Sugerir IA</span>
                        </button>
                      </div>

                      {/* Sugestões Rápidas de Tags */}
                      {taxonomySuggestion && taxonomySuggestion.suggestedTags.length > 0 && (
                        <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase block font-semibold">
                            Sugestões de Taxonomia (Clique para adicionar):
                          </span>
                          <div className="flex flex-wrap items-center gap-1">
                            {taxonomySuggestion.suggestedTags
                              .filter(st => !payload.blogOptions.tags.some(t => t.toLowerCase() === st.tag.toLowerCase()))
                              .slice(0, 6)
                              .map(st => (
                                <button
                                  key={st.tag}
                                  type="button"
                                  onClick={() => handleQuickAddTag(st.tag)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-amber-500/20 hover:text-amber-300 text-zinc-300 border border-zinc-700 text-[10px] font-mono transition"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                  <span>{st.tag}</span>
                                </button>
                              ))
                            }
                          </div>
                        </div>
                      )}

                      {/* Tag Chips Ativas */}
                      <div className="flex flex-wrap items-center gap-1.5 min-h-[42px] p-2 bg-zinc-900/60 rounded-xl border border-zinc-800">
                        {payload.blogOptions.tags.length === 0 ? (
                          <span className="text-[11px] text-zinc-500 italic">Nenhuma tag associada ainda...</span>
                        ) : (
                          payload.blogOptions.tags.map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700 text-[11px] font-mono group"
                            >
                              <span>#{tag}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="text-zinc-500 hover:text-red-400 transition"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      {/* Input Nova Tag */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          placeholder="Nova tag (ex: Automação, IA)..."
                          className="flex-1 bg-zinc-900 border border-zinc-700 focus:border-amber-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddTag()}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 transition flex items-center gap-1 font-medium"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar</span>
                        </button>
                      </div>
                    </div>

                    {/* Schema.org Toggle */}
                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-zinc-200 block">Schema.org JSON-LD</span>
                        <span className="text-[11px] text-zinc-500">Gera metadados ricos (BlogPosting) para o Google</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={payload.blogOptions.generateSchema}
                        onChange={(e) => setPayload(prev => ({
                          ...prev,
                          blogOptions: { ...prev.blogOptions, generateSchema: e.target.checked }
                        }))}
                        className="rounded text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                    </div>

                    {/* Conector REST do V5 AutoBlog (Etapa 044) */}
                    <div className="pt-3 border-t border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Server className="w-3.5 h-3.5 text-amber-400" />
                          <span>Endpoint & Chave de Capitania (#13)</span>
                        </label>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          Porta :3011 Nativa
                        </span>
                      </div>

                      {/* Endpoint URL Input */}
                      <div>
                        <label className="text-[10px] font-mono text-zinc-400 block mb-1">URL Endpoint REST API:</label>
                        <input
                          type="text"
                          value={payload.blogOptions.targetEndpoint}
                          onChange={(e) => setPayload(prev => ({
                            ...prev,
                            blogOptions: { ...prev.blogOptions, targetEndpoint: e.target.value }
                          }))}
                          placeholder="https://v5autoblog.com/api/v1/posts"
                          className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>

                      {/* Capitania Key Input */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                            <Key className="w-3 h-3 text-amber-400" />
                            <span>Chave de Capitania (Bearer):</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowCapitaniaKey(!showCapitaniaKey)}
                            className="text-[10px] text-amber-400 hover:underline font-mono"
                          >
                            {showCapitaniaKey ? "Ocultar" : "Mostrar"}
                          </button>
                        </div>
                        <input
                          type={showCapitaniaKey ? "text" : "password"}
                          value={payload.blogOptions.capitaniaKey || ""}
                          onChange={(e) => setPayload(prev => ({
                            ...prev,
                            blogOptions: { ...prev.blogOptions, capitaniaKey: e.target.value }
                          }))}
                          placeholder="cap_v5_poster_3011_live"
                          className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>

                      {/* Handshake & Publish Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleTestAutoBlogHandshake}
                          disabled={isPingingAutoBlog}
                          className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-[11px] font-mono flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isPingingAutoBlog ? "animate-spin text-amber-400" : ""}`} />
                          <span>{isPingingAutoBlog ? "Testando..." : "Ping Handshake"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handlePublishToAutoBlogDirect}
                          disabled={isPublishingAutoBlog}
                          className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] font-mono flex items-center justify-center gap-1.5 transition disabled:opacity-50 shadow-sm"
                        >
                          <Send className={`w-3.5 h-3.5 ${isPublishingAutoBlog ? "animate-pulse" : ""}`} />
                          <span>{isPublishingAutoBlog ? "Publicando..." : "Publicar Agora"}</span>
                        </button>
                      </div>

                      {/* Handshake Result Feedback */}
                      {autoBlogHandshakeResult && (
                        <div className={`p-2.5 rounded-lg border text-[11px] font-mono flex items-center justify-between ${
                          autoBlogHandshakeResult.success 
                            ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                            : "bg-red-950/30 border-red-500/30 text-red-300"
                        }`}>
                          <span className="truncate">{autoBlogHandshakeResult.message}</span>
                          <span className="shrink-0 font-bold ml-2">HTTP {autoBlogHandshakeResult.statusCode}</span>
                        </div>
                      )}
                    </div>

                    {/* Conector WordPress REST API (Etapa 045) */}
                    {(payload.blogOptions.targetPlatform === "wordpress" || payload.blogOptions.targetPlatform === "both") && (
                      <div className="pt-3 border-t border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-blue-400" />
                            <span>WordPress REST API (/wp-json)</span>
                          </label>
                          <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                            Application Passwords
                          </span>
                        </div>

                        {/* Site URL */}
                        <div>
                          <label className="text-[10px] font-mono text-zinc-400 block mb-1">URL do Site WordPress:</label>
                          <input
                            type="text"
                            value={payload.blogOptions.wordpressConfig?.siteUrl || DEFAULT_WP_SITE_URL}
                            onChange={(e) => setPayload(prev => ({
                              ...prev,
                              blogOptions: {
                                ...prev.blogOptions,
                                wordpressConfig: {
                                  ...(prev.blogOptions.wordpressConfig || DEFAULT_WP_CONFIG),
                                  siteUrl: e.target.value
                                }
                              }
                            }))}
                            placeholder="https://wordpress.v5holding.com"
                            className="w-full bg-zinc-900 border border-zinc-700 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                          />
                        </div>

                        {/* Username & Status Grid */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-mono text-zinc-400 block mb-1">Usuário WP:</label>
                            <input
                              type="text"
                              value={payload.blogOptions.wordpressConfig?.username || "apollo_admin"}
                              onChange={(e) => setPayload(prev => ({
                                ...prev,
                                blogOptions: {
                                  ...prev.blogOptions,
                                  wordpressConfig: {
                                    ...(prev.blogOptions.wordpressConfig || DEFAULT_WP_CONFIG),
                                    username: e.target.value
                                  }
                                }
                              }))}
                              placeholder="apollo_admin"
                              className="w-full bg-zinc-900 border border-zinc-700 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-mono text-zinc-400 block mb-1">Status Destino:</label>
                            <select
                              value={payload.blogOptions.wordpressConfig?.status || "publish"}
                              onChange={(e) => setPayload(prev => ({
                                ...prev,
                                blogOptions: {
                                  ...prev.blogOptions,
                                  wordpressConfig: {
                                    ...(prev.blogOptions.wordpressConfig || DEFAULT_WP_CONFIG),
                                    status: e.target.value as any
                                  }
                                }
                              }))}
                              className="w-full bg-zinc-900 border border-zinc-700 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                            >
                              <option value="publish">Publicar Imediato</option>
                              <option value="draft">Rascunho (Draft)</option>
                              <option value="pending">Pendente Revisão</option>
                            </select>
                          </div>
                        </div>

                        {/* Application Password */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                              <Key className="w-3 h-3 text-blue-400" />
                              <span>Application Password:</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowWpPassword(!showWpPassword)}
                              className="text-[10px] text-blue-400 hover:underline font-mono"
                            >
                              {showWpPassword ? "Ocultar" : "Mostrar"}
                            </button>
                          </div>
                          <input
                            type={showWpPassword ? "text" : "password"}
                            value={payload.blogOptions.wordpressConfig?.applicationPassword || ""}
                            onChange={(e) => setPayload(prev => ({
                              ...prev,
                              blogOptions: {
                                ...prev.blogOptions,
                                wordpressConfig: {
                                  ...(prev.blogOptions.wordpressConfig || DEFAULT_WP_CONFIG),
                                  applicationPassword: e.target.value
                                }
                              }
                            }))}
                            placeholder="v5ap 3011 post live pass"
                            className="w-full bg-zinc-900 border border-zinc-700 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                          />
                        </div>

                        {/* Handshake & Publish Buttons WP */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleTestWordPressHandshake}
                            disabled={isPingingWordPress}
                            className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-[11px] font-mono flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isPingingWordPress ? "animate-spin text-blue-400" : ""}`} />
                            <span>{isPingingWordPress ? "Testando..." : "Ping Handshake WP"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={handlePublishToWordPressDirect}
                            disabled={isPublishingWordPress}
                            className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] font-mono flex items-center justify-center gap-1.5 transition disabled:opacity-50 shadow-sm"
                          >
                            <Send className={`w-3.5 h-3.5 ${isPublishingWordPress ? "animate-pulse" : ""}`} />
                            <span>{isPublishingWordPress ? "Publicando..." : "Publicar no WP"}</span>
                          </button>
                        </div>

                        {/* Handshake Result Feedback WP */}
                        {wordPressHandshakeResult && (
                          <div className={`p-2.5 rounded-lg border text-[11px] font-mono flex items-center justify-between ${
                            wordPressHandshakeResult.success 
                              ? "bg-blue-950/30 border-blue-500/30 text-blue-300"
                              : "bg-red-950/30 border-red-500/30 text-red-300"
                          }`}>
                            <span className="truncate">{wordPressHandshakeResult.message}</span>
                            <span className="shrink-0 font-bold ml-2">HTTP {wordPressHandshakeResult.statusCode}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. E-MAIL & AUDIÊNCIA */}
                {settingsTab === "email" && (
                  <div className="space-y-4">
                    {/* Channel Active Toggle */}
                    <div className="flex items-center justify-between p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                      <div>
                        <span className="font-bold text-white block">Ponta E-mail (Newsletter)</span>
                        <span className="text-[11px] text-zinc-400">Disparo via Resend API / SES</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={payload.emailOptions.enabled}
                        onChange={(e) => setPayload(prev => ({
                          ...prev,
                          emailOptions: { ...prev.emailOptions, enabled: e.target.checked }
                        }))}
                        className="rounded text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                    </div>

                    {/* Lista de Audiência */}
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        <span>Lista de Destinatários</span>
                      </label>
                      <select
                        value={payload.emailOptions.audienceList}
                        onChange={(e) => setPayload(prev => ({
                          ...prev,
                          emailOptions: { ...prev.emailOptions, audienceList: e.target.value }
                        }))}
                        className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        {PRESET_AUDIENCES.map(aud => (
                          <option key={aud} value={aud}>{aud}</option>
                        ))}
                      </select>
                    </div>

                    {/* Seletor de Provedor de Infraestrutura de E-mail (Etapa 036) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Server className="w-3.5 h-3.5 text-amber-400" />
                          <span>Provedor de Disparo Onicanal</span>
                        </label>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {EMAIL_PROVIDER_PRESETS.length} opções disponíveis
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {EMAIL_PROVIDER_PRESETS.map((prov) => {
                          const isSelected = payload.emailOptions.provider === prov.id;
                          return (
                            <div
                              key={prov.id}
                              onClick={() => setPayload(prev => ({
                                ...prev,
                                emailOptions: { ...prev.emailOptions, provider: prov.id }
                              }))}
                              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-amber-500/10 border-amber-500/60 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/30"
                                  : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <div className={`p-1.5 rounded-lg ${isSelected ? "bg-amber-500 text-black font-bold" : "bg-zinc-800 text-zinc-400"}`}>
                                    {prov.id === "resend" ? (
                                      <Zap className="w-3.5 h-3.5" />
                                    ) : prov.id === "ses" ? (
                                      <Cloud className="w-3.5 h-3.5" />
                                    ) : (
                                      <Server className="w-3.5 h-3.5" />
                                    )}
                                  </div>
                                  <div>
                                    <span className={`text-xs font-bold block ${isSelected ? "text-amber-300" : "text-white"}`}>
                                      {prov.name}
                                    </span>
                                    <span className="text-[10px] text-zinc-400 font-mono">
                                      {prov.speed} • {prov.quotaDaily}
                                    </span>
                                  </div>
                                </div>
                                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md border ${
                                  isSelected 
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold"
                                    : "bg-zinc-950 text-zinc-500 border-zinc-800"
                                }`}>
                                  {prov.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-400 leading-relaxed mt-2">
                                {prov.description}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Configurações & Handshake Test do Provedor Selecionado */}
                      {(() => {
                        const currentProfile = getEmailProviderProfile(payload.emailOptions.provider);
                        return (
                          <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800/80 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                                Credenciais Ativas • {currentProfile.name}
                              </span>
                              <button
                                type="button"
                                disabled={isTestingProvider}
                                onClick={() => handleTestProvider(payload.emailOptions.provider)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 border border-zinc-700/80 text-[10px] font-mono font-bold transition disabled:opacity-50"
                              >
                                <Activity className={`w-3 h-3 ${isTestingProvider ? "animate-spin text-amber-400" : ""}`} />
                                <span>{isTestingProvider ? "Testando Handshake..." : "Ping / Testar Conexão"}</span>
                              </button>
                            </div>

                            {/* Informações detalhadas do provedor */}
                            <div className="text-[10px] font-mono bg-zinc-900/60 p-2 rounded-lg border border-zinc-800 space-y-1">
                              {payload.emailOptions.provider === "resend" && (
                                <>
                                  <div className="flex justify-between text-zinc-400">
                                    <span>API Key:</span>
                                    <span className="text-amber-300 font-mono">re_apollo_v5_live_•••••••</span>
                                  </div>
                                  <div className="flex justify-between text-zinc-400">
                                    <span>Domínio Verificado:</span>
                                    <span className="text-emerald-400">newsletter.v5apollo.com (DKIM OK)</span>
                                  </div>
                                </>
                              )}
                              {payload.emailOptions.provider === "ses" && (
                                <>
                                  <div className="flex justify-between text-zinc-400">
                                    <span>AWS Region:</span>
                                    <span className="text-amber-300">us-east-1 (N. Virginia)</span>
                                  </div>
                                  <div className="flex justify-between text-zinc-400">
                                    <span>Configuration Set:</span>
                                    <span className="text-emerald-400">v5-poster-tracking</span>
                                  </div>
                                </>
                              )}
                              {payload.emailOptions.provider === "smtp" && (
                                <>
                                  <div className="flex justify-between text-zinc-400">
                                    <span>Host SMTP:</span>
                                    <span className="text-amber-300">smtp.v5apollo.com:587</span>
                                  </div>
                                  <div className="flex justify-between text-zinc-400">
                                    <span>Criptografia:</span>
                                    <span className="text-emerald-400">STARTTLS Obrigatório</span>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Resultado do Teste de Conexão */}
                            {providerTestResult && (
                              <div className={`p-2 rounded-lg border text-[10px] space-y-0.5 ${
                                providerTestResult.success
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                  : "bg-red-500/10 border-red-500/30 text-red-300"
                              }`}>
                                <div className="flex items-center justify-between font-bold">
                                  <span>{providerTestResult.success ? "✅ Handshake Concluído" : "❌ Falha no Handshake"}</span>
                                  <span className="font-mono">{providerTestResult.latencyMs}ms • {providerTestResult.verifiedAt}</span>
                                </div>
                                <div className="text-[9px] text-zinc-300 leading-tight">
                                  {providerTestResult.message}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Nome do Remetente */}
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                        Nome do Remetente
                      </label>
                      <input
                        type="text"
                        value={payload.emailOptions.fromName}
                        onChange={(e) => setPayload(prev => ({
                          ...prev,
                          emailOptions: { ...prev.emailOptions, fromName: e.target.value }
                        }))}
                        className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                        placeholder="Holding V5 Apollo"
                      />
                    </div>

                    {/* Campanha UTM */}
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1 flex items-center justify-between">
                        <span>Campanha UTM (Rastreamento)</span>
                        <button
                          type="button"
                          onClick={() => setPayload(prev => ({
                            ...prev,
                            emailOptions: { ...prev.emailOptions, utmCampaign: prev.slug }
                          }))}
                          className="text-[10px] text-amber-400 hover:underline font-mono"
                        >
                          Usar Slug
                        </button>
                      </label>
                      <input
                        type="text"
                        value={payload.emailOptions.utmCampaign}
                        onChange={(e) => setPayload(prev => ({
                          ...prev,
                          emailOptions: { ...prev.emailOptions, utmCampaign: e.target.value }
                        }))}
                        className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-500 rounded-lg px-3 py-1.5 text-xs text-amber-300 focus:outline-none font-mono"
                        placeholder="newsletter_agentes_2026"
                      />
                    </div>

                    {/* Inspetor de Links Rastreados UTM (Etapa 033) */}
                    {(() => {
                      const trackingUrls = getSampleTrackingUrls(payload.slug, payload.emailOptions.utmCampaign);
                      return (
                        <div className="p-3.5 bg-zinc-900/70 rounded-xl border border-amber-500/30 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>Inspetor UTM da Campanha</span>
                            </span>
                            <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md">
                              100% Onicanal
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                              <span className="text-zinc-500 block text-[9px]">source</span>
                              <span className="text-amber-400 font-bold truncate block">{trackingUrls.source}</span>
                            </div>
                            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                              <span className="text-zinc-500 block text-[9px]">medium</span>
                              <span className="text-amber-400 font-bold truncate block">{trackingUrls.medium}</span>
                            </div>
                            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                              <span className="text-zinc-500 block text-[9px]">campaign</span>
                              <span className="text-amber-400 font-bold truncate block">{trackingUrls.campaign}</span>
                            </div>
                          </div>

                          {/* CTA Principal Rastreamento */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-zinc-400 font-semibold">Link do Botão CTA Principal:</span>
                              <button
                                type="button"
                                onClick={() => handleCopyTrackingUrl(trackingUrls.ctaUrl, "cta")}
                                className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono transition"
                              >
                                {copiedUtmKey === "cta" ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copiado!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copiar</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="text-[10px] font-mono bg-zinc-950 p-2 rounded-lg border border-zinc-800 text-zinc-300 break-all select-all">
                              {trackingUrls.ctaUrl}
                            </div>
                          </div>

                          {/* VIP Paywall Link Rastreamento */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-zinc-400 font-semibold">Link do Paywall Break (VIP):</span>
                              <button
                                type="button"
                                onClick={() => handleCopyTrackingUrl(trackingUrls.vipUrl, "vip")}
                                className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono transition"
                              >
                                {copiedUtmKey === "vip" ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copiado!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copiar</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="text-[10px] font-mono bg-zinc-950 p-2 rounded-lg border border-zinc-800 text-zinc-300 break-all select-all">
                              {trackingUrls.vipUrl}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/80 text-[10px] text-zinc-400">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Injeção dinâmica em todos os links e tabelas Markdown do e-mail.</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Botão CTA Bulletproof Outlook MSO (Etapa 034) */}
                    <div className="p-3.5 bg-zinc-900/70 rounded-xl border border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span>Motor de CTA Bulletproof (Outlook MSO)</span>
                        </span>
                        <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                          VML + MSO Ativo
                        </span>
                      </div>

                      <div className="text-[11px] text-zinc-300 leading-relaxed">
                        Botões de alta conversão compilados com condicionais vetoriais <code className="text-amber-400 font-mono text-[10px]">&lt;!--[if mso]&gt;</code> para manter dimensões e cantos arredondados no Microsoft Outlook Desktop (Word Engine).
                      </div>

                      <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800/80 text-center space-y-2">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Preview do Botão CTA Principal</span>
                        <div className="inline-block py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs shadow-md shadow-amber-500/20">
                          Ler Artigo Completo no Blog →
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 flex items-center gap-1.5 text-zinc-300">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>Outlook 2013-2021 (VML)</span>
                        </div>
                        <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 flex items-center gap-1.5 text-zinc-300">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>Gmail & Apple Mail (CSS)</span>
                        </div>
                      </div>
                    </div>

                    {/* Rodapé Institucional & Compliance CAN-SPAM / LGPD (Etapa 035) */}
                    <div className="p-3.5 bg-zinc-900/70 rounded-xl border border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Rodapé Institucional & Compliance</span>
                        </span>
                        <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                          CAN-SPAM & LGPD
                        </span>
                      </div>

                      {/* Endereço Físico Registrado */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 font-semibold block">
                          Endereço Físico Registrado (Obrigatório por Lei):
                        </label>
                        <input
                          type="text"
                          value={payload.emailOptions.footerAddress || "Holding V5 Apollo Ltda. • Av. Paulista, 1000 - Bela Vista, São Paulo/SP - CEP 01310-100, Brasil"}
                          onChange={(e) => setPayload(prev => ({
                            ...prev,
                            emailOptions: { ...prev.emailOptions, footerAddress: e.target.value }
                          }))}
                          className="w-full bg-zinc-950 border border-zinc-700/80 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-300 focus:outline-none"
                          placeholder="Endereço oficial da holding..."
                        />
                      </div>

                      {/* Permission Reminder */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 font-semibold block">
                          Lembrete de Consentimento (Permission Reminder):
                        </label>
                        <textarea
                          rows={2}
                          value={payload.emailOptions.permissionReminder || "Você está recebendo esta mensagem porque se inscreveu na newsletter oficial de inteligência e automação da Holding V5 Apollo através do portal AutoBlog ou de nossas capitanias parceiras."}
                          onChange={(e) => setPayload(prev => ({
                            ...prev,
                            emailOptions: { ...prev.emailOptions, permissionReminder: e.target.value }
                          }))}
                          className="w-full bg-zinc-950 border border-zinc-700/80 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-300 focus:outline-none resize-none leading-relaxed"
                        />
                      </div>

                      {/* Compliance Checklist Badges */}
                      <div className="space-y-1.5 pt-1 border-t border-zinc-800 text-[10px]">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>Link 1-Click Unsubscribe (RFC-8058 Ativo)</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>Link de Gestão de Preferências de Tópicos</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>Copyright & Rastreabilidade de Capitania (:311)</span>
                        </div>
                      </div>
                    </div>

                    {/* Auditoria de Spam Score e Entregabilidade (Etapa 039) */}
                    <div className="p-3.5 bg-zinc-900/70 rounded-xl border border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span>Auditoria de Spam Score & Inbox Rate</span>
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-bold ${
                          spamAudit.rating === "safe"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : spamAudit.rating === "moderate"
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        }`}>
                          {spamAudit.score.toFixed(1)}/10 • {spamAudit.deliverabilityEstimate}% Inbox
                        </span>
                      </div>

                      <div className="text-[11px] text-zinc-300">
                        {spamAudit.ratingLabel}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {spamAudit.detectedTriggers.length} gatilhos • {spamAudit.textToLinkRatio} pal/link
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsSpamModalOpen(true)}
                          className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <span>Ver Diagnóstico Completo</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SLUG & SEO */}
                {settingsTab === "seo" && (
                  <div className="space-y-4">
                    {/* Slug Customizado */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Link2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Slug Canônico Customizado</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleRegenerateSlug}
                          className="text-[10px] text-amber-400 hover:underline font-mono flex items-center gap-1"
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                          <span>Regenerar do Título</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={payload.slug}
                        onChange={(e) => setPayload(prev => ({ ...prev, slug: e.target.value }))}
                        className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-amber-400 font-mono focus:outline-none"
                      />
                    </div>

                    {/* URL Final Preview com Rastreamento UTM */}
                    <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">URL Canônica Pura:</span>
                        <button
                          type="button"
                          onClick={() => handleCopyTrackingUrl(`https://v5autoblog.com/artigo/${payload.slug}`, "canonical")}
                          className="text-[10px] text-zinc-400 hover:text-amber-400 flex items-center gap-1 font-mono transition"
                        >
                          {copiedUtmKey === "canonical" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedUtmKey === "canonical" ? "Copiado!" : "Copiar"}</span>
                        </button>
                      </div>
                      <div className="text-xs font-mono text-zinc-300 break-all select-all bg-zinc-950 p-2 rounded border border-zinc-800">
                        https://v5autoblog.com/artigo/<strong className="text-amber-400">{payload.slug}</strong>
                      </div>

                      <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-amber-500/80 uppercase">Com Rastreamento UTM:</span>
                        <button
                          type="button"
                          onClick={() => {
                            const tracked = buildTrackingUrl(`https://v5autoblog.com/artigo/${payload.slug}`, {
                              source: "v5poster",
                              medium: "email_newsletter",
                              campaign: payload.emailOptions.utmCampaign || payload.slug,
                              content: "seo_canonical_share"
                            });
                            handleCopyTrackingUrl(tracked, "seo_utm");
                          }}
                          className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono transition"
                        >
                          {copiedUtmKey === "seo_utm" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedUtmKey === "seo_utm" ? "Copiado!" : "Copiar com UTM"}</span>
                        </button>
                      </div>
                      <div className="text-[10px] font-mono text-amber-300/80 break-all select-all bg-zinc-950 p-2 rounded border border-zinc-800/80">
                        {buildTrackingUrl(`https://v5autoblog.com/artigo/${payload.slug}`, {
                          source: "v5poster",
                          medium: "email_newsletter",
                          campaign: payload.emailOptions.utmCampaign || payload.slug,
                          content: "seo_canonical_share"
                        })}
                      </div>
                    </div>

                    {/* Resumo SEO com Extrator Automático (Etapa 046) */}
                    <div>
                      {(() => {
                        const excerptQuality = evaluateExcerptQuality(payload.summary, payload.blogOptions.tags);
                        return (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5 text-amber-400" />
                                <span>Meta Description / Resumo Google</span>
                              </label>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-mono font-bold ${
                                  excerptQuality.status === "optimal" ? "text-emerald-400" :
                                  excerptQuality.status === "too_long" ? "text-rose-400" : "text-amber-400"
                                }`}>
                                  {payload.summary.length}/160 caracteres
                                </span>
                                <button
                                  type="button"
                                  onClick={handleAutoExtractGoogleExcerpt}
                                  className="text-[10px] text-amber-400 hover:underline font-mono flex items-center gap-1"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  <span>Extrair (155c)</span>
                                </button>
                              </div>
                            </div>
                            <textarea
                              value={payload.summary}
                              onChange={(e) => setPayload(prev => ({ ...prev, summary: e.target.value }))}
                              rows={3}
                              className={`w-full bg-zinc-900 border rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none resize-none leading-relaxed font-mono ${
                                excerptQuality.status === "optimal" ? "border-emerald-500/50 focus:border-emerald-400" :
                                excerptQuality.status === "too_long" ? "border-rose-500/50 focus:border-rose-400" : "border-zinc-700 focus:border-amber-500"
                              }`}
                              placeholder="Resumo otimizado para snippets do Google e compartilhamento social..."
                            />
                            <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-0.5">
                              <span>{excerptQuality.feedbackMessage}</span>
                              {excerptQuality.containsActionHook && (
                                <span className="text-emerald-400 font-mono font-semibold">⚡ CTR Hook Detectado</span>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* 4. DESPACHO & TEASERS */}
                {settingsTab === "dispatch" && (
                  <div className="space-y-4">
                    {/* Social Teasers destination */}
                    <div className="flex items-center justify-between p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                      <div>
                        <span className="font-bold text-white block">Ponta Social & Grupos VIP</span>
                        <span className="text-[11px] text-zinc-400">Telegram, WhatsApp, Instagram e Redes</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={payload.socialTeaserOptions.enabled}
                        onChange={(e) => setPayload(prev => ({
                          ...prev,
                          socialTeaserOptions: { ...prev.socialTeaserOptions, enabled: e.target.checked }
                        }))}
                        className="rounded text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                    </div>

                    {payload.socialTeaserOptions.enabled && (
                      <div className="space-y-3">
                        <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-pink-400 font-semibold">
                            <span>Instagram / Threads</span>
                            <button onClick={() => handleCopy(compiledTeasers.instagram_caption, "Legenda Instagram")} className="text-amber-400 hover:underline">Copiar</button>
                          </div>
                          <p className="text-zinc-400 text-[11px] font-mono line-clamp-3">{compiledTeasers.instagram_caption}</p>
                        </div>
                        <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-sky-400 font-semibold">
                            <span>Telegram VIP</span>
                            <button onClick={() => handleCopy(compiledTeasers.telegram_vip, "Telegram VIP")} className="text-amber-400 hover:underline">Copiar</button>
                          </div>
                          <p className="text-zinc-400 text-[11px] font-mono line-clamp-3">{compiledTeasers.telegram_vip}</p>
                        </div>
                      </div>
                    )}

                    {executionResult && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1.5 text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Despacho Concluído com Sucesso!</span>
                        </div>
                        <div className="text-[11px] text-zinc-300 space-y-0.5 font-mono">
                          <div>• E-mail: {executionResult.emailResult.sentCount} disparos ({executionResult.emailResult.messageId})</div>
                          <div>• AutoBlog: HTTP {executionResult.blogResult.statusCode} OK (<a href={executionResult.blogResult.publishedUrl} target="_blank" className="underline text-amber-400">{executionResult.blogResult.publishedUrl}</a>)</div>
                          <div>• Social & VIP: {executionResult.socialResult.deliveredChannels.join(", ")}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Drawer Sticky Footer */}
              <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/70 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition font-medium"
                >
                  Concluir & Fechar
                </button>
                <button
                  type="button"
                  onClick={handleTriggerDispatch}
                  disabled={isDispatching}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  <span>{isDispatching ? "Despachando..." : "Disparar Agora"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEDIA & COVER IMAGE MODAL */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <span>
                  {mediaTarget === "cover" ? "Configurar Imagem de Capa (Hero)" : "Inserir Imagem no Artigo"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  URL Canônica da Imagem (HTTPS)
                </label>
                <input
                  type="text"
                  value={mediaUrlInput}
                  onChange={(e) => setMediaUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Tag ALT Automática (Acessibilidade & SEO)
                  </label>
                  <button
                    type="button"
                    onClick={() => setMediaAltInput(payload.title || "Imagem ilustrativa")}
                    className="text-[10px] text-amber-400 hover:underline font-mono"
                  >
                    Usar título do artigo
                  </button>
                </div>
                <input
                  type="text"
                  value={mediaAltInput}
                  onChange={(e) => setMediaAltInput(e.target.value)}
                  placeholder="Descrição da imagem para leitores de tela e Google..."
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                />
              </div>

              {/* Preview Thumbnail */}
              {mediaUrlInput && (
                <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1.5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Prévia da Mídia:</span>
                  <div className="h-32 w-full rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
                    <img
                      src={mediaUrlInput}
                      alt={mediaAltInput || "Prévia"}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600";
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Quick Image Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  Presets Rápidos de Imagem Royalty-Free:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-2 rounded-xl border text-left transition ${
                        mediaUrlInput === preset.url
                          ? "bg-amber-500/20 border-amber-500 text-amber-300"
                          : "bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 text-zinc-300"
                      }`}
                    >
                      <span className="font-semibold block text-[11px]">{preset.label}</span>
                      <span className="text-[9px] text-zinc-500 truncate block font-mono">Unsplash HD</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyMedia}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition flex items-center gap-1.5 shadow"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{mediaTarget === "cover" ? "Salvar Imagem de Capa" : "Inserir Imagem no Artigo"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL DE ENVIO DE PROVA RÁPIDA (Etapa 038) */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-zinc-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Disparar E-mail de Prova</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">Validação real de renderização e SPF/DKIM na caixa de entrada</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsTestModalOpen(false);
                  setTestSendResult(null);
                }}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* E-mail do Destinatário */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                    E-mail de Destino do Teste:
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">1 destinatário</span>
                </div>
                <input
                  type="email"
                  value={testEmailInput}
                  onChange={(e) => setTestEmailInput(e.target.value)}
                  placeholder="seuemail@empresa.com"
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setTestEmailInput("v5estudio@hotmail.com")}
                    className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-amber-300 px-2.5 py-1 rounded-lg border border-zinc-700/80 font-mono transition"
                  >
                    v5estudio@hotmail.com (Operador)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestEmailInput("redacao@v5apollo.com")}
                    className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-700/80 font-mono transition"
                  >
                    redacao@v5apollo.com
                  </button>
                </div>
              </div>

              {/* Informações da Prova */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1.5 text-[11px] font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Provedor:</span>
                  <span className="text-amber-400 font-bold uppercase">{payload.emailOptions.provider}</span>
                </div>
                <div className="flex justify-between text-zinc-400 truncate">
                  <span>Assunto:</span>
                  <span className="text-zinc-200 truncate ml-2">[PROVA] {payload.emailOptions.subject || payload.title}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Remetente:</span>
                  <span className="text-zinc-300">{payload.emailOptions.fromName || "Holding V5 Apollo"}</span>
                </div>
              </div>

              {/* Checkbox de Banner de Prova */}
              <label className="flex items-center gap-2 p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeProofBanner}
                  onChange={(e) => setIncludeProofBanner(e.target.checked)}
                  className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-[11px] text-zinc-300">
                  Incluir faixa de aviso visual <strong className="text-amber-400">[E-MAIL DE PROVA]</strong> no topo
                </span>
              </label>

              {/* Resultado do Envio */}
              {testSendResult && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1 animate-in fade-in">
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span>✅ Prova Despachada com Sucesso!</span>
                    <span className="font-mono text-[10px]">{testSendResult.latencyMs}ms</span>
                  </div>
                  <div className="text-[10px] text-zinc-300 font-mono break-all">
                    ID: {testSendResult.messageId} • {testSendResult.dispatchedAt}
                  </div>
                  <p className="text-[10px] text-emerald-400/90 pt-1">
                    Verifique sua caixa de entrada principal ou aba Promoções.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                disabled={isSendingTest}
                onClick={() => {
                  setIsTestModalOpen(false);
                  setTestSendResult(null);
                }}
                className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSendingTest}
                onClick={handleSendTestEmail}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                {isSendingTest ? (
                  <>
                    <Activity className="w-3.5 h-3.5 animate-spin" />
                    <span>Disparando Prova...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Disparar Prova Agora</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE AUDITORIA DE SPAM SCORE & ENTREGABILIDADE (Etapa 039) */}
      <SpamAuditModal
        isOpen={isSpamModalOpen}
        onClose={() => setIsSpamModalOpen(false)}
        audit={spamAudit}
        onReaudit={handleReauditSpam}
      />
    </div>
  );
}
