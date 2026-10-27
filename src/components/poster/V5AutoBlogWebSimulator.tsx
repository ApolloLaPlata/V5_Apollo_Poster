/**
 * V5AutoBlogWebSimulator.tsx - Visualizador de Preview de Artigo Web (Simulador do layout final no domínio v5autoblog.com)
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Simula com 100% de fidelidade a experiência do usuário final no portal oficial v5autoblog.com:
 * - Header oficial do portal com logotipo, menu taxonômico e CTA VIP
 * - Barra de endereço de navegador moderna (HTTPS, SSL, cópia de link)
 * - Layout responsivo com alternador Desktop (1200px) e Mobile (375px)
 * - Grid editorial de duas colunas (Artigo principal + Sidebar com ToC e Artigos do Cluster)
 * - Suporte a Paywall Break com blur dinâmico e bypass de operador
 * - Footer institucional da Holding V5 Apollo
 */

import React, { useState, useMemo } from "react";
import { 
  Globe, 
  Lock, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink, 
  Monitor, 
  Smartphone, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  User, 
  Tag, 
  ChevronRight, 
  BookOpen, 
  List, 
  Mail, 
  Key, 
  Eye, 
  EyeOff,
  Flame,
  Search
} from "lucide-react";
import { MultimodalDispatchPayload } from "@/types/poster";
import { evaluateExcerptQuality } from "@/lib/seo/excerptExtractor";
import { V5_TAXONOMIES } from "@/lib/seo/taxonomyEngine";

export interface V5AutoBlogWebSimulatorProps {
  payload: MultimodalDispatchPayload;
  readingTimeMinutes: number;
  wordCount: number;
  onAutoOptimizeExcerpt?: () => void;
  renderMarkdownToHtml: (md: string) => React.ReactNode;
}

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

export function V5AutoBlogWebSimulator({
  payload,
  readingTimeMinutes,
  wordCount,
  onAutoOptimizeExcerpt,
  renderMarkdownToHtml
}: V5AutoBlogWebSimulatorProps) {
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showFullPaywall, setShowFullPaywall] = useState(false);

  // Extrai Índice de Conteúdo (Table of Contents) a partir dos títulos Markdown
  const headings = useMemo<TocHeading[]>(() => {
    if (!payload.contentMarkdown) return [];
    const lines = payload.contentMarkdown.split("\n");
    const extracted: TocHeading[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const match = line.match(/^(#{2,3})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].replace(/[*_`]/g, "").trim();
        const id = `heading-${i}-${text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
        extracted.push({ id, text, level });
      }
    }
    return extracted;
  }, [payload.contentMarkdown]);

  // Tratamento de Paywall Break
  const { hasPaywall, freeContent, paywalledContent } = useMemo(() => {
    const paywallMarker = "<!-- PAYWALL_BREAK -->";
    const hasMarker = payload.contentMarkdown.includes(paywallMarker);
    if (!hasMarker) {
      return { hasPaywall: false, freeContent: payload.contentMarkdown, paywalledContent: "" };
    }
    const parts = payload.contentMarkdown.split(paywallMarker);
    return {
      hasPaywall: true,
      freeContent: parts[0] || "",
      paywalledContent: parts.slice(1).join("\n\n") || ""
    };
  }, [payload.contentMarkdown]);

  // Categoria ativa e dados taxonômicos
  const activeTaxonomy = useMemo(() => {
    return V5_TAXONOMIES.find(t => t.name.toLowerCase() === payload.blogOptions.category?.toLowerCase()) 
      || V5_TAXONOMIES[0];
  }, [payload.blogOptions.category]);

  const currentExcerpt = payload.summary || payload.emailOptions.previewText;
  const excerptQuality = evaluateExcerptQuality(currentExcerpt, payload.blogOptions.tags);

  const articleCanonicalUrl = `https://v5autoblog.com/artigo/${payload.slug}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(articleCanonicalUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="w-full space-y-4">
      {/* 1. TOP CONTROL BAR DO SIMULADOR (Modo Desktop/Mobile & Copiar Link) */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-300 font-semibold">Simulador de Produção:</span>
          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
            v5autoblog.com
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Alternador de Viewport */}
          <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
            <button
              type="button"
              onClick={() => setDeviceView("desktop")}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition text-[11px] ${
                deviceView === "desktop" ? "bg-amber-500 text-black font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop (1200px)</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceView("mobile")}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition text-[11px] ${
                deviceView === "mobile" ? "bg-amber-500 text-black font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile (375px)</span>
            </button>
          </div>

          {/* Copiar URL do Artigo */}
          <button
            type="button"
            onClick={handleCopyUrl}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 flex items-center gap-1 text-[11px] transition"
          >
            {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedUrl ? "Copiado!" : "Copiar URL"}</span>
          </button>
        </div>
      </div>

      {/* 2. MOLDURA DO NAVEGADOR SIMULADO (ARC / CHROME STYLE) */}
      <div className={`mx-auto transition-all duration-300 ${deviceView === "mobile" ? "max-w-[390px]" : "w-full"}`}>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden flex flex-col">
          {/* Browser Window Chrome Topbar */}
          <div className="bg-zinc-900/90 px-4 py-2.5 border-b border-zinc-800/80 flex items-center justify-between gap-3">
            {/* Window Controls (Traffic Lights) */}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>

            {/* Smart URL Address Bar */}
            <div className="flex-1 max-w-xl mx-auto flex items-center gap-2 bg-zinc-950/80 border border-zinc-800 px-3 py-1 rounded-lg text-xs font-mono text-zinc-300">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-zinc-500">https://</span>
              <span className="text-white font-semibold">v5autoblog.com</span>
              <span className="text-zinc-500">/artigo/</span>
              <span className="text-amber-400 truncate">{payload.slug}</span>
            </div>

            {/* Browser Right Actions */}
            <div className="flex items-center gap-2 text-zinc-400">
              <RefreshCw className="w-3.5 h-3.5 hover:text-white cursor-pointer transition" />
              <ExternalLink className="w-3.5 h-3.5 hover:text-white cursor-pointer transition" />
            </div>
          </div>

          {/* 3. HEADER OFICIAL DO PORTAL V5 AUTOBLOG */}
          <header className="bg-zinc-900 border-b border-zinc-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black font-black text-sm shadow-md shadow-amber-500/20">
                  V5
                </div>
                <div>
                  <span className="font-extrabold text-white text-base tracking-tight block leading-none">
                    AutoBlog
                  </span>
                  <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider">
                    Holding V5 Apollo
                  </span>
                </div>
              </div>

              {/* Categorias de Topo (visíveis apenas no desktop) */}
              {deviceView === "desktop" && (
                <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-zinc-800 text-xs">
                  {V5_TAXONOMIES.slice(0, 4).map(cat => (
                    <span 
                      key={cat.id}
                      className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                        cat.name === payload.blogOptions.category 
                          ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30" 
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {cat.name}
                    </span>
                  ))}
                </nav>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {deviceView === "desktop" && (
                <div className="hidden lg:flex items-center gap-2 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800 text-xs text-zinc-500">
                  <Search className="w-3.5 h-3.5" />
                  <span>Buscar artigos, guias, IAs...</span>
                </div>
              )}
              <button 
                type="button" 
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-md transition"
              >
                Assinar VIP
              </button>
            </div>
          </header>

          {/* 4. GOOGLE SERP SNIPPET PREVIEW (Sweet Spot 150-160c) */}
          <div className="p-4 sm:p-6 bg-zinc-900/60 border-b border-zinc-800/80">
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2 max-w-2xl">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-sans">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[9px]">G</span>
                  <span>v5autoblog.com › artigo › {payload.slug}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                    excerptQuality.status === "optimal"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : excerptQuality.status === "acceptable"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      : excerptQuality.status === "too_long"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                  }`}>
                    {excerptQuality.characterCount}/160c • {
                      excerptQuality.status === "optimal" ? "Sweet Spot SERP" :
                      excerptQuality.status === "too_long" ? "Truncamento Google" : "Curto"
                    }
                  </span>
                  {onAutoOptimizeExcerpt && (
                    <button
                      type="button"
                      onClick={onAutoOptimizeExcerpt}
                      className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono hover:underline"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Auto Otimizar</span>
                    </button>
                  )}
                </div>
              </div>
              <h4 className="text-sm font-bold text-blue-400 hover:underline cursor-pointer leading-tight">
                {payload.title} | V5 AutoBlog
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                {currentExcerpt}
              </p>
            </div>
          </div>

          {/* 5. CORPO PRINCIPAL DO ARTIGO & SIDEBAR EDITORIAL */}
          <main className="p-4 sm:p-8 bg-zinc-950 flex-1">
            <div className={`grid gap-8 ${deviceView === "desktop" ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1"}`}>
              {/* COLUNA ESQUERDA: ARTIGO EDITORIAL (8 colunas no desktop) */}
              <article className={`${deviceView === "desktop" ? "lg:col-span-8" : "w-full"} space-y-6`}>
                {/* Breadcrumbs */}
                <nav className="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5 flex-wrap">
                  <span className="hover:text-zinc-300 cursor-pointer">Início</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="hover:text-zinc-300 cursor-pointer">Blog</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-amber-400 font-semibold">{payload.blogOptions.category}</span>
                </nav>

                {/* Header do Artigo */}
                <div className="space-y-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${activeTaxonomy.badgeBg} ${activeTaxonomy.badgeText}`}>
                    {payload.blogOptions.category}
                  </span>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
                    {payload.title}
                  </h1>

                  {/* Metadados E-E-A-T */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-zinc-400 font-mono border-b border-zinc-800 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px] border border-amber-500/30">
                        AP
                      </div>
                      <span className="text-zinc-200 font-semibold">{payload.blogOptions.author}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>27 de Outubro de 2026</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{readingTimeMinutes} min de leitura</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Verificado E-E-A-T</span>
                    </div>
                  </div>
                </div>

                {/* Imagem de Capa (Hero Image) */}
                {payload.coverImageUrl && (
                  <figure className="my-6 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900 group">
                    <img
                      src={payload.coverImageUrl}
                      alt={payload.coverImageAlt || payload.title}
                      className="w-full max-h-[440px] object-cover group-hover:scale-[1.01] transition duration-500"
                    />
                    {payload.coverImageAlt && (
                      <figcaption className="p-2.5 text-center text-xs text-zinc-400 font-mono bg-zinc-900/90 border-t border-zinc-800">
                        {payload.coverImageAlt}
                      </figcaption>
                    )}
                  </figure>
                )}

                {/* Conteúdo Gratuito / Degustação */}
                <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed">
                  {renderMarkdownToHtml(freeContent)}
                </div>

                {/* Se houver Paywall Break */}
                {hasPaywall && (
                  <div className="relative pt-6">
                    {!showFullPaywall ? (
                      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-zinc-900/40 via-zinc-950 to-zinc-950 p-6 sm:p-8 text-center space-y-4 shadow-2xl relative overflow-hidden">
                        {/* Shimmer Effect */}
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
                          <Lock className="w-6 h-6" />
                        </div>

                        <div>
                          <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-widest block">
                            Conteúdo Restrito • V5 VIP Club
                          </span>
                          <h3 className="text-xl font-bold text-white mt-1">
                            Este artigo possui continuidade exclusiva para membros VIP
                          </h3>
                          <p className="text-xs text-zinc-400 max-w-md mx-auto mt-2 leading-relaxed">
                            Desbloqueie o acesso irrestrito a todos os artigos técnicos, prompts operacionais e relatórios estratégicos da Holding V5 Apollo.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                          <button
                            type="button"
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Desbloquear Acesso Completo</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowFullPaywall(true)}
                            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-mono transition flex items-center gap-1.5"
                            title="Visualizar todo o conteúdo no simulador do operador"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>Operador: Exibir Tudo</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 pt-4 border-t-2 border-dashed border-amber-500/40">
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-bold">
                            <Eye className="w-4 h-4 text-amber-400" />
                            <span>Modo Operador Ativo: Paywall Ignorado</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowFullPaywall(false)}
                            className="text-[11px] text-zinc-400 hover:text-white underline"
                          >
                            Ocultar Novamente
                          </button>
                        </div>

                        {/* Conteúdo Restrito Desbloqueado */}
                        <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed">
                          {renderMarkdownToHtml(paywalledContent)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tags Cloud */}
                {payload.blogOptions.tags.length > 0 && (
                  <div className="pt-6 border-t border-zinc-800 space-y-2">
                    <span className="text-[11px] font-mono text-zinc-500 uppercase block font-semibold">
                      Tópicos Relacionados & Taxonomia:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {payload.blogOptions.tags.map((tag) => (
                        <span 
                          key={tag}
                          className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-mono transition"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Box do Autor Editorial */}
                <div className="p-5 bg-zinc-900/80 rounded-2xl border border-zinc-800 flex items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-300 font-extrabold text-base shrink-0">
                    AP
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{payload.blogOptions.author}</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] font-mono">
                        Capitania #13
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Redação oficial e arquitetura de sistemas da Holding V5 Apollo. Conteúdos focados em inteligência artificial autônoma, automação e esteiras escaláveis.
                    </p>
                  </div>
                </div>
              </article>

              {/* COLUNA DIREITA: SIDEBAR EDITORIAL DO PORTAL (4 colunas no desktop) */}
              {deviceView === "desktop" && (
                <aside className="lg:col-span-4 space-y-6">
                  {/* Card 1: Índice do Artigo (Table of Contents) */}
                  {headings.length > 0 && (
                    <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider font-mono">
                        <List className="w-4 h-4 text-amber-400" />
                        <span>Neste Artigo (Índice)</span>
                      </div>
                      <nav className="space-y-1.5 text-xs">
                        {headings.map(h => (
                          <div 
                            key={h.id}
                            className={`text-zinc-400 hover:text-amber-400 transition cursor-pointer truncate ${
                              h.level === 3 ? "pl-3 text-[11px] text-zinc-500" : "font-medium"
                            }`}
                          >
                            • {h.text}
                          </div>
                        ))}
                      </nav>
                    </div>
                  )}

                  {/* Card 2: Newsletter Semanal AutoBlog */}
                  <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-amber-500/20 rounded-2xl p-5 space-y-3 shadow-xl">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider font-mono">
                      <Mail className="w-4 h-4" />
                      <span>Newsletter V5 Semanal</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Receba análises aprofundadas como esta diretamente na sua caixa de entrada, toda terça-feira.
                    </p>
                    <div className="space-y-2">
                      <input 
                        type="email" 
                        placeholder="seu.email@dominio.com" 
                        readOnly 
                        value="leitor@holdingv5.com"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-400 font-mono"
                      />
                      <button 
                        type="button" 
                        className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition"
                      >
                        Inscrever-se Gratuitamente
                      </button>
                    </div>
                  </div>

                  {/* Card 3: Artigos Relacionados do Cluster */}
                  <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider font-mono">
                      <Flame className="w-4 h-4 text-amber-400" />
                      <span>Em Destaque no Cluster</span>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1 group cursor-pointer">
                        <span className="text-[10px] font-mono text-amber-400 uppercase">
                          {activeTaxonomy.topicCluster}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-200 group-hover:text-amber-400 transition leading-snug">
                          Como estruturar RAG Local com memória contínua para agentes autônomos
                        </h4>
                        <span className="text-[10px] font-mono text-zinc-500">6 min de leitura</span>
                      </div>
                      <div className="pt-2 border-t border-zinc-800/80 space-y-1 group cursor-pointer">
                        <span className="text-[10px] font-mono text-amber-400 uppercase">
                          {activeTaxonomy.topicCluster}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-200 group-hover:text-amber-400 transition leading-snug">
                          A esteira de publicação sem extensões: arquitetura nativa em nuvem
                        </h4>
                        <span className="text-[10px] font-mono text-zinc-500">8 min de leitura</span>
                      </div>
                    </div>
                  </div>
                </aside>
              )}
            </div>
          </main>

          {/* 6. FOOTER OFICIAL DO PORTAL V5 AUTOBLOG */}
          <footer className="bg-zinc-900 border-t border-zinc-800 px-4 sm:px-8 py-6 text-xs text-zinc-500 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="font-bold text-zinc-300">V5 AutoBlog</span>
                <span>• Portal de Tecnologia, Automação & IA da Holding V5 Apollo</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="hover:text-zinc-300 cursor-pointer">Privacidade</span>
                <span>•</span>
                <span className="hover:text-zinc-300 cursor-pointer">Termos de Uso</span>
                <span>•</span>
                <span className="hover:text-zinc-300 cursor-pointer">Capitania #13 (:3011)</span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-600 font-mono text-center sm:text-left">
              © 2026 Holding V5 Apollo Ltda. Todos os direitos reservados. Publicação operada via V5 Apollo Poster.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
