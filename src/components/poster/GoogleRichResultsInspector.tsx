/**
 * GoogleRichResultsInspector.tsx - Inspecionador de JSON Schema e Validador de Rich Results do Google
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Ferramenta oficial para validação em tempo real de conformidade com o Google Search Central:
 * - Diagnóstico profundo de Schema.org JSON-LD (BlogPosting / Article)
 * - Verificador de elegibilidade para Google Discover, Top Stories e Rich Snippets
 * - Simulador visual de Rich Snippet no Google SERP
 * - Auditoria de diretivas anti-cloaking para paywalls
 * - Exportação de script JSON-LD e links para o Google Rich Results Test oficial
 */

import React, { useState, useMemo } from "react";
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  Code, 
  ShieldCheck, 
  Eye, 
  Layers, 
  FileText, 
  Calendar, 
  User, 
  Globe, 
  Search, 
  Compass, 
  Flame, 
  Cpu, 
  CheckCheck
} from "lucide-react";
import { MultimodalDispatchPayload } from "@/types/poster";
import { 
  generateBlogPostingSchema, 
  generateBreadcrumbSchema, 
  renderSchemaJsonLdScript 
} from "@/lib/dispatch/schemaGenerator";
import { 
  validateGoogleRichResults, 
  RichResultsValidationReport, 
  RichResultCheck 
} from "@/lib/seo/richResultsValidator";
import { toast } from "@/lib/toast/useToast";

export interface GoogleRichResultsInspectorProps {
  payload: MultimodalDispatchPayload;
}

export function GoogleRichResultsInspector({ payload }: GoogleRichResultsInspectorProps) {
  const [copiedType, setCopiedType] = useState<"json" | "html" | null>(null);
  const [activeSchemaTab, setActiveSchemaTab] = useState<"article" | "breadcrumbs">("article");
  const [filterStatus, setFilterStatus] = useState<"all" | "fail" | "warn" | "pass">("all");

  // 1. Gera Schemas JSON-LD
  const articleSchema = useMemo(() => {
    return generateBlogPostingSchema({
      title: payload.title,
      headline: payload.title,
      description: payload.summary || payload.emailOptions.previewText,
      contentMarkdown: payload.contentMarkdown,
      canonicalUrl: payload.canonical_url || `https://v5autoblog.com/artigo/${payload.slug}`,
      coverImageUrl: payload.coverImageUrl,
      coverImageAlt: payload.coverImageAlt,
      authorName: payload.blogOptions.author || "Apollo La Plata",
      authorRole: "Editor Chefe & Arquiteto de Sistemas",
      authorUrl: "https://v5autoblog.com/autor/apollo-laplata",
      category: payload.blogOptions.category,
      tags: payload.blogOptions.tags,
      hasPaywall: payload.contentMarkdown.includes("<!-- PAYWALL_BREAK -->"),
      articleType: "BlogPosting"
    });
  }, [payload]);

  const breadcrumbsSchema = useMemo(() => {
    return generateBreadcrumbSchema({
      category: payload.blogOptions.category,
      articleTitle: payload.title,
      articleUrl: payload.canonical_url || `https://v5autoblog.com/artigo/${payload.slug}`,
      baseUrl: "https://v5autoblog.com"
    });
  }, [payload]);

  // 2. Validação Profunda de Rich Results
  const report: RichResultsValidationReport = useMemo(() => {
    const targetSchema = activeSchemaTab === "article" ? articleSchema : breadcrumbsSchema;
    return validateGoogleRichResults(
      targetSchema, 
      payload.canonical_url || `https://v5autoblog.com/artigo/${payload.slug}`
    );
  }, [activeSchemaTab, articleSchema, breadcrumbsSchema, payload]);

  // Filtro de Checagens
  const filteredChecks = useMemo(() => {
    if (filterStatus === "all") return report.checks;
    return report.checks.filter(c => c.status === filterStatus);
  }, [report.checks, filterStatus]);

  // Manipuladores de Cópia
  const handleCopyJson = () => {
    navigator.clipboard.writeText(report.formattedJson);
    setCopiedType("json");
    toast.success("JSON-LD copiado para a área de transferência!");
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyHtmlScript = () => {
    navigator.clipboard.writeText(report.htmlScriptTag);
    setCopiedType("html");
    toast.success("Script <script type='application/ld+json'> copiado!");
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. CABEÇALHO DO INSPECIONADOR COM SCORE GLOBAL & AÇÕES */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-lg border ${
              report.overallScore >= 85 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                : report.overallScore >= 60 
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30" 
                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
            }`}>
              {report.overallScore}%
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Google Rich Results & Schema Inspector</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Google Search Central 2026
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Auditoria de dados estruturados para BlogPosting, Discover, Carrosséis e AEO.
              </p>
            </div>
          </div>

          {/* Botões de Ação do Inspetor */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyJson}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-mono flex items-center gap-1.5 transition"
              title="Copiar JSON-LD Puro"
            >
              {copiedType === "json" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copiar JSON-LD</span>
            </button>
            <button
              type="button"
              onClick={handleCopyHtmlScript}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-mono flex items-center gap-1.5 transition"
              title="Copiar tag HTML pronta"
            >
              {copiedType === "html" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code className="w-3.5 h-3.5" />}
              <span>Copiar &lt;script&gt;</span>
            </button>
            <a
              href={report.googleTestUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono flex items-center gap-1.5 transition shadow-sm"
              title="Testar ferramenta oficial do Google"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Google Test Tool</span>
            </a>
          </div>
        </div>

        {/* Barra de Resumo das Checagens */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs font-mono">
          <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80 flex items-center justify-between">
            <span className="text-zinc-400">Status Geral:</span>
            <span className={`font-bold flex items-center gap-1 ${
              report.isValid ? "text-emerald-400" : "text-rose-400"
            }`}>
              {report.isValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              {report.isValid ? "100% Elegível" : "Erros Bloqueantes"}
            </span>
          </div>
          <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80 flex items-center justify-between">
            <span className="text-zinc-400">Aprovados:</span>
            <span className="font-bold text-emerald-400">{report.summary.passed}</span>
          </div>
          <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80 flex items-center justify-between">
            <span className="text-zinc-400">Avisos (Otimizáveis):</span>
            <span className="font-bold text-amber-400">{report.summary.warnings}</span>
          </div>
          <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80 flex items-center justify-between">
            <span className="text-zinc-400">Erros Críticos:</span>
            <span className="font-bold text-rose-400">{report.summary.errors}</span>
          </div>
        </div>
      </div>

      {/* 2. SIMULADOR VISUAL DE RICH SNIPPET NA SERP DO GOOGLE */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Simulador Visual: Card com Rich Snippet no Google
            </h4>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            Padrão Desktop / Google Mobile Search
          </span>
        </div>

        {/* Card da Busca Simulado */}
        <div className="bg-zinc-950 p-4 sm:p-5 rounded-xl border border-zinc-800/80 space-y-2">
          {/* Favicon & Caminho Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px]">
              V5
            </div>
            <div className="flex items-center gap-1 font-mono text-[11px]">
              <span className="text-zinc-300 font-medium">v5autoblog.com</span>
              <span className="text-zinc-600">›</span>
              <span className="text-zinc-400">artigo</span>
              <span className="text-zinc-600">›</span>
              <span className="text-amber-400 font-semibold">{payload.slug}</span>
            </div>
          </div>

          {/* Título & Grid com Imagem */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start pt-1">
            <div className="space-y-1.5 flex-1">
              <h3 className="text-base sm:text-lg font-bold text-blue-400 hover:underline cursor-pointer leading-tight">
                {payload.title} | V5 AutoBlog
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {payload.summary || payload.emailOptions.previewText}
              </p>
              {/* Badges de Metadados Ricos */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-zinc-400">
                <span className="flex items-center gap-1 text-zinc-400">
                  <User className="w-3 h-3 text-amber-400" />
                  <span>Por {payload.blogOptions.author || "Apollo La Plata"}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-zinc-500" />
                  <span>27 de Outubro de 2026</span>
                </span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                  Schema BlogPosting
                </span>
              </div>
            </div>

            {/* Thumbnail 16:9 se houver imagem */}
            {payload.coverImageUrl && (
              <div className="w-full sm:w-36 h-24 rounded-lg overflow-hidden border border-zinc-800 shrink-0 bg-zinc-900">
                <img
                  src={payload.coverImageUrl}
                  alt={payload.coverImageAlt || payload.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. GRADE DE ELEGIBILIDADE DE RECURSOS DO GOOGLE */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
            Elegibilidade de Recursos do Google & IA Generativa
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {report.features.map(feat => (
            <div 
              key={feat.feature}
              className={`p-4 rounded-xl border transition space-y-2.5 ${
                feat.eligible 
                  ? "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700" 
                  : "bg-rose-950/10 border-rose-900/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-xs text-white flex items-center gap-1.5">
                  {feat.feature === "google_discover" && <Flame className="w-3.5 h-3.5 text-amber-400" />}
                  {feat.feature === "top_stories" && <Globe className="w-3.5 h-3.5 text-blue-400" />}
                  {feat.feature === "ai_overviews" && <Cpu className="w-3.5 h-3.5 text-purple-400" />}
                  {feat.feature === "breadcrumbs" && <Layers className="w-3.5 h-3.5 text-emerald-400" />}
                  {feat.feature === "google_rich_snippets" && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{feat.name}</span>
                </h5>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  feat.eligible
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}>
                  {feat.eligible ? "Elegível" : "Incompleto"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {feat.description}
              </p>
              {feat.blockers.length > 0 && (
                <div className="p-2 rounded bg-rose-500/5 border border-rose-500/20 text-[10px] text-rose-300 font-mono space-y-1">
                  <span className="font-bold block">Pendências Bloqueantes:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {feat.blockers.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. DIAGNÓSTICO DETALHADO DAS DIRETIVAS DO GOOGLE SEARCH CENTRAL */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Auditoria de Diretrizes Schema.org ({report.checks.length} Verificações)
            </h4>
          </div>

          {/* Filtro de Status */}
          <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setFilterStatus("all")}
              className={`px-2.5 py-1 rounded transition ${
                filterStatus === "all" ? "bg-zinc-800 text-white font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Todas ({report.checks.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("fail")}
              className={`px-2.5 py-1 rounded transition ${
                filterStatus === "fail" ? "bg-rose-500/20 text-rose-300 font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Erros ({report.summary.errors})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("warn")}
              className={`px-2.5 py-1 rounded transition ${
                filterStatus === "warn" ? "bg-amber-500/20 text-amber-300 font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Avisos ({report.summary.warnings})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("pass")}
              className={`px-2.5 py-1 rounded transition ${
                filterStatus === "pass" ? "bg-emerald-500/20 text-emerald-300 font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Aprovadas ({report.summary.passed})
            </button>
          </div>
        </div>

        {/* Lista de Checagens */}
        <div className="space-y-2">
          {filteredChecks.map(chk => (
            <div
              key={chk.id}
              className={`p-3 rounded-xl border flex items-start gap-3 transition ${
                chk.status === "pass" 
                  ? "bg-zinc-950/40 border-zinc-800/80" 
                  : chk.status === "warn" 
                  ? "bg-amber-500/5 border-amber-500/20" 
                  : "bg-rose-500/5 border-rose-500/20"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {chk.status === "pass" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {chk.status === "warn" && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                {chk.status === "fail" && <XCircle className="w-4 h-4 text-rose-400" />}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono">{chk.label}</span>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">{chk.category}</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {chk.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. INSPECIONADOR DE CÓDIGO FONTE JSON-LD */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Visualizador de Código Estruturado ({report.detectedType})
            </h4>
          </div>

          <div className="flex items-center gap-2">
            {/* Alternador Artigo vs Breadcrumbs */}
            <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveSchemaTab("article")}
                className={`px-2.5 py-1 rounded transition text-[11px] ${
                  activeSchemaTab === "article" ? "bg-amber-500 text-black font-bold" : "text-zinc-400 hover:text-white"
                }`}
              >
                BlogPosting
              </button>
              <button
                type="button"
                onClick={() => setActiveSchemaTab("breadcrumbs")}
                className={`px-2.5 py-1 rounded transition text-[11px] ${
                  activeSchemaTab === "breadcrumbs" ? "bg-amber-500 text-black font-bold" : "text-zinc-400 hover:text-white"
                }`}
              >
                BreadcrumbList
              </button>
            </div>
          </div>
        </div>

        {/* Bloco de Código com Scroll */}
        <div className="relative">
          <pre className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto max-h-96 leading-relaxed select-all">
            {report.formattedJson}
          </pre>
        </div>
      </div>
    </div>
  );
}
