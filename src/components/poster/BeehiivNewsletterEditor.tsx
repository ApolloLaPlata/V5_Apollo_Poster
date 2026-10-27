"use client";

import React, { useState } from "react";
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
  ArrowRight
} from "lucide-react";
import { MultimodalDispatchPayload } from "@/types/poster";
import { 
  compileEmailHtml, 
  compileBlogPayload, 
  compileSocialTeasers, 
  executeMockDispatch,
  slugify 
} from "@/lib/dispatch/multimodalEngine";

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

export function BeehiivNewsletterEditor() {
  const [payload, setPayload] = useState<MultimodalDispatchPayload>(DEFAULT_PAYLOAD);
  const [activeTab, setActiveTab] = useState<"input" | "email" | "blog" | "social" | "raw_html">("input");
  const [isDispatching, setIsDispatching] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<any>(null);

  const compiledHtml = compileEmailHtml(payload);
  const compiledBlogJson = compileBlogPayload(payload);
  const compiledTeasers = compileSocialTeasers(payload);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(label);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const handleTriggerDispatch = async () => {
    setIsDispatching(true);
    setExecutionResult(null);

    const result = await executeMockDispatch(payload);

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
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 p-5 rounded-2xl border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Esteira de Distribuição Multimodal Simultânea</span>
          </div>
          <h2 className="text-xl font-bold text-white">Central de Despacho: E-mail + AutoBlog + Redes</h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-3xl">
            O V5 Apollo Poster não hospeda nem gerencia conteúdo. Ele recebe a matéria-prima e distribui simultaneamente: compila o HTML inline responsivo para envio de newsletter por e-mail, formata o JSON estruturado para a API do AutoBlog e extrai teasers para redes e canais VIP.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 bg-zinc-800/80 p-1 rounded-xl border border-zinc-700/60 text-xs">
          <button
            onClick={() => setActiveTab("input")}
            className={`px-3 py-1.5 rounded-lg transition font-medium ${
              activeTab === "input" ? "bg-amber-500 text-black font-bold" : "text-zinc-300 hover:text-white"
            }`}
          >
            Conteúdo Base
          </button>
          <button
            onClick={() => setActiveTab("email")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
              activeTab === "email" ? "bg-amber-500 text-black font-bold" : "text-zinc-300 hover:text-white"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Ponta E-mail</span>
          </button>
          <button
            onClick={() => setActiveTab("blog")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
              activeTab === "blog" ? "bg-amber-500 text-black font-bold" : "text-zinc-300 hover:text-white"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Ponta AutoBlog</span>
          </button>
          <button
            onClick={() => setActiveTab("social")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
              activeTab === "social" ? "bg-amber-500 text-black font-bold" : "text-zinc-300 hover:text-white"
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Ponta Social & VIP</span>
          </button>
          <button
            onClick={() => setActiveTab("raw_html")}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition font-mono text-[11px] ${
              activeTab === "raw_html" ? "bg-amber-500 text-black font-bold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Code className="w-3 h-3" />
            <span>Raw HTML</span>
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      {activeTab === "input" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Título Principal do Conteúdo
                </label>
                <input
                  type="text"
                  value={payload.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setPayload(prev => ({
                      ...prev,
                      title,
                      slug: slugify(title),
                      emailOptions: { ...prev.emailOptions, subject: title }
                    }));
                  }}
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Slug Canônico (URL do Blog)
                  </label>
                  <input
                    type="text"
                    value={payload.slug}
                    onChange={(e) => setPayload(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Preheader E-mail & Resumo Social
                  </label>
                  <input
                    type="text"
                    value={payload.emailOptions.previewText}
                    onChange={(e) => setPayload(prev => ({
                      ...prev,
                      summary: e.target.value,
                      emailOptions: { ...prev.emailOptions, previewText: e.target.value }
                    }))}
                    className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-300">
                    Corpo do Artigo (Markdown Nativo)
                  </label>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {payload.contentMarkdown.length} caracteres
                  </span>
                </div>
                <textarea
                  rows={14}
                  value={payload.contentMarkdown}
                  onChange={(e) => setPayload(prev => ({ ...prev, contentMarkdown: e.target.value }))}
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg p-3.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500 leading-relaxed resize-none"
                />
              </div>
            </div>
          </div>

          {/* Destination Controls & Dispatch Action */}
          <div className="space-y-4">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-400" />
                Matriz de Despacho Ativa
              </h3>

              <div className="space-y-3">
                <label className="flex items-start gap-3 bg-zinc-800/60 p-3 rounded-lg border border-zinc-700/60 cursor-pointer">
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
                      Compilar HTML inline e disparar para {payload.emailOptions.audienceList} via Resend API
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 bg-zinc-800/60 p-3 rounded-lg border border-zinc-700/60 cursor-pointer">
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
                      Transmitir JSON com Schema Org e SEO tags para o endpoint {payload.blogOptions.targetEndpoint}
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 bg-zinc-800/60 p-3 rounded-lg border border-zinc-700/60 cursor-pointer">
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
                    <span className="text-xs font-bold text-white block">Ponta Teasers (Redes & Grupos VIP)</span>
                    <span className="text-[11px] text-zinc-400 block mt-0.5">
                      Disparo no Telegram VIP, WhatsApp Comunidades e canais sociais
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleTriggerDispatch}
                  disabled={isDispatching}
                  className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:brightness-110 text-black font-extrabold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isDispatching ? (
                    <span className="animate-pulse">Transmitindo pelos canais...</span>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-black" />
                      <span>Executar Despacho Simultâneo</span>
                    </>
                  )}
                </button>

                {executionResult && (
                  <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Despacho Concluído com Sucesso!</span>
                    </div>
                    <div className="text-[11px] text-zinc-300 space-y-1 font-mono">
                      <div>• E-mail: {executionResult.emailResult.sentCount} disparos ({executionResult.emailResult.messageId})</div>
                      <div>• AutoBlog: HTTP {executionResult.blogResult.statusCode} OK (<a href={executionResult.blogResult.publishedUrl} target="_blank" className="underline text-amber-400">{executionResult.blogResult.publishedUrl}</a>)</div>
                      <div>• Social & VIP: {executionResult.socialResult.deliveredChannels.join(", ")}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Preview Tab */}
      {activeTab === "email" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-xs">
            <span className="text-zinc-300">
              Visualização de E-mail Responsivo (HTML Inline Seguro para Gmail/Outlook/Apple Mail)
            </span>
            <button
              onClick={() => handleCopy(compiledHtml, "email_html")}
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-700 text-xs transition"
            >
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              <span>{copiedSnippet === "email_html" ? "Copiado!" : "Copiar Código HTML"}</span>
            </button>
          </div>

          <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 flex justify-center">
            <iframe
              srcDoc={compiledHtml}
              title="Email Preview"
              className="w-full max-w-[650px] h-[600px] rounded-xl border border-zinc-700/60 bg-white shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* AutoBlog Payload Tab */}
      {activeTab === "blog" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-xs">
            <span className="text-zinc-300">
              Payload JSON Estruturado para o Endpoint do AutoBlog REST API (POST {payload.blogOptions.targetEndpoint})
            </span>
            <button
              onClick={() => handleCopy(JSON.stringify(compiledBlogJson, null, 2), "blog_json")}
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-700 text-xs transition"
            >
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              <span>{copiedSnippet === "blog_json" ? "Copiado!" : "Copiar JSON"}</span>
            </button>
          </div>

          <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 overflow-x-auto">
            <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
              {JSON.stringify(compiledBlogJson, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Social & VIP Teasers Tab */}
      {activeTab === "social" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Instagram Caption */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-pink-400" />
                <span>Legenda para Instagram / Reels</span>
              </span>
              <button
                onClick={() => handleCopy(compiledTeasers.instagram_caption, "ig_teaser")}
                className="text-[11px] text-amber-400 hover:underline"
              >
                {copiedSnippet === "ig_teaser" ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <textarea
              readOnly
              rows={7}
              value={compiledTeasers.instagram_caption}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 font-mono resize-none"
            />
          </div>

          {/* Telegram VIP */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Canal VIP Telegram (Markdown Format)</span>
              </span>
              <button
                onClick={() => handleCopy(compiledTeasers.telegram_vip, "tg_teaser")}
                className="text-[11px] text-amber-400 hover:underline"
              >
                {copiedSnippet === "tg_teaser" ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <textarea
              readOnly
              rows={7}
              value={compiledTeasers.telegram_vip}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 font-mono resize-none"
            />
          </div>

          {/* X / Twitter */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-zinc-300" />
                <span>Post para X / Twitter</span>
              </span>
              <button
                onClick={() => handleCopy(compiledTeasers.x_twitter, "x_teaser")}
                className="text-[11px] text-amber-400 hover:underline"
              >
                {copiedSnippet === "x_teaser" ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <textarea
              readOnly
              rows={6}
              value={compiledTeasers.x_twitter}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 font-mono resize-none"
            />
          </div>

          {/* WhatsApp Community */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Comunidade WhatsApp</span>
              </span>
              <button
                onClick={() => handleCopy(compiledTeasers.whatsapp_community, "wa_teaser")}
                className="text-[11px] text-amber-400 hover:underline"
              >
                {copiedSnippet === "wa_teaser" ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <textarea
              readOnly
              rows={6}
              value={compiledTeasers.whatsapp_community}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 font-mono resize-none"
            />
          </div>
        </div>
      )}

      {/* Raw HTML Code Tab */}
      {activeTab === "raw_html" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-xs">
            <span className="text-zinc-300">
              Código-fonte HTML Inline Completo da Newsletter (Pronto para copiar em provedores externos)
            </span>
            <button
              onClick={() => handleCopy(compiledHtml, "raw_html_code")}
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-700 text-xs transition"
            >
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              <span>{copiedSnippet === "raw_html_code" ? "Copiado!" : "Copiar Código HTML"}</span>
            </button>
          </div>

          <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 overflow-x-auto">
            <pre className="text-xs font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap break-all">
              {compiledHtml}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
