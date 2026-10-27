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
  AlertCircle,
  BarChart3
} from "lucide-react";
import { DmEngagementMetricsPanel } from "./DmEngagementMetricsPanel";
import { usePosterStore } from "@/store/usePosterStore";
import { CommentRule, CommentTriggerEvent } from "@/types/poster";
import { toast } from "@/lib/toast/useToast";
import { matchCommentTrigger, TriggerMatchMode, TriggerMatchResult } from "@/lib/comments/triggerMatcher";
import { 
  validateAntiSpamDiversity, 
  getNextPublicReply, 
  formatPublicReply, 
  NICHE_VARIANT_PACKS, 
  ContentNiche,
  AntiSpamHealthCheck 
} from "@/lib/comments/publicReplyRotator";
import { 
  compileDmMessage, 
  validateDmTemplate, 
  SUPPORTED_DM_PLACEHOLDERS, 
  DM_PRESET_TEMPLATES, 
  META_DM_MAX_CHARS,
  DmPresetTemplate,
  DmTemplateValidation
} from "@/lib/comments/dmTemplateBuilder";
import { 
  sendMetaPrivateReply, 
  validateCommentEligibilityForPrivateReply, 
  MetaPrivateReplyResponse 
} from "@/lib/comments/metaPrivateReplyClient";
import { 
  simulateCommentInteraction, 
  QUICK_TEST_SCENARIOS, 
  QuickTestScenario,
  SimulationExecutionResult 
} from "@/lib/comments/commentSimulationEngine";
import { 
  globalAntiBanThrottler, 
  ThrottlerMetrics, 
  ThrottledTask 
} from "@/lib/comments/antiBanThrottler";
import { 
  generateTrackedDmUrl, 
  validateTrackedDmUrl, 
  parseTrackedDmUrl 
} from "@/lib/comments/trackedLinkGenerator";

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

  // Seletor de Seção: Regras & Simulador vs. Métricas & Analytics
  const [activeSection, setActiveSection] = useState<"rules" | "analytics">("rules");

  // Estado do Modal de Nova Regra
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newKeywordInput, setNewKeywordInput] = useState<string>("");
  const [newPublicReplyInput, setNewPublicReplyInput] = useState<string>("");

  // Estado do Formulário de Criação
  const [newRuleForm, setNewRuleForm] = useState<{
    name: string;
    platform: "instagram" | "tiktok";
    targetPostId: string;
    matchMode: TriggerMatchMode;
    keywords: string[];
    publicReplyVariants: string[];
    dmMessageTemplate: string;
    ctaUrl: string;
    couponCode?: string;
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
    couponCode: "PROMO10",
    isActive: true
  });

  // Estado do Simulador e Fila Anti-Ban
  const [simUsername, setSimUsername] = useState<string>("@dev_growth");
  const [simCommentText, setSimCommentText] = useState<string>("Eu quero esse link agora!");
  const [simActiveTab, setSimActiveTab] = useState<"visual" | "telemetry">("visual");
  const [simExecutionResult, setSimExecutionResult] = useState<SimulationExecutionResult | null>(null);
  const [throttlerMetrics, setThrottlerMetrics] = useState<ThrottlerMetrics>(() => globalAntiBanThrottler.getMetrics());
  const [isBurstSimulating, setIsBurstSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<{
    matched: boolean;
    matchedKeyword?: string;
    matchedSnippet?: string;
    confidence?: number;
    matchModeUsed?: string;
    normalizedComment?: string;
    publicReply?: string;
    publicReplyIndex?: number;
    dmMessage?: string;
    couponUsed?: string;
    metaMessageId?: string;
    metaCommentId?: string;
    bypass24hVerified?: boolean;
    latencyMs?: number;
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

  // Auditoria de Saúde Anti-Spam das respostas públicas da regra selecionada
  const antiSpamHealth = useMemo<AntiSpamHealthCheck | null>(() => {
    if (!selectedRule) return null;
    return validateAntiSpamDiversity(selectedRule.publicReplyVariants);
  }, [selectedRule]);

  // Validação de Conformidade do Template de Direct Message (DM)
  const dmValidation = useMemo<DmTemplateValidation | null>(() => {
    if (!selectedRule) return null;
    return validateDmTemplate(selectedRule.dmMessageTemplate);
  }, [selectedRule]);

  // Validação e Análise de Conformidade do Link Rastreado com UTM Dedicado
  const trackedUrlValidation = useMemo(() => {
    if (!selectedRule?.ctaUrl) return null;
    return validateTrackedDmUrl(selectedRule.ctaUrl);
  }, [selectedRule?.ctaUrl]);

  const parsedTrackedUrl = useMemo(() => {
    if (!selectedRule?.ctaUrl) return null;
    return parseTrackedDmUrl(selectedRule.ctaUrl);
  }, [selectedRule?.ctaUrl]);

  // Injeta parâmetros UTM oficiais na URL da regra selecionada
  const handleInjectOfficialUtm = () => {
    if (!selectedRule) return;
    const result = generateTrackedDmUrl({
      baseUrl: selectedRule.ctaUrl || "https://v5autoblog.com/artigo/agentes-autonomos",
      platform: selectedRule.platform,
      campaign: selectedRule.name,
      matchedKeyword: selectedRule.keywords[0] || "link",
      couponCode: selectedRule.couponCode
    });
    updateCommentRule(selectedRule.id, { ctaUrl: result.finalUrl });
    toast.success("Parâmetros UTM oficiais injetados na URL de destino!");
  };

  // Injeta parâmetros UTM oficiais no formulário de nova regra
  const handleInjectOfficialUtmNewRule = () => {
    const result = generateTrackedDmUrl({
      baseUrl: newRuleForm.ctaUrl || "https://v5autoblog.com/artigo/agentes-autonomos",
      platform: newRuleForm.platform,
      campaign: newRuleForm.name || "nova_campanha",
      matchedKeyword: newRuleForm.keywords[0] || "link",
      couponCode: newRuleForm.couponCode
    });
    setNewRuleForm({ ...newRuleForm, ctaUrl: result.finalUrl });
    toast.success("Parâmetros UTM oficiais injetados no formulário!");
  };

  // Aplica pacote de 5 variações pré-construídas por nicho
  const handleApplyNichePack = (niche: ContentNiche) => {
    if (!selectedRule) return;
    const pack = NICHE_VARIANT_PACKS[niche];
    if (!pack) return;
    updateCommentRule(selectedRule.id, {
      publicReplyVariants: [...pack.variants]
    });
    toast.success(`Pacote anti-spam "${pack.title}" aplicado com 5 variações!`);
  };

  // Aplica um dos templates de DM pré-configurados de alta conversão
  const handleApplyDmPreset = (preset: DmPresetTemplate) => {
    if (!selectedRule) return;
    updateCommentRule(selectedRule.id, {
      dmMessageTemplate: preset.template,
      couponCode: preset.defaultCoupon || selectedRule.couponCode || "PROMO10"
    });
    toast.success(`Template de DM "${preset.name}" aplicado com sucesso!`);
  };

  // Injeção de Placeholder de DM com 1 clique
  const handleInsertPlaceholder = (token: string) => {
    if (!selectedRule) return;
    const current = selectedRule.dmMessageTemplate;
    updateCommentRule(selectedRule.id, {
      dmMessageTemplate: `${current} ${token}`
    });
    toast.info(`Token ${token} inserido no template.`);
  };

  // Executa teste no simulador com o motor cognitivo ChatbotX, Rotação Anti-Spam e Bypass 24h Meta Graph
  const handleRunSimulator = async () => {
    if (!selectedRule) return;

    // Checagem de Proteção da Fila Anti-Ban
    const canDispatch = globalAntiBanThrottler.canDispatchNow();
    const jitter = globalAntiBanThrottler.calculateJitter();

    const res = await simulateCommentInteraction({
      commentText: simCommentText,
      username: simUsername,
      rule: selectedRule,
      platform: selectedRule.platform,
      simulatedLatencyMs: jitter
    });

    setSimExecutionResult(res);

    if (res.isTriggerMatched) {
      if (canDispatch) {
        globalAntiBanThrottler.recordSuccessfulDispatch();
      } else {
        // Enfileira com throttling seguro
        globalAntiBanThrottler.enqueue({
          ruleId: selectedRule.id,
          commentId: res.metaCommentId || `cmt_${Date.now()}`,
          username: simUsername,
          commentText: simCommentText,
          dmMessage: res.dmMessageText || "",
          publicReply: res.publicReplyText || "",
          priority: "high"
        });
      }

      setThrottlerMetrics(globalAntiBanThrottler.getMetrics());

      setSimResult({
        matched: true,
        matchedKeyword: res.matchResult.matchedKeyword,
        matchedSnippet: res.matchResult.matchedSnippet,
        confidence: res.matchResult.confidence,
        matchModeUsed: res.matchResult.matchModeUsed,
        normalizedComment: res.matchResult.normalizedComment,
        publicReply: res.publicReplyText,
        publicReplyIndex: res.publicReplyIndex,
        dmMessage: res.dmMessageText,
        couponUsed: res.couponApplied,
        metaMessageId: res.metaMessageId,
        metaCommentId: res.metaCommentId,
        bypass24hVerified: res.bypass24hVerified,
        latencyMs: res.latencyMs
      });

      // Grava no histórico de telemetria do Zustand
      logCommentTrigger({
        ruleId: selectedRule.id,
        platform: selectedRule.platform,
        username: simUsername,
        commentId: res.metaCommentId || `mock_${Date.now()}`,
        commentText: simCommentText,
        matchedKeyword: res.matchResult.matchedKeyword || "TRIGGER",
        publicReplySent: res.publicReplyText || "",
        dmSent: res.dmMessageText || "",
        couponUsed: res.couponApplied,
        status: canDispatch ? (res.success ? "success" : "failed") : "throttled"
      });

      if (canDispatch) {
        toast.success(`Gatilho ativado (${res.matchResult.matchModeUsed.toUpperCase()}): "${res.matchResult.matchedKeyword}"! Jitter Anti-Ban: ${(jitter / 1000).toFixed(1)}s.`);
      } else {
        toast.warning(`Proteção Anti-Ban: limite atingido! DM colocada na fila de amortecimento com jitter estocástico.`);
      }
    } else {
      setSimResult({
        matched: false,
        normalizedComment: res.matchResult.normalizedComment,
        latencyMs: res.latencyMs
      });
      toast.info("Nenhuma palavra-chave ou sinônimo compatível encontrado no comentário.");
    }
  };

  // Simula Avalanche de 5 Comentários Simultâneos para provar a proteção da fila anti-ban
  const handleSimulateBurst = async () => {
    if (!selectedRule || isBurstSimulating) return;
    setIsBurstSimulating(true);

    toast.info("Simulando avalanche de 5 comentários simultâneos...");

    const burstUsers = [
      { user: "@pedro_viral", text: "Eu quero o link agora!" },
      { user: "@mariana_mkt", text: "Tem cupom de desconto?" },
      { user: "@lucas_coder", text: "Manda o link no direct pfv" },
      { user: "@gabriela_vip", text: "QUERO muito esse acesso!" },
      { user: "@thiago_growth", text: "Manda esse linck por favor!" }
    ];

    for (let i = 0; i < burstUsers.length; i++) {
      const b = burstUsers[i];
      globalAntiBanThrottler.enqueue({
        ruleId: selectedRule.id,
        commentId: `burst_${Date.now()}_${i}`,
        username: b.user,
        commentText: b.text,
        dmMessage: selectedRule.dmMessageTemplate,
        publicReply: "Enviado no direct!",
        priority: i === 0 ? "high" : "normal"
      });
      globalAntiBanThrottler.recordSuccessfulDispatch();
    }

    setThrottlerMetrics(globalAntiBanThrottler.getMetrics());
    setIsBurstSimulating(false);
    toast.success("Avalanche amortecida com sucesso! 5 DMs enfileiradas com jitter seguro (2s a 5s).");
  };

  // Carrega e executa imediatamente um cenário de teste rápido (1 Clique)
  const handleApplyQuickScenario = async (scenario: QuickTestScenario) => {
    setSimUsername(scenario.username);
    setSimCommentText(scenario.commentText);
    toast.info(`Cenário "${scenario.title}" selecionado!`);

    if (selectedRule) {
      const res = await simulateCommentInteraction({
        commentText: scenario.commentText,
        username: scenario.username,
        rule: selectedRule,
        platform: selectedRule.platform
      });

      setSimExecutionResult(res);

      if (res.isTriggerMatched) {
        setSimResult({
          matched: true,
          matchedKeyword: res.matchResult.matchedKeyword,
          matchedSnippet: res.matchResult.matchedSnippet,
          confidence: res.matchResult.confidence,
          matchModeUsed: res.matchResult.matchModeUsed,
          normalizedComment: res.matchResult.normalizedComment,
          publicReply: res.publicReplyText,
          publicReplyIndex: res.publicReplyIndex,
          dmMessage: res.dmMessageText,
          couponUsed: res.couponApplied,
          metaMessageId: res.metaMessageId,
          metaCommentId: res.metaCommentId,
          bypass24hVerified: res.bypass24hVerified,
          latencyMs: res.latencyMs
        });

        logCommentTrigger({
          ruleId: selectedRule.id,
          platform: selectedRule.platform,
          username: scenario.username,
          commentId: res.metaCommentId || `mock_${Date.now()}`,
          commentText: scenario.commentText,
          matchedKeyword: res.matchResult.matchedKeyword || "TRIGGER",
          publicReplySent: res.publicReplyText || "",
          dmSent: res.dmMessageText || "",
          couponUsed: res.couponApplied,
          status: res.success ? "success" : "failed"
        });
        toast.success(`Cenário "${scenario.title}" disparado com sucesso!`);
      } else {
        setSimResult({
          matched: false,
          normalizedComment: res.matchResult.normalizedComment,
          latencyMs: res.latencyMs
        });
        toast.info(`Nenhum gatilho ativado para o cenário "${scenario.title}".`);
      }
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
      couponCode: newRuleForm.couponCode,
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
      couponCode: rule.couponCode,
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
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Etapa 069 (Métricas de Engajamento & Conversão de DM)
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

      {/* 2. BARRA DE NAVEGAÇÃO DA SEÇÃO (REGRAS & SIMULADOR VS ANALYTICS) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSection("rules")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeSection === "rules"
                ? "bg-blue-600 text-white shadow-md shadow-blue-950/40"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Regras & Simulador Onicanal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("analytics")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeSection === "analytics"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Painel de Métricas & Conversão (Analytics)</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Meta Graph & TikTok APIs Homologadas</span>
        </div>
      </div>

      {/* 3. CONTEÚDO CONDICIONAL DA SEÇÃO */}
      {activeSection === "analytics" ? (
        <DmEngagementMetricsPanel />
      ) : (
        /* GRADE PRINCIPAL: LISTA DE REGRAS, CONFIGURAÇÃO E SIMULADOR */
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
                          const remaining = commentRules.filter((r) => r.id !== selectedRule.id);
                          deleteCommentRule(selectedRule.id);
                          setSelectedRuleId(remaining[0]?.id || "");
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

              {/* Nome e Modo de Correspondência */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                      Modo de Match (ChatbotX):
                    </label>
                    <select
                      value={selectedRule.matchMode || "contains"}
                      onChange={(e) => updateCommentRule(selectedRule.id, { matchMode: e.target.value as TriggerMatchMode })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-blue-300 focus:outline-none focus:border-blue-500 font-mono"
                    >
                      <option value="contains">Contém (\b Fronteira Anti-Falsos)</option>
                      <option value="exact">Exato (Somente a Palavra)</option>
                      <option value="fuzzy">Fuzzy (Tolerância a Typos/Levenshtein)</option>
                      <option value="regex">Expressão Regular (Regex)</option>
                    </select>
                  </div>
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
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-mono text-zinc-400">
                        Respostas Públicas Rotativas ({selectedRule.publicReplyVariants.length}):
                      </label>
                      {antiSpamHealth && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                          antiSpamHealth.status === "excellent"
                            ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
                            : antiSpamHealth.status === "healthy"
                            ? "bg-blue-950/40 text-blue-300 border-blue-500/30"
                            : antiSpamHealth.status === "warning"
                            ? "bg-amber-950/40 text-amber-300 border-amber-500/30"
                            : "bg-rose-950/40 text-rose-300 border-rose-500/30"
                        }`}>
                          <ShieldCheck className="w-3 h-3" />
                          <span>Saúde Anti-Spam: {antiSpamHealth.score}%</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">Meta/TikTok Evasion</span>
                  </div>

                  {/* Sugestor Rápido de Pacotes de Variações por Nicho */}
                  <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                      <span className="flex items-center gap-1 text-zinc-300">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        Sugerir Pacote com 5 Variações Anti-Spam (1 Clique):
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleApplyNichePack("content_blog")}
                        className="px-2 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 transition text-left truncate"
                        title="Blog e Artigos Técnicos"
                      >
                        📝 Auto Blog
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyNichePack("ecommerce_finders")}
                        className="px-2 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 transition text-left truncate"
                        title="Achadinhos e Afiliados"
                      >
                        🛒 Achadinhos
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyNichePack("vip_community")}
                        className="px-2 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 transition text-left truncate"
                        title="Grupos VIP WhatsApp/Telegram"
                      >
                        🎟️ Grupos VIP
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyNichePack("course_lead")}
                        className="px-2 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 transition text-left truncate"
                        title="Playbooks, Guias e Cursos"
                      >
                        📚 Cursos & Leads
                      </button>
                    </div>
                  </div>

                  {/* Alertas de Diversidade Anti-Spam se houver */}
                  {antiSpamHealth && antiSpamHealth.warnings.length > 0 && (
                    <div className="p-2 rounded-lg bg-amber-950/25 border border-amber-500/20 text-[10px] text-amber-300 space-y-0.5">
                      {antiSpamHealth.warnings.map((w, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <AlertCircle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Lista de Variações Cadastradas */}
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
                        placeholder="Nova variação de resposta no post (ex: Te mandei no direct! 👀)..."
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

                {/* Construtor de Template de Direct Message (DM Privada) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-mono text-zinc-400">
                        Template de Direct Message (DM Privada):
                      </label>
                      {dmValidation && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          dmValidation.charCount > META_DM_MAX_CHARS
                            ? "bg-rose-950/40 text-rose-300 border-rose-500/30"
                            : dmValidation.hasCtaUrl
                            ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
                            : "bg-amber-950/40 text-amber-300 border-amber-500/30"
                        }`}>
                          {dmValidation.charCount} / {META_DM_MAX_CHARS}c
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">Instagram Direct</span>
                  </div>

                  {/* Chips Clicáveis de Placeholders Dinâmicos */}
                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 font-mono mr-1">Inserir:</span>
                    {SUPPORTED_DM_PLACEHOLDERS.map((ph) => (
                      <button
                        key={ph.token}
                        type="button"
                        onClick={() => handleInsertPlaceholder(ph.token)}
                        className="px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-[10px] font-mono text-blue-300 hover:text-white transition flex items-center gap-1"
                        title={ph.description}
                      >
                        <code>{ph.token}</code>
                        <span className="text-[9px] text-zinc-500">({ph.label})</span>
                      </button>
                    ))}
                  </div>

                  {/* Sugestões de Templates de DM em 1 Clique */}
                  <div className="p-2.5 rounded-xl bg-zinc-950/40 border border-zinc-800/80 space-y-1">
                    <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Templates Prontos de Alta Conversão (1 Clique):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {DM_PRESET_TEMPLATES.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleApplyDmPreset(preset)}
                          className="px-2 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 transition text-left truncate"
                          title={preset.description}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Alertas do Validador de DM */}
                  {dmValidation && dmValidation.warnings.length > 0 && (
                    <div className="p-2 rounded-lg bg-amber-950/25 border border-amber-500/20 text-[10px] text-amber-300 space-y-0.5">
                      {dmValidation.warnings.map((w, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <AlertCircle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Campo Textarea do Template */}
                  <textarea
                    rows={4}
                    value={selectedRule.dmMessageTemplate}
                    onChange={(e) => updateCommentRule(selectedRule.id, { dmMessageTemplate: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 resize-none font-mono leading-relaxed"
                    placeholder="Digite o template da mensagem direta..."
                  />
                </div>

                {/* Grid: URL de Destino e Cupom de Desconto */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-8">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-mono text-zinc-400 block">
                        URL de Destino com UTM (Placeholder &#123;&#123;ctaUrl&#125;&#125;):
                      </label>
                      <button
                        type="button"
                        onClick={handleInjectOfficialUtm}
                        className="text-[10px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
                      >
                        <Sparkles className="w-3 h-3 text-blue-400" />
                        Injetar UTM Oficial
                      </button>
                    </div>
                    <input
                      type="url"
                      value={selectedRule.ctaUrl}
                      onChange={(e) => updateCommentRule(selectedRule.id, { ctaUrl: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-amber-400 focus:outline-none focus:border-blue-500 font-mono"
                    />

                    {/* Badge de Validação de UTM */}
                    {trackedUrlValidation && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] font-mono">
                        {trackedUrlValidation.isValid ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            UTM Válida: {parsedTrackedUrl?.utmSource || "ig_comment_dm"} / {parsedTrackedUrl?.utmMedium || "direct_message"}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300">
                            <AlertCircle className="w-3 h-3 text-amber-400" />
                            {trackedUrlValidation.warnings[0] || "URL sem parâmetros UTM oficiais recomendados"}
                          </span>
                        )}
                        {parsedTrackedUrl?.coupon && (
                          <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300">
                            Cupom na URL: {parsedTrackedUrl.coupon}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-4">
                    <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                      Cupom (Placeholder &#123;&#123;cupom&#125;&#125;):
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: PROMO10"
                      value={selectedRule.couponCode || ""}
                      onChange={(e) => updateCommentRule(selectedRule.id, { couponCode: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-emerald-400 focus:outline-none focus:border-blue-500 font-mono uppercase"
                    />
                  </div>
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
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-3.5 shadow-xl">
            {/* Header com Seletor de Abas */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Play className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Simulador Onicanal</span>
              </div>
              <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setSimActiveTab("visual")}
                  className={`px-2 py-0.5 rounded ${
                    simActiveTab === "visual"
                      ? "bg-blue-600 text-white font-bold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Visual
                </button>
                <button
                  type="button"
                  onClick={() => setSimActiveTab("telemetry")}
                  className={`px-2 py-0.5 rounded ${
                    simActiveTab === "telemetry"
                      ? "bg-blue-600 text-white font-bold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Pipeline
                </button>
              </div>
            </div>

            {/* Fila Anti-Ban & Rate Limiting (Meta Graph Protection) */}
            <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1.5 text-[10px] font-mono">
              <div className="flex items-center justify-between text-zinc-300">
                <span className="flex items-center gap-1 font-bold text-amber-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  Fila Anti-Ban (30 DMs/min):
                </span>
                <span className={`px-1.5 py-0.2 rounded border font-bold ${
                  throttlerMetrics.safetyStatus === "optimal"
                    ? "text-emerald-400 bg-emerald-950/40 border-emerald-500/30"
                    : throttlerMetrics.safetyStatus === "moderate"
                    ? "text-blue-400 bg-blue-950/40 border-blue-500/30"
                    : "text-rose-400 bg-rose-950/40 border-rose-500/30"
                }`}>
                  {throttlerMetrics.safetyStatus.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-400 text-[9px]">
                <span>Taxa da Janela (60s):</span>
                <span className="font-bold text-white">{throttlerMetrics.dmsInLastMinute} / 30 DMs</span>
              </div>

              {/* Barra de Consumo da Janela */}
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    throttlerMetrics.capacityUtilizationPercent > 80
                      ? "bg-rose-500"
                      : throttlerMetrics.capacityUtilizationPercent > 50
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, throttlerMetrics.capacityUtilizationPercent)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[9px] text-zinc-500 pt-0.5">
                <span>Jitter: 2s a 5s estocástico</span>
                <button
                  type="button"
                  onClick={handleSimulateBurst}
                  disabled={isBurstSimulating}
                  className="text-blue-400 hover:text-blue-300 underline font-semibold disabled:opacity-50"
                  title="Simula 5 comentários em avalanche para testar o amortecimento"
                >
                  {isBurstSimulating ? "Amortecendo..." : "⚡ Simular Avalanche (5 DMs)"}
                </button>
              </div>
            </div>

            {/* Cenários Rápidos com 1 Clique */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 block">
                Cenários Rápidos (1 Clique):
              </span>
              <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
                {QUICK_TEST_SCENARIOS.slice(0, 4).map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => handleApplyQuickScenario(sc)}
                    className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-left truncate transition flex items-center gap-1"
                    title={sc.description}
                  >
                    <span>{sc.category === "hot_lead" ? "🔥" : sc.category === "typo_fuzzy" ? "✏️" : sc.category === "coupon_request" ? "💸" : "🛡️"}</span>
                    <span className="truncate">{sc.title.split("(")[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form de Inputs do Comentário */}
            <div className="space-y-2.5 pt-1">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 block mb-1">
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
                <label className="text-[10px] font-mono text-zinc-400 block mb-1">
                  Comentário no Post:
                </label>
                <textarea
                  rows={2}
                  value={simCommentText}
                  onChange={(e) => setSimCommentText(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none resize-none font-mono"
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

            {/* Resultado do Teste Simulado com Abas */}
            {simResult && (
              <div className="space-y-2 pt-2 border-t border-zinc-800/60 animate-in fade-in duration-200">
                {simResult.matched ? (
                  simActiveTab === "visual" ? (
                    /* ABA 1: VISUAL REALISTA ESTILO INSTAGRAM POST + DIRECT CHAT */
                    <div className="space-y-3">
                      {/* 1. Preview da Conversa Pública no Reel */}
                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-300 font-bold shrink-0">
                            {simUsername.replace("@", "").charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-blue-300 font-mono mr-1.5">
                              {simUsername}
                            </span>
                            <span className="text-[11px] text-zinc-200">{simCommentText}</span>
                          </div>
                        </div>

                        {/* Balão da Resposta Oficial com Badge Verificado */}
                        <div className="flex items-start gap-2 pl-4 border-l-2 border-blue-500/40 ml-2">
                          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[9px] text-white font-bold shrink-0">
                            V5
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-0.5">
                              <span className="text-[10px] font-bold text-white font-mono">
                                v5_apollo
                              </span>
                              <CheckCircle2 className="w-3 h-3 text-blue-400 fill-blue-400/20" />
                              <span className="text-[8px] font-mono text-zinc-500">Autor</span>
                            </div>
                            <p className="text-[11px] text-zinc-300 leading-snug">
                              {simResult.publicReply}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 2. Preview do Chat Privado do Instagram Direct */}
                      <div className="p-3 rounded-xl bg-gradient-to-b from-zinc-950 to-blue-950/20 border border-blue-500/30 space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1.5 text-[10px] font-mono text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-white font-semibold">Instagram Direct</span>
                          </div>
                          <span className="text-amber-400">Bypass 24h Ativo</span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-zinc-200 text-[11px] leading-relaxed whitespace-pre-line space-y-1">
                          <p>{simResult.dmMessage}</p>
                          {simResult.couponUsed && (
                            <div className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                              Cupom Ativado: {simResult.couponUsed}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 pt-0.5">
                          <span>Entregue via Meta Graph</span>
                          <span>MID: {simResult.metaMessageId?.substring(0, 14)}...</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ABA 2: PIPELINE & TELEMETRIA DE AUDITORIA TÉCNICA */
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono bg-emerald-950/40 border border-emerald-500/30 p-2 rounded-lg text-emerald-300">
                        <span>Match: <strong className="text-white">{simResult.matchModeUsed?.toUpperCase()}</strong></span>
                        <span>Confiança: <strong>{Math.round((simResult.confidence || 1) * 100)}%</strong></span>
                        <span>Latência: <strong>{simResult.latencyMs || 120}ms</strong></span>
                      </div>

                      {simExecutionResult?.executionSteps && (
                        <div className="space-y-1 p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] font-mono">
                          <span className="text-zinc-500 block mb-0.5 font-bold">Etapas de Execução:</span>
                          {simExecutionResult.executionSteps.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-zinc-300">
                              <span className="text-emerald-400 font-bold shrink-0">✓</span>
                              <div className="min-w-0">
                                <strong className="text-white mr-1">{step.step}:</strong>
                                <span className="text-zinc-400">{step.details}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="p-2 rounded-lg bg-blue-950/30 border border-blue-500/30 text-[10px] font-mono space-y-0.5">
                        <div className="text-blue-300 font-bold flex items-center justify-between">
                          <span>Comment ID Ancorado:</span>
                          <span className="text-white">{simResult.metaCommentId}</span>
                        </div>
                        <div className="text-zinc-400 truncate text-[9px]">
                          Message ID: {simResult.metaMessageId}
                        </div>
                      </div>

                      {/* Auditoria de UTM Dedicado na Telemetria */}
                      {simExecutionResult?.trackedUrl && (
                        <div className="p-2 rounded-lg bg-purple-950/30 border border-purple-500/30 text-[10px] font-mono space-y-1">
                          <span className="text-purple-300 font-bold block">Link Rastreado com UTM:</span>
                          <div className="text-[9px] text-zinc-300 break-all bg-black/40 p-1.5 rounded border border-purple-900/40">
                            {simExecutionResult.trackedUrl.finalUrl}
                          </div>
                          <div className="flex flex-wrap gap-1 text-[8px] text-purple-200">
                            <span className="bg-purple-900/50 px-1 rounded">src: {simExecutionResult.trackedUrl.utmSource}</span>
                            <span className="bg-purple-900/50 px-1 rounded">med: {simExecutionResult.trackedUrl.utmMedium}</span>
                            <span className="bg-purple-900/50 px-1 rounded">camp: {simExecutionResult.trackedUrl.utmCampaign}</span>
                            {simExecutionResult.trackedUrl.couponParam && (
                              <span className="bg-emerald-900/60 text-emerald-300 px-1 rounded">cupom: {simExecutionResult.trackedUrl.couponParam}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-[11px] text-rose-300 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>Nenhum gatilho ativado para este comentário.</span>
                    </div>
                    {simResult.normalizedComment && (
                      <p className="text-[10px] text-zinc-400 font-mono">
                        Texto normalizado: &quot;{simResult.normalizedComment}&quot;
                      </p>
                    )}
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
      )}

      {/* 4. MODAL DE NOVA REGRA */}
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
                    Modo de Correspondência (ChatbotX):
                  </label>
                  <select
                    value={newRuleForm.matchMode}
                    onChange={(e) => setNewRuleForm({ ...newRuleForm, matchMode: e.target.value as TriggerMatchMode })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="contains">Contém (\b Fronteira Anti-Falsos)</option>
                    <option value="exact">Palavra-chave Exata</option>
                    <option value="fuzzy">Fuzzy (Tolerância a Typos/Levenshtein)</option>
                    <option value="regex">Expressão Regular (Regex)</option>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-zinc-400 block">
                      URL de Destino (com UTM):
                    </label>
                    <button
                      type="button"
                      onClick={handleInjectOfficialUtmNewRule}
                      className="text-[10px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-blue-400" />
                      Injetar UTM Oficial
                    </button>
                  </div>
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
                    Cupom de Desconto (opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: PROMO10"
                    value={newRuleForm.couponCode || ""}
                    onChange={(e) => setNewRuleForm({ ...newRuleForm, couponCode: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-emerald-400 font-mono uppercase focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                  Template da DM Privada (Tags: &#123;&#123;nome&#125;&#125;, &#123;&#123;ctaUrl&#125;&#125;, &#123;&#123;cupom&#125;&#125;):
                </label>
                <textarea
                  rows={3}
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
