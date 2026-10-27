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
  ShieldCheck
} from "lucide-react";
import { MultimodalDispatchPayload } from "@/types/poster";
import { 
  compileEmailHtml, 
  compileBlogPayload, 
  compileSocialTeasers, 
  executeMockDispatch,
  slugify 
} from "@/lib/dispatch/multimodalEngine";
import { usePosterStore } from "@/store/usePosterStore";
import { toast } from "@/lib/toast/useToast";
import { dispatchEventBus } from "@/lib/events/dispatchEvents";
import { countWords, calculateReadingTimeMinutes } from "@/lib/utils/formatters";
import { extractContentMetadata } from "@/lib/utils/metadataExtractor";
import { sanitizeMarkdownAdvanced } from "@/lib/utils/markdownSanitizer";

const DEFAULT_PAYLOAD: MultimodalDispatchPayload = {
  id: "dispatch-001",
  title: "A Revolução Silenciosa dos Agentes Autônomos em 2026",
  slug: "revolucao-silenciosa-agentes-autonomos-2026",
  summary: "Como ecossistemas de agentes autônomos estão eliminando gargalos de produção e acelerando entregas digitais.",
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

Nos vemos na próxima transmissão!`,
  emailOptions: {
    enabled: true,
    subject: "A Revolução Silenciosa dos Agentes Autônomos em 2026",
    previewText: "Descubra como os ecossistemas autônomos operam pipelines de produção sem fricção...",
    fromName: "Holding V5 Apollo",
    provider: "resend",
    audienceList: "Assinantes VIP (1.845 inscritos)",
    utmCampaign: "newsletter_agentes_2026"
  },
  blogOptions: {
    enabled: true,
    targetPlatform: "v5autoblog",
    targetEndpoint: "https://v5autoblog.com/api/v1/posts",
    category: "Inteligência Artificial",
    tags: ["Agentes IA", "Automação", "Produtividade", "SaaS"],
    author: "Redação Apollo",
    generateSchema: true
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
  const { newsletterDraft, updateNewsletterDraft } = usePosterStore();
  const [payload, setPayload] = useState<MultimodalDispatchPayload>(() => {
    if (newsletterDraft && newsletterDraft.contentMarkdown) {
      return {
        ...DEFAULT_PAYLOAD,
        title: newsletterDraft.subject || DEFAULT_PAYLOAD.title,
        slug: slugify(newsletterDraft.subject || DEFAULT_PAYLOAD.title),
        summary: newsletterDraft.previewText || DEFAULT_PAYLOAD.summary,
        contentMarkdown: newsletterDraft.contentMarkdown || DEFAULT_PAYLOAD.contentMarkdown,
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
  const [previewFormat, setPreviewFormat] = useState<"reader" | "email" | "blog" | "raw">("reader");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<any>(null);

  const compiledHtml = compileEmailHtml(payload);
  const compiledBlogJson = compileBlogPayload(payload);
  const compiledTeasers = compileSocialTeasers(payload);

  const metadata = extractContentMetadata(payload.contentMarkdown);
  const words = metadata.wordCount;
  const chars = metadata.charCount;
  const readingTime = metadata.readingTimeMinutes;
  const linesCount = payload.contentMarkdown.split("\n").length;

  const handleInjectKeywordsAsTags = () => {
    const newTags = Array.from(
      new Set([...payload.blogOptions.tags, ...metadata.topKeywords.map(k => k.word)])
    );
    setPayload(prev => ({
      ...prev,
      blogOptions: { ...prev.blogOptions, tags: newTags }
    }));
    toast.success("Tags Atualizadas!", "Top palavras-chave injetadas nas tags do AutoBlog.");
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

  const handleTriggerDispatch = async () => {
    setIsDispatching(true);
    setExecutionResult(null);

    // Sanitização de segurança garantida antes do disparo
    const sanitizedClean = sanitizeMarkdownAdvanced(payload.contentMarkdown).cleanContent;
    const sanitizedPayload = { ...payload, contentMarkdown: sanitizedClean };

    const result = await executeMockDispatch(sanitizedPayload);

    setIsDispatching(false);
    setExecutionResult(result);
    setPayload(prev => ({
      ...prev,
      dispatchStatus: {
        overall: "completed",
        email: { status: "sent", sentCount: result.emailResult.sentCount, messageId: result.emailResult.messageId },
        blog: { status: "sent", publishedUrl: result.blogResult.publishedUrl, statusCode: result.blogResult.statusCode },
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
  };

  const handlePreviewTextChange = (newPreview: string) => {
    setPayload(prev => ({
      ...prev,
      summary: newPreview,
      emailOptions: { ...prev.emailOptions, previewText: newPreview }
    }));
    updateNewsletterDraft({ previewText: newPreview });
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

          {/* Split Mode Switcher */}
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
              title="Apenas Editor de Markdown"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Editor</span>
            </button>
            <button
              onClick={() => setSplitMode("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
                splitMode === "preview" ? "bg-amber-500 text-black font-bold shadow" : "text-zinc-400 hover:text-white"
              }`}
              title="Apenas Pré-visualização"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Preview</span>
            </button>
          </div>

          {/* Toggle Destination Settings */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
              isSettingsOpen 
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40" 
                : "bg-zinc-800/80 text-zinc-300 border-zinc-700/60 hover:text-white"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Matriz Despacho</span>
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

      {/* Article Meta Bar (Title, Slug, Preheader) */}
      <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 space-y-3">
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
                  onClick={() => setPreviewFormat("raw")}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono transition ${
                    previewFormat === "raw" ? "bg-amber-500 text-black font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Code className="w-3 h-3" />
                  <span>Raw HTML</span>
                </button>
              </div>

              {/* Viewport Device Toggle */}
              <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-[11px]">
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1 rounded transition ${
                    previewDevice === "desktop" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                  title="Visualização Desktop"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1 rounded transition ${
                    previewDevice === "mobile" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                  title="Visualização Mobile (375px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
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

                  {/* Rendered Markdown Body */}
                  <div className="prose prose-invert max-w-none text-zinc-300">
                    {renderMarkdownToHtml(payload.contentMarkdown)}
                  </div>
                </div>
              )}

              {/* 2. MODO E-MAIL HTML */}
              {previewFormat === "email" && (
                <div className="flex flex-col h-full space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400 pb-1">
                    <span>HTML Inline Responsivo com Safe-Font Stacks para Gmail e Outlook</span>
                    <button
                      onClick={() => handleCopy(compiledHtml, "HTML E-mail")}
                      className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar HTML</span>
                    </button>
                  </div>
                  <div className="flex-1 flex justify-center bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                    <iframe
                      srcDoc={compiledHtml}
                      title="Email Preview"
                      className={`h-full min-h-[500px] rounded-lg border border-zinc-700/60 bg-white shadow-xl transition-all ${
                        previewDevice === "mobile" ? "w-[375px]" : "w-full max-w-[620px]"
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* 3. MODO AUTOBlog JSON */}
              {previewFormat === "blog" && (
                <div className="h-full flex flex-col space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400 pb-1">
                    <span>Payload Estruturado para o Endpoint do AutoBlog REST API</span>
                    <button
                      onClick={() => handleCopy(JSON.stringify(compiledBlogJson, null, 2), "JSON AutoBlog")}
                      className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar JSON</span>
                    </button>
                  </div>
                  <div className="flex-1 bg-zinc-950 p-4 rounded-xl border border-zinc-800 overflow-auto">
                    <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
                      {JSON.stringify(compiledBlogJson, null, 2)}
                    </pre>
                  </div>
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

      {/* COLLAPSIBLE DESTINATION & DISPATCH DRAWER */}
      {isSettingsOpen && (
        <div className="bg-zinc-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-2xl space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Zap className="w-4 h-4 fill-amber-400" />
              <span>Matriz Onicanal de Despacho Simultâneo</span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Fechar Painel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Email Destination */}
            <label className="flex items-start gap-3 bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 cursor-pointer hover:border-zinc-700 transition">
              <input
                type="checkbox"
                checked={payload.emailOptions.enabled}
                onChange={(e) => setPayload(prev => ({
                  ...prev,
                  emailOptions: { ...prev.emailOptions, enabled: e.target.checked }
                }))}
                className="mt-1 rounded text-amber-500 focus:ring-0"
              />
              <div>
                <span className="text-xs font-bold text-white block">Ponta E-mail (Newsletter)</span>
                <span className="text-[11px] text-zinc-400 block mt-0.5">
                  Resend API • {payload.emailOptions.audienceList}
                </span>
              </div>
            </label>

            {/* AutoBlog Destination */}
            <label className="flex items-start gap-3 bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 cursor-pointer hover:border-zinc-700 transition">
              <input
                type="checkbox"
                checked={payload.blogOptions.enabled}
                onChange={(e) => setPayload(prev => ({
                  ...prev,
                  blogOptions: { ...prev.blogOptions, enabled: e.target.checked }
                }))}
                className="mt-1 rounded text-amber-500 focus:ring-0"
              />
              <div>
                <span className="text-xs font-bold text-white block">Ponta Blog (V5 AutoBlog REST)</span>
                <span className="text-[11px] text-zinc-400 block mt-0.5">
                  Schema.org + Tags SEO • Endpoint Seguro
                </span>
              </div>
            </label>

            {/* Social Teasers Destination */}
            <label className="flex items-start gap-3 bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 cursor-pointer hover:border-zinc-700 transition">
              <input
                type="checkbox"
                checked={payload.socialTeaserOptions.enabled}
                onChange={(e) => setPayload(prev => ({
                  ...prev,
                  socialTeaserOptions: { ...prev.socialTeaserOptions, enabled: e.target.checked }
                }))}
                className="mt-1 rounded text-amber-500 focus:ring-0"
              />
              <div>
                <span className="text-xs font-bold text-white block">Ponta Social & VIP</span>
                <span className="text-[11px] text-zinc-400 block mt-0.5">
                  Teasers formatados para Telegram VIP, WhatsApp e Redes
                </span>
              </div>
            </label>
          </div>

          {/* Social Teasers Preview Grid */}
          {payload.socialTeaserOptions.enabled && (
            <div className="pt-2 border-t border-zinc-800/80 space-y-3">
              <span className="text-xs font-bold text-zinc-300 block">Teasers Automáticos Gerados:</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                  <div className="flex items-center justify-between text-[11px] text-pink-400 font-semibold mb-1">
                    <span>Instagram / Threads</span>
                    <button onClick={() => handleCopy(compiledTeasers.instagram_caption, "Legenda Instagram")} className="text-amber-400 hover:underline">Copiar</button>
                  </div>
                  <p className="text-zinc-400 line-clamp-2 text-[11px] font-mono">{compiledTeasers.instagram_caption}</p>
                </div>
                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                  <div className="flex items-center justify-between text-[11px] text-sky-400 font-semibold mb-1">
                    <span>Telegram VIP</span>
                    <button onClick={() => handleCopy(compiledTeasers.telegram_vip, "Telegram VIP")} className="text-amber-400 hover:underline">Copiar</button>
                  </div>
                  <p className="text-zinc-400 line-clamp-2 text-[11px] font-mono">{compiledTeasers.telegram_vip}</p>
                </div>
              </div>
            </div>
          )}

          {/* Trigger Dispatch Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-zinc-400">
              Pronto para transmissão sem extensões de navegador ou intervenção manual.
            </div>
            <button
              onClick={handleTriggerDispatch}
              disabled={isDispatching}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:brightness-110 text-black font-extrabold px-6 py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isDispatching ? (
                <span className="animate-pulse">Transmitindo pelos canais...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-black" />
                  <span>Disparar Agora pelos Canais Ativos</span>
                </>
              )}
            </button>
          </div>

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
  );
}
