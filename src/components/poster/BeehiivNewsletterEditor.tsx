"use client";

import React, { useState } from "react";
import { Mail, Globe, Send, Sparkles, Eye, CheckCircle2, FileText } from "lucide-react";

export function BeehiivNewsletterEditor() {
  const [subject, setSubject] = useState("A Revolução Silenciosa dos Agentes Autônomos em 2026");
  const [previewText, setPreviewText] = useState("Descubra como os novos modelos estão operando tarefas de 48h sem intervenção humana...");
  const [content, setContent] = useState(
`# A Revolução Silenciosa dos Agentes Autônomos em 2026

Olá! Se você acompanha tecnologia, provavelmente já percebeu que o jogo mudou.
Não estamos mais falando apenas de prompts de chat. Estamos falando de ecossistemas inteiros de agentes cooperando em tempo real.

### Os 3 Pilares do Novo Fluxo:
1. **Memória Contínua (RAG Local):** Nunca recomeçar do zero.
2. **Despacho Onicanal Nativo:** Escrever uma vez e publicar em 8 destinos.
3. **Micro-serviços Desacoplados:** Cada robô com seu propósito único.

> *"A produtividade não é fazer mais coisas, é eliminar o atrito entre a ideia e a distribuição."*

Nos vemos na próxima edição!`
  );

  const [activeTab, setActiveTab] = useState<"editor" | "previewEmail" | "previewBlog">("editor");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const handleDualPublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setPublishSuccess(true);
      setTimeout(() => setPublishSuccess(false), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 p-5 rounded-2xl border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Motor Dual Estilo Beehiiv / Substack</span>
          </div>
          <h2 className="text-xl font-bold text-white">Publicação Híbrida: Blog SEO + Newsletter E-mail</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Escreva o conteúdo uma única vez. O motor compila simultaneamente o artigo com schema de SEO para o AutoBlog e a newsletter responsiva HTML para a sua lista de inscritos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-zinc-800/80 p-1 rounded-lg border border-zinc-700/60 flex text-xs">
            <button
              onClick={() => setActiveTab("editor")}
              className={`px-3 py-1.5 rounded-md transition ${activeTab === "editor" ? "bg-amber-500 text-black font-semibold" : "text-zinc-300 hover:text-white"}`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab("previewEmail")}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${activeTab === "previewEmail" ? "bg-amber-500 text-black font-semibold" : "text-zinc-300 hover:text-white"}`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Preview</span>
            </button>
            <button
              onClick={() => setActiveTab("previewBlog")}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${activeTab === "previewBlog" ? "bg-amber-500 text-black font-semibold" : "text-zinc-300 hover:text-white"}`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Blog Preview</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === "editor" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Writing Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Assunto da Newsletter & Título H1 do Artigo
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Preview Text / Meta Descrição SEO (Google Snippet)
                </label>
                <input
                  type="text"
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Corpo do Artigo (Markdown Nativo)
                </label>
                <textarea
                  rows={14}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg p-3.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500 leading-relaxed resize-none"
                />
              </div>
            </div>
          </div>

          {/* Publishing Settings & Actions */}
          <div className="space-y-4">
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-400" />
                Destinos & Disparo Dual
              </h3>

              <div className="space-y-2.5">
                <label className="flex items-center gap-2.5 bg-zinc-800/60 p-2.5 rounded-lg border border-zinc-700/50 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-amber-500 focus:ring-0" />
                  <div className="text-xs">
                    <span className="font-semibold text-white block">V5 AutoBlog</span>
                    <span className="text-[11px] text-zinc-400">Publicar artigo completo com slug e tags SEO</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 bg-zinc-800/60 p-2.5 rounded-lg border border-zinc-700/50 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-amber-500 focus:ring-0" />
                  <div className="text-xs">
                    <span className="font-semibold text-white block">Lista VIP de E-mail</span>
                    <span className="text-[11px] text-zinc-400">Disparo via Resend API (HTML limpo e responsivo)</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 bg-zinc-800/60 p-2.5 rounded-lg border border-zinc-700/50 cursor-pointer">
                  <input type="checkbox" className="rounded text-amber-500 focus:ring-0" />
                  <div className="text-xs">
                    <span className="font-semibold text-white block">WordPress REST API</span>
                    <span className="text-[11px] text-zinc-400">Sincronizar no blog WordPress do cliente</span>
                  </div>
                </label>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleDualPublish}
                  disabled={isPublishing}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {isPublishing ? (
                    <span>Processando envio dual...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Publicar no Blog e Disparar E-mail</span>
                    </>
                  )}
                </button>

                {publishSuccess && (
                  <div className="mt-3 p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-400 text-xs flex items-center gap-1.5 justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Disparo e indexação concluídos com sucesso!</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 text-xs text-zinc-400 space-y-2">
              <span className="font-semibold text-zinc-300 block">Estatísticas Estimadas</span>
              <div className="flex justify-between border-b border-zinc-800 pb-1">
                <span>Tempo de Leitura:</span>
                <span className="font-mono text-zinc-200">~2 min</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1">
                <span>Tamanho do Payload:</span>
                <span className="font-mono text-zinc-200">3.4 KB</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de Abertura Estimada:</span>
                <span className="font-mono text-emerald-400">42.8%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "previewEmail" && (
        <div className="max-w-2xl mx-auto bg-white text-zinc-900 rounded-2xl p-8 shadow-2xl border border-zinc-200 space-y-6">
          <div className="border-b border-zinc-200 pb-4">
            <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono block mb-1">EDICAO SEMANAL #42</span>
            <h1 className="text-2xl font-bold text-zinc-900 leading-tight">{subject}</h1>
            <p className="text-xs text-zinc-500 mt-1 italic">{previewText}</p>
          </div>

          <div className="text-sm text-zinc-800 leading-relaxed whitespace-pre-line font-serif">
            {content}
          </div>

          <div className="border-t border-zinc-200 pt-6 text-center text-xs text-zinc-400">
            <p>© 2026 V5 Apollo Holding. Todos os direitos reservados.</p>
            <p className="text-[10px] mt-1">Você está recebendo este e-mail porque assinou nossa newsletter oficial.</p>
          </div>
        </div>
      )}

      {activeTab === "previewBlog" && (
        <div className="max-w-3xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-mono">
            <span>v5autoblog.com</span>
            <span>/</span>
            <span className="text-zinc-400">tecnologia-ia</span>
          </div>

          <h1 className="text-3xl font-extrabold text-white leading-tight">{subject}</h1>
          <div className="flex items-center gap-3 text-xs text-zinc-400 border-b border-zinc-800 pb-4">
            <span>Por Redação Apollo</span>
            <span>•</span>
            <span>27 de Outubro de 2026</span>
            <span>•</span>
            <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">SEO E-E-A-T Validado</span>
          </div>

          <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line font-sans space-y-4">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
