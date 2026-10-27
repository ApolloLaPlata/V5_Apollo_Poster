"use client";

import React, { useState } from "react";
import { Send, Tag, ShoppingCart, Percent, CheckCircle2, ShieldCheck, Flame } from "lucide-react";
import { GroupBroadcastDeal } from "@/types/poster";

const INITIAL_DEALS: GroupBroadcastDeal[] = [
  {
    id: "deal-1",
    productName: "Monitor Gamer Curvo 27\" 165Hz 1ms IPS",
    store: "Shopee",
    originalPrice: 1299.90,
    promoPrice: 749.00,
    discountPercentage: 42,
    couponCode: "APOLLO40",
    affiliateUrl: "https://shope.ee/v5_curvo_27?utm_source=v5poster_vip",
    targetChannels: ["whatsapp", "telegram"],
    scheduledTime: "12:30",
    status: "pending"
  },
  {
    id: "deal-2",
    productName: "Air Fryer Digital 5.5L Aço Inox Touch",
    store: "Mercado Livre",
    originalPrice: 489.00,
    promoPrice: 289.90,
    discountPercentage: 40,
    couponCode: "CUPOM20",
    affiliateUrl: "https://mercadolivre.com.br/sec/airfryer?utm_source=v5poster_vip",
    targetChannels: ["telegram"],
    scheduledTime: "16:00",
    status: "pending"
  },
  {
    id: "deal-3",
    productName: "Robô Aspirador Inteligente com Mop & Laser",
    store: "AliExpress",
    originalPrice: 1890.00,
    promoPrice: 890.00,
    discountPercentage: 53,
    couponCode: "BRAZIL100",
    affiliateUrl: "https://aliexpress.com/item/robo_v5?utm_source=v5poster_vip",
    targetChannels: ["whatsapp", "telegram"],
    scheduledTime: "20:00",
    status: "sent"
  }
];

export function OfferGroupDispatcher() {
  const [deals, setDeals] = useState<GroupBroadcastDeal[]>(INITIAL_DEALS);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  const handleInstantDispatch = (dealId: string) => {
    setDispatchingId(dealId);
    setTimeout(() => {
      setDeals(deals.map(d => d.id === dealId ? { ...d, status: "sent" } : d));
      setDispatchingId(null);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 p-5 rounded-2xl border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4 text-emerald-400" />
            <span>Braço de Transmissão V5 Finders VIP</span>
          </div>
          <h2 className="text-xl font-bold text-white">Despachador de Ofertas & Grupos VIP</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Transmita as melhores pechinchas e achadinhos do V5 Finders instantaneamente para dezenas de grupos no WhatsApp e canais no Telegram com formatação rica, preço tachado e cupom destacado.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Anti-Spam Delay Ativo</span>
          </span>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deals.map(deal => (
          <div
            key={deal.id}
            className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-700 transition"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {deal.store}
                </span>
                <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  <span>{deal.discountPercentage}% OFF</span>
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mb-3 line-clamp-2">{deal.productName}</h4>

              <div className="bg-zinc-800/60 p-3 rounded-lg border border-zinc-700/50 mb-3 space-y-1">
                <div className="text-[11px] text-zinc-400 line-through">
                  De: R$ {deal.originalPrice.toFixed(2)}
                </div>
                <div className="text-base font-extrabold text-emerald-400">
                  Por: R$ {deal.promoPrice.toFixed(2)}
                </div>
                {deal.couponCode && (
                  <div className="text-[11px] text-amber-400 font-mono font-bold flex items-center gap-1 pt-1">
                    <Tag className="w-3 h-3" />
                    <span>CUPOM: {deal.couponCode}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>Canais de Disparo:</span>
                <div className="flex gap-1">
                  {deal.targetChannels.map(ch => (
                    <span key={ch} className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 font-mono">
                      {ch}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleInstantDispatch(deal.id)}
                disabled={deal.status === "sent" || dispatchingId === deal.id}
                className={`w-full py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  deal.status === "sent"
                    ? "bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-md"
                }`}
              >
                {dispatchingId === deal.id ? (
                  <span>Disparando nos grupos...</span>
                ) : deal.status === "sent" ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Disparado com Sucesso</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Disparar Agora nos Grupos VIP</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
