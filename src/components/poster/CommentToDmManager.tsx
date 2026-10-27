"use client";

import React, { useState } from "react";
import { MessageSquare, Zap, Bot, Shield, Check, Plus, Trash2, ArrowRight } from "lucide-react";
import { CommentRule } from "@/types/poster";

const INITIAL_RULES: CommentRule[] = [
  {
    id: "rule-1",
    name: "Automação Reel Achadinhos Tech",
    platform: "instagram",
    targetPostId: "reel_748291038",
    keywords: ["EU QUERO", "QUERO", "LINK", "ONDE COMPRA"],
    publicReplyVariants: [
      "Acabei de te enviar no direct com o melhor preço! 🔥",
      "Confere seu direct, mandei o link com desconto exclusivo! 🚀",
      "Te mandei na mensagem direta! Dá uma olhada lá 👀"
    ],
    dmMessageTemplate: "Olá! Vi que você comentou no nosso Reel sobre o Teclado Mecânico. Aqui está o link com 45% OFF: {{ctaUrl}}",
    ctaUrl: "https://v5finders.com/deal/teclado-mecanico-pro?utm_source=ig_comment_dm",
    isActive: true,
    totalTriggered: 142
  },
  {
    id: "rule-2",
    name: "Captação Lead TikTok Tools",
    platform: "tiktok",
    targetPostId: "video_99281726",
    keywords: ["PLANILHA", "TOOL", "GRATIS"],
    publicReplyVariants: [
      "Mandei no privado o acesso liberado! ⚡",
      "Link enviado na sua DM! Aproveita!"
    ],
    dmMessageTemplate: "Aqui está o acesso gratuito à ferramenta de IA mencionada no vídeo: {{ctaUrl}}",
    ctaUrl: "https://v5tools.com/hub?utm_source=tiktok_dm",
    isActive: true,
    totalTriggered: 89
  }
];

export function CommentToDmManager() {
  const [rules, setRules] = useState<CommentRule[]>(INITIAL_RULES);
  const [selectedRule, setSelectedRule] = useState<CommentRule>(rules[0]);
  const [testComment, setTestComment] = useState("Eu quero esse link por favor!");
  const [simulatedReply, setSimulatedReply] = useState<string | null>(null);
  const [simulatedDm, setSimulatedDm] = useState<string | null>(null);

  const handleTestSimulator = () => {
    const upperComment = testComment.toUpperCase();
    const matched = selectedRule.keywords.some(kw => upperComment.includes(kw));

    if (matched) {
      const reply = selectedRule.publicReplyVariants[Math.floor(Math.random() * selectedRule.publicReplyVariants.length)];
      const dm = selectedRule.dmMessageTemplate.replace("{{ctaUrl}}", selectedRule.ctaUrl);
      setSimulatedReply(reply);
      setSimulatedDm(dm);
    } else {
      setSimulatedReply("Nenhuma palavra-chave compatível encontrada no comentário.");
      setSimulatedDm(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-zinc-900 to-zinc-900 p-5 rounded-2xl border border-blue-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Bot className="w-4 h-4" />
            <span>ChatbotX Core Integration • Substituto ManyChat</span>
          </div>
          <h2 className="text-xl font-bold text-white">Comment-to-DM & Lead Hunter Automatizado</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Dispare respostas públicas variadas e envie links de afiliados ou páginas de captura diretamente no direct de quem comentar palavras-chave nos seus Reels e TikToks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Anti-Ban Throttling Ativo</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
            <span>Regras Configuradas</span>
            <span className="text-zinc-500">{rules.length} ativas</span>
          </div>

          <div className="space-y-2">
            {rules.map(rule => (
              <div
                key={rule.id}
                onClick={() => {
                  setSelectedRule(rule);
                  setSimulatedReply(null);
                  setSimulatedDm(null);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col gap-2 ${
                  selectedRule.id === rule.id
                    ? "bg-zinc-800 border-amber-500/60 shadow-sm"
                    : "bg-zinc-900/70 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white line-clamp-1">{rule.name}</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-700/60 text-zinc-300">
                    {rule.platform}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>{rule.totalTriggered} disparos</span>
                  </span>
                  <span className="text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Ativa</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Rule Configuration */}
        <div className="space-y-4">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              Configuração do Gatilho
            </h3>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Palavras-chave Monitoradas (separadas por vírgula)
              </label>
              <input
                type="text"
                value={selectedRule.keywords.join(", ")}
                onChange={(e) => {
                  const updated = {
                    ...selectedRule,
                    keywords: e.target.value.split(",").map(k => k.trim())
                  };
                  setSelectedRule(updated);
                  setRules(rules.map(r => r.id === updated.id ? updated : r));
                }}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Link de Destino / Afiliado (com UTMs automáticas)
              </label>
              <input
                type="text"
                value={selectedRule.ctaUrl}
                onChange={(e) => {
                  const updated = { ...selectedRule, ctaUrl: e.target.value };
                  setSelectedRule(updated);
                  setRules(rules.map(r => r.id === updated.id ? updated : r));
                }}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-amber-400 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Mensagem Automática Enviada no Direct (DM)
              </label>
              <textarea
                rows={3}
                value={selectedRule.dmMessageTemplate}
                onChange={(e) => {
                  const updated = { ...selectedRule, dmMessageTemplate: e.target.value };
                  setSelectedRule(updated);
                  setRules(rules.map(r => r.id === updated.id ? updated : r));
                }}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg p-3 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Live Simulator */}
        <div className="space-y-4">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-400" />
              Simulador em Tempo Real
            </h3>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">
                Comentário de Teste do Usuário:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testComment}
                  onChange={(e) => setTestComment(e.target.value)}
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleTestSimulator}
                  className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <span>Testar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {simulatedReply && (
              <div className="space-y-3 pt-2">
                <div className="bg-zinc-800/80 border border-zinc-700 rounded-lg p-3 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-mono text-amber-400 font-semibold block">
                    1. Resposta Pública no Post (Rotativa Anti-Spam):
                  </span>
                  <p className="text-zinc-200">{simulatedReply}</p>
                </div>

                {simulatedDm && (
                  <div className="bg-blue-950/40 border border-blue-500/30 rounded-lg p-3 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-mono text-blue-400 font-semibold block">
                      2. Mensagem Enviada na DM Privada:
                    </span>
                    <p className="text-zinc-200">{simulatedDm}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
