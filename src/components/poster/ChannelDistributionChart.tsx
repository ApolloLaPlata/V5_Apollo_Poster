"use client";

/**
 * ChannelDistributionChart.tsx - Gráfico Visual de Distribuição de Posts por Canal
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Visualização Gráfica da Distribuição Onicanal:
 * - Barra horizontal de proporção empilhada contínua (estilo GitHub Language Breakdown)
 * - 4 Cards Executivos para as Verticais: Blog, Email, Redes Sociais e Grupos VIP
 * - Destaque visual do canal mais ativo com selo dinâmico
 * - Grade detalhada por plataforma individual com contadores e porcentagens
 */

import React, { useState } from "react";
import { usePosterStore } from "@/store/usePosterStore";
import {
  calculateChannelDistribution,
  ChannelGroupDistribution,
  ChannelGroupKey
} from "@/lib/analytics/channelDistribution";
import {
  PieChart,
  Globe,
  Mail,
  Share2,
  Flame,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
  Info
} from "lucide-react";

export function ChannelDistributionChart() {
  const { posts, deals, dispatchQueue, logs } = usePosterStore();
  const [selectedGroup, setSelectedGroup] = useState<ChannelGroupKey | "all">("all");

  const report = calculateChannelDistribution({
    posts,
    deals,
    dispatchQueue,
    logs
  });

  const getGroupIcon = (key: ChannelGroupKey) => {
    switch (key) {
      case "blog":
        return <Globe className="w-4 h-4 text-blue-400" />;
      case "email":
        return <Mail className="w-4 h-4 text-amber-400" />;
      case "social":
        return <Share2 className="w-4 h-4 text-pink-400" />;
      case "groups":
        return <Flame className="w-4 h-4 text-emerald-400" />;
    }
  };

  const filteredChannels = selectedGroup === "all"
    ? report.channels.filter((c) => c.count > 0)
    : report.channels.filter((c) => c.groupKey === selectedGroup);

  return (
    <div className="bg-gradient-to-r from-zinc-900/90 via-zinc-900/80 to-zinc-950/90 border border-zinc-800 rounded-2xl p-5 shadow-xl relative overflow-hidden backdrop-blur-md space-y-5">
      {/* Luz ambiente de fundo */}
      <div className="absolute top-0 right-10 w-72 h-32 bg-blue-500/5 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-10 w-72 h-32 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />

      {/* Header do Gráfico */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              Distribuição Onicanal de Despacho
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                {report.totalTracked} canais acionados
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Proporção de transmissão entre Blog, Email, Redes Sociais e Grupos VIP.
            </p>
          </div>
        </div>

        {/* Selo do Canal Líder */}
        {report.topPlatform.count > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-400">Canal Líder:</span>
            <strong className="text-amber-300 font-bold">{report.topPlatform.label}</strong>
            <span className="text-[10px] text-zinc-500">({report.topPlatform.percentage}%)</span>
          </div>
        )}
      </div>

      {/* Barra de Proporção Empilhada Contínua (Stacked Bar) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span>Proporção Acumulada por Vertical</span>
          <span>Total: 100%</span>
        </div>

        {report.totalTracked === 0 ? (
          <div className="w-full bg-zinc-800/60 rounded-full h-3" />
        ) : (
          <div className="w-full bg-zinc-950 rounded-xl h-3.5 flex overflow-hidden p-0.5 border border-zinc-800/80 shadow-inner">
            {report.groups.map((group) => {
              if (group.percentage <= 0) return null;
              return (
                <div
                  key={group.key}
                  className="h-full first:rounded-l-lg last:rounded-r-lg transition-all duration-500 hover:opacity-90 relative group"
                  style={{
                    width: `${group.percentage}%`,
                    backgroundColor: group.barColorHex
                  }}
                  title={`${group.label}: ${group.percentage}% (${group.totalCount} envios)`}
                />
              );
            })}
          </div>
        )}

        {/* Legenda Dinâmica da Barra */}
        <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] font-mono">
          {report.groups.map((group) => (
            <button
              key={group.key}
              onClick={() => setSelectedGroup(selectedGroup === group.key ? "all" : group.key)}
              className={`flex items-center gap-1.5 transition ${
                selectedGroup === group.key || selectedGroup === "all"
                  ? "text-zinc-200"
                  : "text-zinc-500 opacity-60"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: group.barColorHex }}
              />
              <span>{group.label}</span>
              <strong className="text-zinc-400 font-semibold">{group.percentage}%</strong>
            </button>
          ))}
        </div>
      </div>

      {/* Grade dos 4 Macro-Grupos Verticais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {report.groups.map((group) => {
          const isSelected = selectedGroup === group.key;

          return (
            <div
              key={group.key}
              onClick={() => setSelectedGroup(isSelected ? "all" : group.key)}
              className={`cursor-pointer rounded-xl p-3.5 border transition-all ${
                isSelected
                  ? `${group.tailwindBg} ${group.tailwindBorder} ring-1 ring-blue-500/30`
                  : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-950/90"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${group.tailwindBg} ${group.tailwindText} border ${group.tailwindBorder}`}>
                    {getGroupIcon(group.key)}
                  </div>
                  <span className="font-semibold text-xs text-zinc-200">
                    {group.label}
                  </span>
                </div>
                <span className={`text-xs font-mono font-bold ${group.tailwindText}`}>
                  {group.percentage}%
                </span>
              </div>

              {/* Barra de Progresso Individual */}
              <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden my-2">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${group.percentage}%`,
                    backgroundColor: group.barColorHex
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mt-2">
                <span>{group.totalCount} despachos</span>
                <span className="truncate max-w-[120px]">{group.channels.length} canais</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detalhamento por Plataforma Específica */}
      {filteredChannels.length > 0 && (
        <div className="pt-2 border-t border-zinc-800/60 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>
              Canais Detalhados ({selectedGroup === "all" ? "Todas as Verticais" : report.groups.find((g) => g.key === selectedGroup)?.label})
            </span>
            {selectedGroup !== "all" && (
              <button
                onClick={() => setSelectedGroup("all")}
                className="text-amber-400 hover:underline text-[11px]"
              >
                Ver todos os canais
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {filteredChannels.map((ch) => (
              <div
                key={ch.platform}
                className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: ch.colorHex }}
                  />
                  <span className="text-[11px] font-semibold text-zinc-300 truncate" title={ch.label}>
                    {ch.label}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-[11px] font-mono mt-1 pt-1 border-t border-zinc-900">
                  <span className="text-zinc-100 font-bold">{ch.count}</span>
                  <span className="text-zinc-500 text-[10px]">{ch.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
