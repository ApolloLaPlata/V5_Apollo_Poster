/**
 * OfferGroupDispatcher.tsx - Despachador de Ofertas & Grupos VIP (Finders Hub)
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Mapeamento e Transmissão Oficial Onicanal das 5 Principais Lojas de Afiliados:
 * - Shopee Brasil (#EE4D2D)
 * - Mercado Livre (#FFE600)
 * - Amazon Brasil (#FF9900)
 * - AliExpress (#FF4747)
 * - Magazine Luiza / Magalu (#0086FF)
 *
 * 100% Integrado ao Zustand Store (usePosterStore) e Hub V5 Finders
 */

"use client";

import React, { useState, useMemo } from "react";
import { 
  Send, 
  Tag, 
  ShoppingCart, 
  Percent, 
  CheckCircle2, 
  ShieldCheck, 
  Flame, 
  Plus, 
  RefreshCw, 
  Trash2, 
  ExternalLink,
  MessageCircle,
  Clock,
  Sparkles,
  Filter,
  DollarSign,
  X,
  Copy,
  Eye,
  Users,
  Link2,
  Zap,
  Calendar,
  CheckSquare,
  Square,
  Layers
} from "lucide-react";
import { usePosterStore } from "@/store/usePosterStore";
import { GroupBroadcastDeal } from "@/types/poster";
import { 
  SUPPORTED_STORES, 
  SupportedStore, 
  detectStoreFromUrl, 
  calculateSavings, 
  validateDealData, 
  SAMPLE_FINDERS_DEALS 
} from "@/lib/finders/storeConnector";
import { 
  calculateFullSavings, 
  getDealUrgency, 
  FullSavingsResult 
} from "@/lib/finders/discountCalculator";
import { 
  DEFAULT_BROADCAST_CHANNELS, 
  BroadcastChannel, 
  calculateAudienceReach, 
  groupChannelsByPlatform, 
  validateChannelSelection 
} from "@/lib/finders/channelManager";
import {
  generateDualPlatformLinks,
  shortenAffiliateLink,
  DEFAULT_SHORTENER_DOMAIN,
  PlatformShortLink
} from "@/lib/finders/affiliateLinkShortener";
import {
  calculateBatchScheduleSlots,
  getBatchSelectionSummary,
  filterEligibleDealsForDispatch,
  BatchScheduleConfig,
  ScheduledDealSlot,
  BatchDispatchProgress
} from "@/lib/finders/batchDispatcher";
import { MessagePreviewSimulator } from "@/components/poster/MessagePreviewSimulator";
import { toast } from "@/lib/toast/useToast";

export function OfferGroupDispatcher() {
  const { 
    deals, 
    addDeal, 
    deleteDeal, 
    dispatchDeal, 
    updateDeal, 
    dispatchBatchDeals, 
    importFindersDeals 
  } = usePosterStore();

  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>("all");
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [previewDeal, setPreviewDeal] = useState<GroupBroadcastDeal | null>(null);
  const [previewChannel, setPreviewChannel] = useState<"whatsapp" | "telegram">("whatsapp");

  // Estados para Operações em Lote (Etapa 078)
  const [selectedDealIds, setSelectedDealIds] = useState<string[]>([]);
  const [isBatchScheduleModalOpen, setIsBatchScheduleModalOpen] = useState<boolean>(false);
  const [batchScheduleConfig, setBatchScheduleConfig] = useState<BatchScheduleConfig>({
    startTime: "12:00",
    intervalMinutes: 30
  });
  const [batchProgress, setBatchProgress] = useState<BatchDispatchProgress | null>(null);

  // Estado do Formulário de Criação de Oferta
  const [newDealForm, setNewDealForm] = useState<{
    productName: string;
    store: SupportedStore;
    originalPrice: string;
    promoPrice: string;
    couponCode: string;
    affiliateUrl: string;
    targetChannels: Array<"whatsapp" | "telegram">;
    targetChannelIds: string[];
    scheduledTime: string;
  }>({
    productName: "",
    store: "Shopee",
    originalPrice: "",
    promoPrice: "",
    couponCode: "",
    affiliateUrl: "",
    targetChannels: ["whatsapp", "telegram"],
    targetChannelIds: DEFAULT_BROADCAST_CHANNELS.map((c) => c.id),
    scheduledTime: "12:00"
  });

  // Cálculo reativo de economia em tempo real no formulário
  const formSavings = useMemo(() => {
    const orig = parseFloat(newDealForm.originalPrice.replace(",", ".")) || 0;
    const promo = parseFloat(newDealForm.promoPrice.replace(",", ".")) || 0;
    return calculateSavings(orig, promo);
  }, [newDealForm.originalPrice, newDealForm.promoPrice]);

  // Cálculo avançado de economia e urgência psicológica
  const fullSavings = useMemo(() => {
    const orig = parseFloat(newDealForm.originalPrice.replace(",", ".")) || 0;
    const promo = parseFloat(newDealForm.promoPrice.replace(",", ".")) || 0;
    return calculateFullSavings({ originalPrice: orig, promoPrice: promo });
  }, [newDealForm.originalPrice, newDealForm.promoPrice]);

  // Estatísticas de alcance de membros e canais selecionados em tempo real
  const selectedReachStats = useMemo(() => {
    return calculateAudienceReach(newDealForm.targetChannelIds);
  }, [newDealForm.targetChannelIds]);

  // Geração e preview de link encurtado com UTMs em tempo real (Etapa 076)
  const previewShortLinks = useMemo(() => {
    if (!newDealForm.affiliateUrl || !newDealForm.affiliateUrl.trim()) return null;
    return generateDualPlatformLinks({
      productName: newDealForm.productName || "Achadinho VIP",
      store: newDealForm.store,
      rawUrl: newDealForm.affiliateUrl.trim(),
      couponCode: newDealForm.couponCode || undefined,
      discountPercentage: fullSavings.discountPercentage
    });
  }, [newDealForm.affiliateUrl, newDealForm.productName, newDealForm.store, newDealForm.couponCode, fullSavings.discountPercentage]);

  // Canais agrupados por plataforma (Telegram vs WhatsApp)
  const groupedChannels = useMemo(() => {
    return groupChannelsByPlatform(DEFAULT_BROADCAST_CHANNELS);
  }, []);

  // Handlers para seleção de canais
  const handleToggleChannelId = (channelId: string) => {
    setNewDealForm((prev) => {
      const exists = prev.targetChannelIds.includes(channelId);
      const updatedIds = exists
        ? prev.targetChannelIds.filter((id) => id !== channelId)
        : [...prev.targetChannelIds, channelId];

      const hasTg = updatedIds.some((id) => id.startsWith("tg_"));
      const hasWa = updatedIds.some((id) => id.startsWith("wa_"));
      const targetChannels: Array<"whatsapp" | "telegram"> = [];
      if (hasWa) targetChannels.push("whatsapp");
      if (hasTg) targetChannels.push("telegram");

      return {
        ...prev,
        targetChannelIds: updatedIds,
        targetChannels: targetChannels.length > 0 ? targetChannels : ["whatsapp", "telegram"]
      };
    });
  };

  const handleSelectAllChannels = () => {
    const allIds = DEFAULT_BROADCAST_CHANNELS.map((c) => c.id);
    setNewDealForm((prev) => ({
      ...prev,
      targetChannelIds: allIds,
      targetChannels: ["whatsapp", "telegram"]
    }));
  };

  const handleSelectPlatformOnly = (platform: "telegram" | "whatsapp") => {
    const platformIds = DEFAULT_BROADCAST_CHANNELS.filter((c) => c.platform === platform).map((c) => c.id);
    setNewDealForm((prev) => ({
      ...prev,
      targetChannelIds: platformIds,
      targetChannels: [platform]
    }));
  };

  // Filtra ofertas pela loja selecionada
  const filteredDeals = useMemo(() => {
    if (selectedStoreFilter === "all") return deals;
    return deals.filter((d) => d.store === selectedStoreFilter);
  }, [deals, selectedStoreFilter]);

  // Contagem por loja para os botões de filtro
  const storeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: deals.length };
    (Object.keys(SUPPORTED_STORES) as SupportedStore[]).forEach((s) => {
      counts[s] = deals.filter((d) => d.store === s).length;
    });
    return counts;
  }, [deals]);

  // Resumo estatístico das ofertas selecionadas em lote (Etapa 078)
  const batchSelectionSummary = useMemo(() => {
    return getBatchSelectionSummary(deals, selectedDealIds);
  }, [deals, selectedDealIds]);

  // Ofertas selecionadas como objetos
  const selectedDealsList = useMemo(() => {
    const idSet = new Set(selectedDealIds);
    return deals.filter((d) => idSet.has(d.id));
  }, [deals, selectedDealIds]);

  // Slots calculados para preview do agendamento em lote
  const previewBatchSlots = useMemo(() => {
    return calculateBatchScheduleSlots(selectedDealsList, batchScheduleConfig);
  }, [selectedDealsList, batchScheduleConfig]);

  // Handlers de seleção em lote
  const handleToggleSelectDeal = (id: string) => {
    setSelectedDealIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = filteredDeals.map((d) => d.id);
    setSelectedDealIds((prev) => {
      const allSelected = visibleIds.length > 0 && visibleIds.every((id) => prev.includes(id));
      if (allSelected) {
        return prev.filter((id) => !visibleIds.includes(id));
      }
      return Array.from(new Set([...prev, ...visibleIds]));
    });
  };

  const handleClearSelection = () => {
    setSelectedDealIds([]);
  };

  // Disparo em Lote Sequencial com Feedback Anti-Flood
  const handleExecuteBatchDispatch = () => {
    const eligible = filterEligibleDealsForDispatch(deals, selectedDealIds);
    if (eligible.length === 0) {
      toast.info("Nenhuma oferta pendente selecionada para disparo.");
      return;
    }

    const total = eligible.length;
    let completed = 0;
    const succeededIds: string[] = [];

    setBatchProgress({
      total,
      completed: 0,
      currentProductName: eligible[0].productName,
      successCount: 0,
      failedCount: 0,
      percentage: 0
    });

    // Simula transmissão sequencial com throttling anti-flood (500ms por deal)
    eligible.forEach((item, index) => {
      setTimeout(() => {
        completed += 1;
        succeededIds.push(item.id);
        const percentage = Math.round((completed / total) * 100);

        setBatchProgress({
          total,
          completed,
          currentDealId: item.id,
          currentProductName: item.productName,
          successCount: completed,
          failedCount: 0,
          percentage
        });

        if (completed === total) {
          setTimeout(() => {
            dispatchBatchDeals(succeededIds);
            setBatchProgress(null);
            setSelectedDealIds([]);
            toast.success(`Lote de ${total} ofertas transmitido com sucesso para os Grupos VIP!`);
          }, 400);
        }
      }, (index + 1) * 500);
    });
  };

  // Aplicação do Agendamento em Lote
  const handleApplyBatchSchedule = () => {
    if (previewBatchSlots.length === 0) return;

    previewBatchSlots.forEach((slot) => {
      updateDeal(slot.dealId, { scheduledTime: slot.scheduledTime });
    });

    setIsBatchScheduleModalOpen(false);
    setSelectedDealIds([]);
    toast.success(`Agendamento em lote aplicado para ${previewBatchSlots.length} ofertas com sucesso!`);
  };

  // Auto-detecta loja quando o usuário cola uma URL de afiliado
  const handleUrlChange = (url: string) => {
    const detected = detectStoreFromUrl(url);
    setNewDealForm((prev) => ({
      ...prev,
      affiliateUrl: url,
      store: detected
    }));
  };

  // Disparo instantâneo com delay anti-spam simulado
  const handleInstantDispatch = (dealId: string) => {
    setDispatchingId(dealId);
    setTimeout(() => {
      dispatchDeal(dealId);
      setDispatchingId(null);
      toast.success("Oferta transmitida com sucesso para os Grupos VIP (WhatsApp & Telegram)!");
    }, 800);
  };

  // Sincroniza ofertas curadas do Hub V5 Finders
  const handleSyncFinders = () => {
    setIsSyncing(true);
    setTimeout(() => {
      importFindersDeals(SAMPLE_FINDERS_DEALS);
      setIsSyncing(false);
      toast.success("Catálogo do V5 Finders Hub sincronizado com sucesso (5 lojas integradas)!");
    }, 600);
  };

  // Criação de Nova Oferta com validação
  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();

    const orig = parseFloat(newDealForm.originalPrice.replace(",", ".")) || 0;
    const promo = parseFloat(newDealForm.promoPrice.replace(",", ".")) || 0;
    const savings = calculateSavings(orig, promo);

    const validation = validateDealData({
      productName: newDealForm.productName,
      store: newDealForm.store,
      originalPrice: orig,
      promoPrice: promo,
      affiliateUrl: newDealForm.affiliateUrl
    });

    if (!validation.isValid) {
      toast.error(validation.errors[0] || "Dados inválidos para a oferta.");
      return;
    }

    const channelValidation = validateChannelSelection(newDealForm.targetChannelIds);
    if (!channelValidation.isValid) {
      toast.error(channelValidation.error || "Selecione ao menos um canal ou comunidade VIP.");
      return;
    }

    // Gera os links encurtados com injeção de parâmetros UTM dedicados (Etapa 076)
    const generatedLinks = generateDualPlatformLinks({
      productName: newDealForm.productName.trim(),
      store: newDealForm.store,
      rawUrl: newDealForm.affiliateUrl.trim(),
      couponCode: newDealForm.couponCode.trim().toUpperCase() || undefined,
      discountPercentage: savings.discountPercentage
    });

    addDeal({
      productName: newDealForm.productName.trim(),
      store: newDealForm.store,
      originalPrice: orig,
      promoPrice: promo,
      discountPercentage: savings.discountPercentage,
      savingsAmount: savings.savingsAmount,
      couponCode: newDealForm.couponCode.trim().toUpperCase() || undefined,
      affiliateUrl: newDealForm.affiliateUrl.trim(),
      shortUrl: generatedLinks.generic.shortUrl,
      shortCode: generatedLinks.generic.shortCode,
      trackedTelegramUrl: generatedLinks.telegram.shortUrl,
      trackedWhatsAppUrl: generatedLinks.whatsapp.shortUrl,
      targetChannels: newDealForm.targetChannels.length > 0 ? newDealForm.targetChannels : ["whatsapp", "telegram"],
      targetChannelIds: newDealForm.targetChannelIds,
      estimatedReach: selectedReachStats.totalMembers,
      scheduledTime: newDealForm.scheduledTime || "12:00",
      status: "pending",
      totalClicks: 0
    });

    setIsModalOpen(false);
    setNewDealForm({
      productName: "",
      store: "Shopee",
      originalPrice: "",
      promoPrice: "",
      couponCode: "",
      affiliateUrl: "",
      targetChannels: ["whatsapp", "telegram"],
      targetChannelIds: DEFAULT_BROADCAST_CHANNELS.map((c) => c.id),
      scheduledTime: "12:00"
    });

    toast.success("Nova oferta cadastrada e pronta para transmissão nos Grupos VIP!");
  };

  // Alterna canal de destino (WhatsApp / Telegram)
  const toggleChannel = (channel: "whatsapp" | "telegram") => {
    setNewDealForm((prev) => {
      const exists = prev.targetChannels.includes(channel);
      const updated = exists 
        ? prev.targetChannels.filter((c) => c !== channel)
        : [...prev.targetChannels, channel];
      return {
        ...prev,
        targetChannels: updated.length > 0 ? updated : [channel]
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP BANNER DA CAPITANIA #13 (V5 FINDERS VIP HUB) */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 p-5 rounded-2xl border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4 text-emerald-400" />
            <span>Braço de Transmissão V5 Finders VIP • Capitania #13 Poster</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Despachador de Ofertas & Grupos VIP</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Fase 8 • Etapa 078 (Disparo Instantâneo & Agendamento em Lote VIP)
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-3xl">
            Transmita as melhores pechinchas e achadinhos do V5 Finders instantaneamente para comunidades no WhatsApp e canais no Telegram das 5 principais lojas de afiliados (Shopee, Mercado Livre, Amazon, AliExpress e Magalu).
          </p>
        </div>

        {/* Ações Globais: Sincronizar Hub e Nova Oferta */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSyncFinders}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-mono transition ${
              isSyncing ? "opacity-75" : ""
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? "animate-spin" : ""}`} />
            <span>Sincronizar Hub Finders</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-950/40 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Oferta VIP</span>
          </button>
        </div>
      </div>

      {/* 2. BARRA DE FILTROS POR LOJA COM CORES OFICIAIS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          type="button"
          onClick={() => setSelectedStoreFilter("all")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition ${
            selectedStoreFilter === "all"
              ? "bg-zinc-800 text-white font-bold border border-zinc-700 shadow-sm"
              : "bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 hover:text-white"
          }`}
        >
          <span>Todas as Lojas</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-700 text-zinc-300">
            {storeCounts.all}
          </span>
        </button>

        {(Object.entries(SUPPORTED_STORES) as [SupportedStore, typeof SUPPORTED_STORES[SupportedStore]][]).map(([sName, meta]) => {
          const isSelected = selectedStoreFilter === sName;
          const count = storeCounts[sName] || 0;

          return (
            <button
              key={sName}
              type="button"
              onClick={() => setSelectedStoreFilter(sName)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition ${
                isSelected
                  ? `bg-zinc-900 text-white font-bold border ${meta.borderColor} shadow-md`
                  : "bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 hover:text-white"
              }`}
            >
              <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: meta.brandColor }} />
              <span>{sName}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-400">
                {count}
              </span>
            </button>
          );
        })}

        {/* Botão de Selecionar Todas as Ofertas Visíveis */}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAllVisible}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-mono transition"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {filteredDeals.length > 0 && filteredDeals.every((d) => selectedDealIds.includes(d.id))
                ? "Desmarcar Visíveis"
                : `Selecionar Visíveis (${filteredDeals.length})`}
            </span>
          </button>
        </div>
      </div>

      {/* 2.5 BARRA DE OPERAÇÕES EM LOTE (ETAPA 078) */}
      {selectedDealIds.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-zinc-950 p-4 rounded-2xl border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {batchSelectionSummary.selectedCount} {batchSelectionSummary.selectedCount === 1 ? "oferta selecionada" : "ofertas selecionadas"}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  👥 ~{(batchSelectionSummary.totalReach / 1000).toFixed(1)}k membros
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {batchSelectionSummary.pendingCount} pendentes • {batchSelectionSummary.alreadySentCount} já disparadas
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExecuteBatchDispatch}
              disabled={!batchSelectionSummary.canDispatch || Boolean(batchProgress)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-md ${
                !batchSelectionSummary.canDispatch || Boolean(batchProgress)
                  ? "bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-950/50 active:scale-95"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Disparar Lote Agora ({batchSelectionSummary.pendingCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBatchScheduleModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition border border-zinc-700 active:scale-95"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Agendar em Lote</span>
            </button>

            <button
              type="button"
              onClick={handleClearSelection}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
              title="Limpar Seleção"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. GRADE DE OFERTAS (DEALS GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDeals.map((deal) => {
          const storeMeta = SUPPORTED_STORES[deal.store as SupportedStore] || SUPPORTED_STORES.Shopee;
          const savings = deal.savingsAmount || Number((deal.originalPrice - deal.promoPrice).toFixed(2));
          const urgency = getDealUrgency(deal.discountPercentage);
          const isSelected = selectedDealIds.includes(deal.id);

          return (
            <div
              key={deal.id}
              className={`border rounded-2xl p-5 flex flex-col justify-between transition space-y-4 shadow-lg group relative ${
                isSelected 
                  ? "bg-zinc-900/90 border-emerald-500/80 ring-2 ring-emerald-500/30" 
                  : "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div>
                {/* Header do Card: Checkbox Lote, Loja e Desconto */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleSelectDeal(deal.id)}
                      className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                      title={isSelected ? "Desmarcar da seleção em lote" : "Selecionar para lote"}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-600" />
                      )}
                    </button>
                    <span 
                      className={`text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-lg border font-bold flex items-center gap-1.5 bg-zinc-950 ${storeMeta.borderColor} ${storeMeta.textColor}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: storeMeta.brandColor }} />
                      <span>{deal.store}</span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
                      {storeMeta.badgeText}
                    </span>
                  </div>

                  <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    <span>{deal.discountPercentage}% OFF</span>
                  </span>
                </div>

                {/* Badge de Urgência Psicológica da Oferta */}
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md border font-bold flex items-center gap-1 ${urgency.badgeColor}`}>
                    <span>{urgency.emoji}</span>
                    <span>{urgency.badgeLabel}</span>
                  </span>
                </div>

                {/* Nome do Produto */}
                <h4 className="text-sm font-bold text-white mb-3 line-clamp-2 group-hover:text-emerald-300 transition leading-snug">
                  {deal.productName}
                </h4>

                {/* Caixa de Preços & Economia */}
                <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800/80 mb-3 space-y-1 font-mono">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="line-through">De: R$ {deal.originalPrice.toFixed(2)}</span>
                    <span className="text-emerald-400 font-semibold">Economize R$ {savings.toFixed(2)}</span>
                  </div>

                  <div className="text-lg font-extrabold text-white flex items-baseline gap-1">
                    <span className="text-xs text-emerald-400">Por: R$</span>
                    <span className="text-emerald-400">{deal.promoPrice.toFixed(2)}</span>
                  </div>

                  {deal.couponCode && (
                    <div className="text-[11px] text-amber-400 font-bold flex items-center justify-between pt-1 border-t border-zinc-800/60 mt-1">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>CUPOM: {deal.couponCode}</span>
                      </span>
                      <span className="text-[9px] text-zinc-500 uppercase">Auto-Aplicável</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rodapé do Card: Canais, Status e Disparo */}
              <div className="space-y-3 pt-1 border-t border-zinc-800/60">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span>Canais:</span>
                    <div className="flex gap-1">
                      {deal.targetChannels.map((ch) => (
                        <span 
                          key={ch} 
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            ch === "whatsapp" 
                              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30" 
                              : "bg-blue-950/80 text-blue-300 border border-blue-500/30"
                          }`}
                        >
                          {ch === "whatsapp" ? "WhatsApp" : "Telegram"}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                      <Users className="w-2.5 h-2.5" />
                      <span>
                        ~{(deal.estimatedReach ?? 56354) >= 1000 
                          ? `${((deal.estimatedReach ?? 56354) / 1000).toFixed(1)}k` 
                          : (deal.estimatedReach ?? 56354)}
                      </span>
                    </span>
                    {deal.totalClicks !== undefined && (
                      <span className="text-zinc-500 text-[10px]">{deal.totalClicks} cliques</span>
                    )}
                  </div>
                </div>

                {/* Link Encurtado com UTM V5 Poster (Etapa 076) */}
                <div className="flex items-center justify-between text-[10px] font-mono bg-zinc-950/60 p-2 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center gap-1.5 text-zinc-400 truncate">
                    <Link2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="text-zinc-500">Curto:</span>
                    <span className="text-emerald-300 font-semibold truncate">
                      {deal.shortUrl || `https://${DEFAULT_SHORTENER_DOMAIN}/d/${deal.shortCode || "link"}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const urlToCopy = deal.shortUrl || `https://${DEFAULT_SHORTENER_DOMAIN}/d/${deal.shortCode || "link"}`;
                      navigator.clipboard?.writeText(urlToCopy);
                      toast.success("Link encurtado com UTMs copiado!");
                    }}
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition shrink-0 ml-1"
                    title="Copiar Link Encurtado"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleInstantDispatch(deal.id)}
                    disabled={deal.status === "sent" || dispatchingId === deal.id}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      deal.status === "sent"
                        ? "bg-zinc-800/80 text-zinc-500 border border-zinc-700/40 cursor-not-allowed"
                        : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-md shadow-emerald-950/40 active:scale-95"
                    }`}
                  >
                    {dispatchingId === deal.id ? (
                      <span className="animate-pulse">Despachando nos grupos...</span>
                    ) : deal.status === "sent" ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Disparado nos Grupos</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Disparar nos Grupos VIP</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPreviewDeal(deal);
                      setPreviewChannel("whatsapp");
                    }}
                    className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500 text-emerald-300 transition"
                    title="Preview Formatação WhatsApp VIP (Balão Verde)"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPreviewDeal(deal);
                      setPreviewChannel("telegram");
                    }}
                    className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30 hover:border-blue-500 text-blue-300 transition"
                    title="Preview Formatação Telegram VIP (Balão Azul)"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      deleteDeal(deal.id);
                      toast.info("Oferta removida da fila de transmissão.");
                    }}
                    className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-rose-500/40 hover:text-rose-400 text-zinc-500 transition"
                    title="Excluir Oferta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDeals.length === 0 && (
        <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center text-zinc-500 text-xs font-mono space-y-2">
          <p>Nenhuma oferta encontrada para a loja selecionada.</p>
          <button
            type="button"
            onClick={handleSyncFinders}
            className="text-emerald-400 underline hover:text-emerald-300"
          >
            Clique aqui para sincronizar o catálogo do V5 Finders
          </button>
        </div>
      )}

      {/* 4. MODAL DE CADASTRO DE NOVA OFERTA COM AUTO-DETECÇÃO DE LOJA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Cadastrar Oferta VIP (Finders)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-4 text-xs font-mono">
              {/* URL de Afiliado com Auto-Detecção */}
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Link de Afiliado do Produto (Auto-Detecta a Loja):
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://shope.ee/... ou https://amzn.to/..."
                  value={newDealForm.affiliateUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-amber-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Preview do Link Encurtado & Injeção de UTMs V5 Poster (Etapa 076) */}
              {previewShortLinks && (
                <div className="p-3 rounded-xl bg-zinc-900/90 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Encurtador & Injetor de UTMs V5 Poster:</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Domínio: {DEFAULT_SHORTENER_DOMAIN}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                    <span className="text-emerald-300 font-mono text-[11px] truncate">
                      {previewShortLinks.generic.shortUrl}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono shrink-0 ml-1">
                      Código: {previewShortLinks.generic.shortCode}
                    </span>
                  </div>

                  {/* Badges de Parâmetros UTM Injetados */}
                  <div className="flex flex-wrap gap-1.5 text-[9px] font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-500/30">
                      TG: utm_source=telegram_vip
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                      WA: utm_source=whatsapp_vip
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      camp: {previewShortLinks.generic.utmParams.utm_campaign}
                    </span>
                    {previewShortLinks.generic.utmParams.utm_term && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30">
                        term: {previewShortLinks.generic.utmParams.utm_term}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Seletor de Loja das 5 Oficiais */}
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Loja de Afiliado (Detectada ou Selecionada):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(SUPPORTED_STORES) as SupportedStore[]).map((s) => {
                    const isSelected = newDealForm.store === s;
                    const meta = SUPPORTED_STORES[s];
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNewDealForm({ ...newDealForm, store: s })}
                        className={`p-2 rounded-xl border text-[11px] flex items-center gap-1.5 transition ${
                          isSelected
                            ? `bg-zinc-900 text-white font-bold ${meta.borderColor} ring-1 ring-emerald-500/40`
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.brandColor }} />
                        <span>{s}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nome do Produto */}
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Nome do Produto / Oferta:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Teclado Mecânico RGB Switch Blue"
                  value={newDealForm.productName}
                  onChange={(e) => setNewDealForm({ ...newDealForm, productName: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Preços e Cálculo em Tempo Real */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">
                    Preço Original (De: R$):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="199.90"
                    value={newDealForm.originalPrice}
                    onChange={(e) => setNewDealForm({ ...newDealForm, originalPrice: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">
                    Preço Promocional (Por: R$):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="99.90"
                    value={newDealForm.promoPrice}
                    onChange={(e) => setNewDealForm({ ...newDealForm, promoPrice: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Feedback do Cálculo de Economia e Urgência Psicológica */}
              {fullSavings.isValid && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-950 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${fullSavings.urgency.badgeColor}`}>
                        {fullSavings.urgency.emoji} {fullSavings.urgency.badgeLabel}
                      </span>
                    </span>
                    <span className="font-mono font-bold text-white text-xs">
                      {fullSavings.discountPercentage}% OFF
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-zinc-800/80">
                    <span className="text-zinc-400">Destaque de Economia Real:</span>
                    <span className="text-emerald-400 font-bold">
                      Você economiza R$ {fullSavings.formattedSavingsAmount}
                    </span>
                  </div>
                </div>
              )}

              {/* Cupom e Horário */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">
                    Cupom de Desconto (Opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: PROMO20"
                    value={newDealForm.couponCode}
                    onChange={(e) => setNewDealForm({ ...newDealForm, couponCode: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-amber-400 uppercase focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">
                    Horário de Transmissão:
                  </label>
                  <input
                    type="time"
                    value={newDealForm.scheduledTime}
                    onChange={(e) => setNewDealForm({ ...newDealForm, scheduledTime: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Canais & Comunidades de Transmissão VIP (Etapa 075) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-zinc-400 font-semibold flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Canais & Comunidades de Destino VIP:</span>
                  </label>

                  {/* Seleção Rápida */}
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={handleSelectAllChannels}
                      className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition"
                    >
                      Todos ({DEFAULT_BROADCAST_CHANNELS.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectPlatformOnly("telegram")}
                      className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 hover:text-white border border-blue-500/40 transition"
                    >
                      Só Telegram
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectPlatformOnly("whatsapp")}
                      className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 hover:text-white border border-emerald-500/40 transition"
                    >
                      Só WhatsApp
                    </button>
                  </div>
                </div>

                {/* Box de Alcance Estimado em Tempo Real */}
                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 text-[11px]">Alcance Estimado:</span>
                    <span className="text-emerald-400 font-bold text-xs">
                      👥 {selectedReachStats.totalMembers.toLocaleString()} membros
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                    <span className="text-blue-400">TG: {selectedReachStats.telegramMembersCount.toLocaleString()}</span>
                    <span>•</span>
                    <span className="text-emerald-400">WA: {selectedReachStats.whatsappMembersCount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Listagem de Canais: Telegram e WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {/* Coluna Telegram */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-blue-400 flex items-center gap-1 px-1">
                      <Send className="w-3 h-3" />
                      <span>Canais Telegram ({groupedChannels.telegram.length})</span>
                    </div>
                    {groupedChannels.telegram.map((ch) => {
                      const isChecked = newDealForm.targetChannelIds.includes(ch.id);
                      return (
                        <div
                          key={ch.id}
                          onClick={() => handleToggleChannelId(ch.id)}
                          className={`p-2 rounded-xl border text-[10px] cursor-pointer transition flex items-center justify-between ${
                            isChecked
                              ? "bg-blue-950/40 border-blue-500/60 text-blue-200"
                              : "bg-zinc-900/50 border-zinc-800/80 text-zinc-500 hover:border-zinc-700"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="rounded border-zinc-700 bg-zinc-800 text-blue-500"
                            />
                            <span className="truncate font-semibold">{ch.name}</span>
                          </div>
                          <span className="text-[9px] font-mono shrink-0 ml-1 opacity-75">
                            {ch.memberCount >= 1000 ? `${(ch.memberCount / 1000).toFixed(1)}k` : ch.memberCount}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Coluna WhatsApp */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1 px-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>Comunidades WhatsApp ({groupedChannels.whatsapp.length})</span>
                    </div>
                    {groupedChannels.whatsapp.map((ch) => {
                      const isChecked = newDealForm.targetChannelIds.includes(ch.id);
                      return (
                        <div
                          key={ch.id}
                          onClick={() => handleToggleChannelId(ch.id)}
                          className={`p-2 rounded-xl border text-[10px] cursor-pointer transition flex items-center justify-between ${
                            isChecked
                              ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-200"
                              : "bg-zinc-900/50 border-zinc-800/80 text-zinc-500 hover:border-zinc-700"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="rounded border-zinc-700 bg-zinc-800 text-emerald-500"
                            />
                            <span className="truncate font-semibold">{ch.name}</span>
                          </div>
                          <span className="text-[9px] font-mono shrink-0 ml-1 opacity-75">
                            {ch.memberCount >= 1000 ? `${(ch.memberCount / 1000).toFixed(1)}k` : ch.memberCount}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Botões de Submissão */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40"
                >
                  Salvar Oferta VIP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL DE PREVIEW E SIMULAÇÃO DE MENSAGENS VIP (ETAPA 077) */}
      {previewDeal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl p-5 space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200 my-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Simulador de Preview Fidedigno VIP</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-700">
                  {previewDeal.store}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDeal(null)}
                className="text-zinc-400 hover:text-white transition p-1 rounded-lg hover:bg-zinc-800"
                title="Fechar Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <MessagePreviewSimulator
              deal={previewDeal}
              initialPlatform={previewChannel}
              onClose={() => setPreviewDeal(null)}
            />
          </div>
        </div>
      )}

      {/* 6. MODAL DE AGENDAMENTO EM LOTE VIP (ETAPA 078) */}
      {isBatchScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Agendamento em Lote VIP</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                  {selectedDealsList.length} ofertas
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsBatchScheduleModalOpen(false)}
                className="text-zinc-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <p className="text-zinc-400">
                Defina o horário inicial e o intervalo entre os disparos. O motor distribuirá as ofertas de forma sequencial para não sobrecarregar os canais.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">
                    Horário Inicial:
                  </label>
                  <input
                    type="time"
                    value={batchScheduleConfig.startTime}
                    onChange={(e) =>
                      setBatchScheduleConfig({ ...batchScheduleConfig, startTime: e.target.value })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">
                    Intervalo Entre Posts:
                  </label>
                  <select
                    value={batchScheduleConfig.intervalMinutes}
                    onChange={(e) =>
                      setBatchScheduleConfig({
                        ...batchScheduleConfig,
                        intervalMinutes: parseInt(e.target.value, 10) || 30
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value={15}>A cada 15 minutos</option>
                    <option value={30}>A cada 30 minutos (Padrão)</option>
                    <option value={45}>A cada 45 minutos</option>
                    <option value={60}>A cada 1 hora</option>
                    <option value={120}>A cada 2 horas</option>
                  </select>
                </div>
              </div>

              {/* Tabela de Preview dos Slots Calculados */}
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1 font-semibold">
                  Cronograma Previsto ({previewBatchSlots.length} disparos):
                </label>
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-2.5 max-h-48 overflow-y-auto space-y-1.5">
                  {previewBatchSlots.map((slot) => (
                    <div
                      key={slot.dealId}
                      className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80"
                    >
                      <span className="text-zinc-300 truncate max-w-[280px]">
                        {slot.sequenceIndex}. {slot.productName}
                      </span>
                      <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/20">
                        {slot.scheduledTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsBatchScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleApplyBatchSchedule}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40"
                >
                  Confirmar Agendamento em Lote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. OVERLAY DE PROGRESSO DE DISPARO EM LOTE (ETAPA 078) */}
      {batchProgress && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-emerald-500/40 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Disparando Lote de Ofertas VIP</h3>
              <p className="text-xs text-zinc-400 mt-1 font-mono">
                Processando {batchProgress.completed} de {batchProgress.total} ofertas...
              </p>
            </div>

            {/* Barra de Progresso */}
            <div className="space-y-1.5 font-mono">
              <div className="w-full bg-zinc-900 rounded-full h-3 overflow-hidden border border-zinc-800">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${batchProgress.percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span className="truncate max-w-[260px] text-zinc-400 text-left">
                  {batchProgress.currentProductName || "Transmitindo..."}
                </span>
                <span className="font-bold text-emerald-400">{batchProgress.percentage}%</span>
              </div>
            </div>

            <p className="text-[10px] text-zinc-500 font-mono">
              ⚡ Transmissão segura com delay anti-flood ativo (Meta Graph & Telegram Bot API)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
