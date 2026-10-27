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
  X
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
import { toast } from "@/lib/toast/useToast";

export function OfferGroupDispatcher() {
  const { deals, addDeal, deleteDeal, dispatchDeal, importFindersDeals } = usePosterStore();

  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>("all");
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Estado do Formulário de Criação de Oferta
  const [newDealForm, setNewDealForm] = useState<{
    productName: string;
    store: SupportedStore;
    originalPrice: string;
    promoPrice: string;
    couponCode: string;
    affiliateUrl: string;
    targetChannels: Array<"whatsapp" | "telegram">;
    scheduledTime: string;
  }>({
    productName: "",
    store: "Shopee",
    originalPrice: "",
    promoPrice: "",
    couponCode: "",
    affiliateUrl: "",
    targetChannels: ["whatsapp", "telegram"],
    scheduledTime: "12:00"
  });

  // Cálculo reativo de economia em tempo real no formulário
  const formSavings = useMemo(() => {
    const orig = parseFloat(newDealForm.originalPrice.replace(",", ".")) || 0;
    const promo = parseFloat(newDealForm.promoPrice.replace(",", ".")) || 0;
    return calculateSavings(orig, promo);
  }, [newDealForm.originalPrice, newDealForm.promoPrice]);

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

    addDeal({
      productName: newDealForm.productName.trim(),
      store: newDealForm.store,
      originalPrice: orig,
      promoPrice: promo,
      discountPercentage: savings.discountPercentage,
      savingsAmount: savings.savingsAmount,
      couponCode: newDealForm.couponCode.trim().toUpperCase() || undefined,
      affiliateUrl: newDealForm.affiliateUrl.trim(),
      targetChannels: newDealForm.targetChannels.length > 0 ? newDealForm.targetChannels : ["whatsapp", "telegram"],
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
              Fase 8 • Etapa 071 (Conexão V5 Finders & 5 Lojas VIP)
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
      </div>

      {/* 3. GRADE DE OFERTAS (DEALS GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDeals.map((deal) => {
          const storeMeta = SUPPORTED_STORES[deal.store as SupportedStore] || SUPPORTED_STORES.Shopee;
          const savings = deal.savingsAmount || Number((deal.originalPrice - deal.promoPrice).toFixed(2));

          return (
            <div
              key={deal.id}
              className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700 transition space-y-4 shadow-lg group relative"
            >
              <div>
                {/* Header do Card: Loja e Desconto */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
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
                  <div className="flex items-center gap-1.5">
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

                  {deal.totalClicks !== undefined && (
                    <span className="text-zinc-500 text-[10px]">{deal.totalClicks} cliques</span>
                  )}
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

              {/* Feedback do Cálculo de Economia */}
              {formSavings.isValid && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-[11px] text-emerald-300">
                  <span>Desconto Calculado: <strong>{formSavings.discountPercentage}% OFF</strong></span>
                  <span>Economia Real: <strong>R$ {formSavings.savingsAmount.toFixed(2)}</strong></span>
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

              {/* Canais de Transmissão */}
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Canais de Destino VIP:
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggleChannel("whatsapp")}
                    className={`flex-1 p-2 rounded-xl border flex items-center justify-center gap-1.5 transition ${
                      newDealForm.targetChannels.includes("whatsapp")
                        ? "bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Comunidades WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleChannel("telegram")}
                    className={`flex-1 p-2 rounded-xl border flex items-center justify-center gap-1.5 transition ${
                      newDealForm.targetChannels.includes("telegram")
                        ? "bg-blue-950/60 border-blue-500 text-blue-300 font-bold"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    <Send className="w-3.5 h-3.5 text-blue-400" />
                    <span>Canais VIP Telegram</span>
                  </button>
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
    </div>
  );
}
