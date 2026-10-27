"use client";

/**
 * DispatchLogsViewer.tsx - Visualizador e Auditoria de Despacho Onicanal
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Consolidação Analítica de Auditoria:
 * - Top Banner com estatísticas de logs e botão de limpeza
 * - Gráfico Visual de Distribuição de Posts por Canal (Etapa 092)
 * - Tabela de Logs de Auditoria de Despacho com Data/Hora, Plataforma, Message ID e HTTP Status (Etapa 093)
 */

import React from "react";
import { usePosterStore } from "@/store/usePosterStore";
import { History, Trash2 } from "lucide-react";
import { ChannelDistributionChart } from "./ChannelDistributionChart";
import { AuditLogsTable } from "./AuditLogsTable";

export function DispatchLogsViewer() {
  const { logs, clearLogs } = usePosterStore();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 p-5 rounded-2xl border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <History className="w-4 h-4 text-amber-400" />
            <span>Auditoria de Transmissão Onicanal</span>
          </div>
          <h2 className="text-xl font-bold text-white">Logs em Tempo Real de Despacho & Webhooks</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Registro detalhado de eventos de APIs oficiais com Data/Hora, Plataforma, Message ID e Códigos HTTP de retorno.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {logs.length > 0 && (
            <button
              onClick={clearLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-medium transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Logs ({logs.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Gráfico Visual de Distribuição de Posts por Canal (Etapa 092) */}
      <ChannelDistributionChart />

      {/* Tabela de Logs de Auditoria de Despacho (Etapa 093) */}
      <AuditLogsTable logs={logs} />
    </div>
  );
}
