/**
 * CommentToDmManager.tsx - Gerenciador Central de Regras Comment-to-DM
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Arquitetura inspirada no ChatbotX / ManyChat nativo em nuvem:
 * - 100% integrado ao Zustand store (usePosterStore) com persistência automática
 * - Gestão completa de regras (Criar, Editar, Duplicar, Pausar, Excluir)
 * - Variações de respostas públicas rotativas para evasão de bloqueio de spam
 * - Templates de Direct Message (DM Privada) com placeholders {{nome}} e {{ctaUrl}}
 * - Simulador em tempo real com gravação de histórico de eventos
 * - Zero extensões de navegador: arquitetura desenhada para Meta Graph API em nuvem
 */

import React, { useState, useMemo } from "react";
import { 
  Bot, 
  MessageSquare, 
  Zap, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Tag, 
  ExternalLink, 
  Play, 
  RotateCcw,
  Sliders,
  History,
  X,
  Instagram,
  Video,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { usePosterStore } from "@/store/usePosterStore";
import { CommentRule, CommentTriggerEvent } from "@/types/poster";
import { toast } from "@/lib/toast/useToast";

export function CommentToDmManager() {
  const { 
    commentRules, 
    triggerEvents, 
    posts, 
    addCommentRule, 
    updateCommentRule, 
    deleteCommentRule, 
    toggleCommentRule, 
    logCommentTrigger 
  } = usePosterStore();

  const [selectedRuleId, setSelectedRuleId] = useState<string>(() => {
    return commentRules[0]?.id || "";
  });

  // Estado do Modal de Nova Regra
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newKeywordInput, setNewKeywordInput] = useState<string>("");
  const [newPublicReplyInput, setNewPublicReplyInput] = useState<string>("");

  // Estado do Formulário de Criação
  const [newRuleForm, setNewRuleForm] = useState<{
    name: string;
    platform: "instagram" | "tiktok";
    targetPostId: string;
    matchMode: "contains" | "exact";
    keywords: string[];
    publicReplyVariants: string[];
    dmMessageTemplate: string;
    ctaUrl: string;
    isActive: boolean;
  }>({
    name: "",
    platform: "instagram",
    targetPostId: "all_posts",
    matchMode: "contains",
    keywords: ["LINK", "QUERO"],
    publicReplyVariants: [
      "Acabei de te enviar no Direct! Dá uma olhada lá 🔥",
      "Te mandei o link com todos os detalhes na sua DM! 🚀",
      "Confere suas mensagens diretas, acabei de despachar! 👀"
    ],
    dmMessageTemplate: "Olá {{nome}}! Aqui está o link oficial que você pediu nos comentários: {{ctaUrl}}",
    ctaUrl: "https://v5autoblog.com/artigo/agentes-autonomos?utm_source=ig_comment_dm&utm_medium=direct_message",
    isActive: true
  });

  // Estado do Simulador
  const [simUsername, setSimUsername] = useState<string>("@dev_growth");
  const [simCommentText, setSimCommentText] = useState<string>("Eu quero esse link agora!");
  const [simResult, setSimResult] = useState<{
    matched: boolean;
    matchedKeyword?: string;
    publicReply?: string;
    dmMessage?: string;
  } | null>(null);

  // Regra atualmente selecionada para edição
  const selectedRule = useMemo(() => {
    return commentRules.find((r) => r.id === selectedRuleId) || commentRules[0] || null;
  }, [commentRules, selectedRuleId]);

  // Telemetria global calculada
  const activeRulesCount = useMemo(() => {
    return commentRules.filter((r) => r.isActive).length;
  }, [commentRules]);

  const totalDispatchesCount = useMemo(() => {
    return commentRules.reduce((acc, r) => acc + (r.totalTriggered || 0), 0);
  }, [commentRules]);

  // Executa teste no simulador
  const handleRunSimulator = () => {
    if (!selectedRule) return;

    const normalizedComment = simCommentText.trim().toUpperCase();
    let matchedKw: string | undefined;

    if (selectedRule.matchMode === "exact") {
      matchedKw = selectedRule.keywords.find((kw) => normalizedComment === kw.toUpperCase());
    } else {
      matchedKw = selectedRule.keywords.find((kw) => normalizedComment.includes(kw.toUpperCase()));
    }

    if (matchedKw) {
      // Sorteia uma das respostas públicas rotativas
      const replies = selectedRule.publicReplyVariants.length > 0 
        ? selectedRule.publicReplyVariants 
        : ["Te mandei no Direct!"];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      // Preenche os placeholders da DM
      const cleanUsername = simUsername.replace("@", "");
      const formattedDm = selectedRule.dmMessageTemplate
        .replace(/{{nome}}/gi, cleanUsername)
        .replace(/{{ctaUrl}}/gi, selectedRule.ctaUrl)
        .replace(/{{postTitle}}/gi, selectedRule.name);

      setSimResult({
        matched: true,
        matchedKeyword: matchedKw,
        publicReply: randomReply,
        dmMessage: formattedDm
      });

      // Grava no histórico de telemetria do Zustand
      logCommentTrigger({
        ruleId: selectedRule.id,
        platform: selectedRule.platform,
        username: simUsername,
        commentId: `mock_cmt_${Date.now()}`,
        commentText: simCommentText,
        matchedKeyword: matchedKw,
        publicReplySent: randomReply,
        dmSent: formattedDm,
        status: "success"
      });

      toast.success(`Gatilho disparado com sucesso pela palavra "${matchedKw}"!`);
    } else {
      setSimResult({
        matched: false
      });
      toast.info("Nenhuma palavra-chave compatível encontrada no comentário.");
    }
  };

  // Criação de Nova Regra
  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleForm.name.trim()) {
      toast.error("Informe um nome para a regra.");
      return;
    }
    if (newRuleForm.keywords.length === 0) {
      toast.error("Adicione pelo menos uma palavra-chave.");
      return;
    }

    addCommentRule({
      name: newRuleForm.name,
      platform: newRuleForm.platform,
      targetPostId: newRuleForm.targetPostId,
      matchMode: newRuleForm.matchMode,
      keywords: newRuleForm.keywords,
      publicReplyVariants: newRuleForm.publicReplyVariants,
      dmMessageTemplate: newRuleForm.dmMessageTemplate,
      ctaUrl: newRuleForm.ctaUrl,
      isActive: newRuleForm.isActive
    });

    setIsModalOpen(false);
    toast.success(`Regra "${newRuleForm.name}" criada com sucesso no Zustand!`);
  };

  // Adiciona palavra-chave na regra em edição
  const handleAddKeywordToSelected = () => {
    if (!selectedRule || !newKeywordInput.trim()) return;
    const clean = newKeywordInput.trim().toUpperCase();
    if (selectedRule.keywords.includes(clean)) {
      toast.info("Palavra-chave já cadastrada nesta regra.");
      return;
    }
    const updated = [...selectedRule.keywords, clean];
    updateCommentRule(selectedRule.id, { keywords: updated });
    setNewKeywordInput("");
    toast.success(`Palavra-chave "${clean}" adicionada!`);
  };

  // Remove palavra-chave
  const handleRemoveKeyword = (kwToRemove: string) => {
    if (!selectedRule) return;
    const updated = selectedRule.keywords.filter((k) => k !== kwToRemove);
    updateCommentRule(selectedRule.id, { keywords: updated });
    toast.info(`Palavra-chave "${kwToRemove}" removida.`);
  };

  // Adiciona variação de resposta pública
  const handleAddPublicReply = () => {
    if (!selectedRule || !newPublicReplyInput.trim()) return;
    const updated = [...selectedRule.publicReplyVariants, newPublicReplyInput.trim()];
    updateCommentRule(selectedRule.id, { publicReplyVariants: updated });
    setNewPublicReplyInput("");
    toast.success("Variação de resposta pública adicionada!");
  };

  // Remove variação de resposta pública
  const handleRemovePublicReply = (indexToRemove: number) => {
    if (!selectedRule) return;
    const updated = selectedRule.publicReplyVariants.filter((_, idx) => idx !== indexToRemove);
    updateCommentRule(selectedRule.id, { publicReplyVariants: updated });
    toast.info("Variação removida.");
  };

  // Duplicar regra existente
  const handleDuplicateRule = (rule: CommentRule) => {
    addCommentRule({
      name: `${rule.name} (Cópia)`,
      platform: rule.platform,
      targetPostId: rule.targetPostId,
      matchMode: rule.matchMode || "contains",
      keywords: [...rule.keywords],
      publicReplyVariants: [...rule.publicReplyVariants],
      dmMessageTemplate: rule.dmMessageTemplate,
      ctaUrl: rule.ctaUrl,
      isActive: false
    });
    toast.success(`Regra duplicada com sucesso!`);
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP BANNER & TELEMETRIA DO COMMENT-TO-DM */}
      <div className="bg-gradient-to-r from-blue-950/40 via-zinc-900 to-zinc-900 p-5 rounded-2xl border border-blue-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Bot className="w-4 h-4 text-blue-400" />
            <span>ChatbotX Core Integration • Capitania #13 Poster</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Comment-to-DM & Lead Hunter</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Etapa 061 (Zustand Integrated)
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-3xl">
            Monitoramento de palavras-chave como <code className="text-amber-400 font-bold">LINK</code> ou <code className="text-amber-400 font-bold">QUERO</code>. Dispara resposta pública variada para evasão de spam e entrega mensagem privada com link rastreado via Meta Graph API oficial.
          </p>
        </div>

        {/* Métricas e Botão de Ação */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-zinc-900/90 border border-zinc-800 px-3.5 py-2 rounded-xl text-xs font-mono">
            <div>
              <span className="text-zinc-500 text-[10px] block">REGRAS ATIVAS</span>
              <span className="text-emerald-400 font-bold">{activeRulesCount} / {commentRules.length}</span>
            </div>
            <div className="w-px h-6 bg-zinc-800" />
            <div>
              <span className="text-zinc-500 text-[10px] block">TOTAL DMS</span>
              <span className="text-blue-400 font-bold">{totalDispatchesCount}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-lg shadow-blue-950/40 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Regra de Gatilho</span>
          </button>
        </div>
      </div>

      {/* 2. GRADE PRINCIPAL: LISTA DE REGRAS, CONFIGURAÇÃO E SIMULADOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUNA ESQUERDA: LISTA DE REGRAS NO ZUSTAND (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              Regras no Zustand Store:
            </span>
            <span className="text-zinc-500 font-mono text-[11px]">{commentRules.length} regras</span>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {commentRules.map((rule) => {
              const isSelected = selectedRule?.id === rule.id;
              return (
                <div
                  key={rule.id}
                  onClick={() => {
                    setSelectedRuleId(rule.id);
                    setSimResult(null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition flex flex-col gap-2.5 relative ${
                    isSelected
                      ? "bg-zinc-900 border-blue-500/70 shadow-md shadow-blue-950/30 ring-1 ring-blue-500/30"
                      : "bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900/90 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white line-clamp-1">{rule.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60 flex items-center gap-1">
                        {rule.platform === "instagram" ? <Instagram className="w-3 h-3 text-pink-400" /> : <Video className="w-3 h-3 text-cyan-400" />}
                        <span>{rule.platform}</span>
                      </span>
                    </div>
                  </div>

                  {/* Tags das Palavras-Chave */}
                  <div className="flex flex-wrap items-center gap-1">
                    {rule.keywords.slice(0, 3).map((kw) => (
                      <span
                        key={kw}
                        className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      >
                        "{kw}"
                      </span>
                    ))}
                    {rule.keywords.length > 3 && (
                      <span className="text-[10px] text-zinc-500 font-mono">
                        +{rule.keywords.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                    <span className="flex items-center gap-1 font-mono text-[10px]">
                      <Zap className="w-3 h-3 text-blue-400" />
                      <span>{rule.totalTriggered} DMs</span>
                    </span>

                    {/* Toggle de Ativação Rápida */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCommentRule(rule.id);
                        toast.info(rule.isActive ? `Regra "${rule.name}" pausada.` : `Regra "${rule.name}" ativada!`);
                      }}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 transition ${
                        rule.isActive
                          ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${rule.isActive ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}`} />
                      <span>{rule.isActive ? "Ativa" : "Pausada"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUNA CENTRAL: CONFIGURAÇÃO DETALHADA DA REGRA (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedRule ? (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-white">Configuração da Regra Ativa</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDuplicateRule(selectedRule)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                    title="Duplicar Regra"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {commentRules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir a regra "${selectedRule.name}"?`)) {
                          deleteCommentRule(selectedRule.id);
                          toast.success("Regra removida.");
                        }
                      }}
                      className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 transition"
                      title="Excluir Regra"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Nome e Post Alvo */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                    Nome Identificador da Automação:
                  </label>
                  <input
                    type="text"
                    value={selectedRule.name}
                    onChange={(e) => updateCommentRule(selectedRule.id, { name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                {/* Palavras-Chave com Tags Interativas */}
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                    Palavras-Chave Monitoradas ({selectedRule.keywords.length}):
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-zinc-950 border border-zinc-800 min-h-[42px]">
                    {selectedRule.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-mono"
                      >
                        <span>{kw}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(kw)}
                          className="hover:text-rose-400 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <div className="flex items-center gap-1 ml-auto">
                      <input
                        type="text"
                        value={newKeywordInput}
                        onChange={(e) => setNewKeywordInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddKeywordToSelected();
                          }
                        }}
                        placeholder="+ Adicionar..."
                        className="w-24 bg-transparent text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddKeywordToSelected}
                        className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 hover:text-white"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Respostas Públicas Rotativas Anti-Spam */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-zinc-400">
                      Respostas Públicas Rotativas ({selectedRule.publicReplyVariants.length}):
                    </label>
                    <span className="text-[10px] text-amber-400 font-mono">Evasão Anti-Spam</span>
                  </div>

                  <div className="space-y-1.5">
                    {selectedRule.publicReplyVariants.map((reply, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-zinc-950 p-2 rounded-lg border border-zinc-800 text-xs text-zinc-300">
                        <span className="text-[10px] font-mono text-zinc-500 shrink-0">#{idx + 1}</span>
                        <span className="flex-1 truncate">{reply}</span>
                        {selectedRule.publicReplyVariants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePublicReply(idx)}
                            className="text-zinc-500 hover:text-rose-400 transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        value={newPublicReplyInput}
                        onChange={(e) => setNewPublicReplyInput(e.target.value)}
                        placeholder="Nova variação de resposta no post..."
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddPublicReply}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200"
                      >
                        + Variação
                      </button>
                    </div>
                  </div>
                </div>

                {/* Template de Mensagem Direta (DM Privada) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-zinc-400">
                      Template de Direct Message (DM Privada):
                    </label>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                      <span>Tags:</span>
                      <code className="text-blue-400">&#123;&#123;nome&#125;&#125;</code>
                      <code className="text-amber-400">&#123;&#123;ctaUrl&#125;&#125;</code>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={selectedRule.dmMessageTemplate}
                    onChange={(e) => updateCommentRule(selectedRule.id, { dmMessageTemplate: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 resize-none font-mono leading-relaxed"
                  />
                </div>

                {/* URL de Destino Rastreada com UTM */}
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                    URL de Destino com UTM Rastreada:
                  </label>
                  <input
                    type="url"
                    value={selectedRule.ctaUrl}
                    onChange={(e) => updateCommentRule(selectedRule.id, { ctaUrl: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-amber-400 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 text-center text-zinc-500 text-xs">
              Selecione uma regra na coluna esquerda para editar.
            </div>
          )}
        </div>

        {/* COLUNA DIREITA: SIMULADOR INTERATIVO EM TEMPO REAL (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Simulador de Disparo</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Meta Graph</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                  Usuário Simulado:
                </label>
                <input
                  type="text"
                  value={simUsername}
                  onChange={(e) => setSimUsername(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                  Comentário no Post:
                </label>
                <textarea
                  rows={2}
                  value={simCommentText}
                  onChange={(e) => setSimCommentText(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none resize-none font-mono"
                />
              </div>

              <button
                type="button"
                onClick={handleRunSimulator}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-md shadow-emerald-950/40 active:scale-95"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Testar Gatilho & Enviar DM</span>
              </button>
            </div>

            {/* Resultado do Teste Simulado */}
            {simResult && (
              <div className="space-y-2 pt-2 border-t border-zinc-800/60 animate-in fade-in duration-200">
                {simResult.matched ? (
                  <>
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs space-y-1">
                      <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                        1. Resposta Pública no Reel:
                      </span>
                      <p className="text-zinc-200 text-[11px]">{simResult.publicReply}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-500/30 text-xs space-y-1">
                      <span className="text-[10px] font-mono uppercase text-blue-400 font-bold block">
                        2. Direct Message (DM Privada):
                      </span>
                      <p className="text-zinc-200 text-[11px] leading-relaxed">{simResult.dmMessage}</p>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Evento registrado em triggerEvents no Zustand!</span>
                    </div>
                  </>
                ) : (
                  <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-[11px] text-rose-300 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>Nenhum gatilho ativado. Nenhuma palavra compatível encontrada.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Histórico Recente de Disparos Gravados no Zustand */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
              <span className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-zinc-400" />
                Histórico de Eventos Recentes:
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">{triggerEvents.length}</span>
            </div>

            {triggerEvents.length > 0 ? (
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {triggerEvents.slice(0, 5).map((evt) => (
                  <div key={evt.id} className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[10px] font-mono space-y-0.5">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="text-blue-300 font-semibold">{evt.username}</span>
                      <span className="text-emerald-400">{evt.matchedKeyword}</span>
                    </div>
                    <p className="text-zinc-500 truncate">"{evt.commentText}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-zinc-500 font-mono">Nenhum evento registrado ainda.</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. MODAL DE NOVA REGRA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Criar Nova Regra de Comentário</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                  Nome da Automação:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Campanha Reels Agentes Autônomos"
                  value={newRuleForm.name}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, name: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                    Plataforma:
                  </label>
                  <select
                    value={newRuleForm.platform}
                    onChange={(e) => setNewRuleForm({ ...newRuleForm, platform: e.target.value as "instagram" | "tiktok" })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="instagram">Instagram Feed & Reels</option>
                    <option value="tiktok">TikTok Vídeos</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                    Modo de Correspondência:
                  </label>
                  <select
                    value={newRuleForm.matchMode}
                    onChange={(e) => setNewRuleForm({ ...newRuleForm, matchMode: e.target.value as "contains" | "exact" })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="contains">Contém Palavra-chave</option>
                    <option value="exact">Palavra-chave Exata</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                  Palavras-Chave (separadas por vírgula):
                </label>
                <input
                  type="text"
                  required
                  value={newRuleForm.keywords.join(", ")}
                  onChange={(e) => setNewRuleForm({
                    ...newRuleForm,
                    keywords: e.target.value.split(",").map(k => k.trim()).filter(Boolean)
                  })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                  URL de Destino (com UTM):
                </label>
                <input
                  type="url"
                  required
                  value={newRuleForm.ctaUrl}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, ctaUrl: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-amber-400 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                  Template da DM Privada:
                </label>
                <textarea
                  rows={2}
                  required
                  value={newRuleForm.dmMessageTemplate}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, dmMessageTemplate: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white font-mono focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-950/40"
                >
                  Salvar Regra no Zustand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
